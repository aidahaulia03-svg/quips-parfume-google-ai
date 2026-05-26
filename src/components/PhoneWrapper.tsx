import React from 'react';

interface PhoneWrapperProps {
  children: React.ReactNode;
}

export default function PhoneWrapper({ children }: PhoneWrapperProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF7F6] via-[#F9F0F0] to-[#E5D1D0]/20 flex flex-col md:items-center md:justify-center md:py-8 md:px-4 font-sans text-[#2D2D2D]">
      {/* 
        Responsive layout container:
        - On mobile/tablet (default): full screen and width (w-full min-h-screen)
        - On desktop (md:): beautiful, polished, rounded device container centered on the screen 
      */}
      <div className="w-full h-screen max-h-screen md:max-w-[420px] md:min-h-[860px] md:h-[860px] md:rounded-[40px] md:shadow-[0_20px_50px_rgba(194,125,127,0.12)] md:border md:border-[#E5D1D0] md:overflow-hidden bg-[#FAF7F6] flex flex-col relative select-none">
        {children}
      </div>
    </div>
  );
}
