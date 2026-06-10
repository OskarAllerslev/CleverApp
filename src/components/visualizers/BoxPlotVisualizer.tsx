import React, { useState, useRef, useEffect } from 'react';

interface Stats {
  sorted: number[];
  n: number;
  min: number;
  q1: number;
  q2: number;
  q3: number;
  max: number;
  mean: number;
  range: number;
  iqr: number;
}

export const BoxPlotVisualizer: React.FC = () => {
  // Preset datasets
  const presets: { [key: string]: number[] } = {
    'Klasse A (Karakterer)': [3, 5, 6, 7, 7, 8, 8, 9, 10, 12],
    'Klasse B (Karakterer)': [2, 4, 5, 6, 7, 8, 10, 11, 11, 14],
    'Skærmtid (Timer)': [1, 2, 3, 3, 4, 5, 6, 8, 9, 10],
    'Med outlier': [2, 3, 3, 4, 4, 5, 5, 6, 6, 20]
  };

  const [data, setData] = useState<number[]>(presets['Klasse A (Karakterer)']);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Range of the scale
  const minLimit = 0;
  const maxLimit = 20;

  // Calculate statistics whenever data changes
  useEffect(() => {
    if (data.length === 0) {
      setStats(null);
      return;
    }
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const sum = sorted.reduce((sumVal, val) => sumVal + val, 0);
    const mean = sum / n;

    // Quartile calculation: standard method matching ugrupperet-data.mdx
    let q2: number;
    let lowerHalf: number[];
    let upperHalf: number[];

    if (n % 2 === 1) {
      const midIdx = Math.floor(n / 2);
      q2 = sorted[midIdx];
      lowerHalf = sorted.slice(0, midIdx);
      upperHalf = sorted.slice(midIdx + 1);
    } else {
      const midIdx1 = n / 2 - 1;
      const midIdx2 = n / 2;
      q2 = (sorted[midIdx1] + sorted[midIdx2]) / 2;
      lowerHalf = sorted.slice(0, n / 2);
      upperHalf = sorted.slice(n / 2);
    }

    const getMedian = (arr: number[]) => {
      const len = arr.length;
      if (len === 0) return 0;
      if (len % 2 === 1) {
        return arr[Math.floor(len / 2)];
      } else {
        return (arr[len / 2 - 1] + arr[len / 2]) / 2;
      }
    };

    const q1 = getMedian(lowerHalf);
    const q3 = getMedian(upperHalf);

    setStats({
      sorted,
      n,
      min,
      q1,
      q2,
      q3,
      max,
      mean,
      range: max - min,
      iqr: q3 - q1
    });
  }, [data]);

  // Coordinate mapping helper functions
  const width = 500;
  const paddingX = 45;
  const getX = (val: number) => {
    return paddingX + ((val - minLimit) / (maxLimit - minLimit)) * (width - 2 * paddingX);
  };

  const getVal = (svgX: number) => {
    const val = minLimit + ((svgX - paddingX) / (width - 2 * paddingX)) * (maxLimit - minLimit);
    return Math.max(minLimit, Math.min(maxLimit, val));
  };

  // Drag handlers
  const handleMouseDown = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement> | MouseEvent) => {
    if (draggedIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const xSVG = ((clientX - rect.left) / rect.width) * width;
    
    // Snap to nearest integer or 0.5
    const newVal = Math.round(getVal(xSVG) * 2) / 2;
    
    const updatedData = [...data];
    updatedData[draggedIdx] = newVal;
    setData(updatedData);
  };

  const handleMouseUp = () => {
    setDraggedIdx(null);
  };

  useEffect(() => {
    if (draggedIdx !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Support touch
      window.addEventListener('touchmove', handleMouseMove as any);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggedIdx, data]);

  // Add a new point at value 10
  const addPoint = () => {
    if (data.length >= 15) return; // Limit size for visual clarity
    setData([...data, 10]);
  };

  // Remove a point
  const removePoint = (idx: number) => {
    if (data.length <= 4) return; // Need at least 4 points to compute quartiles reliably
    const updated = data.filter((_, i) => i !== idx);
    setData(updated);
  };

  return (
    <div className="my-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg max-w-3xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktivt Boksplot & Fordeling
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk i de røde datapunkter på tallinjen for at se, hvordan gennemsnit, median og boksplot ændrer sig med det samme!
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {Object.keys(presets).map((name) => (
          <button
            key={name}
            onClick={() => setData(presets[name])}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              JSON.stringify([...data].sort()) === JSON.stringify([...presets[name]].sort())
                ? 'bg-brand-500 dark:bg-sky-500 text-white shadow'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            ref={svgRef}
            viewBox="0 0 500 240"
            className="w-full max-w-[480px] h-auto overflow-visible select-none text-slate-350 dark:text-slate-700"
          >
            {/* Grid/Tick Lines */}
            {Array.from({ length: 21 }).map((_, i) => {
              const x = getX(i);
              return (
                <g key={`tick-${i}`}>
                  <line
                    x1={x}
                    y1={30}
                    x2={x}
                    y2={210}
                    className="stroke-slate-100 dark:stroke-slate-850"
                    strokeWidth="1"
                  />
                  <line
                    x1={x}
                    y1={200}
                    x2={x}
                    y2={205}
                    className="stroke-slate-300 dark:stroke-slate-650"
                    strokeWidth="1.5"
                  />
                  {i % 2 === 0 && (
                    <text
                      x={x}
                      y={220}
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-500 font-outfit text-[10px] font-bold"
                    >
                      {i}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Main Axis Line */}
            <line
              x1={paddingX - 10}
              y1={200}
              x2={width - paddingX + 10}
              y2={200}
              className="stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="2"
            />

            {/* Render Box Plot if Stats are available */}
            {stats && (
              <g className="transition-all duration-200">
                {/* Whisker Line Left */}
                <line
                  x1={getX(stats.min)}
                  y1={85}
                  x2={getX(stats.q1)}
                  y2={85}
                  className="stroke-brand-500 dark:stroke-sky-400"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                <line
                  x1={getX(stats.min)}
                  y1={75}
                  x2={getX(stats.min)}
                  y2={95}
                  className="stroke-brand-500 dark:stroke-sky-400"
                  strokeWidth="2.5"
                />

                {/* Whisker Line Right */}
                <line
                  x1={getX(stats.q3)}
                  y1={85}
                  x2={getX(stats.max)}
                  y2={85}
                  className="stroke-brand-500 dark:stroke-sky-400"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                <line
                  x1={getX(stats.max)}
                  y1={75}
                  x2={getX(stats.max)}
                  y2={95}
                  className="stroke-brand-500 dark:stroke-sky-400"
                  strokeWidth="2.5"
                />

                {/* Box Rect */}
                <rect
                  x={getX(stats.q1)}
                  y={65}
                  width={Math.max(2, getX(stats.q3) - getX(stats.q1))}
                  height={40}
                  rx="4"
                  className="fill-brand-100/40 dark:fill-sky-950/20 stroke-brand-500 dark:stroke-sky-400"
                  strokeWidth="2.5"
                />

                {/* Median Line */}
                <line
                  x1={getX(stats.q2)}
                  y1={65}
                  x2={getX(stats.q2)}
                  y2={105}
                  className="stroke-brand-600 dark:stroke-sky-300"
                  strokeWidth="3.5"
                />

                {/* Mean Indicator (a small triangle) */}
                <g transform={`translate(${getX(stats.mean)}, 115)`}>
                  <polygon
                    points="0,-6 -6,4 6,4"
                    className="fill-emerald-500 dark:fill-emerald-400"
                  />
                  <text
                    y="14"
                    textAnchor="middle"
                    className="fill-emerald-600 dark:fill-emerald-400 font-outfit text-[9px] font-bold"
                  >
                    x̄={stats.mean.toFixed(1)}
                  </text>
                </g>

                {/* Box Plot Label text */}
                <text
                  x={getX(stats.q2)}
                  y={53}
                  textAnchor="middle"
                  className="fill-brand-700 dark:fill-sky-300 font-outfit font-extrabold text-[10px]"
                >
                  Median (Q₂): {stats.q2.toFixed(1)}
                </text>
                
                <text
                  x={getX(stats.q1)}
                  y={120}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 font-outfit text-[9px] font-semibold"
                >
                  Q₁: {stats.q1.toFixed(1)}
                </text>
                <text
                  x={getX(stats.q3)}
                  y={120}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 font-outfit text-[9px] font-semibold"
                >
                  Q₃: {stats.q3.toFixed(1)}
                </text>
              </g>
            )}

            {/* Draggable Datapoints */}
            <text x={paddingX} y={148} className="fill-slate-400 dark:fill-slate-500 font-outfit text-[10px] font-semibold">Datapunkter (træk vandret):</text>
            <line
              x1={paddingX - 10}
              y1={165}
              x2={width - paddingX + 10}
              y2={165}
              className="stroke-slate-100 dark:stroke-slate-800/50"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {data.map((val, idx) => {
              const x = getX(val);
              const isDragged = draggedIdx === idx;
              // Stack overlapping points slightly to make them visible
              const occurrences = data.slice(0, idx).filter(v => v === val).length;
              const yOffset = occurrences * -8;
              
              return (
                <g
                  key={`pt-${idx}`}
                  onMouseDown={() => handleMouseDown(idx)}
                  onTouchStart={() => handleMouseDown(idx)}
                  className="cursor-ew-resize group"
                >
                  <circle
                    cx={x}
                    cy={165 + yOffset}
                    r={isDragged ? 9 : 6.5}
                    className={`transition-all duration-150 ${
                      isDragged
                        ? 'fill-rose-500 stroke-rose-600 shadow-lg'
                        : 'fill-rose-400 stroke-white dark:stroke-slate-900 group-hover:fill-rose-500'
                    }`}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={154 + yOffset}
                    textAnchor="middle"
                    className="fill-rose-600 dark:fill-rose-400 font-outfit text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Controls to Add/Remove */}
          <div className="flex gap-4 mt-3">
            <button
              onClick={addPoint}
              disabled={data.length >= 15}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              + Tilføj punkt
            </button>
            <button
              onClick={() => removePoint(data.length - 1)}
              disabled={data.length <= 4}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              - Fjern punkt
            </button>
          </div>
        </div>

        {/* Statistics Sheet (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-inner">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Statistisk Opsummering
            </h5>
            
            {stats ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Antal observationer (n):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{stats.n}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-emerald-600 dark:text-emerald-400">Gennemsnit (x̄):</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{stats.mean.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-brand-600 dark:text-sky-400">Median (Q₂):</span>
                  <span className="font-extrabold text-brand-600 dark:text-sky-400 text-base">{stats.q2.toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Nedre kvartil (Q₁):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">{stats.q1.toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Øvre kvartil (Q₃):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">{stats.q3.toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Kvartilbredde (IQR):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{stats.iqr.toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Min / Max:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{stats.min} / {stats.max}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Variationsbredde:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{stats.range}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 dark:text-slate-500 italic py-6 text-center">
                Ingen data tilgængelig
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Prøv dette eksperiment:</span>
            Træk et enkelt punkt helt ud til <span className="font-semibold text-rose-500">20</span> (outlier). Læg mærke til, hvordan gennemsnittet (trekanten) trækkes kraftigt til højre, mens medianen (Q₂) næsten står stille. Det viser, hvorfor medianen kaldes et **robust** centralmål!
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxPlotVisualizer;
