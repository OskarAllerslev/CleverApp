import React, { useState, useEffect } from 'react';
import { MathRenderer } from '../MathRenderer';

export const TangentVisualizer: React.FC = () => {
  const [x0, setX0] = useState<number>(2);
  const [h, setH] = useState<number>(1.5);

  const f = (x: number) => 0.25 * x * x + 1;
  const df = (x: number) => 0.5 * x;

  // Secant slope: m_sec = (f(x0+h) - f(x0)) / h
  // Handle h = 0 case by taking limit
  const isHZero = Math.abs(h) < 0.001;
  const mSec = isHZero ? df(x0) : (f(x0 + h) - f(x0)) / h;
  const mTan = df(x0);

  const y0 = f(x0);
  const yH = f(x0 + h);

  // SVG dimensions
  // Coordinate range: x in [-5, 5], y in [0, 8]
  const minX = -5;
  const maxX = 5;
  const minY = 0;
  const maxY = 8;

  const width = 340;
  const height = 300;

  const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
  const mapY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

  // Parabola path data
  const getParabolaPath = () => {
    let path = '';
    const step = 0.1;
    for (let x = minX; x <= maxX; x += step) {
      const px = mapX(x);
      const py = mapY(f(x));
      if (x === minX) {
        path += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      } else {
        path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }
    return path;
  };

  // Line path data: y = m*(x - x0) + y0
  const getLinePath = (m: number) => {
    const xStart = minX;
    const yStart = m * (xStart - x0) + y0;
    const xEnd = maxX;
    const yEnd = m * (xEnd - x0) + y0;
    return `M ${mapX(xStart).toFixed(1)} ${mapY(yStart).toFixed(1)} L ${mapX(xEnd).toFixed(1)} ${mapY(yEnd).toFixed(1)}`;
  };

  return (
    <div className="my-10 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Sekant & Tangent (Tretrinsreglen) ⚡
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Undersøg hvordan sekantlinjen (orange) nærmer sig tangentlinjen (grøn) som afstanden <span className="font-semibold text-orange-500">h → 0</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Plot (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-inner overflow-hidden select-none"
          >
            {/* Grid Lines */}
            {Array.from({ length: 11 }).map((_, i) => {
              const xVal = minX + i;
              const xPos = mapX(xVal);
              return (
                <line
                  key={`grid-x-${i}`}
                  x1={xPos}
                  y1={0}
                  x2={xPos}
                  y2={height}
                  className="stroke-slate-100 dark:stroke-slate-850"
                  strokeWidth="1"
                />
              );
            })}
            {Array.from({ length: 9 }).map((_, i) => {
              const yVal = minY + i;
              const yPos = mapY(yVal);
              return (
                <line
                  key={`grid-y-${i}`}
                  x1={0}
                  y1={yPos}
                  x2={width}
                  y2={yPos}
                  className="stroke-slate-100 dark:stroke-slate-850"
                  strokeWidth="1"
                />
              );
            })}

            {/* X and Y Axes */}
            <line x1={0} y1={mapY(0)} x2={width} y2={mapY(0)} className="stroke-slate-350 dark:stroke-slate-700" strokeWidth="2" />
            <line x1={mapX(0)} y1={0} x2={mapX(0)} y2={height} className="stroke-slate-350 dark:stroke-slate-700" strokeWidth="2" />

            {/* Parabola: f(x) = 0.25x^2 + 1 */}
            <path d={getParabolaPath()} fill="none" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="2.5" />

            {/* Tangent Line (Green) */}
            <path d={getLinePath(mTan)} fill="none" className="stroke-emerald-500/80 dark:stroke-emerald-400/80" strokeWidth="2" />

            {/* Secant Line (Orange/Yellow) */}
            {!isHZero && (
              <path
                d={getLinePath(mSec)}
                fill="none"
                className="stroke-orange-500 dark:stroke-amber-400"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}

            {/* Point P (x0, y0) */}
            <circle cx={mapX(x0)} cy={mapY(y0)} r="6" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            <text x={mapX(x0) - 15} y={mapY(y0) - 10} className="text-xs font-bold fill-emerald-600 dark:fill-emerald-400">P</text>

            {/* Point Q (x0+h, yH) */}
            {!isHZero && (
              <>
                <circle cx={mapX(x0 + h)} cy={mapY(yH)} r="6" className="fill-orange-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <text x={mapX(x0 + h) + 10} y={mapY(yH) + 5} className="text-xs font-bold fill-orange-600 dark:fill-orange-400">Q</text>
              </>
            )}

            {/* Label coordinates */}
            <text x={10} y={20} className="text-[10px] font-semibold fill-slate-400 dark:fill-slate-500">f(x) = 0.25x² + 1</text>
          </svg>
        </div>

        {/* Right: Controls & Explanations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Punkt <span className="text-emerald-500">x₀</span>:
                </span>
                <span className="font-bold text-emerald-500">{x0.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="3"
                step="0.1"
                value={x0}
                onChange={(e) => setX0(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Afstand <span className="text-orange-500">h</span>:
                </span>
                <span className={`font-bold ${isHZero ? 'text-emerald-500 animate-pulse' : 'text-orange-500'}`}>
                  {isHZero ? '→ 0 (Grænseværdi)' : h.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-2.5"
                max="2.5"
                step="0.05"
                value={h}
                onChange={(e) => setH(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>

          {/* Dynamic explanation of Tretrinsreglen */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-850/80 rounded-2xl space-y-4">
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Beregning med tretrinsreglen (<MathRenderer math="f(x) = 0{,}25x^2 + 1" />)
            </h5>

            {/* Trin 1 */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-350 block">Trin 1: Funktionstilvækst <MathRenderer math="\Delta y = f(x_0+h) - f(x_0)" /></span>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-350 space-y-2">
                <MathRenderer block math={`\\Delta y = f(${x0.toFixed(2)} + ${isHZero ? 'h' : h.toFixed(2)}) - f(${x0.toFixed(2)})`} />
                <MathRenderer block math={`\\Delta y = ${f(x0 + h).toFixed(3)} - ${f(x0).toFixed(3)} = ${isHZero ? '0{,}50 \\cdot h + 0{,}25 \\cdot h^2' : (f(x0 + h) - f(x0)).toFixed(3)}`} />
              </div>
            </div>

            {/* Trin 2 */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-350 block">Trin 2: Differenskvotient <MathRenderer math="\frac{\Delta y}{h}" /> (Sekanthældning)</span>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-350 space-y-2">
                <MathRenderer block math={`\\frac{\\Delta y}{h} = ${isHZero ? '0{,}50 \\cdot x_0 + 0{,}25 \\cdot h' : `\\frac{${(f(x0 + h) - f(x0)).toFixed(3)}}{${h.toFixed(2)}}`} = \\mathbf{${mSec.toFixed(3)}}`} className="text-orange-600 dark:text-amber-400 font-bold" />
              </div>
            </div>

            {/* Trin 3 */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-350 block">Trin 3: Grænseværdi <MathRenderer math="h \to 0" /> (Tangenthældning <MathRenderer math="f'(x_0)" />)</span>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-350 space-y-2">
                <MathRenderer block math={`f'(${x0.toFixed(2)}) = \\lim_{h \\to 0} \\left(0{,}50 \\cdot ${x0.toFixed(2)} + 0{,}25 \\cdot h\\right) = \\mathbf{${mTan.toFixed(3)}}`} className="text-emerald-600 dark:text-emerald-450 font-bold" />
              </div>
            </div>
          </div>

          {/* Success state when h is zero */}
          {isHZero ? (
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-pulse">
              🎉 <strong>Grænseovergangen er fuldført!</strong> Da h er tæt på 0, falder sekantlinjen sammen med tangenten. Sekanthældningen ({mSec.toFixed(3)}) er nu lig med differentialkvotienten f'({x0.toFixed(1)}) = {mTan.toFixed(3)}.
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              💡 <strong>Prøv dette:</strong> Træk i <span className="font-semibold text-orange-500">h-skyderen</span> for at gøre den mindre. Læg mærke til, hvordan den orange sekantlinje roterer og lægger sig mere og mere fladt mod den grønne tangent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TangentVisualizer;
