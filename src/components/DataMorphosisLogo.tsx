import React from 'react';
import { cn } from '@/lib/utils';

interface DataMorphosisLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  showTagline?: boolean;
}

export const DataMorphosisLogo: React.FC<DataMorphosisLogoProps> = ({ 
  className, 
  variant = 'color',
  showTagline = false 
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Butterfly Icon - representing transformation */}
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Left Wing */}
          <path 
            d="M24 24C20 20 12 12 8 16C4 20 8 28 12 28C16 28 20 24 24 24Z" 
            className={cn(
              variant === 'color' ? 'fill-cyan-400' : variant === 'light' ? 'fill-foreground' : 'fill-background'
            )}
          />
          <path 
            d="M24 24C20 28 12 36 8 32C4 28 8 20 12 20C16 20 20 24 24 24Z" 
            className={cn(
              variant === 'color' ? 'fill-orange-400' : variant === 'light' ? 'fill-foreground' : 'fill-background'
            )}
          />
          {/* Right Wing */}
          <path 
            d="M24 24C28 20 36 12 40 16C44 20 40 28 36 28C32 28 28 24 24 24Z" 
            className={cn(
              variant === 'color' ? 'fill-cyan-400' : variant === 'light' ? 'fill-foreground' : 'fill-background'
            )}
          />
          <path 
            d="M24 24C28 28 36 36 40 32C44 28 40 20 36 20C32 20 28 24 24 24Z" 
            className={cn(
              variant === 'color' ? 'fill-pink-400' : variant === 'light' ? 'fill-foreground' : 'fill-background'
            )}
          />
          {/* Center Body */}
          <ellipse cx="24" cy="24" rx="2" ry="6" className="fill-primary" />
          {/* Circuit dots */}
          <circle cx="10" cy="18" r="1.5" className="fill-primary" />
          <circle cx="38" cy="18" r="1.5" className="fill-primary" />
          <circle cx="14" cy="30" r="1.5" className="fill-primary" />
          <circle cx="34" cy="30" r="1.5" className="fill-primary" />
        </svg>
      </div>
      <div className="flex flex-col">
        <h1 className={cn(
          'font-display text-xl font-bold tracking-wide',
          variant === 'color' ? 'text-primary' : variant === 'light' ? 'text-foreground' : 'text-background'
        )}>
          Datamorphosis
        </h1>
        {showTagline && (
          <p className="text-xs text-muted-foreground tracking-wide">
            Transforming Data Into Intelligence
          </p>
        )}
      </div>
    </div>
  );
};
