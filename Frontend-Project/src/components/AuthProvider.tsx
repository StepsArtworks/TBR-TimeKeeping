import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, logout as logoutApi } from '../lib/api';

// Base path for the application
const BASE_PATH = '/tbrtimekeeping';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Get the user from localStorage initially
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Check if we have a token
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify token by making an API call to get current user
    const verifyToken = async () => {
      try {
        const response = await fetch('https://api.tbrhub.com/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token is invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('https://api.tbrhub.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store the JWT token
      localStorage.setItem('authToken', data.token);
      
      // Store user data
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
        await fetch('https://api.tbrhub.com/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
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
    <AuthContext.Provider value={{ user, loading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);