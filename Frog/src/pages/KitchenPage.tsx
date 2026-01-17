import { useRestaurant } from '../context/RestaurantContext';
import { ChefHat, CheckCircle, RefreshCw } from 'lucide-react';

export default function KitchenPage() {
  const { orders, markOrderReady } = useRestaurant();

  const activeOrders = orders.filter((order) => order.status === 'preparing');

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getElapsedTime = (date: Date) => {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - new Date(date).getTime()) / 1000 / 60);
    return elapsed;
  };

  const handleMarkReady = (tableId: number) => {
    markOrderReady(tableId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl border-b-4 border-cyan-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-2xl blur opacity-50"></div>
                <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <ChefHat className="w-9 h-9 text-cyan-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                  Cocina - FROG
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-cyan-100 text-base font-semibold">
                    Órdenes Activas: {activeOrders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Órdenes */}
      <div className="max-w-7xl mx-auto p-6">
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-cyan-100">
            <CheckCircle className="w-24 h-24 text-cyan-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
              ¡Todo listo!
            </h2>
            <p className="text-slate-600 text-lg">
              No hay órdenes pendientes en este momento
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map((order, index) => {
              const elapsed = getElapsedTime(order.timestamp);
              const isUrgent = elapsed >= 15;

              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-6 border-l-8 transition-all transform hover:scale-105 hover:shadow-cyan-500/50 ${
                    isUrgent
                      ? 'border-red-500 animate-pulse'
                      : 'border-cyan-500'
                  }`}
                >
                  {/* Header de la orden */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-cyan-100">
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        Mesa {order.tableId}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {formatTime(order.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          isUrgent ? 'text-red-600' : 'text-cyan-600'
                        }`}
                      >
                        {elapsed} min
                      </div>
                      {isUrgent && (
                        <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full">
                          ¡URGENTE!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items de la orden */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                      Platillos:
                    </h4>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200 hover:border-cyan-400 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-slate-800 text-lg">
                              {item.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {item.description}
                            </div>
                          </div>
                          <div className="ml-3">
                            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold px-3 py-1 rounded-full text-lg shadow-lg">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t-2 border-cyan-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-bold">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                        ₡{order.total}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkReady(order.tableId)}
                      className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold transition-all shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Orden Lista
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white rounded-full shadow-2xl px-5 py-3 text-sm font-bold border-2 border-cyan-200 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-cyan-600 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Vista en tiempo real</span>
        </div>
      </div>
    </div>
  );
}
