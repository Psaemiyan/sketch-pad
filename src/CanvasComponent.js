import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaPen, FaEraser, FaTrash, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import './CanvasComponent.css';

function CanvasComponent() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);

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
          storedPaths.forEach(path => {
            context.beginPath();
            context.moveTo(path.start.x, path.start.y);
            context.lineTo(path.end.x, path.end.y);
            
            context.strokeStyle = path.isEraser ? 'white' : path.color;
            context.lineWidth = path.isEraser ? 20 : 2;
            
            if (path.isEraser) {
              context.globalCompositeOperation = 'destination-out';
            } else {
              context.globalCompositeOperation = 'source-over';
            }
            
            context.stroke();
          });

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
      storedPaths.forEach(path => {
        context.beginPath();
        context.moveTo(path.start.x, path.start.y);
        context.lineTo(path.end.x, path.end.y);
        
        context.strokeStyle = path.isEraser ? 'white' : path.color;
        context.lineWidth = path.isEraser ? 20 : 2;
        
        if (path.isEraser) {
          context.globalCompositeOperation = 'destination-out';
        } else {
          context.globalCompositeOperation = 'source-over';
        }
        
        context.stroke();
      });
    };

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastX, lastY;

    const getCanvasCoordinates = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      return {
        x: (clientX - rect.left) * scaleX / zoom,
        y: (clientY - rect.top) * scaleY / zoom
      };
    };

    const startDrawing = (e) => {
      const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
      lastX = x;
      lastY = y;
      setIsDrawing(true);
      
      // Immediate first point drawing
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(lastX, lastY);
      
      context.strokeStyle = isEraser ? 'white' : penColor;
      context.lineWidth = isEraser ? 20 : 2;
      
      if (isEraser) {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
      }
      
      context.stroke();

      // Save first point
      const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
      storedPaths.push({
        start: { x: lastX, y: lastY },
        end: { x: lastX, y: lastY },
        color: penColor,
        isEraser: isEraser
      });
      localStorage.setItem('canvasPaths', JSON.stringify(storedPaths));
    };

    const draw = (e) => {
      if (!isDrawing) return;

      const { x: currentX, y: currentY } = getCanvasCoordinates(e.clientX, e.clientY);

      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(currentX, currentY);
      
      context.strokeStyle = isEraser ? 'white' : penColor;
      context.lineWidth = isEraser ? 20 : 2;
      
      if (isEraser) {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
      }
      
      context.stroke();

      // Save path to localStorage
      const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
      storedPaths.push({
        start: { x: lastX, y: lastY },
        end: { x: currentX, y: currentY },
        color: penColor,
        isEraser: isEraser
      });
      localStorage.setItem('canvasPaths', JSON.stringify(storedPaths));

      lastX = currentX;
      lastY = currentY;
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDrawing, isEraser, penColor, zoom, handleZoom]);

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef}
        className="drawing-canvas"
      />
      <div className="toolbar">
        <button 
          onClick={() => setIsEraser(false)} 
          className={!isEraser ? 'active' : ''}
          title="Pen"
        >
          <FaPen />
        </button>
        <button 
          onClick={() => setIsEraser(true)} 
          className={isEraser ? 'active' : ''}
          title="Eraser"
        >
          <FaEraser />
        </button>
        <input
          type="color"
          value={penColor}
          onChange={(e) => setPenColor(e.target.value)}
          className="color-picker"
          title="Choose pen color"
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
          className="clear-canvas"
          title="Clear Canvas"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default CanvasComponent;
