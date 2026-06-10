import React, { useState, useEffect } from 'react';

type Mode = 'exact' | 'at_most' | 'at_least' | 'interval';

export const BinomialVisualizer: React.FC = () => {
  // Parameters
  const [n, setN] = useState<number>(20);
  const [p, setP] = useState<number>(0.3);
  const [mode, setMode] = useState<Mode>('at_most');
  const [k, setK] = useState<number>(6);
  const [a, setA] = useState<number>(4);
  const [b, setB] = useState<number>(8);

  // PMF array
  const [pmf, setPmf] = useState<number[]>([]);

  // Keep search targets in bounds when n changes
  useEffect(() => {
    if (k > n) setK(n);
    if (a > n) setA(Math.max(0, n - 2));
    if (b > n) setB(n);
  }, [n]);

  // Compute PMF in stable log-space
  useEffect(() => {
    if (n <= 0) return;
    const pmfList = new Array<number>(n + 1).fill(0);
    
    if (p === 0) {
      pmfList[0] = 1;
      setPmf(pmfList);
      return;
    }
    if (p === 1) {
      pmfList[n] = 1;
      setPmf(pmfList);
      return;
    }

    let logP = n * Math.log(1 - p);
    pmfList[0] = Math.exp(logP);

    for (let j = 1; j <= n; j++) {
      logP = logP + Math.log(n - j + 1) - Math.log(j) + Math.log(p) - Math.log(1 - p);
      pmfList[j] = Math.exp(logP);
    }

    const sum = pmfList.reduce((sumVal, val) => sumVal + val, 0);
    setPmf(pmfList.map(v => v / (sum || 1)));
  }, [n, p]);

  // Stats
  const mean = n * p;
  const variance = n * p * (1 - p);
  const stdDev = Math.sqrt(variance);

  // Check if a specific value j is within the user's selected range
  const isSelected = (j: number) => {
    switch (mode) {
      case 'exact':
        return j === k;
      case 'at_most':
        return j <= k;
      case 'at_least':
        return j >= k;
      case 'interval':
        return j >= a && j <= b;
      default:
        return false;
    }
  };

  // Calculate cumulative probability of the selected region
  const selectedProbability = pmf.reduce((sum, val, idx) => {
    return isSelected(idx) ? sum + val : sum;
  }, 0);

  // SVG parameters
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Maximum value for scaling the y-axis
  const maxPMFVal = pmf.length > 0 ? Math.max(...pmf) : 0.1;
  const yScaleMax = maxPMFVal * 1.15; // Give some headroom

  return (
    <div className="my-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg max-w-3xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Binomialfordeling
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Juster antal forsøg <span className="font-mono font-bold">n</span> og succes-sandsynlighed <span className="font-mono font-bold">p</span>, og beregn sandsynligheden for et udvalgt interval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Distribution (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none text-slate-350 dark:text-slate-700"
            >
              {/* Axes lines */}
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX + 15}
                y2={svgHeight - paddingY}
                className="stroke-slate-400 dark:stroke-slate-650"
                strokeWidth="1.5"
              />
              <line
                x1={paddingX}
                y1={paddingY - 10}
                x2={paddingX}
                y2={svgHeight - paddingY}
                className="stroke-slate-400 dark:stroke-slate-650"
                strokeWidth="1.5"
              />

              {/* Y Axis ticks */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const val = pct * yScaleMax;
                const y = svgHeight - paddingY - (val / yScaleMax) * (svgHeight - 2 * paddingY);
                return (
                  <g key={`y-tick-${idx}`}>
                    <line
                      x1={paddingX - 4}
                      y1={y}
                      x2={paddingX}
                      y2={y}
                      className="stroke-slate-400 dark:stroke-slate-600"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-slate-400 dark:fill-slate-500 font-outfit text-[9px] font-bold"
                    >
                      {(val * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Draw bars */}
              {pmf.map((val, idx) => {
                const barWidth = Math.max(1.5, ((svgWidth - 2 * paddingX) / (n + 1)) * 0.75);
                const step = (svgWidth - 2 * paddingX) / n;
                const x = paddingX + idx * step - barWidth / 2;
                const height = (val / yScaleMax) * (svgHeight - 2 * paddingY);
                const y = svgHeight - paddingY - height;
                const active = isSelected(idx);

                return (
                  <g key={`bar-${idx}`} className="group">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(1, height)}
                      rx={Math.min(2, barWidth / 3)}
                      className={`transition-colors duration-150 ${
                        active
                          ? 'fill-brand-500 dark:fill-sky-400 stroke-brand-650 dark:stroke-sky-300'
                          : 'fill-slate-200 hover:fill-slate-300 dark:fill-slate-800 dark:hover:fill-slate-750 stroke-slate-300 dark:stroke-slate-850'
                      }`}
                      strokeWidth="0.5"
                    />
                    {/* Hover tooltip details */}
                    <text
                      x={paddingX + idx * step}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-slate-700 dark:fill-slate-300 font-mono text-[9px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                    >
                      {(val * 100).toFixed(2)}%
                    </text>
                    
                    {/* X axis labels (draw occasionally if n is large) */}
                    {(n <= 20 || idx % Math.ceil(n / 10) === 0 || idx === n) && (
                      <g>
                        <line
                          x1={paddingX + idx * step}
                          y1={svgHeight - paddingY}
                          x2={paddingX + idx * step}
                          y2={svgHeight - paddingY + 4}
                          className="stroke-slate-400 dark:stroke-slate-650"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX + idx * step}
                          y={svgHeight - paddingY + 14}
                          textAnchor="middle"
                          className="fill-slate-400 dark:fill-slate-500 font-outfit text-[9px] font-bold"
                        >
                          {idx}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Mean Indicator */}
              <line
                x1={paddingX + mean * ((svgWidth - 2 * paddingX) / n)}
                y1={paddingY}
                x2={paddingX + mean * ((svgWidth - 2 * paddingX) / n)}
                y2={svgHeight - paddingY}
                className="stroke-emerald-500 dark:stroke-emerald-450"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>
          </div>
          
          <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-brand-500 dark:bg-sky-400 rounded-sm"></span> Valgt område
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-emerald-500 dark:border-emerald-450"></span> Middelværdi (μ)
            </span>
          </div>
        </div>

        {/* Sliders & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Parameter sliders */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Antal forsøg (n):</span>
                <span className="text-brand-600 dark:text-sky-400 font-mono">{n}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value) || 20)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Succes-sandsynlighed (p):</span>
                <span className="text-brand-600 dark:text-sky-400 font-mono">{(p * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={p}
                onChange={(e) => setP(parseFloat(e.target.value) || 0.5)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
              />
            </div>
          </div>

          {/* Probability calculation box */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Sandsynlighedsberegner
            </h5>

            <div className="flex flex-wrap gap-1.5">
              {(['exact', 'at_most', 'at_least', 'interval'] as Mode[]).map((m) => {
                const labels: Record<Mode, string> = {
                  exact: 'P(X = k)',
                  at_most: 'P(X ≤ k)',
                  at_least: 'P(X ≥ k)',
                  interval: 'P(a ≤ X ≤ b)'
                };
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                      mode === m
                        ? 'bg-brand-500 dark:bg-sky-500 text-white'
                        : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800'
                    }`}
                  >
                    {labels[m]}
                  </button>
                );
              })}
            </div>

            {/* Threshold controls */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {mode !== 'interval' ? (
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Værdi k:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max={n}
                      step="1"
                      value={k}
                      onChange={(e) => setK(parseInt(e.target.value) || 0)}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-mono w-6 text-right">{k}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Nedre grænse a:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="range"
                        min="0"
                        max={b}
                        step="1"
                        value={a}
                        onChange={(e) => setA(Math.min(b, parseInt(e.target.value) || 0))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
                      />
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-mono w-6 text-right">{a}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Øvre grænse b:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="range"
                        min={a}
                        max={n}
                        step="1"
                        value={b}
                        onChange={(e) => setB(Math.max(a, parseInt(e.target.value) || 0))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
                      />
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-mono w-6 text-right">{b}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Calculated output */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-850">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Resultat:</span>
              <div className="text-2xl font-extrabold text-brand-600 dark:text-sky-400 font-outfit mt-0.5">
                {(selectedProbability * 100).toFixed(2)} %
              </div>
            </div>
          </div>

          {/* Stats details */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[11px] font-medium text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-2">
            <div>
              Middelværdi (μ = np): <strong className="text-slate-700 dark:text-slate-300 font-mono">{mean.toFixed(2)}</strong>
            </div>
            <div>
              Spredning (σ): <strong className="text-slate-700 dark:text-slate-300 font-mono">{stdDev.toFixed(3)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinomialVisualizer;
