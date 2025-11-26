import { useState } from 'react';
import { Infrastructure, Server, Database } from '../types/types';

interface InfrastructureStatusProps {
  infrastructure: Infrastructure;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case 'running':
      return '#10b981'; // green-500
    case 'stopped':
      return '#9ca3af'; // gray-400
    case 'starting':
      return '#f59e0b'; // yellow-500
    case 'stopping':
      return '#f97316'; // orange-500
    case 'error':
      return '#ef4444'; // red-500
    default:
      return '#d1d5db'; // gray-300
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'stopped':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'starting':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'stopping':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    api: '🔌',
    frontend: '🎨',
    backend: '⚙️',
    database: '💾',
    cache: '⚡',
    queue: '📬',
    storage: '📦',
    postgresql: '🐘',
    mongodb: '🍃',
    redis: '🔴',
    mysql: '🗄️',
    'vector-db': '🔍',
  };
  return icons[type] || '📡';
};

export const InfrastructureStatus = ({ infrastructure }: InfrastructureStatusProps) => {
  const [loadingServers, setLoadingServers] = useState<Set<string>>(new Set());
  const [loadingDatabases, setLoadingDatabases] = useState<Set<string>>(new Set());

  const handleServerAction = async (serverId: string, action: 'start' | 'stop' | 'kill' | 'restart') => {
    setLoadingServers(prev => new Set(prev).add(serverId));
    try {
      const response = await fetch(`${API_BASE_URL}/api/infrastructure/servers/${serverId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error(`Failed to ${action} server:`, errorMessage);
        alert(`Failed to ${action} server: ${errorMessage}`);
        return;
      }
      
      const result = await response.json();
      console.log(`✅ Server ${action} successful:`, result);
      // Status will update automatically via polling
    } catch (error) {
      console.error(`Error ${action}ing server:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Network error - check if server is running';
      alert(`Failed to ${action} server: ${errorMessage}`);
    } finally {
      setLoadingServers(prev => {
        const next = new Set(prev);
        next.delete(serverId);
        return next;
      });
    }
  };

  const handleDatabaseAction = async (databaseId: string, action: 'start' | 'stop' | 'kill' | 'restart') => {
    setLoadingDatabases(prev => new Set(prev).add(databaseId));
    try {
      const response = await fetch(`${API_BASE_URL}/api/infrastructure/databases/${databaseId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error(`Failed to ${action} database:`, errorMessage);
        alert(`Failed to ${action} database: ${errorMessage}`);
        return;
      }
      
      const result = await response.json();
      console.log(`✅ Database ${action} successful:`, result);
      // Status will update automatically via polling
    } catch (error) {
      console.error(`Error ${action}ing database:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Network error - check if server is running';
      alert(`Failed to ${action} database: ${errorMessage}`);
    } finally {
      setLoadingDatabases(prev => {
        const next = new Set(prev);
        next.delete(databaseId);
        return next;
      });
    }
  };

  const getServerActions = (server: Server) => {
    const actions = [];
    if (server.status === 'running') {
      actions.push({ label: 'Stop', action: 'stop', color: 'bg-yellow-500 hover:bg-yellow-600' });
      actions.push({ label: 'Kill', action: 'kill', color: 'bg-red-500 hover:bg-red-600' });
      actions.push({ label: 'Restart', action: 'restart', color: 'bg-blue-500 hover:bg-blue-600' });
    } else if (server.status === 'stopped' || server.status === 'error') {
      actions.push({ label: 'Start', action: 'start', color: 'bg-green-500 hover:bg-green-600' });
    }
    return actions;
  };

  const getDatabaseActions = (database: Database) => {
    const actions = [];
    if (database.status === 'running') {
      actions.push({ label: 'Stop', action: 'stop', color: 'bg-yellow-500 hover:bg-yellow-600' });
      actions.push({ label: 'Kill', action: 'kill', color: 'bg-red-500 hover:bg-red-600' });
      actions.push({ label: 'Restart', action: 'restart', color: 'bg-blue-500 hover:bg-blue-600' });
    } else if (database.status === 'stopped' || database.status === 'error') {
      actions.push({ label: 'Start', action: 'start', color: 'bg-green-500 hover:bg-green-600' });
    }
    return actions;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Infrastructure Status</h2>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Updated: {new Date(infrastructure.lastUpdate).toLocaleTimeString()}
        </span>
      </div>

      {/* Servers Section */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>🖥️</span> Servers ({infrastructure.servers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {infrastructure.servers.map((server) => (
            <div
              key={server.id}
              className="border-2 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow w-full overflow-hidden"
              style={{ borderColor: getStatusBorderColor(server.status) }}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg sm:text-xl flex-shrink-0">{getTypeIcon(server.type)}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{server.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{server.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${getStatusBadgeColor(server.status)}`}>
                  {server.status}
                </span>
              </div>

              {server.url && (
                <div className="mt-2 text-xs text-gray-600 break-all">
                  <span className="font-medium">URL:</span> <span className="break-all">{server.url}</span>
                </div>
              )}

              {server.port && (
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Port:</span> {server.port}
                </div>
              )}

              {(server.cpu !== undefined || server.memory !== undefined) && (
                <div className="mt-3 space-y-1">
                  {server.cpu !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>CPU</span>
                        <span>{server.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${server.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {server.memory !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Memory</span>
                        <span>{server.memory}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${server.memory > 80 ? 'bg-red-500' : server.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${server.memory}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {server.uptime && (
                <div className="mt-2 text-xs text-gray-500">
                  Uptime: {server.uptime} hours
                </div>
              )}

              {/* Server Control Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1.5">
                  {getServerActions(server).map(({ label, action, color }) => (
                    <button
                      key={action}
                      onClick={() => handleServerAction(server.id, action as any)}
                      disabled={loadingServers.has(server.id) || server.status === 'starting' || server.status === 'stopping'}
                      className={`px-2 py-1 text-xs font-medium text-white rounded transition-colors ${color} ${
                        loadingServers.has(server.id) || server.status === 'starting' || server.status === 'stopping'
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      title={`${label} ${server.name}`}
                    >
                      {loadingServers.has(server.id) ? '...' : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Databases Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>🗄️</span> Databases ({infrastructure.databases.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {infrastructure.databases.map((db) => (
            <div
              key={db.id}
              className="border-2 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow w-full overflow-hidden"
              style={{ borderColor: getStatusBorderColor(db.status) }}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg sm:text-xl flex-shrink-0">{getTypeIcon(db.type)}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{db.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{db.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${getStatusBadgeColor(db.status)}`}>
                  {db.status}
                </span>
              </div>

              {db.host && (
                <div className="mt-2 text-xs text-gray-600 break-all">
                  <span className="font-medium">Host:</span> {db.host}
                  {db.port && `:${db.port}`}
                </div>
              )}

              {db.connections !== undefined && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Connections:</span> {db.connections}
                </div>
              )}

              {db.size && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Size:</span> {db.size}
                </div>
              )}

              {db.lastBackup && (
                <div className="mt-2 text-xs text-gray-500">
                  Last backup: {new Date(db.lastBackup).toLocaleDateString()}
                </div>
              )}

              {/* Database Control Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1.5">
                  {getDatabaseActions(db).map(({ label, action, color }) => (
                    <button
                      key={action}
                      onClick={() => handleDatabaseAction(db.id, action as any)}
                      disabled={loadingDatabases.has(db.id) || db.status === 'starting' || db.status === 'stopping'}
                      className={`px-2 py-1 text-xs font-medium text-white rounded transition-colors ${color} ${
                        loadingDatabases.has(db.id) || db.status === 'starting' || db.status === 'stopping'
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      title={`${label} ${db.name}`}
                    >
                      {loadingDatabases.has(db.id) ? '...' : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {infrastructure.servers.filter(s => s.status === 'running').length}
            </div>
            <div className="text-xs text-gray-600">Servers Running</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {infrastructure.databases.filter(d => d.status === 'running').length}
            </div>
            <div className="text-xs text-gray-600">Databases Running</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {infrastructure.servers.filter(s => s.status === 'error').length + infrastructure.databases.filter(d => d.status === 'error').length}
            </div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {infrastructure.servers.length + infrastructure.databases.length}
            </div>
            <div className="text-xs text-gray-600">Total Services</div>
          </div>
        </div>
      </div>
    </div>
  );
};

