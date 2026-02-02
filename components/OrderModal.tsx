import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({ product, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', quantity: 1 });
  const [totalPrice, setTotalPrice] = useState(product.price);

  useEffect(() => {
    setTotalPrice(product.price * formData.quantity);
  }, [formData.quantity, product.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, totalPrice });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[#2a0202] border border-yellow-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-2xl font-bold text-yellow-300 font-header">Xác nhận đơn hàng</h3>
           <button onClick={onClose} className="text-yellow-500 hover:text-white w-8 h-8 flex items-center justify-center bg-red-900/50 rounded-full"><i className="fas fa-times"></i></button>
        </div>
        
        <div className="flex items-start gap-4 mb-6 p-4 bg-red-900/30 rounded-xl border border-yellow-500/20">
          <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-yellow-500/30" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-yellow-100 text-lg mb-1 truncate">{product.name}</p>
            <p className="text-yellow-500/80 text-sm">Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="Họ và tên" className="w-full bg-red-950/50 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-100 focus:outline-none focus:border-yellow-400 transition-colors placeholder-yellow-100/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="tel" placeholder="SĐT liên hệ" className="w-full bg-red-950/50 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-100 focus:outline-none focus:border-yellow-400 transition-colors placeholder-yellow-100/20" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <textarea required rows={2} placeholder="Địa chỉ giao hàng (Số nhà, đường...)" className="w-full bg-red-950/50 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-100 focus:outline-none focus:border-yellow-400 transition-colors resize-none placeholder-yellow-100/20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

          <div className="p-4 bg-red-900/40 border border-yellow-500/30 rounded-xl">
            <div className="flex justify-between items-center mb-4">
               <label className="font-bold text-yellow-200">Số lượng:</label>
               <div className="flex items-center gap-3 bg-red-950 rounded-lg p-1 border border-yellow-500/10">
                  <button type="button" onClick={() => setFormData(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))} className="w-8 h-8 rounded bg-red-800 hover:bg-red-700 flex items-center justify-center text-yellow-100">-</button>
                  <span className="w-8 text-center font-bold text-xl text-yellow-100">{formData.quantity}</span>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, quantity: prev.quantity + 1}))} className="w-8 h-8 rounded bg-red-800 hover:bg-red-700 flex items-center justify-center text-yellow-100">+</button>
               </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-yellow-500/20">
               <span className="text-yellow-200">Tổng thanh toán:</span>
               <span className="text-2xl font-bold text-yellow-400 text-glow">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-bold text-lg text-red-900 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 shadow-lg transform transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;