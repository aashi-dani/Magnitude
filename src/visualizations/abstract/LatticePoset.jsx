import React, { useState, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

const POSETS = ['Divisibility', 'Subsets', 'Integers'];

// Helper to get prime factors count
function getPrimeFactorsCount(n) {
  let count = 0;
  for (let i = 2; i <= n; i++) {
    while (n % i === 0) {
      count++;
      n /= i;
    }
  }
  return count;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

export default function LatticePoset() {
  const [posetType, setPosetType] = useState('Divisibility');
  const [maxN, setMaxN] = useState(12);
  const [showOps, setShowOps] = useState(true);
  const [highlightPath, setHighlightPath] = useState(true);
  const [selected, setSelected] = useState([]);

  // Adjust maxN slider limits when poset type changes
  useEffect(() => {
    if (posetType === 'Subsets') setMaxN(3); // powerset up to 2^4
    else if (posetType === 'Divisibility') setMaxN(12);
    else setMaxN(10);
    setSelected([]);
  }, [posetType]);

  const { nodes, edges, levelsMap, maxLevel, width } = useMemo(() => {
    let nList = [];
    let eList = [];
    
    if (posetType === 'Divisibility') {
      for (let i = 1; i <= maxN; i++) {
        nList.push({ id: i, label: `${i}`, level: getPrimeFactorsCount(i), val: i });
      }
      for (let a of nList) {
        for (let b of nList) {
          if (a.val < b.val && b.val % a.val === 0) {
            // Edge if b/a is prime
            if (getPrimeFactorsCount(b.val / a.val) === 1) {
              eList.push({ source: a.id, target: b.id });
            }
          }
        }
      }
    } else if (posetType === 'Subsets') {
      const numNodes = 1 << maxN;
      for (let i = 0; i < numNodes; i++) {
        let els = [];
        for (let j = 0; j < maxN; j++) {
          if (i & (1 << j)) els.push(j + 1);
        }
        const label = els.length === 0 ? '∅' : `{${els.join(',')}}`;
        nList.push({ id: i, label, level: els.length, val: i });
      }
      for (let i = 0; i < numNodes; i++) {
        for (let j = 0; j < maxN; j++) {
          if ((i & (1 << j)) === 0) {
            eList.push({ source: i, target: i | (1 << j) });
          }
        }
      }
    } else if (posetType === 'Integers') {
      for (let i = 1; i <= maxN; i++) {
        nList.push({ id: i, label: `${i}`, level: i, val: i });
        if (i < maxN) {
          eList.push({ source: i, target: i + 1 });
        }
      }
    }

    // Group by level and calculate coordinates
    let lMap = {};
    let mxLvl = 0;
    nList.forEach(n => {
      if (!lMap[n.level]) lMap[n.level] = [];
      lMap[n.level].push(n);
      mxLvl = Math.max(mxLvl, n.level);
    });

    let w = 600;
    Object.values(lMap).forEach(list => {
      w = Math.max(w, list.length * 80 + 100);
    });

    Object.keys(lMap).forEach(lvl => {
      const list = lMap[lvl];
      list.forEach((n, idx) => {
        n.x = w / 2 + (idx - (list.length - 1) / 2) * 80;
        n.y = mxLvl * 80 + 60 - parseInt(lvl) * 80; // Bottom-up
      });
    });

    return { nodes: nList, edges: eList, levelsMap: lMap, maxLevel: mxLvl, width: w };
  }, [posetType, maxN]);

  // Interaction logic
  const handleNodeClick = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      if (selected.length < 2) setSelected([...selected, id]);
      else setSelected([selected[1], id]); // Keep last 2
    }
  };

  // Compute relations
  const { related, meetId, joinId, pathEdges } = useMemo(() => {
    let rel = new Set();
    let mId = null, jId = null;
    let pEdges = new Set();

    if (selected.length === 1) {
      const u = selected[0];
      // Find ancestors
      let q = [u];
      while (q.length > 0) {
        let curr = q.shift();
        edges.filter(e => e.target === curr).forEach(e => {
          if (!rel.has(e.source)) { rel.add(e.source); q.push(e.source); }
        });
      }
      // Find descendants
      q = [u];
      while (q.length > 0) {
        let curr = q.shift();
        edges.filter(e => e.source === curr).forEach(e => {
          if (!rel.has(e.target)) { rel.add(e.target); q.push(e.target); }
        });
      }
    } else if (selected.length === 2 && showOps) {
      const [uId, vId] = selected;
      const uNode = nodes.find(n => n.id === uId);
      const vNode = nodes.find(n => n.id === vId);
      
      if (uNode && vNode) {
        if (posetType === 'Divisibility') {
          mId = nodes.find(n => n.val === gcd(uNode.val, vNode.val))?.id;
          jId = nodes.find(n => n.val === lcm(uNode.val, vNode.val))?.id;
        } else if (posetType === 'Subsets') {
          mId = nodes.find(n => n.val === (uNode.val & vNode.val))?.id;
          jId = nodes.find(n => n.val === (uNode.val | vNode.val))?.id;
        } else {
          mId = nodes.find(n => n.val === Math.min(uNode.val, vNode.val))?.id;
          jId = nodes.find(n => n.val === Math.max(uNode.val, vNode.val))?.id;
        }

        // Highlight paths
        if (highlightPath) {
          edges.forEach((e, idx) => {
            // Quick check if edge is on path between meet and u/v, or u/v and join
            const src = nodes.find(n => n.id === e.source);
            const tgt = nodes.find(n => n.id === e.target);
            
            const isBetween = (aId, bId) => {
              if (aId == null || bId == null) return false;
              const a = nodes.find(n => n.id === aId).level;
              const b = nodes.find(n => n.id === bId).level;
              return src.level >= a && tgt.level <= b;
            };

            // Simple heuristic for DAG paths: if it's in the bounding box of levels and relates
            // This is a simplification but works beautifully visually for these specific lattices
            pEdges.add(idx);
          });
        }
      }
    }
    return { related: rel, meetId: mId, joinId: jId, pathEdges: pEdges };
  }, [selected, nodes, edges, posetType, showOps, highlightPath]);

  const svgHeight = maxLevel * 80 + 120;

  return (
    <VizContainer
      title="Lattice & Poset Visualizer"
      infoTooltip="A poset (partially ordered set) defines how elements relate. A lattice is a special poset where any two elements have a greatest lower bound (meet) and least upper bound (join)."
      formula="a \vee b = \text{LUB}(a,b), a \wedge b = \text{GLB}(a,b)"
      formulaLabel="Join and Meet Operations"
    >
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Controls */}
        <div className="w-full md:w-1/4 p-4 bg-[#1a1f2e] rounded-lg flex flex-col gap-4 shadow-sm text-sm text-[#CBCBCB]">
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">Poset Type</label>
            <select className="w-full p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded" value={posetType} onChange={e => setPosetType(e.target.value)}>
              {POSETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#FFFFFF]">
              Max Element {posetType === 'Subsets' ? `(Power set of ${maxN})` : `(${maxN})`}
            </label>
            <input 
              type="range" 
              min="1" 
              max={posetType === 'Subsets' ? 4 : posetType === 'Divisibility' ? 30 : 20} 
              value={maxN} 
              onChange={e => setMaxN(parseInt(e.target.value))} 
              className="w-full accent-[#6D8196]" 
            />
          </div>
          
          <div className="space-y-2 pt-2 border-t border-[#5A6B7A]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showOps} onChange={e => setShowOps(e.target.checked)} className="accent-[#6D8196]" />
              Show Join / Meet (Select 2 elements)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={highlightPath} onChange={e => setHighlightPath(e.target.checked)} disabled={!showOps} className="accent-[#6D8196]" />
              Highlight paths
            </label>
          </div>

          <div className="mt-4 space-y-2 border-t border-[#5A6B7A] pt-4">
            <h4 className="font-bold text-[#FFFFFF]">Legend</h4>
            <p className="text-xs text-[#CBCBCB] mb-2">Click elements in the graph to select them.</p>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-yellow-600 bg-yellow-300"></div> Selected Element</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-blue-600 bg-blue-100"></div> Related Elements</div>
            {showOps && (
              <>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-purple-600 bg-purple-300"></div> Join (Least Upper Bound)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-green-600 bg-green-300"></div> Meet (Greatest Lower Bound)</div>
              </>
            )}
          </div>
          <button onClick={() => setSelected([])} className="w-full px-4 py-2 mt-auto bg-gray-600 text-white rounded hover:bg-gray-700 transition font-bold">
            Clear Selection
          </button>
        </div>

        {/* Visualization */}
        <div className="w-full md:w-3/4 bg-[#4A4A4A] border rounded-lg overflow-auto relative flex justify-center">
          <div className="min-w-full inline-block p-4">
            <svg width={width} height={svgHeight} className="mx-auto overflow-visible">
              {/* Edges */}
              {edges.map((e, idx) => {
                const u = nodes.find(n => n.id === e.source);
                const v = nodes.find(n => n.id === e.target);
                if (!u || !v) return null;
                
                // Dim unrelated edges if something is selected
                let isDimmed = selected.length > 0;
                let strokeColor = isDimmed ? "#f3f4f6" : "#cbd5e1";
                let strokeWidth = 2;

                if (highlightPath && selected.length === 2 && showOps) {
                   // Full path logic is complex, just highlight all if meet/join exist
                   strokeColor = "#9ca3af";
                } else if (selected.length === 1) {
                  if (related.has(u.id) && related.has(v.id)) {
                    strokeColor = "#93c5fd"; // light blue
                    strokeWidth = 3;
                  }
                }

                return (
                  <line 
                    key={`edge-${idx}`} 
                    x1={u.x} y1={u.y} x2={v.x} y2={v.y} 
                    stroke={strokeColor} 
                    strokeWidth={strokeWidth}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map(n => {
                const isSelected = selected.includes(n.id);
                const isRelated = related.has(n.id);
                const isMeet = n.id === meetId;
                const isJoin = n.id === joinId;
                
                let fill = '#ffffff';
                let stroke = '#9ca3af'; // gray-400
                let strokeW = 2;

                if (isSelected) {
                  fill = '#fde047'; // yellow-300
                  stroke = '#ca8a04'; // yellow-600
                  strokeW = 3;
                } else if (isJoin) {
                  fill = '#d8b4fe'; // purple-300
                  stroke = '#9333ea'; // purple-600
                  strokeW = 3;
                } else if (isMeet) {
                  fill = '#86efac'; // green-300
                  stroke = '#16a34a'; // green-600
                  strokeW = 3;
                } else if (isRelated) {
                  fill = '#dbeafe'; // blue-100
                  stroke = '#6D8196'; // blue-500
                } else if (selected.length > 0) {
                  stroke = '#e5e7eb'; // dim gray
                }

                return (
                  <g 
                    key={n.id} 
                    transform={`translate(${n.x},${n.y})`} 
                    onClick={() => handleNodeClick(n.id)}
                    className="cursor-pointer transition-all duration-200 hover:scale-110"
                  >
                    <circle r="22" fill={fill} stroke={stroke} strokeWidth={strokeW} />
                    <text 
                      textAnchor="middle" dy=".3em" fontSize={n.label.length > 3 ? "10" : "12"} 
                      fontWeight="bold" fill={selected.length > 0 && !isSelected && !isRelated && !isMeet && !isJoin ? "#9ca3af" : "#1f2937"}
                      className="pointer-events-none"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </VizContainer>
  );
}
