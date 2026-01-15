import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

type PaymentMethod = 'efectivo' | 'tarjeta' | 'sinpe';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { currentTable, orders, completePayment } = useRestaurant();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);

  if (currentTable === null) {
    navigate('/');
    return null;
  }

  const tableOrders = orders.filter(
    (order) => order.tableId === currentTable && order.status !== 'paid'
  );

  const subtotal = tableOrders.reduce((sum, order) => sum + order.total, 0);
  const tipAmount = subtotal * (tipPercentage / 100);
  const total = subtotal + tipAmount;
  
  const currentDate = new Date();
  const orderTime = tableOrders.length > 0 ? new Date(tableOrders[0].timestamp) : currentDate;

  const paymentMethods = [
    { id: 'efectivo' as PaymentMethod, name: 'Efectivo', icon: '💵', color: 'green' },
    { id: 'tarjeta' as PaymentMethod, name: 'Tarjeta', icon: '💳', color: 'blue' },
    { id: 'sinpe' as PaymentMethod, name: 'SINPE Móvil', icon: '📱', color: 'purple' },
  ];

  const tipOptions = [
    { value: 0, label: 'Sin Propina' },
    { value: 10, label: '10%' },
    { value: 15, label: '15%' },
    { value: 20, label: '20%' },
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    completePayment(selectedMethod);
    setShowReceipt(true);
  };

  const handleFinish = () => {
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              ¡Pago Exitoso!
            </h1>
          </div>

          {/* Recibo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🐸 FROG Restaurant</h2>
              <p className="text-sm text-gray-600">Recibo de Pago</p>
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-semibold">{currentDate.toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-semibold">{currentDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mesa:</span>
                <span className="font-semibold">#{currentTable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold">{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Detalle de Consumo:</h3>
              <div className="space-y-1 text-sm">
                {tableOrders.map((order, index) => (
                  <div key={index}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Propina ({tipPercentage}%):</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-green-600 border-t pt-2">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">¡Gracias por su visita!</p>
            <button
              onClick={handleFinish}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐸</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Procesando Pago - Mesa {currentTable}
            </h1>
            <p className="text-gray-600">Completa los detalles para finalizar tu compra</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Resumen de Cuenta */}
            <div>
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🧾</span> Resumen de la Cuenta
                </h2>
                
                {/* Información de la orden */}
                <div className="mb-4 pb-4 border-b border-green-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Hora de Orden:</div>
                    <div className="font-semibold text-right">
                      {orderTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-600">Mesa:</div>
                    <div className="font-semibold text-right">#{currentTable}</div>
                    <div className="text-gray-600">Mesero:</div>
                    <div className="font-semibold text-right">Carlos M.</div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {tableOrders.map((order, index) => (
                    <div key={index} className="border-b border-green-200 pb-2 last:border-0">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 py-1">
                          <span className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 text-sm"> x{item.quantity}</span>
                          </span>
                          <span className="font-semibold text-green-700">
                            ${item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t-2 border-green-600 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Propina ({tipPercentage}%):</span>
                      <span className="font-semibold text-green-600">${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-2xl font-bold text-gray-800">TOTAL:</span>
                    <span className="text-3xl font-bold text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Propina */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💝</span> Propina (Opcional)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {tipOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTipPercentage(option.value)}
                      className={`p-3 rounded-lg border-2 font-semibold transition ${
                        tipPercentage === option.value
                          ? 'border-blue-600 bg-blue-100 text-blue-800'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💳</span> Selecciona Método de Pago
              </h3>
              <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-xl border-2 transition transform hover:scale-102 flex items-center gap-4 ${
                      selectedMethod === method.id
                        ? `border-${method.color}-600 bg-${method.color}-50 shadow-lg`
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="text-4xl">{method.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-lg text-gray-800">{method.name}</div>
                      {selectedMethod === method.id && (
                        <div className="text-sm text-green-600 font-semibold">✓ Seleccionado</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                    selectedMethod
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedMethod ? '✓ Confirmar Pago' : 'Selecciona un método de pago'}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
