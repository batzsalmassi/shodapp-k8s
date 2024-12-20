// src/components/SearchByFilters.jsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const SearchByFilters = () => {
  const [filters, setFilters] = useState({
    port: '',
    country: '',
    product: '',
    os: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate that at least one filter is provided
    const hasFilters = Object.values(filters).some(value => value.trim() !== '');
    if (!hasFilters) {
      setError('Please provide at least one search filter');
      setIsLoading(false);
      return;
    }

    try {
      const token = user?.token; // Ensure the token is available
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(`${API_URL}/perform_filter_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the token to the headers
        },
        body: JSON.stringify(filters)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Filter search failed');
      }

      navigate('/filter-results', { state: { results: data } });
    } catch (error) {
      setError(error.message || 'Failed to perform search');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          Advanced Search
        </h2>
        <p className="text-gray-400">Configure multiple parameters to perform a targeted search operation.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Port</label>
            <input
              type="text"
              name="port"
              value={filters.port}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
              placeholder="Port number..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Country</label>
            <input
              type="text"
              name="country"
              value={filters.country}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
              placeholder="Country code..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Product</label>
            <input
              type="text"
              name="product"
              value={filters.product}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
              placeholder="Product name..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Operating System</label>
            <input
              type="text"
              name="os"
              value={filters.os}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
              placeholder="OS name..."
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
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
              <span>Execute Search</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchByFilters;