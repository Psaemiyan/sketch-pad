import React, { useRef, useEffect, useState } from 'react';
import { FaPen, FaEraser } from 'react-icons/fa';
import './CanvasComponent.css';

function CanvasComponent() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Resize canvas to match window without clearing content
    const resizeCanvas = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      context.lineWidth = 2;
      context.lineCap = 'round';

      // Restore the previous drawing
      context.drawImage(tempCanvas, 0, 0);
    };

    // Initial resize
    resizeCanvas();

    // Resize listener
    window.addEventListener('resize', resizeCanvas);

    let lastX, lastY;

    const startDrawing = (e) => {
      setIsDrawing(true);
      lastX = e.offsetX;
      lastY = e.offsetY;
    };

    const draw = (e) => {
      if (!isDrawing) return;

      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(e.offsetX, e.offsetY);

      if (isEraser) {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = 20;
      } else {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = penColor;
        context.lineWidth = 2;
      }

      context.stroke();
      lastX = e.offsetX;
      lastY = e.offsetY;
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    // Add drawing event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [isDrawing, isEraser, penColor]);

  return (
    <div className="canvas-container">
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
      </div>
      <canvas
        ref={canvasRef}
        className="canvas"
      />
    </div>
  );
}

export default CanvasComponent;
