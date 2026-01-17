import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { Users, CreditCard, Banknote, Smartphone, CheckCircle, Receipt, ChefHat, X } from 'lucide-react';

type PaymentMethod = 'efectivo' | 'tarjeta' | 'sinpe';
type PaymentMode = 'simple' | 'split' | 'combined';

interface SplitPayment {
  method: PaymentMethod;
  amount: number;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { currentTable, orders, completePayment } = useRestaurant();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('simple');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  const [tempAmounts, setTempAmounts] = useState<Record<PaymentMethod, string>>({
    efectivo: '',
    tarjeta: '',
    sinpe: ''
  });

  if (currentTable === null) {
    navigate('/');
    return null;
  }

  const tableOrders = orders.filter(
    (order) => order.tableId === currentTable && order.status !== 'paid'
  );

  const subtotal = tableOrders.reduce((sum, order) => sum + order.total, 0);
  const total = subtotal;
  const perPersonAmount = total / splitCount;
  
  const currentDate = new Date();

  const paymentMethods = [
    { id: 'efectivo' as PaymentMethod, name: 'Efectivo', icon: Banknote, color: 'green' },
    { id: 'tarjeta' as PaymentMethod, name: 'Tarjeta', icon: CreditCard, color: 'blue' },
    { id: 'sinpe' as PaymentMethod, name: 'SINPE Móvil', icon: Smartphone, color: 'purple' },
  ];

  const addSplitPayment = (method: PaymentMethod, amount: number) => {
    const newPayment: SplitPayment = { method, amount };
    setSplitPayments([...splitPayments, newPayment]);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const getTotalSplitPayments = () => {
    return splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getRemainingAmount = () => {
    return total - getTotalSplitPayments();
  };

  const handlePayment = () => {
    if (paymentMode === 'combined') {
      if (Math.abs(getRemainingAmount()) > 0.01) {
        alert(`Falta cubrir ₡${getRemainingAmount().toFixed(2)} del total`);
        return;
      }
      // Usar el método que tenga más monto para el registro
      const mainMethod = splitPayments.reduce((prev, current) => 
        current.amount > prev.amount ? current : prev
      ).method;
      completePayment(mainMethod);
    } else {
      if (!selectedMethod) {
        alert('Por favor selecciona un método de pago');
        return;
      }
      completePayment(selectedMethod);
    }
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
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              ¡Pago Exitoso!
            </h1>
          </div>

          {/* Recibo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <ChefHat className="w-6 h-6" />
                FROG Restaurant
              </h2>
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
              <div className="flex justify-between text-gray-700">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold">
                  {paymentMode === 'combined' ? 'Pago Combinado' : paymentMethods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
              {paymentMode === 'combined' && (
                <div className="mt-2 space-y-1">
                  {splitPayments.map((payment, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600 pl-4">
                      <span>{paymentMethods.find(m => m.id === payment.method)?.name}</span>
                      <span>₡{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 pt-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Detalle de Consumo:</h3>
              <div className="space-y-1 text-sm">
                {tableOrders.map((order, index) => (
                  <div key={index}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₡{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>₡{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-green-600 border-t pt-2">
                <span>TOTAL:</span>
                <span>₡{total.toFixed(2)}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-cyan-600" />
              Pagar Mesa {currentTable}
            </div>
          </h1>
          <div className="inline-block bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 px-8 py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all">
            <p className="text-4xl font-bold text-white drop-shadow-lg">₡{total.toFixed(2)}</p>
            <p className="text-sm text-cyan-100 font-semibold">Total a pagar</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna 1: Resumen y Propina */}
          <div className="space-y-4">
            {/* Resumen compacto */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-6 border-2 border-cyan-200">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-cyan-600" />
                  Resumen
                </div>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                {tableOrders.map((order, index) => (
                  <div key={index}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name} x{item.quantity}</span>
                        <span className="font-semibold text-gray-800">₡{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-200 pt-3 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₡{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Dividir cuenta */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl shadow-2xl p-6 border-2 border-cyan-300">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-cyan-600" /> Dividir Cuenta
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                  className="w-12 h-12 bg-white rounded-xl font-bold text-xl text-gray-700 hover:bg-purple-100 border-2 border-gray-200 transition"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-purple-600">{splitCount}</div>
                  <div className="text-xs text-gray-600">personas</div>
                </div>
                <button
                  onClick={() => setSplitCount(splitCount + 1)}
                  className="w-12 h-12 bg-white rounded-xl font-bold text-xl text-gray-700 hover:bg-purple-100 border-2 border-gray-200 transition"
                >
                  +
                </button>
              </div>
              {splitCount > 1 && (
                <div className="mt-3 bg-white rounded-xl p-3 text-center border-2 border-purple-300">
                  <p className="text-sm text-gray-600 mb-1">Por persona:</p>
                  <p className="text-2xl font-bold text-purple-600">₡{perPersonAmount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna 2 y 3: Métodos de Pago */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-100 p-2 rounded-xl">
                <button
                  onClick={() => {
                    setPaymentMode('simple');
                    setSplitPayments([]);
                  }}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ₡{
                    paymentMode === 'simple'
                      ? 'bg-white text-emerald-600 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  Un Solo Método
                </button>
                <button
                  onClick={() => {
                    setPaymentMode('combined');
                    setSelectedMethod(null);
                  }}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ₡{
                    paymentMode === 'combined'
                      ? 'bg-white text-orange-600 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  Combinar Pagos
                </button>
              </div>

              {paymentMode === 'simple' ? (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center">
                    Selecciona cómo pagar
                  </h3>
                  <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-6 rounded-2xl border-3 transition-all transform hover:scale-102 ₡{
                          selectedMethod === method.id
                            ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-2xl scale-105'
                            : 'border-gray-300 bg-white hover:border-gray-400 shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div><method.icon className="w-16 h-16" /></div>
                          <div className="flex-1 text-left">
                            <div className="text-2xl font-bold text-gray-800">{method.name}</div>
                            {selectedMethod === method.id && (
                              <div className="text-lg text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                <CheckCircle className="w-5 h-5" /> Seleccionado
                              </div>
                            )}
                          </div>
                          {selectedMethod === method.id && (
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!selectedMethod}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                        selectedMethod
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedMethod ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Pagar ₡{total.toFixed(2)}
                        </div>
                      ) : 'Selecciona método'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center">
                    Combina métodos de pago
                  </h3>
                  
                  {/* Resumen de pagos agregados */}
                  {splitPayments.length > 0 && (
                    <div className="mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-300">
                      <h4 className="font-bold text-gray-800 mb-3 text-lg">Pagos agregados:</h4>
                      <div className="space-y-2 mb-4">
                        {splitPayments.map((payment, idx) => {
                          const MethodIcon = paymentMethods.find(m => m.id === payment.method)?.icon;
                          return (
                            <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
                              <div className="flex items-center gap-3">
                                {MethodIcon && <MethodIcon className="w-8 h-8" />}
                                <span className="font-semibold text-gray-800">{paymentMethods.find(m => m.id === payment.method)?.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-emerald-600">₡{payment.amount.toFixed(2)}</span>
                                <button
                                  onClick={() => removeSplitPayment(idx)}
                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold flex items-center justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-white rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-700">Total cubierto:</span>
                          <span className="font-bold text-emerald-600">₡{getTotalSplitPayments().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-700">Falta por cubrir:</span>
                          <span className="font-bold text-orange-600">₡{getRemainingAmount().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agregar pagos */}
                  {getRemainingAmount() > 0 ? (
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-gray-700 mb-3">Agregar pago:</p>
                      {paymentMethods.map((method) => {
                        const MethodIcon = method.icon;
                        return (
                          <div key={method.id} className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
                            <div className="flex items-center gap-4 mb-3">
                              <MethodIcon className="w-10 h-10" />
                              <div className="flex-1 font-bold text-xl text-gray-800">{method.name}</div>
                            </div>
                          <div className="flex gap-3">
                            <div className="flex-1 relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">₡</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={getRemainingAmount()}
                                placeholder="0.00"
                                value={tempAmounts[method.id]}
                                onChange={(e) => setTempAmounts({...tempAmounts, [method.id]: e.target.value})}
                                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl text-xl font-bold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const amount = parseFloat(tempAmounts[method.id]);
                                if (amount > 0 && amount <= getRemainingAmount()) {
                                  addSplitPayment(method.id, amount);
                                  setTempAmounts({...tempAmounts, [method.id]: ''});
                                } else {
                                  alert('Monto inválido');
                                }
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                      <p className="text-xl font-bold text-emerald-600">¡Total cubierto!</p>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={Math.abs(getRemainingAmount()) > 0.01}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ₡{
                        Math.abs(getRemainingAmount()) <= 0.01
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {Math.abs(getRemainingAmount()) <= 0.01 
                        ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Confirmar Pago ₡{total.toFixed(2)}
                          </div>
                        )
                        : `Falta ₡${getRemainingAmount().toFixed(2)}`
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

