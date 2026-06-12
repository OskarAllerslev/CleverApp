import React, { useState, useRef } from 'react';
import { MathRenderer } from '../MathRenderer';

export const LineEquationVisualizer: React.FC = () => {
  const [xa, setXa] = useState<number>(-2);
  const [ya, setYa] = useState<number>(-1);
  const [xb, setXb] = useState<number>(3);
  const [yb, setYb] = useState<number>(2);

  const [activePoint, setActivePoint] = useState<'A' | 'B' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Coordinate plane bounds: [-6, 6]
  const minVal = -6;
  const maxVal = 6;
  const svgSize = 320;

  const mathToSvgX = (x: number) => ((x - minVal) / (maxVal - minVal)) * svgSize;
  const mathToSvgY = (y: number) => svgSize - ((y - minVal) / (maxVal - minVal)) * svgSize;

  const svgToMathX = (svgX: number) => minVal + (svgX / svgSize) * (maxVal - minVal);
  const svgToMathY = (svgY: number) => minVal + ((svgSize - svgY) / svgSize) * (maxVal - minVal);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>, pt: 'A' | 'B') => {
    e.stopPropagation();
    setActivePoint(pt);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!activePoint || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = svgSize / rect.width;
    const scaleY = svgSize / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Snap to 0.5 units
    const mathX = Math.max(minVal, Math.min(maxVal, Math.round(svgToMathX(clickX) * 2) / 2));
    const mathY = Math.max(minVal, Math.min(maxVal, Math.round(svgToMathY(clickY) * 2) / 2));

    if (activePoint === 'A') {
      setXa(mathX);
      setYa(mathY);
    } else {
      setXb(mathX);
      setYb(mathY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activePoint) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setActivePoint(null);
    }
  };

  // Line Calculations
  const dx = xb - xa;
  const dy = yb - ya;

  const isVertical = Math.abs(dx) < 0.001;
  const slope = isVertical ? Infinity : dy / dx;
  const yIntercept = isVertical ? null : ya - slope * xa;

  // Points to draw the infinite line
  let x1 = minVal;
  let y1 = isVertical ? minVal : slope * minVal + (yIntercept || 0);
  let x2 = maxVal;
  let y2 = isVertical ? maxVal : slope * maxVal + (yIntercept || 0);

  if (isVertical) {
    x1 = xa;
    x2 = xa;
    y1 = minVal;
    y2 = maxVal;
  }

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Linjens Ligning (y = ax + b)</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk i punkterne <MathRenderer math="A" /> og <MathRenderer math="B" /> direkte på planen (eller juster skyderne) for at se, hvordan linjens ligning beregnes ud fra to punkter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            ref={svgRef}
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Grid */}
            {Array.from({ length: 13 }).map((_, i) => {
              const val = minVal + i;
              const svgCoord = mathToSvgX(val);
              const isAxes = val === 0;
              return (
                <g key={`grid-${val}`}>
                  <line
                    x1={svgCoord}
                    y1={0}
                    x2={svgCoord}
                    y2={svgSize}
                    className={isAxes ? 'stroke-slate-400 dark:stroke-slate-650' : 'stroke-slate-200/60 dark:stroke-slate-800/40'}
                    strokeWidth={isAxes ? 1.5 : 0.5}
                  />
                  <line
                    x1={0}
                    y1={svgCoord}
                    x2={svgSize}
                    y2={svgCoord}
                    className={isAxes ? 'stroke-slate-400 dark:stroke-slate-650' : 'stroke-slate-200/60 dark:stroke-slate-800/40'}
                    strokeWidth={isAxes ? 1.5 : 0.5}
                  />
                </g>
              );
            })}

            {/* Infinite Line */}
            <line
              x1={mathToSvgX(x1)}
              y1={mathToSvgY(y1)}
              x2={mathToSvgX(x2)}
              y2={mathToSvgY(y2)}
              className="stroke-brand-500 dark:stroke-sky-400"
              strokeWidth="3"
            />

            {/* Slope triangle (only if not vertical or horizontal) */}
            {!isVertical && Math.abs(dy) > 0.001 && (
              <g className="opacity-75">
                {/* Horizontal run */}
                <line
                  x1={mathToSvgX(xa)}
                  y1={mathToSvgY(ya)}
                  x2={mathToSvgX(xb)}
                  y2={mathToSvgY(ya)}
                  className="stroke-emerald-500"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                {/* Vertical rise */}
                <line
                  x1={mathToSvgX(xb)}
                  y1={mathToSvgY(ya)}
                  x2={mathToSvgX(xb)}
                  y2={mathToSvgY(yb)}
                  className="stroke-rose-500"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                {/* Labels */}
                <text x={mathToSvgX((xa + xb)/2)} y={mathToSvgY(ya) + 13} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-bold">
                  Δx = {dx.toFixed(1)}
                </text>
                <text x={mathToSvgX(xb) + 18} y={mathToSvgY((ya + yb)/2) + 3} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[10px] font-bold">
                  Δy = {dy.toFixed(1)}
                </text>
              </g>
            )}

            {/* Point A */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown(e, 'A')}
            >
              <circle cx={mathToSvgX(xa)} cy={mathToSvgY(ya)} r={8} className="fill-indigo-600 stroke-white dark:stroke-slate-900" strokeWidth="2.5" />
              <text x={mathToSvgX(xa) - 12} y={mathToSvgY(ya) - 12} className="fill-indigo-700 dark:fill-indigo-400 font-extrabold text-xs">
                A({xa.toFixed(1)}, {ya.toFixed(1)})
              </text>
            </g>

            {/* Point B */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown(e, 'B')}
            >
              <circle cx={mathToSvgX(xb)} cy={mathToSvgY(yb)} r={8} className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth="2.5" />
              <text x={mathToSvgX(xb) + 12} y={mathToSvgY(yb) - 12} className="fill-amber-600 dark:fill-amber-400 font-extrabold text-xs">
                B({xb.toFixed(1)}, {yb.toFixed(1)})
              </text>
            </g>
          </svg>

          {/* Manual coordinate sliders */}
          <div className="w-full grid grid-cols-2 gap-4 mt-4 px-4 text-xs">
            <div>
              <span className="font-semibold text-indigo-600">Punkt A</span>
              <div className="flex space-x-2 mt-1">
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={xa}
                  onChange={(e) => setXa(parseFloat(e.target.value))}
                  className="w-1/2 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={ya}
                  onChange={(e) => setYa(parseFloat(e.target.value))}
                  className="w-1/2 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
            <div>
              <span className="font-semibold text-amber-500">Punkt B</span>
              <div className="flex space-x-2 mt-1">
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={xb}
                  onChange={(e) => setXb(parseFloat(e.target.value))}
                  className="w-1/2 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-550"
                />
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={yb}
                  onChange={(e) => setYb(parseFloat(e.target.value))}
                  className="w-1/2 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-550"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Linjens Ligning Beregning
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div>
                <span className="text-xs text-slate-400">1. Find hældningen (<MathRenderer math="a" />):</span>
                <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-slate-700 dark:text-slate-350 text-xs mt-1">
                  {isVertical ? (
                    <span><MathRenderer math="a =" /> udefineret (lodret linje)</span>
                  ) : (
                    <div className="space-y-2">
                      <MathRenderer block math={`a = \\frac{y_2 - y_1}{x_2 - x_1}`} />
                      <MathRenderer block math={`a = \\frac{${yb} - (${ya})}{${xb} - (${xa})}`} />
                      <MathRenderer block math={`a = \\frac{${dy.toFixed(1)}}{${dx.toFixed(1)}} = \\mathbf{${slope.toFixed(2)}}`} className="text-brand-600 dark:text-sky-450 font-bold" />
                    </div>
                  )}
                </div>
              </div>

              {!isVertical && yIntercept !== null && (
                <div>
                  <span className="text-xs text-slate-400">2. Find skæring med y-aksen (<MathRenderer math="b" />):</span>
                  <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-slate-700 dark:text-slate-350 text-xs mt-1 space-y-2">
                    <MathRenderer block math={`b = y_1 - a \\cdot x_1`} />
                    <MathRenderer block math={`b = ${ya} - (${slope.toFixed(2)}) \\cdot (${xa})`} />
                    <MathRenderer block math={`b = \\mathbf{${yIntercept.toFixed(2)}}`} className="text-brand-600 dark:text-sky-450 font-bold" />
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <span className="text-xs text-slate-400 block mb-1">Resultat (Ligning):</span>
                <div className="text-base font-extrabold text-brand-600 dark:text-sky-400">
                  {isVertical ? (
                    <MathRenderer math={`x = ${xa.toFixed(1)}`} />
                  ) : (
                    <MathRenderer math={`y = ${slope.toFixed(2)}x ${yIntercept !== null && yIntercept >= 0 ? '+' : ''} ${yIntercept?.toFixed(2)}`} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Slopes og Intercepts:</span>
            - Hældningstallet <MathRenderer math="a" /> angiver, hvor meget <MathRenderer math="y" /> vokser, når <MathRenderer math="x" /> øges med 1.
            - Skæringstallet <MathRenderer math="b" /> angiver y-værdien, hvor linjen krydser y-aksen (hvor <MathRenderer math="x=0" />).
          </div>
        </div>
      </div>
    </div>
  );
};
