// src/components/SearchByIP.jsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const SearchByIP = () => {
  const [ip, setIp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic IP address validation
    if (!ip.trim()) {
      setError('Please enter an IP address');
      setIsLoading(false);
      return;
    }

    try {
      const token = user?.token; // Ensure the token is available
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(`${API_URL}/perform_ip_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the token to the headers
        },
        body: JSON.stringify({ ip })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'IP search failed');
      }

      navigate('/host-results', { state: { results: data } });
    } catch (error) {
      setError(error.message || 'Failed to perform IP search');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          IP Reconnaissance
        </h2>
        <p className="text-gray-400">Enter an IP address to retrieve detailed information about the target system.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Target IP Address</label>
          <div className="relative">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
              placeholder="Enter IP address..."
              disabled={isLoading}
              pattern="^(\d{1,3}\.){3}\d{1,3}$"
              title="Please enter a valid IP address (e.g., 192.168.1.1)"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !ip.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Initialize Scan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchByIP;