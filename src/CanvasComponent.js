import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaPen, FaEraser } from 'react-icons/fa';
import './CanvasComponent.css';

function CanvasComponent() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);

  // Zoom handler
  const handleZoom = useCallback((direction) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const zoomFactor = direction === 'in' ? 1.1 : 0.9;
    const newZoom = direction === 'in' 
      ? Math.min(zoom * zoomFactor, 3) 
      : Math.max(zoom * zoomFactor, 0.5);

    setZoom(newZoom);
    
    // Redraw canvas with new zoom
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(newZoom, newZoom);
    
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

    // Wheel zoom
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.5), 3);

      if (newZoom !== zoom) {
        handleZoom(newZoom > zoom ? 'in' : 'out');
      }
    };

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [isDrawing, isEraser, penColor, zoom, handleZoom]);

  return (
    <div className="canvas-container" style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <div className="controls">
        <button
          onClick={() => setIsEraser(false)}
          className={`control-button pen-button ${!isEraser ? 'active' : ''}`}
          title="Pen"
        >
          <FaPen />
        </button>
        <button
          onClick={() => setIsEraser(true)}
          className={`control-button eraser-button ${isEraser ? 'active' : ''}`}
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
          className="control-button zoom-in"
        >
          +
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="control-button zoom-out"
        >
          -
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="canvas"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%' 
        }}
      />
    </div>
  );
}

export default CanvasComponent;
