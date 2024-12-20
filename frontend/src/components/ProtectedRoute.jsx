// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthStatus(false);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/check_auth`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Authentication check failed');
        }

        setAuthStatus(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthStatus(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!authStatus) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;