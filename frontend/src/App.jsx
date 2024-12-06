import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Search, Globe, Terminal, Activity, LogOut } from 'lucide-react';
import SearchByIP from './components/SearchByIP';
import SearchByFilters from './components/SearchByFilters';
import HostResults from './components/HostResults';
import FilterResults from './components/FilterResults';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 border-b border-cyan-500/30 shadow-lg shadow-cyan-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              SHODAN SENTINEL
            </span>
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/search-by-ip" className="hover:text-cyan-400 transition-colors flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>IP Search</span>
              </Link>
              <Link to="/search-by-filters" className="hover:text-cyan-400 transition-colors flex items-center space-x-2">
                <Terminal className="w-4 h-4" />
                <span>Advanced Search</span>
              </Link>
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-cyan-400 transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          SHODAN SENTINEL
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Advanced reconnaissance platform powered by Shodan. Discover, analyze, and monitor internet-connected devices worldwide.
        </p>
      </div>
      
      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Link to="/search-by-ip"
            className="group relative overflow-hidden rounded-lg bg-gray-800 p-6 hover:bg-gray-750 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/60">
            <div className="flex items-center space-x-4">
              <Globe className="w-8 h-8 text-cyan-400" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">IP Reconnaissance</h3>
                <p className="text-gray-400">Detailed analysis of specific IP addresses and their exposed services.</p>
              </div>
            </div>
            <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/20 transition-all duration-300 rounded-lg"></div>
          </Link>

          <Link to="/search-by-filters"
            className="group relative overflow-hidden rounded-lg bg-gray-800 p-6 hover:bg-gray-750 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/60">
            <div className="flex items-center space-x-4">
              <Activity className="w-8 h-8 text-cyan-400" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Search</h3>
                <p className="text-gray-400">Multi-parameter search with filters for precise target identification.</p>
              </div>
            </div>
            <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/20 transition-all duration-300 rounded-lg"></div>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          <p className="text-gray-300 text-lg">
            Sign in to start exploring the cyber landscape
          </p>
          <div className="flex space-x-4">
            <Link 
              to="/login" 
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-gray-100">
          <NavigationBar />

          <main className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/search-by-ip" element={
                <ProtectedRoute>
                  <SearchByIP />
                </ProtectedRoute>
              } />
              <Route path="/search-by-filters" element={
                <ProtectedRoute>
                  <SearchByFilters />
                </ProtectedRoute>
              } />
              <Route path="/host-results" element={
                <ProtectedRoute>
                  <HostResults />
                </ProtectedRoute>
              } />
              <Route path="/filter-results" element={
                <ProtectedRoute>
                  <FilterResults />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;