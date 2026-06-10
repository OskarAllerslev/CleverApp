import React, { useState } from 'react';

export const CircleEquationVisualizer: React.FC = () => {
  // Center of circle (a, b)
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(2);

  // Radius of circle r
  const [r, setR] = useState<number>(3.5);

  // Angle for point P on circle boundary
  const [theta, setTheta] = useState<number>(45);

  const rad = (theta * Math.PI) / 180;

  // Coordinate plane bounds: [-6, 6] for x, y
  const minVal = -6;
  const maxVal = 6;
  const svgSize = 320;

  const mathToSvgX = (x: number) => ((x - minVal) / (maxVal - minVal)) * svgSize;
  const mathToSvgY = (y: number) => svgSize - ((y - minVal) / (maxVal - minVal)) * svgSize;

  // Calculate Point P(x, y) coordinates
  const px = a + r * Math.cos(rad);
  const py = b + r * Math.sin(rad);

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Cirklens Ligning</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Brug skyderne til at ændre centrum $(a, b)$ og radius $r$. Se hvordan punktet $P(x, y)$ på cirklens periferi danner en retvinklet trekant, hvor $(x-a)^2 + (y-b)^2 = r^2$.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl"
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

            {/* Circle (Indigo) */}
            <circle
              cx={mathToSvgX(a)}
              cy={mathToSvgY(b)}
              r={r * (svgSize / (maxVal - minVal))}
              className="stroke-indigo-500 dark:stroke-indigo-400 fill-none"
              strokeWidth="2.5"
            />

            {/* Triangle base (x - a) (Emerald) */}
            <line
              x1={mathToSvgX(a)}
              y1={mathToSvgY(b)}
              x2={mathToSvgX(px)}
              y2={mathToSvgY(b)}
              className="stroke-emerald-500 dark:stroke-emerald-400"
              strokeWidth="2"
            />

            {/* Triangle height (y - b) (Rose) */}
            <line
              x1={mathToSvgX(px)}
              y1={mathToSvgY(b)}
              x2={mathToSvgX(px)}
              y2={mathToSvgY(py)}
              className="stroke-rose-500 dark:stroke-rose-400"
              strokeWidth="2"
            />

            {/* Radius hypotenuse (r) (Slate) */}
            <line
              x1={mathToSvgX(a)}
              y1={mathToSvgY(b)}
              x2={mathToSvgX(px)}
              y2={mathToSvgY(py)}
              className="stroke-slate-700 dark:stroke-slate-300"
              strokeWidth="2.5"
            />

            {/* Center Point C (Indigo) */}
            <circle cx={mathToSvgX(a)} cy={mathToSvgY(b)} r={5} className="fill-indigo-600 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <text x={mathToSvgX(a) - 15} y={mathToSvgY(b) + 15} className="fill-indigo-700 dark:fill-indigo-400 font-bold text-xs">
              C({a}, {b})
            </text>

            {/* Boundary Point P (Amber) */}
            <circle cx={mathToSvgX(px)} cy={mathToSvgY(py)} r={5.5} className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <text x={mathToSvgX(px) + 8} y={mathToSvgY(py) - 8} className="fill-slate-800 dark:fill-slate-200 font-extrabold text-xs">
              P({px.toFixed(1)}, {py.toFixed(1)})
            </text>
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-3 mt-4 px-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-slate-500 mb-1">
                  <span>Centrum x (a) = {a}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-500 mb-1">
                  <span>Centrum y (b) = {b}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-slate-500 mb-1">
                  <span>Radius r = {r.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={r}
                  onChange={(e) => setR(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-500 mb-1">
                  <span>Vinkel på periferi = {theta}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={theta}
                  onChange={(e) => setTheta(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Math explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Cirklens Ligningsformel
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                (x - a)² + (y - b)² = r²
                <br />
                ({px.toFixed(2)} - {a})² + ({py.toFixed(2)} - {b})² = {r.toFixed(1)}²
                <br />
                {(px - a).toFixed(2)}² + {(py - b).toFixed(2)}² = {(r * r).toFixed(2)}
                <br />
                {((px - a) ** 2).toFixed(2)} + {((py - b) ** 2).toFixed(2)} = <span className="text-indigo-600 dark:text-sky-400 font-bold">{(r * r).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Hvorfor Pythagoras?</span>
            Cirklen består af alle punkter $P(x,y)$, der har den præcise afstand $r$ til centrum $C(a,b)$. Trekanten viser, at $(x-a)$ og $(y-b)$ er kateterne i en retvinklet trekant med hypotenuse $r$. Ligningen er derfor blot Pythagoras' sætning!
          </div>
        </div>
      </div>
    </div>
  );
};
