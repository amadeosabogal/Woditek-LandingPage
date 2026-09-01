import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
  id: number;
  email: string;
  rol: string;
  rol_id: number;
  nombre: string;
  apellido: string;
  empresa_id: number;
  permisos: string[];
}

interface AuthContextType {
  user: UserPayload | null;
  hasPermiso: (permiso: string) => boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<UserPayload>(token);
          if ((decoded as any).exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            // Fetch updated profile
            const baseUrl = import.meta.env.VITE_URL_BASE || 'http://localhost:3007';
            const response = await fetch(`${baseUrl}/api/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('token', data.token);
              setUser({
                ...data.user,
                permisos: data.user.permisos || []
              });
            } else if (response.status === 401 || response.status === 403) {
              // Account deactivated or invalid token — force logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            } else {
              // Other errors (5xx) — fallback to decoded token so UI stays up
              setUser({
                ...decoded,
                permisos: decoded.permisos || []
              });
            }
          }
        } catch (error) {
          console.error("Invalid token format or API error", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode<UserPayload>(token);
      setUser({
        ...decoded,
        permisos: decoded.permisos || []
      });
    } catch (e) {
      // Fallback
      setUser({
        ...userData,
        permisos: userData.permisos || []
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Por compatibilidad previa
    setUser(null);
  };

  const hasPermiso = (permiso: string) => {
    return true; // Bypass de permisos para el proyecto Wimprove (Acceso total)
  };

  return (
    <AuthContext.Provider value={{ user, hasPermiso, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
