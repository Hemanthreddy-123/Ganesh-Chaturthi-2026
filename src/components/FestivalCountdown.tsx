import React, { useState, useEffect } from 'react';

const FESTIVAL_DATE = new Date('2026-08-19T00:00:00+05:30');

const FestivalCountdown: React.FC = () => {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = FESTIVAL_DATE.getTime() - Date.now();
      if (diff <= 0) { setDone(true); return; }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (done) return (
    <div className="text-center py-4">
      <p className="text-3xl font-black text-white animate-pulse drop-shadow-lg">
        🎉 Ganesh Chaturthi 2026 is Here! 🎉
      </p>
    </div>
  );

  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Mins' },
    { v: t.seconds, l: 'Secs' },
  ];

  return (
    <div className="text-center">
      <p className="text-white/70 text-[10px] font-semibold mb-4 uppercase tracking-[3px]">
        Depur Ganesh Utsav 2026 Countdown
      </p>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {units.map(({ v, l }, i) => (
          <React.Fragment key={l}>
            {/* Box */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background:'rgba(255,255,255,0.15)',
                  border:'1.5px solid rgba(255,255,255,0.3)',
                  backdropFilter:'blur(10px)',
                  boxShadow:'0 8px 32px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                {/* Top shine */}
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl"
                  style={{background:'rgba(255,255,255,0.08)'}} />
                <span className="relative text-2xl sm:text-3xl font-black text-white tabular-nums"
                  style={{textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
                  {String(v).padStart(2, '0')}
                </span>
              </div>
              <span className="text-white/60 text-[9px] font-bold uppercase tracking-[1.5px] mt-1.5">{l}</span>
            </div>
            {/* Separator */}
            {i < 3 && (
              <div className="flex flex-col gap-1.5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FestivalCountdown;
