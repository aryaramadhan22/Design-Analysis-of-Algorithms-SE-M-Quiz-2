# CityRoute Explorer 

A web-based application for finding and visualizing the shortest route between cities using Dijkstra's Algorithm with step-by-step animation.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Graph Model](#graph-model)
- [Algorithm](#algorithm)
- [Getting Started](#getting-started)
- [Output](#output)
- [Usage](#usage)
- [Performance Analysis](#performance-analysis)
- [Limitations](#limitations)
- [Contributors](#contributors)

## Overview

CityRoute Explorer is an interactive web application that demonstrates Dijkstra's shortest path algorithm. The system displays a graph of cities (nodes) and road distances (edges), while animating each step of the algorithm so users can understand how the shortest path is constructed in real-time.

## Features

- **Interactive Graph Visualization**: Visual representation of cities and connecting roads on HTML5 canvas
- **Step-by-Step Animation**: Watch the algorithm progress with 1-second intervals between steps
- **City Selection**: Choose start and end cities from dropdown menus
- **Status Panel**: Real-time updates showing algorithm steps and distance calculations
- **Color-Coded States**: Visual feedback for visited nodes, current node, and final path
- **Responsive Design**: Works seamlessly across different screen sizes

## System Architecture

The application is built entirely with front-end technologies:

- **HTML**: UI structure, control panels, and canvas container
- **CSS**: Styling with gradients, shadows, and responsive layout
- **JavaScript**: Graph creation, Dijkstra algorithm implementation, animation engine, and canvas drawing

## Graph Model

The graph consists of:

### Nodes (Cities)
Each node contains:
- Coordinates (x, y) for canvas positioning
- Label (city name)

```javascript
nodes: {
    A: {x:100, y:250, name:"Kota A"},
    B: {x:250, y:100, name:"Kota B"},
    C: {x:250, y:400, name:"Kota C"},
    D: {x:400, y:250, name:"Kota D"},
    E: {x:550, y:100, name:"Kota E"},
    F: {x:550, y:400, name:"Kota F"},
    G: {x:700, y:250, name:"Kota G"}
}
```

### Edges (Roads)
Weighted connections between nodes representing road distances:

```javascript
edges: [
    {from:"A", to:"B", weight:4},
    {from:"A", to:"C", weight:2},
    {from:"B", to:"C", weight:1},
    {from:"B", to:"D", weight:5},
    {from:"C", to:"D", weight:8},
    {from:"C", to:"F", weight:10},
    {from:"D", to:"E", weight:3},
    {from:"D", to:"F", weight:2},
    {from:"E", to:"G", weight:1},
    {from:"F", to:"G", weight:4}
]
```

## Algorithm

### Dijkstra's Algorithm Implementation

The application implements Dijkstra's algorithm with four main phases:

#### 1. Initialization
- Set every node's distance to Infinity
- Set `prev[node] = null` (no predecessors yet)
- Set `dist[start] = 0` (distance from start to itself)
- Add start node to priority queue
- Record initialization step for visualization

#### 2. Visiting Nodes
- Extract node with smallest distance from priority queue
- Skip if already processed
- Mark as visited (distance is now final)
- Record visiting step

#### 3. Relaxation Process
For each neighbor of the current node:
- Calculate: `newDistance = dist[current] + weight(current → neighbor)`
- If `newDistance < dist[neighbor]`:
  - Update `dist[neighbor]`
  - Update `prev[neighbor] = current`
  - Add neighbor to priority queue
  - Record update step

#### 4. Path Reconstruction
- Start from end node
- Traverse backwards using `prev[]` array
- Build path list until reaching start node

### Core Function

```javascript
function dijkstraSteps(adj, start, end) {
    const steps = [], dist = {}, prev = {}, pq = [], vis = new Set();
    
    // Initialize distances
    Object.keys(adj).forEach(n => { 
        dist[n] = Infinity; 
        prev[n] = null; 
    });
    
    dist[start] = 0;
    pq.push({node: start, distance: 0});
    
    // Main algorithm loop with step tracking
    // ... (see full implementation in source code)
    
    return steps;
}
```

## Output
    ![alt text](<Screenshot 2025-11-19 164103.png>)

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required!

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aryaramadhan22/Design-Analysis-of-Algorithms-SE-M-Quiz-2.git
```

2. Navigate to the project directory:
```bash
cd Design-Analysis-of-Algorithms-SE-M-Quiz-2
```

3. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

## Usage

1. **Select Start City**: Choose your starting point from the dropdown menu
2. **Select End City**: Choose your destination from the dropdown menu
3. **Click "Mulai"**: Start the algorithm visualization
4. **Watch**: Observe the step-by-step pathfinding process
5. **Reset**: Click "Reset" to clear and start over

## Performance Analysis

### Time Complexity
- **Current Implementation**: O(V²) using array-based priority queue
- **Space Complexity**: O(V + E) for graph storage
- **Suitable For**: Small to medium-sized graphs

### Visualization Performance
- Steps are animated with 1-second intervals
- Instant computation for graphs of this size
- Smooth canvas rendering

## Limitations

1. **Priority Queue**: Uses array sorting instead of binary heap (could be optimized)
2. **Static Graph**: No dynamic node/edge editing functionality
3. **Fixed Animation Speed**: Visualization speed is not adjustable
4. **Predefined Graph**: Graph structure is hardcoded in JavaScript

## Contributors

- **Arya Raka Firmansyah** (5053241007)
- **Mohammad Akbar H. B** (5053241023)
- **Arya Ramadhan** (5053241033)

