import React, { useState } from 'react';

export const FractionVisualizer: React.FC = () => {
  const [denominator, setDenominator] = useState<number>(4);
  const [numerator, setNumerator] = useState<number>(3);

  // Safely adjust numerator if denominator decreases below numerator
  const handleDenominatorChange = (val: number) => {
    setDenominator(val);
    if (numerator > val) {
      setNumerator(val);
    }
  };

  const handleNumeratorChange = (val: number) => {
    setNumerator(Math.min(val, denominator));
  };

  // Helper to find Greatest Common Divisor (GCD) for simplification
  const gcd = (x: number, y: number): number => {
    return y === 0 ? x : gcd(y, x % y);
  };

  const commonDivisor = gcd(numerator, denominator);
  const simplifiedNumerator = numerator / commonDivisor;
  const simplifiedDenominator = denominator / commonDivisor;
  const isSimplified = commonDivisor > 1 && numerator !== 0;

  // Percentage & Decimal calculations
  const decimalValue = numerator / denominator;
  const percentageValue = decimalValue * 100;

  // Generate SVG paths for pie chart slices
  const getPieSlices = () => {
    const slices = [];
    const radius = 80;
    const cx = 100;
    const cy = 100;

    for (let i = 0; i < denominator; i++) {
      const startAngle = (i * 360) / denominator - 90;
      const endAngle = ((i + 1) * 360) / denominator - 90;

      const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

      // Large arc flag is 0 because each slice is at most 180 degrees (since denominator >= 1)
      const largeArcFlag = 360 / denominator > 180 ? 1 : 0;

      const pathData = denominator === 1
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const isShaded = i < numerator;

      slices.push(
        <path
          key={`slice-${i}`}
          d={pathData}
          className={`transition-all duration-300 stroke-white dark:stroke-slate-900 ${
            isShaded
              ? 'fill-brand-500 dark:fill-sky-500 opacity-90'
              : 'fill-slate-100 dark:fill-slate-800'
          }`}
          strokeWidth="2"
        />
      );
    }
    return slices;
  };

  return (
    <div className="my-10 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl max-w-3xl mx-auto transition-all duration-300 animate-fadeIn">
      <div className="text-center mb-6">
        <h4 className="font-outfit font-bold text-xl text-slate-800 dark:text-slate-200">
          Interaktiv Brøk-Visualizer 🍕
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Træk i skyderne for at ændre tæller og nævner, og se hvordan brøken ændrer sig.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Controls (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Numerator Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                Tæller (antal dele): <span className="text-brand-600 dark:text-sky-400 text-base font-extrabold">{numerator}</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={denominator}
              value={numerator}
              onChange={(e) => handleNumeratorChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-250 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
            />
          </div>

          {/* Denominator Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                Nævner (samlet antal): <span className="text-brand-600 dark:text-sky-400 text-base font-extrabold">{denominator}</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={denominator}
              onChange={(e) => handleDenominatorChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-250 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 dark:accent-sky-400"
            />
          </div>

          {/* Values Cards */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-center border border-slate-100/80 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Brøk</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {numerator}/{denominator}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-center border border-slate-100/80 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Decimal</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {decimalValue.toFixed(3).replace(/\.?0+$/, '') || '0'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-center border border-slate-100/80 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Procent</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {percentageValue.toFixed(1).replace(/\.0$/, '')}%
              </span>
            </div>
          </div>

          {/* Simplification Alert */}
          {isSimplified ? (
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">Forkortet brøk:</span> {numerator}/{denominator} kan forkortes med {commonDivisor} til <span className="font-bold">{simplifiedNumerator}/{simplifiedDenominator}</span>.
            </div>
          ) : numerator !== 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              Brøken <span className="font-semibold">{numerator}/{denominator}</span> er fuldt forkortet.
            </div>
          )}
        </div>

        {/* Visual representation (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-around w-full gap-6">
            {/* Circle representation */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 mb-2">Pizzamodel (Cirkel)</span>
              <svg width="180" height="180" viewBox="0 0 200 200" className="drop-shadow-md overflow-visible">
                <circle cx="100" cy="100" r="82" className="fill-slate-50 dark:fill-slate-800/50 stroke-slate-200 dark:stroke-slate-750" strokeWidth="3" />
                {getPieSlices()}
              </svg>
            </div>

            {/* Bar representation */}
            <div className="flex flex-col items-center w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 mb-2">Bjælkemodel (Bar)</span>
              <div className="flex flex-col border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden w-full max-w-[140px] h-[180px] bg-slate-50 dark:bg-slate-800/30">
                {Array.from({ length: denominator }).map((_, i) => {
                  const indexFromBottom = denominator - 1 - i;
                  const isSectionShaded = indexFromBottom < numerator;

                  return (
                    <div
                      key={`bar-slice-${i}`}
                      className={`flex-1 border-b last:border-b-0 border-slate-200 dark:border-slate-800 transition-all duration-300 ${
                        isSectionShaded
                          ? 'bg-brand-500 dark:bg-sky-500 opacity-90'
                          : 'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractionVisualizer;
