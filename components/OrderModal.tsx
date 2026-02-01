import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; address: string; quantity: number; totalPrice: number }) => void;
  isSubmitting: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({ product, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1
  });

  const [totalPrice, setTotalPrice] = useState(product.price);

  useEffect(() => {
    setTotalPrice(product.price * formData.quantity);
  }, [formData.quantity, product.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      quantity: formData.quantity,
      totalPrice: totalPrice
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-gray-900 border border-white/20 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-2xl font-bold text-white">Xác nhận đơn hàng</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center bg-white/5 rounded-full"><i className="fas fa-times"></i></button>
        </div>
        
        <div className="flex items-start gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg mb-1 truncate">{product.name}</p>
            <p className="text-gray-400 text-sm">Đơn giá: {formatCurrency(product.price)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tên người nhận</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
                <input 
                  required
                  type="tel" 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="09..."
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Địa chỉ giao hàng</label>
            <textarea 
              required
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
              placeholder="Số nhà, tên đường, phường/xã..."
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
            <div className="flex justify-between items-center mb-4">
               <label className="font-bold text-white">Số lượng:</label>
               <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))}
                    className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-xl">{formData.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, quantity: prev.quantity + 1}))}
                    className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  >
                    +
                  </button>
               </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
               <span className="text-gray-300">Tổng thanh toán:</span>
               <span className="text-2xl font-bold text-green-400 text-glow">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg transform transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
            {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;