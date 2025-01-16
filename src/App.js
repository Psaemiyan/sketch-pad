import React from 'react';
import CanvasComponent from './CanvasComponent';
import './App.css';

function App() {
  return (
    <div className="App" style={{ overflow: 'hidden', height: '100vh', width: '100vw', position: 'relative' }}>
      <p style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        margin: 0,
        padding: '5px 10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: '14px',
        borderRadius: '3px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        Work in progress, draw something
      </p>
      <CanvasComponent />
    </div>
  );
}

export default App;
