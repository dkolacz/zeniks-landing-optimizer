
import React from "react";

interface HeroHeadingProps {
  title: string;
  subtitle: string;
  className?: string;
}

const HeroHeading = ({ title, subtitle, className }: HeroHeadingProps) => {
  return (
    <div className={`text-center ${className || ""}`}>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zeniks-purple mb-6">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-8">
        {subtitle}
      </p>
    </div>
  );
};

export default HeroHeading;
