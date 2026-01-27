import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#fbfbfd]">
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};