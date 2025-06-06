import React from 'react';

const SystemConnection = ({ connection, components, isSelected, onClick }) => {
  const fromComponent = components.find((c) => c.id === connection.from);
  const toComponent = components.find((c) => c.id === connection.to);

  if (!fromComponent || !toComponent) return null;

  const fromX = fromComponent.x + fromComponent.width;
  const fromY = fromComponent.y + fromComponent.height / 2;
  const toX = toComponent.x;
  const toY = toComponent.y + toComponent.height / 2;

  const controlPointX = fromX + (toX - fromX) / 2;

  // Calculate animation speed based on RPS (faster for higher RPS)
  const rps = parseFloat(connection.metrics.rps) || 1;
  const animationDuration = Math.max(0.5, 5 / Math.log(rps + 1)); // Log scale for smoother scaling

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <path
        d={`M ${fromX},${fromY} C ${controlPointX},${fromY}, ${controlPointX},${toY}, ${toX},${toY}`}
        stroke={isSelected ? '#3b82f6' : '#4b7280'}
        strokeWidth={isSelected ? '4' : '2'}
        fill="none"
        markerEnd="url(#arrowhead)"
        className="animate-flow"
        style={{
          strokeDasharray: '10, 5',
          animationDuration: `${animationDuration}s`,
        }}
      />
      <text
        x={controlPointX}
        y={(fromY + toY) / 2 - 10}
        fill="#4b7280"
        fontSize="12"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
      >
        {connection.metrics.rps !== '0' && `${connection.metrics.rps} RPS`}
      </text>
    </g>
  );
};

export default SystemConnection;