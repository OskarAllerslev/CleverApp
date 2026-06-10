import React, { useState } from 'react';

export const SphereEquation3DVisualizer: React.FC = () => {
  // Center coordinates (x0, y0, z0)
  const [x0, setX0] = useState<number>(0);
  const [y0, setY0] = useState<number>(0);
  const [z0, setZ0] = useState<number>(1);

  // Radius r
  const [r, setR] = useState<number>(4.0);

  // Spherical angles for point P on surface
  const [theta, setTheta] = useState<number>(45); // azimuthal angle (0 to 360)
  const [phi, setPhi] = useState<number>(60);     // polar angle (0 to 180)

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

  // Convert spherical coords to Cartesian for Point P relative to center
  const thetaRad = (theta * Math.PI) / 180;
  const phiRad = (phi * Math.PI) / 180;

  const dx = r * Math.sin(phiRad) * Math.cos(thetaRad);
  const dy = r * Math.sin(phiRad) * Math.sin(thetaRad);
  const dz = r * Math.cos(phiRad);

  const px = x0 + dx;
  const py = y0 + dy;
  const pz = z0 + dz;

  // Project points
  const cSvg = project(x0, y0, z0);
  const pSvg = project(px, py, pz);
  const originSvg = project(0, 0, 0);
  const xAxisSvg = project(8, 0, 0);
  const yAxisSvg = project(0, 8, 0);
  const zAxisSvg = project(0, 0, 8);

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Kuglens Ligning i 3D</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Indstil kuglens centrum $C(x_0, y_0, z_0)$ og radius $r$. Roter punktet $P(x,y,z)$ på kuglefladen med vinklerne $\theta$ og $\phi$.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] h-auto overflow-visible select-none bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl"
          >
            {/* Defs for shading gradient */}
            <defs>
              <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Axes */}
            <line x1={originSvg.x} y1={originSvg.y} x2={xAxisSvg.x} y2={xAxisSvg.y} className="stroke-slate-350 dark:stroke-slate-750" strokeWidth="1" />
            <line x1={originSvg.x} y1={originSvg.y} x2={yAxisSvg.x} y2={yAxisSvg.y} className="stroke-slate-350 dark:stroke-slate-750" strokeWidth="1" />
            <line x1={originSvg.x} y1={originSvg.y} x2={zAxisSvg.x} y2={zAxisSvg.y} className="stroke-slate-350 dark:stroke-slate-750" strokeWidth="1" />

            {/* Sphere shaded overlay */}
            <circle
              cx={cSvg.x}
              cy={cSvg.y}
              r={r * scale}
              fill="url(#sphereGrad)"
              className="stroke-indigo-500/50 dark:stroke-indigo-400/40"
              strokeWidth="1.5"
            />

            {/* Center Point */}
            <circle cx={cSvg.x} cy={cSvg.y} r={4.5} className="fill-indigo-600 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <text x={cSvg.x - 18} y={cSvg.y + 14} className="fill-indigo-700 dark:fill-indigo-400 font-bold text-[10px]">
              C({x0},{y0},{z0})
            </text>

            {/* Radius line from C to P */}
            <line x1={cSvg.x} y1={cSvg.y} x2={pSvg.x} y2={pSvg.y} className="stroke-rose-500 dark:stroke-rose-450" strokeWidth="2.5" />

            {/* Point P on Surface */}
            <circle cx={pSvg.x} cy={pSvg.y} r={5.5} className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
            <text x={pSvg.x + 8} y={pSvg.y - 8} className="fill-slate-800 dark:fill-slate-200 font-extrabold text-[10px]">
              P({px.toFixed(1)}, {py.toFixed(1)}, {pz.toFixed(1)})
            </text>
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-3 mt-4 px-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-semibold text-indigo-500">C_x = {x0}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={x0}
                  onChange={(e) => setX0(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <span className="font-semibold text-indigo-500">C_y = {y0}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={y0}
                  onChange={(e) => setY0(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <span className="font-semibold text-indigo-500">C_z = {z0}</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={z0}
                  onChange={(e) => setZ0(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div>
                <span className="font-semibold text-brand-600">Radius r = {r.toFixed(1)}</span>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.5"
                  value={r}
                  onChange={(e) => setR(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
              <div>
                <span className="font-semibold text-amber-500">θ (Dreje x-y) = {theta}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={theta}
                  onChange={(e) => setTheta(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <span className="font-semibold text-amber-500">φ (Højde z) = {phi}°</span>
                <input
                  type="range"
                  min="10"
                  max="170"
                  value={phi}
                  onChange={(e) => setPhi(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Kuglens Ligning
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                (x - x₀)² + (y - y₀)² + (z - z₀)² = r²
                <br />
                ({px.toFixed(1)} - {x0})² + ({py.toFixed(1)} - {y0})² + ({pz.toFixed(1)} - {z0})² = {r.toFixed(1)}²
                <br />
                {dx.toFixed(2)}² + {dy.toFixed(2)}² + {dz.toFixed(2)}² = {(r * r).toFixed(1)}
                <br />
                {(dx * dx).toFixed(2)} + {(dy * dy).toFixed(2)} + {(dz * dz).toFixed(2)} = <span className="text-indigo-600 dark:text-sky-400 font-bold">{(r * r).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Geometrisk Betydning:</span>
            Kuglefladen består af alle punkter i rummet, der har afstanden $r$ til centrum. Det er en direkte udvidelse af cirkelligningen til 3D-rummet.
          </div>
        </div>
      </div>
    </div>
  );
};
