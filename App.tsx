import React, { useState, useEffect } from 'react';
import { ref, push, onValue, update, set, remove } from 'firebase/database';
import { database } from './firebase';
import { uploadImageToCloudinary } from './services/cloudinaryService';
import Background from './components/Background';
import ProductModal from './components/ProductModal';
import OrderModal from './components/OrderModal';
import { Product, Order } from './types';

// Helper component for Order Rows
const OrderRow = ({ order, onComplete, onDelete }: { order: Order; onComplete: (id: string) => void; onDelete: (id: string) => void }) => (
  <tr className="border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors">
    <td className="p-4 text-sm text-yellow-100/70">{new Date(order.timestamp).toLocaleString('vi-VN')}</td>
    <td className="p-4 font-bold text-yellow-100">{order.customerName}<br/><span className="text-xs font-normal text-yellow-500/60">{order.phone}</span></td>
    <td className="p-4 text-yellow-100">{order.productName}</td>
    <td className="p-4 text-center text-yellow-100">x{order.quantity}</td>
    <td className="p-4 font-bold text-yellow-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</td>
    <td className="p-4">
        {order.status === 'pending' ? <span className="text-yellow-300 bg-yellow-900/40 px-2 py-1 rounded border border-yellow-500/30 text-xs font-bold animate-pulse">Waiting...</span> : <span className="text-green-400 bg-green-900/40 px-2 py-1 rounded border border-green-500/30 text-xs font-bold">Done</span>}
    </td>
    <td className="p-4 flex justify-center gap-2">
      {order.status === 'pending' && <button onClick={() => onComplete(order.id)} title="Xác nhận hoàn thành" className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-check"></i></button>}
      <button onClick={() => onDelete(order.id)} title="Xóa đơn hàng" className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-trash"></i></button>
    </td>
  </tr>
);

const App = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
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
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: null as File | null
  });

  // Fetch Data
  useEffect(() => {
    const productsRef = ref(database, 'products');
    const ordersRef = ref(database, 'orders');

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

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const orderList: Order[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          orderList.push({ id: key, ...data[key] });
        });
      }
      setOrders(orderList.reverse());
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image || !newProduct.name || !newProduct.price) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(newProduct.image);
      await set(push(ref(database, 'products')), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        imageUrl: imageUrl,
        timestamp: Date.now(),
        ratingTotal: 0,
        ratingCount: 0
      });
      setNewProduct({ name: '', price: '', description: '', image: null });
    } catch (error: any) {
      console.error("Lỗi:", error.message);
      alert('Có lỗi xảy ra khi đăng sản phẩm');
    } finally {
      setUploading(false);
    }
  };

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
      alert('Đặt hàng thành công! Đơn hàng đang chờ xử lý.');
    } catch (error) {
      console.error(error);
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
     await update(ref(database, `orders/${orderId}`), { status: 'completed' });
  };

  const handleDeleteOrder = async (orderId: string) => {
     if(confirm('Bạn có chắc muốn xóa đơn này?')) {
        await remove(ref(database, `orders/${orderId}`));
     }
  };

  // Filter Orders for Split View
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status !== 'pending');

  return (
    <div className="relative min-h-screen font-sans selection:bg-yellow-500 selection:text-red-900 text-yellow-50">
      <Background />
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6">
          <div className="flex items-center gap-5 group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] floating bg-red-800">
                <img src="https://res.cloudinary.com/dbyap7mw2/image/upload/v1769950832/457203768_122098176248501397_7041672154476517727_n_1_ib8kcf.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-header font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 text-glow drop-shadow-md">A1K50</h1>
              <p className="text-lg font-tet text-yellow-400 tracking-wider">🌸 Chúc Mừng Năm Mới 2026 🌸</p>
            </div>
          </div>
          <button onClick={() => setIsAdminMode(!isAdminMode)} className={`w-full md:w-auto px-8 py-3 rounded-full border-2 text-sm font-bold transition-all shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${isAdminMode ? 'bg-yellow-400 border-yellow-400 text-red-900 hover:bg-yellow-300' : 'bg-red-900/80 border-yellow-500/50 text-yellow-300 hover:bg-red-800 backdrop-blur'}`}>
            {isAdminMode ? <><i className="fas fa-store"></i> Cửa Hàng</> : <><i className="fas fa-crown"></i> Trang Quản Lý</>}
          </button>
        </header>

        {isAdminMode ? (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Add Product Section */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 max-w-2xl mx-auto border-yellow-500/30">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-300 font-header"><i className="fas fa-plus-circle"></i>Sản Phẩm</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input type="text" placeholder="Tên sản phẩm..." className="w-full bg-red-900/40 border border-yellow-500/20 rounded-xl p-4 focus:border-yellow-400 outline-none transition-colors text-yellow-100 placeholder-yellow-100/30" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <div className="flex flex-col md:flex-row gap-4">
                   <input type="number" placeholder="Giá bán" className="flex-1 bg-red-900/40 border border-yellow-500/20 rounded-xl p-4 focus:border-yellow-400 outline-none transition-colors text-yellow-100 placeholder-yellow-100/30" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                   <input type="file" accept="image/*" className="flex-1 bg-red-900/40 border border-yellow-500/20 rounded-xl p-3 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-red-900 hover:file:bg-yellow-400 text-yellow-200" onChange={handleFileChange} />
                </div>
                <textarea placeholder="Mô tả sản phẩm..." className="w-full bg-red-900/40 border border-yellow-500/20 rounded-xl p-4 focus:border-yellow-400 outline-none transition-colors h-32 resize-none text-yellow-100 placeholder-yellow-100/30" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <button disabled={uploading} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-red-950 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all disabled:opacity-50">
                  {uploading ? 'Đang tải lên...' : 'BÁN'}
                </button>
              </form>
            </div>

            {/* Pending Orders Section (NEW) */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border-yellow-500/30 bg-red-950/40">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-300 font-header">
                <i className="fas fa-clock"></i> Đơn Hàng Mới
                <span className="ml-2 bg-red-600 text-white text-sm px-2 py-1 rounded-full animate-pulse"></span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-red-900/30">
                    <tr className="text-yellow-500/80 border-b border-yellow-500/20 text-sm uppercase">
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Sản phẩm</th>
                      <th className="p-4">SL</th>
                      <th className="p-4">Tổng tiền</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-yellow-500/40 italic">Hiện không có đơn hàng nào đang chờ.</td></tr>
                    ) : (
                      pendingOrders.map(order => (
                        <OrderRow key={order.id} order={order} onComplete={handleCompleteOrder} onDelete={handleDeleteOrder} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Completed Orders Section (History) */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border-yellow-500/30 opacity-80 hover:opacity-100 transition-opacity">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-500/80 font-header"><i className="fas fa-history"></i> Lịch Sử Đơn Hàng</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="text-yellow-500/50 border-b border-yellow-500/10 text-sm uppercase">
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Sản phẩm</th>
                      <th className="p-4">SL</th>
                      <th className="p-4">Tổng tiền</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-yellow-500/40 italic">Chưa có lịch sử đơn hàng.</td></tr>
                    ) : (
                      completedOrders.map(order => (
                        <OrderRow key={order.id} order={order} onComplete={handleCompleteOrder} onDelete={handleDeleteOrder} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* Store View */
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
        )}
      </div>
      
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onRate={handleRateProduct} userRating={selectedProduct.ratedBy ? selectedProduct.ratedBy[userUUID] : 0} onOrder={() => setIsOrderModalOpen(true)} />}
      {isOrderModalOpen && selectedProduct && <OrderModal product={selectedProduct} onClose={() => setIsOrderModalOpen(false)} onSubmit={handlePlaceOrder} isSubmitting={isOrdering} />}
    </div>
  );
};

export default App;