import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'admin' | 'mesera' | 'developer';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios de ejemplo
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' as UserRole, name: 'Administrador' },
  { username: 'mesera', password: 'mesera123', role: 'mesera' as UserRole, name: 'Mesera' },
  { username: 'developer', password: 'dev123', role: 'developer' as UserRole, name: 'Developer' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('frog-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
      };
      setUser(userData);
      localStorage.setItem('frog-user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('frog-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
