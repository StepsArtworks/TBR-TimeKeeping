import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, logout as logoutApi } from '../lib/api';
import { User } from '../types';
import jwtDecode from 'jwt-decode';

// Base path for the application
const BASE_PATH = '/tbrtimekeeping';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for token and set user on initial load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Verify token expiration
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return;
        }

        // Token is valid, get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await loginApi(email, password);
      
      // Store token and user in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setLoading(false);
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);