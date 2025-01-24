import React, { useRef, useEffect } from 'react';

export function useCanvasDrawing(canvasRef, isDrawing, setIsDrawing, isEraser, penColor, zoom) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.lineCap = 'round';
    context.lineJoin = 'round';

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
    };
  }, [canvasRef, isDrawing, setIsDrawing, isEraser, penColor, zoom]);
}

export function drawStoredPaths(canvas, storedPaths, zoom) {
  const context = canvas.getContext('2d');
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.scale(zoom, zoom);

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
}
