import React, { useEffect } from 'react';

const Background: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('tet-effects-container');
    if (!container) return;
    
    container.innerHTML = '';

    const items = ['🌸', '🧧', '✨', '💰'];
    const count = 30; // Số lượng vật thể rơi

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.innerText = items[Math.floor(Math.random() * items.length)];
      el.className = 'absolute select-none pointer-events-none opacity-80';
      
      // Random position and animation properties
      const left = Math.random() * 100;
      const size = Math.random() * 20 + 15; // 15px to 35px
      const duration = Math.random() * 5 + 5; // 5s to 10s
      const delay = Math.random() * 5;
      
      el.style.left = `${left}%`;
      el.style.fontSize = `${size}px`;
      el.style.top = '-50px';
      el.style.animation = `falling ${duration}s linear ${delay}s infinite`;
      el.style.textShadow = '0 0 5px rgba(255,215,0,0.5)';
      
      container.appendChild(el);
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
      {/* Dynamic Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://res.cloudinary.com/dbyap7mw2/video/upload/v1770035635/Hieu_Ung_Tet_4K_Option_4_-_Background_T%E1%BA%BFt_4K_2026_Ch%C3%BAc_M%E1%BB%ABng_N%C4%83m_M%E1%BB%9Bi_-_Hi%E1%BB%87u_%E1%BB%A8ng_N%E1%BB%81n_R%E1%BB%93ng_V%C3%A0ng_crndtl.webm" type="video/webm" />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Lanterns Decoration (Top Corners) */}
      <div className="absolute top-0 left-4 md:left-20 w-16 md:w-24 h-24 md:h-32 bg-[url('https://cdn-icons-png.flaticon.com/512/1798/1798333.png')] bg-contain bg-no-repeat bg-top opacity-90 animate-[swing_3s_ease-in-out_infinite] origin-top z-10"></div>
      <div className="absolute top-0 right-4 md:right-20 w-16 md:w-24 h-24 md:h-32 bg-[url('https://cdn-icons-png.flaticon.com/512/1798/1798333.png')] bg-contain bg-no-repeat bg-top opacity-90 animate-[swing_4s_ease-in-out_infinite] origin-top z-10"></div>

      {/* Decorative Branch (Bottom Left) */}
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-40 pointer-events-none bg-[url('https://www.pngmart.com/files/16/Cherry-Blossom-Branch-Transparent-PNG.png')] bg-contain bg-no-repeat bg-bottom transform -scale-x-100 z-10"></div>

      {/* Falling Effects Layer */}
      <div id="tet-effects-container" className="absolute inset-0 w-full h-full pointer-events-none z-10"></div>

      <style>{`
        @keyframes falling {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default Background;