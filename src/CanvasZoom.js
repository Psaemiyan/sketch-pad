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
    window.addEventListener('wheel', disableZoom, { passive: false });

    // Disable zoom on keyboard (Ctrl +/-, Cmd +/-, etc.)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    });

    // Disable zoom on touch gestures (on mobile)
    window.addEventListener('gesturestart', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('wheel', disableZoom);
      window.removeEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      });
      window.removeEventListener('gesturestart', (e) => e.preventDefault());
    };
  }, []);

  const handleZoom = useCallback((direction) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const zoomFactor = direction === 'in' ? 1.02 : 0.98;  // Slow down zooming
    const newZoom = direction === 'in' 
      ? Math.min(zoom * zoomFactor, 3) 
      : Math.max(zoom * zoomFactor, 0.3);

    setZoom(prevZoom => {
      const steps = 20; // Increase steps for slower zoom
      const zoomStep = (newZoom - prevZoom) / steps;

      const animateZoom = (currentStep = 0) => {
        if (currentStep < steps) {
          const intermediateZoom = prevZoom + zoomStep * (currentStep + 1);

          // Clear the canvas and reset the transform
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.clearRect(0, 0, canvas.width, canvas.height);

          // Calculate the offsets for centering the zoom
          const offsetX = (canvas.width / 2) * (1 - intermediateZoom);
          const offsetY = (canvas.height / 2) * (1 - intermediateZoom);

          // Translate and scale the canvas from the center
          context.translate(offsetX, offsetY);
          context.scale(intermediateZoom, intermediateZoom);

          // Redraw stored paths
          const storedPaths = JSON.parse(localStorage.getItem('canvasPaths') || '[]');
          drawStoredPaths(canvas, storedPaths, intermediateZoom);

          // Schedule next frame
          requestAnimationFrame(() => animateZoom(currentStep + 1));
        }
      };

      // Start zoom animation
      animateZoom();

      return newZoom;
    });
  }, [zoom, canvasRef]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();  // Prevent default browser zoom behavior

    const zoomFactor = e.deltaY > 0 ? 0.98 : 1.02;  // Slow down zooming based on wheel scroll
    handleZoom(zoomFactor > 1 ? 'in' : 'out');
  }, [handleZoom]);

  return { zoom, handleZoom, handleWheel };
}
