import React, { useState } from 'react';
import { RefreshCw, Plus, Trash2, Shield } from 'lucide-react';

interface ExchangeConnection {
  id: string;
  name: string;
  apiKey: string;
  status: 'connected' | 'error' | 'syncing';
  lastSync: string;
}

export const ExchangeSyncPage: React.FC = () => {
  const [connections, setConnections] = useState<ExchangeConnection[]>([
    {
      id: '1',
      name: 'Binance',
      apiKey: '**********************a8f9',
      status: 'connected',
      lastSync: '2 minutes ago',
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: 'Binance',
    apiKey: '',
    secretKey: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!newConnection.apiKey || !newConnection.secretKey) return;

    setIsConnecting(true);
    // Simulate API connection
    setTimeout(() => {
      const newConn: ExchangeConnection = {
        id: Date.now().toString(),
        name: newConnection.name,
        apiKey: '**********************' + newConnection.apiKey.slice(-4),
        status: 'connected',
        lastSync: 'Just now',
      };
      setConnections([...connections, newConn]);
      setIsConnecting(false);
      setShowAddModal(false);
      setNewConnection({ name: 'Binance', apiKey: '', secretKey: '' });
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  const handleSync = (id: string) => {
    setConnections(connections.map(c => 
      c.id === id ? { ...c, status: 'syncing' } : c
    ));
    
    setTimeout(() => {
      setConnections(connections.map(c => 
        c.id === id ? { ...c, status: 'connected', lastSync: 'Just now' } : c
      ));
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-emerald-500/25">
          <RefreshCw className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Exchange Sync</h1>
        </div>
        <p className="text-gray-400 text-lg">Automatically import your trades from major exchanges</p>
      </div>

      {/* Security Note */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-blue-400 font-bold mb-1">Security First</h3>
          <p className="text-blue-200/80 text-sm">
            We only require <strong>Read-Only</strong> API keys. Never enable withdrawal permissions. 
            Your keys are encrypted before being stored.
          </p>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Connected Exchanges</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Connect Exchange
          </button>
        </div>

        <div className="divide-y divide-slate-700">
          {connections.map((conn) => (
            <div key={conn.id} className="p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white">
                  {conn.name[0]}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {conn.name}
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      conn.status === 'connected' ? 'bg-green-900 text-green-400' : 
                      conn.status === 'syncing' ? 'bg-blue-900 text-blue-400' : 'bg-red-900 text-red-400'
                    }`}>
                      {conn.status === 'syncing' ? 'Syncing...' : conn.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    API Key: {conn.apiKey} • Last sync: {conn.lastSync}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSync(conn.id)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Sync Now"
                >
                  <RefreshCw className={`w-5 h-5 ${conn.status === 'syncing' ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => handleDelete(conn.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Remove Connection"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {connections.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <p>No exchanges connected yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Connection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Connect Exchange</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Exchange</label>
                <select
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Binance">Binance</option>
                  <option value="Coinbase">Coinbase</option>
                  <option value="Bybit">Bybit</option>
                  <option value="Kraken">Kraken</option>
                  <option value="KuCoin">KuCoin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">API Key</label>
                <input
                  type="text"
                  value={newConnection.apiKey}
                  onChange={(e) => setNewConnection({ ...newConnection, apiKey: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Paste your API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Secret Key</label>
                <input
                  type="password"
                  value={newConnection.secretKey}
                  onChange={(e) => setNewConnection({ ...newConnection, secretKey: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Paste your Secret Key"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!newConnection.apiKey || !newConnection.secretKey || isConnecting}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeSyncPage;
