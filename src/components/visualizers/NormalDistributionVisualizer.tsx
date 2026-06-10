import React, { useState, useEffect } from 'react';

type NormalMode = 'at_most' | 'at_least' | 'interval';

export const NormalDistributionVisualizer: React.FC = () => {
  // Parameters (x-range is fixed to [0, 100])
  const [mu, setMu] = useState<number>(50);
  const [sigma, setSigma] = useState<number>(10);
  const [mode, setMode] = useState<NormalMode>('interval');
  
  // Threshold values in x scale (0 to 100)
  const [a, setA] = useState<number>(40);
  const [b, setB] = useState<number>(65);

  // Keep limits in order
  useEffect(() => {
    if (a > b) setA(b);
  }, [b]);

  useEffect(() => {
    if (b < a) setB(a);
  }, [a]);

  // High-accuracy standard normal CDF approximation (Abramowitz & Stegun 26.2.17)
  const phi = (z: number): number => {
    const p = 0.2316419;
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    
    const t = 1 / (1 + p * Math.abs(z));
    const fact = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
    const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    const val = 1 - pdf * fact;
    return z >= 0 ? val : 1 - val;
  };

  // Normal distribution PDF
  const pdfVal = (x: number, m: number, s: number) => {
    return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - m, 2) / (2 * Math.pow(s, 2)));
  };

  // Probability calculations
  const za = (a - mu) / sigma;
  const zb = (b - mu) / sigma;

  let probability = 0;
  if (mode === 'at_most') {
    probability = phi(zb);
  } else if (mode === 'at_least') {
    probability = 1 - phi(za);
  } else if (mode === 'interval') {
    probability = phi(zb) - phi(za);
  }

  // Preset settings
  const applyPreset = (presetMu: number, presetSigma: number, presetMode: NormalMode, presetA: number, presetB: number) => {
    setMu(presetMu);
    setSigma(presetSigma);
    setMode(presetMode);
    setA(presetA);
    setB(presetB);
  };

  // SVG coordinate conversions
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingBottom = 35;
  const paddingTop = 30;

  const getX = (val: number) => {
    return paddingX + (val / 100) * (svgWidth - 2 * paddingX);
  };

  // Peak of standard normal curve is at x=mu, where PDF = 1 / (sigma * sqrt(2pi))
  // We scale the y axis based on the minimum possible sigma (which has the highest peak)
  const minSigma = 4;
  const maxPDFHeight = pdfVal(0, 0, minSigma);
  
  const getY = (yVal: number) => {
    const scaleY = svgHeight - paddingBottom - paddingTop;
    return svgHeight - paddingBottom - (yVal / maxPDFHeight) * scaleY;
  };

  // Generate curve path
  const points: { x: number; y: number }[] = [];
  const resolution = 150; // number of points to draw curve
  for (let i = 0; i <= resolution; i++) {
    const xVal = (i / resolution) * 100;
    const yVal = pdfVal(xVal, mu, sigma);
    points.push({ x: getX(xVal), y: getY(yVal) });
  }
  const curvePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate highlighted area path
  let highlightPath = '';
  if (points.length > 0) {
    const startXVal = mode === 'at_most' ? 0 : a;
    const endXVal = mode === 'at_least' ? 100 : b;
    
    const hPoints: string[] = [];
    // Start at bottom left of the highlighted area
    hPoints.push(`M ${getX(startXVal)} ${svgHeight - paddingBottom}`);
    
    // Add curve points within range
    for (let i = 0; i <= resolution; i++) {
      const xVal = (i / resolution) * 105 - 2.5; // slight padding
      const clampedX = Math.max(0, Math.min(100, xVal));
      if (clampedX >= startXVal && clampedX <= endXVal) {
        hPoints.push(`L ${getX(clampedX)} ${getY(pdfVal(clampedX, mu, sigma))}`);
      }
    }
    
    // Close at bottom right of the highlighted area
    hPoints.push(`L ${getX(endXVal)} ${svgHeight - paddingBottom}`);
    hPoints.push('Z');
    highlightPath = hPoints.join(' ');
  }

  return (
    <div className="my-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg max-w-3xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Normalfordeling & Areal
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Flyt middelværdien <span className="font-mono font-bold">μ</span> og spredningen <span className="font-mono font-bold">σ</span> for at transformere klokkekurven, og se arealet (sandsynligheden) opdateret live.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button
          onClick={() => applyPreset(50, 8, 'interval', 42, 58)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          68% Interval (±1σ)
        </button>
        <button
          onClick={() => applyPreset(50, 8, 'interval', 34, 66)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          95% Interval (±2σ)
        </button>
        <button
          onClick={() => applyPreset(50, 10, 'at_most', 0, 50)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Halvdelen (Højst μ)
        </button>
        <button
          onClick={() => applyPreset(62, 5, 'interval', 57, 72)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Høj eller smal kurve
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG bell curve (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none text-slate-350 dark:text-slate-700"
            >
              {/* Highlight Area */}
              {highlightPath && (
                <path
                  d={highlightPath}
                  className="fill-brand-500/20 dark:fill-sky-400/25 stroke-none"
                />
              )}

              {/* Main Curve Path */}
              <path
                d={curvePath}
                className="stroke-brand-500 dark:stroke-sky-400 fill-none"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* X Axis ticks (ticks at 0, 10, 20, ..., 100) */}
              {Array.from({ length: 11 }).map((_, idx) => {
                const val = idx * 10;
                const x = getX(val);
                return (
                  <g key={`x-tick-${idx}`}>
                    <line
                      x1={x}
                      y1={svgHeight - paddingBottom}
                      x2={x}
                      y2={svgHeight - paddingBottom + 5}
                      className="stroke-slate-400 dark:stroke-slate-650"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={svgHeight - paddingBottom + 17}
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-500 font-outfit text-[9px] font-bold"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Axis Line */}
              <line
                x1={paddingX - 10}
                y1={svgHeight - paddingBottom}
                x2={svgWidth - paddingX + 10}
                y2={svgHeight - paddingBottom}
                className="stroke-slate-400 dark:stroke-slate-600"
                strokeWidth="2"
              />

              {/* Mean Line (dashed) */}
              <line
                x1={getX(mu)}
                y1={getY(pdfVal(mu, mu, sigma))}
                x2={getX(mu)}
                y2={svgHeight - paddingBottom}
                className="stroke-brand-650 dark:stroke-sky-300"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* standard deviation brackets (μ ± σ) */}
              {sigma > 3 && (
                <g className="opacity-80">
                  <line
                    x1={getX(mu - sigma)}
                    y1={getY(pdfVal(mu - sigma, mu, sigma)) + 5}
                    x2={getX(mu - sigma)}
                    y2={svgHeight - paddingBottom}
                    className="stroke-slate-400 dark:stroke-slate-650"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={getX(mu + sigma)}
                    y1={getY(pdfVal(mu + sigma, mu, sigma)) + 5}
                    x2={getX(mu + sigma)}
                    y2={svgHeight - paddingBottom}
                    className="stroke-slate-400 dark:stroke-slate-650"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                </g>
              )}

              {/* Area boundary markers */}
              {mode !== 'at_most' && (
                <g>
                  <line
                    x1={getX(a)}
                    y1={getY(pdfVal(a, mu, sigma))}
                    x2={getX(a)}
                    y2={svgHeight - paddingBottom}
                    className="stroke-teal-600 dark:stroke-teal-400"
                    strokeWidth="2"
                  />
                  <circle cx={getX(a)} cy={svgHeight - paddingBottom} r="3.5" className="fill-teal-600 dark:fill-teal-400" />
                  <text
                    x={getX(a)}
                    y={svgHeight - paddingBottom - 6}
                    textAnchor="middle"
                    className="fill-teal-700 dark:fill-teal-400 font-outfit text-[8px] font-extrabold"
                  >
                    a = {a}
                  </text>
                </g>
              )}

              {mode !== 'at_least' && (
                <g>
                  <line
                    x1={getX(b)}
                    y1={getY(pdfVal(b, mu, sigma))}
                    x2={getX(b)}
                    y2={svgHeight - paddingBottom}
                    className="stroke-rose-600 dark:stroke-rose-400"
                    strokeWidth="2"
                  />
                  <circle cx={getX(b)} cy={svgHeight - paddingBottom} r="3.5" className="fill-rose-600 dark:fill-rose-400" />
                  <text
                    x={getX(b)}
                    y={svgHeight - paddingBottom - 6}
                    textAnchor="middle"
                    className="fill-rose-700 dark:fill-rose-450 font-outfit text-[8px] font-extrabold"
                  >
                    b = {b}
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-brand-500/20 dark:bg-sky-400/25 border border-brand-500/40 rounded-sm"></span> Areal = P(X ∈ interval)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-brand-650 dark:border-sky-300"></span> Middelværdi (μ)
            </span>
          </div>
        </div>

        {/* Controls & Statistics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Parameter Sliders */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Middelværdi (μ):</span>
                <span className="text-brand-600 dark:text-sky-400 font-mono">{mu}</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="1"
                value={mu}
                onChange={(e) => setMu(parseInt(e.target.value) || 50)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Spredning (σ):</span>
                <span className="text-brand-600 dark:text-sky-400 font-mono">{sigma}</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="0.5"
                value={sigma}
                onChange={(e) => setSigma(parseFloat(e.target.value) || 8)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
              />
            </div>
          </div>

          {/* Probability Calculator */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Sandsynlighedsberegner
            </h5>

            <div className="flex gap-1.5">
              {(['at_most', 'at_least', 'interval'] as NormalMode[]).map((m) => {
                const labels: Record<NormalMode, string> = {
                  at_most: 'P(X ≤ b)',
                  at_least: 'P(X ≥ a)',
                  interval: 'P(a ≤ X ≤ b)'
                };
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                      mode === m
                        ? 'bg-brand-500 dark:bg-sky-500 text-white shadow'
                        : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800'
                    }`}
                  >
                    {labels[m]}
                  </button>
                );
              })}
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-2.5 pt-1">
              {mode !== 'at_most' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">
                    <span>Nedre grænse a:</span>
                    <span className="text-teal-600 dark:text-teal-400 font-mono">z_a = {za.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max={b}
                      step="1"
                      value={a}
                      onChange={(e) => setA(Math.min(b, parseInt(e.target.value) || 0))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-650 dark:accent-teal-400"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono w-6 text-right">{a}</span>
                  </div>
                </div>
              )}

              {mode !== 'at_least' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">
                    <span>Øvre grænse b:</span>
                    <span className="text-rose-600 dark:text-rose-450 font-mono">z_b = {zb.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={a}
                      max="100"
                      step="1"
                      value={b}
                      onChange={(e) => setB(Math.max(a, parseInt(e.target.value) || 100))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-650 dark:accent-rose-450"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono w-6 text-right">{b}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Probability Output */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-850">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Areal (Sandsynlighed):</span>
              <div className="text-2xl font-extrabold text-brand-600 dark:text-sky-400 font-outfit mt-0.5">
                {(probability * 100).toFixed(2)} %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NormalDistributionVisualizer;
