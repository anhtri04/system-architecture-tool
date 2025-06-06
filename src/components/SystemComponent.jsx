import React from 'react';
import { Zap, Server, Database, Cloud, Users, Globe, Send, Mail, Box, BarChart, HardDrive } from 'lucide-react';

const iconMap = {
  Zap: Zap,
  Server: Server,
  Database: Database,
  Cloud: Cloud,
  Users: Users,
  Globe: Globe,
  Send: Send,
  Mail: Mail,
  Box: Box,
  BarChart: BarChart,
  HardDrive: HardDrive,
};

const SystemComponent = ({ component, componentTypes, draggedItems, selectedComponents, connectionMode, connectionStart, handleMouseDown, connections }) => {
  const isSelected = selectedComponents.includes(component.id);
  const isDragging = draggedItems.includes(component.id);
  const isConnectionStart = connectionStart === component.id;
  const totalRPS = component.type === 'users'
    ? component.metrics.rps || '0'
    : connections
        .filter((conn) => conn.to === component.id)
        .reduce((sum, conn) => sum + (parseFloat(conn.metrics.rps) || 0), 0)
        .toString();
  const isOverloaded = parseFloat(totalRPS) > parseFloat(component.metrics.peakRps || 'Infinity');

  const typeConfig = componentTypes[component.type] || { icon: 'Circle', color: '#000000', label: 'Unknown' };
  const IconComponent = iconMap[typeConfig.icon] || Users;

  return (
    <div
      key={component.id}
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        cursor: connectionMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
        userSelect: 'none',
      }}
      onMouseDown={(e) => handleMouseDown(e, component)}
    >
      <div
        className={`w-full h-full rounded-lg border-2 shadow-lg transition-all duration-200 ${
          isOverloaded
            ? 'animate-flicker border-red-500'
            : isSelected
            ? 'border-blue-500 shadow-blue-200'
            : isConnectionStart
            ? 'border-green-500 shadow-green-200'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{ backgroundColor: typeConfig.color + '20' }}
      >
        <div className="flex flex-col h-full p-2">
          <div className="flex items-center justify-center mb-2">
            <IconComponent className="w-6 h-6 mr-2" style={{ color: typeConfig.color }} />
            <span className="font-semibold text-sm text-gray-800">{component.label}</span>
          </div>
          <div className="flex-1 text-xs space-y-1">
            {totalRPS !== '0' && (
              <div className="text-center">
                <span className="font-medium text-blue-600">{totalRPS} RPS</span>
              </div>
            )}
            {component.metrics.instances && parseInt(component.metrics.instances) > 0 && (
              <div className="text-center">
                <span className="text-gray-600">{component.metrics.instances} instances</span>
              </div>
            )}
            {component.metrics.storage && (
              <div className="text-center">
                <span className="text-purple-600">{component.metrics.storage}</span>
              </div>
            )}
            {component.metrics.bandwidth && (
              <div className="text-center">
                <span className="text-green-600">{component.metrics.bandwidth}</span>
              </div>
            )}
            {component.metrics.throughput && (
              <div className="text-center">
                <span className="text-teal-600">{component.metrics.throughput} msg/s</span>
              </div>
            )}
            {component.metrics.computeUnits && (
              <div className="text-center">
                <span className="text-rose-600">{component.metrics.computeUnits} units</span>
              </div>
            )}
            {component.metrics.storageCapacity && (
              <div className="text-center">
                <span className="text-gray-600">{component.metrics.storageCapacity}</span>
              </div>
            )}
            {component.metrics.queryRate && (
              <div className="text-center">
                <span className="text-purple-600">{component.metrics.queryRate} q/s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemComponent;