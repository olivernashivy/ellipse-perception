import React from 'react';
import { Database, X, Clock, Tag, MessageCircle, MapPin, TrendingUp } from 'lucide-react';

const AdminPanel = ({ configurations, onClose, onDelete, onClearAll, getBalanceColor }) => {
  return (
    <div className="min-h-screen bg-black p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database size={32} className="text-purple-400" />
            Admin Panel
          </h1>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Close admin panel"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-lg text-white">
            Saved Configurations: <span className="font-bold text-purple-400">{configurations.length}</span>
          </div>
          <button
            onClick={onClearAll}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-white font-semibold"
          >
            Delete All
          </button>
        </div>

        <div className="grid gap-4 max-h-[70vh] overflow-y-auto">
          {configurations.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              No configurations saved yet
            </div>
          ) : (
            configurations.map((config) => (
              <div
                key={config.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 hover:from-gray-700 hover:to-gray-800 transition border border-white/10"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-blue-400" />
                      <span className="text-sm">
                        {new Date(config.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {config.emotion && (
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={16} className="text-pink-400" />
                        <span className="text-sm font-semibold text-pink-300">
                          {config.emotion}
                        </span>
                      </div>
                    )}
                    {config.notes && (
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle size={16} className="text-cyan-400" />
                        <span className="text-sm text-white/70 italic line-clamp-2">
                          "{config.notes}"
                        </span>
                      </div>
                    )}
                    {config.gps && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-green-400" />
                        <span className="text-sm font-mono">
                          {config.gps.lat}°, {config.gps.lon}°
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(config.id)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition text-white"
                    aria-label="Delete configuration"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-white">
                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                    <div className="text-yellow-300 font-semibold mb-2">Bottom-Up</div>
                    <div className="text-white/90">Major Axis: {config.bottomUp.major}px</div>
                    <div className="text-white/90">Minor Axis: {config.bottomUp.minor}px</div>
                    <div className="text-white/90">Eccentricity: {config.eccentricities.bottomUp.toFixed(3)}</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <div className="text-green-300 font-semibold mb-2">Top-Down</div>
                    <div className="text-white/90">Major Axis: {config.topDown.major}px</div>
                    <div className="text-white/90">Minor Axis: {config.topDown.minor}px</div>
                    <div className="text-white/90">Eccentricity: {config.eccentricities.topDown.toFixed(3)}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <TrendingUp size={16} />
                      Balance:
                    </span>
                    <span
                      className="font-bold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: getBalanceColor(config.balance) }}
                    >
                      {config.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
