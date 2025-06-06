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

const ComponentPalette = ({ componentTypes, addComponent }) => {
  return (
    <div className="p-4 border-b border-gray-200 h-[40vh] overflow-y-auto">
      <h3 className="font-semibold text-gray-700 mb-3">Components</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.entries(componentTypes).map(([type, config]) => {
          const IconComponent = iconMap[config.icon] || Users;
          return (
            <button
              key={type}
              onClick={() => addComponent(type)}
              className="flex flex-col items-center gap-1 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconComponent className="w-5 h-5" style={{ color: config.color }} />
              <span className="text-xs text-gray-600 text-center">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ComponentPalette;