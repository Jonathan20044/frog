import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, UtensilsCrossed, CreditCard, Banknote, Clock, Users, Sparkles, Package, Calendar, TrendingDown } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { useStorage } from '../context/StorageContext';
import InteractiveGuide, { GuideButton, type GuideStep } from '../components/InteractiveGuide';

interface Employee {
  id: string;
  name: string;
  horasRegulares: number;
  horasExtras: number;
  tarifaPorHora: number;
}

const guideSteps: GuideStep[] = [
  {
    title: '¡Bienvenido al Dashboard!',
    description: 'Aquí puedes ver todas las métricas importantes del restaurante: ganancias, gastos, ventas y más.',
    position: 'center',
  },
  {
    title: 'Selector de Fecha',
    description: 'Elige la fecha base para el análisis. Todos los datos se actualizarán según la fecha seleccionada.',
    target: 'date-selector',
    position: 'bottom',
  },
  {
    title: 'Tipo de Período',
    description: 'Selecciona si quieres ver datos del día, semana (7 días), quincena (15 días) o mes (30 días).',
    target: 'period-selector',
    position: 'bottom',
  },
  {
    title: 'Métricas Principales',
    description: 'Ingresos totales, ganancia neta (ingresos - gastos), órdenes completadas y gastos totales.',
    target: 'metrics-cards',
    position: 'bottom',
  },
  {
    title: 'Platillos Más Vendidos',
    description: 'Top 5 de comidas más pedidas con cantidad de pedidos e ingresos generados.',
    target: 'top-items',
    position: 'right',
  },
  {
    title: 'Métodos de Pago',
    description: 'Distribución de pagos en efectivo vs tarjeta, con porcentajes y montos totales.',
    target: 'payment-methods',
    position: 'left',
  },
  {
    title: 'Salarios del Personal',
    description: 'Tabla detallada con horas regulares, horas extras (pagadas al 150%) y total a pagar por empleado.',
    target: 'salaries-table',
    position: 'top',
  },
  {
    title: 'Gastos de Reabastecimiento',
    description: 'Costos de reabastecimiento de recámaras con detalle de items y cantidades.',
    target: 'refill-costs',
    position: 'top',
  },
];

export default function DashboardPage() {
  const { orders } = useRestaurant();
  const { getTodayRefills } = useStorage();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'biweekly' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showGuide, setShowGuide] = useState(false);

  // Empleados (esto podría venir de un contexto de empleados)
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'María González', horasRegulares: 8, horasExtras: 2, tarifaPorHora: 3500 },
    { id: '2', name: 'Carlos Ramírez', horasRegulares: 8, horasExtras: 1, tarifaPorHora: 3200 },
    { id: '3', name: 'Ana López', horasRegulares: 8, horasExtras: 0, tarifaPorHora: 3000 },
    { id: '4', name: 'José Mora', horasRegulares: 6, horasExtras: 0, tarifaPorHora: 2800 },
  ]);

  // Calcular fechas según el período y la fecha seleccionada
  const getDateRange = () => {
    const baseDate = new Date(selectedDate);
    const startOfDay = new Date(baseDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(baseDate.setHours(23, 59, 59, 999));
    
    switch (selectedPeriod) {
      case 'day':
        return { start: startOfDay, end: endOfDay };
      case 'week':
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);
        return { start: startOfWeek, end: endOfDay };
      case 'biweekly':
        const startOfBiweekly = new Date(baseDate);
        startOfBiweekly.setDate(baseDate.getDate() - 14);
        startOfBiweekly.setHours(0, 0, 0, 0);
        return { start: startOfBiweekly, end: endOfDay };
      case 'month':
        const startOfMonth = new Date(baseDate);
        startOfMonth.setDate(baseDate.getDate() - 29);
        startOfMonth.setHours(0, 0, 0, 0);
        return { start: startOfMonth, end: endOfDay };
      default:
        return { start: startOfDay, end: endOfDay };
    }
  };

  const dateRange = getDateRange();

  // Filtrar órdenes pagadas según el período
  const paidOrders = orders.filter(order => {
    if (order.status !== 'paid' || !order.paidAt) return false;
    const orderDate = new Date(order.paidAt);
    return orderDate >= dateRange.start && orderDate <= dateRange.end;
  });

  // Calcular ganancias
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  // Calcular comidas más pedidas
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calcular tipos de pago
  const paymentMethods = paidOrders.reduce((acc, order) => {
    const method = order.paymentMethod || 'efectivo';
    if (!acc[method]) acc[method] = { count: 0, total: 0 };
    acc[method].count++;
    acc[method].total += order.total;
    return acc;
  }, {} as Record<string, { count: 0; total: number }>);

  // Calcular salarios
  const totalSalaries = employees.reduce((sum, emp) => {
    const regular = emp.horasRegulares * emp.tarifaPorHora;
    const extras = emp.horasExtras * emp.tarifaPorHora * 1.5; // horas extras al 150%
    return sum + regular + extras;
  }, 0);

  // Calcular gastos de reabastecimiento
  const todayRefills = getTodayRefills();
  const refillCosts = todayRefills.reduce((sum, refill) => {
    // Calcular costo basado en items reabastecidos
    const refillCost = refill.itemsRefilled.reduce((itemSum, item) => {
      return itemSum + (item.quantity * 2500); // Costo estimado por item
    }, 0);
    return sum + refillCost;
  }, 0);

  const periods = [
    { id: 'day', label: 'Día', icon: Calendar },
    { id: 'week', label: 'Semana', icon: Calendar },
    { id: 'biweekly', label: 'Quincena', icon: Calendar },
    { id: 'month', label: 'Mes', icon: Calendar },
  ];

  const netProfit = totalRevenue - totalSalaries - refillCosts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                  Dashboard - FROG
                </h1>
                <p className="text-cyan-100 text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análisis de Rendimiento y Métricas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Selector de Fecha y Período */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-600" />
            Período de Análisis
          </h2>
          
          {/* Selector de Fecha */}
          <div id="date-selector" className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Seleccionar Fecha Base
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-semibold focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {selectedPeriod === 'day' && 'Mostrando datos del día seleccionado'}
              {selectedPeriod === 'week' && 'Mostrando datos de 7 días terminando en la fecha seleccionada'}
              {selectedPeriod === 'biweekly' && 'Mostrando datos de 15 días terminando en la fecha seleccionada'}
              {selectedPeriod === 'month' && 'Mostrando datos de 30 días terminando en la fecha seleccionada'}
            </p>
          </div>

          {/* Selector de Período */}
          <div id="period-selector">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de Período
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {periods.map(period => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id as any)}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div id="metrics-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Ingresos Totales */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-12 h-12" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold opacity-90">Ingresos Totales</p>
            <p className="text-4xl font-bold mt-2">₡{totalRevenue.toLocaleString()}</p>
          </div>

          {/* Ganancia Neta */}
          <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-500 to-purple-600' : 'from-red-500 to-pink-600'} rounded-3xl shadow-2xl p-6 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <Sparkles className="w-12 h-12" />
              {netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <p className="text-sm font-semibold opacity-90">Ganancia Neta</p>
            <p className="text-4xl font-bold mt-2">₡{netProfit.toLocaleString()}</p>
          </div>

          {/* Órdenes Completadas */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <UtensilsCrossed className="w-12 h-12" />
              <span className="text-3xl font-bold">{paidOrders.length}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Órdenes Completadas</p>
            <p className="text-2xl font-bold mt-2">₡{(totalRevenue / paidOrders.length || 0).toLocaleString()} promedio</p>
          </div>

          {/* Gastos Totales */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <Package className="w-12 h-12" />
              <TrendingDown className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold opacity-90">Gastos Totales</p>
            <p className="text-4xl font-bold mt-2">₡{(totalSalaries + refillCosts).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Comidas Más Pedidas */}
          <div id="top-items" className="bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-cyan-600" />
              Top 5 - Comidas Más Pedidas
            </h2>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.name} className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-600">{item.count} pedidos</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-cyan-600">₡{item.revenue.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${(item.count / topItems[0].count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {topItems.length === 0 && (
                <p className="text-center text-slate-500 py-8">No hay datos disponibles para este período</p>
              )}
            </div>
          </div>

          {/* Métodos de Pago */}
          <div id="payment-methods" className="bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-cyan-600" />
              Métodos de Pago
            </h2>
            <div className="space-y-4">
              {Object.entries(paymentMethods).map(([method, data]) => {
                const Icon = method === 'efectivo' ? Banknote : CreditCard;
                const percentage = (data.total / totalRevenue) * 100;
                
                return (
                  <div key={method} className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl p-5 border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${method === 'efectivo' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 capitalize text-lg">{method}</p>
                          <p className="text-sm text-slate-600">{data.count} transacciones</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-600">₡{data.total.toLocaleString()}</p>
                        <p className="text-sm text-slate-600">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`${method === 'efectivo' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} h-3 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(paymentMethods).length === 0 && (
                <p className="text-center text-slate-500 py-8">No hay datos disponibles para este período</p>
              )}
            </div>
          </div>
        </div>

        {/* Salarios y Horas de Trabajo */}
        <div id="salaries-table" className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-600" />
            Salarios y Horas de Trabajo
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200">
                  <th className="text-left p-4 font-bold text-slate-700">Empleado</th>
                  <th className="text-center p-4 font-bold text-slate-700">Horas Regulares</th>
                  <th className="text-center p-4 font-bold text-slate-700">Horas Extras</th>
                  <th className="text-right p-4 font-bold text-slate-700">Tarifa/Hora</th>
                  <th className="text-right p-4 font-bold text-slate-700">Pago Regular</th>
                  <th className="text-right p-4 font-bold text-slate-700">Pago Extras</th>
                  <th className="text-right p-4 font-bold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => {
                  const regularPay = emp.horasRegulares * emp.tarifaPorHora;
                  const extraPay = emp.horasExtras * emp.tarifaPorHora * 1.5;
                  const totalPay = regularPay + extraPay;
                  
                  return (
                    <tr key={emp.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800">{emp.name}</span>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-600" />
                          <span className="font-semibold">{emp.horasRegulares}h</span>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold text-orange-600">{emp.horasExtras}h</span>
                        </div>
                      </td>
                      <td className="text-right p-4 text-slate-700">₡{emp.tarifaPorHora.toLocaleString()}</td>
                      <td className="text-right p-4 text-slate-700">₡{regularPay.toLocaleString()}</td>
                      <td className="text-right p-4 text-orange-600 font-semibold">₡{extraPay.toLocaleString()}</td>
                      <td className="text-right p-4">
                        <span className="text-lg font-bold text-cyan-600">₡{totalPay.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gradient-to-r from-cyan-100 to-blue-100 font-bold">
                  <td colSpan={6} className="p-4 text-right text-lg">Total Salarios:</td>
                  <td className="text-right p-4 text-xl text-cyan-700">₡{totalSalaries.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gastos de Reabastecimiento */}
        <div id="refill-costs" className="bg-white rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <Package className="w-7 h-7 text-cyan-600" />
            Gastos de Reabastecimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Total Reabastecimientos</p>
                  <p className="text-3xl font-bold text-blue-600">{todayRefills.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-10 h-10 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Costo Total</p>
                  <p className="text-3xl font-bold text-purple-600">₡{refillCosts.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-10 h-10 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Items Reabastecidos</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {todayRefills.reduce((sum, refill) => {
                      return sum + refill.itemsRefilled.reduce((itemSum, item) => itemSum + item.quantity, 0);
                    }, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {todayRefills.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-bold text-slate-700 text-lg mb-3">Detalle de Reabastecimientos:</h3>
              {todayRefills.map((refill, index) => {
                const totalItems = refill.itemsRefilled.reduce((sum, item) => sum + item.quantity, 0);
                const estimatedCost = totalItems * 2500;
                
                return (
                  <div key={index} className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-800">{refill.storageRoom}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(refill.date).toLocaleDateString()} - Por {refill.waiter}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-cyan-600">{totalItems} items</p>
                        <p className="text-sm text-slate-600">₡{estimatedCost.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {refill.itemsRefilled.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-600 flex justify-between">
                          <span>• {item.itemName}</span>
                          <span className="font-semibold">{item.quantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Botón de ayuda y guía interactiva */}
      <GuideButton onClick={() => setShowGuide(true)} />
      {showGuide && (
        <InteractiveGuide
          steps={guideSteps}
          onComplete={() => setShowGuide(false)}
          pageName="Dashboard de Métricas"
        />
      )}
    </div>
  );
}
