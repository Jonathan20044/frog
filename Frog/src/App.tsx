import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import { InventoryProvider } from './context/InventoryContext';
import { StorageProvider } from './context/StorageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import HamburgerMenu from './components/HamburgerMenu';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import PaymentPage from './pages/PaymentPage';
import KitchenPage from './pages/KitchenPage';
import InventoryPage from './pages/InventoryPage';
import RefillStoragePage from './pages/RefillStoragePage';
import ExpressOrderPage from './pages/ExpressOrderPage';
import CashClosurePage from './pages/CashClosurePage';

// Componente para proteger rutas
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Si el usuario no tiene permiso, redirigir según su rol
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      {user?.role !== 'admin' && <HamburgerMenu />}
      <Routes>
        {/* Rutas según rol */}
        {user?.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        )}

        {user?.role === 'mesera' && (
          <>
            <Route path="/" element={<TablesPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/express" element={<ExpressOrderPage />} />
            <Route path="/refill-storage" element={<RefillStoragePage />} />
            <Route path="/cash-closure" element={<CashClosurePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {user?.role === 'developer' && (
          <>
            <Route path="/" element={<TablesPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/refill-storage" element={<RefillStoragePage />} />
            <Route path="/express" element={<ExpressOrderPage />} />
            <Route path="/cash-closure" element={<CashClosurePage />} />
          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <InventoryProvider>
          <StorageProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </StorageProvider>
        </InventoryProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;
