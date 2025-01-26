import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaPen, FaEraser, FaTrash, FaSearchPlus, FaSearchMinus, FaCircle, FaSquare } from 'react-icons/fa';
import './CanvasComponent.css';
import { useCanvasDrawing, drawStoredPaths } from './CanvasDrawing';

function CanvasComponent() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);
  const [selectedShape, setSelectedShape] = useState(null);

  // Use the custom drawing hook
  useCanvasDrawing(canvasRef, isDrawing, setIsDrawing, isEraser, penColor, zoom, selectedShape);

  // Smoother zoom handler
  const handleZoom = useCallback((direction) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const zoomFactor = direction === 'in' ? 1.05 : 0.95;
    const newZoom = direction === 'in' 
      ? Math.min(zoom * zoomFactor, 3) 
      : Math.max(zoom * zoomFactor, 0.3);

    setZoom(prevZoom => {
      // Smooth transition
      const steps = 10;
      const zoomStep = (newZoom - prevZoom) / steps;

      const animateZoom = (currentStep = 0) => {
        if (currentStep < steps) {
          const intermediateZoom = prevZoom + zoomStep * (currentStep + 1);
          
          // Redraw canvas with intermediate zoom
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.scale(intermediateZoom, intermediateZoom);
          
          // Redraw stored paths
          const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
          drawStoredPaths(canvas, storedPaths, intermediateZoom);

          // Schedule next animation frame
          requestAnimationFrame(() => animateZoom(currentStep + 1));
        }
      };

      // Start zoom animation
      animateZoom();

      return newZoom;
    });
  }, [zoom]);

  // Add clearCanvas method
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Clear the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(zoom, zoom);

    // Clear stored paths in localStorage
    localStorage.removeItem('canvasPaths');
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set initial canvas properties
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Resize and setup canvas
    const resizeCanvas = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext('2d');
      tempContext.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(zoom, zoom);

      // Redraw stored paths
      const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
      drawStoredPaths(canvas, storedPaths, zoom);
    };

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [zoom]);

  // Reset drawing mode
  const resetDrawingMode = () => {
    setIsEraser(false);
    setSelectedShape(null);
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="drawing-canvas" />
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
              setSelectedShape('square');
              setIsEraser(false);
            }} 
            className={`tool-button ${selectedShape === 'square' ? 'active' : ''}`}
            title="Square"
          >
            <FaSquare />
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
