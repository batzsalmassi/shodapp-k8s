// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      
      if (token && userId && email) {
        try {
          const response = await fetch(`${API_URL}/check_auth`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Token validation failed');
          }

          setUser({ token, id: userId, email });
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user_id);
      localStorage.setItem('email', data.email);

      setUser({
        token: data.token,
        id: data.user_id,
        email: data.email,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setUser(null);
  };

  const register = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  };

  const checkAuthStatus = async () => {
    try {
      if (!user?.token) {
        return false;
      }

      const response = await fetch(`${API_URL}/check_auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Auth check failed');
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setUser(prev => prev ? { ...prev, token: newToken } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      loading,
      checkAuthStatus,
      updateToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;