import React, { useState } from 'react';

export const OptimizationVisualizer: React.FC = () => {
  const [x, setX] = useState<number>(15); // Side length x (0 to 60)

  // Total fence is 120. y = 120 - 2x.
  const totalFence = 120;
  const y = Math.max(0, totalFence - 2 * x);
  const area = x * y;

  const handleReset = () => {
    setX(15);
  };

  // Math functions
  const getAreaForX = (val: number) => val * (totalFence - 2 * val);

  // SVG dimensions
  const width = 320;
  const height = 220;

  // Map area graph coordinates
  // x is in [0, 60], y (area) is in [0, 2000]
  const mapGraphX = (val: number) => (val / 60) * (width - 40) + 20;
  const mapGraphY = (val: number) => height - 30 - (val / 2000) * (height - 50);

  // Generate path for Area function parabola
  const getParabolaPath = () => {
    let path = '';
    const step = 1;
    for (let px = 0; px <= 60; px += step) {
      const sx = mapGraphX(px);
      const sy = mapGraphY(getAreaForX(px));
      if (px === 0) {
        path += `M ${sx} ${sy}`;
      } else {
        path += ` L ${sx} ${sy}`;
      }
    }
    return path;
  };

  // Derivative value A'(x) = 120 - 4x
  const derivative = totalFence - 4 * x;

  return (
    <div className="my-10 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Optimering: Det Største Areal 🚜
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Landmanden har <span className="font-semibold text-brand-650 dark:text-sky-400">120 m</span> hegn. Træk i skyderen for at ændre <span className="font-semibold text-emerald-500">x</span> og finde det maksimale areal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Schematic (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fysisk Model</span>
          
          <svg
            width={width}
            height={height}
            className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner overflow-hidden"
          >
            {/* The Wall (Top) */}
            <rect x={0} y={0} width={width} height={20} className="fill-slate-300 dark:fill-slate-750 stroke-slate-400 dark:stroke-slate-700" strokeWidth="1" />
            {/* Wall brick lines pattern (schematic) */}
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`brick-${i}`} x1={i * 20} y1={0} x2={i * 20 + 10} y2={20} className="stroke-slate-400 dark:stroke-slate-700" strokeWidth="1" />
            ))}
            <text x={width / 2} y={14} className="text-[10px] font-bold fill-slate-600 dark:fill-slate-350" textAnchor="middle">FAST MUR</text>

            {/* Fence Geometry */}
            {/* Scale fence display. Max x is 60 (takes up 90px max vertically).
                Let's scale x so x=60 is 100px. Scale factor = 100/60 = 1.66
                y max is 120 (takes up 240px max horizontally).
                Scale factor for y so y=120 is 200px. Scale factor = 200/120 = 1.66
            */}
            {(() => {
              const scale = 1.6;
              const fWidth = y * scale;
              const fHeight = x * scale;
              
              const startX = (width - fWidth) / 2;
              const startY = 20;

              return (
                <g>
                  {/* Grass background inside fence */}
                  <rect
                    x={startX}
                    y={startY}
                    width={fWidth}
                    height={fHeight}
                    className="fill-emerald-500/5 dark:fill-emerald-500/10 transition-all duration-150"
                  />

                  {/* Fence Lines (3 sides) */}
                  {/* Left fence (x) */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={startX}
                    y2={startY + fHeight}
                    className="stroke-orange-500 dark:stroke-amber-400 transition-all duration-150"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Bottom fence (y) */}
                  <line
                    x1={startX}
                    y1={startY + fHeight}
                    x2={startX + fWidth}
                    y2={startY + fHeight}
                    className="stroke-brand-500 dark:stroke-sky-450 transition-all duration-150"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Right fence (x) */}
                  <line
                    x1={startX + fWidth}
                    y1={startY}
                    x2={startX + fWidth}
                    y2={startY + fHeight}
                    className="stroke-orange-500 dark:stroke-amber-400 transition-all duration-150"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Labels */}
                  {/* x labels */}
                  {x > 5 && (
                    <>
                      <text x={startX - 12} y={startY + fHeight / 2 + 4} className="text-[10px] font-bold fill-orange-600 dark:fill-orange-400 text-right">
                        x = {x.toFixed(0)}m
                      </text>
                      <text x={startX + fWidth + 12} y={startY + fHeight / 2 + 4} className="text-[10px] font-bold fill-orange-600 dark:fill-orange-400">
                        x = {x.toFixed(0)}m
                      </text>
                    </>
                  )}
                  {/* y label */}
                  {y > 10 && (
                    <text x={startX + fWidth / 2} y={startY + fHeight + 14} className="text-[10px] font-bold fill-brand-600 dark:fill-sky-400" textAnchor="middle">
                      y = {y.toFixed(0)}m
                    </text>
                  )}
                  {/* Area label in the middle */}
                  {area > 100 && (
                    <text x={width / 2} y={startY + fHeight / 2 + 5} className="text-xs font-bold fill-slate-700 dark:fill-slate-300 transition-all duration-150 text-center" textAnchor="middle">
                      Areal: {area.toFixed(0)} m²
                    </text>
                  )}
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Right: Area Graph & Calculations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Sidelængde (<span className="text-orange-500 font-bold">x</span>):
              </span>
              <span className="font-bold text-orange-500 text-base">{x.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="0.5"
              value={x}
              onChange={(e) => setX(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 m</span>
              <span>Optimal: 30 m</span>
              <span>60 m</span>
            </div>
          </div>

          {/* Area Graph */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-2">Arealfunktion A(x) = 120x - 2x²</span>
            <svg
              width={width}
              height={height - 40}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-visible select-none shadow-sm"
            >
              {/* Axes */}
              <line x1={20} y1={height - 30} x2={width - 10} y2={height - 30} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
              <line x1={20} y1={10} x2={20} y2={height - 30} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />

              {/* Parabola path */}
              <path d={getParabolaPath()} fill="none" className="stroke-emerald-400 dark:stroke-emerald-600/70" strokeWidth="2.5" />

              {/* Maximum point line/dot */}
              <line
                x1={mapGraphX(30)}
                y1={mapGraphY(0)}
                x2={mapGraphX(30)}
                y2={mapGraphY(1800)}
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={mapGraphX(30)} cy={mapGraphY(1800)} r="4" className="fill-slate-400 dark:fill-slate-600" />
              <text x={mapGraphX(30)} y={mapGraphY(1800) - 8} className="text-[9px] fill-slate-450 dark:fill-slate-500 text-center" textAnchor="middle">Maks (30m, 1800m²)</text>

              {/* Current point */}
              <circle
                cx={mapGraphX(x)}
                cy={mapGraphY(area)}
                r="6.5"
                className="fill-brand-500 stroke-white dark:stroke-slate-900 transition-all duration-150"
                strokeWidth="2.5"
              />

              {/* Graph labels */}
              <text x={width - 20} y={height - 15} className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 text-right">x (meter)</text>
              <text x={25} y={15} className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500">Areal (m²)</text>

              {/* Axis ticks */}
              <text x={mapGraphX(0)} y={height - 18} className="text-[8px] fill-slate-400 dark:fill-slate-500" textAnchor="middle">0</text>
              <text x={mapGraphX(30)} y={height - 18} className="text-[8px] font-bold fill-slate-500 dark:fill-slate-400" textAnchor="middle">30</text>
              <text x={mapGraphX(60)} y={height - 18} className="text-[8px] fill-slate-400 dark:fill-slate-500" textAnchor="middle">60</text>

              <text x={12} y={mapGraphY(1800) + 3} className="text-[8px] fill-slate-500 dark:fill-slate-400" textAnchor="end">1800</text>
            </svg>
          </div>

          {/* Derivative and optimization steps */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 text-xs space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Funktion: A(x) = x · (120 - 2x) =</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">120x - 2x²</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Afledte: A'(x) = 120 - 4x =</span>
              <span className={`font-bold ${Math.abs(derivative) < 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {derivative.toFixed(1).replace(/\.0$/, '')}
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-850 my-1 pt-1 flex justify-between">
              <span className="text-slate-500 font-semibold">Nuværende Areal:</span>
              <span className="font-bold text-brand-600 dark:text-sky-400 font-bold">{area.toFixed(1).replace(/\.0$/, '')} m²</span>
            </div>
          </div>

          {/* Success or Hint Banner */}
          {Math.abs(x - 30) < 0.1 ? (
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-pulse">
              🏆 <strong>Perfekt!</strong> Du har fundet det maksimale areal. Ved $x = 30$ m er hældningen $A'(x) = 0$. Her flader kurven helt ud på toppen, og det rektangulære hegn indhegner præcis <strong>1800 m²</strong>.
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              💡 <strong>Tip:</strong> Prøv at flytte skyderen indtil den afledede $A'(x)$ bliver præcis <strong>0</strong>. Hvad sker der med det nuværende areal?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizationVisualizer;
