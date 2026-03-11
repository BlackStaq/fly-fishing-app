import { useState, useEffect } from 'react';
import { Fish } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2500;
    const interval = 30;
    const step = (interval / duration) * 100;
    let current = 0;

    const timer = setInterval(() => {
      current += step + Math.random() * 2;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 500);
        }, 300);
      }
      setProgress(Math.min(current, 100));
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(180deg, #2a1a0e 0%, #1c1917 40%, #1c1917 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-amber-700/60 transition-all duration-1000 ${progress > 10 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
          style={{ background: 'linear-gradient(135deg, #3c2415 0%, #2a1a0e 100%)', boxShadow: '0 0 30px rgba(217,119,6,0.15)' }}>
          <Fish className="w-10 h-10 text-amber-400" />
        </div>
      </div>

      {/* Title */}
      <h1 className={`text-3xl font-bold text-amber-50 mb-1 transition-all duration-700 delay-300 ${progress > 15 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ fontFamily: 'Bitter, Georgia, serif' }}>
        TightLines
      </h1>
      <p className={`text-xs text-amber-600 tracking-[0.25em] uppercase mb-10 transition-all duration-700 delay-500 ${progress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        Fly Fishing Journal
      </p>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-stone-800 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-16">
        {progress < 30 ? 'Preparing your journal...' : progress < 60 ? 'Loading fly patterns...' : progress < 90 ? 'Mapping the waters...' : 'Ready to fish!'}
      </p>

      {/* Developer credit */}
      <div className={`absolute bottom-8 transition-all duration-700 delay-700 ${progress > 25 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-[10px] text-stone-600 tracking-wide">Developed by</p>
        <p className="text-xs text-stone-400 font-semibold tracking-wider text-center">BLACKSTAQ</p>
      </div>
    </div>
  );
}
