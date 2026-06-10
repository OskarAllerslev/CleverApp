import React, { useState, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

const EQUATIONS = [
  { 
    id: '1', 
    name: "y' = k · y", 
    latex: "\\frac{dy}{dx} = k \\cdot y",
    desc: "Klassisk eksponentiel model. Vokser eller aftager afhængigt af k." 
  },
  { 
    id: '2', 
    name: "y' = -x / y", 
    latex: "\\frac{dy}{dx} = -\\frac{x}{y}",
    desc: "Hældningerne danner cirkler. Hældningen er vinkelret på stedvektoren." 
  },
  { 
    id: '3', 
    name: "y' = x · y", 
    latex: "\\frac{dy}{dx} = x \\cdot y",
    desc: "Giver hurtig vækst i begge retninger (klokkeformede kurver)." 
  }
];

export const SeparationVisualizer: React.FC = () => {
  const [eqId, setEqId] = useState<string>('2');
  const [x0, setX0] = useState<number>(1.5);
  const [y0, setY0] = useState<number>(1.5);
  const [k, setK] = useState<number>(0.5); // Parameter for eq 1
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedEq = EQUATIONS.find(e => e.id === eqId) || EQUATIONS[1];

  // Axis dimensions [-4, 4]
  const xMin = -4, xMax = 4;
  const yMin = -4, yMax = 4;

  // Coordinate mapping
  const xToSvg = (x: number) => 60 + ((x + 4) / 8) * 400;
  const yToSvg = (y: number) => 340 - ((y + 4) / 8) * 300;
  const svgToX = (svgX: number) => -4 + ((svgX - 60) / 400) * 8;
  const svgToY = (svgY: number) => -4 + ((340 - svgY) / 300) * 8;

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

    // Set if inside grid area
    if (viewBoxX >= 60 && viewBoxX <= 460 && viewBoxY >= 40 && viewBoxY <= 340) {
      const mathX = parseFloat(svgToX(viewBoxX).toFixed(2));
      const mathY = parseFloat(svgToY(viewBoxY).toFixed(2));
      
      // Prevent division by zero or out of bounds for y' = -x/y
      if (eqId === '2' && Math.abs(mathY) < 0.05) {
        setY0(mathY >= 0 ? 0.1 : -0.1);
      } else {
        setY0(mathY);
      }
      setX0(mathX);
    }
  };

  // Evaluate slope
  const getSlope = (x: number, y: number) => {
    if (eqId === '1') {
      return k * y;
    } else if (eqId === '2') {
      if (Math.abs(y) < 0.0001) return y >= 0 ? 9999 : -9999;
      return -x / y;
    } else {
      return x * y;
    }
  };

  // Generate slope field points (11x11 grid)
  const slopeFieldPoints: { x: number; y: number }[] = [];
  for (let gx = -3.6; gx <= 3.61; gx += 0.8) {
    for (let gy = -3.6; gy <= 3.61; gy += 0.8) {
      // Avoid placing lines too close to y=0 for eq 2 (where slopes explode)
      if (eqId === '2' && Math.abs(gy) < 0.2) continue;
      slopeFieldPoints.push({ x: gx, y: gy });
    }
  }

  // Generate analytical solution curve points
  const getAnalyticalPath = () => {
    const points: Point[] = [];
    if (eqId === '1') {
      // y = C * e^(kx) => y(x) = y0 * e^(k(x - x0))
      for (let x = -4; x <= 4; x += 0.1) {
        const y = y0 * Math.exp(k * (x - x0));
        if (Math.abs(y) <= 4.2) {
          points.push({ x, y });
        }
      }
    } else if (eqId === '2') {
      // x^2 + y^2 = R^2 => y = +/- sqrt(R^2 - x^2)
      // Radius R
      const R = Math.sqrt(x0 * x0 + y0 * y0);
      const isPositive = y0 >= 0;
      // Draw semicircle
      for (let x = -R; x <= R; x += R / 40) {
        const rad = R * R - x * x;
        if (rad >= 0) {
          const y = (isPositive ? 1 : -1) * Math.sqrt(rad);
          points.push({ x, y });
        }
      }
    } else {
      // y' = xy => ln|y| = 0.5x^2 + C => y = y0 * e^(0.5(x^2 - x0^2))
      for (let x = -4; x <= 4; x += 0.1) {
        const y = y0 * Math.exp(0.5 * (x * x - x0 * x0));
        if (Math.abs(y) <= 4.2) {
          points.push({ x, y });
        }
      }
    }
    return points;
  };

  const solutionPoints = getAnalyticalPath();

  // Mathematical explanations
  const getExplanation = () => {
    if (eqId === '1') {
      const c = y0 / Math.exp(k * x0);
      return (
        <div className="space-y-2 font-mono text-xs text-slate-700 dark:text-slate-350">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-1.5 font-outfit uppercase">Separations Trin:</div>
          <div>1. Separer: (1/y) dy = k dx</div>
          <div>2. Integrer: ln|y| = kx + C₁</div>
          <div>3. General formel: y = C &middot; e^(kx)</div>
          <div className="font-semibold text-brand-600 dark:text-sky-400">
            4. Indsæt ({x0.toFixed(2)}, {y0.toFixed(2)}):
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{y0.toFixed(2)} = C &middot; e^({k.toFixed(2)} &middot; {x0.toFixed(2)})
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;C = {c.toFixed(4)}
          </div>
          <div className="font-extrabold text-slate-800 dark:text-slate-100 border-t border-slate-150 dark:border-slate-850 pt-1.5">
            Løsning: y = {c.toFixed(4)} &middot; e^({k.toFixed(2)}x)
          </div>
        </div>
      );
    } else if (eqId === '2') {
      const R2 = x0 * x0 + y0 * y0;
      const R = Math.sqrt(R2);
      return (
        <div className="space-y-2 font-mono text-xs text-slate-700 dark:text-slate-350">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-1.5 font-outfit uppercase">Separations Trin:</div>
          <div>1. Separer: y dy = -x dx</div>
          <div>2. Integrer: 0.5 y² = -0.5 x² + C₁</div>
          <div>3. General formel: x² + y² = C</div>
          <div className="font-semibold text-brand-600 dark:text-sky-400">
            4. Indsæt ({x0.toFixed(2)}, {y0.toFixed(2)}):
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{x0.toFixed(2)}² + {y0.toFixed(2)}² = C
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;C = {R2.toFixed(4)}
          </div>
          <div className="font-extrabold text-slate-800 dark:text-slate-100 border-t border-slate-150 dark:border-slate-850 pt-1.5">
            Løsning: x² + y² = {R2.toFixed(2)} (Radius: {R.toFixed(2)})
          </div>
        </div>
      );
    } else {
      const c = y0 / Math.exp(0.5 * x0 * x0);
      return (
        <div className="space-y-2 font-mono text-xs text-slate-700 dark:text-slate-350">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-1.5 font-outfit uppercase">Separations Trin:</div>
          <div>1. Separer: (1/y) dy = x dx</div>
          <div>2. Integrer: ln|y| = 0.5 x² + C₁</div>
          <div>3. General formel: y = C &middot; e^(0.5 x²)</div>
          <div className="font-semibold text-brand-600 dark:text-sky-400">
            4. Indsæt ({x0.toFixed(2)}, {y0.toFixed(2)}):
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{y0.toFixed(2)} = C &middot; e^(0.5 &middot; {x0.toFixed(2)}²)
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;C = {c.toFixed(4)}
          </div>
          <div className="font-extrabold text-slate-800 dark:text-slate-100 border-t border-slate-150 dark:border-slate-850 pt-1.5">
            Løsning: y = {c.toFixed(4)} &middot; e^(0.5 x²)
          </div>
        </div>
      );
    }
  };

  return (
    <div className="my-10 p-5 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-5xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-sky-400 bg-brand-50 dark:bg-sky-950/40 rounded-full">
          Interaktiv Løser
        </span>
        <h3 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-slate-100 mt-2">
          Separation af Variable
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl mx-auto">
          Klik et vilkårligt sted på planen for at indstille begyndelsesbetingelsen <span className="font-semibold text-slate-700 dark:text-slate-350">(x₀, y₀)</span>. Se hvordan separationsmetodens integrationskonstant C beregnes i realtid!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SVG Plane (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[480px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 p-2">
            <svg
              ref={svgRef}
              viewBox="0 0 500 400"
              className="w-full h-auto cursor-crosshair overflow-visible select-none"
              onClick={handleGridClick}
            >
              {/* Axes & Grids */}
              {[-4, -2, 0, 2, 4].map(val => (
                <g key={`grid-${val}`}>
                  <line
                    x1={xToSvg(val)}
                    y1={yToSvg(-4)}
                    x2={xToSvg(val)}
                    y2={yToSvg(4)}
                    className={val === 0 ? "stroke-slate-450 dark:stroke-slate-650" : "stroke-slate-200 dark:stroke-slate-800/60"}
                    strokeWidth={val === 0 ? 2 : 1}
                    strokeDasharray={val === 0 ? "none" : "3 3"}
                  />
                  <line
                    x1={xToSvg(-4)}
                    y1={yToSvg(val)}
                    x2={xToSvg(4)}
                    y2={yToSvg(val)}
                    className={val === 0 ? "stroke-slate-450 dark:stroke-slate-650" : "stroke-slate-200 dark:stroke-slate-800/60"}
                    strokeWidth={val === 0 ? 2 : 1}
                    strokeDasharray={val === 0 ? "none" : "3 3"}
                  />
                  <text
                    x={xToSvg(val)}
                    y={yToSvg(0) + 16}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 font-outfit text-[11px] font-bold"
                  >
                    {val}
                  </text>
                  {val !== 0 && (
                    <text
                      x={xToSvg(0) - 10}
                      y={yToSvg(val) + 4}
                      textAnchor="end"
                      className="fill-slate-400 dark:fill-slate-600 font-outfit text-[11px] font-bold"
                    >
                      {val}
                    </text>
                  )}
                </g>
              ))}

              {/* Axis Titles */}
              <text x="475" y="210" textAnchor="end" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase">x</text>
              <text x="18" y="32" textAnchor="start" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase">y</text>

              {/* Slope field lines */}
              {slopeFieldPoints.map((pt, idx) => {
                const slope = getSlope(pt.x, pt.y);
                const angle = Math.atan(-0.75 * slope); // Aspect ratio scale
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

              {/* Analytical Solution Curve */}
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
          {/* Dropdown selector */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Vælg differentialligning
            </label>
            <select
              value={eqId}
              onChange={(e) => {
                const newId = e.target.value;
                setEqId(newId);
                // Adjust start coordinates so they are valid for eq 2
                if (newId === '2' && Math.abs(y0) < 0.2) {
                  setY0(y0 >= 0 ? 0.5 : -0.5);
                }
              }}
              className="w-full text-sm font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {EQUATIONS.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
              {selectedEq.desc}
            </p>
          </div>

          {/* Equation 1 Parameter Slider */}
          {eqId === '1' && (
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Vækstkonstant (k):</span>
                <span className="font-mono text-brand-600 dark:text-sky-400">{k.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.1"
                value={k}
                onChange={(e) => setK(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span>-1.5 (Aftagende)</span>
                <span>1.5 (Voksende)</span>
              </div>
            </div>
          )}

          {/* Precise point adjust */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Begyndelsesværdi (x₀, y₀)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-450 mb-1">
                  <span>x₀:</span>
                  <span className="font-mono">{x0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-3.5"
                  max="3.5"
                  step="0.1"
                  value={x0}
                  onChange={(e) => setX0(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-450 mb-1">
                  <span>y₀:</span>
                  <span className="font-mono">{y0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={eqId === '2' ? "0.2" : "-3.5"}
                  max="3.5"
                  step="0.1"
                  value={y0}
                  onChange={(e) => {
                    const val = parseFloat(parseFloat(e.target.value).toFixed(2));
                    setY0(val);
                  }}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Mathematical Step-by-Step Box */}
          <div className="p-5 bg-slate-950/90 dark:bg-slate-950/80 rounded-xl border border-slate-800 shadow-inner">
            {getExplanation()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeparationVisualizer;
