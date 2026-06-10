import React, { useState, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

const MODELS = [
  {
    id: 'linear',
    name: "Konstant Vækst (Lineær)",
    desc: "Mængden vokser med en konstant hastighed over tid.",
    verbal: "Hastigheden y' er lig med en konstant a.",
    equation: "y' = a",
    formula: "y(x) = a · (x - x₀) + y₀"
  },
  {
    id: 'exponential',
    name: "Proportional Vækst (Eksponentiel)",
    desc: "Væksthastigheden er proportional med den aktuelle mængde.",
    verbal: "Hastigheden y' er proportional med y.",
    equation: "y' = k · y",
    formula: "y(x) = y₀ · e^(k · (x - x₀))"
  },
  {
    id: 'limited',
    name: "Begrænset Vækst (Newtonsk)",
    desc: "Væksthastigheden er proportional med afstanden til en øvre grænse M.",
    verbal: "Hastigheden y' er proportional med (M - y).",
    equation: "y' = k · (M - y)",
    formula: "y(x) = M - (M - y₀) · e^(-k · (x - x₀))"
  }
];

export const ModelVisualizer: React.FC = () => {
  const [modelId, setModelId] = useState<string>('exponential');
  const [x0, setX0] = useState<number>(0.0);
  const [y0, setY0] = useState<number>(1.0);
  const [paramA, setParamA] = useState<number>(0.5); // For linear: a
  const [paramK, setParamK] = useState<number>(0.5); // For exp/limited: k
  const [limitM, setLimitM] = useState<number>(3.0); // For limited: M

  const svgRef = useRef<SVGSVGElement>(null);

  const activeModel = MODELS.find(m => m.id === modelId) || MODELS[1];

  // Axis dimensions
  const xMin = 0, xMax = 4;
  const yMin = 0, yMax = 4;

  // Coordinate mapping
  const xToSvg = (x: number) => 60 + (x / xMax) * 400;
  const yToSvg = (y: number) => 340 - (y / yMax) * 300;
  const svgToX = (svgX: number) => Math.max(0, Math.min(4, ((svgX - 60) / 400) * 4));
  const svgToY = (svgY: number) => Math.max(0, Math.min(4, ((340 - svgY) / 300) * 4));

  // Handle click on grid to set (x0, y0)
  const handleGridClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to viewBox coordinates (500x400)
    const svgWidth = rect.width;
    const svgHeight = rect.height;
    const viewBoxX = (clickX / svgWidth) * 500;
    const viewBoxY = (clickY / svgHeight) * 400;

    // Only set if inside grid area
    if (viewBoxX >= 60 && viewBoxX <= 460 && viewBoxY >= 40 && viewBoxY <= 340) {
      const mathX = parseFloat(svgToX(viewBoxX).toFixed(2));
      const mathY = parseFloat(svgToY(viewBoxY).toFixed(2));
      setX0(mathX);
      setY0(mathY);
    }
  };

  // Evaluate slope
  const getSlope = (x: number, y: number) => {
    if (modelId === 'linear') {
      return paramA;
    } else if (modelId === 'exponential') {
      return paramK * y;
    } else {
      return paramK * (limitM - y);
    }
  };

  // Generate slope field points (11x11 grid)
  const slopeFieldPoints: { x: number; y: number }[] = [];
  for (let gx = 0; gx <= xMax; gx += 0.4) {
    for (let gy = 0; gy <= yMax; gy += 0.4) {
      slopeFieldPoints.push({ x: gx, y: gy });
    }
  }

  // Generate solution curve points
  const getSolutionPoints = () => {
    const points: Point[] = [];
    if (modelId === 'linear') {
      // y = a * (x - x0) + y0
      for (let x = 0; x <= 4.01; x += 0.05) {
        const y = paramA * (x - x0) + y0;
        if (y >= 0 && y <= 4.2) {
          points.push({ x, y });
        }
      }
    } else if (modelId === 'exponential') {
      // y = y0 * e^(k * (x - x0))
      for (let x = 0; x <= 4.01; x += 0.05) {
        const y = y0 * Math.exp(paramK * (x - x0));
        if (y >= 0 && y <= 4.2) {
          points.push({ x, y });
        }
      }
    } else {
      // y = M - (M - y0) * e^(-k * (x - x0))
      for (let x = 0; x <= 4.01; x += 0.05) {
        const y = limitM - (limitM - y0) * Math.exp(-paramK * (x - x0));
        if (y >= 0 && y <= 4.2) {
          points.push({ x, y });
        }
      }
    }
    return points;
  };

  const solutionPoints = getSolutionPoints();

  return (
    <div className="my-10 p-5 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-5xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-sky-400 bg-brand-50 dark:bg-sky-950/40 rounded-full">
          Interaktiv Modellering
        </span>
        <h3 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-slate-100 mt-2">
          Matematiske Modeller i Praxis
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl mx-auto">
          Skift mellem modellerne for at se hvordan de sproglige formuleringer oversættes til differentialligninger og skaber vidt forskellige forløb. Klik på grafen for at ændre <span className="font-semibold text-slate-700 dark:text-slate-350">(x₀, y₀)</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Graph (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[480px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 p-2">
            <svg
              ref={svgRef}
              viewBox="0 0 500 400"
              className="w-full h-auto cursor-crosshair overflow-visible select-none"
              onClick={handleGridClick}
            >
              {/* Axes & Grids */}
              {[0, 1, 2, 3, 4].map(val => (
                <g key={`grid-${val}`}>
                  <line
                    x1={xToSvg(val)}
                    y1={yToSvg(0)}
                    x2={xToSvg(val)}
                    y2={yToSvg(4)}
                    className="stroke-slate-200 dark:stroke-slate-800/80"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? "none" : "4 4"}
                  />
                  <line
                    x1={xToSvg(0)}
                    y1={yToSvg(val)}
                    x2={xToSvg(4)}
                    y2={yToSvg(val)}
                    className="stroke-slate-200 dark:stroke-slate-800/80"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? "none" : "4 4"}
                  />
                  <text
                    x={xToSvg(val)}
                    y={yToSvg(0) + 16}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 font-outfit text-[11px] font-bold"
                  >
                    {val}
                  </text>
                  <text
                    x={xToSvg(0) - 12}
                    y={yToSvg(val) + 4}
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-slate-600 font-outfit text-[11px] font-bold"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Axis Titles */}
              <text x="260" y="385" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase tracking-wider">x (Tid)</text>
              <text x="20" y="190" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase tracking-wider" transform="rotate(-90 20 190)">y (Mængde)</text>

              {/* Slope field lines */}
              {slopeFieldPoints.map((pt, idx) => {
                const slope = getSlope(pt.x, pt.y);
                if (isNaN(slope) || Math.abs(slope) > 12) return null;
                const angle = Math.atan(-0.85 * slope); // Aspect ratio correction
                const lineLen = 14;
                const dx = Math.cos(angle) * (lineLen / 2);
                const dy = Math.sin(angle) * (lineLen / 2);

                return (
                  <line
                    key={`sf-${idx}`}
                    x1={xToSvg(pt.x) - dx}
                    y1={yToSvg(pt.y) - dy}
                    x2={xToSvg(pt.x) + dx}
                    y2={yToSvg(pt.y) + dy}
                    className="stroke-slate-350 dark:stroke-slate-750/70 hover:stroke-brand-500 dark:hover:stroke-sky-400 transition-colors"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Limit M Indicator Line */}
              {modelId === 'limited' && (
                <g>
                  <line
                    x1={xToSvg(0)}
                    y1={yToSvg(limitM)}
                    x2={xToSvg(4)}
                    y2={yToSvg(limitM)}
                    className="stroke-rose-500/60 dark:stroke-rose-400/60"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                  <text
                    x={xToSvg(3.8)}
                    y={yToSvg(limitM) - 6}
                    textAnchor="end"
                    className="fill-rose-650 dark:fill-rose-450 font-outfit text-[10px] font-bold uppercase tracking-wider"
                  >
                    Grænse M = {limitM.toFixed(1)}
                  </text>
                </g>
              )}

              {/* Solution Curve */}
              {solutionPoints.length > 1 && (
                <path
                  d={solutionPoints.reduce((acc, pt, idx) => {
                    const sx = xToSvg(pt.x);
                    const sy = yToSvg(pt.y);
                    if (sy < 40 || sy > 340) return acc;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
                  }, '')}
                  fill="none"
                  className="stroke-brand-600 dark:stroke-sky-400"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Start point marker */}
              <g>
                <circle
                  cx={xToSvg(x0)}
                  cy={yToSvg(y0)}
                  r="11"
                  className="fill-brand-500/20 dark:fill-sky-400/20 stroke-brand-500 dark:stroke-sky-400 stroke-2 animate-ping"
                  style={{ animationDuration: '3.5s' }}
                />
                <circle
                  cx={xToSvg(x0)}
                  cy={yToSvg(y0)}
                  r="6.5"
                  className="fill-brand-600 dark:fill-sky-400 stroke-white dark:stroke-slate-900 stroke-2 shadow"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Configurations & Math steps (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Model selection */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Vælg Modeltype
            </label>
            <div className="flex flex-col space-y-2">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setModelId(m.id);
                    // clamp y0 if switching to limited
                    if (m.id === 'limited' && y0 > limitM + 0.5) {
                      setY0(limitM - 1 > 0 ? limitM - 1 : 1);
                    }
                  }}
                  className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                    modelId === m.id
                      ? "bg-brand-50 dark:bg-sky-950/45 border-brand-500 dark:border-sky-500 text-brand-700 dark:text-sky-300"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Model specific controls */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Parametre
            </h4>

            {/* Parameter A (For linear) */}
            {modelId === 'linear' && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-400 mb-1">
                  <span>Hældning (a):</span>
                  <span className="font-mono text-brand-600 dark:text-sky-400">{paramA.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="1.5"
                  step="0.05"
                  value={paramA}
                  onChange={(e) => setParamA(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
                />
              </div>
            )}

            {/* Parameter K (For exp/limited) */}
            {modelId !== 'linear' && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-400 mb-1">
                  <span>Vækstfaktor (k):</span>
                  <span className="font-mono text-brand-600 dark:text-sky-400">{paramK.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={modelId === 'exponential' ? "-1.0" : "0.1"}
                  max="1.5"
                  step="0.05"
                  value={paramK}
                  onChange={(e) => setParamK(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
                />
              </div>
            )}

            {/* Limit M (For limited) */}
            {modelId === 'limited' && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-400 mb-1">
                  <span>Grænseværdi (M):</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">{limitM.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.2"
                  value={limitM}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setLimitM(val);
                    if (y0 > val) setY0(val);
                  }}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            )}

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-slate-850/60 pt-3">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Start x₀:</span>
                <span className="font-mono text-sm text-slate-700 dark:text-slate-350">{x0.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Start y₀:</span>
                <span className="font-mono text-sm text-slate-700 dark:text-slate-350">{y0.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Model details / translation key */}
          <div className="p-4 bg-slate-950/90 dark:bg-slate-950/80 text-white rounded-xl border border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Beskrivelse</span>
              <p className="text-xs text-slate-200 mt-0.5">{activeModel.desc}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Verbal oversættelse</span>
                <span className="text-xs font-semibold text-brand-350 dark:text-sky-350">{activeModel.verbal}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Differentialligning</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{activeModel.equation}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Eksplicit Løsningsformel</span>
              <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">{activeModel.formula}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelVisualizer;
