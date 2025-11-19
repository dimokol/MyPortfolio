import { useEffect, useRef, useState } from 'react';
import Experience from './Experience/Experience.js';
import Preloader from './Components/Preloader.jsx';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const experienceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the experience
    if (canvasRef.current && !experienceRef.current) {
      // Short delay to show the preloader animation
      setTimeout(() => {
        experienceRef.current = new Experience(canvasRef.current);

        // Hide preloader after initialization
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }, 500);
    }

    // Cleanup on unmount
    return () => {
      if (experienceRef.current) {
        experienceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <Preloader isLoading={isLoading} />

      <canvas ref={canvasRef} className="webgl" />

      {/* UI Overlay */}
      <div className="ui-overlay" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s' }}>
        <div className="title">
          <h1>dimokol</h1>
          <p className="subtitle">Interactive 3D Portfolio</p>
        </div>

        <div className="controls-info">
          <h3>Controls</h3>
          <ul>
            <li><strong>W/↑</strong> - Accelerate</li>
            <li><strong>S/↓</strong> - Reverse</li>
            <li><strong>A/←</strong> - Steer Left</li>
            <li><strong>D/→</strong> - Steer Right</li>
            <li><strong>Space</strong> - Brake</li>
            <li><strong>Mouse Wheel</strong> - Zoom Camera</li>
          </ul>
        </div>

        <div className="objective">
          <p>Drive around and explore the interactive portfolio items!</p>
          <p className="hint">Click on glowing objects to view projects</p>
        </div>
      </div>
    </div>
  );
}

export default App;
