import React, { useState } from 'react';

export const LinearFunctionVisualizer: React.FC = () => {
  const [a, setA] = useState<number>(1.5);
  const [b, setB] = useState<number>(-1);

  // Reset values
  const handleReset = () => {
    setA(1);
    setB(0);
  };

  const f = (x: number) => a * x + b;

  // Coordinate limits
  const minX = -6;
  const maxX = 6;
  const minY = -6;
  const maxY = 6;

  const width = 320;
  const height = 320;

  const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
  const mapY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

  // Line path: straight line from minX to maxX
  const getLinePath = () => {
    const xStart = minX;
    const yStart = f(xStart);
    const xEnd = maxX;
    const yEnd = f(xEnd);
    return `M ${mapX(xStart).toFixed(1)} ${mapY(yStart).toFixed(1)} L ${mapX(xEnd).toFixed(1)} ${mapY(yEnd).toFixed(1)}`;
  };

  // Format equation
  const getEquation = () => {
    let aStr = '';
    if (a === 1) aStr = 'x';
    else if (a === -1) aStr = '-x';
    else if (a === 0) aStr = '';
    else aStr = `${a.toFixed(1).replace(/\.0$/, '')}x`;

    let bStr = '';
    if (b > 0) {
      bStr = a === 0 ? `${b.toFixed(1).replace(/\.0$/, '')}` : ` + ${b.toFixed(1).replace(/\.0$/, '')}`;
    } else if (b < 0) {
      bStr = ` - ${Math.abs(b).toFixed(1).replace(/\.0$/, '')}`;
    } else {
      bStr = a === 0 ? '0' : '';
    }

    return `f(x) = ${aStr}${bStr}`;
  };

  // Slope triangle calculation:
  // Starts at x = 0, y = b (y-intercept)
  // Goes horizontal to x = 1, y = b
  // Goes vertical to x = 1, y = a + b
  const triX0 = mapX(0);
  const triY0 = mapY(b);
  const triX1 = mapX(1);
  const triY1 = mapY(b);
  const triY2 = mapY(a + b);

  // X intercept (Nulpunkt): f(x) = 0 => ax+b = 0 => x = -b/a
  const hasXIntercept = a !== 0;
  const xInterceptVal = hasXIntercept ? -b / a : 0;
  const showXIntercept = hasXIntercept && xInterceptVal >= minX && xInterceptVal <= maxX;

  // Grid lines
  const gridLines = [];
  for (let i = minX + 1; i < maxX; i++) {
    if (i === 0) continue;
    const xPos = mapX(i);
    const yPos = mapY(i);
    gridLines.push(
      <line
        key={`grid-x-${i}`}
        x1={xPos}
        y1={0}
        x2={xPos}
        y2={height}
        className="stroke-slate-100 dark:stroke-slate-800/60"
        strokeWidth="1"
      />
    );
    gridLines.push(
      <line
        key={`grid-y-${i}`}
        x1={0}
        y1={yPos}
        x2={width}
        y2={yPos}
        className="stroke-slate-100 dark:stroke-slate-800/60"
        strokeWidth="1"
      />
    );
  }

  return (
    <div className="my-10 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Lineær Funktion: <span className="text-brand-650 dark:text-sky-400 font-extrabold">{getEquation()}</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Juster hældningen <span className="font-semibold text-brand-500">a</span> og skæringen <span className="font-semibold text-violet-500">b</span> for at se hvordan den rette linje og hældningstrekanten ændrer sig.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Slope slider 'a' */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Hældningskoefficient (<span className="text-brand-600 dark:text-sky-400 font-bold">a</span>):
              </span>
              <span className="font-bold text-brand-600 dark:text-sky-400">{a.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              {a > 0 ? 'Linjen er voksende (stiger).' : a < 0 ? 'Linjen er aftagende (falder).' : 'Linjen er vandret (konstant).'}
            </span>
          </div>

          {/* Intercept slider 'b' */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Skæring med y-aksen (<span className="text-violet-600 dark:text-violet-400 font-bold">b</span>):
              </span>
              <span className="font-bold text-violet-600 dark:text-violet-450">{b.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 dark:accent-violet-450"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Skæringspunkt på y-aksen: <span className="font-semibold">(0, {b})</span>.
            </span>
          </div>

          {/* Key values list */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-450">Skæring med y-aksen:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">(0, {b.toFixed(1).replace(/\.0$/, '')})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-450">Nulpunkt (skæring med x-aksen):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 font-bold text-brand-600 dark:text-sky-400">
                {showXIntercept ? `(${xInterceptVal.toFixed(2).replace(/\.?0+$/, '')}, 0)` : 'Intet nulpunkt (a = 0)'}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg font-medium transition-all"
          >
            Nulstil værdier
          </button>
        </div>

        {/* Right: SVG Plot (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-inner overflow-visible select-none"
          >
            {/* Grid */}
            {gridLines}

            {/* Axes */}
            <line x1={0} y1={mapY(0)} x2={width} y2={mapY(0)} className="stroke-slate-350 dark:stroke-slate-700" strokeWidth="2" />
            <line x1={mapX(0)} y1={0} x2={mapX(0)} y2={height} className="stroke-slate-350 dark:stroke-slate-700" strokeWidth="2" />

            {/* X and Y arrows */}
            <path d={`M ${width - 8} ${mapY(0) - 4} L ${width} ${mapY(0)} L ${width - 8} ${mapY(0) + 4} Z`} className="fill-slate-400 dark:fill-slate-600" />
            <path d={`M ${mapX(0) - 4} 8 L ${mapX(0)} 0 L ${mapX(0) + 4} 8 Z`} className="fill-slate-400 dark:fill-slate-600" />

            {/* Line plot */}
            <path d={getLinePath()} fill="none" className="stroke-brand-500 dark:stroke-sky-400 transition-all duration-150" strokeWidth="3" />

            {/* Slope Triangle */}
            {a !== 0 && (
              <>
                {/* Horizontal (+1) */}
                <line x1={triX0} y1={triY0} x2={triX1} y2={triY1} className="stroke-orange-500" strokeWidth="2" strokeDasharray="3 3" />
                {/* Vertical (a) */}
                <line x1={triX1} y1={triY1} x2={triX1} y2={triY2} className="stroke-orange-500" strokeWidth="2" />

                {/* Horizontal label */}
                <text x={(triX0 + triX1) / 2} y={triY0 + (b >= 0 ? 14 : -6)} className="text-[10px] font-bold fill-orange-600 dark:fill-orange-400 text-center" textAnchor="middle">+1</text>
                {/* Vertical label */}
                <text x={triX1 + 8} y={(triY1 + triY2) / 2 + 3} className="text-[10px] font-bold fill-orange-600 dark:fill-orange-400">
                  a = {a.toFixed(1).replace(/\.0$/, '')}
                </text>
              </>
            )}

            {/* Y Intercept Node */}
            <circle cx={triX0} cy={triY0} r="5.5" className="fill-violet-600 stroke-white dark:stroke-slate-900" strokeWidth="2.5" />

            {/* X Intercept (Nulpunkt) Node */}
            {showXIntercept && (
              <circle cx={mapX(xInterceptVal)} cy={mapY(0)} r="5.5" className="fill-brand-500 stroke-white dark:stroke-slate-900" strokeWidth="2.5" />
            )}

            {/* Intercept coordinates labels */}
            <text x={triX0 - 15} y={triY0 - 10} className="text-[9px] font-bold fill-violet-600 dark:fill-violet-400" textAnchor="end">
              (0, {b.toFixed(1).replace(/\.0$/, '')})
            </text>
            {showXIntercept && (
              <text x={mapX(xInterceptVal) + 5} y={mapY(0) + 14} className="text-[9px] font-bold fill-brand-650 dark:fill-sky-400">
                ({xInterceptVal.toFixed(1).replace(/\.0$/, '')}, 0)
              </text>
            )}

            {/* Axis Labels */}
            <text x={width - 12} y={mapY(0) - 8} className="text-[10px] font-bold fill-slate-450 dark:fill-slate-500">x</text>
            <text x={mapX(0) + 10} y={12} className="text-[10px] font-bold fill-slate-450 dark:fill-slate-500">y</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LinearFunctionVisualizer;
