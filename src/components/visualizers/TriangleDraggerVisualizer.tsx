import React, { useState } from 'react';

export const TriangleDraggerVisualizer: React.FC = () => {
  const [sideA, setSideA] = useState<number>(7.0);
  const [sideB, setSideB] = useState<number>(6.0);
  const [angleC, setAngleC] = useState<number>(60);

  // Convert angle C to radians
  const radC = (angleC * Math.PI) / 180;

  // Law of Cosines: c^2 = a^2 + b^2 - 2ab*cos(C)
  const cSq = sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(radC);
  const sideC = Math.sqrt(cSq);

  // Law of Cosines for angle A: cos(A) = (b^2 + c^2 - a^2) / (2bc)
  const cosA = (sideB * sideB + sideC * sideC - sideA * sideA) / (2 * sideB * sideC);
  const angleA = (Math.acos(Math.max(-1, Math.min(1, cosA))) * 180) / Math.PI;

  // Angle B = 180 - A - C
  const angleB = 180 - angleA - angleC;

  // SVG coordinates:
  // We place vertex C at (70, 220)
  const cx = 70;
  const cy = 220;

  // Scale factor to make it fit nicely
  const scale = 22;

  // Vertex B is along the X axis from C
  const bx = cx + sideA * scale;
  const by = cy;

  // Vertex A is at angle C and distance b from C
  const ax = cx + sideB * scale * Math.cos(radC);
  const ay = cy - sideB * scale * Math.sin(radC); // SVG y goes down

  return (
    <div className="my-10 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Visualisering: <span className="text-brand-600 dark:text-sky-400 font-extrabold">Trekantsberegninger (Vilkårlig Trekant)</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Indstil kateterne $a, b$ og den mellemliggende vinkel $C$. Cosinusrelationerne bruges derefter til automatisk at beregne den modstående side $c$ og de resterende vinkler.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Drawing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <svg viewBox="0 0 380 260" className="w-full max-w-[380px] h-auto overflow-visible select-none text-slate-450 dark:text-slate-650" fill="none" stroke="currentColor">
            <polygon
              points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
              className="fill-brand-500/10 stroke-brand-500 dark:fill-sky-500/5 dark:stroke-sky-400"
              strokeWidth="2.5"
            />

            {/* Vertices Labels */}
            <text x={ax} y={ay - 10} textAnchor="middle" className="fill-slate-800 dark:fill-slate-250 font-bold text-sm">A</text>
            <text x={bx + 12} y={by + 4} className="fill-slate-800 dark:fill-slate-250 font-bold text-sm">B</text>
            <text x={cx - 15} y={cy + 4} className="fill-slate-800 dark:fill-slate-250 font-bold text-sm">C</text>

            {/* Side Labels */}
            {/* Side a (BC) */}
            <text x={(cx + bx)/2} y={cy + 18} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-medium text-xs">
              a = {sideA.toFixed(1)}
            </text>
            {/* Side b (AC) */}
            <text x={(cx + ax)/2 - 15} y={(cy + ay)/2} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-medium text-xs">
              b = {sideB.toFixed(1)}
            </text>
            {/* Side c (AB) */}
            <text x={(ax + bx)/2 + 15} y={(ay + by)/2 - 5} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-medium text-xs">
              c = {sideC.toFixed(1)}
            </text>

            {/* Angle Indicators / Values */}
            <text x={cx + 15} y={cy - 8} className="fill-amber-600 dark:fill-amber-400 font-bold text-[10px]">
              {angleC}°
            </text>
            <text x={ax - 5} y={ay + 22} className="fill-indigo-600 dark:fill-indigo-400 font-bold text-[10px]" textAnchor="middle">
              {angleA.toFixed(0)}°
            </text>
            <text x={bx - 20} y={by - 8} className="fill-emerald-600 dark:fill-emerald-400 font-bold text-[10px]">
              {angleB.toFixed(0)}°
            </text>
          </svg>

          {/* Sliders */}
          <div className="w-full space-y-3 mt-4 px-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Side a</span>
                <span className="font-bold">{sideA.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.1"
                value={sideA}
                onChange={(e) => setSideA(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Side b</span>
                <span className="font-bold">{sideB.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.1"
                value={sideB}
                onChange={(e) => setSideB(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Vinkel C</span>
                <span className="font-bold">{angleC}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="150"
                value={angleC}
                onChange={(e) => setAngleC(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Calculations steps (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Beregning af side c (Cosinusrelationen)
            </h5>
            <div className="space-y-3 font-outfit text-sm">
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                c² = a² + b² - 2ab &middot; cos(C)
                <br />
                c² = {sideA.toFixed(1)}² + {sideB.toFixed(1)}² - 2 &middot; {sideA.toFixed(1)} &middot; {sideB.toFixed(1)} &middot; cos({angleC}°)
                <br />
                c² = {cSq.toFixed(2)}
                <br />
                c = √{cSq.toFixed(2)} = <span className="text-brand-600 dark:text-sky-400 font-bold">{sideC.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                  De fundne vinkler
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                    <div className="text-indigo-700 dark:text-indigo-300 font-semibold">Vinkel A</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{angleA.toFixed(1)}°</div>
                  </div>
                  <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <div className="text-emerald-700 dark:text-emerald-300 font-semibold">Vinkel B</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{angleB.toFixed(1)}°</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Anvendelse:</span>
            Når vi kender to sider og den mellemliggende vinkel (SVS), bruger vi **cosinusrelationen** til at finde den sidste side. Herefter kan vi bruge enten sinus- eller cosinusrelationerne til at finde vinklerne.
          </div>
        </div>
      </div>
    </div>
  );
};
