import { useState } from 'react';
import './Preloader.css';

export default function Preloader({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="preloader">
      <div className="preloader-content">
        <div className="car-container">
          <div className="car">
            <div className="car-body"></div>
            <div className="wheel wheel-front"></div>
            <div className="wheel wheel-back"></div>
          </div>
          <div className="road"></div>
        </div>
        <h2 className="loading-text">Loading 3D World...</h2>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <p className="loading-tip">Get ready to drive!</p>
      </div>
    </div>
  );
}
