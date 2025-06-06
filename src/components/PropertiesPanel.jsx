import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';

const PropertiesPanel = ({
  selectedComponents,
  selectedConnection,
  components,
  connections,
  updateComponentMetric,
  updateConnectionMetric,
}) => {
  const selectedComps = components.filter((c) => selectedComponents.includes(c.id));
  const [bulkMetrics, setBulkMetrics] = useState({
    rps: '',
    peakRps: '',
    instances: '',
    storage: '',
    bandwidth: '',
    concurrentUsers: '',
    requestsPerUser: '',
    throughput: '',
    computeUnits: '',
    storageCapacity: '',
    queryRate: '',
  });

  const validateNumeric = (value, allowEmpty = true) => {
    if (allowEmpty && value === '') return true;
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const handleBulkChange = (metric, value) => {
    setBulkMetrics((prev) => ({ ...prev, [metric]: value }));
    if (
      metric === 'rps' ||
      metric === 'peakRps' ||
      metric === 'instances' ||
      metric === 'concurrentUsers' ||
      metric === 'requestsPerUser' ||
      metric === 'throughput' ||
      metric === 'computeUnits' ||
      metric === 'queryRate'
    ) {
      if (validateNumeric(value)) {
        updateComponentMetric(selectedComponents, metric, value);
      }
    } else {
      updateComponentMetric(selectedComponents, metric, value);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-[200px]">
      {(selectedComps.length > 0 || selectedConnection) && (
        <div className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            {selectedComps.length > 0
              ? `Component Properties (${selectedComps.length})`
              : 'Connection Properties'}
          </h3>
          <div className="space-y-3">
            {selectedComps.length > 0 && (
              <div>
                {selectedComps.some((comp) => comp.type === 'users') ? (
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Concurrent Users
                      </label>
                      <input
                        type="text"
                        value={bulkMetrics.concurrentUsers}
                        onChange={(e) => handleBulkChange('concurrentUsers', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 1000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Requests/User/Sec
                      </label>
                      <input
                        type="text"
                        value={bulkMetrics.requestsPerUser}
                        onChange={(e) => handleBulkChange('requestsPerUser', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 0.1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">RPS</label>
                      <input
                        type="text"
                        value={bulkMetrics.rps}
                        onChange={(e) => handleBulkChange('rps', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Peak RPS</label>
                      <input
                        type="text"
                        value={bulkMetrics.peakRps}
                        onChange={(e) => handleBulkChange('peakRps', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Instances
                      </label>
                      <input
                        type="text"
                        value={bulkMetrics.instances}
                        onChange={(e) => handleBulkChange('instances', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Storage
                      </label>
                      <input
                        type="text"
                        value={bulkMetrics.storage}
                        onChange={(e) => handleBulkChange('storage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 1TB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Bandwidth
                      </label>
                      <input
                        type="text"
                        value={bulkMetrics.bandwidth}
                        onChange={(e) => handleBulkChange('bandwidth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 10Gbps"
                      />
                    </div>
                    {selectedComps.some((comp) => ['kafka', 'message-queue'].includes(comp.type)) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Throughput (msg/s)
                        </label>
                        <input
                          type="text"
                          value={bulkMetrics.throughput}
                          onChange={(e) => handleBulkChange('throughput', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 1000"
                        />
                      </div>
                    )}
                    {selectedComps.some((comp) => comp.type === 'lambda') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Compute Units
                        </label>
                        <input
                          type="text"
                          value={bulkMetrics.computeUnits}
                          onChange={(e) => handleBulkChange('computeUnits', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 128"
                        />
                      </div>
                    )}
                    {selectedComps.some((comp) => comp.type === 'storage') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Storage Capacity
                        </label>
                        <input
                          type="text"
                          value={bulkMetrics.storageCapacity}
                          onChange={(e) => handleBulkChange('storageCapacity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 100GB"
                        />
                      </div>
                    )}
                    {selectedComps.some((comp) => comp.type === 'analytics') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Query Rate (q/s)
                        </label>
                        <input
                          type="text"
                          value={bulkMetrics.queryRate}
                          onChange={(e) => handleBulkChange('queryRate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 100"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {selectedConnection && (
              <div>
                {(() => {
                  const conn = connections.find((c) => c.id === selectedConnection);
                  return (
                    <div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Multiplier
                        </label>
                        <input
                          type="text"
                          value={conn.metrics.multiplier || ''}
                          onChange={(e) => {
                            if (validateNumeric(e.target.value)) {
                              updateConnectionMetric(
                                selectedConnection,
                                'multiplier',
                                e.target.value
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Latency
                        </label>
                        <input
                          type="text"
                          value={conn.metrics.latency || ''}
                          onChange={(e) =>
                            updateConnectionMetric(selectedConnection, 'latency', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 50ms"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;