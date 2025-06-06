import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Calculator, ArrowRight, Trash2, Menu } from 'lucide-react';
import ComponentPalette from '../components/ComponentPalette.jsx';
import ConnectionsList from '../components/ConnectionsList.jsx';
import PropertiesPanel from '../components/PropertiesPanel.jsx';
import Whiteboard from '../components/Whiteboard.jsx';
import { calculateTraffic } from '../utils/trafficCalculation.js';

const componentTypes = {
  'load-balancer': { icon: 'Zap', color: '#8b5cf6', label: 'Load Balancer' },
  'web-server': { icon: 'Server', color: '#3b82f6', label: 'Web Server' },
  'app-server': { icon: 'Server', color: '#10b981', label: 'App Server' },
  'database': { icon: 'Database', color: '#ef4444', label: 'Database' },
  'cache': { icon: 'Database', color: '#f59e0b', label: 'Cache' },
  'cdn': { icon: 'Cloud', color: '#6366f1', label: 'CDN' },
  'users': { icon: 'Users', color: '#8b5cf6', label: 'Users' },
  'api-gateway': { icon: 'Globe', color: '#ec4899', label: 'API Gateway' },
  'kafka': { icon: 'Send', color: '#06b6d4', label: 'Kafka' },
  'message-queue': { icon: 'Mail', color: '#f97316', label: 'Message Queue' },
  'microservice': { icon: 'Box', color: '#a3e635', label: 'Microservice' },
  'lambda': { icon: 'Zap', color: '#f43f5e', label: 'Lambda Function' },
  'container': { icon: 'Box', color: '#14b8a6', label: 'Container' },
  'analytics': { icon: 'BarChart', color: '#8b5cf6', label: 'Analytics Service' },
  'storage': { icon: 'HardDrive', color: '#6b7280', label: 'Storage Service' },
};

const Home = () => {
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedItems, setDraggedItems] = useState([]);
  const [dragOffsets, setDragOffsets] = useState({});
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const whiteboardRef = useRef(null);
  const nextIdRef = useRef(1);

  const addComponent = (type) => {
    const newComponent = {
      id: nextIdRef.current++,
      type,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 120,
      height: 80,
      label: componentTypes[type].label,
      metrics: {
        rps: type === 'users' ? '1000' : '',
        peakRps: '5000',
        latency: '',
        storage: ['database', 'storage'].includes(type) ? '1TB' : '',
        instances: ['server', 'microservice', 'container'].includes(type) ? '3' : '',
        bandwidth: type === 'cdn' ? '10Gbps' : '',
        throughput: ['kafka', 'message-queue'].includes(type) ? '1000' : '',
        computeUnits: type === 'lambda' ? '128' : '',
        storageCapacity: type === 'storage' ? '100GB' : '',
        queryRate: type === 'analytics' ? '100' : '',
        ...(type === 'users' ? { concurrentUsers: '1000000', requestsPerUser: '0.1' } : {}),
      },
    };
    setComponents((prev) => [...prev, newComponent]);
  };

  const addConnection = (fromId, toId, metrics = {}) => {
    const newConnection = {
      id: nextIdRef.current++,
      from: fromId,
      to: toId,
      metrics: {
        rps: '',
        latency: '50ms',
        bandwidth: '100MB/s',
        multiplier: '1',
        ...metrics,
      },
    };
    setConnections((prev) => [...prev, newConnection]);
  };

  const handleMouseDown = useCallback(
    (e, component) => {
      e.preventDefault();
      e.stopPropagation();

      if (connectionMode) {
        if (!connectionStart) {
          setConnectionStart(component.id);
        } else if (connectionStart !== component.id) {
          addConnection(connectionStart, component.id);
          setConnectionStart(null);
          setConnectionMode(false);
        }
        return;
      }

      const rect = whiteboardRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - component.x;
      const offsetY = e.clientY - rect.top - component.y;

      if (e.ctrlKey) {
        setSelectedComponents((prev) =>
          prev.includes(component.id) ? prev : [...prev, component.id]
        );
      } else if (e.shiftKey) {
        setSelectedComponents((prev) =>
          prev.includes(component.id)
            ? prev.filter((id) => id !== component.id)
            : [...prev, component.id]
        );
      } else {
        if (!selectedComponents.includes(component.id)) {
          setSelectedComponents([component.id]);
        }
        setDraggedItems(selectedComponents.includes(component.id) ? selectedComponents : [component.id]);
        setDragOffsets(
          selectedComponents.includes(component.id)
            ? selectedComponents.reduce(
                (acc, id) => {
                  const comp = components.find((c) => c.id === id);
                  return {
                    ...acc,
                    [id]: {
                      x: e.clientX - rect.left - comp.x,
                      y: e.clientY - rect.top - comp.y,
                    },
                  };
                },
                { [component.id]: { x: offsetX, y: offsetY } }
              )
            : { [component.id]: { x: offsetX, y: offsetY } }
        );
      }
      setSelectedConnection(null);
    },
    [connectionMode, connectionStart, selectedComponents, components]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (draggedItems.length === 0) return;

      const rect = whiteboardRef.current.getBoundingClientRect();
      setComponents((prev) =>
        prev.map((comp) => {
          if (!draggedItems.includes(comp.id)) return comp;
          const offset = dragOffsets[comp.id];
          const newX = e.clientX - rect.left - offset.x;
          const newY = e.clientY - rect.top - offset.y;
          return {
            ...comp,
            x: Math.max(0, Math.min(newX, rect.width - comp.width)),
            y: Math.max(0, Math.min(newY, rect.height - comp.height)),
          };
        })
      );
    },
    [draggedItems, dragOffsets]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedItems([]);
    setDragOffsets({});
  }, []);

  useEffect(() => {
    if (draggedItems.length > 0) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedItems, handleMouseMove, handleMouseUp]);

  const handleWhiteboardClick = (e) => {
    if (e.target === whiteboardRef.current) {
      setSelectedComponents([]);
      setSelectedConnection(null);
      if (connectionMode) {
        setConnectionMode(false);
        setConnectionStart(null);
      }
    }
  };

  const deleteSelected = () => {
    if (selectedComponents.length > 0) {
      setComponents((prev) => prev.filter((comp) => !selectedComponents.includes(comp.id)));
      setConnections((prev) =>
        prev.filter(
          (conn) => !selectedComponents.includes(conn.from) && !selectedComponents.includes(comp.to)
        )
      );
      setSelectedComponents([]);
    }
    if (selectedConnection) {
      setConnections((prev) => prev.filter((conn) => conn.id !== selectedConnection));
      setSelectedConnection(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' && (selectedComponents.length > 0 || selectedConnection)) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponents, selectedConnection]);

  const updateComponentMetric = (ids, metric, value) => {
    setComponents((prev) =>
      prev.map((comp) =>
        ids.includes(comp.id) ? { ...comp, metrics: { ...comp.metrics, [metric]: value } } : comp
      )
    );
  };

  const updateConnectionMetric = (id, metric, value) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, metrics: { ...conn.metrics, [metric]: value } } : conn))
    );
  };

  const handleCalculateTraffic = () => {
    calculateTraffic(components, setComponents, connections, setConnections);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <button
        className="md:hidden p-4 bg-gray-800 text-white flex items-center gap-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-5 h-5" />
        Toggle Sidebar
      </button>
      <div
        className={`w-full md:w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 absolute md:static h-full z-10`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            System Design Tool
          </h1>
        </div>
        <ComponentPalette componentTypes={componentTypes} addComponent={addComponent} />
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Tools</h3>
          <button
            onClick={() => {
              setConnectionMode(!connectionMode);
              setConnectionStart(null);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              connectionMode ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            {connectionMode ? 'Cancel Connection' : 'Add Connection'}
          </button>
          <button
            onClick={handleCalculateTraffic}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-2"
          >
            <Calculator className="w-4 h-4" />
            Calculate Traffic
          </button>
          {(selectedComponents.length > 0 || selectedConnection) && (
            <button
              onClick={deleteSelected}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mt-2"
            >
              <Trash2 className="w-4 h-4" />
              {selectedComponents.length > 0
                ? `Delete Selected (${selectedComponents.length})`
                : 'Delete Connection'}
            </button>
          )}
        </div>
        <ConnectionsList
          connections={connections}
          components={components}
          selectedConnection={selectedConnection}
          setSelectedConnection={setSelectedConnection}
          deleteConnection={(id) => {
            setConnections((prev) => prev.filter((conn) => conn.id !== id));
            setSelectedConnection(null);
          }}
        />
        <PropertiesPanel
          selectedComponents={selectedComponents}
          selectedConnection={selectedConnection}
          components={components}
          connections={connections}
          updateComponentMetric={updateComponentMetric}
          updateConnectionMetric={updateConnectionMetric}
        />
      </div>
      <Whiteboard
        components={components}
        connections={connections}
        componentTypes={componentTypes}
        whiteboardRef={whiteboardRef}
        connectionMode={connectionMode}
        connectionStart={connectionStart}
        draggedItems={draggedItems}
        selectedComponents={selectedComponents}
        selectedConnection={selectedConnection}
        handleMouseDown={handleMouseDown}
        handleWhiteboardClick={handleWhiteboardClick}
        setSelectedComponents={setSelectedComponents}
        setSelectedConnection={setSelectedConnection}
      />
    </div>
  );
};

export default Home;