import React, { useState } from 'react';

export const VectorProductVisualizer: React.FC = () => {
  // Vector a = (ax, ay, az)
  const [ax, setAx] = useState<number>(3);
  const [ay, setAy] = useState<number>(1);
  const [az, setAz] = useState<number>(2);

  // Vector b = (bx, by, bz)
  const [bx, setBx] = useState<number>(1);
  const [by, setBy] = useState<number>(3);
  const [bz, setBz] = useState<number>(-1);

  const scale = 14;

  const project = (x: number, y: number, z: number) => {
    const cx = 160;
    const cy = 160;

    const ux = -Math.cos(Math.PI / 6) * scale;
    const uy = Math.sin(Math.PI / 6) * scale;

    const vx = Math.cos(Math.PI / 6) * scale;
    const vy = Math.sin(Math.PI / 6) * scale;

    const wx = 0;
    const wy = -scale;

    return {
      x: cx + x * ux + y * vx + z * wx,
      y: cy + x * uy + y * vy + z * wy
    };
  };

  // Dot product: a . b
  const dot = ax * bx + ay * by + az * bz;

  // Magnitudes
  const lenA = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
  const lenB = Math.sqrt(bx * bx + by * by + bz * bz) || 1;

  // Angle theta = arccos(dot / (lenA * lenB))
  const cosTheta = dot / (lenA * lenB);
  const theta = (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 185) / Math.PI; // Adjust for rendering/rounding or keep mathematically exact (180)
  const exactTheta = (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180) / Math.PI;

  // Cross product: a x b
  const cx = ay * bz - az * by;
  const cy_vec = az * bx - ax * bz; // avoid naming conflict with center coordinate cx
  const cz = ax * by - ay * bx;

  const crossLen = Math.sqrt(cx * cx + cy_vec * cy_vec + cz * cz);

  // Projected SVG coordinates
  const originSvg = project(0, 0, 0);
  const xAxisSvg = project(8, 0, 0);
  const yAxisSvg = project(0, 8, 0);
  const zAxisSvg = project(0, 0, 8);

  const aEndSvg = project(ax, ay, az);
  const bEndSvg = project(bx, by, bz);

  // Cross product (scaled down if too long for display)
  const crossScale = crossLen > 6 ? 6 / crossLen : 1.0;
  const crossEndSvg = project(cx * crossScale, cy_vec * crossScale, cz * crossScale);

  // Parallelogram corners: 0 -> a -> a+b -> b -> 0
  const abSvg = project(ax + bx, ay + by, az + bz);

  const parallelogramPath = `M ${originSvg.x} ${originSvg.y} L ${aEndSvg.x} ${aEndSvg.y} L ${abSvg.x} ${abSvg.y} L ${bEndSvg.x} ${bEndSvg.y} Z`;

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Skalarprodukt og Krydsprodukt</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Indstil koordinaterne for vektorerne $\vec{a}$ og $\vec{b}$. Se skalarproduktet (vinklen) og krydsproduktet (arealet og normalvektoren) live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl"
          >
            {/* Coordinate Axes */}
            <line x1={originSvg.x} y1={originSvg.y} x2={xAxisSvg.x} y2={xAxisSvg.y} className="stroke-slate-350 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={originSvg.x} y1={originSvg.y} x2={yAxisSvg.x} y2={yAxisSvg.y} className="stroke-slate-350 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={originSvg.x} y1={originSvg.y} x2={zAxisSvg.x} y2={zAxisSvg.y} className="stroke-slate-350 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />

            <defs>
              <marker id="arrow-a" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-b" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>
              <marker id="arrow-cross" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Parallelogram Spanned by A and B */}
            <path d={parallelogramPath} className="fill-indigo-500/10 stroke-indigo-500/20 dark:fill-indigo-400/5 dark:stroke-indigo-400/20" strokeWidth="1" />

            {/* Vector a (Blue) */}
            <line x1={originSvg.x} y1={originSvg.y} x2={aEndSvg.x} y2={aEndSvg.y} className="stroke-blue-500" strokeWidth="3" markerEnd="url(#arrow-a)" />
            <text x={aEndSvg.x + 6} y={aEndSvg.y + 4} className="fill-blue-600 dark:fill-blue-400 font-extrabold text-xs">a</text>

            {/* Vector b (Emerald) */}
            <line x1={originSvg.x} y1={originSvg.y} x2={bEndSvg.x} y2={bEndSvg.y} className="stroke-emerald-500" strokeWidth="3" markerEnd="url(#arrow-b)" />
            <text x={bEndSvg.x + 6} y={bEndSvg.y + 4} className="fill-emerald-600 dark:fill-emerald-400 font-extrabold text-xs">b</text>

            {/* Cross Product Vector (Red) */}
            {crossLen > 0.01 && (
              <>
                <line x1={originSvg.x} y1={originSvg.y} x2={crossEndSvg.x} y2={crossEndSvg.y} className="stroke-red-500" strokeWidth="3.5" markerEnd="url(#arrow-cross)" />
                <text x={crossEndSvg.x + 8} y={crossEndSvg.y} className="fill-red-600 dark:fill-red-400 font-extrabold text-xs">
                  a × b {crossScale < 1.0 && '(skaleret)'}
                </text>
              </>
            )}
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-3 mt-4 px-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-semibold text-blue-500">a_x = {ax}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={ax}
                  onChange={(e) => setAx(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <span className="font-semibold text-blue-500">a_y = {ay}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={ay}
                  onChange={(e) => setAy(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <span className="font-semibold text-blue-500">a_z = {az}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={az}
                  onChange={(e) => setAz(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div>
                <span className="font-semibold text-emerald-500">b_x = {bx}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={bx}
                  onChange={(e) => setBx(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <span className="font-semibold text-emerald-500">b_y = {by}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={by}
                  onChange={(e) => setBy(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <span className="font-semibold text-emerald-500">b_z = {bz}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={bz}
                  onChange={(e) => setBz(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Skalarprodukt (Prikprodukt)
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                a &middot; b = a_x&middot;b_x + a_y&middot;b_y + a_z&middot;b_z
                <br />
                a &middot; b = ({ax})({bx}) + ({ay})({by}) + ({az})({bz})
                <br />
                a &middot; b = <span className="font-bold text-indigo-600 dark:text-sky-400">{dot}</span>
                <br />
                Vinkel θ = {exactTheta.toFixed(1)}°
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Krydsprodukt (Vektorprodukt)
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                a × b = (a_y&middot;b_z - a_z&middot;b_y, a_z&middot;b_x - a_x&middot;b_z, a_x&middot;b_y - a_y&middot;b_x)
                <br />
                a × b = <span className="font-bold text-red-600 dark:text-red-400">({cx}, {cy_vec}, {cz})</span>
                <br />
                Areal af parallelogram = {crossLen.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
