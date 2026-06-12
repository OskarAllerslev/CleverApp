import React, { useState, useRef } from 'react';
import { MathRenderer } from '../MathRenderer';

interface Point {
  x: number;
  y: number;
}

interface EulerStep {
  n: number;
  x: number;
  y: number;
  slope: number;
  dy: number;
  yNext: number;
  xNext: number;
}

const EQUATIONS = [
  { id: '1', name: "y' = 0.5y", latex: "y' = 0{,}5y", f: (x: number, y: number) => 0.5 * y, desc: "Simpel eksponentiel vækst. Kurven vokser hurtigere og hurtigere." },
  { id: '2', name: "y' = x - y", latex: "y' = x - y", f: (x: number, y: number) => x - y, desc: "Kurven søger mod linjen y = x - 1. Dejlig stabiliserende effekt." },
  { id: '3', name: "y' = 0.25x² - y", latex: "y' = 0{,}25x^2 - y", f: (x: number, y: number) => 0.25 * x * x - y, desc: "Hældningen trækkes af en parabel. Giver smukke krumme forløb." },
  { id: '4', name: "y' = y(1.5 - 0.5y)", latex: "y' = y(1{,}5 - 0{,}5y)", f: (x: number, y: number) => y * (1.5 - 0.5 * y), desc: "Logistisk model med bæreevne M = 3. Væksten bremser nær toppen." }
];

export const EulerVisualizer: React.FC = () => {
  const [eqId, setEqId] = useState<string>('2');
  const [x0, setX0] = useState<number>(0.0);
  const [y0, setY0] = useState<number>(1.0);
  const [h, setH] = useState<number>(0.5);
  const [showSlopeField, setShowSlopeField] = useState<boolean>(true);
  const [showExact, setShowExact] = useState<boolean>(true);
  const [showEuler, setShowEuler] = useState<boolean>(true);
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const selectedEq = EQUATIONS.find(e => e.id === eqId) || EQUATIONS[1];

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

    // Convert to viewBox coordinates
    const svgWidth = rect.width;
    const svgHeight = rect.height;
    const viewBoxX = (clickX / svgWidth) * 500;
    const viewBoxY = (clickY / svgHeight) * 400;

    // Only set if within grid area
    if (viewBoxX >= 60 && viewBoxX <= 460 && viewBoxY >= 40 && viewBoxY <= 340) {
      const mathX = parseFloat(svgToX(viewBoxX).toFixed(2));
      const mathY = parseFloat(svgToY(viewBoxY).toFixed(2));
      setX0(mathX);
      setY0(mathY);
    }
  };

  // Evaluate the selected equation's slope
  const getSlope = (x: number, y: number) => {
    return selectedEq.f(x, y);
  };

  // Compute Euler steps
  const steps: EulerStep[] = [];
  let currX = x0;
  let currY = y0;
  let n = 0;

  // Prevent infinite loops and only compute steps up to xMax
  while (currX <= xMax + 0.001 && n < 40) {
    const slope = getSlope(currX, currY);
    const stepH = Math.min(h, xMax - currX);
    const dy = stepH * slope;
    const yNext = currY + dy;
    const xNext = parseFloat((currX + stepH).toFixed(5));

    steps.push({
      n,
      x: currX,
      y: currY,
      slope,
      dy,
      yNext,
      xNext
    });

    if (currX >= xMax) break;
    currX = xNext;
    currY = yNext;
    n++;
  }

  // Compute exact solution curve using RK4 for comparison
  const exactPoints: Point[] = [];
  let rkX = x0;
  let rkY = y0;
  exactPoints.push({ x: rkX, y: rkY });
  const rkH = 0.02;

  // Forward RK4
  while (rkX < xMax) {
    const step = Math.min(rkH, xMax - rkX);
    if (step <= 0) break;
    const k1 = getSlope(rkX, rkY);
    const k2 = getSlope(rkX + step / 2, rkY + (step * k1) / 2);
    const k3 = getSlope(rkX + step / 2, rkY + (step * k2) / 2);
    const k4 = getSlope(rkX + step, rkY + step * k3);
    rkY = rkY + (step / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    rkX = rkX + step;
    if (isNaN(rkY) || Math.abs(rkY) > 10) break;
    exactPoints.push({ x: rkX, y: rkY });
  }

  // Backward RK4
  const backwardPoints: Point[] = [];
  rkX = x0;
  rkY = y0;
  while (rkX > 0) {
    const step = Math.min(rkH, rkX);
    if (step <= 0) break;
    const mh = -step;
    const k1 = getSlope(rkX, rkY);
    const k2 = getSlope(rkX + mh / 2, rkY + (mh * k1) / 2);
    const k3 = getSlope(rkX + mh / 2, rkY + (mh * k2) / 2);
    const k4 = getSlope(rkX + mh, rkY + mh * k3);
    rkY = rkY + (mh / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    rkX = rkX + mh;
    if (isNaN(rkY) || Math.abs(rkY) > 10) break;
    backwardPoints.push({ x: rkX, y: rkY });
  }
  backwardPoints.reverse();
  if (backwardPoints.length > 0) {
    backwardPoints.pop(); // remove duplicate x0
  }
  const fullExactCurve = [...backwardPoints, ...exactPoints];

  // Generate Slope Field grid points (11x11 grid)
  const slopeFieldPoints: { x: number; y: number }[] = [];
  for (let gx = 0; gx <= xMax; gx += 0.4) {
    for (let gy = 0; gy <= yMax; gy += 0.4) {
      slopeFieldPoints.push({ x: gx, y: gy });
    }
  }

  // Exact value at final Euler X (to compute global error)
  const finalEulerX = steps.length > 0 ? steps[steps.length - 1].x : x0;
  const finalEulerY = steps.length > 0 ? steps[steps.length - 1].y : y0;
  let exactAtFinalX = y0;
  if (fullExactCurve.length > 0) {
    // find point in exact curve closest to finalEulerX
    const closest = fullExactCurve.reduce((prev, curr) => 
      Math.abs(curr.x - finalEulerX) < Math.abs(prev.x - finalEulerX) ? curr : prev
    );
    exactAtFinalX = closest.y;
  }
  const globalError = Math.abs(finalEulerY - exactAtFinalX);

  return (
    <div className="my-10 p-5 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-5xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-sky-400 bg-brand-50 dark:bg-sky-950/40 rounded-full">
          Interaktiv Simulering
        </span>
        <h3 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-slate-100 mt-2">
          Eulers Metode & Retningsfelter
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl mx-auto">
          Undersøg hvordan Eulers numeriske metode følger retningsfeltets hældninger. Klik på grafen for at ændre startpunktet <span className="font-semibold text-slate-700 dark:text-slate-350">(x₀, y₀)</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Graph column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[480px] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 p-2">
            <svg 
              ref={svgRef}
              viewBox="0 0 500 400" 
              className="w-full h-auto cursor-crosshair overflow-visible select-none"
              onClick={handleGridClick}
            >
              {/* Background Grid Lines */}
              {[0, 1, 2, 3, 4].map(val => (
                <g key={`grid-${val}`}>
                  {/* Vertical */}
                  <line 
                    x1={xToSvg(val)} 
                    y1={yToSvg(0)} 
                    x2={xToSvg(val)} 
                    y2={yToSvg(4)} 
                    className="stroke-slate-200 dark:stroke-slate-800" 
                    strokeWidth="1.5"
                    strokeDasharray={val === 0 ? "none" : "4 4"}
                  />
                  {/* Horizontal */}
                  <line 
                    x1={xToSvg(0)} 
                    y1={yToSvg(val)} 
                    x2={xToSvg(4)} 
                    y2={yToSvg(val)} 
                    className="stroke-slate-200 dark:stroke-slate-800" 
                    strokeWidth="1.5"
                    strokeDasharray={val === 0 ? "none" : "4 4"}
                  />
                  {/* Labels */}
                  <text 
                    x={xToSvg(val)} 
                    y={yToSvg(0) + 18} 
                    textAnchor="middle" 
                    className="fill-slate-400 dark:fill-slate-650 font-outfit text-xs font-semibold"
                  >
                    {val}
                  </text>
                  <text 
                    x={xToSvg(0) - 15} 
                    y={yToSvg(val) + 4} 
                    textAnchor="end" 
                    className="fill-slate-400 dark:fill-slate-650 font-outfit text-xs font-semibold"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Axis Titles */}
              <text x="260" y="385" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase tracking-wider">x</text>
              <text x="22" y="190" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit text-xs font-bold uppercase tracking-wider" transform="rotate(-90 22 190)">y</text>

              {/* Slope Field */}
              {showSlopeField && slopeFieldPoints.map((pt, idx) => {
                const slope = getSlope(pt.x, pt.y);
                if (isNaN(slope) || Math.abs(slope) > 12) return null;
                const angle = Math.atan(-0.85 * slope); // Adjusted for grid aspect ratio
                const lineLen = 14;
                const dx = Math.cos(angle) * (lineLen / 2);
                const dy = Math.sin(angle) * (lineLen / 2);
                const sx = xToSvg(pt.x);
                const sy = yToSvg(pt.y);

                return (
                  <line
                    key={`sf-${idx}`}
                    x1={sx - dx}
                    y1={sy - dy}
                    x2={sx + dx}
                    y2={sy + dy}
                    className="stroke-slate-350 dark:stroke-slate-700/80 hover:stroke-brand-500 dark:hover:stroke-sky-400 transition-colors duration-150"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Exact Solution Curve */}
              {showExact && fullExactCurve.length > 1 && (
                <path
                  d={fullExactCurve.reduce((acc, pt, idx) => {
                    const sx = xToSvg(pt.x);
                    const sy = yToSvg(pt.y);
                    if (sy < 10 || sy > 390) return acc;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
                  }, '')}
                  fill="none"
                  className="stroke-sky-500 dark:stroke-sky-400/90"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              )}

              {/* Euler Polygonal Curve */}
              {showEuler && steps.length > 0 && (
                <>
                  <path
                    d={steps.reduce((acc, pt, idx) => {
                      const sx = xToSvg(pt.x);
                      const sy = yToSvg(pt.y);
                      return acc + `${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
                    }, '') + ` L ${xToSvg(steps[steps.length - 1].xNext)} ${yToSvg(steps[steps.length - 1].yNext)}`}
                    fill="none"
                    className="stroke-amber-500 dark:stroke-amber-400"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {steps.map((pt, idx) => (
                    <circle
                      key={`ep-${idx}`}
                      cx={xToSvg(pt.x)}
                      cy={yToSvg(pt.y)}
                      r={hoveredStepIndex === idx ? "7" : "4.5"}
                      className={`transition-all duration-150 ${
                        hoveredStepIndex === idx
                          ? "fill-white stroke-brand-500 dark:stroke-sky-400 stroke-[3px]"
                          : "fill-amber-500 dark:fill-amber-400 stroke-white dark:stroke-slate-900 stroke-[1.5px]"
                      }`}
                    />
                  ))}
                  {/* Final point */}
                  <circle
                    cx={xToSvg(steps[steps.length - 1].xNext)}
                    cy={yToSvg(steps[steps.length - 1].yNext)}
                    r="4.5"
                    className="fill-amber-500 dark:fill-amber-400 stroke-white dark:stroke-slate-900 stroke-[1.5px]"
                  />
                </>
              )}

              {/* Highlighted Step Tangent Line Projection */}
              {hoveredStepIndex !== null && steps[hoveredStepIndex] && (
                <g>
                  {/* Draw the projected step tangent */}
                  <line
                    x1={xToSvg(steps[hoveredStepIndex].x)}
                    y1={yToSvg(steps[hoveredStepIndex].y)}
                    x2={xToSvg(steps[hoveredStepIndex].xNext)}
                    y2={yToSvg(steps[hoveredStepIndex].yNext)}
                    className="stroke-rose-500 dark:stroke-rose-400"
                    strokeWidth="4"
                  />
                  {/* Vertical reference dashed line to show Euler error increment */}
                  {showExact && (
                    <line
                      x1={xToSvg(steps[hoveredStepIndex].xNext)}
                      y1={yToSvg(steps[hoveredStepIndex].yNext)}
                      x2={xToSvg(steps[hoveredStepIndex].xNext)}
                      y2={yToSvg(
                        (() => {
                          const nextX = steps[hoveredStepIndex].xNext;
                          const closest = fullExactCurve.reduce((prev, curr) => 
                            Math.abs(curr.x - nextX) < Math.abs(prev.x - nextX) ? curr : prev
                          );
                          return closest.y;
                        })()
                      )}
                      className="stroke-rose-400 dark:stroke-rose-500"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}
                </g>
              )}

              {/* Interactive Start Point Marker (x0, y0) */}
              <g className="cursor-grab active:cursor-grabbing">
                <circle 
                  cx={xToSvg(x0)} 
                  cy={yToSvg(y0)} 
                  r="12" 
                  className="fill-brand-500/20 dark:fill-sky-400/25 stroke-brand-500 dark:stroke-sky-400 stroke-2 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <circle 
                  cx={xToSvg(x0)} 
                  cy={yToSvg(y0)} 
                  r="7" 
                  className="fill-brand-600 dark:fill-sky-400 stroke-white dark:stroke-slate-950 stroke-2 shadow-lg"
                />
              </g>
            </svg>

            {/* Error Marker if enabled */}
            {showExact && showEuler && (
              <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-md text-xs font-semibold font-mono space-y-0.5">
                <div className="text-slate-500 dark:text-slate-400">
                  Global fejl ved x = {finalEulerX.toFixed(1)}:
                </div>
                <div className={globalError < 0.15 ? "text-emerald-600 dark:text-emerald-400" : globalError < 0.5 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}>
                  |y_Euler - y_Eksakt| = {globalError.toFixed(4)}
                </div>
              </div>
            )}
          </div>

          {/* Quick toggle options */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs font-medium">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-350">
              <input 
                type="checkbox" 
                checked={showSlopeField} 
                onChange={(e) => setShowSlopeField(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-600 dark:text-sky-500 focus:ring-brand-500" 
              />
              <span>Retningsfelt (Hældninger)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-350">
              <input 
                type="checkbox" 
                checked={showExact} 
                onChange={(e) => setShowExact(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-600 dark:text-sky-500 focus:ring-brand-500" 
              />
              <span className="text-sky-600 dark:text-sky-400 font-semibold">Eksakt løsning (stiplet)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-350">
              <input 
                type="checkbox" 
                checked={showEuler} 
                onChange={(e) => setShowEuler(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-600 dark:text-sky-500 focus:ring-brand-500" 
              />
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Euler approksimation</span>
            </label>
          </div>
        </div>

        {/* Configuration Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Equation Selector */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Vælg Differentialligning
            </label>
            <select
              value={eqId}
              onChange={(e) => {
                setEqId(e.target.value);
                setHoveredStepIndex(null);
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

          {/* Parameters sliders */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Parametre
            </h4>

            {/* Step size h slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Skridtlængde (h):</span>
                <span className="font-mono text-brand-600 dark:text-sky-400">{h}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={h}
                onChange={(e) => {
                  setH(parseFloat(e.target.value));
                  setHoveredStepIndex(null);
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                <span>0.1 (Meget præcis)</span>
                <span>1.0 (Store skridt)</span>
              </div>
            </div>

            {/* Start conditions (x0, y0) sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Start x₀:</span>
                  <span className="font-mono">{x0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={x0}
                  onChange={(e) => setX0(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Start y₀:</span>
                  <span className="font-mono">{y0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.5"
                  step="0.1"
                  value={y0}
                  onChange={(e) => setY0(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Quick Explainer Box */}
          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-brand-50/20 dark:bg-sky-950/10 p-4 rounded-xl border border-brand-100/40 dark:border-sky-900/20">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Hvordan virker det?</span>
            Eulers metode tager den lokale hældning <span className="font-mono font-bold">{selectedEq.name}</span> i punktet <MathRenderer math="(x_n, y_n)" />, og går en skridtlængde <MathRenderer math="h" /> frem i den retning for at finde <MathRenderer math="y_{n+1} = y_n + h \\cdot f(x_n, y_n)" />. 
            <br />
            <span className="font-semibold text-brand-600 dark:text-sky-400">Prøv dette:</span> Sæt <MathRenderer math="h = 1{,}0" /> og derefter <MathRenderer math="h = 0{,}1" /> for at se, hvor hurtigt fejlen formindskes!
          </div>
        </div>
      </div>

      {/* Calculations Table */}
      {showEuler && (
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
            Iterativ tabelberegning (Hold musen over en række for at highlighte trinnet på grafen)
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 font-outfit">
            <table className="w-full text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-center"><MathRenderer math="n" /></th>
                  <th className="px-4 py-3">Aktuelt punkt <MathRenderer math="(x_n, y_n)" /></th>
                  <th className="px-4 py-3">Hældning <MathRenderer math="f(x_n, y_n)" /></th>
                  <th className="px-4 py-3">Trin-stigning <MathRenderer math="h \\cdot f" /></th>
                  <th className="px-4 py-3">Næste punkt <MathRenderer math="y_{n+1} = y_n + h \\cdot f" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {steps.map((step, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors duration-150 cursor-pointer ${
                      hoveredStepIndex === idx
                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-semibold"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-900/60"
                    }`}
                    onMouseEnter={() => setHoveredStepIndex(idx)}
                    onMouseLeave={() => setHoveredStepIndex(null)}
                  >
                    <td className="px-4 py-3.5 text-center font-bold font-mono">{step.n}</td>
                    <td className="px-4 py-3.5 font-mono">
                      ({step.x.toFixed(2)}, {step.y.toFixed(4)})
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      {step.slope.toFixed(4)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-brand-600 dark:text-sky-400">
                      <MathRenderer math={`${h} \\cdot ${step.slope.toFixed(3)} = ${step.dy.toFixed(4)}`} />
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">
                      {step.yNext.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EulerVisualizer;
