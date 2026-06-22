import React, { useState, useEffect, useMemo, useRef } from 'react';
import VizContainer from '../../components/VizContainer';

const PRESETS = ['Fully connected', 'Tree', 'Cycle', 'Custom'];
const ALGORITHMS = ['BFS', 'DFS', 'Dijkstra', 'MST'];

export default function GraphExplorer() {
  const [preset, setPreset] = useState('Tree');
  const [algorithm, setAlgorithm] = useState('BFS');
  const [startNode, setStartNode] = useState(0);
  const [speed, setSpeed] = useState(500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showVisited, setShowVisited] = useState(true);
  const [showDistances, setShowDistances] = useState(true);

  // Generate graph
  const { nodes, edges } = useMemo(() => {
    let n = [];
    let e = [];
    const R = 120;
    const cx = 300, cy = 200;

    if (preset === 'Fully connected' || preset === 'Cycle') {
      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        n.push({ id: i, label: `${i}`, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) });
      }
      if (preset === 'Cycle') {
        for (let i = 0; i < count; i++) {
          e.push({ source: i, target: (i + 1) % count, weight: Math.floor(Math.random() * 5) + 1 });
        }
      } else {
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            e.push({ source: i, target: j, weight: Math.floor(Math.random() * 10) + 1 });
          }
        }
      }
    } else if (preset === 'Tree') {
      n = [
        { id: 0, label: '0', x: cx, y: 50 },
        { id: 1, label: '1', x: cx - 100, y: 150 },
        { id: 2, label: '2', x: cx + 100, y: 150 },
        { id: 3, label: '3', x: cx - 150, y: 250 },
        { id: 4, label: '4', x: cx - 50, y: 250 },
        { id: 5, label: '5', x: cx + 50, y: 250 },
        { id: 6, label: '6', x: cx + 150, y: 250 },
      ];
      e = [
        { source: 0, target: 1, weight: 2 },
        { source: 0, target: 2, weight: 3 },
        { source: 1, target: 3, weight: 1 },
        { source: 1, target: 4, weight: 4 },
        { source: 2, target: 5, weight: 5 },
        { source: 2, target: 6, weight: 2 },
      ];
    } else {
      const count = 7;
      for (let i = 0; i < count; i++) {
        n.push({ id: i, label: `${i}`, x: cx + (Math.random() * 300 - 150), y: cy + (Math.random() * 200 - 100) });
      }
      for (let i = 0; i < count * 1.5; i++) {
        const u = Math.floor(Math.random() * count);
        let v = Math.floor(Math.random() * count);
        while (u === v) v = Math.floor(Math.random() * count);
        if (!e.some(edge => (edge.source === u && edge.target === v) || (edge.source === v && edge.target === u))) {
          e.push({ source: u, target: v, weight: Math.floor(Math.random() * 10) + 1 });
        }
      }
    }
    return { nodes: n, edges: e };
  }, [preset]);

  // Ensure startNode is valid when graph changes
  useEffect(() => {
    if (!nodes.find(n => n.id === startNode)) {
      setStartNode(nodes[0]?.id || 0);
    }
  }, [nodes, startNode]);

  // Generate trace based on selected algorithm
  const trace = useMemo(() => {
    if (!nodes.length || !nodes.find(n => n.id === startNode)) return [];
    
    const t = [];
    let visited = new Set();
    let treeEdges = [];

    if (algorithm === 'BFS') {
      let q = [startNode];
      visited.add(startNode);
      t.push({ activeNode: startNode, visited: Array.from(visited), edges: [...treeEdges], info: 'Start BFS' });
      
      while (q.length > 0) {
        let u = q.shift();
        t.push({ activeNode: u, visited: Array.from(visited), edges: [...treeEdges], info: `Visiting node ${u}` });
        
        let neighbors = edges.filter(e => e.source === u || e.target === u);
        for (let e of neighbors) {
          let v = e.source === u ? e.target : e.source;
          if (!visited.has(v)) {
            visited.add(v);
            q.push(v);
            treeEdges.push(e);
            t.push({ activeNode: u, visited: Array.from(visited), edges: [...treeEdges], info: `Discovered node ${v}` });
          }
        }
      }
    } else if (algorithm === 'DFS') {
      let stack = [startNode];
      let parentEdge = {};
      
      while (stack.length > 0) {
        let u = stack.pop();
        if (!visited.has(u)) {
          visited.add(u);
          if (parentEdge[u]) treeEdges.push(parentEdge[u]);
          t.push({ activeNode: u, visited: Array.from(visited), edges: [...treeEdges], info: `Visiting node ${u}` });
          
          let neighbors = edges.filter(e => e.source === u || e.target === u);
          neighbors.sort((a, b) => {
            let va = a.source === u ? a.target : a.source;
            let vb = b.source === u ? b.target : b.source;
            return vb - va;
          });
          
          for (let e of neighbors) {
            let v = e.source === u ? e.target : e.source;
            if (!visited.has(v)) {
              stack.push(v);
              parentEdge[v] = e;
            }
          }
        }
      }
    } else if (algorithm === 'Dijkstra') {
      let dist = {};
      nodes.forEach(n => dist[n.id] = Infinity);
      dist[startNode] = 0;
      let pq = [{ node: startNode, d: 0 }];
      let parentEdge = {};
      
      t.push({ activeNode: startNode, visited: Array.from(visited), edges: [...treeEdges], distances: { ...dist }, info: 'Initialize Dijkstra' });
      
      while (pq.length > 0) {
        pq.sort((a, b) => a.d - b.d);
        let { node: u, d } = pq.shift();
        
        if (visited.has(u)) continue;
        visited.add(u);
        if (parentEdge[u]) treeEdges.push(parentEdge[u]);
        
        t.push({ activeNode: u, visited: Array.from(visited), edges: [...treeEdges], distances: { ...dist }, info: `Settled node ${u} (dist: ${d})` });
        
        let neighbors = edges.filter(e => e.source === u || e.target === u);
        for (let e of neighbors) {
          let v = e.source === u ? e.target : e.source;
          if (!visited.has(v)) {
            if (dist[u] + e.weight < dist[v]) {
              dist[v] = dist[u] + e.weight;
              parentEdge[v] = e;
              pq.push({ node: v, d: dist[v] });
              t.push({ activeNode: u, visited: Array.from(visited), edges: [...treeEdges], distances: { ...dist }, info: `Updated distance to node ${v} via ${u}` });
            }
          }
        }
      }
    } else if (algorithm === 'MST') {
      visited.add(startNode);
      t.push({ activeNode: startNode, visited: Array.from(visited), edges: [...treeEdges], info: `Started Prim's MST from node ${startNode}` });
      
      while (visited.size < nodes.length) {
        let crossingEdges = edges.filter(e => {
          let sVisited = visited.has(e.source);
          let tVisited = visited.has(e.target);
          return (sVisited && !tVisited) || (!sVisited && tVisited);
        });
        
        if (crossingEdges.length === 0) break;
        
        crossingEdges.sort((a, b) => a.weight - b.weight);
        let minEdge = crossingEdges[0];
        let v = visited.has(minEdge.source) ? minEdge.target : minEdge.source;
        
        visited.add(v);
        treeEdges.push(minEdge);
        
        t.push({ activeNode: v, visited: Array.from(visited), edges: [...treeEdges], info: `Added edge to node ${v} (weight: ${minEdge.weight})` });
      }
    }
    
    return t;
  }, [nodes, edges, startNode, algorithm]);

  // Reset playback when dependencies change
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [trace]);

  // Playback timer
  useEffect(() => {
    let timer;
    if (isPlaying && stepIndex < trace.length - 1) {
      timer = setTimeout(() => {
        setStepIndex(prev => prev + 1);
      }, speed);
    } else if (stepIndex >= trace.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, trace.length, speed]);

  const currentFrame = trace[stepIndex] || { activeNode: null, visited: [], edges: [], distances: {} };

  return (
    <VizContainer
      title="Graph Explorer"
      infoTooltip="A graph is nodes (vertices) connected by edges. Algorithms find shortest paths (Dijkstra), visit all nodes (BFS/DFS), or connect all nodes with minimum cost (MST)."
      formula="d(u,v) = \text{shortest path from } u \text{ to } v"
      formulaLabel="Graph Distance"
    >
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Controls Panel */}
        <div className="w-full md:w-1/4 p-4 bg-[#1a1f2e] rounded-lg flex flex-col gap-4 shadow-sm text-sm text-[#CBCBCB]">
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Preset Graph</label>
            <select className="w-full p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded" value={preset} onChange={e => setPreset(e.target.value)}>
              {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Algorithm</label>
            <select className="w-full p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Start Node</label>
            <select className="w-full p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded" value={startNode} onChange={e => setStartNode(parseInt(e.target.value))}>
              {nodes.map(n => <option key={n.id} value={n.id}>Node {n.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Speed (ms: {speed})</label>
            <input type="range" min="100" max="2000" step="100" value={speed} onChange={e => setSpeed(parseInt(e.target.value))} className="w-full accent-[#6D8196]" />
          </div>
          
          <div className="space-y-2 pt-2 border-t border-[#5A6B7A]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showVisited} onChange={e => setShowVisited(e.target.checked)} className="accent-[#6D8196]" />
              Show visited nodes
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showDistances} onChange={e => setShowDistances(e.target.checked)} className="accent-[#6D8196]" />
              Show distances
            </label>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#5A6B7A]">
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => { setIsPlaying(false); setStepIndex(prev => Math.min(prev + 1, trace.length - 1)); }} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-bold">
              Step
            </button>
          </div>
          <button onClick={() => { setIsPlaying(false); setStepIndex(0); }} className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-bold">
            Reset
          </button>
        </div>

        {/* Visualization Panel */}
        <div className="w-full md:w-3/4 bg-[#4A4A4A] border rounded-lg overflow-hidden relative flex items-center justify-center min-h-[400px]">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 w-full p-3 bg-gray-800 text-white font-mono text-sm shadow flex justify-between z-10">
            <span>Step: {stepIndex + 1} / {Math.max(1, trace.length)}</span>
            <span>{currentFrame.info || 'Ready'}</span>
          </div>

          {/* Canvas */}
          <svg className="w-full h-full min-h-[400px]" viewBox="0 0 600 400">
            {/* Draw Edges */}
            {edges.map((e, i) => {
              const u = nodes.find(n => n.id === e.source);
              const v = nodes.find(n => n.id === e.target);
              if (!u || !v) return null;
              
              const isHighlighted = currentFrame.edges.some(te => 
                (te.source === e.source && te.target === e.target) || 
                (te.source === e.target && te.target === e.source)
              );

              return (
                <g key={`edge-${i}`}>
                  <line 
                    x1={u.x} y1={u.y} x2={v.x} y2={v.y} 
                    stroke={isHighlighted ? '#6D8196' : '#d1d5db'} 
                    strokeWidth={isHighlighted ? 4 : 2} 
                    className="transition-all duration-300"
                  />
                  {(showDistances || algorithm === 'MST') && (
                    <text 
                      x={(u.x + v.x) / 2} y={(u.y + v.y) / 2 - 8} 
                      fill="#4b5563" fontSize="12" textAnchor="middle" className="font-bold bg-[#4A4A4A]"
                    >
                      {e.weight}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map(n => {
              const isVisited = currentFrame.visited.includes(n.id);
              const isActive = currentFrame.activeNode === n.id;
              
              let fill = '#ffffff';
              let stroke = '#6b7280';
              if (isActive) {
                fill = '#fef08a'; // yellow
                stroke = '#ca8a04';
              } else if (isVisited && showVisited) {
                fill = '#bfdbfe'; // blue
                stroke = '#2563eb';
              }

              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`} className="transition-all duration-300">
                  <circle r="18" fill={fill} stroke={stroke} strokeWidth="3" />
                  <text textAnchor="middle" dy=".3em" fontSize="14" fontWeight="bold" fill="#1f2937">
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Distances Legend for Dijkstra */}
          {showDistances && algorithm === 'Dijkstra' && currentFrame.distances && (
            <div className="absolute bottom-4 right-4 bg-[#1a1f2e]/90 p-3 rounded shadow-lg text-sm max-h-[80%] overflow-auto">
              <h4 className="font-bold border-b border-[#5A6B7A] pb-1 mb-2 text-[#FFFFFF]">Distances</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#CBCBCB]">
                {Object.entries(currentFrame.distances).map(([nodeId, dist]) => (
                  <div key={nodeId} className="flex justify-between gap-4">
                    <span>Node {nodeId}:</span>
                    <span className="font-mono font-semibold text-[#FFFFFF]">{dist === Infinity ? '∞' : dist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </VizContainer>
  );
}
