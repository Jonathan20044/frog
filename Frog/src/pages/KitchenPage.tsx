import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

export default function KitchenPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">👨‍🍳 Cocina - FROG</h1>
              <p className="text-orange-100">
                Órdenes Activas: {activeOrders.length}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-bold transition shadow-md"
            >
              ← Volver a Mesas
            </button>
          </div>
        </div>
      </div>

      {/* Órdenes */}
      <div className="max-w-7xl mx-auto p-6">
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              ¡Todo listo!
            </h2>
            <p className="text-gray-600 text-lg">
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
                  className={`bg-white rounded-xl shadow-lg p-6 border-l-8 transition transform hover:scale-105 ${
                    isUrgent
                      ? 'border-red-500 animate-pulse'
                      : 'border-green-500'
                  }`}
                >
                  {/* Header de la orden */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Mesa {order.tableId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(order.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          isUrgent ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {elapsed} min
                      </div>
                      {isUrgent && (
                        <span className="text-xs text-red-600 font-semibold">
                          ¡URGENTE!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items de la orden */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Platillos:
                    </h4>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-orange-50 rounded-lg p-3 border border-orange-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-gray-800">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.description}
                            </div>
                          </div>
                          <div className="ml-3">
                            <span className="bg-orange-600 text-white font-bold px-3 py-1 rounded-full text-lg">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${order.total}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkReady(order.tableId)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition shadow-md"
                    >
                      ✓ Orden Lista
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
        <div className="bg-white rounded-full shadow-lg px-4 py-2 text-sm text-gray-600">
          🔄 Vista en tiempo real
        </div>
      </div>
    </div>
  );
}
