// HostResults.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Server, Globe, AlertTriangle, Cpu, Network, ArrowLeft } from 'lucide-react';

const HostResults = () => {
  const location = useLocation();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <p>No results available.</p>
        <Link to="/search-by-ip" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
          ← Return to search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          to="/search-by-ip" 
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg border border-cyan-500/30 overflow-hidden">
        <div className="p-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-200">IP Address</h3>
                  <p className="text-cyan-400 font-mono">{results.ip_str}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Server className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-200">Organization</h3>
                  <p className="text-gray-400">{results.org || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-200">Operating System</h3>
                  <p className="text-gray-400">{results.os || 'Unknown'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Network className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-200">Location</h3>
                  <p className="text-gray-400">
                    {[results.city, results.country_name].filter(Boolean).join(', ') || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-200">Last Update</h3>
                  <p className="text-gray-400">
                    {new Date(results.last_update).toLocaleString() || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vulnerabilities Section */}
          {results.vulns && results.vulns.length > 0 && (
            <div className="mt-8 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-medium text-red-400">Vulnerabilities Detected</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.vulns.map((vuln, index) => (
                  <div 
                    key={index}
                    className="bg-gray-900/50 p-3 rounded border border-red-500/30 text-red-400 font-mono text-sm"
                  >
                    {vuln}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ports Section */}
          {results.data && results.data.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-cyan-400" />
                Open Ports
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.data.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-gray-900/50 p-4 rounded border border-cyan-500/30"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-cyan-400 font-mono text-lg">{item.port}</span>
                      <span className="text-xs text-gray-500 font-mono">{item.transport || 'tcp'}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{item.product || 'Unknown Service'}</p>
                    {item.version && (
                      <p className="text-gray-500 text-xs mt-1">Version: {item.version}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostResults;