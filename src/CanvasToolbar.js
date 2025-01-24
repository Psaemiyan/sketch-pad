import React, { useState } from 'react';
import { FaPen, FaEraser, FaTrash } from 'react-icons/fa';
import { clearCanvasStorage } from './CanvasStorage';

export function CanvasToolbar({ 
  isEraser, 
  setIsEraser, 
  penColor, 
  setPenColor, 
  zoom, 
  handleZoom 
}) {
  const toggleEraser = () => setIsEraser(!isEraser);
  
  const clearCanvas = () => {
    clearCanvasStorage(zoom);
  };

  return (
    <div className="canvas-toolbar">
      <div className="toolbar-section">
        <button 
          onClick={() => handleZoom('in')} 
          className="zoom-button"
        >
          +
        </button>
        <button 
          onClick={() => handleZoom('out')} 
          className="zoom-button"
        >
          -
        </button>
      </div>

      <div className="toolbar-section">
        <button 
          onClick={toggleEraser} 
          className={`tool-button ${isEraser ? 'active' : ''}`}
        >
          {isEraser ? <FaEraser /> : <FaPen />}
        </button>
        
        <input 
          type="color" 
          value={penColor} 
          onChange={(e) => setPenColor(e.target.value)}
          disabled={isEraser}
        />
      </div>

      <div className="toolbar-section">
        <button 
          onClick={clearCanvas} 
          className="clear-button"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
