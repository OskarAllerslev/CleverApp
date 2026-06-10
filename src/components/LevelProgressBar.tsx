import React, { useState, useEffect, useRef } from 'react';
import { getTotalXP, getLevelFromXP } from '../lib/xpService';
import type { LevelInfo } from '../lib/xpService';

// Audio Synthesizer for Retro Level-Up Chime
const playLevelUpSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // A rapid rising major chord arpeggio for a triumphant retro game feel
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const noteDuration = 0.08; // Duration of each note in seconds
    
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * noteDuration;
      
      // Triangle wave (soft retro sound)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      // Gain node for clean envelope decay
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration - 0.01);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  } catch (e) {
    console.error('Failed to play synthesized level-up sound:', e);
  }
};

export const LevelProgressBar: React.FC = () => {
  const [totalXP, setTotalXP] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 100,
    progressPercent: 0
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpEarnedToast, setXpEarnedToast] = useState<{ points: number } | null>(null);
  
  const currentLevelRef = useRef<number>(0);

  // Sync state with localStorage/xpService
  const syncXP = (isInitial = false) => {
    const xp = getTotalXP();
    setTotalXP(xp);
    const info = getLevelFromXP(xp);
    
    // Check if level increased
    if (!isInitial && currentLevelRef.current > 0 && info.level > currentLevelRef.current) {
      setShowLevelUp(true);
    }
    
    currentLevelRef.current = info.level;
    setLevelInfo(info);
  };

  useEffect(() => {
    // Initial fetch on mount - mark as initial to prevent triggering level up on load
    syncXP(true);

    // Listen for XP changes
    const handleXPEarned = (e: Event) => {
      const customEvent = e as CustomEvent<{ quizId: string; points: number }>;
      const { points } = customEvent.detail;
      
      // Trigger temporary XP earned toast animation
      setXpEarnedToast({ points });
      setTimeout(() => setXpEarnedToast(null), 2000);
      
      syncXP(false);
    };

    // Listen for authentication changes (which updates session XP)
    const handleAuthChange = () => {
      syncXP(false);
    };

    window.addEventListener('clevermat-xp-earned', handleXPEarned);
    window.addEventListener('clevermat_auth_change', handleAuthChange);

    return () => {
      window.removeEventListener('clevermat-xp-earned', handleXPEarned);
      window.removeEventListener('clevermat_auth_change', handleAuthChange);
    };
  }, []);

  // Confetti particles animation engine
  useEffect(() => {
    if (!showLevelUp) return;
    
    // Play the synthesized audio effect
    playLevelUpSound();

    const canvas = document.getElementById('level-up-confetti') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palette for confetti particles
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Initialize particles shooting up from center-bottom area
    for (let i = 0; i < 300; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height / 2 + 100 + (Math.random() - 0.5) * 80,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 16,
        speedY: -Math.random() * 15 - 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }

    const gravity = 0.35;
    const wind = 0.05;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.speedY += gravity;
        p.speedX += (Math.random() - 0.5) * wind;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Draw particle (rotating rectangle)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [showLevelUp]);

  return (
    <div className="relative flex items-center gap-3 w-full">
      {/* Full Screen Level Up Alert Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLevelUp(false)}>
          {/* Confetti Canvas */}
          <canvas id="level-up-confetti" className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Radial Glow Container */}
          <div className="relative text-center max-w-md px-8 py-12 bg-white/10 dark:bg-slate-900/40 border border-white/10 dark:border-slate-800/40 rounded-3xl shadow-2xl backdrop-blur-xl scale-in duration-500 flex flex-col items-center gap-6 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Glowing Background Light */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-amber-500/30 via-sky-500/30 to-brand-500/30 rounded-full blur-3xl opacity-70 pointer-events-none animate-pulse" />

            {/* Icon/Visual Badge */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-ping duration-1500" />
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 text-white flex items-center justify-center font-outfit font-black text-5xl shadow-lg shadow-amber-500/30 border border-amber-300 animate-[pulse_2s_ease-in-out_infinite]">
                {levelInfo.level}
              </div>
              <div className="absolute -top-3 -right-3 text-4xl animate-bounce">👑</div>
              <div className="absolute -bottom-3 -left-3 text-4xl animate-bounce delay-200">🌟</div>
            </div>

            {/* Level up Text */}
            <div className="space-y-2 relative z-10">
              <span className="text-xs font-black tracking-widest text-amber-400 dark:text-amber-300 uppercase block animate-bounce">
                Ny Præstation Låst Op! 🏆
              </span>
              <h2 className="font-outfit font-black text-5xl text-white tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
                NIVEAU UPGRADERING
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
                Du er steget til <span className="text-white font-extrabold">Niveau {levelInfo.level}</span>! Din matematiske styrke vokser for hver løst opgave.
              </p>
            </div>

            {/* Stats list */}
            <div className="w-full bg-white/5 dark:bg-slate-950/40 border border-white/10 dark:border-slate-800/20 rounded-2xl p-4 space-y-2 text-xs text-slate-350 font-semibold relative z-10">
              <div className="flex justify-between">
                <span>Næste Niveau:</span>
                <span className="text-amber-400 font-bold">Niveau {levelInfo.level + 1}</span>
              </div>
              <div className="flex justify-between">
                <span>XP Krav til næste:</span>
                <span className="text-slate-200 font-mono font-bold">{levelInfo.nextLevelXP} XP</span>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setShowLevelUp(false)}
              className="px-10 py-3 text-lg font-black rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-lg shadow-amber-400/25 hover:shadow-amber-400/35 cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-150 relative z-10">
              Fortsæt din rejse 🚀
            </button>
          </div>
        </div>
      )}

      {/* Floating XP Toast Overlay */}
      {xpEarnedToast && (
        <div className="absolute -bottom-10 right-4 px-3 py-1 bg-brand-600 text-white text-xs font-extrabold rounded-full shadow-md animate-out fade-out slide-out-to-top-3 duration-1000 z-[998]">
          +{xpEarnedToast.points} XP! 🎯
        </div>
      )}

      {/* Level Badge */}
      <div className="flex items-center gap-1.5 shrink-0" title={`Niveau ${levelInfo.level}`}>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center font-outfit font-black text-sm shadow-md ring-2 ring-brand-500/10 dark:ring-brand-400/20">
          {levelInfo.level}
        </div>
      </div>

      {/* Progress Info & Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          <span>XP Niveau</span>
          <span className="font-mono text-slate-400 dark:text-slate-550">
            {levelInfo.currentLevelXP} / {levelInfo.nextLevelXP}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/10 dark:border-slate-700/10 overflow-hidden relative shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400 dark:from-brand-600 dark:to-sky-500 transition-all duration-700 ease-out relative"
            style={{ width: `${levelInfo.progressPercent}%` }}
          >
            {/* Pulsing light effect inside bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgressBar;
