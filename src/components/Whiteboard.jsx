import React, { useState, useCallback } from 'react';
import SystemComponent from './SystemComponent.jsx';
import SystemConnection from './SystemConnection.jsx';

const Whiteboard = ({
  components,
  connections,
  componentTypes,
  whiteboardRef,
  connectionMode,
  connectionStart,
  draggedItems,
  selectedComponents,
  selectedConnection,
  handleMouseDown,
  handleWhiteboardClick,
  setSelectedComponents,
  setSelectedConnection,
}) => {
  const [selectionRect, setSelectionRect] = useState(null);

  const handleMouseDownOnWhiteboard = useCallback(
    (e) => {
      if (e.target === whiteboardRef.current && !connectionMode) {
        const rect = whiteboardRef.current.getBoundingClientRect();
        setSelectionRect({
          startX: e.clientX - rect.left,
          startY: e.clientY - rect.top,
          endX: e.clientX - rect.left,
          endY: e.clientY - rect.top,
        });
      }
      handleWhiteboardClick(e);
    },
    [whiteboardRef, connectionMode, handleWhiteboardClick]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!selectionRect) return;
      const rect = whiteboardRef.current.getBoundingClientRect();
      setSelectionRect((prev) => ({
        ...prev,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      }));
    },
    [selectionRect, whiteboardRef]
  );

  const handleMouseUp = useCallback(() => {
    if (selectionRect) {
      const { startX, startY, endX, endY } = selectionRect;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const selected = components
        .filter((comp) => {
          const compRight = comp.x + comp.width;
          const compBottom = comp.y + comp.height;
          return (
            comp.x < maxX &&
            compRight > minX &&
            comp.y < maxY &&
            compBottom > minY
          );
        })
        .map((comp) => comp.id);

      setSelectedComponents(selected);
      setSelectionRect(null);
    }
  }, [selectionRect, components, setSelectedComponents]);

  return (
    <div className="flex-1 relative overflow-auto">
      <div
        ref={whiteboardRef}
        className="w-full h-full relative bg-white select-none min-h-screen"
        onMouseDown={handleMouseDownOnWhiteboard}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4b7280" />
            </marker>
          </defs>
          {connections.map((connection) => (
            <SystemConnection
              key={connection.id}
              connection={connection}
              components={components}
              isSelected={selectedConnection === connection.id}
              onClick={() => {
                setSelectedConnection(connection.id);
                setSelectedComponents([]);
              }}
            />
          ))}
          {selectionRect && (
            <rect
              x={Math.min(selectionRect.startX, selectionRect.endX)}
              y={Math.min(selectionRect.startY, selectionRect.endY)}
              width={Math.abs(selectionRect.endX - selectionRect.startX)}
              height={Math.abs(selectionRect.endY - selectionRect.startY)}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>
        {components.map((component) => (
          <SystemComponent
            key={component.id}
            component={component}
            componentTypes={componentTypes}
            draggedItems={draggedItems}
            selectedComponents={selectedComponents}
            connectionMode={connectionMode}
            connectionStart={connectionStart}
            handleMouseDown={handleMouseDown}
            connections={connections}
          />
        ))}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🏗️</div>
              <p className="text-lg">Design your system architecture</p>
              <p className="text-sm mt-2">Add components from the sidebar and connect them together</p>
            </div>
          </div>
        )}
        {connectionMode && (
          <div className="absolute top-4 left-4 bg-green-100 border border-green-500 rounded-lg p-3">
            <p className="text-green-800 font-medium">Connection Mode Active</p>
            <p className="text-green-600 text-sm">Click two components to connect them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;