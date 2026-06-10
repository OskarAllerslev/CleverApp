import React, { useState } from 'react';

export const VectorDistance3DVisualizer: React.FC = () => {
  // Point P(x1, y1, z1)
  const [px, setPx] = useState<number>(3);
  const [py, setPy] = useState<number>(4);
  const [pz, setPz] = useState<number>(5);

  // Plane ax + by + cz + d = 0
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(1);
  const [c, setC] = useState<number>(2);
  const [d, setD] = useState<number>(-6);

  // Isometric 3D Projection function
  const project = (x: number, y: number, z: number) => {
    const scale = 14;
    const cx = 160;
    const cy = 160;

    // Angle of x, y, z axes
    const ux = -Math.cos(Math.PI / 6) * scale;
    const uy = Math.sin(Math.PI / 6) * scale;

    const vx = Math.cos(Math.PI / 6) * scale;
    const vy = Math.sin(Math.PI / 6) * scale;

    const wx = 0;
    const wy = -scale; // Up

    return {
      x: cx + x * ux + y * vx + z * wx,
      y: cy + x * uy + y * vy + z * wy
    };
  };

  // Math Calculations
  const normalLenSq = a * a + b * b + c * c;
  const normalLen = Math.sqrt(normalLenSq || 1);
  const numerator = Math.abs(a * px + b * py + c * pz + d);
  const distance = numerator / normalLen;

  // Projection point P_proj on plane
  // P_proj = P - (a*px + b*py + c*pz + d) / normalLenSq * (a, b, c)
  const projX = px - ((a * px + b * py + c * pz + d) / (normalLenSq || 1)) * a;
  const projY = py - ((a * px + b * py + c * pz + d) / (normalLenSq || 1)) * b;
  const projZ = pz - ((a * px + b * py + c * pz + d) / (normalLenSq || 1)) * c;

  // Let's construct a square sheet representing the plane
  // We find point P0 on plane: P0 = -d / normalLenSq * (a, b, c)
  const p0x = (-d / (normalLenSq || 1)) * a;
  const p0y = (-d / (normalLenSq || 1)) * b;
  const p0z = (-d / (normalLenSq || 1)) * c;

  // Spanning vectors in plane: U, V perpendicular to normal (a, b, c)
  let ux = 0, uy = 0, uz = 0;
  if (Math.abs(a) > 0.001 || Math.abs(b) > 0.001) {
    const len = Math.sqrt(a * a + b * b);
    ux = -b / len;
    uy = a / len;
    uz = 0;
  } else {
    ux = 1;
    uy = 0;
    uz = 0;
  }

  // V = N x U
  // V = (b*uz - c*uy, c*ux - a*uz, a*uy - b*ux) normalized
  const vx_raw = b * uz - c * uy;
  const vy_raw = c * ux - a * uz;
  const vz_raw = a * uy - b * ux;
  const v_len = Math.sqrt(vx_raw * vx_raw + vy_raw * vy_raw + vz_raw * vz_raw) || 1;
  const vx = vx_raw / v_len;
  const vy = vy_raw / v_len;
  const vz = vz_raw / v_len;

  const L = 6; // Plane side length half
  const c1 = project(p0x - L * ux - L * vx, p0y - L * uy - L * vy, p0z - L * uz - L * vz);
  const c2 = project(p0x + L * ux - L * vx, p0y + L * uy - L * vy, p0z + L * uz - L * vz);
  const c3 = project(p0x + L * ux + L * vx, p0y + L * uy + L * vy, p0z + L * uz + L * vz);
  const c4 = project(p0x - L * ux + L * vx, p0y - L * uy + L * vy, p0z - L * uz + L * vz);

  // SVG Coordinates for drawing
  const pSvg = project(px, py, pz);
  const projSvg = project(projX, projY, projZ);
  const originSvg = project(0, 0, 0);
  const xAxisSvg = project(8, 0, 0);
  const yAxisSvg = project(0, 8, 0);
  const zAxisSvg = project(0, 0, 8);

  const planePath = `M ${c1.x} ${c1.y} L ${c2.x} ${c2.y} L ${c3.x} ${c3.y} L ${c4.x} ${c4.y} Z`;

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Afstand fra punkt til plan i 3D</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Brug skyderne til at ændre punktets koordinater $P(x_1, y_1, z_1)$ og planens ligning $ax + by + cz + d = 0$.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl"
          >
            {/* 3D Coordinate axes */}
            <line x1={originSvg.x} y1={originSvg.y} x2={xAxisSvg.x} y2={xAxisSvg.y} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
            <line x1={originSvg.x} y1={originSvg.y} x2={yAxisSvg.x} y2={yAxisSvg.y} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
            <line x1={originSvg.x} y1={originSvg.y} x2={zAxisSvg.x} y2={zAxisSvg.y} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
            
            {/* Axis Labels */}
            <text x={xAxisSvg.x - 10} y={xAxisSvg.y + 12} className="fill-slate-400 text-[10px] font-bold">x</text>
            <text x={yAxisSvg.x + 8} y={yAxisSvg.y + 10} className="fill-slate-400 text-[10px] font-bold">y</text>
            <text x={zAxisSvg.x - 3} y={zAxisSvg.y - 6} className="fill-slate-400 text-[10px] font-bold">z</text>

            {/* Plane Sheet (Indigo) */}
            <path d={planePath} className="fill-indigo-500/15 stroke-indigo-500/80 dark:fill-indigo-500/10 dark:stroke-indigo-400/80" strokeWidth="1.5" />

            {/* Normal Vector at P0 */}
            {(() => {
              const p0Svg = project(p0x, p0y, p0z);
              const normalEnd = project(p0x + a * 1.5, p0y + b * 1.5, p0z + c * 1.5);
              return (
                <g>
                  <line x1={p0Svg.x} y1={p0Svg.y} x2={normalEnd.x} y2={normalEnd.y} className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" />
                  <circle cx={p0Svg.x} cy={p0Svg.y} r={3} className="fill-indigo-600" />
                </g>
              );
            })()}

            {/* Perpendicular Distance Line (Rose) */}
            <line
              x1={pSvg.x}
              y1={pSvg.y}
              x2={projSvg.x}
              y2={projSvg.y}
              className="stroke-rose-500 dark:stroke-rose-450"
              strokeWidth="2.5"
              strokeDasharray="3 2"
            />

            {/* Projected Point on Plane */}
            <circle cx={projSvg.x} cy={projSvg.y} r={4.5} className="fill-rose-500 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />

            {/* Point P (Amber) */}
            <circle cx={pSvg.x} cy={pSvg.y} r={6.5} className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            <text x={pSvg.x + 9} y={pSvg.y - 9} className="fill-slate-800 dark:fill-slate-200 font-extrabold text-xs">
              P({px}, {py}, {pz})
            </text>
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-3 mt-4 px-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-semibold text-amber-600">P_x = {px}</span>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  value={px}
                  onChange={(e) => setPx(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <span className="font-semibold text-amber-600">P_y = {py}</span>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  value={py}
                  onChange={(e) => setPy(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <span className="font-semibold text-amber-600">P_z = {pz}</span>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  value={pz}
                  onChange={(e) => setPz(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div>
                <span className="font-semibold text-indigo-500">a = {a}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={a}
                  onChange={(e) => setA(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <span className="font-semibold text-indigo-500">b = {b}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={b}
                  onChange={(e) => setB(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <span className="font-semibold text-indigo-500">c = {c}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={c}
                  onChange={(e) => setC(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <span className="font-semibold text-indigo-500 font-mono">d = {d}</span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  value={d}
                  onChange={(e) => setD(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              3D Afstandsformel
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                dist(P, α) = |a·x₁ + b·y₁ + c·z₁ + d| / √(a² + b² + c²)
                <br />
                dist = |({a})({px}) + ({b})({py}) + ({c})({pz}) + ({d})| / √({a}² + {b}² + {c}²)
                <br />
                dist = |{a * px + b * py + c * pz + d}| / √{normalLenSq}
                <br />
                dist = {numerator} / {normalLen.toFixed(3)}
                <br />
                dist = <span className="text-rose-600 dark:text-rose-450 font-bold">{distance.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Geometrisk Note:</span>
            Afstanden er den vinkelrette (ortogonale) linje fra P til planen alpha. Normalvektoren n = (a, b, c) står vinkelret på alle retningsvektorer i planen alpha.
          </div>
        </div>
      </div>
    </div>
  );
};
