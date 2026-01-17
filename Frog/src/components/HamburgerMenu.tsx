import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChefHat, Package, Droplet, ShoppingBag, Home, LogOut, User, Receipt, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { orders } = useRestaurant();

  const allMenuItems = [
    {
      id: 'home',
      name: 'Inicio',
      icon: Home,
      path: '/',
      color: 'from-slate-600 to-slate-700',
      roles: ['mesera', 'developer']
    },
    {
      id: 'active-tables',
      name: 'Mesas Activas',
      icon: Users,
      path: '/active-tables',
      color: 'from-indigo-600 to-purple-600',
      roles: ['mesera', 'developer'],
      badge: orders.filter(o => o.status !== 'paid').length
    },
    {
      id: 'express',
      name: 'Pedidos Express',
      icon: ShoppingBag,
      path: '/express',
      color: 'from-emerald-500 to-emerald-600',
      roles: ['mesera', 'developer']
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      color: 'from-purple-500 to-pink-500',
      roles: ['mesera', 'developer']
    },
    {
      id: 'cash-closure',
      name: 'Cierre de Caja',
      icon: Receipt,
      path: '/cash-closure',
      color: 'from-yellow-500 to-orange-500',
      roles: ['mesera', 'developer']
    },
    {
      id: 'refill',
      name: 'Rellenar Recámaras',
      icon: Droplet,
      path: '/refill-storage',
      color: 'from-blue-500 to-cyan-500',
      roles: ['mesera', 'developer']
    },
    {
      id: 'kitchen',
      name: 'Cocina',
      icon: ChefHat,
      path: '/kitchen',
      color: 'from-orange-500 to-red-500',
      roles: ['developer']
    },
    {
      id: 'inventory',
      name: 'Inventario',
      icon: Package,
      path: '/inventory',
      color: 'from-emerald-500 to-teal-500',
      roles: ['developer']
    },
  ];

  // Filtrar menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-white/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Menú Lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-2xl z-40 transform transition-transform duration-300 border-l-4 border-cyan-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col overflow-hidden">
          {/* Header del menú */}
          <div className="mb-6 pt-12 pb-4 border-b-2 border-cyan-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl blur opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{user?.name}</h2>
                <p className="text-sm text-slate-600 capitalize font-semibold">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Items del menú */}
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 -mr-2">{menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white shadow-xl shadow-cyan-500/50'
                      : 'bg-white hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 text-slate-700 shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/20' : 'bg-gradient-to-br from-cyan-100 to-blue-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-600'}`} />
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-1 text-left">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <div className={`min-w-[1.75rem] h-7 px-2 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                      isActive ? 'bg-white text-cyan-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                    }`}>
                      {item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-700 transition-all mb-4 border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>

          {/* Footer del menú */}
          <div className="pt-3 border-t-2 border-slate-200">
            <p className="text-xs text-slate-400 text-center font-semibold">
              FROG Restaurant © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
