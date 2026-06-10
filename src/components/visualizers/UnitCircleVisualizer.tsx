import React, { useState, useRef } from 'react';

export const UnitCircleVisualizer: React.FC = () => {
  const [angle, setAngle] = useState<number>(45);
  const svgRef = useRef<SVGSVGElement>(null);

  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tan = Math.tan(rad);

  const cx = 170;
  const cy = 170;
  const r = 110; // SVG scale radius

  // Calculate points
  const px = cx + r * cos;
  const py = cy - r * sin; // SVG y goes down

  // Tangent point intersection on line x = cx + r
  // Since px_tan = cx + r, and (py_tan - cy) / r = -tan(angle)
  // py_tan = cy - r * tan(angle)
  const tx = cx + r;
  const ty = cy - r * tan;

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    // Calculate relative coordinates in SVG space (assuming viewBox is 340x340)
    const scaleX = 340 / rect.width;
    const scaleY = 340 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const dx = clickX - cx;
    const dy = cy - clickY; // Invert Y for mathematical angles

    let angleRad = Math.atan2(dy, dx);
    if (angleRad < 0) angleRad += 2 * Math.PI;

    const angleDeg = Math.round((angleRad * 180) / Math.PI);
    setAngle(angleDeg);
  };

  // SVG arc path for angle
  const arcPath = () => {
    if (angle === 0) return '';
    const largeArc = angle > 180 ? 1 : 0;
    const sweep = 0; // standard CCW in math (which is CW in raw SVG, but since we invert Y it is sweep=0/1 depending on coordinate)
    // Start at (cx + 25, cy), end at (cx + 25*cos, cy - 25*sin)
    const ax = cx + 25 * cos;
    const ay = cy - 25 * sin;
    return `M ${cx + 25} ${cy} A 25 25 0 ${largeArc} 0 ${ax} ${ay}`;
  };

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Enhedscirklen</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk direkte i punktet på cirklen eller brug skyderen til at se, hvordan $\cos(\theta)$, $\sin(\theta)$ og $\tan(\theta)$ defineres.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Unit Circle (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg
            ref={svgRef}
            viewBox="0 0 340 340"
            className="w-full max-w-[340px] h-auto overflow-visible select-none cursor-crosshair touch-none"
            onPointerDown={handlePointer}
            onPointerMove={handlePointer}
          >
            {/* Circle grid lines */}
            <circle cx={cx} cy={cy} r={r} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="2" fill="none" />
            
            {/* Axis */}
            <line x1={cx - r - 25} y1={cy} x2={cx + r + 40} y2={cy} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
            <line x1={cx} y1={cy - r - 25} x2={cx} y2={cy + r + 25} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
            
            {/* Axis Labels */}
            <text x={cx + r + 30} y={cy + 4} className="fill-slate-400 dark:fill-slate-500 font-bold text-xs">x</text>
            <text x={cx - 4} y={cy - r - 15} className="fill-slate-400 dark:fill-slate-500 font-bold text-xs">y</text>

            {/* Tangent line at x = 1 */}
            <line x1={cx + r} y1={cy - r - 20} x2={cx + r} y2={cy + r + 20} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="3 3" />
            <text x={cx + r + 5} y={cy - r - 10} className="fill-slate-400 dark:fill-slate-500 text-[10px]">x = 1</text>

            {/* Angle Arc */}
            {angle > 0 && (
              <path
                d={arcPath()}
                className="stroke-amber-500 dark:stroke-amber-400"
                strokeWidth="2"
                fill="none"
              />
            )}

            {/* Cosine line (Emerald) */}
            <line x1={cx} y1={cy} x2={px} y2={cy} className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="3" />
            
            {/* Sine line (Indigo) */}
            <line x1={px} y1={cy} x2={px} y2={py} className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth="3" />

            {/* Radius vector (Slate) */}
            <line x1={cx} y1={cy} x2={px} y2={py} className="stroke-slate-700 dark:stroke-slate-350" strokeWidth="2.5" />

            {/* Extended line for tangent */}
            {Math.abs(cos) > 0.05 && Math.abs(tan) < 2.5 && (
              <line
                x1={cx}
                y1={cy}
                x2={tx}
                y2={ty}
                className="stroke-rose-400/50 dark:stroke-rose-600/30"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}

            {/* Tangent line segment (Rose) */}
            {Math.abs(tan) < 2.5 && (
              <line x1={cx + r} y1={cy} x2={tx} y2={ty} className="stroke-rose-500 dark:stroke-rose-400" strokeWidth="3" />
            )}

            {/* Point on circle */}
            <circle cx={px} cy={py} r={6} className="fill-brand-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            
            {/* Labels */}
            <text x={cx + 12} y={cy - 8} className="fill-amber-600 dark:fill-amber-400 font-bold text-[11px]">{angle}°</text>
            <text x={px + (cos >= 0 ? 8 : -30)} y={py - 8} className="fill-slate-800 dark:fill-slate-200 font-bold text-xs">P</text>
          </svg>

          {/* Slider */}
          <div className="w-full max-w-md mt-4 px-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Vinkel θ = 0°</span>
              <span className="font-bold text-amber-500">θ = {angle}°</span>
              <span>θ = 360°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Math details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Trigonometriske Værdier
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="flex justify-between items-center bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Cosinus: cos({angle}°)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-250">
                  {cos.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Sinus: sin({angle}°)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-250">
                  {sin.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                <span className="font-semibold text-rose-700 dark:text-rose-300">Tangent: tan({angle}°)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-250">
                  {Math.abs(tan) > 100 ? '± Uendelig' : tan.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Definitionsforhold:</span>
            - **Cosinus** er x-koordinaten til retningspunktet P.
            - **Sinus** er y-koordinaten til retningspunktet P.
            - **Tangent** er y-værdien, hvor radiusvektorens forlængelse skærer linjen x = 1 (tangenten til cirklen i (1,0)).
          </div>
        </div>
      </div>
    </div>
  );
};
