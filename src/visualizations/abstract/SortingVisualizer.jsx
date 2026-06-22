// src/visualizations/abstract/SortingVisualizer.jsx
// Interactive sorting algorithm visualizer with animated bar charts
// Algorithms: Bubble, Merge, Quick, Heap sort
// Shows: comparison count, swap count, current pass highlighted

import { useState, useEffect, useRef, useCallback } from 'react';
import VizContainer from '../../components/VizContainer';
import PlayControls from '../../components/PlayControls';

const ACCENT = '#2563EB';
const N_DEFAULT = 40;
const ALGOS = ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Insertion Sort'];

// ── Sorting Generators ─────────────────────────────────────────────────────
// Each generator yields { array, comparing: [i,j], swapping: [i,j], sorted: Set<i> }

function* bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  const sorted = new Set();
  let comps = 0, swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comps++;
      yield { a: [...a], comparing: [j, j + 1], sorted: new Set(sorted), comps, swaps };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        yield { a: [...a], swapping: [j, j + 1], sorted: new Set(sorted), comps, swaps };
      }
    }
    sorted.add(n - 1 - i);
  }
  sorted.add(0);
  yield { a: [...a], sorted: new Set([...Array(n).keys()]), comps, swaps, done: true };
}

function* insertionSort(arr) {
  const a = [...arr];
  const n = a.length;
  const sorted = new Set([0]);
  let comps = 0, swaps = 0;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      comps++;
      yield { a: [...a], comparing: [j - 1, j], sorted: new Set(sorted), comps, swaps };
      if (a[j - 1] > a[j]) {
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        swaps++;
        j--;
        yield { a: [...a], swapping: [j, j + 1], sorted: new Set(sorted), comps, swaps };
      } else break;
    }
    sorted.add(i);
  }
  yield { a: [...a], sorted: new Set([...Array(n).keys()]), comps, swaps, done: true };
}

function* mergeSort(arr) {
  const a = [...arr];
  let comps = 0, swaps = 0;
  const sorted = new Set();

  function* merge(lo, mid, hi) {
    const left  = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      comps++;
      yield { a: [...a], comparing: [lo + i, mid + 1 + j], sorted: new Set(sorted), comps, swaps };
      if (left[i] <= right[j]) {
        a[k++] = left[i++];
      } else {
        a[k++] = right[j++];
        swaps++;
      }
      yield { a: [...a], swapping: [k - 1, k - 1], sorted: new Set(sorted), comps, swaps };
    }
    while (i < left.length) { a[k++] = left[i++]; yield { a: [...a], sorted: new Set(sorted), comps, swaps }; }
    while (j < right.length) { a[k++] = right[j++]; yield { a: [...a], sorted: new Set(sorted), comps, swaps }; }
    for (let x = lo; x <= hi; x++) sorted.add(x);
  }

  function* split(lo, hi) {
    if (lo >= hi) { sorted.add(lo); return; }
    const mid = Math.floor((lo + hi) / 2);
    yield* split(lo, mid);
    yield* split(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }

  yield* split(0, a.length - 1);
  yield { a: [...a], sorted: new Set([...Array(a.length).keys()]), comps, swaps, done: true };
}

function* quickSort(arr) {
  const a = [...arr];
  let comps = 0, swaps = 0;
  const sorted = new Set();

  function* partition(lo, hi) {
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comps++;
      yield { a: [...a], comparing: [j, hi], pivot: hi, sorted: new Set(sorted), comps, swaps };
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        swaps++;
        yield { a: [...a], swapping: [i, j], sorted: new Set(sorted), comps, swaps };
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    sorted.add(i + 1);
    yield { a: [...a], swapping: [i + 1, hi], sorted: new Set(sorted), comps, swaps };
    return i + 1;
  }

  function* qsort(lo, hi) {
    if (lo >= hi) { if (lo === hi) sorted.add(lo); return; }
    let p;
    const gen = partition(lo, hi);
    let result;
    while (!(result = gen.next()).done) {
      p = result.value;
      yield p;
    }
    p = [...sorted].find(x => x >= lo && x <= hi) || Math.floor((lo + hi) / 2);
    yield* qsort(lo, p - 1);
    yield* qsort(p + 1, hi);
  }

  yield* qsort(0, a.length - 1);
  yield { a: [...a], sorted: new Set([...Array(a.length).keys()]), comps, swaps, done: true };
}

function getGenerator(algo, arr) {
  switch (algo) {
    case 'Bubble Sort':    return bubbleSort(arr);
    case 'Merge Sort':     return mergeSort(arr);
    case 'Quick Sort':     return quickSort(arr);
    case 'Insertion Sort': return insertionSort(arr);
    default: return bubbleSort(arr);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SortingVisualizer() {
  const canvasRef = useRef(null);
  const [algo, setAlgo]       = useState('Merge Sort');
  const [n, setN]             = useState(N_DEFAULT);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]     = useState(1);
  const [done, setDone]       = useState(false);

  // Visualization state refs (avoid re-render on every frame)
  const genRef    = useRef(null);
  const stateRef  = useRef({ a: [], comparing: [], swapping: [], sorted: new Set(), pivot: -1, comps: 0, swaps: 0 });
  const rafRef    = useRef(null);
  const lastRef   = useRef(0);
  const statsRef  = useRef({ comps: 0, swaps: 0 });

  // Display stats (triggers re-render for stats panel)
  const [stats, setStats] = useState({ comps: 0, swaps: 0 });

  // Generate fresh shuffled array
  const freshArray = useCallback(() => {
    const a = Array.from({ length: n }, (_, i) => i + 1);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [n]);

  const arrRef = useRef(freshArray());

  // Draw the current state onto canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const W      = canvas.width;
    const H      = canvas.height;
    const { a, comparing = [], swapping = [], sorted, pivot } = stateRef.current;
    if (!a.length) return;

    const isDark  = document.documentElement.classList.contains('dark');
    const barW    = W / a.length;
    const maxVal  = Math.max(...a);

    ctx.clearRect(0, 0, W, H);
    // Background
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(0, 0, W, H);

    a.forEach((val, i) => {
      const barH = (val / maxVal) * (H - 8);
      const x    = i * barW;
      const y    = H - barH;

      let color = '#6D8196'; // default
      if (sorted?.has(i))      color = ACCENT;
      if (i === pivot)         color = '#8b5cf6';
      if (swapping.includes(i)) color = '#f43f5e';
      if (comparing.includes(i)) color = '#FFFFE3';

      ctx.fillStyle = color;
      ctx.beginPath();
      if (barW > 4) {
        ctx.roundRect(x + 1, y, barW - 2, barH, [2, 2, 0, 0]);
      } else {
        ctx.rect(x, y, barW - 0.5, barH);
      }
      ctx.fill();
    });
  }, []);

  // Initialize
  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
    setDone(false);
    const a = freshArray();
    arrRef.current = a;
    stateRef.current = { a, comparing: [], swapping: [], sorted: new Set(), comps: 0, swaps: 0 };
    genRef.current = null;
    setStats({ comps: 0, swaps: 0 });
    requestAnimationFrame(draw);
  }, [freshArray, draw]);

  // Step the generator by multiple steps per frame based on speed
  const step = useCallback((timestamp) => {
    if (!genRef.current) return;
    const stepsPerFrame = Math.max(1, Math.floor(speed * 3));
    let last;
    for (let i = 0; i < stepsPerFrame; i++) {
      const result = genRef.current.next();
      if (result.done || result.value?.done) {
        stateRef.current = { ...stateRef.current, comparing: [], swapping: [], ...(result.value || {}) };
        setDone(true);
        setPlaying(false);
        setStats({ comps: stateRef.current.comps, swaps: stateRef.current.swaps });
        draw();
        return;
      }
      last = result.value;
    }
    if (last) {
      stateRef.current = last;
      if (last.comps !== statsRef.current.comps || last.swaps !== statsRef.current.swaps) {
        statsRef.current = { comps: last.comps, swaps: last.swaps };
        setStats({ comps: last.comps, swaps: last.swaps });
      }
    }
    draw();
    rafRef.current = requestAnimationFrame(step);
  }, [speed, draw]);

  const handlePlay = useCallback(() => {
    if (done) reset();
    if (!genRef.current) {
      genRef.current = getGenerator(algo, arrRef.current);
    }
    setPlaying(true);
    rafRef.current = requestAnimationFrame(step);
  }, [done, reset, algo, step]);

  const handlePause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  }, []);

  // Resize canvas + initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = 340;
      draw();
    });
    resizeObserver.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = 340;
    return () => resizeObserver.disconnect();
  }, [draw]);

  // Reset when algo or n changes
  useEffect(() => { reset(); }, [algo, n, reset]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const controls = (
    <div className="space-y-5">
      {/* Algorithm selector */}
      <div>
        <p className="text-xs font-medium text-[#CBCBCB] dark:text-slate-300 mb-2">Algorithm</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ALGOS.map(a => (
            <button
              key={a}
              onClick={() => setAlgo(a)}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all duration-150 text-white
                ${algo === a ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Array size */}
      <div>
        <p className="text-xs font-medium text-[#CBCBCB] dark:text-slate-300 mb-2">
          Array Size: <span className="font-mono font-bold">{n}</span>
        </p>
        <input type="range" min={10} max={120} value={n}
          onChange={e => setN(+e.target.value)} disabled={playing}
          className="w-full h-2 appearance-none rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer"
        />
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-[#CBCBCB] dark:text-slate-300 mb-2">Legend</p>
        {[
          { color: '#FFFFE3', label: 'Comparing' },
          { color: '#f43f5e', label: 'Swapping' },
          { color: '#8b5cf6', label: 'Pivot' },
          { color: ACCENT,    label: 'Sorted' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-[#CBCBCB] dark:text-slate-400">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-[#4A4A4A] dark:bg-slate-800 rounded-xl p-3 dark:border-[#5A6B7A] space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stats</p>
        {[
          { label: 'Comparisons', value: stats.comps.toLocaleString() },
          { label: 'Swaps / Writes', value: stats.swaps.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="text-xs text-[#CBCBCB] dark:text-slate-400">{label}</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{value}</span>
          </div>
        ))}
        {done && (
          <p className="text-xs font-semibold text-center mt-1" style={{ color: ACCENT }}>✓ Sorted!</p>
        )}
      </div>

      {/* Play controls */}
      <PlayControls
        playing={playing}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={reset}
        speed={speed}
        onSpeedChange={s => { setSpeed(s); }}
        accentColor={ACCENT}
      />
    </div>
  );

  return (
    <VizContainer
      infoTooltip="Different sorting algorithms have different efficiencies. Merge sort and quick sort are O(n log n), while bubble sort is O(n²). Watch how many comparisons each makes."
      id="sorting"
      title="Sorting Algorithm Visualizer"
      description="Watch Bubble, Merge, Quick, and Insertion sort in action. Each bar is an element; color indicates the algorithm's current operation."
      formula="T(n) = 2T(n/2) + O(n) \Rightarrow O(n \log n)"
      formulaLabel="Merge Sort Recurrence"
      accentColor={ACCENT}
      controls={controls}
    >
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl"
        style={{ display: 'block', height: 340 }}
        aria-label="Sorting visualization canvas"
      />
    </VizContainer>
  );
}
