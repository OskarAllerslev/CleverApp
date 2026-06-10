import React from 'react';

interface Props {
  definition: string;
  children: React.ReactNode;
}

export const Term: React.FC<Props> = ({ definition, children }) => {
  return (
    <span tabIndex={0} className="group term-container relative inline-block cursor-help select-none focus:outline-none"><span className="text-brand-600 dark:text-sky-400 font-semibold border-b-2 border-dashed border-brand-400 dark:border-sky-500 transition-colors">{children}</span><span className="term-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-slate-100 dark:bg-white dark:text-slate-900 text-xs font-normal rounded-xl p-3 shadow-2xl border border-slate-800/20 dark:border-slate-200/60 z-[9999] pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-150 block leading-relaxed animate-in fade-in slide-in-from-bottom-1">{definition}<span className="term-arrow absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 dark:border-t-white transition-all duration-150"></span></span></span>
  );
};

export default Term;

