import React, { useState, useEffect } from 'react';

export const GroupedDataVisualizer: React.FC = () => {
  // Interval limits: [0, 10, 20, 30, 40, 50]
  const limits = [0, 10, 20, 30, 40, 50];
  const midpoints = [5, 15, 25, 35, 45];
  
  // Default frequencies
  const [frequencies, setFrequencies] = useState<number[]>([5, 12, 18, 10, 5]);
  const [activeQuartile, setActiveQuartile] = useState<'all' | 'q1' | 'q2' | 'q3' | 'none'>('all');

  // Calculations
  const n = frequencies.reduce((a, b) => a + b, 0);
  
  // Cumulative frequencies starting from 0
  const cumFreqs = [0];
  let runningSum = 0;
  for (let i = 0; i < frequencies.length; i++) {
    runningSum += frequencies[i];
    cumFreqs.push(runningSum);
  }

  // Estimated mean
  const estimatedMean = n > 0 
    ? frequencies.reduce((sum, f, i) => sum + f * midpoints[i], 0) / n 
    : 0;

  // Linear interpolation for quartile
  const getQuartile = (p: number) => {
    if (n === 0) return 0;
    const target = p * n;
    for (let i = 0; i < cumFreqs.length - 1; i++) {
      const fBefore = cumFreqs[i];
      const fAfter = cumFreqs[i + 1];
      if (target >= fBefore && target <= fAfter) {
        const a = limits[i];
        const b = limits[i + 1];
        if (fAfter === fBefore) return a;
        return a + ((target - fBefore) / (fAfter - fBefore)) * (b - a);
      }
    }
    return limits[limits.length - 1];
  };

  const q1 = getQuartile(0.25);
  const q2 = getQuartile(0.50);
  const q3 = getQuartile(0.75);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  // Helper coordinate mappers
  const getX = (val: number) => {
    return paddingLeft + (val / limits[limits.length - 1]) * (svgWidth - paddingLeft - paddingRight);
  };
  
  const getY = (cumFreq: number) => {
    if (n === 0) return svgHeight - paddingBottom;
    return svgHeight - paddingBottom - (cumFreq / n) * (svgHeight - paddingTop - paddingBottom);
  };

  // Frequency change handler
  const handleFreqChange = (index: number, val: number) => {
    const updated = [...frequencies];
    updated[index] = Math.max(0, val);
    setFrequencies(updated);
  };

  // Preset setter
  const applyPreset = (presetFreqs: number[]) => {
    setFrequencies(presetFreqs);
  };

  return (
    <div className="my-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg max-w-3xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Sumkurve & Kvartilaflæsning
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Juster hyppigheden for hvert interval for at se, hvordan sumkurven deformeres og kvartilerne flytter sig.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2 justify-center mb-6">
        <button
          onClick={() => applyPreset([5, 12, 18, 10, 5])}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            JSON.stringify(frequencies) === JSON.stringify([5, 12, 18, 10, 5])
              ? 'bg-brand-500 dark:bg-sky-500 text-white shadow'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Symmetrisk (Normal)
        </button>
        <button
          onClick={() => applyPreset([15, 15, 10, 5, 2])}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            JSON.stringify(frequencies) === JSON.stringify([15, 15, 10, 5, 2])
              ? 'bg-brand-500 dark:bg-sky-500 text-white shadow'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Højreskæv (Mange lave)
        </button>
        <button
          onClick={() => applyPreset([2, 5, 10, 15, 15])}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            JSON.stringify(frequencies) === JSON.stringify([2, 5, 10, 15, 15])
              ? 'bg-brand-500 dark:bg-sky-500 text-white shadow'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Venstreskæv (Mange høje)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Sumkurve (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none text-slate-350 dark:text-slate-700"
            >
              {/* Grid Lines & Axis Ticks */}
              {limits.map((limit, idx) => {
                const x = getX(limit);
                return (
                  <g key={`grid-x-${idx}`}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={svgHeight - paddingBottom}
                      className="stroke-slate-100 dark:stroke-slate-850"
                      strokeWidth="1"
                    />
                    <line
                      x1={x}
                      y1={svgHeight - paddingBottom}
                      x2={x}
                      y2={svgHeight - paddingBottom + 5}
                      className="stroke-slate-350 dark:stroke-slate-650"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={svgHeight - paddingBottom + 18}
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-500 font-outfit text-[10px] font-bold"
                    >
                      {limit}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis Ticks (Percentages) */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = getY(pct * n);
                return (
                  <g key={`grid-y-${idx}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      className="stroke-slate-100 dark:stroke-slate-850"
                      strokeWidth="1"
                    />
                    <line
                      x1={paddingLeft - 5}
                      y1={y}
                      x2={paddingLeft}
                      y2={y}
                      className="stroke-slate-350 dark:stroke-slate-650"
                      strokeWidth="1.5"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 dark:fill-slate-500 font-outfit text-[10px] font-bold"
                    >
                      {Math.round(pct * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* Axes Lines */}
              <line
                x1={paddingLeft}
                y1={svgHeight - paddingBottom}
                x2={svgWidth - paddingRight}
                y2={svgHeight - paddingBottom}
                className="stroke-slate-400 dark:stroke-slate-600"
                strokeWidth="2"
              />
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={svgHeight - paddingBottom}
                className="stroke-slate-400 dark:stroke-slate-600"
                strokeWidth="2"
              />

              {/* Draw Sumkurve path */}
              {n > 0 && (
                <path
                  d={limits.map((limit, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(limit)} ${getY(cumFreqs[idx])}`).join(' ')}
                  className="stroke-brand-500 dark:stroke-sky-400 fill-none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots on Sumkurve */}
              {n > 0 && limits.map((limit, idx) => {
                const cx = getX(limit);
                const cy = getY(cumFreqs[idx]);
                return (
                  <circle
                    key={`dot-${idx}`}
                    cx={cx}
                    cy={cy}
                    r="5"
                    className="fill-white stroke-brand-500 dark:fill-slate-900 dark:stroke-sky-400"
                    strokeWidth="2.5"
                  />
                );
              })}

              {/* Quartile Aflæsning Lines (Only if active) */}
              {n > 0 && (
                <>
                  {/* Q1 Aflæsning */}
                  {(activeQuartile === 'all' || activeQuartile === 'q1') && (
                    <g className="transition-opacity duration-200">
                      <line
                        x1={paddingLeft}
                        y1={getY(0.25 * n)}
                        x2={getX(q1)}
                        y2={getY(0.25 * n)}
                        className="stroke-teal-500 dark:stroke-teal-400"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <line
                        x1={getX(q1)}
                        y1={getY(0.25 * n)}
                        x2={getX(q1)}
                        y2={svgHeight - paddingBottom}
                        className="stroke-teal-500 dark:stroke-teal-400"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <circle
                        cx={getX(q1)}
                        cy={getY(0.25 * n)}
                        r="4.5"
                        className="fill-teal-500 dark:fill-teal-400"
                      />
                      <text
                        x={getX(q1)}
                        y={svgHeight - paddingBottom - 8}
                        textAnchor="middle"
                        className="fill-teal-700 dark:fill-teal-400 font-outfit text-[10px] font-extrabold"
                      >
                        Q₁ = {q1.toFixed(2)}
                      </text>
                    </g>
                  )}

                  {/* Median / Q2 Aflæsning */}
                  {(activeQuartile === 'all' || activeQuartile === 'q2') && (
                    <g className="transition-opacity duration-200">
                      <line
                        x1={paddingLeft}
                        y1={getY(0.50 * n)}
                        x2={getX(q2)}
                        y2={getY(0.50 * n)}
                        className="stroke-brand-500 dark:stroke-sky-400"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <line
                        x1={getX(q2)}
                        y1={getY(0.50 * n)}
                        x2={getX(q2)}
                        y2={svgHeight - paddingBottom}
                        className="stroke-brand-500 dark:stroke-sky-400"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <circle
                        cx={getX(q2)}
                        cy={getY(0.50 * n)}
                        r="4.5"
                        className="fill-brand-500 dark:fill-sky-450"
                      />
                      <text
                        x={getX(q2)}
                        y={svgHeight - paddingBottom - 8}
                        textAnchor="middle"
                        className="fill-brand-700 dark:fill-sky-300 font-outfit text-[10px] font-extrabold"
                      >
                        M = {q2.toFixed(2)}
                      </text>
                    </g>
                  )}

                  {/* Q3 Aflæsning */}
                  {(activeQuartile === 'all' || activeQuartile === 'q3') && (
                    <g className="transition-opacity duration-200">
                      <line
                        x1={paddingLeft}
                        y1={getY(0.75 * n)}
                        x2={getX(q3)}
                        y2={getY(0.75 * n)}
                        className="stroke-rose-500 dark:stroke-rose-450"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <line
                        x1={getX(q3)}
                        y1={getY(0.75 * n)}
                        x2={getX(q3)}
                        y2={svgHeight - paddingBottom}
                        className="stroke-rose-500 dark:stroke-rose-450"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <circle
                        cx={getX(q3)}
                        cy={getY(0.75 * n)}
                        r="4.5"
                        className="fill-rose-500 dark:fill-rose-400"
                      />
                      <text
                        x={getX(q3)}
                        y={svgHeight - paddingBottom - 8}
                        textAnchor="middle"
                        className="fill-rose-700 dark:fill-rose-400 font-outfit text-[10px] font-extrabold"
                      >
                        Q₃ = {q3.toFixed(2)}
                      </text>
                    </g>
                  )}
                </>
              )}
            </svg>
          </div>

          {/* Toggle buttons for visual layers */}
          <div className="flex gap-2.5 mt-2 justify-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider self-center mr-1">Vis:</span>
            <button
              onClick={() => setActiveQuartile(activeQuartile === 'all' ? 'none' : 'all')}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                activeQuartile === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setActiveQuartile('q1')}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                activeQuartile === 'q1' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-teal-600'
              }`}
            >
              Q₁ (25%)
            </button>
            <button
              onClick={() => setActiveQuartile('q2')}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                activeQuartile === 'q2' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-sky-400'
              }`}
            >
              Median (50%)
            </button>
            <button
              onClick={() => setActiveQuartile('q3')}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                activeQuartile === 'q3' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-rose-600'
              }`}
            >
              Q₃ (75%)
            </button>
          </div>
        </div>

        {/* Sliders and Info Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5">
              Juster Hyppigheder (hᵢ)
            </h5>

            <div className="space-y-3.5">
              {frequencies.map((f, i) => {
                const label = i === frequencies.length - 1 
                  ? `[${limits[i]} ; ${limits[i + 1]}]` 
                  : `[${limits[i]} ; ${limits[i + 1]}[`;

                return (
                  <div key={`input-${i}`} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Interval {label}:</span>
                      <span className="text-brand-600 dark:text-sky-400">{f} obs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={f}
                      onChange={(e) => handleFreqChange(i, parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results box */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-sm space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Samlet observationer (n):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{n}</span>
            </div>
            
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Estimeret Gennemsnit (x̄):</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{estimatedMean.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 text-center">
              <div className="bg-teal-50 dark:bg-teal-950/30 p-1.5 rounded-lg border border-teal-100 dark:border-teal-900/40">
                <div className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase">Nedre Q₁</div>
                <div className="font-extrabold text-teal-800 dark:text-teal-300 text-xs mt-0.5">{q1.toFixed(2)}</div>
              </div>
              <div className="bg-brand-50 dark:bg-sky-950/30 p-1.5 rounded-lg border border-brand-100 dark:border-sky-900/40">
                <div className="text-[9px] font-bold text-brand-600 dark:text-sky-400 uppercase">Median Q₂</div>
                <div className="font-extrabold text-brand-800 dark:text-sky-300 text-xs mt-0.5">{q2.toFixed(2)}</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                <div className="text-[9px] font-bold text-rose-600 dark:text-rose-450 uppercase">Øvre Q₃</div>
                <div className="font-extrabold text-rose-800 dark:text-rose-350 text-xs mt-0.5">{q3.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupedDataVisualizer;
