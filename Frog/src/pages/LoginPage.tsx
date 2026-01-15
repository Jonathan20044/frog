import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <ChefHat className="w-14 h-14 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">FROG</h1>
          <p className="text-emerald-100 text-lg">Sistema de Gestión de Restaurant</p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none transition"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </form>

          {/* Usuarios de prueba */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-3 text-center">
              Usuarios de prueba:
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-bold text-slate-700">👨‍💼 Admin</p>
                <p className="text-slate-600">Usuario: <code className="bg-slate-200 px-2 py-0.5 rounded">admin</code> / Contraseña: <code className="bg-slate-200 px-2 py-0.5 rounded">admin123</code></p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-bold text-slate-700">👩‍🍳 Mesera</p>
                <p className="text-slate-600">Usuario: <code className="bg-slate-200 px-2 py-0.5 rounded">mesera</code> / Contraseña: <code className="bg-slate-200 px-2 py-0.5 rounded">mesera123</code></p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-bold text-slate-700">💻 Developer</p>
                <p className="text-slate-600">Usuario: <code className="bg-slate-200 px-2 py-0.5 rounded">developer</code> / Contraseña: <code className="bg-slate-200 px-2 py-0.5 rounded">dev123</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-emerald-100 text-sm mt-6">
          © 2026 FROG Restaurant. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
