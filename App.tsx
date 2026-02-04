import React, { useState, useEffect } from 'react';
import { ref, push, onValue, update, set } from 'firebase/database';
import { database } from './firebase';
import Background from './components/Background';
import ProductModal from './components/ProductModal';
import OrderModal from './components/OrderModal';
import { Product } from './types';

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UUID for rating
  const [userUUID] = useState(() => {
    let uuid = localStorage.getItem('user_uuid');
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem('user_uuid', uuid);
    }
    return uuid;
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // Fetch Products Data Only
  useEffect(() => {
    const productsRef = ref(database, 'products');

    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList: Product[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          productList.push({ 
            id: key, 
            ratingTotal: 0,
            ratingCount: 0,
            ratedBy: {},
            ...data[key] 
          });
        });
      }
      setProducts(productList.reverse());
      setLoading(false);
    });
  }, []);

  const handleRateProduct = async (product: Product, stars: number) => {
    if (product.ratedBy && product.ratedBy[userUUID]) return;
    const currentTotal = product.ratingTotal || 0;
    const currentCount = product.ratingCount || 0;
    const updates: any = {};
    updates[`products/${product.id}/ratingTotal`] = currentTotal + stars;
    updates[`products/${product.id}/ratingCount`] = currentCount + 1;
    updates[`products/${product.id}/ratedBy/${userUUID}`] = stars;
    
    await update(ref(database), updates);
    
    if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({
            ...selectedProduct, 
            ratingTotal: currentTotal + stars,
            ratingCount: currentCount + 1,
            ratedBy: { ...selectedProduct.ratedBy, [userUUID]: stars }
        });
    }
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!selectedProduct) return;
    setIsOrdering(true);
    try {
      await set(push(ref(database, 'orders')), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.imageUrl,
        unitPrice: selectedProduct.price,
        quantity: orderData.quantity,
        totalPrice: orderData.totalPrice,
        customerName: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        status: 'pending',
        timestamp: Date.now()
      });
      setIsOrderModalOpen(false);
      setSelectedProduct(null);
      alert('Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn.');
    } catch (error) {
      console.error(error);
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-yellow-500 selection:text-red-900 text-yellow-50">
      <Background />
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6">
          <div className="flex items-center gap-5 group mx-auto md:mx-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] floating bg-red-800">
                <img src="https://res.cloudinary.com/dbyap7mw2/image/upload/v1769950832/457203768_122098176248501397_7041672154476517727_n_1_ib8kcf.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-header font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 text-glow drop-shadow-md">A1K50</h1>
              <p className="text-lg font-tet text-yellow-400 tracking-wider">🌸 Chúc Mừng Năm Mới 2026 🌸</p>
            </div>
          </div>
          {/* Admin Button Removed */}
        </header>

        {/* Store View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-[fadeIn_0.5s_ease-out]">
          {loading ? (
            <div className="col-span-full text-center py-20"><div className="floating text-6xl mb-4">🧧</div><p className="text-yellow-200">Đang tải dữ liệu Tết...</p></div>
          ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-yellow-500/50 italic">Cửa hàng đang cập nhật sản phẩm.</div>
          ) : (
            products.map((product) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="glass-panel rounded-2xl overflow-hidden group cursor-pointer hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] border border-yellow-500/20 hover:border-yellow-400">
                <div className="aspect-square relative overflow-hidden bg-red-950/30">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                  <div className="absolute top-2 right-2 bg-red-900/80 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold border border-yellow-500/30">
                        <span className="text-yellow-400">★</span> <span className="text-yellow-100">{product.ratingCount > 0 ? (product.ratingTotal / product.ratingCount).toFixed(1) : '5.0'}</span>
                  </div>
                </div>
                <div className="p-4 relative">
                  <div className="absolute -top-6 right-4 text-2xl animate-bounce drop-shadow-lg">🧧</div>
                  <h3 className="font-bold text-lg mb-1 truncate text-yellow-50 font-header">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-yellow-400 text-glow">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                    <button className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-red-900 transition-colors border border-yellow-500/30"><i className="fas fa-cart-plus text-xs"></i></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onRate={handleRateProduct} userRating={selectedProduct.ratedBy ? selectedProduct.ratedBy[userUUID] : 0} onOrder={() => setIsOrderModalOpen(true)} />}
      {isOrderModalOpen && selectedProduct && <OrderModal product={selectedProduct} onClose={() => setIsOrderModalOpen(false)} onSubmit={handlePlaceOrder} isSubmitting={isOrdering} />}
    </div>
  );
};

export default App;