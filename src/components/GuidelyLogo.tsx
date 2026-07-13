import React from "react";

interface GuidelyLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
}

export const GuidelyLogo: React.FC<GuidelyLogoProps> = ({
  className = "",
  size = "md",
  showText = false,
  textClassName = "",
}) => {
  const sizeClasses = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${sizeClasses[size]} shrink-0 select-none`}>
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-blue-500/15 dark:bg-blue-500/10 blur-md rounded-full scale-125 pointer-events-none" />
        
        {/* Sleek Map-Pin Emblem */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm relative z-10"
        >
          <defs>
            {/* Premium Indigo to Blue and Deep Blue Pin Gradient */}
            <linearGradient id="guidelyPinGradient" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" /> {/* Indigo / Blue */}
              <stop offset="60%" stopColor="#1d4ed8" /> {/* Rich Navy Blue */}
              <stop offset="100%" stopColor="#1e3a8a" /> {/* Deep Midnight */}
            </linearGradient>
            
            <linearGradient id="innerArrowGradient" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>

          {/* Crisp Map Pin Contour */}
          <path
            d="M50 90C72 68 88 49 88 32C88 12 71 2 50 2C29 2 12 12 12 32C12 49 28 68 50 90Z"
            fill="url(#guidelyPinGradient)"
          />

          {/* Beautifully stylized G letter with navigation arrow attributes */}
          <path
            d="M50 22C39 22 30 31 30 42C30 53 39 62 50 62C58 62 65 56 65 48H50V40H74C74.5 41.5 74.8 43 74.8 44.5C74.8 58 63 69 50 69C35 69 22 56 22 42C22 28 35 15 50 15C58 15 65 18 70 24L61.5 31.5C58.5 27.5 54.5 25 50 25V22Z"
            fill="url(#innerArrowGradient)"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-sans font-extrabold text-text-primary tracking-tight ${textClassName}`}>
            GUIDELY
          </span>
          <span className="text-[9px] font-mono tracking-widest text-blue-600 dark:text-blue-400 font-bold uppercase">
            The Google Maps for Learning
          </span>
        </div>
      )}
    </div>
  );
};
