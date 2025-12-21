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
      {/* Logo Image */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <img 
          src="/images/images.png" 
          alt="Datamorphosis Logo" 
          className="w-full h-full object-contain"
        />
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
