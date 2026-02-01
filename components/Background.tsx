import React, { useEffect, useState } from 'react';

const Background: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Star generation logic
    const createStars = () => {
      const container = document.getElementById('stars-container');
      if (!container) return;
      
      // Clear existing stars
      container.innerHTML = '';

      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'absolute bg-white rounded-full opacity-0 animate-pulse';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(star);
      }
    };

    createStars();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <source src="https://res.cloudinary.com/dbyap7mw2/video/upload/v1765208146/background_efe441534ad5-_1__xr2aom.webm" type="video/mp4" />
      </video>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

      {/* Stars Layer */}
      <div id="stars-container" className="absolute inset-0 w-full h-full pointer-events-none"></div>
    </div>
  );
};

export default Background;