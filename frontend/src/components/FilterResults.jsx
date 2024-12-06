import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Globe, Server, Shield, Clock, Map, ArrowLeft, AlertTriangle } from 'lucide-react';

const FilterResults = () => {
  const location = useLocation();
  const results = location.state?.results || [];

  if (!results.length) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <p>No results found.</p>
        <Link to="/search-by-filters" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
          ← Return to search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          to="/search-by-filters" 
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>
        <div className="text-gray-400">
          Found {results.length} results
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.map((result, index) => (
          <div 
            key={index}
            className="bg-gray-800/50 rounded-lg border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 transition-colors"
          >
            {/* Main Info Section */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">IP Address</h3>
                      <p className="text-cyan-400 font-mono text-lg">{result.ip_str}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Server className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Organization</h3>
                      <p className="text-gray-200">{result.org || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Operating System</h3>
                      <p className="text-gray-200">{result.os || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Map className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Location</h3>
                      <p className="text-gray-200">
                        {result.location ? `${result.location.city || ''}, ${result.location.country_name || ''}` : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Last Update</h3>
                      <p className="text-gray-200">
                        {result.last_update ? new Date(result.last_update).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vulnerabilities Section */}
              {result.vulns && result.vulns.length > 0 && (
                <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-medium text-red-400">Vulnerabilities Detected</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.vulns.map((vuln, idx) => (
                      <div 
                        key={idx}
                        className="bg-gray-900/50 p-3 rounded border border-red-500/30"
                      >
                        <p className="text-red-400 font-mono">{vuln}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Ports Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Open Ports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.data?.map((port, idx) => (
                    <div 
                      key={idx}
                      className="bg-gray-900/50 p-4 rounded border border-cyan-500/30"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-cyan-400 font-mono text-lg">{port.port}</span>
                        <span className="text-xs text-gray-500 font-mono">{port.transport || 'tcp'}</span>
                      </div>
                      <p className="text-gray-300 font-medium mt-2">{port.product || 'Unknown Service'}</p>
                      {port.version && (
                        <p className="text-gray-400 text-sm mt-1">Version: {port.version}</p>
                      )}
                      {port.info && (
                        <p className="text-gray-500 text-xs mt-1">{port.info}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterResults;