'use client';

/** Deterministic pseudo-random so server and client render identical markup. */
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 12.9898 * salt + 78.233) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000; // 3 decimals: identical on server and client
};

/** Equaliser-style bars with corner brackets. */
export function Bars({ className = '' }: { className?: string }) {
  const n = 96;
  return (
    <div className={`relative h-[120px] ${className}`} aria-hidden>
      <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="h-full w-full text-head">
        <path d="M2 14V2h24M174 2h12M346 2h12M574 2h24v12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
        <path d="M2 106v12h24M174 118h12M346 118h12M574 118h24v-12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
        {Array.from({ length: n }).map((_, i) => {
          const h = Math.round(14 + rnd(i) * 70 + (rnd(i, 3) > 0.9 ? 22 : 0));
          return <line key={i} x1={8 + i * 6.2} x2={8 + i * 6.2} y1={104} y2={104 - h} stroke="currentColor" strokeWidth="1.4" style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: `barpulse ${(2.2 + rnd(i, 5) * 2.4).toFixed(2)}s ease-in-out ${(-rnd(i, 7) * 4).toFixed(2)}s infinite` }} />;
        })}
      </svg>
    </div>
  );
}

/** Overlapping sine waves + ruler ticks. */
export function Waves({ className = '' }: { className?: string }) {
  const wave = (phase: number) => {
    let d = '';
    for (let x = 0; x <= 840; x += 6) d += `${x ? 'L' : 'M'}${x} ${(60 + Math.sin((x / 60) * Math.PI + phase) * 46).toFixed(2)}`;
    return d;
  };
  return (
    <div className={`relative h-[120px] overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="h-full w-full text-head">
        <g style={{ animation: 'wave-shift 7s linear infinite' }}>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((p, i) => (
            <path key={i} d={wave(p)} fill="none" stroke="currentColor" strokeWidth="1.1" />
          ))}
        </g>
        <g stroke="currentColor" strokeWidth="1">
          {Array.from({ length: 100 }).map((_, i) => (
            <line key={i} x1={2 + i * 6} x2={2 + i * 6} y1={120} y2={120 - (i % 10 === 0 ? 11 : i % 5 === 0 ? 8 : 5)} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Two rows of breathing dashes (the little "signal" blocks beside the big statements). */
export function Dashes({ className = '' }: { className?: string }) {
  const row = (seed: number, count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <span key={i} className="block h-[6px] origin-left bg-head" style={{ width: `${Math.round(14 + rnd(i + seed, 2) * 120)}px`, animation: `dash-run ${(3 + rnd(i + seed, 4) * 3).toFixed(2)}s ease-in-out ${(-rnd(i + seed, 6) * 4).toFixed(2)}s infinite`, marginLeft: i ? `${Math.round(10 + rnd(i + seed, 8) * 40)}px` : 0 }} />
    ));
  return (
    <div className={`flex flex-col justify-center gap-8 ${className}`} aria-hidden>
      <div className="flex items-center overflow-hidden">{row(1, 6)}</div>
      <div className="flex items-center justify-end overflow-hidden">{row(40, 4)}</div>
    </div>
  );
}

/** Halftone dot field with a soft mask. */
export function DotField({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`dither ${className}`}
      style={{
        animation: 'dot-drift 6s linear infinite',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 35% 45%, #000 20%, transparent 75%)',
        maskImage: 'radial-gradient(ellipse 70% 80% at 35% 45%, #000 20%, transparent 75%)',
      }}
    />
  );
}
