export const calculateTraffic = (components, setComponents, connections, setConnections) => {
  try {
    const usersComponents = components.filter((comp) => comp.type === 'users');
    if (usersComponents.length === 0) {
      alert('No users component found. Add a users component to calculate traffic.');
      return;
    }

    const newComponents = components.map((comp) => ({
      ...comp,
      metrics: { ...comp.metrics, rps: comp.type === 'users' ? comp.metrics.rps : '0' },
    }));

    const newConnections = connections.map((conn) => ({
      ...conn,
      metrics: { ...conn.metrics, rps: '0' },
    }));

    const calculateRPS = (componentId, visited = new Set()) => {
      if (visited.has(componentId)) return 0; // Prevent cycles
      visited.add(componentId);

      const component = newComponents.find((c) => c.id === componentId);
      if (!component) return 0;

      if (component.type === 'users') {
        const concurrentUsers = parseFloat(component.metrics.concurrentUsers) || 0;
        const requestsPerUser = parseFloat(component.metrics.requestsPerUser) || 0;
        const rps = concurrentUsers * requestsPerUser;
        component.metrics.rps = rps.toString();
        return rps;
      }

      let totalRps = 0;
      const incomingConnections = newConnections.filter((conn) => conn.to === componentId);

      for (const conn of incomingConnections) {
        const fromRps = calculateRPS(conn.from, visited);
        const multiplier = parseFloat(conn.metrics.multiplier) || 1;
        let connRps = fromRps * multiplier;

        // Load Balancer distribution
        if (component.type === 'load-balancer') {
          const outgoingConnections = newConnections.filter(
            (outConn) => outConn.from === componentId
          );
          if (outgoingConnections.length > 0) {
            connRps = fromRps / outgoingConnections.length; // Distribute evenly
            outgoingConnections.forEach((outConn) => {
              outConn.metrics.rps = connRps.toString();
            });
          }
        } else {
          conn.metrics.rps = connRps.toString();
        }

        totalRps += connRps;
      }

      component.metrics.rps = totalRps.toString();
      return totalRps;
    };

    newComponents.forEach((comp) => calculateRPS(comp.id, new Set()));
    setComponents(newComponents);
    setConnections(newConnections);
  } catch (err) {
    console.error('Traffic calculation error:', err);
    alert('Error calculating traffic. Check input values.');
  }
};