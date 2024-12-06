// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Loader } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 space-y-8">
      <div className="text-center">
        <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Login to Shodan Sentinel
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;