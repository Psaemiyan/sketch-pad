import { useState, useCallback } from 'react';
import { drawStoredPaths } from './CanvasDrawing';

export function useCanvasZoom(canvasRef, initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);

  const handleZoom = useCallback((direction) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const zoomFactor = direction === 'in' ? 1.1 : 0.9;
    const newZoom = direction === 'in' 
      ? Math.min(zoom * zoomFactor, 3) 
      : Math.max(zoom * zoomFactor, 0.5);

    setZoom(newZoom);
    
    // Redraw canvas with new zoom
    const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
    drawStoredPaths(canvas, storedPaths, newZoom);
  }, [zoom, canvasRef]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.5), 3);

    if (newZoom !== zoom) {
      handleZoom(newZoom > zoom ? 'in' : 'out');
    }
  }, [zoom, handleZoom]);

  return { zoom, handleZoom, handleWheel };
}
