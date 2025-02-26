import { useState, useCallback, useEffect } from 'react';
import { drawStoredPaths } from './CanvasDrawing';

export function useCanvasZoom(canvasRef, initialZoom = 1, minZoom = 0.5, maxZoom = 3) {
  const [zoom, setZoom] = useState(initialZoom);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const disableZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('gesturestart', (e) => e.preventDefault());
    window.addEventListener('keydown', disableZoom);

    return () => {
      window.removeEventListener('gesturestart', (e) => e.preventDefault());
      window.removeEventListener('keydown', disableZoom);
    };
  }, []);








  const handleWheel = useCallback(
    (e) => {
      if (!canvasRef.current) return;
      e.preventDefault(); 
  
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      const zoomFactor = e.deltaY > 0 ? 0.99 : 1.01; 
      const newZoom = Math.min(Math.max(zoom * zoomFactor, minZoom), maxZoom);
  
      // Calculate the change in zoom
      const scaleChange = newZoom / zoom;
  
      // Adjust the offset to zoom towards the mouse position
      const newOffsetX = mouseX - (mouseX - offsetX) * scaleChange;
      const newOffsetY = mouseY - (mouseY - offsetY) * scaleChange;
      
  
      // Calculate canvas bounds to prevent overflow
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
  
      // Calculate maximum offset to prevent canvas overflow
      const maxOffsetX = Math.max(canvasWidth - canvasWidth / newZoom, 0);
      const maxOffsetY = Math.max(canvasHeight - canvasHeight / newZoom, 0);
      
  
      // Clamping offsets within bounds
      const clampedOffsetX = Math.min(Math.max(newOffsetX, -maxOffsetX), maxOffsetX);
      const clampedOffsetY = Math.min(Math.max(newOffsetY, -maxOffsetY), maxOffsetY);
  
      console.log("Calculated Offsets: newOffsetX =", newOffsetX, "newOffsetY =", newOffsetY);
      console.log("Clamped Offsets: clampedOffsetX =", clampedOffsetX, "clampedOffsetY =", clampedOffsetY);
  
      // Update the state for zoom and offsets
      setOffsetX(clampedOffsetX);
      setOffsetY(clampedOffsetY);
      setZoom(newZoom);
    },
    [zoom, offsetX, offsetY, canvasRef, minZoom, maxZoom]
  );
  







  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
  
    console.log("Applying Transformations: Zoom =", zoom, "OffsetX =", offsetX, "OffsetY =", offsetY);
  
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(zoom, zoom);
    context.translate(offsetX / zoom, offsetY / zoom);
  
    // Redraw paths
    const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
    drawStoredPaths(canvas, storedPaths, zoom);
  }, [zoom, offsetX, offsetY]);
  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e) => handleWheel(e);

    // Add event listener with { passive: false } to fix preventDefault issue
    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheelEvent);
    };
  }, [handleWheel]);

  return { zoom, handleWheel };
}
