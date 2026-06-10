import React, { useState } from 'react';

export const VectorPlane3DVisualizer: React.FC = () => {
  const [mode, setMode] = useState<'line' | 'plane'>('plane');

  // Base point r0
  const [x0, setX0] = useState<number>(0);
  const [y0, setY0] = useState<number>(0);
  const [z0, setZ0] = useState<number>(2);

  // Vector u (direction 1)
  const [ux, setUx] = useState<number>(2);
  const [uy, setUy] = useState<number>(1);
  const [uz, setUz] = useState<number>(1);

  // Vector v (direction 2)
  const [vx, setVx] = useState<number>(-1);
  const [vy, setVy] = useState<number>(2);
  const [vz, setVz] = useState<number>(-1);

  const scale = 14;

  const project = (x: number, y: number, z: number) => {
    const cx = 160;
    const cy = 160;

    const ax = -Math.cos(Math.PI / 6) * scale;
    const ay = Math.sin(Math.PI / 6) * scale;

    const bx = Math.cos(Math.PI / 6) * scale;
    const by = Math.sin(Math.PI / 6) * scale;

    const cx_z = 0;
    const cy_z = -scale;

    return {
      x: cx + x * ax + y * bx + z * cx_z,
      y: cy + x * ay + y * by + z * cy_z
    };
  };

  // Projected SVG coordinates
  const originSvg = project(0, 0, 0);
  const xAxisSvg = project(8, 0, 0);
  const yAxisSvg = project(0, 8, 0);
  const zAxisSvg = project(0, 0, 8);

  const r0Svg = project(x0, y0, z0);

  // Vector arrows starting from r0
  const uEndSvg = project(x0 + ux, y0 + uy, z0 + uz);
  const vEndSvg = project(x0 + vx, y0 + vy, z0 + vz);

  // Line points (t in [-2.5, 2.5])
  const lineStartSvg = project(x0 - 2.5 * ux, y0 - 2.5 * uy, z0 - 2.5 * uz);
  const lineEndSvg = project(x0 + 2.5 * ux, y0 + 2.5 * uy, z0 + 2.5 * uz);

  // Plane quadrilateral corners (s in [-2, 2], t in [-2, 2])
  const c1 = project(x0 - 2 * ux - 2 * vx, y0 - 2 * uy - 2 * vy, z0 - 2 * uz - 2 * vz);
  const c2 = project(x0 + 2 * ux - 2 * vx, y0 + 2 * uy - 2 * vy, z0 + 2 * uz - 2 * vz);
  const c3 = project(x0 + 2 * ux + 2 * vx, y0 + 2 * uy + 2 * vy, z0 + 2 * uz + 2 * vz);
  const c4 = project(x0 - 2 * ux + 2 * vx, y0 - 2 * uy + 2 * vy, z0 - 2 * uz + 2 * vz);

  const planePath = `M ${c1.x} ${c1.y} L ${c2.x} ${c2.y} L ${c3.x} ${c3.y} L ${c4.x} ${c4.y} Z`;

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
            Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Parameterfremstilling i Rummet</span>
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Indstil startpunktet $\vec{r}_0$ og retningsvektorerne $\vec{u}$ og $\vec{v}$.
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-850">
          <button
            onClick={() => setMode('line')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit transition-all duration-150 ${
              mode === 'line'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-sky-400 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Linje (1 parameter)
          </button>
          <button
            onClick={() => setMode('plane')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit transition-all duration-150 ${
              mode === 'plane'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-sky-400 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Plan (2 parametre)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl"
          >
            {/* Coordinate Axes */}
            <line x1={originSvg.x} y1={originSvg.y} x2={xAxisSvg.x} y2={xAxisSvg.y} className="stroke-slate-300 dark:stroke-slate-750" strokeWidth="1" />
            <line x1={originSvg.x} y1={originSvg.y} x2={yAxisSvg.x} y2={yAxisSvg.y} className="stroke-slate-300 dark:stroke-slate-750" strokeWidth="1" />
            <line x1={originSvg.x} y1={originSvg.y} x2={zAxisSvg.x} y2={zAxisSvg.y} className="stroke-slate-300 dark:stroke-slate-750" strokeWidth="1" />
            
            {/* Markers */}
            <defs>
              <marker id="arrow-u" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-v" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Render Plane grid/quad */}
            {mode === 'plane' && (
              <path d={planePath} className="fill-indigo-500/10 stroke-indigo-500/30 dark:fill-indigo-500/5 dark:stroke-indigo-400/30" strokeWidth="1.5" />
            )}

            {/* Render Line */}
            {mode === 'line' && (
              <line x1={lineStartSvg.x} y1={lineStartSvg.y} x2={lineEndSvg.x} y2={lineEndSvg.y} className="stroke-blue-500/60 dark:stroke-blue-400/50" strokeWidth="2.5" />
            )}

            {/* Base point vector from origin to r0 */}
            <line x1={originSvg.x} y1={originSvg.y} x2={r0Svg.x} y2={r0Svg.y} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Base point P0 */}
            <circle cx={r0Svg.x} cy={r0Svg.y} r={4.5} className="fill-slate-800 dark:fill-slate-100 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <text x={r0Svg.x + 8} y={r0Svg.y + 4} className="fill-slate-700 dark:fill-slate-350 text-[10px] font-bold">P₀({x0},{y0},{z0})</text>

            {/* Direction Vector u (Blue) */}
            <line x1={r0Svg.x} y1={r0Svg.y} x2={uEndSvg.x} y2={uEndSvg.y} className="stroke-blue-500" strokeWidth="2.5" markerEnd="url(#arrow-u)" />
            <text x={uEndSvg.x + 6} y={uEndSvg.y - 4} className="fill-blue-600 dark:fill-blue-400 text-[10px] font-bold">u</text>

            {/* Direction Vector v (Green) - only if plane */}
            {mode === 'plane' && (
              <>
                <line x1={r0Svg.x} y1={r0Svg.y} x2={vEndSvg.x} y2={vEndSvg.y} className="stroke-emerald-500" strokeWidth="2.5" markerEnd="url(#arrow-v)" />
                <text x={vEndSvg.x + 6} y={vEndSvg.y - 4} className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-bold">v</text>
              </>
            )}
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-2.5 mt-4 px-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">P₀_x = {x0}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={x0}
                  onChange={(e) => setX0(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">P₀_y = {y0}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={y0}
                  onChange={(e) => setY0(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">P₀_z = {z0}</span>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={z0}
                  onChange={(e) => setZ0(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div>
                <span className="font-semibold text-blue-500">u_x = {ux}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={ux}
                  onChange={(e) => setUx(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <span className="font-semibold text-blue-500">u_y = {uy}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={uy}
                  onChange={(e) => setUy(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <span className="font-semibold text-blue-500">u_z = {uz}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={uz}
                  onChange={(e) => setUz(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {mode === 'plane' && (
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div>
                  <span className="font-semibold text-emerald-500 font-mono">v_x = {vx}</span>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    value={vx}
                    onChange={(e) => setVx(parseInt(e.target.value) || 1)}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div>
                  <span className="font-semibold text-emerald-500 font-mono">v_y = {vy}</span>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    value={vy}
                    onChange={(e) => setVy(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div>
                  <span className="font-semibold text-emerald-500 font-mono">v_z = {vz}</span>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    value={vz}
                    onChange={(e) => setVz(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Math explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Parameterfremstilling
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                {mode === 'line' ? (
                  <>
                    Linjens ligning:
                    <br />
                    r(t) = r₀ + t &middot; u
                    <br />
                    r(t) = ({x0}, {y0}, {z0}) + t &middot; ({ux}, {uy}, {uz})
                  </>
                ) : (
                  <>
                    Planets ligning:
                    <br />
                    r(s, t) = r₀ + s &middot; u + t &middot; v
                    <br />
                    r(s, t) = ({x0}, {y0}, {z0}) + s &middot; ({ux}, {uy}, {uz}) + t &middot; ({vx}, {vy}, {vz})
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Hvad repræsenterer parametrene?</span>
            - For **linjen**: Når parameteren $t$ gennemløber alle reelle tal, tegner vektoren en uendelig ret linje i rummet.
            - For **planet**: Når de to parametre $s$ og $t$ uafhængigt gennemløber alle reelle tal, udspænder de en hel uendelig flade (et plan) i rummet. De to retningsvektorer $\vec{u}$ og $\vec{v}$ må **ikke** være parallelle!
          </div>
        </div>
      </div>
    </div>
  );
};
