import React, { useState } from 'react';

export const FunctionMappingVisualizer: React.FC = () => {
  const [selectedX, setSelectedX] = useState<number | null>(2);

  // Set A (Domain / Definitionsmængde)
  const setA = [-1, 0, 1, 2, 3];
  
  // Set B (Codomain / Sekundærmængde)
  const setB = [-2, -1, 0, 1, 2, 3, 4];

  // Function: f(x) = x^2 - 2x
  const evaluate = (x: number) => {
    return x * x - 2 * x;
  };

  // Node Y positions in SVG space (height 350)
  const getYForSetA = (val: number) => {
    const idx = setA.indexOf(val);
    return 70 + idx * 55; // 5 elements spaced by 55px (70 to 290)
  };

  const getYForSetB = (val: number) => {
    const idx = setB.indexOf(val);
    return 55 + idx * 40; // 7 elements spaced by 40px (55 to 295)
  };

  const activeY_A = selectedX !== null ? getYForSetA(selectedX) : null;
  const activeY_B = selectedX !== null ? getYForSetB(evaluate(selectedX)) : null;

  return (
    <div className="my-10 p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-3xl mx-auto transition-all duration-300">
      <div className="text-center mb-8">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Afbildning: <span className="text-brand-600 dark:text-sky-400 font-extrabold">f(x) = x² - 2x</span>
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Klik på en værdi i Definitionsmængde A for at se dens afbildning i Sekundærmængde B.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Visualization (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <svg viewBox="0 0 500 350" className="w-full max-w-[460px] h-auto overflow-visible select-none text-slate-350 dark:text-slate-800" fill="none" stroke="currentColor">
            <defs>
              <marker id="marker-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1.5 L 7 5 L 0 8.5 z" className="fill-brand-500 dark:fill-sky-400" />
              </marker>
              <filter id="glow-heavy" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Set A Label & Oval Container */}
            <text x="100" y="25" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit font-bold text-sm tracking-wide">A (Definitionsmængde)</text>
            <rect x="45" y="40" width="110" height="270" rx="55" ry="55" className="fill-slate-50/60 stroke-slate-200/80 dark:fill-slate-950/20 dark:stroke-slate-800" strokeWidth="2" />

            {/* Set B Label & Oval Container */}
            <text x="400" y="25" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-outfit font-bold text-sm tracking-wide">B (Sekundærmængde)</text>
            <rect x="345" y="40" width="110" height="270" rx="55" ry="55" className="fill-slate-50/60 stroke-slate-200/80 dark:fill-slate-950/20 dark:stroke-slate-800" strokeWidth="2" />

            {/* Mapped Arrow (Draw line if selectedX is active) */}
            {selectedX !== null && activeY_A !== null && activeY_B !== null && (
              <path
                d={`M 140 ${activeY_A} C 250 ${activeY_A}, 250 ${activeY_B}, 355 ${activeY_B}`}
                className="stroke-brand-500 dark:stroke-sky-400"
                strokeWidth="4.5"
                markerEnd="url(#marker-arrow)"
                style={{
                  strokeDasharray: '500',
                  strokeDashoffset: '0',
                  animation: 'dash 0.4s ease-out forwards',
                  filter: 'url(#glow-heavy)'
                }}
              />
            )}

            {/* Set A Nodes */}
            {setA.map((x) => {
              const y = getYForSetA(x);
              const isSelected = selectedX === x;
              return (
                <g 
                  key={`a-${x}`}
                  onClick={() => setSelectedX(x)} 
                  className="cursor-pointer group"
                >
                  <circle 
                    cx="100" 
                    cy={y} 
                    r="20" 
                    className={`transition-all duration-200 ${
                      isSelected 
                        ? 'fill-brand-500 stroke-brand-600 dark:fill-sky-500 dark:stroke-sky-400 text-white shadow-lg' 
                        : 'fill-white stroke-slate-250 dark:fill-slate-900 dark:stroke-slate-850 group-hover:stroke-slate-400 dark:group-hover:stroke-slate-650'
                    }`}
                    strokeWidth="2.5"
                  />
                  <text 
                    x="100" 
                    y={y + 5} 
                    textAnchor="middle" 
                    className={`font-outfit font-extrabold text-sm pointer-events-none transition-colors duration-200 ${
                      isSelected 
                        ? 'fill-white dark:fill-slate-950' 
                        : 'fill-slate-700 dark:fill-slate-300'
                    }`}
                  >
                    {x}
                  </text>
                </g>
              );
            })}

            {/* Set B Nodes */}
            {setB.map((yVal) => {
              const y = getYForSetB(yVal);
              const isMapped = selectedX !== null && evaluate(selectedX) === yVal;
              return (
                <g key={`b-${yVal}`}>
                  <circle 
                    cx="400" 
                    cy={y} 
                    r="18" 
                    className={`transition-all duration-200 ${
                      isMapped 
                        ? 'fill-sky-100 stroke-brand-500 dark:fill-sky-950/60 dark:stroke-sky-400' 
                        : 'fill-white stroke-slate-250 dark:fill-slate-900 dark:stroke-slate-850'
                    }`}
                    strokeWidth="2"
                  />
                  <text 
                    x="400" 
                    y={y + 5} 
                    textAnchor="middle" 
                    className={`font-outfit font-bold text-sm pointer-events-none transition-colors duration-200 ${
                      isMapped 
                        ? 'fill-brand-700 dark:fill-sky-300 font-extrabold' 
                        : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {yVal}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Information Area (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-inner">
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Mængde-Afbildning Evaluering
            </h5>
            {selectedX !== null ? (
              <div className="space-y-3.5">
                <div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Valgt Element:</span>
                  <div className="font-outfit font-bold text-base text-slate-800 dark:text-slate-200 mt-0.5">
                    x = {selectedX} &in; A
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Funktionsregel (Evaluering):</span>
                  <div className="font-mono text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl mt-1.5 animate-in fade-in slide-in-from-bottom-1 duration-150 border border-slate-200/40 dark:border-slate-800/40 leading-relaxed">
                    f({selectedX}) = ({selectedX})² - 2&middot;({selectedX})
                    <br />
                    f({selectedX}) = {selectedX * selectedX} - {2 * selectedX} = {evaluate(selectedX)}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Afbildnings-notation:</span>
                  <div className="font-outfit font-bold text-lg text-brand-600 dark:text-sky-400 mt-0.5">
                    f: {selectedX} &mapsto; {evaluate(selectedX)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 dark:text-slate-500 italic py-6 text-center">
                Vælg et punkt i A
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/50">
            <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Entydig Afbildning:</span>
            Bemærk at der fra hvert element i definitionsmængden A udgår <span className="font-semibold text-slate-800 dark:text-slate-200">præcis én pil</span>. Mængde-afbildningen er derfor en **funktion**. 0 og 2 må gerne pege på det samme element i B.
          </div>
        </div>
      </div>

      {/* Inline styles for path dash animation */}
      <style>{`
        @keyframes dash {
          from {
            stroke-dasharray: 500;
            stroke-dashoffset: 500;
          }
          to {
            stroke-dasharray: 500;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FunctionMappingVisualizer;
