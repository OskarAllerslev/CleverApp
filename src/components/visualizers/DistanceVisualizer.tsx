import React, { useState, useRef } from 'react';
import { MathRenderer } from '../MathRenderer';

export const DistanceVisualizer: React.FC = () => {
  // Point P(x1, y1)
  const [px, setPx] = useState<number>(3);
  const [py, setPy] = useState<number>(4);

  // Line ax + by + c = 0
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-2);
  const [c, setC] = useState<number>(2);

  const svgRef = useRef<SVGSVGElement>(null);

  // Viewport bounds: [-8, 8] for both x and y
  const minVal = -8;
  const maxVal = 8;
  const svgSize = 320;

  // Convert math coord to SVG coord
  // Math: (-8, 8) -> SVG: (0, 0)
  // Math: (8, -8) -> SVG: (320, 320)
  const mathToSvgX = (x: number) => ((x - minVal) / (maxVal - minVal)) * svgSize;
  const mathToSvgY = (y: number) => svgSize - ((y - minVal) / (maxVal - minVal)) * svgSize;

  const svgToMathX = (svgX: number) => minVal + (svgX / svgSize) * (maxVal - minVal);
  const svgToMathY = (svgY: number) => minVal + ((svgSize - svgY) / svgSize) * (maxVal - minVal);

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = svgSize / rect.width;
    const scaleY = svgSize / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Constrain to grid
    const rawX = svgToMathX(clickX);
    const rawY = svgToMathY(clickY);

    setPx(Math.max(minVal, Math.min(maxVal, Math.round(rawX * 2) / 2)));
    setPy(Math.max(minVal, Math.min(maxVal, Math.round(rawY * 2) / 2)));
  };

  // Prevent division by zero
  const denom = a * a + b * b;
  const safeDenom = denom === 0 ? 1 : denom;

  // Numerator: |a*x1 + b*y1 + c|
  const numerator = Math.abs(a * px + b * py + c);
  const distance = numerator / Math.sqrt(safeDenom);

  // Closest point on line (Projection)
  const projX = px - (a * (a * px + b * py + c)) / safeDenom;
  const projY = py - (b * (a * px + b * py + c)) / safeDenom;

  // Get line points to draw
  // We solve for x or y at boundaries
  let linePoints: [number, number, number, number] = [0, 0, 0, 0];
  if (Math.abs(b) > 0.001) {
    const yLeft = (-c - a * minVal) / b;
    const yRight = (-c - a * maxVal) / b;
    linePoints = [minVal, yLeft, maxVal, yRight];
  } else {
    // Vertical line x = -c / a
    const xVal = -c / a;
    linePoints = [xVal, minVal, xVal, maxVal];
  }

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Afstand fra punkt til linje (Hesselbergs formel)</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk punktet <MathRenderer math="P" /> rundt i koordinatsystemet eller juster linjens ligning <MathRenderer math="ax + by + c = 0" /> for at se den vinkelrette afstand live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG coordinate plane (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            ref={svgRef}
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl cursor-crosshair touch-none"
            onPointerDown={handlePointer}
            onPointerMove={handlePointer}
          >
            {/* Grid lines */}
            {Array.from({ length: 17 }).map((_, i) => {
              const val = minVal + i;
              const svgCoord = mathToSvgX(val);
              const isAxes = val === 0;
              return (
                <g key={`grid-${val}`}>
                  {/* Vertical grid line */}
                  <line
                    x1={svgCoord}
                    y1={0}
                    x2={svgCoord}
                    y2={svgSize}
                    className={isAxes ? 'stroke-slate-400 dark:stroke-slate-650' : 'stroke-slate-200/60 dark:stroke-slate-800/40'}
                    strokeWidth={isAxes ? 1.5 : 0.5}
                  />
                  {/* Horizontal grid line */}
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

            {/* Line ax + by + c = 0 (Indigo) */}
            <line
              x1={mathToSvgX(linePoints[0])}
              y1={mathToSvgY(linePoints[1])}
              x2={mathToSvgX(linePoints[2])}
              y2={mathToSvgY(linePoints[3])}
              className="stroke-indigo-500 dark:stroke-indigo-400"
              strokeWidth="3.5"
            />

            {/* Perpendicular distance line (Rose) */}
            <line
              x1={mathToSvgX(px)}
              y1={mathToSvgY(py)}
              x2={mathToSvgX(projX)}
              y2={mathToSvgY(projY)}
              className="stroke-rose-500 dark:stroke-rose-450"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />

            {/* Projected Point on line */}
            <circle cx={mathToSvgX(projX)} cy={mathToSvgY(projY)} r={4.5} className="fill-rose-500 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />

            {/* Point P (Amber) */}
            <circle cx={mathToSvgX(px)} cy={mathToSvgY(py)} r={6.5} className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            <text x={mathToSvgX(px) + 9} y={mathToSvgY(py) - 9} className="fill-slate-800 dark:fill-slate-200 font-extrabold text-xs">
              P({px.toFixed(1)}, {py.toFixed(1)})
            </text>

            {/* Label for line */}
            <text x={10} y={25} className="fill-indigo-600 dark:fill-indigo-400 font-bold text-[10px]">
              l: {a}x + ({b})y + {c} = 0
            </text>
          </svg>

          {/* Sliders for line parameters */}
          <div className="w-full space-y-2 mt-4 px-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>a = {a}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="1"
                  value={a}
                  onChange={(e) => setA(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>b = {b}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="1"
                  value={b}
                  onChange={(e) => setB(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>c = {c}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={c}
                  onChange={(e) => setC(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Dist-Formel Beregning
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-slate-700 dark:text-slate-350 text-xs space-y-2">
                <MathRenderer block math={`\\text{dist}(P, l) = \\frac{|a \\cdot x_1 + b \\cdot y_1 + c|}{\\sqrt{a^2 + b^2}}`} />
                <MathRenderer block math={`\\text{dist} = \\frac{|(${a}) \\cdot (${px.toFixed(1)}) + (${b}) \\cdot (${py.toFixed(1)}) + (${c})|}{\\sqrt{(${a})^2 + (${b})^2}}`} />
                <MathRenderer block math={`\\text{dist} = \\frac{|${(a * px + b * py + c).toFixed(2)}|}{\\sqrt{${denom}}}`} />
                <MathRenderer block math={`\\text{dist} = \\frac{${numerator.toFixed(2)}}{${Math.sqrt(safeDenom).toFixed(3)}} \\approx \\mathbf{${distance.toFixed(3)}}`} className="text-rose-600 dark:text-rose-450 font-bold text-sm" />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Geometrisk betydning:</span>
            Afstanden er defineret som den **korteste** vej fra punktet til linjen. Denne vej vil altid ramme linjen i en ret vinkel (<MathRenderer math="90^\circ" />).
          </div>
        </div>
      </div>
    </div>
  );
};
