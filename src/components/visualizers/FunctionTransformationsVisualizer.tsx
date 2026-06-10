import React, { useState } from 'react';

type BaseFunctionType = 'quadratic' | 'cubic' | 'abs' | 'sqrt';

export const FunctionTransformationsVisualizer: React.FC = () => {
  const [baseFunc, setBaseFunc] = useState<BaseFunctionType>('quadratic');
  const [a, setA] = useState<number>(1);
  const [c, setC] = useState<number>(0);
  const [d, setD] = useState<number>(0);

  // Reset parameters
  const handleReset = () => {
    setA(1);
    setC(0);
    setD(0);
  };

  // Base function evaluation f(x)
  const evaluateBase = (x: number): number => {
    switch (baseFunc) {
      case 'quadratic':
        return x * x;
      case 'cubic':
        return x * x * x;
      case 'abs':
        return Math.abs(x);
      case 'sqrt':
        return x >= 0 ? Math.sqrt(x) : NaN;
      default:
        return 0;
    }
  };

  // Transformed function evaluation g(x) = a * f(x - c) + d
  const evaluateTransformed = (x: number): number => {
    const baseVal = evaluateBase(x - c);
    if (isNaN(baseVal)) return NaN;
    return a * baseVal + d;
  };

  // SVG dimensions & coordinate mapping
  // Grid size: -8 to 8 on both axes
  const minX = -8;
  const maxX = 8;
  const minY = -8;
  const maxY = 8;

  const width = 320;
  const height = 320;

  const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
  const mapY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

  // Generate SVG path for a function
  const getPathData = (evaluator: (x: number) => number) => {
    let path = '';
    let isDrawing = false;
    const step = 0.05;

    for (let x = minX; x <= maxX; x += step) {
      const y = evaluator(x);
      if (isNaN(y) || y < minY - 5 || y > maxY + 5) {
        isDrawing = false;
        continue;
      }

      const svgX = mapX(x);
      const svgY = mapY(y);

      if (!isDrawing) {
        path += `M ${svgX.toFixed(1)} ${svgY.toFixed(1)}`;
        isDrawing = true;
      } else {
        path += ` L ${svgX.toFixed(1)} ${svgY.toFixed(1)}`;
      }
    }
    return path;
  };

  // Format the equation string nicely
  const getEquationString = () => {
    let aStr = '';
    if (a === -1) aStr = '-';
    else if (a !== 1) aStr = a.toFixed(1).replace(/\.0$/, '');

    let innerStr = 'x';
    if (c > 0) {
      innerStr = `(x - ${c.toFixed(1).replace(/\.0$/, '')})`;
    } else if (c < 0) {
      innerStr = `(x + ${Math.abs(c).toFixed(1).replace(/\.0$/, '')})`;
    }

    let termStr = innerStr;
    if (baseFunc === 'quadratic') termStr = `${innerStr}²`;
    else if (baseFunc === 'cubic') termStr = `${innerStr}³`;
    else if (baseFunc === 'abs') termStr = `|${innerStr}|`;
    else if (baseFunc === 'sqrt') {
      termStr = `√${innerStr}`;
      // Wrap if inner has parentheses
      if (c !== 0) termStr = `√(${innerStr.slice(1, -1)})`;
    }

    let dStr = '';
    if (d > 0) {
      dStr = ` + ${d.toFixed(1).replace(/\.0$/, '')}`;
    } else if (d < 0) {
      dStr = ` - ${Math.abs(d).toFixed(1).replace(/\.0$/, '')}`;
    }

    return `g(x) = ${aStr}${termStr}${dStr}`;
  };

  const getBaseEquationString = () => {
    switch (baseFunc) {
      case 'quadratic': return 'f(x) = x²';
      case 'cubic': return 'f(x) = x³';
      case 'abs': return 'f(x) = |x|';
      case 'sqrt': return 'f(x) = √x';
    }
  };

  // Generate grid lines
  const gridLines = [];
  for (let i = minX + 1; i < maxX; i++) {
    if (i === 0) continue; // Skip axis
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
          Interaktiv Transformation af Funktioner 📈
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Undersøg hvordan parametrene <span className="font-semibold text-brand-600 dark:text-sky-400">a</span>, <span className="font-semibold text-emerald-600 dark:text-emerald-400">c</span> og <span className="font-semibold text-violet-600 dark:text-violet-400">d</span> flytter og strækker grafen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Base Function Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 block">Vælg grundfunktion f(x)</span>
            <div className="grid grid-cols-4 gap-2">
              {(['quadratic', 'cubic', 'abs', 'sqrt'] as BaseFunctionType[]).map((type) => {
                const labels = { quadratic: 'x²', cubic: 'x³', abs: '|x|', sqrt: '√x' };
                const isSelected = baseFunc === type;
                return (
                  <button
                    key={type}
                    onClick={() => { setBaseFunc(type); handleReset(); }}
                    className={`py-2 px-3 text-sm font-semibold rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
                    }`}
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            {/* Slider a */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Strækning/Spejling (<span className="text-brand-600 dark:text-sky-400">a</span>):
                </span>
                <span className="font-bold text-brand-600 dark:text-sky-400">{a.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {a === 0 ? 'Grafen flades helt ud til en vandret linje.' : a < 0 ? 'Grafen er spejlet i x-aksen (vendes på hovedet).' : 'Strækker grafen lodret.'}
              </p>
            </div>

            {/* Slider c */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Horisontal forskydning (<span className="text-emerald-600 dark:text-emerald-400">c</span>):
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-450">{c.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={c}
                onChange={(e) => setC(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:accent-emerald-400"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {c > 0 ? `Flytter grafen ${c} enheder mod HØJRE.` : c < 0 ? `Flytter grafen ${Math.abs(c)} enheder mod VENSTRE.` : 'Ingen vandret forskydning.'}
              </p>
            </div>

            {/* Slider d */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Vertikal forskydning (<span className="text-violet-600 dark:text-violet-400">d</span>):
                </span>
                <span className="font-bold text-violet-600 dark:text-violet-450">{d.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={d}
                onChange={(e) => setD(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 dark:accent-violet-450"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {d > 0 ? `Flytter grafen ${d} enheder OP.` : d < 0 ? `Flytter grafen ${Math.abs(d)} enheder NED.` : 'Ingen lodret forskydning.'}
              </p>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg font-medium transition-all"
          >
            Nulstil værdier
          </button>
        </div>

        {/* Right column: Graphic plot (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          {/* Legend and Equations */}
          <div className="w-full space-y-2 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 border-t border-dashed border-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Grundgraf: <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">{getBaseEquationString()}</code>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-brand-500 dark:bg-sky-400 rounded" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Transformeret: <code className="bg-brand-50 dark:bg-sky-950/40 px-1 py-0.5 rounded text-brand-600 dark:text-sky-400 font-bold">{getEquationString()}</code>
              </span>
            </div>
          </div>

          {/* Coordinate System Plot */}
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner overflow-hidden select-none"
          >
            {/* Grid */}
            {gridLines}

            {/* X Axis */}
            <line
              x1={0}
              y1={mapY(0)}
              x2={width}
              y2={mapY(0)}
              className="stroke-slate-350 dark:stroke-slate-700"
              strokeWidth="2"
            />
            {/* Y Axis */}
            <line
              x1={mapX(0)}
              y1={0}
              x2={mapX(0)}
              y2={height}
              className="stroke-slate-350 dark:stroke-slate-700"
              strokeWidth="2"
            />

            {/* X Axis Arrow */}
            <path
              d={`M ${width - 8} ${mapY(0) - 4} L ${width} ${mapY(0)} L ${width - 8} ${mapY(0) + 4} Z`}
              className="fill-slate-400 dark:fill-slate-650"
            />
            {/* Y Axis Arrow */}
            <path
              d={`M ${mapX(0) - 4} 8 L ${mapX(0)} 0 L ${mapX(0) + 4} 8 Z`}
              className="fill-slate-400 dark:fill-slate-650"
            />

            {/* Labels on axis */}
            <text x={width - 12} y={mapY(0) + 16} className="text-[10px] font-bold fill-slate-450 dark:fill-slate-500">x</text>
            <text x={mapX(0) - 14} y={12} className="text-[10px] font-bold fill-slate-450 dark:fill-slate-500">y</text>

            {/* Base function path (dashed) */}
            <path
              d={getPathData(evaluateBase)}
              fill="none"
              className="stroke-slate-350 dark:stroke-slate-700"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Transformed function path */}
            <path
              d={getPathData(evaluateTransformed)}
              fill="none"
              className="stroke-brand-500 dark:stroke-sky-400 transition-all duration-150"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FunctionTransformationsVisualizer;
