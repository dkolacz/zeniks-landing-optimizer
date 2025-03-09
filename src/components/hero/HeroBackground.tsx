
import React from "react";

interface HeroBackgroundProps {
  children: React.ReactNode;
}

const HeroBackground = ({ children }: HeroBackgroundProps) => {
  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {children}
      </div>
    </div>
  );
};

export default HeroBackground;
