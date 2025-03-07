import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, logout as logoutApi } from '../lib/api';

interface AuthContextType {
  user: any;
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

function getCurrentUser() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Invalid token format
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }

    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token is expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }

    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing token:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(() => getCurrentUser());

  useEffect(() => {
    // Verify token on mount
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setUser(null);
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    } else {
      setUser(currentUser);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      
      // Store the JWT token
      localStorage.setItem('authToken', response.token);
      
      // Store user data
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      navigate('/', { replace: true });
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Call logout API if token exists
      if (token) {
        await logoutApi();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login: handleLogin, 
      logout: handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);