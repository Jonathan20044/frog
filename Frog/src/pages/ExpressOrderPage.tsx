import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Printer, Check, X, FileText, Flame, Phone, UtensilsCrossed, Cake, Wine, User, Rocket, Clock, ChefHat, Package } from 'lucide-react';
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
    { id: 'all', name: 'Todo', icon: UtensilsCrossed },
    { id: 'entrada', name: 'Entradas', icon: Package },
    { id: 'plato-fuerte', name: 'Platos Fuertes', icon: ChefHat },
    { id: 'postre', name: 'Postres', icon: Cake },
    { id: 'bebida', name: 'Bebidas', icon: Wine },
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
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                  Pedidos Express - FROG
                </h1>
                <p className="text-cyan-100 text-base flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Para llevar y entrega rápida
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-6 mb-8">
          <button
            onClick={() => setActiveTab('nueva-orden')}
            className={`flex-1 py-5 rounded-2xl font-bold text-xl transition-all transform flex items-center justify-center gap-3 ${
              activeTab === 'nueva-orden'
                ? 'bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-700 text-white shadow-2xl hover:shadow-cyan-500/50 scale-105'
                : 'bg-white text-slate-700 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 border-2 border-cyan-200 hover:border-cyan-400 hover:scale-102 shadow-lg'
            }`}
          >
            <FileText className="w-7 h-7" />
            Nueva Orden
          </button>
          <button
            onClick={() => setActiveTab('ordenes-activas')}
            className={`flex-1 py-5 rounded-2xl font-bold text-xl transition-all relative transform flex items-center justify-center gap-3 ${
              activeTab === 'ordenes-activas'
                ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-2xl hover:shadow-orange-500/50 scale-105'
                : 'bg-white text-slate-700 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 border-2 border-orange-200 hover:border-orange-400 hover:scale-102 shadow-lg'
            }`}
          >
            <Flame className="w-7 h-7" />
            Órdenes Activas
            {expressOrders.filter(o => o.status !== 'delivered').length > 0 && (
              <span className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg animate-bounce border-2 border-white">
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
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold whitespace-nowrap transition-all transform ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white shadow-xl scale-110 hover:shadow-2xl'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-slate-200 hover:border-cyan-300'
                    }`}
                  >
                    <cat.icon className="w-6 h-6" />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid de items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMenu.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden border-2 border-slate-200 hover:border-cyan-300 group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={item.image || ''}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-slate-800 mb-2">{item.name}</h3>
                      <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">₡{item.price}</span>
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-110 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <Plus className="w-5 h-5" />
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
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-8 sticky top-6 border-2 border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-xl shadow-lg">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Orden Actual</h2>
                </div>

                {/* Datos del cliente */}
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej: 555-1234"
                      className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                  {currentOrder.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-slate-400 font-semibold">No hay items en la orden</p>
                    </div>
                  ) : (
                    currentOrder.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-cyan-300 transition-all shadow-md hover:shadow-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800">{item.name}</h4>
                          <p className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">₡{item.price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="font-bold text-xl w-10 text-center bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 ml-2 transition-all transform hover:scale-125"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total y confirmar */}
                <div className="border-t-2 border-slate-200 pt-6">
                  <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-teal-50 p-4 rounded-xl mb-6 border-2 border-cyan-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-700">Total:</span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">₡{calculateTotal()}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={currentOrder.length === 0 || !customerName.trim()}
                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Check className="w-7 h-7" />
                    Confirmar Orden Express
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Órdenes Activas
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expressOrders.filter(o => o.status !== 'delivered').map((order) => (
              <div
                key={order.id}
                className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-8 border-l-8 border-cyan-600 hover:border-blue-600 transition-all transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      Orden #{order.orderNumber}
                    </h3>
                    <p className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5" /> {order.customerName}
                    </p>
                    {order.phone && (
                      <p className="text-sm text-slate-600 mt-1 font-medium flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {order.phone}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePrintOrder(order)}
                    className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-cyan-600 hover:to-blue-600 text-slate-700 hover:text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
                  >
                    <Printer className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-4 font-medium bg-slate-100 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-4 h-4" />
                      {new Date(order.timestamp).toLocaleString('es-MX')}
                    </div>
                  </p>
                  <div className="space-y-2 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border-2 border-slate-200">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-800">
                          <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-lg mr-2">{item.quantity}x</span>
                          {item.name}
                        </span>
                        <span className="font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">₡{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t-2 border-slate-200 pt-4 mb-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700 text-lg">Total:</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">₡{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleChangeStatus(order.id, e.target.value as ExpressOrder['status'])}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-center ₡{
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="preparing">En Preparación</option>
                    <option value="ready">Lista</option>
                    <option value="delivered">Entregada</option>
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
                <p className="text-xl font-bold">TOTAL: ₡{orderToPrint.total}</p>
              </div>

              <div className="text-center text-xs border-t-2 border-slate-400 pt-4">
                <p className="font-bold flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5" />
                  PEDIDO PARA LLEVAR
                  <Flame className="w-5 h-5" />
                </p>
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
