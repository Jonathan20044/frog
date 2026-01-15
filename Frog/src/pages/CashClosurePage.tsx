import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, CreditCard, Smartphone, Package, TrendingUp, MapPin } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { useStorage } from '../context/StorageContext';
import { useAuth } from '../context/AuthContext';

export default function CashClosurePage() {
  const navigate = useNavigate();
  const { getTodayPayments } = useRestaurant();
  const { getTodayRefills } = useStorage();
  const { user } = useAuth();

  const todayPayments = getTodayPayments() || [];
  const todayRefills = getTodayRefills() || [];

  // Agrupar pagos por método
  const paymentsByMethod = {
    efectivo: todayPayments.filter(p => p.paymentMethod === 'efectivo'),
    tarjeta: todayPayments.filter(p => p.paymentMethod === 'tarjeta'),
    sinpe: todayPayments.filter(p => p.paymentMethod === 'sinpe'),
  };

  // Calcular totales por método
  const totalByMethod = {
    efectivo: paymentsByMethod.efectivo.reduce((sum, p) => sum + (p.total || 0), 0),
    tarjeta: paymentsByMethod.tarjeta.reduce((sum, p) => sum + (p.total || 0), 0),
    sinpe: paymentsByMethod.sinpe.reduce((sum, p) => sum + (p.total || 0), 0),
  };

  const totalGeneral = totalByMethod.efectivo + totalByMethod.tarjeta + totalByMethod.sinpe;

  // Contar items rellenados por tipo
  const refillSummary = todayRefills.reduce((acc, refill) => {
    refill.itemsRefilled.forEach(item => {
      if (!acc[item.itemName]) {
        acc[item.itemName] = { quantity: 0, unit: item.unit };
      }
      acc[item.itemName].quantity += item.quantity;
    });
    return acc;
  }, {} as Record<string, { quantity: number; unit: string }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                <DollarSign className="w-8 h-8" />
                Cierre de Caja - FROG
              </h1>
              <p className="text-emerald-100">Resumen de ventas y operaciones del día</p>
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
        {/* Resumen de Totales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm font-semibold opacity-90">Total General</span>
            </div>
            <p className="text-4xl font-bold">${totalGeneral.toFixed(2)}</p>
            <p className="text-sm opacity-90 mt-1">{todayPayments.length} transacciones</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-sm font-semibold text-slate-600">Efectivo</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalByMethod.efectivo.toFixed(2)}</p>
            <p className="text-sm text-slate-500 mt-1">{paymentsByMethod.efectivo.length} pagos</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-semibold text-slate-600">Tarjeta</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalByMethod.tarjeta.toFixed(2)}</p>
            <p className="text-sm text-slate-500 mt-1">{paymentsByMethod.tarjeta.length} pagos</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-semibold text-slate-600">SINPE</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalByMethod.sinpe.toFixed(2)}</p>
            <p className="text-sm text-slate-500 mt-1">{paymentsByMethod.sinpe.length} pagos</p>
          </div>
        </div>

        {/* Detalle de Pagos por Método */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Efectivo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Pagos en Efectivo</h3>
                <p className="text-sm text-slate-500">{paymentsByMethod.efectivo.length} transacciones</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paymentsByMethod.efectivo.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No hay pagos en efectivo</p>
              ) : (
                paymentsByMethod.efectivo.map((payment) => (
                  <div key={payment.timestamp.toString()} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700">
                          {payment.areaName} - Mesa {payment.tableId}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">${payment.total}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.paidAt!).toLocaleTimeString('es-MX')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tarjeta */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Pagos con Tarjeta</h3>
                <p className="text-sm text-slate-500">{paymentsByMethod.tarjeta.length} transacciones</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paymentsByMethod.tarjeta.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No hay pagos con tarjeta</p>
              ) : (
                paymentsByMethod.tarjeta.map((payment) => (
                  <div key={payment.timestamp.toString()} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700">
                          {payment.areaName} - Mesa {payment.tableId}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">${payment.total}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.paidAt!).toLocaleTimeString('es-MX')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SINPE */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Pagos por SINPE</h3>
                <p className="text-sm text-slate-500">{paymentsByMethod.sinpe.length} transacciones</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paymentsByMethod.sinpe.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No hay pagos por SINPE</p>
              ) : (
                paymentsByMethod.sinpe.map((payment) => (
                  <div key={payment.timestamp.toString()} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700">
                          {payment.areaName} - Mesa {payment.tableId}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">${payment.total}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.paidAt!).toLocaleTimeString('es-MX')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Resumen de Rellenos */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Resumen de Rellenos de Recámaras</h3>
              <p className="text-sm text-slate-500">{todayRefills.length} registros hoy</p>
            </div>
          </div>

          {Object.keys(refillSummary).length === 0 ? (
            <p className="text-slate-400 text-center py-8">No hay rellenos registrados hoy</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(refillSummary).map(([itemName, data]) => (
                <div key={itemName} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-l-4 border-blue-500">
                  <h4 className="font-bold text-slate-800 mb-2">{itemName}</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {data.quantity} <span className="text-lg text-slate-600">{data.unit}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Rellenados hoy</p>
                </div>
              ))}
            </div>
          )}

          {/* Detalle de rellenos por mesera */}
          {todayRefills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Detalle por Mesera/o</h4>
              <div className="space-y-3">
                {todayRefills.map((refill) => (
                  <div key={refill.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{refill.waiter}</p>
                        <p className="text-sm text-slate-500">{refill.storageRoom}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(refill.date).toLocaleTimeString('es-MX')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {refill.itemsRefilled.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {item.quantity} {item.unit} de {item.itemName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info mesera */}
        <div className="mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-2">📊 Información del Cierre</h3>
          <p className="text-emerald-100">
            Mesera/o: <span className="font-bold">{user?.name}</span>
          </p>
          <p className="text-emerald-100">
            Fecha: <span className="font-bold">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
