import React from 'react';

export default function IPhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* iPhone 17 Pro Max shell */}
      <div className="relative w-[393px] h-[852px] max-h-[95vh] bg-black rounded-[55px] shadow-2xl shadow-black/60 border-[3px] border-gray-700 overflow-hidden flex flex-col">

        {/* Dynamic Island */}
        <div className="absolute top-0 left-0 right-0 z-[100] flex justify-center pt-[10px] pointer-events-none">
          <div className="w-[126px] h-[37px] bg-black rounded-full flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700" />
          </div>
        </div>

        {/* iOS Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-[90] flex items-center justify-between px-8 pt-[14px] h-[54px] pointer-events-none">
          <span className="text-white text-[15px] font-semibold" style={{ fontFamily: '-apple-system, SF Pro Text, system-ui' }}>
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Signal bars */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white"/>
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="white"/>
              <rect x="9" y="2" width="3" height="10" rx="0.5" fill="white"/>
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="white"/>
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="white"/>
              <path d="M4.93 7.76a4.5 4.5 0 016.14 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2.34 5.17a8 8 0 0111.32 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div className="w-[25px] h-[12px] rounded-[3px] border border-white/60 p-[1.5px]">
                <div className="h-full w-[80%] bg-white rounded-[1.5px]" />
              </div>
              <div className="w-[1.5px] h-[5px] bg-white/60 rounded-r-sm" />
            </div>
          </div>
        </div>

        {/* App content area */}
        <div className="flex-1 overflow-hidden bg-gray-50 relative">
          {children}
        </div>

        {/* iOS Home Indicator */}
        <div className="absolute bottom-0 left-0 right-0 z-[90] flex justify-center pb-[8px] pointer-events-none">
          <div className="w-[134px] h-[5px] bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
