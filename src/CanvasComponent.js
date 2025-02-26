import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaPen, FaEraser, FaTrash, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import './CanvasComponent.css';
import { useCanvasDrawing, drawStoredPaths } from './CanvasDrawing';
import { useCanvasZoom } from './CanvasZoom'; // Import the zoom hook

function CanvasComponent() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [selectedShape, setSelectedShape] = useState(null);

  // Use zoom hook with min/max zoom
  const { zoom, handleZoom, handleWheel } = useCanvasZoom(canvasRef, 1, 0.5, 3);

  // Apply drawing behavior
  useCanvasDrawing(canvasRef, isDrawing, setIsDrawing, isEraser, penColor, zoom, selectedShape);

  // Clear canvas while maintaining zoom
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Clear stored paths in localStorage
    localStorage.removeItem('canvasPaths');

    // Redraw stored paths at current zoom level
    drawStoredPaths(canvas, [], zoom);
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Set initial canvas properties
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Resize the canvas properly
    const resizeCanvas = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext('2d');
      tempContext.drawImage(canvas, 0, 0);

      // Resize
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reset and apply zoom
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Redraw stored paths
      const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
      drawStoredPaths(canvas, storedPaths, zoom);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [zoom]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
      />
      <div className="horizontal-toolbar">
        <div className="toolbar-section">
          <button 
            onClick={() => {
              setSelectedShape(null);
              setIsEraser(false);
            }} 
            className={`tool-button ${selectedShape === null && !isEraser ? 'active' : ''}`}
            title="Pen"
          >
            <FaPen />
          </button>
          <button 
            onClick={() => {
              setIsEraser(!isEraser);
              setSelectedShape(null);
            }} 
            className={`tool-button ${isEraser ? 'active' : ''}`}
            title="Eraser"
          >
            <FaEraser />
          </button>
          <input 
            type="color" 
            value={penColor} 
            onChange={(e) => setPenColor(e.target.value)}
            disabled={isEraser}
            className="color-picker"
          />
          <button 
            onClick={() => handleZoom('in')}
            className="zoom-button"
            title="Zoom In"
          >
            <FaSearchPlus />
          </button>
          <button 
            onClick={() => handleZoom('out')}
            className="zoom-button"
            title="Zoom Out"
          >
            <FaSearchMinus />
          </button>
          <button 
            onClick={clearCanvas}
            className="clear-button"
            title="Clear Canvas"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanvasComponent;
