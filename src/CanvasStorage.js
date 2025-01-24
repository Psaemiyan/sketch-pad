export function clearCanvasStorage(zoom) {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');

  // Clear the canvas
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.scale(zoom, zoom);

  // Clear stored paths in localStorage
  localStorage.removeItem('canvasPaths');
}

export function resizeCanvasWithStorage(canvas, zoom) {
  const context = canvas.getContext('2d');
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
}
