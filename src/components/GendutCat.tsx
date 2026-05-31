import React from 'react';

interface GendutCatProps {
  size: 'small' | 'medium' | 'large';
  animation: 'breathe' | 'spin' | 'jump' | 'wiggle' | 'sleep';
  energy: number;
  happiness: number;
  isLightMode: boolean;
  isSleeping: boolean;
}

export default function GendutCat({
  size,
  animation,
  energy,
  happiness,
  isLightMode,
  isSleeping
}: GendutCatProps) {
  // Map size categories to dimensions
  const dims = {
    small: 'w-28 h-28',
    medium: 'w-40 h-40',
    large: 'w-48 h-48',
  }[size];

  // Map active animation string to CSS animation classes
  const getAnimClass = () => {
    if (isSleeping || animation === 'sleep') return 'cat-3d-breathe'; // slow breathe
    if (animation === 'spin') return 'cat-3d-spin';
    if (animation === 'jump') return 'cat-3d-jump';
    if (animation === 'wiggle') return 'cat-3d-wiggle';
    return 'cat-3d-breathe';
  };

  // Determine eye expression based on status
  const getEyeExpression = () => {
    if (isSleeping) {
      return (
        <>
          {/* Sleepy closed eyes (mushrooms/arcs) */}
          <path d="M 38 48 Q 44 54 50 48" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 70 48 Q 76 54 82 48" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
    }
    
    if (energy < 20) {
      return (
        <>
          {/* Tired dizzy eyes (slanted crosses) */}
          <path d="M 38 43 L 48 53 M 48 43 L 38 53" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M 72 43 L 82 53 M 82 43 L 72 53" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    }

    if (happiness > 80) {
      return (
        <>
          {/* Happy upward curved eyes */}
          <path d="M 36 50 Q 43 40 50 50" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 70 50 Q 77 40 84 50" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      );
    }

    // Default: Cute big anime eyes
    return (
      <>
        {/* Left eye with highlights */}
        <ellipse cx="43" cy="48" rx="8" ry="11" fill="#1e293b" />
        <circle cx="41" cy="44" r="3" fill="#ffffff" />
        <circle cx="45" cy="51" r="1.5" fill="#ffffff" />

        {/* Right eye with highlights */}
        <ellipse cx="77" cy="48" rx="8" ry="11" fill="#1e293b" />
        <circle cx="75" cy="44" r="3" fill="#ffffff" />
        <circle cx="79" cy="51" r="1.5" fill="#ffffff" />
      </>
    );
  };

  return (
    <div className={`relative flex items-center justify-center ${dims} ${getAnimClass()}`} id={`gendut-cat-container-${size}`}>
      {/* Self-contained CSS Animations for Gendut and his interactive attributes */}
      <style>{`
        .tail-wag {
          animation: cat-tail-wag 2.5s ease-in-out infinite;
          transform-origin: 20px 45px;
        }
        @keyframes cat-tail-wag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg); }
        }

        .ear-twitch-l {
          animation: cat-ear-twitch-left 6s ease-in-out infinite;
          transform-origin: 30px 25px;
        }
        .ear-twitch-r {
          animation: cat-ear-twitch-right 6s ease-in-out infinite;
          transform-origin: 90px 25px;
        }
        @keyframes cat-ear-twitch-left {
          0%, 88%, 100% { transform: rotate(0deg); }
          90%, 94% { transform: rotate(-6deg); }
        }
        @keyframes cat-ear-twitch-right {
          0%, 88%, 100% { transform: rotate(0deg); }
          91%, 95% { transform: rotate(6deg); }
        }

        .bubble-zzz {
          animation: sleep-bubble 3.5s ease-in-out infinite;
        }
        @keyframes sleep-bubble {
          0% { transform: scale(0.4) translate(0, 0); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: scale(1.1) translate(22px, -35px); opacity: 0; }
        }

        .blushing-cheeks {
          animation: pulse-blush 3s ease-in-out infinite;
        }
        @keyframes pulse-blush {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        
        .floating-sweat {
          animation: drop-sweat 1.5s ease-in-out infinite;
        }
        @keyframes drop-sweat {
          0% { transform: translateY(-5px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
      `}</style>

      {/* Floating Zzz Sleeping indicator bubbles */}
      {isSleeping && (
        <div className="absolute top-0 right-1 z-30 pointer-events-none font-sans font-black tracking-widest text-[#22d3ee] flex flex-col gap-1 items-start">
          <span className="bubble-zzz text-lg select-none" style={{ animationDelay: '0s' }}>Zzz</span>
          <span className="bubble-zzz text-sm select-none" style={{ animationDelay: '1.2s' }}>Zz</span>
          <span className="bubble-zzz text-xs select-none" style={{ animationDelay: '2.4s' }}>z</span>
        </div>
      )}

      {/* Low Energy Sweat Drop animation */}
      {energy < 20 && !isSleeping && (
        <span className="absolute top-4 left-6 z-30 text-[#22d3ee] pointer-events-none text-xl floating-sweat">💧</span>
      )}

      {/* SVG Chubby Cat structure */}
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-xl z-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow floor base anchor */}
        <ellipse cx="60" cy="112" rx="36" ry="6" fill="rgba(0,0,0,0.18)" />

        <g id="gendut-cat-group">
          {/* Cat Tail - wagging custom animation */}
          <path
            d="M 18 102 C 5 95 2 75 10 65 C 14 60 22 62 20 70 C 14 78 12 88 23 93 C 27 95 25 103 18 102 Z"
            fill={isLightMode ? '#78716c' : '#475569'}
            className="tail-wag"
          />

          {/* Tabby stripes on Tail */}
          <path d="M 12 85 Q 8 83 9 79" stroke={isLightMode ? '#57534e' : '#334155'} strokeWidth="2.5" strokeLinecap="round" fill="none" className="tail-wag" />
          <path d="M 15 92 Q 11 90 12 87" stroke={isLightMode ? '#57534e' : '#334155'} strokeWidth="2.5" strokeLinecap="round" fill="none" className="tail-wag" />

          {/* Left Cat Ear - Twitches */}
          <path
            d="M 24 38 Q 20 12 42 22 Z"
            fill={isLightMode ? '#78716c' : '#475569'}
            stroke={isLightMode ? '#57534e' : '#334155'}
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="ear-twitch-l"
          />
          {/* Inner Light Pink Ear Left */}
          <path
            d="M 27 35 Q 24 18 38 25 Z"
            fill="#fbcfe8"
            className="ear-twitch-l"
          />

          {/* Right Cat Ear - Twitches */}
          <path
            d="M 96 38 Q 100 12 78 22 Z"
            fill={isLightMode ? '#78716c' : '#475569'}
            stroke={isLightMode ? '#57534e' : '#334155'}
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="ear-twitch-r"
          />
          {/* Inner Light Pink Ear Right */}
          <path
            d="M 93 35 Q 96 18 82 25 Z"
            fill="#fbcfe8"
            className="ear-twitch-r"
          />

          {/* Chubby Fat Cat Body Structure */}
          <ellipse
            cx="60"
            cy="70"
            rx="46"
            ry="42"
            fill={isLightMode ? '#87807d' : '#64748b'}
            stroke={isLightMode ? '#57534e' : '#334155'}
            strokeWidth="3.5"
          />

          {/* Grey / Tan stripes on Gendut's head forehead */}
          <path d="M 60 28 L 60 38" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3" strokeLinecap="round" />
          <path d="M 52 29 L 54 36" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3" strokeLinecap="round" />
          <path d="M 68 29 L 66 36" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3" strokeLinecap="round" />

          {/* Horizontal body stripes left and right (chubby side tabs) */}
          <path d="M 16 64 Q 28 64 30 68" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 17 74 Q 29 74 31 78" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          
          <path d="M 104 64 Q 92 64 90 68" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 103 74 Q 91 74 89 78" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* White Chubby Belly Core center */}
          <ellipse
            cx="60"
            cy="84"
            rx="27"
            ry="20"
            fill={isLightMode ? '#f5f5f4' : '#f1f5f9'}
          />

          {/* Rosy Blush Cheeks */}
          <circle cx="34" cy="58" r="4.5" fill="#fda4af" className="blushing-cheeks" />
          <circle cx="86" cy="58" r="4.5" fill="#fda4af" className="blushing-cheeks" />

          {/* Dynamic Eye state mounting */}
          {getEyeExpression()}

          {/* Cute Cat Whiskers */}
          {/* Left whiskers */}
          <path d="M 28 58 L 12 56" stroke={isLightMode ? '#57534e' : '#475569'} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 29 63 L 13 63" stroke={isLightMode ? '#57534e' : '#475569'} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 28 68 L 14 70" stroke={isLightMode ? '#57534e' : '#475569'} strokeWidth="1.5" strokeLinecap="round" />

          {/* Right whiskers */}
          <path d="M 92 58 L 108 56" stroke={isLightMode ? '#57534e' : '#475569'} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 91 63 L 107 63" stroke={isLightMode ? '#57534e' : '#475569'} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 92 68 L 106 70" stroke={isLightMode ? '#57534e' : '#475569'} strokeWidth="1.5" strokeLinecap="round" />

          {/* Cute chubby cat mouth & nose */}
          <ellipse cx="60" cy="53" rx="3.2" ry="2" fill="#ef4444" />
          {/* Splice mouth: 'w' type split paths */}
          <path d="M 55 57 Q 57.5 61 60 57" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M 60 57 Q 62.5 61 65 57" stroke={isLightMode ? '#44403c' : '#1e293b'} strokeWidth="3.2" strokeLinecap="round" fill="none" />

          {/* Left and Right front little stubby hands/feet */}
          <rect
            x="42"
            y="98"
            width="10"
            height="14"
            rx="5"
            fill={isLightMode ? '#78716c' : '#475569'}
            stroke={isLightMode ? '#57534e' : '#334155'}
            strokeWidth="2.5"
          />
          <rect
            x="68"
            y="98"
            width="10"
            height="14"
            rx="5"
            fill={isLightMode ? '#78716c' : '#475569'}
            stroke={isLightMode ? '#57534e' : '#334155'}
            strokeWidth="2.5"
          />
        </g>
      </svg>
    </div>
  );
}
