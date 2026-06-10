import React, { useState } from 'react';

export const SimilarTrianglesVisualizer: React.FC = () => {
  const [scale, setScale] = useState<number>(1.4);

  const a1 = 144.2;
  const b1 = 126.5;
  const c1 = 120;

  const a2 = a1 * scale;
  const b2 = b1 * scale;
  const c2 = c1 * scale;

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Ensvinklede Trekanter</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk i skyderen for at ændre skalafaktoren $k$ og se, hvordan siderne skalerer proportionalt, mens vinklerne forbliver de samme.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg viewBox="0 0 550 300" className="w-full max-w-[500px] h-auto overflow-visible select-none text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor">
            <defs>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* Triangle 1: Original */}
            <g filter="url(#shadow)">
              <polygon
                points="50,220 170,220 90,100"
                className="fill-indigo-50/60 stroke-indigo-500 dark:fill-indigo-950/20 dark:stroke-indigo-400"
                strokeWidth="2.5"
              />
              {/* Vertices Labels */}
              <text x="35" y="230" className="fill-indigo-700 dark:fill-indigo-300 font-bold text-sm">A</text>
              <text x="180" y="230" className="fill-indigo-700 dark:fill-indigo-300 font-bold text-sm">B</text>
              <text x="85" y="85" className="fill-indigo-700 dark:fill-indigo-300 font-bold text-sm">C</text>

              {/* Side Labels */}
              <text x="110" y="240" className="fill-slate-500 dark:fill-slate-400 text-xs text-center font-semibold">c = {c1.toFixed(0)}</text>
              <text x="50" y="160" className="fill-slate-500 dark:fill-slate-400 text-xs font-semibold">b = {b1.toFixed(0)}</text>
              <text x="145" y="150" className="fill-slate-500 dark:fill-slate-400 text-xs font-semibold">a = {a1.toFixed(0)}</text>
            </g>

            {/* Triangle 2: Scaled */}
            <g filter="url(#shadow)">
              <polygon
                points={`260,220 ${260 + 120 * scale},220 ${260 + 40 * scale},${220 - 120 * scale}`}
                className="fill-emerald-50/60 stroke-emerald-500 dark:fill-emerald-950/20 dark:stroke-emerald-400"
                strokeWidth="2.5"
              />
              {/* Vertices Labels */}
              <text x="245" y="230" className="fill-emerald-700 dark:fill-emerald-300 font-bold text-sm">A'</text>
              <text x={265 + 120 * scale} y="230" className="fill-emerald-700 dark:fill-emerald-300 font-bold text-sm">B'</text>
              <text x={255 + 40 * scale} y={205 - 120 * scale} className="fill-emerald-700 dark:fill-emerald-300 font-bold text-sm">C'</text>

              {/* Side Labels */}
              <text x={260 + 60 * scale} y="240" className="fill-slate-500 dark:fill-slate-400 text-xs font-semibold">c' = {c2.toFixed(0)}</text>
              <text x={235 + 10 * scale} y={220 - 55 * scale} className="fill-slate-500 dark:fill-slate-400 text-xs font-semibold">b' = {b2.toFixed(0)}</text>
              <text x={275 + 80 * scale} y={210 - 65 * scale} className="fill-slate-500 dark:fill-slate-400 text-xs font-semibold">a' = {a2.toFixed(0)}</text>
            </g>
          </svg>

          {/* Slider */}
          <div className="w-full max-w-md mt-4 px-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Skala k = 0.5 (Mindre)</span>
              <span className="font-bold text-brand-600 dark:text-sky-400">k = {scale.toFixed(2)}</span>
              <span>k = 2.0 (Større)</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
            />
          </div>
        </div>

        {/* Math details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Proportionalitet & Forhold
            </h5>
            <div className="space-y-3 font-outfit">
              <div>
                <span className="text-xs text-slate-400">Skalafaktor (k):</span>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  k = {scale.toFixed(2)}
                </div>
              </div>
              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <span className="text-xs text-slate-400">Forholdet mellem siderne:</span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center text-sm font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <div>
                    <div className="font-semibold text-indigo-500 dark:text-indigo-400">a' / a</div>
                    <div className="text-xs text-slate-500 mt-1">{a2.toFixed(1)} / {a1.toFixed(1)}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{(a2 / a1).toFixed(2)}</div>
                  </div>
                  <div className="border-l border-slate-100 dark:border-slate-850">
                    <div className="font-semibold text-emerald-500 dark:text-emerald-400">b' / b</div>
                    <div className="text-xs text-slate-500 mt-1">{b2.toFixed(1)} / {b1.toFixed(1)}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{(b2 / b1).toFixed(2)}</div>
                  </div>
                  <div className="border-l border-slate-100 dark:border-slate-850">
                    <div className="font-semibold text-brand-500 dark:text-sky-400">c' / c</div>
                    <div className="text-xs text-slate-500 mt-1">{c2.toFixed(1)} / {c1.toFixed(1)}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{(c2 / c1).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Hvad betyder det?</span>
            Når to trekanter er ensvinklede, er de parvise vinkler ens. Det medfører, at forholdet mellem de tilsvarende sider altid er konstant og lig med skalafaktoren: a'/a = b'/b = c'/c = k.
          </div>
        </div>
      </div>
    </div>
  );
};
