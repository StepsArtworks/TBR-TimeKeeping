import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, logout as logoutApi, useCurrentUser } from '../lib/api';

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

  // Fetch the current user from the API
  const { user: currentUser, loading: userLoading, error: userError } = useCurrentUser();

  useEffect(() => {
    if (!userLoading) {
      if (currentUser) {
        // Update the user state with the latest data from the API
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else if (userError) {
        // If there's an error fetching the user, clear the stored user
        setUser(null);
        localStorage.removeItem('user');
        navigate(`${BASE_PATH}/login`);
      }
      setLoading(false);
    }
  }, [currentUser, userLoading, userError, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await loginApi(email, password);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      // Use replace: true to prevent going back to login page
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
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setLoading(false);
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