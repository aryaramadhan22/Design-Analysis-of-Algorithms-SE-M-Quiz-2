import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Graph Data
const graphData = {
  nodes: {
    A: { x: 100, y: 250, name: "Kota A" },
    B: { x: 250, y: 100, name: "Kota B" },
    C: { x: 250, y: 400, name: "Kota C" },
    D: { x: 400, y: 250, name: "Kota D" },
    E: { x: 550, y: 100, name: "Kota E" },
    F: { x: 550, y: 400, name: "Kota F" },
    G: { x: 700, y: 250, name: "Kota G" }
  },
  edges: [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "B", to: "C", weight: 1 },
    { from: "B", to: "D", weight: 5 },
    { from: "C", to: "D", weight: 8 },
    { from: "C", to: "F", weight: 10 },
    { from: "D", to: "E", weight: 3 },
    { from: "D", to: "F", weight: 2 },
    { from: "E", to: "G", weight: 1 },
    { from: "F", to: "G", weight: 4 }
  ]
};

// Build adjacency list
const buildAdjacencyList = () => {
  const adj = {};
  Object.keys(graphData.nodes).forEach(node => {
    adj[node] = [];
  });
  graphData.edges.forEach(edge => {
    adj[edge.from].push({ node: edge.to, weight: edge.weight });
    adj[edge.to].push({ node: edge.from, weight: edge.weight });
  });
  return adj;
};

// Check connectivity with DFS
const isConnected = (adj, start, end) => {
  const visited = new Set();
  const stack = [start];
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === end) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    adj[node].forEach(neighbor => {
      if (!visited.has(neighbor.node)) {
        stack.push(neighbor.node);
      }
    });
  }
  return false;
};

// Dijkstra Algorithm
const dijkstraSteps = (adj, start, end) => {
  const steps = [];
  const distances = {};
  const previous = {};
  const pq = [];
  const visited = new Set();
  
  Object.keys(adj).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[start] = 0;
  pq.push({ node: start, distance: 0 });
  
  steps.push({
    type: 'init',
    current: start,
    distances: { ...distances },
    visited: new Set(),
    message: `Inisialisasi: Mulai dari ${start}`
  });
  
  while (pq.length > 0) {
    pq.sort((a, b) => a.distance - b.distance);
    const { node: current, distance: currentDist } = pq.shift();
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    steps.push({
      type: 'visiting',
      current,
      distances: { ...distances },
      visited: new Set(visited),
      message: `Mengunjungi ${current} dengan jarak ${currentDist}`
    });
    
    if (current === end) break;
    
    adj[current].forEach(neighbor => {
      if (!visited.has(neighbor.node)) {
        const newDist = distances[current] + neighbor.weight;
        if (newDist < distances[neighbor.node]) {
          distances[neighbor.node] = newDist;
          previous[neighbor.node] = current;
          pq.push({ node: neighbor.node, distance: newDist });
          
          steps.push({
            type: 'update',
            current,
            neighbor: neighbor.node,
            distances: { ...distances },
            visited: new Set(visited),
            message: `Update jarak ${neighbor.node}: ${newDist}`
          });
        }
      }
    });
  }
  
  const path = [];
  let current = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  steps.push({
    type: 'complete',
    path,
    distance: distances[end],
    distances: { ...distances },
    visited: new Set(visited),
    message: `Selesai! Jarak terpendek: ${distances[end]}`
  });
  
  return steps;
};

function App() {
  const [startCity, setStartCity] = useState('A');
  const [endCity, setEndCity] = useState('G');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const cities = Object.keys(graphData.nodes);
  const adj = buildAdjacencyList();
  
  useEffect(() => {
    drawGraph();
  }, [currentStep, steps]);
  
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentStepData = steps[currentStep];
    const scaleX = canvas.width / 800;
    const scaleY = canvas.height / 500;
    
    // Draw edges
    graphData.edges.forEach(edge => {
      const fromNode = graphData.nodes[edge.from];
      const toNode = graphData.nodes[edge.to];
      
      let edgeColor = '#e5e7eb';
      let lineWidth = 2;
      
      if (currentStepData?.type === 'complete' && currentStepData.path) {
        const pathIndex1 = currentStepData.path.indexOf(edge.from);
        const pathIndex2 = currentStepData.path.indexOf(edge.to);
        if (pathIndex1 !== -1 && pathIndex2 !== -1 && Math.abs(pathIndex1 - pathIndex2) === 1) {
          edgeColor = '#dc3545';
          lineWidth = 4;
        }
      }
      
      ctx.beginPath();
      ctx.moveTo(fromNode.x * scaleX, fromNode.y * scaleY);
      ctx.lineTo(toNode.x * scaleX, toNode.y * scaleY);
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      
      const midX = (fromNode.x + toNode.x) / 2 * scaleX;
      const midY = (fromNode.y + toNode.y) / 2 * scaleY;
      ctx.fillStyle = '#495057';
      ctx.fillRect(midX - 12, midY - 12, 24, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.weight, midX, midY);
    });
    
    // Draw nodes
    Object.entries(graphData.nodes).forEach(([id, node]) => {
      let fillColor = '#007bff';
      let strokeColor = '#0056b3';
      
      if (currentStepData) {
        if (currentStepData.current === id) {
          fillColor = '#ffc107';
          strokeColor = '#e0a800';
        } else if (currentStepData.visited?.has(id)) {
          fillColor = '#28a745';
          strokeColor = '#1e7e34';
        }
        
        if (currentStepData.type === 'complete' && currentStepData.path?.includes(id)) {
          fillColor = '#dc3545';
          strokeColor = '#c82333';
        }
      }
      
      const x = node.x * scaleX;
      const y = node.y * scaleY;
      
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, x, y);
      
      ctx.fillStyle = '#212529';
      ctx.font = '13px sans-serif';
      ctx.fillText(node.name, x, y + 40);
      
      if (currentStepData?.distances && currentStepData.distances[id] !== Infinity) {
        ctx.fillStyle = '#6f42c1';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`d: ${currentStepData.distances[id]}`, x, y - 35);
      }
    });
  };
  
  const startSimulation = () => {
    if (startCity === endCity) {
      alert('Kota asal dan tujuan tidak boleh sama!');
      return;
    }
    
    if (!isConnected(adj, startCity, endCity)) {
      alert('Tidak ada rute yang menghubungkan kedua kota!');
      return;
    }
    
    const allSteps = dijkstraSteps(adj, startCity, endCity);
    setSteps(allSteps);
    setCurrentStep(0);
    setIsRunning(true);
    setResult(null);
    
    let step = 0;
    const animate = () => {
      if (step < allSteps.length - 1) {
        step++;
        setCurrentStep(step);
        animationRef.current = setTimeout(animate, 1000);
      } else {
        setIsRunning(false);
        const finalStep = allSteps[allSteps.length - 1];
        setResult({
          path: finalStep.path.join(' → '),
          distance: finalStep.distance
        });
      }
    };
    
    animationRef.current = setTimeout(animate, 1000);
  };
  
  const reset = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    setIsRunning(false);
    setCurrentStep(0);
    setSteps([]);
    setResult(null);
  };
  
  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <i className="bi bi-lightning-charge-fill icon-large"></i>
            <h1 className="header-title">CityRoute Explorer</h1>
          </div>
          <p className="subtitle">Sistem Pencarian Rute Terpendek dengan Algoritma Dijkstra</p>
        </div>
        
        <div className="main-grid">
          {/* Canvas Area */}
          <div className="canvas-section">
            <div className="card">
              <h3 className="card-title">
                <i className="bi bi-diagram-3-fill"></i> Visualisasi Graf
              </h3>
              <div className="canvas-wrapper">
                <canvas ref={canvasRef} width={800} height={500} />
              </div>
              
              {/* Legend */}
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-circle blue"></div>
                  <span>Belum dikunjungi</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle yellow"></div>
                  <span>Sedang diproses</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle green"></div>
                  <span>Sudah dikunjungi</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle red"></div>
                  <span>Jalur terpendek</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Control Panel */}
          <div className="control-section">
            <div className="card">
              <h3 className="card-title">
                <i className="bi bi-gear-fill"></i> Pengaturan
              </h3>
              
              <div className="form-group">
                <label>
                  <i className="bi bi-geo-alt-fill text-success"></i> Kota Asal
                </label>
                <select 
                  value={startCity} 
                  onChange={(e) => setStartCity(e.target.value)}
                  disabled={isRunning}
                >
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city} - {graphData.nodes[city].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>
                  <i className="bi bi-flag-fill text-danger"></i> Kota Tujuan
                </label>
                <select 
                  value={endCity} 
                  onChange={(e) => setEndCity(e.target.value)}
                  disabled={isRunning}
                >
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city} - {graphData.nodes[city].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="button-group">
                <button 
                  onClick={startSimulation}
                  disabled={isRunning}
                  className="btn btn-primary"
                >
                  <i className="bi bi-play-fill"></i> Cari Rute
                </button>
                <button 
                  onClick={reset}
                  disabled={!steps.length}
                  className="btn btn-secondary"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
            
            {/* Status Panel */}
            <div className="card">
              <h3 className="card-title">
                <i className="bi bi-info-circle-fill"></i> Status
              </h3>
              
              {steps.length > 0 ? (
                <div className="status-content">
                  <div className="status-box">
                    <strong>{steps[currentStep]?.message}</strong>
                    <div className="status-meta">
                      Step {currentStep + 1} / {steps.length}
                    </div>
                  </div>
                  
                  {isRunning && (
                    <div className="loading">
                      <div className="spinner"></div>
                      <span>Proses sedang berjalan...</span>
                    </div>
                  )}
                  
                  {result && (
                    <div className="result-box">
                      <h5><i className="bi bi-check-circle-fill"></i> Rute Ditemukan!</h5>
                      <p><strong>Jalur:</strong> {result.path}</p>
                      <p><strong>Total Jarak:</strong> <span className="badge">{result.distance}</span></p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="empty-state">
                  <i className="bi bi-hand-index"></i> Pilih kota asal dan tujuan, lalu klik tombol "Cari Rute" untuk memulai.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;