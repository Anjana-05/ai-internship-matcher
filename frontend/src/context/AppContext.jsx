import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        // Clear invalid stored data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Attach axios interceptors to reflect network activity in global loading state and toasts
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      setLoading(true);
      return config;
    }, (error) => {
      setLoading(false);
      return Promise.reject(error);
    });

    const resInterceptor = api.interceptors.response.use((response) => {
      setLoading(false);
      return response;
    }, (error) => {
      setLoading(false);
      const message = error?.response?.data?.message || error.message || 'An error occurred';
      showToast(message, 'error');
      return Promise.reject(error);
    });

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    showToast("Logged in successfully!", "success");
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    showToast("Logged out successfully", "success");
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      login,
      logout,
      loading,
      setLoading,
      toast,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
