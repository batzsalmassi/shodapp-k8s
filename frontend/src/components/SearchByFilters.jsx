// src/components/SearchByFilters.jsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SearchByFilters = () => {
  const [filters, setFilters] = useState({
    port: '',
    country: '',
    product: '',
    os: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Token:', user.token); // Debug log
      const response = await fetch('http://localhost:5055/perform_filter_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(filters),
      });

      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      
      if (response.ok) {
        navigate('/filter-results', { state: { results: data } });
      } else {
        console.error('Error response:', data); // Debug log
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Request error:', error); // Debug log
      alert('Failed to perform search');
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
            />
          </div>
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