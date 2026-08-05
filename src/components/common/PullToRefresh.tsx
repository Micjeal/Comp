import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowDown, RefreshCw, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 60,
  maxPull = 110,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return true;
    // Check if the container or its parent window/scroll area is scrolled to top
    const scrollTop = containerRef.current.scrollTop;
    return scrollTop <= 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isRefreshing || !isAtTop()) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    setIsDragging(true);
    setRefreshComplete(false);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || isRefreshing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dy = clientY - startYRef.current;

    if (dy > 0 && isAtTop()) {
      // Apply dampening function
      const dampened = Math.min(maxPull, Math.pow(dy, 0.82));
      setPullDistance(dampened);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Hold indicator at threshold height while refreshing

      try {
        await onRefresh();
        setRefreshComplete(true);
        setTimeout(() => {
          setRefreshComplete(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      } catch (err) {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Prevent default overscroll bounce when pulling on touch devices
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventScroll = (e: TouchEvent) => {
      if (pullDistance > 0 && e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchmove', preventScroll, { passive: false });
    return () => el.removeEventListener('touchmove', preventScroll);
  }, [pullDistance]);

  const pullProgress = Math.min(1, pullDistance / threshold);
  const rotationAngle = pullProgress * 180;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={`relative select-none overflow-hidden ${className}`}
    >
      {/* Pull Indicator Container */}
      <div
        className="flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 5 ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#0F1219] border border-slate-800 text-xs font-mono shadow-xl backdrop-blur-md">
          {refreshComplete ? (
            <>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-emerald-400 font-bold">Community updates synced!</span>
            </>
          ) : isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-400 font-bold">Fetching latest updates...</span>
            </>
          ) : (
            <>
              <div
                className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 transition-transform duration-200"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
              <span className={pullProgress >= 1 ? 'text-blue-400 font-bold' : 'text-slate-400 font-medium'}>
                {pullProgress >= 1 ? 'Release to refresh' : 'Pull down to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div
        style={{
          transform: pullDistance > 0 && !isRefreshing ? `translateY(0px)` : 'none',
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0,0,0.2,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
