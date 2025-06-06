import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Calculator, ArrowRight, Trash2, Menu, ZoomIn, ZoomOut, Download, Upload, MoreVertical } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const whiteboardRef = useRef(null);
  const nextIdRef = useRef(1);
  const toolbarHeight = 56; // Fixed toolbar height in pixels

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
      console.log('Mouse down on component:', component.id);

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

      const rect = whiteboardRef.current?.getBoundingClientRect();
      if (!rect) {
        console.error('Whiteboard ref not attached');
        return;
      }
      const offsetX = (e.clientX - rect.left - component.x) / zoomLevel;
      const offsetY = (e.clientY - rect.top - component.y) / zoomLevel;

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
                      x: (e.clientX - rect.left - comp.x) / zoomLevel,
                      y: (e.clientY - rect.top - comp.y) / zoomLevel,
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
    [connectionMode, connectionStart, selectedComponents, components, zoomLevel]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (draggedItems.length === 0) return;

      const rect = whiteboardRef.current?.getBoundingClientRect();
      if (!rect) return;

      setComponents((prev) =>
        prev.map((comp) => {
          if (!draggedItems.includes(comp.id)) return comp;
          const offset = dragOffsets[comp.id];
          const newX = (e.clientX - rect.left - offset.x * zoomLevel) / zoomLevel;
          const newY = (e.clientY - rect.top - offset.y * zoomLevel) / zoomLevel;
          return {
            ...comp,
            x: Math.max(0, Math.min(newX, rect.width / zoomLevel - comp.width)),
            y: Math.max(0, Math.min(newY, rect.height / zoomLevel - comp.height)),
          };
        })
      );
    },
    [draggedItems, dragOffsets, zoomLevel]
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
          (conn) => !selectedComponents.includes(conn.from) && !selectedComponents.includes(conn.to)
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

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    const diagram = { components, connections, nextId: nextIdRef.current };
    const blob = new Blob([JSON.stringify(diagram, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const diagram = JSON.parse(event.target.result);
        if (!diagram.components || !diagram.connections || !diagram.nextId) {
          alert('Invalid diagram file');
          return;
        }
        setComponents(diagram.components);
        setConnections(diagram.connections);
        nextIdRef.current = diagram.nextId;
      } catch (err) {
        alert('Error loading diagram: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top Toolbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-20 shadow-sm">
        <button
          className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-1 hidden md:flex">
          <button
            onClick={() => {
              setConnectionMode(!connectionMode);
              setConnectionStart(null);
            }}
            className={`p-2 rounded hover:bg-gray-100 ${connectionMode ? 'bg-green-100 text-green-700' : 'text-gray-700'}`}
            title={connectionMode ? 'Cancel Connection' : 'Add Connection'}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleCalculateTraffic}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
            title="Calculate Traffic"
          >
            <Calculator className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
            title="Download Diagram"
          >
            <Download className="w-5 h-5" />
          </button>
          <label className="p-2 rounded hover:bg-gray-100 text-gray-700 cursor-pointer">
            <Upload className="w-5 h-5" />
            <input type="file" accept=".json" onChange={handleUpload} className="hidden" title="Upload Diagram" />
          </label>
          {(selectedComponents.length > 0 || selectedConnection) && (
            <button
              onClick={deleteSelected}
              className="p-2 rounded hover:bg-red-100 text-red-700"
              title={selectedComponents.length > 0 ? `Delete Selected (${selectedComponents.length})` : 'Delete Connection'}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        {/* Mobile Menu */}
        <div className="md:hidden flex-1 flex justify-end">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {isMobileMenuOpen && (
            <div className="absolute top-14 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              <button
                onClick={() => {
                  setConnectionMode(!connectionMode);
                  setConnectionStart(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${connectionMode ? 'bg-green-100 text-green-700' : 'text-gray-700'} hover:bg-gray-100`}
              >
                <ArrowRight className="w-4 h-4" />
                {connectionMode ? 'Cancel Connection' : 'Add Connection'}
              </button>
              <button
                onClick={() => {
                  handleCalculateTraffic();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Calculator className="w-4 h-4" />
                Calculate Traffic
              </button>
              <button
                onClick={() => {
                  handleZoomIn();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ZoomIn className="w-4 h-4" />
                Zoom In
              </button>
              <button
                onClick={() => {
                  handleZoomOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ZoomOut className="w-4 h-4" />
                Zoom Out
              </button>
              <button
                onClick={() => {
                  handleDownload();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
                Download Diagram
              </button>
              <label className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Diagram
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    handleUpload(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="hidden"
                />
              </label>
              {(selectedComponents.length > 0 || selectedConnection) && (
                <button
                  onClick={() => {
                    deleteSelected();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  {selectedComponents.length > 0 ? `Delete Selected (${selectedComponents.length})` : 'Delete Connection'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-56px)]">
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
        <div className="flex-1 min-w-0 h-full">
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
            zoomLevel={zoomLevel}
            toolbarHeight={toolbarHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;