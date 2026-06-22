import React, { useState, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

const FUNCTIONS = ['Fibonacci', 'Factorial', 'Power'];

export default function RecursionTrees() {
  const [func, setFunc] = useState('Fibonacci');
  const [n, setN] = useState(5);
  const [showMemo, setShowMemo] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Build the call tree recursively
  const { traceNodes } = useMemo(() => {
    let idCounter = 0;
    let memo = {};
    let seen = new Set();
    
    const recurse = (val) => {
      const currentId = idCounter++;
      let node = { id: currentId, label: '', type: 'default', children: [] };
      
      if (func === 'Fibonacci') {
        node.label = `fib(${val})`;
        if (showMemo && memo[val] !== undefined) {
          node.type = 'cached';
          return node;
        }
        if (!showMemo && seen.has(val) && val > 1) {
          node.type = 'inefficient';
        }
        seen.add(val);
        
        if (val <= 1) {
          node.type = 'base';
          if (showMemo) memo[val] = val;
          return node;
        }
        
        const left = recurse(val - 1);
        const right = recurse(val - 2);
        node.children.push(left, right);
        if (showMemo) memo[val] = true;
        return node;

      } else if (func === 'Factorial') {
        node.label = `fact(${val})`;
        if (val <= 1) {
          node.type = 'base';
          return node;
        }
        node.children.push(recurse(val - 1));
        return node;

      } else if (func === 'Power') {
        // D&C Power of 2: 2^n = 2^(n/2) * 2^(n/2)
        node.label = `pow(2, ${val})`;
        if (showMemo && memo[val] !== undefined) {
          node.type = 'cached';
          return node;
        }
        if (!showMemo && seen.has(val) && val > 0) {
          node.type = 'inefficient';
        }
        seen.add(val);

        if (val <= 0) {
          node.type = 'base';
          if (showMemo) memo[val] = true;
          return node;
        }
        
        const half = Math.floor(val / 2);
        const leftCall = recurse(half);
        // If not memoized, we deliberately make a second call to half to show redundancy
        const rightCall = recurse(val - half); 
        node.children.push(leftCall, rightCall);
        
        if (showMemo) memo[val] = true;
        return node;
      }
    };

    const root = recurse(n);

    // Layout the tree (assign coordinates)
    let leafIndex = 0;
    const assignCoords = (node, depth) => {
      node.y = depth * 80 + 40;
      if (node.children.length === 0) {
        node.x = leafIndex * 90;
        leafIndex++;
      } else {
        node.children.forEach(c => assignCoords(c, depth + 1));
        node.x = node.children.reduce((sum, c) => sum + c.x, 0) / node.children.length;
      }
    };
    assignCoords(root, 0);

    // Flatten tree to array (pre-order traversal) for animation steps
    const order = [];
    let maxDepth = 0;
    const flatten = (node, parentX, parentY) => {
      maxDepth = Math.max(maxDepth, (node.y - 40) / 80);
      order.push({ ...node, parentX, parentY });
      node.children.forEach(c => flatten(c, node.x, node.y));
    };
    flatten(root, undefined, undefined);

    return { 
      traceNodes: order, 
      maxX: leafIndex * 90, 
      maxY: maxDepth * 80 + 100 
    };
  }, [func, n, showMemo]);

  // Reset on parameter change
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [traceNodes]);

  // Playback loop
  useEffect(() => {
    let timer;
    if (isPlaying && stepIndex < traceNodes.length - 1) {
      timer = setTimeout(() => {
        setStepIndex(prev => prev + 1);
      }, speed);
    } else if (stepIndex >= traceNodes.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, traceNodes.length, speed]);

  const visibleNodes = traceNodes.slice(0, stepIndex + 1);

  // SVG dimensions
  const svgWidth = Math.max(800, (visibleNodes.length > 0 ? traceNodes[traceNodes.length-1].x + 200 : 800));
  const svgHeight = Math.max(400, traceNodes.reduce((m, n) => Math.max(m, n.y), 0) + 100);

  const colors = {
    default: { bg: '#ffffff', border: '#6b7280' },
    cached: { bg: '#bbf7d0', border: '#16a34a' }, // green
    base: { bg: '#bfdbfe', border: '#2563eb' }, // blue
    inefficient: { bg: '#fecaca', border: '#dc2626' } // red
  };

  return (
    <VizContainer
      title="Recursion Trees"
      infoTooltip="Recursion breaks a problem into smaller versions of itself. The call tree shows all function invocations."
      formula="T(n) = aT(n/b) + f(n)"
      formulaLabel="Recurrence Relation"
    >
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Controls */}
        <div className="w-full md:w-1/4 p-4 bg-[#1a1f2e] rounded-lg flex flex-col gap-4 shadow-sm text-sm text-[#CBCBCB]">
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Function</label>
            <select className="w-full p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded" value={func} onChange={e => setFunc(e.target.value)}>
              {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Input (n = {n})</label>
            <input 
              type="range" 
              min="1" 
              max={func === 'Factorial' ? 10 : 8} 
              value={n} 
              onChange={e => setN(parseInt(e.target.value))} 
              className="w-full accent-[#6D8196]" 
            />
            <p className="text-xs text-[#CBCBCB] mt-1">Capped to avoid browser lag on large trees.</p>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Speed (ms: {speed})</label>
            <input type="range" min="100" max="1500" step="100" value={speed} onChange={e => setSpeed(parseInt(e.target.value))} className="w-full accent-[#6D8196]" />
          </div>
          
          <div className="pt-2 border-t border-[#5A6B7A]">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#CBCBCB]">
              <input type="checkbox" checked={showMemo} onChange={e => setShowMemo(e.target.checked)} className="w-4 h-4 accent-[#6D8196]" />
              Show Memoization
            </label>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#5A6B7A]">
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold">
              {isPlaying ? 'Pause' : 'Animate'}
            </button>
            <button onClick={() => { setIsPlaying(false); setStepIndex(prev => Math.min(prev + 1, traceNodes.length - 1)); }} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-bold">
              Step
            </button>
          </div>
          <button onClick={() => { setIsPlaying(false); setStepIndex(0); }} className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-bold">
            Reset
          </button>
          
          {/* Legend */}
          <div className="mt-4 space-y-2 border-t border-[#5A6B7A] pt-4">
            <h4 className="font-bold text-[#FFFFFF]">Legend</h4>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-500 bg-[#4A4A4A]"></div> Standard Call</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-blue-600 bg-blue-200"></div> Base Case</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-red-600 bg-red-200"></div> Re-computed (Inefficient)</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-green-600 bg-green-200"></div> Cached Result</div>
          </div>
        </div>

        {/* Visualization */}
        <div className="w-full md:w-3/4 bg-[#4A4A4A] border rounded-lg overflow-auto relative">
          <div className="sticky top-0 left-0 w-full p-2 bg-gray-800 text-white font-mono text-sm shadow z-10 flex justify-between">
            <span>Invocations: {visibleNodes.length} / {traceNodes.length}</span>
            <span>Total Nodes Generated: {traceNodes.length}</span>
          </div>
          
          <div className="min-w-full inline-block p-8">
            <svg width={svgWidth} height={svgHeight} className="overflow-visible">
              <g transform="translate(40, 20)">
                {/* Draw Edges */}
                {visibleNodes.map((n, i) => n.parentX !== undefined && (
                  <line 
                    key={`edge-${i}`} 
                    x1={n.parentX} y1={n.parentY} 
                    x2={n.x} y2={n.y} 
                    stroke="#9ca3af" strokeWidth="2"
                    className="animate-fade-in"
                  />
                ))}

                {/* Draw Nodes */}
                {visibleNodes.map((n, i) => {
                  const style = colors[n.type];
                  return (
                    <g key={`node-${i}`} transform={`translate(${n.x},${n.y})`} className="animate-fade-in">
                      <rect 
                        x="-35" y="-15" width="70" height="30" rx="15" 
                        fill={style.bg} stroke={style.border} strokeWidth="2" 
                      />
                      <text textAnchor="middle" dy=".3em" fontSize="12" fontWeight="500" fill="#1f2937">
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </VizContainer>
  );
}
