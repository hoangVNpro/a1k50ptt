import React, { useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onRate: (product: Product, stars: number) => void;
  onOrder: () => void;
  userRating: number;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onRate, onOrder, userRating }) => {
  const [hoverStar, setHoverStar] = useState(0);

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
            ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' 
            : 'text-red-900/50'
        }`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-[#2a0202] border border-yellow-500/30 rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(220,38,38,0.3)] max-h-[90vh] md:max-h-[95vh] animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-yellow-500 hover:text-red-900 transition-colors border border-white/10"
        >
          ✕
        </button>

        <div className="w-full md:w-3/5 h-[40vh] md:h-auto bg-black/50 relative flex items-center justify-center p-4">
           <img 
             src={product.imageUrl} 
             alt={product.name} 
             className="max-w-full max-h-full object-contain drop-shadow-2xl"
           />
           <div className="absolute bottom-4 left-4 bg-red-600 text-yellow-100 text-xs px-2 py-1 rounded shadow border border-yellow-400">
              sản phẩn chất lượng
           </div>
        </div>

        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col text-yellow-50 overflow-y-auto bg-gradient-to-b from-[#3f0606] to-[#2a0202]">
          <h2 className="text-3xl font-header font-bold mb-2 text-yellow-300 leading-tight">{product.name}</h2>
          <p className="text-2xl font-bold text-yellow-400 mb-4 text-glow">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>

          <div className="flex items-center gap-3 mb-6 bg-red-950/30 p-3 rounded-xl border border-yellow-500/10">
            <div className="flex gap-1">{renderStars()}</div>
            <div className="h-8 w-[1px] bg-yellow-500/20 mx-2"></div>
            <div className="text-sm">
              <span className="block font-bold text-yellow-100 text-lg leading-none">{averageRating}/5</span>
              <span className="text-xs text-yellow-500/70">({product.ratingCount || 0} đánh giá)</span>
            </div>
          </div>
          
          {userRating > 0 && <p className="text-xs text-green-400 mb-4 text-center">✓ Cảm ơn bạn đã đánh giá!</p>}

          <div className="flex-1 overflow-y-auto pr-2 mb-6 min-h-[100px] scrollbar-thin scrollbar-thumb-yellow-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-600 mb-2 border-b border-yellow-900/50 pb-1">Chi tiết sản phẩm</h3>
            <p className="text-yellow-100/80 leading-relaxed text-sm whitespace-pre-wrap font-light">
              {product.description || "Sản phẩm này chưa có mô tả."}
            </p>
          </div>

          <div className="mt-auto pt-4 md:pt-0 pb-safe">
            <button 
              onClick={onOrder}
              className="w-full font-bold py-4 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 group bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-red-950 active:scale-95 border-2 border-yellow-400/50"
            >
              <span className="group-hover:animate-bounce text-xl">🧧</span>
              ĐẶT HÀNG NGAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;