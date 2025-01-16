import React, { useRef, useEffect, useState } from 'react';
import './CanvasComponent.css';

function CanvasComponent() {
  const canvasRef = useRef(null);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Resize canvas to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.lineWidth = 2;
      context.lineCap = 'round';
    };

    // Initial resize
    resizeCanvas();

    // Resize listener
    window.addEventListener('resize', resizeCanvas);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const draw = (e) => {
      if (!isDrawing) return;
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(e.offsetX, e.offsetY);
      
      if (isEraser) {
        context.strokeStyle = 'white';
        context.lineWidth = 20;
      } else {
        context.strokeStyle = 'black';
        context.lineWidth = 2;
      }
      
      context.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    // Add drawing event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [isEraser]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 2,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setIsEraser(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: isEraser ? '#ddd' : '#007bff',
            color: isEraser ? 'black' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Pen
        </button>
        <button
          onClick={() => setIsEraser(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: isEraser ? '#007bff' : '#ddd',
            color: isEraser ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Eraser
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          cursor: 'crosshair',
          outline: 'none'
        }}
      />
    </div>
  );
}

export default CanvasComponent;
