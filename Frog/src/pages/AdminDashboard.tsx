import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Users, TrendingUp, DollarSign, Package, ShoppingBag, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    {
      title: 'Total Usuarios',
      value: '3',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Órdenes Hoy',
      value: '24',
      icon: ShoppingBag,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Ventas del Día',
      value: '$4,850',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Items Inventario',
      value: '28',
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                <ChefHat className="w-8 h-8" />
                Panel de Administración - FROG
              </h1>
              <p className="text-emerald-100">Bienvenido/a, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold transition shadow-md"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-slate-700" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-slate-600 text-sm font-semibold mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <ChefHat className="w-9 h-9 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido al Panel de Administración!</h2>
              <p className="text-slate-600">Aquí podrás gestionar todo el sistema FROG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-l-4 border-emerald-600">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Control de Personal
              </h3>
              <p className="text-sm text-slate-600">
                Gestiona los usuarios del sistema, asigna roles y permisos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-l-4 border-blue-600">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Reportes y Análisis
              </h3>
              <p className="text-sm text-slate-600">
                Visualiza estadísticas de ventas, órdenes y rendimiento del restaurante.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-l-4 border-purple-600">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Gestión de Inventario
              </h3>
              <p className="text-sm text-slate-600">
                Monitorea el stock, alertas de inventario bajo y control de suministros.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-l-4 border-orange-600">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                Configuración General
              </h3>
              <p className="text-sm text-slate-600">
                Administra mesas, áreas, menú y configuraciones del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">🚀 Funcionalidades en Desarrollo</h3>
          <p className="text-emerald-100 mb-4">
            Este panel está en construcción. Próximamente podrás acceder a todas las funcionalidades administrativas.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Reportes de Ventas</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Gestión de Usuarios</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Configuración de Menú</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Análisis de Datos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
