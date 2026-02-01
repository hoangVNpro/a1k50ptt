import React, { useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onRate: (product: Product, stars: number) => void;
  onOrder: () => void;
  userRating: number; // 0 if not rated
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onRate, onOrder, userRating }) => {
  const [zoom, setZoom] = useState(1);
  const [hoverStar, setHoverStar] = useState(0);

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  };

  const averageRating = product.ratingCount > 0 
    ? (product.ratingTotal / product.ratingCount).toFixed(1) 
    : '0.0';

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={userRating > 0}
        onMouseEnter={() => !userRating && setHoverStar(star)}
        onMouseLeave={() => !userRating && setHoverStar(0)}
        onClick={() => !userRating && onRate(product, star)}
        className={`text-2xl transition-transform ${userRating === 0 ? 'hover:scale-125 cursor-pointer' : 'cursor-default'} ${
          star <= (hoverStar || userRating || Math.round(Number(averageRating)))
            ? 'text-yellow-400' 
            : 'text-gray-600'
        }`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-gray-900/95 border-t md:border border-white/20 rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-[slideUp_0.3s_ease-out] md:animate-[fadeIn_0.3s_ease-out] max-h-[90vh] md:max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
        >
          ✕
        </button>

        {/* Image Section */}
        <div className="w-full md:w-3/5 h-[40vh] md:h-auto bg-black relative overflow-hidden group shrink-0">
           <div 
             className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
             style={{ transform: `scale(${zoom})` }}
           >
             <img 
               src={product.imageUrl} 
               alt={product.name} 
               className="max-w-full max-h-full object-contain pointer-events-none"
             />
           </div>
           
           {/* Zoom Control - Hidden on mobile to save space */}
           <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur rounded-full px-4 py-2 items-center gap-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs">-</span>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1" 
                value={zoom} 
                onChange={handleZoom}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-xs">+</span>
           </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col text-white overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-glow leading-tight">{product.name}</h2>
          <p className="text-xl md:text-2xl font-bold text-green-400 mb-4">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>

          {/* Rating Section */}
          <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/5 shrink-0">
            <div className="flex gap-1">
              {renderStars()}
            </div>
            <div className="h-8 w-[1px] bg-white/20 mx-2"></div>
            <div className="text-sm">
              <span className="block font-bold text-white text-lg leading-none">{averageRating}/5</span>
              <span className="text-xs text-gray-400">({product.ratingCount || 0} đánh giá)</span>
            </div>
          </div>
          {userRating > 0 && (
            <p className="text-xs text-green-400 mb-4 text-center">✓ Bạn đã đánh giá sản phẩm này</p>
          )}

          <div className="flex-1 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-[100px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Thông tin sản phẩm</h3>
            <p className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>
          </div>

          <div className="mt-auto pt-4 md:pt-0 pb-safe">
            <button 
              onClick={onOrder}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span className="group-hover:animate-bounce">🛒</span>
              ĐẶT HÀNG NGAY
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
};

export default ProductModal;