import React, { useState } from 'react';

export const LogisticVisualizer: React.FC = () => {
  // Parameters
  const [k, setK] = useState<number>(0.6); // Growth rate
  const [M, setM] = useState<number>(100); // Carrying capacity (bæreevne)
  const [y0, setY0] = useState<number>(10); // Initial population
  const [tScrub, setTScrub] = useState<number>(3); // Scrubber time value
  const [showSlopeField, setShowSlopeField] = useState<boolean>(true);

  // Compute logistic constant c
  const cVal = y0 > 0 ? (M - y0) / y0 : 0;

  // Evaluate logistic function: y(t) = M / (1 + c * e^(-k*t))
  const getLogisticY = (t: number) => {
    if (y0 <= 0) return 0;
    return M / (1 + cVal * Math.exp(-k * t));
  };

  // Evaluate instantaneous growth rate: y'(t) = k * y * (M - y)/M
  const getGrowthRate = (y: number) => {
    return k * y * (1 - y / M);
  };

  // Plot boundaries
  const tMin = 0, tMax = 10;
  const yMin = 0, yMax = 150;

  // SVG coordinates mapping
  const tToSvg = (t: number) => 60 + (t / tMax) * 400;
  const yToSvg = (y: number) => 310 - (y / yMax) * 280;

  // Generate curve points for polyline
  const curvePoints: { t: number; y: number }[] = [];
  for (let t = 0; t <= 10; t += 0.1) {
    curvePoints.push({ t, y: getLogisticY(t) });
  }

  // Calculate vendepunkt (inflection point)
  // y = M / 2  => t = ln(c) / k
  const hasInflection = cVal > 1 && y0 < M / 2;
  const tInflection = hasInflection ? Math.log(cVal) / k : null;
  const yInflection = M / 2;

  // Active state at scrubber
  const activeY = getLogisticY(tScrub);
  const activeRate = getGrowthRate(activeY);

  // Generate slope field grid (11x11 grid)
  const slopeFieldPoints: { t: number; y: number }[] = [];
  for (let gt = 0; gt <= tMax; gt += 1.0) {
    for (let gy = 15; gy <= yMax; gy += 15) {
      slopeFieldPoints.push({ t: gt, y: gy });
    }
  }

  return (
    <div className="my-10 p-5 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-5xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-sky-400 bg-brand-50 dark:bg-sky-950/40 rounded-full">
          Interaktiv Model
        </span>
        <h3 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-slate-100 mt-2">
          Logistisk Vækst & S-kurve
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl mx-auto">
          Undersøg bæreevne <span className="font-semibold text-slate-700 dark:text-slate-300">(M)</span>, væksthastighed <span className="font-semibold text-slate-700 dark:text-slate-300">(k)</span> og begyndelsesværdi <span className="font-semibold text-slate-700 dark:text-slate-300">(y₀)</span>. Træk i scrubberen under grafen for at aflæse væksthastigheden over tid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Graph (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[480px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 p-2">
            <svg viewBox="0 0 500 350" className="w-full h-auto overflow-visible select-none">
              {/* Grid Lines */}
              {[0, 2, 4, 6, 8, 10].map(val => (
                <g key={`t-grid-${val}`}>
                  <line 
                    x1={tToSvg(val)} 
                    y1={yToSvg(0)} 
                    x2={tToSvg(val)} 
                    y2={yToSvg(150)} 
                    className="stroke-slate-200 dark:stroke-slate-800/80" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={tToSvg(val)} 
                    y={yToSvg(0) + 18} 
                    textAnchor="middle" 
                    className="fill-slate-400 dark:fill-slate-650 font-outfit text-[11px] font-semibold"
                  >
                    t={val}
                  </text>
                </g>
              ))}

              {[0, 30, 60, 90, 120, 150].map(val => (
                <g key={`y-grid-${val}`}>
                  <line 
                    x1={tToSvg(0)} 
                    y1={yToSvg(val)} 
                    x2={tToSvg(10)} 
                    y2={yToSvg(val)} 
                    className="stroke-slate-200 dark:stroke-slate-800/80" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={tToSvg(0) - 12} 
                    y={yToSvg(val) + 4} 
                    textAnchor="end" 
                    className="fill-slate-400 dark:fill-slate-650 font-outfit text-[11px] font-semibold"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Axis Labels */}
              <text x="260" y="342" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase tracking-wider">Tid (t)</text>
              <text x="20" y="170" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase tracking-wider" transform="rotate(-90 20 170)">Population (y)</text>

              {/* Slope Field */}
              {showSlopeField && slopeFieldPoints.map((pt, idx) => {
                const slope = getGrowthRate(pt.y);
                // scaling slope to SVG aspect ratio (10 t-units = 400px, 150 y-units = 280px)
                // aspect = (280/150) / (400/10) = 1.866 / 40 = 0.0466
                const angle = Math.atan(-0.0466 * slope);
                const lineLen = 12;
                const dx = Math.cos(angle) * (lineLen / 2);
                const dy = Math.sin(angle) * (lineLen / 2);
                const sx = tToSvg(pt.t);
                const sy = yToSvg(pt.y);

                return (
                  <line
                    key={`sf-${idx}`}
                    x1={sx - dx}
                    y1={sy - dy}
                    x2={sx + dx}
                    y2={sy + dy}
                    className="stroke-slate-300 dark:stroke-slate-800/60"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Carrying Capacity (M) Indicator Line */}
              <line
                x1={tToSvg(0)}
                y1={yToSvg(M)}
                x2={tToSvg(10)}
                y2={yToSvg(M)}
                className="stroke-rose-500/60 dark:stroke-rose-400/60"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <text
                x={tToSvg(9.5)}
                y={yToSvg(M) - 6}
                textAnchor="end"
                className="fill-rose-600 dark:fill-rose-400 font-outfit text-xs font-bold"
              >
                Bæreevne M = {M}
              </text>

              {/* Inflection Point Line (y = M/2) */}
              {hasInflection && tInflection !== null && tInflection <= 10 && (
                <g>
                  <line
                    x1={tToSvg(0)}
                    y1={yToSvg(yInflection)}
                    x2={tToSvg(tInflection)}
                    y2={yToSvg(yInflection)}
                    className="stroke-emerald-400/50 dark:stroke-emerald-500/35"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={tToSvg(tInflection)}
                    y1={yToSvg(yInflection)}
                    x2={tToSvg(tInflection)}
                    y2={yToSvg(0)}
                    className="stroke-emerald-400/50 dark:stroke-emerald-500/35"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={tToSvg(tInflection)}
                    cy={yToSvg(yInflection)}
                    r="5"
                    className="fill-emerald-500 dark:fill-emerald-400 stroke-white dark:stroke-slate-900 stroke-1.5 shadow"
                  />
                  <text
                    x={tToSvg(tInflection) + 8}
                    y={yToSvg(yInflection) - 4}
                    className="fill-emerald-600 dark:fill-emerald-400 font-outfit text-[10px] font-bold"
                  >
                    Vendepunkt (y = M/2 = {yInflection})
                  </text>
                </g>
              )}

              {/* Main Logistic Curve */}
              {curvePoints.length > 1 && (
                <path
                  d={curvePoints.reduce((acc, pt, idx) => {
                    const sx = tToSvg(pt.t);
                    const sy = yToSvg(pt.y);
                    if (sy < 15 || sy > 325) return acc;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
                  }, '')}
                  fill="none"
                  className="stroke-brand-600 dark:stroke-sky-400"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Scrubber Position Dot */}
              <g>
                <line
                  x1={tToSvg(tScrub)}
                  y1={yToSvg(0)}
                  x2={tToSvg(tScrub)}
                  y2={yToSvg(activeY)}
                  className="stroke-slate-400 dark:stroke-slate-600"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={tToSvg(tScrub)}
                  cy={yToSvg(activeY)}
                  r="7.5"
                  className="fill-brand-600 dark:fill-sky-400 stroke-white dark:stroke-slate-900 stroke-[2px] shadow-lg"
                />
              </g>
            </svg>
          </div>

          {/* Time Scrubber Slider */}
          <div className="w-full max-w-[480px] mt-4 space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Undersøg tidspunkt (t):</span>
              <span className="font-mono text-brand-600 dark:text-sky-400">{tScrub.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={tScrub}
              onChange={(e) => setTScrub(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
            />
          </div>
        </div>

        {/* Configurations & Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sliders */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Model Parametre
            </h4>

            {/* Carrying Capacity (M) */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Bæreevne (M):</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">{M}</span>
              </div>
              <input
                type="range"
                min="40"
                max="130"
                step="5"
                value={M}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setM(val);
                  if (y0 > val + 10) setY0(val); // clamp y0
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Growth Rate (k) */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Vækstrate (k):</span>
                <span className="font-mono text-brand-600 dark:text-sky-400">{k.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={k}
                onChange={(e) => setK(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-450"
              />
            </div>

            {/* Initial population (y0) */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Begyndelsesværdi (y₀):</span>
                <span className="font-mono text-slate-700 dark:text-slate-350">{y0}</span>
              </div>
              <input
                type="range"
                min="2"
                max="140"
                step="2"
                value={y0}
                onChange={(e) => setY0(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500"
              />
            </div>

            {/* Checkbox for Direction field */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-400">
                <input 
                  type="checkbox" 
                  checked={showSlopeField} 
                  onChange={(e) => setShowSlopeField(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-600 dark:text-sky-500 focus:ring-brand-500" 
                />
                <span>Vis underliggende retningsfelt (hældninger)</span>
              </label>
            </div>
          </div>

          {/* Instantaneous Values Box */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-850 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Aflæsninger (t = {tScrub.toFixed(1)})
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-150 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Population (y)</span>
                <span className="text-lg font-outfit font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                  {activeY.toFixed(1)}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-150 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Hældning (y')</span>
                <span className="text-lg font-outfit font-extrabold text-brand-600 dark:text-sky-400 font-mono">
                  {activeRate.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Interactive equation breakdown */}
            <div className="font-mono text-xs text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-150 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 pb-1">Beregning af y':</div>
              <div>dy/dt = k &middot; y &middot; (M - y)/M</div>
              <div className="text-brand-600 dark:text-sky-400 font-semibold">
                dy/dt = {k.toFixed(2)} &middot; {activeY.toFixed(1)} &middot; ({M} - {activeY.toFixed(1)})/{M}
              </div>
              <div className="font-bold border-t border-slate-100 dark:border-slate-850 pt-1 text-slate-800 dark:text-slate-100">
                dy/dt = {activeRate.toFixed(3)}
              </div>
            </div>

            {/* Explanation of inflection point or state */}
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-brand-50/10 dark:bg-sky-950/15 p-3 rounded-lg border border-brand-100/35 dark:border-sky-900/15">
              {y0 >= M ? (
                <p>
                  Da begyndelsesværdien <span className="font-semibold">y₀ ({y0}) &ge; M ({M})</span>, starter populationen over bæreevnen. Kurven aftager mod bæreevnen uden et vendepunkt.
                </p>
              ) : y0 >= M / 2 ? (
                <p>
                  Da begyndelsesværdien <span className="font-semibold">y₀ ({y0}) &ge; M/2 ({M/2})</span>, er populationen allerede forbi den maksimale væksthastighed. Væksthastigheden er aftagende fra start.
                </p>
              ) : (
                <p>
                  Da <span className="font-semibold">y₀ ({y0}) &lt; M/2 ({M/2})</span>, har vi en fuld S-form. Væksten stiger indtil vendepunktet ved <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">y = {M/2}</span> (ved <span className="font-semibold font-mono">t = {tInflection?.toFixed(2)}</span>), hvorefter den aftager mod bæreevnen.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticVisualizer;
