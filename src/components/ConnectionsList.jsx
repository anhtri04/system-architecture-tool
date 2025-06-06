import React from 'react';
import { Trash2 } from 'lucide-react';

const ConnectionsList = ({ connections, components, selectedConnection, setSelectedConnection, deleteConnection }) => {
  return (
    <div className="p-4 border-b border-gray-200 h-64 overflow-y-auto">
      <h3 className="font-semibold text-gray-700 mb-3">Connections</h3>
      {connections.map((conn) => {
        const fromComp = components.find((c) => c.id === conn.from);
        const toComp = components.find((c) => c.id === conn.to);
        return (
          <div
            key={conn.id}
            onClick={() => setSelectedConnection(conn.id)}
            className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
              selectedConnection === conn.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            <span>
              {fromComp?.label || 'Unknown'} → {toComp?.label || 'Unknown'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConnection(conn.id);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
        })}
    </div>
  );
};

export default ConnectionsList;