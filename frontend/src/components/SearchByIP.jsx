// src/components/SearchByIP.jsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SearchByIP = () => {
  const [ip, setIp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Token:', user.token); // Debug log
      const response = await fetch('http://localhost:5055/perform_ip_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ ip }),
      });

      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      
      if (response.ok) {
        navigate('/host-results', { state: { results: data } });
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          IP Reconnaissance
        </h2>
        <p className="text-gray-400">Enter an IP address to retrieve detailed information about the target system.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Target IP Address</label>
          <div className="relative">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500 text-white"
              placeholder="Enter IP address..."
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
              <span>Initialize Scan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchByIP;