import React, { useState, useEffect, useRef } from 'react';

type FuncKey = 'parabola' | 'sine' | 'cubic';

interface FuncData {
  name: string;
  formula: string;
  derivFormula: string;
  f: (x: number) => number;
  df: (x: number) => number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const functions: Record<FuncKey, FuncData> = {
  parabola: {
    name: 'Andengrads',
    formula: 'f(x) = 0.25x² - 1.5',
    derivFormula: "f'(x) = 0.5x",
    f: (x) => 0.25 * x * x - 1.5,
    df: (x) => 0.5 * x,
    minX: -4,
    maxX: 4,
    minY: -2.5,
    maxY: 2.5,
  },
  sine: {
    name: 'Sinusbølge',
    formula: 'f(x) = 1.5 · sin(x)',
    derivFormula: "f'(x) = 1.5 · cos(x)",
    f: (x) => 1.5 * Math.sin(x),
    df: (x) => 1.5 * Math.cos(x),
    minX: -4,
    maxX: 4,
    minY: -2.5,
    maxY: 2.5,
  },
  cubic: {
    name: 'Tredjegrads',
    formula: 'f(x) = 0.05x³ - x',
    derivFormula: "f'(x) = 0.15x² - 1",
    f: (x) => 0.05 * x * x * x - x,
    df: (x) => 0.15 * x * x - 1,
    minX: -4,
    maxX: 4,
    minY: -2.5,
    maxY: 2.5,
  },
};

export const HeroTangentVisualizer: React.FC = () => {
  const [funcKey, setFuncKey] = useState<FuncKey>('parabola');
  const [x0, setX0] = useState<number>(1);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const modulatorRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  
  const prevSlopeRef = useRef<number>(0);
  const lastBellTimeRef = useRef<number>(0);

  const activeFunc = functions[funcKey];
  const y0 = activeFunc.f(x0);
  const slope = activeFunc.df(x0);

  // SVG plot settings
  const width = 340;
  const height1 = 170; // Top plot f(x)
  const height2 = 120; // Bottom plot f'(x)

  const minX = activeFunc.minX;
  const maxX = activeFunc.maxX;
  const minY = activeFunc.minY;
  const maxY = activeFunc.maxY;

  const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
  
  const mapY1 = (y: number) =>
    height1 - ((y - minY) / (maxY - minY)) * height1;
    
  const mapY2 = (y: number) =>
    height2 - ((y - minY) / (maxY - minY)) * height2;

  // Generate paths for f(x)
  const getPath1 = () => {
    let path = '';
    const step = 0.05;
    for (let x = minX; x <= maxX; x += step) {
      const px = mapX(x);
      const py = mapY1(activeFunc.f(x));
      if (x === minX) {
        path += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      } else {
        path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }
    return path;
  };

  // Generate paths for f'(x)
  const getPath2 = () => {
    let path = '';
    const step = 0.05;
    for (let x = minX; x <= maxX; x += step) {
      const px = mapX(x);
      const py = mapY2(activeFunc.df(x));
      if (x === minX) {
        path += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      } else {
        path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }
    return path;
  };

  // Generate tangent line path: y = slope * (x - x0) + y0
  const getTangentPath = () => {
    const xStart = minX;
    const yStart = slope * (xStart - x0) + y0;
    const xEnd = maxX;
    const yEnd = slope * (xEnd - x0) + y0;
    return `M ${mapX(xStart).toFixed(1)} ${mapY1(yStart).toFixed(1)} L ${mapX(xEnd).toFixed(1)} ${mapY1(yEnd).toFixed(1)}`;
  };

  // Trigger bell sound on extreme values (toppunkter)
  const triggerBell = (isMax: boolean) => {
    if (!audioCtxRef.current || !isAudioEnabled) return;
    const ctx = audioCtxRef.current;
    
    try {
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      const bellFilter = ctx.createBiquadFilter();
      
      bellOsc.type = 'sine';
      // High bright tone for maximum (1174.66 Hz - D6), warm chord tone for minimum (783.99 Hz - G5)
      const freq = isMax ? 1174.66 : 783.99;
      bellOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      bellOsc.frequency.exponentialRampToValueAtTime(freq * 0.95, ctx.currentTime + 0.15);
      
      bellFilter.type = 'lowpass';
      bellFilter.frequency.setValueAtTime(1500, ctx.currentTime);
      
      bellGain.gain.setValueAtTime(0, ctx.currentTime);
      bellGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      
      bellOsc.connect(bellFilter);
      bellFilter.connect(bellGain);
      bellGain.connect(ctx.destination);
      
      bellOsc.start();
      bellOsc.stop(ctx.currentTime + 0.55);
    } catch (e) {
      console.error('Failed to trigger bell sound:', e);
    }
  };

  // FM Synthesizer for continuous slope audio
  useEffect(() => {
    if (!isAudioEnabled) {
      stopAudio();
      return;
    }

    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Primary Gain Node with smooth entry
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1); // soft attack
      gainRef.current = mainGain;

      // Lowpass Filter for warm retro synthesizer sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      // Carrier Oscillator (Triangle)
      const carrier = ctx.createOscillator();
      carrier.type = 'triangle';
      const baseFreq = 220; // A3
      const freq = baseFreq + slope * 50;
      carrier.frequency.setValueAtTime(freq, ctx.currentTime);

      // Modulator Oscillator (Sine) for FM synthesis
      const modulator = ctx.createOscillator();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 1.5, ctx.currentTime); // 1.5 ratio for warm harmonic spectrum

      // Modulator Gain (depth of FM modulation)
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(40, ctx.currentTime); // moderate modulation index

      // LFO for slow volume tremolo
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2.5, ctx.currentTime); // 2.5 Hz slow wobble

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.008, ctx.currentTime); // subtle volume modulation

      // Connections
      modulator.connect(modGain);
      modGain.connect(carrier.frequency); // modulating carrier frequency

      lfo.connect(lfoGain);
      lfoGain.connect(mainGain.gain); // modulating volume slightly

      carrier.connect(mainGain);
      mainGain.connect(filter);
      filter.connect(ctx.destination);

      carrier.start();
      modulator.start();
      lfo.start();

      oscRef.current = carrier;
      modulatorRef.current = modulator;
      lfoRef.current = lfo;
    } catch (e) {
      console.error('Failed to init audio oscillator:', e);
    }

    return () => stopAudio();
  }, [isAudioEnabled]);

  // Update sound pitch when slope changes
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      const baseFreq = 220;
      const targetFreq = baseFreq + slope * 50;
      oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.05);
      
      if (modulatorRef.current) {
        modulatorRef.current.frequency.setTargetAtTime(targetFreq * 1.5, audioCtxRef.current.currentTime, 0.05);
      }
    }
  }, [slope]);

  const stopAudio = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch (e) {}
      oscRef.current = null;
    }
    if (modulatorRef.current) {
      try { modulatorRef.current.stop(); } catch (e) {}
      modulatorRef.current = null;
    }
    if (lfoRef.current) {
      try { lfoRef.current.stop(); } catch (e) {}
      lfoRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    gainRef.current = null;
  };

  const updateX0 = (newX: number) => {
    const boundedX = Math.max(minX + 0.05, Math.min(maxX - 0.05, newX));
    setX0(boundedX);
    
    // Peak/Valley bell logic
    const currentSlope = activeFunc.df(boundedX);
    const prevSlope = prevSlopeRef.current;
    
    if (
      Math.sign(prevSlope) !== Math.sign(currentSlope) &&
      prevSlope !== 0 &&
      currentSlope !== 0 &&
      Date.now() - lastBellTimeRef.current > 250
    ) {
      const eps = 0.01;
      const d2f = (activeFunc.df(boundedX + eps) - activeFunc.df(boundedX - eps)) / (2 * eps);
      const isMax = d2f < 0;
      
      triggerBell(isMax);
      lastBellTimeRef.current = Date.now();
    }
    
    prevSlopeRef.current = currentSlope;
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    let clientX = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
    } else {
      if (e.type === 'mousemove' && e.buttons !== 1) return;
      clientX = e.clientX;
    }
    
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    const targetX = minX + percentage * (maxX - minX);
    updateX0(targetX);
  };

  // Format tangent equation: y = mx + c
  const formatTangentEquation = () => {
    const m = slope;
    const c = y0 - m * x0;
    const mStr = m.toFixed(2);
    const cSign = c >= 0 ? '+' : '-';
    const cStr = Math.abs(c).toFixed(2);
    return `y = ${mStr}x ${cSign} ${cStr}`;
  };

  // Helper arrays for grid tick calculation
  const xGridTicks = [-3, -2, -1, 0, 1, 2, 3];
  const yGridTicks = [-2, -1, 0, 1, 2];

  return (
    <div className="relative w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-all duration-300">
      
      {/* Header HUD info */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">
            Rør & Udforsk ⚡
          </span>
          <h4 className="font-outfit font-black text-sm text-slate-800 dark:text-slate-200">
            Koble $f(x)$ og $f'(x)$ sammen
          </h4>
        </div>
        
        {/* Audio Toggle Button */}
        <button
          type="button"
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
            isAudioEnabled
              ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-950/40 dark:border-brand-900 dark:text-brand-400 shadow-inner'
              : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-550 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
          title={isAudioEnabled ? 'Sluk lyd' : 'Lyt til hældning (synthesizer)'}
        >
          {isAudioEnabled ? (
            <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L11.47 3.53a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>
      </div>

      {/* Combined Drag Interaction Wrapper */}
      <div 
        onMouseDown={handleInteraction}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
        className="space-y-4 cursor-ew-resize select-none"
      >
        
        {/* Plot 1: f(x) and Tangent */}
        <div className="relative bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-inner">
          <div className="absolute top-2 left-3 text-[10px] font-black text-violet-500/80 dark:text-violet-400/80 uppercase">
            Funktion f(x): {activeFunc.formula}
          </div>
          
          <svg width={width} height={height1} viewBox={`0 0 ${width} ${height1}`}>
            {/* Grid lines */}
            {xGridTicks.map((val) => (
              <line
                key={`grid1-x-${val}`}
                x1={mapX(val)}
                y1={0}
                x2={mapX(val)}
                y2={height1}
                className="stroke-slate-150 dark:stroke-slate-900/60"
                strokeWidth="0.5"
              />
            ))}
            {yGridTicks.map((val) => (
              <line
                key={`grid1-y-${val}`}
                x1={0}
                y1={mapY1(val)}
                x2={width}
                y2={mapY1(val)}
                className="stroke-slate-150 dark:stroke-slate-900/60"
                strokeWidth="0.5"
              />
            ))}

            {/* X and Y Axes */}
            <line x1={0} y1={mapY1(0)} x2={width} y2={mapY1(0)} className="stroke-slate-300 dark:stroke-slate-800" strokeWidth="1.5" />
            <line x1={mapX(0)} y1={0} x2={mapX(0)} y2={height1} className="stroke-slate-300 dark:stroke-slate-800" strokeWidth="1.5" />

            {/* Function Curve f(x) (Bold Violet) */}
            <path d={getPath1()} fill="none" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="3" strokeLinecap="round" />

            {/* Tangent Line (Bright Amber) */}
            <path d={getTangentPath()} fill="none" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="2.5" />

            {/* Vertical guidelines at x0 linking down */}
            <line x1={mapX(x0)} y1={0} x2={mapX(x0)} y2={height1} className="stroke-slate-400/50 dark:stroke-slate-600/50" strokeWidth="1" strokeDasharray="3 3" />

            {/* Tangent Point P */}
            <circle cx={mapX(x0)} cy={mapY1(y0)} r="6" className="fill-brand-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            <circle cx={mapX(x0)} cy={mapY1(y0)} r="12" className="fill-transparent stroke-brand-500/20 dark:stroke-brand-400/20 animate-ping duration-1500" strokeWidth="1" />
          </svg>
        </div>

        {/* Plot 2: f'(x) Derivative */}
        <div className="relative bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-inner">
          <div className="absolute top-2 left-3 text-[10px] font-black text-emerald-550/80 dark:text-emerald-450/80 uppercase">
            Afledt f'(x): {activeFunc.derivFormula}
          </div>
          
          <svg width={width} height={height2} viewBox={`0 0 ${width} ${height2}`}>
            {/* Grid lines */}
            {xGridTicks.map((val) => (
              <line
                key={`grid2-x-${val}`}
                x1={mapX(val)}
                y1={0}
                x2={mapX(val)}
                y2={height2}
                className="stroke-slate-150 dark:stroke-slate-900/60"
                strokeWidth="0.5"
              />
            ))}
            {yGridTicks.map((val) => (
              <line
                key={`grid2-y-${val}`}
                x1={0}
                y1={mapY2(val)}
                x2={width}
                y2={mapY2(val)}
                className="stroke-slate-150 dark:stroke-slate-900/60"
                strokeWidth="0.5"
              />
            ))}

            {/* X and Y Axes */}
            <line x1={0} y1={mapY2(0)} x2={width} y2={mapY2(0)} className="stroke-slate-300 dark:stroke-slate-800" strokeWidth="1.5" />
            <line x1={mapX(0)} y1={0} x2={mapX(0)} y2={height2} className="stroke-slate-300 dark:stroke-slate-800" strokeWidth="1.5" />

            {/* Derivative Curve f'(x) (Bold Emerald) */}
            <path d={getPath2()} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="3" strokeLinecap="round" />

            {/* Vertical guidelines at x0 */}
            <line x1={mapX(x0)} y1={0} x2={mapX(x0)} y2={height2} className="stroke-slate-400/50 dark:stroke-slate-600/50" strokeWidth="1" strokeDasharray="3 3" />

            {/* Horizontal guideline showing slope value on Y axis */}
            <line x1={mapX(0)} y1={mapY2(slope)} x2={mapX(x0)} y2={mapY2(slope)} className="stroke-emerald-500/40 dark:stroke-emerald-400/40" strokeWidth="1" strokeDasharray="2 2" />

            {/* Derivative Point (x0, slope) */}
            <circle cx={mapX(x0)} cy={mapY2(slope)} r="6" className="fill-emerald-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Math details HUD */}
      <div className="mt-4 space-y-2 text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-3 rounded-xl font-semibold">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-550 block text-[9px] uppercase tracking-wider">Tangentpunkt P</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              ({x0.toFixed(2)}, {y0.toFixed(2)})
            </span>
          </div>
          <div className="space-y-1 border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="text-slate-400 dark:text-slate-550 block text-[9px] uppercase tracking-wider">Hældning f'(x₀)</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 dark:bg-emerald-450"></span>
              {slope.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-[10px]">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Tangentens Ligning:</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-450 text-xs">
            {formatTangentEquation()}
          </span>
        </div>
      </div>

      {/* Function Toggle Tabs */}
      <div className="mt-4 flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200/40 dark:border-slate-800/40">
        {(Object.keys(functions) as FuncKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFuncKey(key);
              setX0(0); // Reset position to center
            }}
            className={`flex-1 text-center text-[10px] font-black py-2 rounded-lg transition-all cursor-pointer ${
              funcKey === key
                ? 'bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white'
                : 'text-slate-550 hover:text-slate-900 dark:text-slate-450 dark:hover:text-white'
            }`}
          >
            {functions[key].name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroTangentVisualizer;
