import React, { useState, useRef, useEffect } from 'react';

interface Props {
  definition: string;
  children: React.ReactNode;
}

export const Term: React.FC<Props> = ({ definition, children }) => {
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    left: '50%',
    transform: 'translateX(-50%)',
  });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({
    left: '50%',
    transform: 'translateX(-50%)',
  });
  
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (visible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 is 256px
      const halfWidth = tooltipWidth / 2;
      const termCenter = rect.left + rect.width / 2;
      
      // Determine visible left boundary (minimum X coord for tooltip left edge)
      let minLeft = 16;
      const sidebar = document.getElementById('desktop-sidebar');
      if (sidebar && window.innerWidth >= 768) {
        const sidebarRect = sidebar.getBoundingClientRect();
        if (sidebarRect.width > 0) {
          minLeft = sidebarRect.right + 16;
        }
      }
      
      const maxRight = window.innerWidth - 16;
      let offset = 0;
      
      if (termCenter - halfWidth < minLeft) {
        offset = minLeft - (termCenter - halfWidth);
      } else if (termCenter + halfWidth > maxRight) {
        offset = maxRight - (termCenter + halfWidth); // negative offset
      }
      
      setTooltipStyle({
        left: '50%',
        transform: `translateX(calc(-50% + ${offset}px))`,
      });
      
      // Keep arrow aligned with word, but clamp to prevent it from going off the tooltip bubble
      const maxArrowOffset = halfWidth - 20;
      const clampedOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, offset));
      
      setArrowStyle({
        left: `calc(50% - ${clampedOffset}px)`,
        transform: 'translateX(-50%)',
      });
    }
  }, [visible]);

  return (
    <span 
      ref={containerRef}
      className="relative inline-block cursor-help select-none"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)} // Support touch/mobile
    >
      <span className="text-brand-600 dark:text-sky-400 font-semibold border-b-2 border-dashed border-brand-400 dark:border-sky-500 transition-colors">
        {children}
      </span>
      
      {visible && (
        <span 
          style={tooltipStyle}
          className="absolute bottom-full mb-2 w-64 bg-slate-900 text-slate-100 dark:bg-white dark:text-slate-900 text-xs font-normal rounded-xl p-3 shadow-2xl border border-slate-800/20 dark:border-slate-200/60 z-[9999] pointer-events-none block leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          {definition}
          <span 
            style={arrowStyle}
            className="absolute top-full border-[6px] border-transparent border-t-slate-900 dark:border-t-white transition-all duration-150"
          ></span>
        </span>
      )}
    </span>
  );
};

export default Term;
