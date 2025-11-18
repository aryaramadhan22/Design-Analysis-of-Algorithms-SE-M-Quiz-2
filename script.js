// Graph Data Structure
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

// Build Adjacency List from Graph Data
function buildAdjacencyList() {
    const adj = {};
    
    // Initialize empty arrays for each node
    Object.keys(graphData.nodes).forEach(node => {
        adj[node] = [];
    });
    
    // Add edges (bidirectional)
    graphData.edges.forEach(edge => {
        adj[edge.from].push({ node: edge.to, weight: edge.weight });
        adj[edge.to].push({ node: edge.from, weight: edge.weight });
    });
    
    return adj;
}

// Check if path exists between two nodes using DFS
function isConnected(adj, start, end) {
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
}

// Dijkstra Algorithm with Step-by-Step Recording
function dijkstraSteps(adj, start, end) {
    const steps = [];
    const distances = {};
    const previous = {};
    const pq = []; // Priority queue
    const visited = new Set();
    
    // Initialize distances
    Object.keys(adj).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[start] = 0;
    pq.push({ node: start, distance: 0 });
    
    // Record initialization step
    steps.push({
        type: 'init',
        current: start,
        distances: { ...distances },
        visited: new Set(),
        message: `Inisialisasi: Mulai dari ${start}`
    });
    
    // Main Dijkstra loop
    while (pq.length > 0) {
        // Sort priority queue by distance (ascending)
        pq.sort((a, b) => a.distance - b.distance);
        const { node: current, distance: currentDist } = pq.shift();
        
        // Skip if already visited
        if (visited.has(current)) continue;
        visited.add(current);
        
        // Record visiting step
        steps.push({
            type: 'visiting',
            current,
            distances: { ...distances },
            visited: new Set(visited),
            message: `Mengunjungi ${current} dengan jarak ${currentDist}`
        });
        
        // Stop if we reached the destination
        if (current === end) break;
        
        // Check all neighbors
        adj[current].forEach(neighbor => {
            if (!visited.has(neighbor.node)) {
                const newDist = distances[current] + neighbor.weight;
                
                // Update distance if shorter path found
                if (newDist < distances[neighbor.node]) {
                    distances[neighbor.node] = newDist;
                    previous[neighbor.node] = current;
                    pq.push({ node: neighbor.node, distance: newDist });
                    
                    // Record update step
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
    
    // Reconstruct path
    const path = [];
    let current = end;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // Record completion step
    steps.push({
        type: 'complete',
        path,
        distance: distances[end],
        distances: { ...distances },
        visited: new Set(visited),
        message: `Selesai! Jarak terpendek: ${distances[end]}`
    });
    
    return steps;
}

// Canvas Setup and Drawing
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit container
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, 800);
    canvas.width = size;
    canvas.height = size * 0.625; // Maintain aspect ratio (500/800)
}

// Initialize canvas size
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    drawGraph();
});

// Current animation state
let currentStep = null;

// Draw the graph on canvas
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scaleX = canvas.width / 800;
    const scaleY = canvas.height / 500;
    
    // Draw Edges
    graphData.edges.forEach(edge => {
        const fromNode = graphData.nodes[edge.from];
        const toNode = graphData.nodes[edge.to];
        
        let edgeColor = '#e5e7eb';
        let lineWidth = 2;
        
        // Highlight path edges in red
        if (currentStep?.type === 'complete' && currentStep.path) {
            const pathIndex1 = currentStep.path.indexOf(edge.from);
            const pathIndex2 = currentStep.path.indexOf(edge.to);
            if (pathIndex1 !== -1 && pathIndex2 !== -1 && Math.abs(pathIndex1 - pathIndex2) === 1) {
                edgeColor = '#dc3545';
                lineWidth = 4;
            }
        }
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromNode.x * scaleX, fromNode.y * scaleY);
        ctx.lineTo(toNode.x * scaleX, toNode.y * scaleY);
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        
        // Draw weight label
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
    
    // Draw Nodes
    Object.entries(graphData.nodes).forEach(([id, node]) => {
        let fillColor = '#007bff'; // Blue - unvisited
        let strokeColor = '#0056b3';
        
        // Color based on current step state
        if (currentStep) {
            if (currentStep.current === id) {
                fillColor = '#ffc107'; // Yellow - current
                strokeColor = '#e0a800';
            } else if (currentStep.visited?.has(id)) {
                fillColor = '#28a745'; // Green - visited
                strokeColor = '#1e7e34';
            }
            
            // Red for final path
            if (currentStep.type === 'complete' && currentStep.path?.includes(id)) {
                fillColor = '#dc3545';
                strokeColor = '#c82333';
            }
        }
        
        const x = node.x * scaleX;
        const y = node.y * scaleY;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw node ID
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(id, x, y);
        
        // Draw city name
        ctx.fillStyle = '#212529';
        ctx.font = '13px sans-serif';
        ctx.fillText(node.name, x, y + 40);
        
        // Draw distance label
        if (currentStep?.distances && currentStep.distances[id] !== Infinity) {
            ctx.fillStyle = '#6f42c1';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`d: ${currentStep.distances[id]}`, x, y - 35);
        }
    });
}

// Initial draw
drawGraph();

// Animation Control Variables
let animationTimeout = null;
let isRunning = false;
let allSteps = [];
let stepIndex = 0;

// Get DOM elements
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const startCity = document.getElementById('startCity');
const endCity = document.getElementById('endCity');
const statusContainer = document.getElementById('statusContainer');

// Update status display
function updateStatus(step) {
    let html = '';
    
    if (step) {
        html = `
            <div class="status-box">
                <strong><i class="bi bi-info-circle me-2"></i>${step.message}</strong>
                <div class="mt-2 small text-muted">
                    Step ${stepIndex + 1} / ${allSteps.length}
                </div>
            </div>
        `;
        
        // Show spinner while running
        if (isRunning) {
            html += `
                <div class="d-flex align-items-center text-primary">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    <span>Proses sedang berjalan...</span>
                </div>
            `;
        }
        
        // Show result box when complete
        if (step.type === 'complete') {
            html += `
                <div class="result-box">
                    <h5 class="text-success mb-3">
                        <i class="bi bi-check-circle-fill me-2"></i>Rute Ditemukan!
                    </h5>
                    <p class="mb-2">
                        <strong>Jalur:</strong> ${step.path.join(' → ')}
                    </p>
                    <p class="mb-0">
                        <strong>Total Jarak:</strong> 
                        <span class="badge bg-success fs-6">${step.distance}</span>
                    </p>
                </div>
            `;
        }
    } else {
        // Default message
        html = `
            <p class="text-muted">
                <i class="bi bi-hand-index me-2"></i>
                Pilih kota asal dan tujuan, lalu klik tombol "Cari Rute" untuk memulai.
            </p>
        `;
    }
    
    statusContainer.innerHTML = html;
}

// Animation loop
function animate() {
    if (stepIndex < allSteps.length) {
        currentStep = allSteps[stepIndex];
        drawGraph();
        updateStatus(currentStep);
        stepIndex++;
        
        // Continue animation if not finished
        if (stepIndex < allSteps.length) {
            animationTimeout = setTimeout(animate, 1000);
        } else {
            // Animation complete
            isRunning = false;
            startBtn.disabled = false;
            startCity.disabled = false;
            endCity.disabled = false;
        }
    }
}

// Start button event listener
startBtn.addEventListener('click', () => {
    const start = startCity.value;
    const end = endCity.value;
    
    // Validation: same city
    if (start === end) {
        alert('Kota asal dan tujuan tidak boleh sama!');
        return;
    }
    
    const adj = buildAdjacencyList();
    
    // Validation: check connectivity
    if (!isConnected(adj, start, end)) {
        alert('Tidak ada rute yang menghubungkan kedua kota!');
        return;
    }
    
    // Run Dijkstra algorithm
    allSteps = dijkstraSteps(adj, start, end);
    stepIndex = 0;
    isRunning = true;
    
    // Disable controls during animation
    startBtn.disabled = true;
    startCity.disabled = true;
    endCity.disabled = true;
    
    // Start animation
    animate();
});

// Reset button event listener
resetBtn.addEventListener('click', () => {
    // Clear timeout if running
    if (animationTimeout) {
        clearTimeout(animationTimeout);
    }
    
    // Reset all states
    isRunning = false;
    currentStep = null;
    allSteps = [];
    stepIndex = 0;
    
    // Enable controls
    startBtn.disabled = false;
    startCity.disabled = false;
    endCity.disabled = false;
    
    // Redraw graph and reset status
    drawGraph();
    updateStatus(null);
});