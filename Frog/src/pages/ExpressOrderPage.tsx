import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Plus, Minus, Trash2, Printer, Check, X } from 'lucide-react';
import { menuItems, type MenuItem, type OrderItem } from '../context/RestaurantContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface ExpressOrder {
  id: number;
  items: OrderItem[];
  customerName: string;
  phone: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  timestamp: Date;
  total: number;
  orderNumber: number;
}

export default function ExpressOrderPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'nueva-orden' | 'ordenes-activas'>('nueva-orden');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [expressOrders, setExpressOrders] = useState<ExpressOrder[]>([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<ExpressOrder | null>(null);
  const [orderCounter, setOrderCounter] = useState(1);

  const categories = [
    { id: 'all', name: 'Todo', icon: '🍽️' },
    { id: 'entrada', name: 'Entradas', icon: '🥗' },
    { id: 'plato-fuerte', name: 'Platos Fuertes', icon: '🍖' },
    { id: 'postre', name: 'Postres', icon: '🍰' },
    { id: 'bebida', name: 'Bebidas', icon: '🍷' },
  ];

  const filteredMenu = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddItem = (item: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: number, change: number) => {
    setCurrentOrder(prev => {
      const updated = prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      );
      return updated.filter(item => item.quantity > 0);
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleConfirmOrder = () => {
    if (currentOrder.length === 0) {
      alert('Agrega al menos un item al pedido');
      return;
    }
    if (!customerName.trim()) {
      alert('Ingresa el nombre del cliente');
      return;
    }

    const newOrder: ExpressOrder = {
      id: Date.now(),
      items: [...currentOrder],
      customerName,
      phone: customerPhone,
      status: 'pending',
      timestamp: new Date(),
      total: calculateTotal(),
      orderNumber: orderCounter
    };

    setExpressOrders(prev => [...prev, newOrder]);
    setOrderCounter(prev => prev + 1);
    
    // Simular impresión automática
    setOrderToPrint(newOrder);
    setShowPrintPreview(true);

    // Limpiar formulario
    setCurrentOrder([]);
    setCustomerName('');
    setCustomerPhone('');
    
    setTimeout(() => {
      setShowPrintPreview(false);
      setActiveTab('ordenes-activas');
    }, 3000);
  };

  const handlePrintOrder = (order: ExpressOrder) => {
    setOrderToPrint(order);
    setShowPrintPreview(true);
  };

  const handleChangeStatus = (orderId: number, newStatus: ExpressOrder['status']) => {
    setExpressOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8" />
                Pedidos Express - FROG
              </h1>
              <p className="text-emerald-100">Para llevar y entrega rápida</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold transition shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('nueva-orden')}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
              activeTab === 'nueva-orden'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-emerald-50'
            }`}
          >
            📝 Nueva Orden
          </button>
          <button
            onClick={() => setActiveTab('ordenes-activas')}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all relative ${
              activeTab === 'ordenes-activas'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-emerald-50'
            }`}
          >
            🔥 Órdenes Activas
            {expressOrders.filter(o => o.status !== 'delivered').length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {expressOrders.filter(o => o.status !== 'delivered').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'nueva-orden' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menú */}
            <div className="lg:col-span-2">
              {/* Filtros de categoría */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-emerald-50 shadow-sm'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid de items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenu.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-slate-200"
                  >
                    <div className="relative h-32">
                      <ImageWithFallback
                        src={item.image || ''}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-emerald-600">${item.price}</span>
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orden Actual */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Orden Actual</h2>

                {/* Datos del cliente */}
                <div className="mb-6 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej: 555-1234"
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                  {currentOrder.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No hay items en la orden</p>
                  ) : (
                    currentOrder.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{item.name}</h4>
                          <p className="text-sm text-slate-600">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-8 h-8 rounded-lg flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total y confirmar */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-slate-800">Total:</span>
                    <span className="text-3xl font-bold text-emerald-600">${calculateTotal()}</span>
                  </div>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={currentOrder.length === 0 || !customerName.trim()}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    Confirmar Orden Express
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Órdenes Activas
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expressOrders.filter(o => o.status !== 'delivered').map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      Orden #{order.orderNumber}
                    </h3>
                    <p className="text-slate-600">{order.customerName}</p>
                    {order.phone && (
                      <p className="text-sm text-slate-500">📞 {order.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePrintOrder(order)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">
                    {new Date(order.timestamp).toLocaleString('es-MX')}
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total:</span>
                    <span className="text-2xl font-bold text-emerald-600">${order.total}</span>
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleChangeStatus(order.id, e.target.value as ExpressOrder['status'])}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-center ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <option value="pending">⏳ Pendiente</option>
                    <option value="preparing">👨‍🍳 En Preparación</option>
                    <option value="ready">✅ Lista</option>
                    <option value="delivered">📦 Entregada</option>
                  </select>
                </div>
              </div>
            ))}

            {expressOrders.filter(o => o.status !== 'delivered').length === 0 && (
              <div className="col-span-full text-center py-16">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No hay órdenes activas</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vista previa de impresión (Comanda Térmica) */}
      {showPrintPreview && orderToPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Imprimiendo Comanda...</h2>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Simulación de ticket térmico */}
            <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300 font-mono text-sm">
              <div className="text-center mb-4 border-b-2 border-slate-400 pb-4">
                <h1 className="text-2xl font-bold">FROG RESTAURANT</h1>
                <p className="text-xs mt-2">COMANDA EXPRESS</p>
                <p className="text-xs">================================</p>
              </div>

              <div className="mb-4">
                <p className="font-bold text-lg">ORDEN #{orderToPrint.orderNumber}</p>
                <p className="text-xs">{new Date(orderToPrint.timestamp).toLocaleString('es-MX')}</p>
                <p className="mt-2">Cliente: {orderToPrint.customerName}</p>
                {orderToPrint.phone && <p>Tel: {orderToPrint.phone}</p>}
              </div>

              <div className="border-t-2 border-b-2 border-slate-400 py-3 mb-3">
                {orderToPrint.items.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="flex justify-between font-bold">
                      <span>{item.quantity}x {item.name}</span>
                    </div>
                    {item.notes && (
                      <p className="text-xs italic ml-4 text-slate-600">
                        * {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-right mb-4">
                <p className="text-xl font-bold">TOTAL: ${orderToPrint.total}</p>
              </div>

              <div className="text-center text-xs border-t-2 border-slate-400 pt-4">
                <p className="font-bold">🔥 PEDIDO PARA LLEVAR 🔥</p>
                <p className="mt-2">================================</p>
                <p>¡Gracias por su preferencia!</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600">
              <Printer className="w-5 h-5 animate-bounce" />
              <p className="font-semibold">Enviando a impresora térmica...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
