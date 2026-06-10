import React, { useState } from 'react';

export const PythagorasVisualizer: React.FC = () => {
  const [a, setA] = useState<number>(80);
  const [b, setB] = useState<number>(60);

  // C is the right angle, placed at (180, 200)
  const cx = 180;
  const cy = 200;

  // A is at (cx, cy - b)
  const ax = cx;
  const ay = cy - b;

  // B is at (cx + a, cy)
  const bx = cx + a;
  const by = cy;

  const cSq = a * a + b * b;
  const c = Math.sqrt(cSq);

  // Coordinates for squares:
  // Square on a (bottom): (cx, cy) -> (bx, by) -> (bx, cy + a) -> (cx, cy + a)
  const sqA = `${cx},${cy} ${bx},${by} ${bx},${cy + a} ${cx},${cy + a}`;

  // Square on b (left): (cx, cy) -> (ax, ay) -> (cx - b, ay) -> (cx - b, cy)
  const sqB = `${cx},${cy} ${ax},${ay} ${cx - b},${ay} ${cx - b},${cy}`;

  // Square on c (hypotenuse): (ax, ay) -> (bx, by) -> (bx + b, by - a) -> (ax + b, ay - a)
  const sqC = `${ax},${ay} ${bx},${by} ${bx + b},${by - a} ${ax + b},${ay - a}`;

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Pythagoras' Sætning</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk i skyderne for at ændre kateterne $a$ og $b$. Se hvordan arealet af de to mindre kvadrater ($a^2 + b^2$) altid er lig med arealet af det store kvadrat ($c^2$).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Visualization (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg viewBox="0 0 450 400" className="w-full max-w-[400px] h-auto overflow-visible select-none" fill="none" stroke="currentColor">
            {/* Grid background for visual aid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" className="stroke-slate-100 dark:stroke-slate-800/50" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="rx-xl" />

            {/* Square on a (indigo) */}
            <polygon
              points={sqA}
              className="fill-indigo-500/20 stroke-indigo-500 dark:fill-indigo-500/10 dark:stroke-indigo-400"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Square on b (emerald) */}
            <polygon
              points={sqB}
              className="fill-emerald-500/20 stroke-emerald-500 dark:fill-emerald-500/10 dark:stroke-emerald-400"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Square on c (rose) */}
            <polygon
              points={sqC}
              className="fill-rose-500/20 stroke-rose-500 dark:fill-rose-500/10 dark:stroke-rose-400"
              strokeWidth="2"
            />

            {/* Triangle (main) */}
            <polygon
              points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
              className="fill-slate-100/80 stroke-slate-800 dark:fill-slate-950/40 dark:stroke-slate-200"
              strokeWidth="2.5"
            />

            {/* Right angle indicator */}
            <path
              d={`M ${cx},${cy - 12} L ${cx + 12},${cy - 12} L ${cx + 12},${cy}`}
              className="stroke-slate-500 dark:stroke-slate-400"
              strokeWidth="1.5"
            />

            {/* Labels on sides */}
            {/* Leg a */}
            <text x={cx + a/2} y={cy + 15} textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-400 font-bold text-xs">
              a = {(a/10).toFixed(1)}
            </text>
            {/* Leg b */}
            <text x={cx - 15} y={cy - b/2} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-bold text-xs">
              b = {(b/10).toFixed(1)}
            </text>
            {/* Hypotenuse c */}
            <text x={cx + a/2 - 15} y={cy - b/2 - 5} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 font-bold text-xs">
              c = {(c/10).toFixed(1)}
            </text>

            {/* Area labels inside squares */}
            <text x={cx + a/2} y={cy + a/2 + 5} textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-extrabold text-xs">
              a² = {((a*a)/100).toFixed(1)}
            </text>
            <text x={cx - b/2} y={cy - b/2 + 5} textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 font-extrabold text-xs">
              b² = {((b*b)/100).toFixed(1)}
            </text>
            <text x={ax + b/2 + a/2} y={ay - a/2 + b/2} textAnchor="middle" className="fill-rose-700 dark:fill-rose-300 font-extrabold text-xs">
              c² = {(cSq/100).toFixed(1)}
            </text>
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-3 mt-4 px-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Katete a</span>
                <span className="font-bold">{(a/10).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                value={a}
                onChange={(e) => setA(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Katete b</span>
                <span className="font-bold">{(b/10).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                value={b}
                onChange={(e) => setB(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Calculation Table / explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Arealberegning & Sum
            </h5>
            <div className="space-y-4 font-outfit text-sm">
              <div className="flex justify-between items-center bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Katetekvadrat a²:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-250">
                  {((a*a)/100).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Katetekvadrat b²:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-250">
                  {((b*b)/100).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
                <div className="flex justify-between items-center p-1 font-bold text-slate-700 dark:text-slate-300">
                  <span>a² + b² =</span>
                  <span className="font-mono text-brand-600 dark:text-sky-400">
                    {(((a*a) + (b*b))/100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-bold">
                <span className="text-rose-700 dark:text-rose-300">Hypotenusekvadrat c²:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  {(cSq/100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Bevis ved arealer:</span>
            Uanset hvordan du ændrer sidelængderne, vil summen af de to mindre arealer ($a^2 + b^2$) altid passe præcis med arealet af det store kvadrat ($c^2$). Dette er kernen i Pythagoras' sætning!
          </div>
        </div>
      </div>
    </div>
  );
};
