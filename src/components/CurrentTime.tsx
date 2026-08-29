import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatted = time.toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  return (
    <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Clock className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">IST</p>
        <p className="text-sm text-orange-900 font-medium">{formatted}</p>
      </div>
    </div>
  );
};

export default CurrentTime;
