import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, push, onValue, update, set, remove } from 'firebase/database';
import { Product, Order, NewProductForm } from './types';
import { uploadImageToCloudinary } from './services/cloudinaryService';
import Background from './components/Background';
import ProductModal from './components/ProductModal';
import OrderModal from './components/OrderModal';

// --- Helper: Generate simple UUID for "1 IP" simulation ---
const getOrCreateUUID = () => {
  let uuid = localStorage.getItem('user_uuid');
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('user_uuid', uuid);
  }
  return uuid;
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userUUID] = useState(getOrCreateUUID());
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Admin action loading state
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Form State
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: '',
    price: '',
    description: '',
    image: null
  });

  // --- Initialize Data ---
  useEffect(() => {
    const productsRef = ref(database, 'products');
    const ordersRef = ref(database, 'orders');

    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList: Product[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          // Add default values for ratings if they don't exist in old data
          productList.push({ 
            id: key, 
            ratingTotal: 0,
            ratingCount: 0,
            ratedBy: {},
            ...data[key] 
          });
        });
      }
      // Sort by newest
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

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image || !newProduct.name || !newProduct.price) {
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(newProduct.image);
      const newProductRef = push(ref(database, 'products'));
      
      await set(newProductRef, {
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
      console.error(error);
      alert("Lỗi: " + (error.message || "Kiểm tra Firebase Rules!"));
    } finally {
      setUploading(false);
    }
  };

  const handleRateProduct = async (product: Product, stars: number) => {
    if (product.ratedBy && product.ratedBy[userUUID]) {
      return;
    }

    const currentTotal = product.ratingTotal || 0;
    const currentCount = product.ratingCount || 0;

    const updates: any = {};
    updates[`products/${product.id}/ratingTotal`] = currentTotal + stars;
    updates[`products/${product.id}/ratingCount`] = currentCount + 1;
    updates[`products/${product.id}/ratedBy/${userUUID}`] = stars;

    try {
      await update(ref(database), updates);
      // Update local state temporarily for immediate feedback
      if (selectedProduct && selectedProduct.id === product.id) {
          setSelectedProduct({
              ...selectedProduct, 
              ratingTotal: currentTotal + stars,
              ratingCount: currentCount + 1,
              ratedBy: { ...selectedProduct.ratedBy, [userUUID]: stars }
          });
      }
    } catch (error) {
      console.error("Error rating:", error);
    }
  };

  const handlePlaceOrder = async (orderData: { name: string; phone: string; address: string; quantity: number; totalPrice: number }) => {
    if (!selectedProduct) return;
    setIsOrdering(true);

    try {
      const ordersRef = push(ref(database, 'orders'));
      await set(ordersRef, {
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
    } catch (error: any) {
      console.error("Order error", error);
    } finally {
      setIsOrdering(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'completed' | 'delete') => {
    const isDelete = action === 'delete';
    
    setProcessingOrderId(orderId);
    try {
      if (isDelete) {
        await remove(ref(database, `orders/${orderId}`));
      } else {
        await update(ref(database, `orders/${orderId}`), { status: 'completed' });
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white">
      <Background />

      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)] floating">
                <img src="https://files.catbox.moe/cwhx9o.ico" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white text-glow">
                A1K50
              </h1>
              <p className="text-xs md:text-sm text-gray-400 tracking-widest">UY TÍN - CHẤT LƯỢNG</p>
            </div>
          </div>

          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`w-full md:w-auto px-6 py-2 rounded-full border border-white/20 text-sm font-bold transition-all ${isAdminMode ? 'bg-white text-black' : 'bg-black/50 text-white hover:bg-white/10'}`}
          >
            {isAdminMode ? '🛒 Xem Cửa Hàng' : '👑 Quản Trị'}
          </button>
        </header>

        {/* --- ADMIN PANEL --- */}
        {isAdminMode ? (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Add Product Form */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-plus-circle text-green-400"></i> Thêm Sản Phẩm Mới
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Tên sản phẩm"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-purple-500 outline-none transition-colors"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                <div className="flex flex-col md:flex-row gap-4">
                   <input 
                    type="number" 
                    placeholder="Giá (VNĐ)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 focus:border-purple-500 outline-none transition-colors"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    onChange={handleFileChange}
                  />
                </div>
                <textarea 
                  placeholder="Mô tả chi tiết sản phẩm..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-purple-500 outline-none transition-colors h-32 resize-none"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
                <button 
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
                >
                  {uploading ? 'Đang tải lên...' : 'ĐĂNG BÁN NGAY'}
                </button>
              </form>
            </div>

            {/* Pending Orders List */}
            <div className="glass-panel rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-list-ul text-yellow-400"></i> Quản Lý Đơn Hàng
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10 text-sm uppercase">
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
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${order.status === 'completed' ? 'opacity-50' : ''}`}>
                          <td className="p-4 text-sm text-gray-300">
                            {new Date(order.timestamp).toLocaleString('vi-VN')}
                          </td>
                          <td className="p-4">
                            <div className="font-bold">{order.customerName}</div>
                            <div className="text-xs text-gray-400 font-mono">{order.phone}</div>
                            <div className="text-xs text-gray-400 max-w-[200px] truncate" title={order.address}>{order.address}</div>
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                                <img src={order.productImage} className="w-8 h-8 rounded object-cover" alt="" />
                                <span className="text-sm font-medium">{order.productName}</span>
                             </div>
                          </td>
                          <td className="p-4 font-bold text-center">
                            x{order.quantity}
                          </td>
                          <td className="p-4 font-bold text-green-400">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice || order.unitPrice)}
                          </td>
                          <td className="p-4">
                            {order.status === 'pending' && <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30">Đang chờ</span>}
                            {order.status === 'completed' && <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">Hoàn thành</span>}
                            {order.status === 'cancelled' && <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">Đã hủy</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {order.status === 'pending' && (
                                <button 
                                  onClick={() => handleOrderAction(order.id, 'completed')}
                                  disabled={processingOrderId === order.id}
                                  className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center border border-green-500/30 disabled:opacity-50" 
                                  title="Xác nhận hoàn thành"
                                >
                                  {processingOrderId === order.id ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-check"></i>}
                                </button>
                              )}
                              
                              <button 
                                onClick={() => handleOrderAction(order.id, 'delete')}
                                disabled={processingOrderId === order.id}
                                className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/30 disabled:opacity-50" 
                                title="Xóa đơn hàng vĩnh viễn"
                              >
                                {processingOrderId === order.id ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-trash"></i>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* --- CUSTOMER STORE VIEW --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-[fadeIn_0.5s_ease-out]">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <div className="floating text-6xl mb-4">🌟</div>
                <p>Đang tải dữ liệu vũ trụ...</p>
              </div>
            ) : products.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-400">
                  Chưa có sản phẩm nào được bày bán.
                </div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="glass-panel rounded-2xl overflow-hidden group cursor-pointer hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] border-transparent hover:border-purple-500/30"
                >
                  <div className="aspect-square relative overflow-hidden bg-black/20">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold border border-white/10">
                         <span className="text-yellow-400">★</span> 
                         {product.ratingCount > 0 ? (product.ratingTotal / product.ratingCount).toFixed(1) : '5.0'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate text-white">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-bold text-lg">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </span>
                      <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-colors">
                        <i className="fas fa-shopping-cart text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onRate={handleRateProduct}
          userRating={selectedProduct.ratedBy ? selectedProduct.ratedBy[userUUID] || 0 : 0}
          onOrder={() => setIsOrderModalOpen(true)}
        />
      )}

      {isOrderModalOpen && selectedProduct && (
        <OrderModal 
          product={selectedProduct}
          onClose={() => setIsOrderModalOpen(false)}
          onSubmit={handlePlaceOrder}
          isSubmitting={isOrdering}
        />
      )}
    </div>
  );
};

export default App;