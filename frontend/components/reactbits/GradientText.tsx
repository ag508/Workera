"use client"
import React, { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

const GradientText = ({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div className={`animated-gradient-text ${className}`}>
      {showBorder && <div className="gradient-overlay" style={gradientStyle}></div>}
      <div className="text-content" style={gradientStyle}>{children}</div>
      <style jsx>{`
        .animated-gradient-text {
          position: relative;
          display: inline-block;
          font-weight: bold;
        }
        .text-content {
          background-size: 300%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: animated-gradient-text-fade linear infinite;
        }
        @keyframes animated-gradient-text-fade {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default GradientText;
