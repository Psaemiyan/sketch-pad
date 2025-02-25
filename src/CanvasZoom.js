import { useState, useCallback, useEffect } from 'react';
import { drawStoredPaths } from './CanvasDrawing';

export function useCanvasZoom(canvasRef, initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);

  // Disable browser zoom completely
  useEffect(() => {
    const disableZoom = (e) => {
      if (e.ctrlKey || e.metaKey || e.deltaY) {
        // Prevent zoom when ctrlKey/metaKey or pinch gestures are detected
        e.preventDefault();
      }
    };

    // Disable zoom on mouse wheel (pinch-to-zoom on trackpads)
    const wheelListener = (e) => {
      e.preventDefault();  // Prevent default browser zoom behavior

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.5), 3);

      if (newZoom !== zoom) {
        handleZoom(newZoom > zoom ? 'in' : 'out');
      }
    };

    // Disable zoom on mouse wheel (pinch-to-zoom on trackpads)
    window.addEventListener('wheel', wheelListener, { passive: false });

    // Disable zoom on keyboard (Ctrl +/-, Cmd +/-, etc.)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    });

    // Disable zoom on touch gestures (on mobile)
    window.addEventListener('gesturestart', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('wheel', wheelListener);
      window.removeEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      });
      window.removeEventListener('gesturestart', (e) => e.preventDefault());
    };
  }, [zoom]);

  const handleZoom = useCallback((direction) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Get the canvas bounding rect to calculate mouse position relative to canvas
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = canvasRect.width / 2; // Center point of the canvas
    const offsetY = canvasRect.height / 2; // Center point of the canvas

    // Adjust the zoom factor
    const zoomFactor = direction === 'in' ? 1.05 : 0.95;
    const newZoom = direction === 'in'
      ? Math.min(zoom * zoomFactor, 3)
      : Math.max(zoom * zoomFactor, 0.5);

    // Set new zoom state
    setZoom(newZoom);

    // Redraw canvas with new zoom
    const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
    drawStoredPaths(canvas, storedPaths, newZoom);

    // Apply zoom to the canvas context
    context.setTransform(1, 0, 0, 1, 0, 0);  // Reset the current transformation
    context.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    context.translate(offsetX, offsetY);  // Translate to center point
    context.scale(newZoom, newZoom);  // Apply zoom based on the mouse pointer position
  }, [zoom, canvasRef]);

  return { zoom, handleZoom };
}
