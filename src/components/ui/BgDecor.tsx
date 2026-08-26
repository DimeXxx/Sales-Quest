export function BgDecor() {
  return (
    <>
      <svg className="pointer-events-none fixed bottom-0 left-0 z-0 h-64 w-80 opacity-[0.08]" viewBox="0 0 320 260" fill="none">
        <rect x="10" y="120" width="30" height="140" stroke="#22D3EE" strokeWidth="1" />
        <rect x="50" y="80" width="26" height="180" stroke="#22D3EE" strokeWidth="1" />
        <rect x="86" y="150" width="34" height="110" stroke="#22D3EE" strokeWidth="1" />
        <rect x="130" y="60" width="24" height="200" stroke="#22D3EE" strokeWidth="1" />
        <rect x="164" y="110" width="30" height="150" stroke="#22D3EE" strokeWidth="1" />
        <rect x="204" y="40" width="28" height="220" stroke="#22D3EE" strokeWidth="1" />
        <rect x="242" y="130" width="26" height="130" stroke="#22D3EE" strokeWidth="1" />
      </svg>
      <svg className="pointer-events-none fixed right-0 top-0 z-0 h-56 w-96 opacity-[0.08]" viewBox="0 0 400 200" fill="none">
        <polyline
          points="0,150 40,120 80,140 120,80 160,100 200,50 240,70 280,30 320,55 360,20 400,40"
          stroke="#A78BFA" strokeWidth="1.5" fill="none"
        />
      </svg>
      <div className="pointer-events-none fixed left-1/3 top-0 z-0 h-96 w-96 rounded-full bg-violet-600/[0.06] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 z-0 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
    </>
  );
}
