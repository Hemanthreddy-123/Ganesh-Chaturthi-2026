import React, { useEffect, useState } from 'react';

const AnniversaryPopup: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Popup disabled
    // const seen = sessionStorage.getItem('anniversary_popup_seen');
    // if (!seen) {
    //   setShow(true);
    // }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('anniversary_popup_seen', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={handleClose}
    >
      <div
        className="relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 100%)',
          border: '3px solid #f97316',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative band */}
        <div
          className="w-full py-3 flex items-center justify-center gap-2 text-white text-sm font-bold tracking-widest"
          style={{ background: 'linear-gradient(90deg, #ea580c, #f97316, #ea580c)' }}
        >
          🕉 &nbsp; శ్రీ గణేశ చతుర్థి &nbsp; 🕉
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          {/* Big number */}
          <div className="flex items-end justify-center gap-2 mb-1">
            <div
              className="text-8xl font-black leading-none"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #f97316, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              14
            </div>
            <div className="text-orange-400 text-4xl font-black mb-2">→</div>
            <div
              className="text-8xl font-black leading-none"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f97316, #ea580c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              15
            </div>
          </div>
          <div className="text-orange-700 font-bold text-lg mb-1">14 సంవత్సరాలు పూర్తయ్యాయి!</div>
          <div className="text-orange-500 text-sm font-semibold mb-4 tracking-wide">
            15వ సంవత్సరంలోకి అడుగుపెడుతున్నాం 🎊
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-orange-200" />
            <span className="text-orange-400 text-lg">🌸</span>
            <div className="flex-1 h-px bg-orange-200" />
          </div>

          {/* Message */}
          <p className="text-orange-900 font-medium text-base leading-relaxed mb-2">
            మన గ్రామం <span className="font-bold text-orange-600">దేపూర్</span> లో గణేశ చతుర్థి
            ఉత్సవాలు <span className="font-bold text-orange-600">14 సంవత్సరాలు</span> విజయవంతంగా పూర్తయ్యాయి!
          </p>
          <p className="text-orange-700 text-sm leading-relaxed mb-5">
            ఇప్పుడు <span className="font-bold text-orange-600">15వ సంవత్సరంలోకి</span> అడుగుపెడుతున్నాం. 🙏<br />
            మీ అందరికీ హార్దిక శుభాకాంక్షలు!<br />
            <span className="font-semibold">గణపతి బప్పా మోర్యా!</span>
          </p>

          {/* Milestone badges */}
          <div className="flex justify-center gap-3 mb-6">
            {['2011', '→', '2025'].map((item, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  item === '→'
                    ? 'text-orange-400 text-lg'
                    : 'bg-orange-500 text-white shadow-md'
                }`}
              >
                {item}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-2xl text-white font-bold text-base tracking-wide shadow-lg transition-all active:scale-95"
            style={{
              background: 'linear-gradient(90deg, #ea580c, #f97316)',
              boxShadow: '0 4px 15px rgba(249,115,22,0.4)',
            }}
          >
            🎉 జయహో గణపతి!
          </button>
        </div>

        {/* Bottom decorative band */}
        <div
          className="w-full py-2 text-center text-white/90 text-xs font-medium"
          style={{ background: 'linear-gradient(90deg, #ea580c, #f97316, #ea580c)' }}
        >
          ✨ దేపూర్ గ్రామ గణేశ చతుర్థి కమిటీ ✨
        </div>
      </div>
    </div>
  );
};

export default AnniversaryPopup;
