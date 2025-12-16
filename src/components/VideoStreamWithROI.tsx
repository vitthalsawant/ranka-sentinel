import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WifiOff, RefreshCw, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VideoStreamWithROIProps {
  src?: string;
  cameraId?: string;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  onROIChange?: (roi: {
    x_start_percent: number;
    x_end_percent: number;
    y_start_percent: number;
    y_end_percent: number;
  }) => void;
  currentROI?: {
    x_start_percent: number;
    x_end_percent: number;
    y_start_percent: number;
    y_end_percent: number;
  } | null;
}

const VideoStreamWithROI: React.FC<VideoStreamWithROIProps> = ({
  src,
  cameraId,
  className,
  showControls = false,
  autoPlay = true,
  onROIChange,
  currentROI,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [drawnROI, setDrawnROI] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Default to main camera stream if no src provided
  const streamUrl = src || 'http://localhost:5000/api/video/stream';

  // Convert current ROI percentage to pixel coordinates for display
  useEffect(() => {
    if (currentROI && videoRef.current && canvasRef.current) {
      const img = videoRef.current;
      const canvas = canvasRef.current;
      const rect = img.getBoundingClientRect();
      
      const xStart = (currentROI.x_start_percent / 100) * rect.width;
      const xEnd = (currentROI.x_end_percent / 100) * rect.width;
      const yStart = (currentROI.y_start_percent / 100) * rect.height;
      const yEnd = (currentROI.y_end_percent / 100) * rect.height;

      setDrawnROI({
        x: xStart,
        y: yStart,
        width: xEnd - xStart,
        height: yEnd - yStart,
      });
    } else if (!currentROI) {
      setDrawnROI(null);
    }
  }, [currentROI]);

  // Draw ROI rectangle on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const img = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing ROI
    if (drawnROI && !isDrawing) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(drawnROI.x, drawnROI.y, drawnROI.width, drawnROI.height);
      
      // Draw semi-transparent fill
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(drawnROI.x, drawnROI.y, drawnROI.width, drawnROI.height);
    }

    // Draw current drawing rectangle
    if (isDrawing && currentRect) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      
      // Draw semi-transparent fill
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
  }, [drawnROI, currentRect, isDrawing]);

  const getRelativeCoordinates = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!videoRef.current) return null;
    const rect = videoRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !videoRef.current) return;
    e.preventDefault();
    const coords = getRelativeCoordinates(e);
    if (coords) {
      setStartPoint(coords);
    }
  }, [isDrawing, getRelativeCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !videoRef.current) return;
    e.preventDefault();
    const coords = getRelativeCoordinates(e);
    if (coords) {
      const x = Math.min(startPoint.x, coords.x);
      const y = Math.min(startPoint.y, coords.y);
      const width = Math.abs(coords.x - startPoint.x);
      const height = Math.abs(coords.y - startPoint.y);
      setCurrentRect({ x, y, width, height });
    }
  }, [isDrawing, startPoint, getRelativeCoordinates]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !videoRef.current || !onROIChange) return;
    e.preventDefault();
    const coords = getRelativeCoordinates(e);
    if (coords && currentRect) {
      const img = videoRef.current;
      const rect = img.getBoundingClientRect();
      
      // Convert pixel coordinates to percentages
      const xStartPercent = (currentRect.x / rect.width) * 100;
      const xEndPercent = ((currentRect.x + currentRect.width) / rect.width) * 100;
      const yStartPercent = (currentRect.y / rect.height) * 100;
      const yEndPercent = ((currentRect.y + currentRect.height) / rect.height) * 100;

      // Ensure valid ROI (at least 10% in each dimension)
      if (Math.abs(xEndPercent - xStartPercent) > 10 && Math.abs(yEndPercent - yStartPercent) > 10) {
        const roiConfig = {
          x_start_percent: Math.max(0, Math.min(100, xStartPercent)),
          x_end_percent: Math.max(0, Math.min(100, xEndPercent)),
          y_start_percent: Math.max(0, Math.min(100, yStartPercent)),
          y_end_percent: Math.max(0, Math.min(100, yEndPercent)),
        };
        
        onROIChange(roiConfig);
        setDrawnROI(currentRect);
      }
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  }, [isDrawing, startPoint, currentRect, onROIChange, getRelativeCoordinates]);

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing);
    if (isDrawing) {
      setStartPoint(null);
      setCurrentRect(null);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setHasError(false);

    const img = videoRef.current;
    const urlWithTimestamp = streamUrl + (streamUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    img.src = urlWithTimestamp;

    let loadTimeout: NodeJS.Timeout;
    let errorTimeout: NodeJS.Timeout;

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
      if (errorTimeout) clearTimeout(errorTimeout);
      
      loadTimeout = setTimeout(() => {
        if (img && img.parentElement) {
          const newUrl = streamUrl + (streamUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          img.src = newUrl;
        }
      }, 100);
    };

    const handleError = (e: Event) => {
      console.error('Video stream error:', e);
      setIsLoading(false);
      
      errorTimeout = setTimeout(() => {
        setHasError(true);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          if (img && img.parentElement) {
            img.src = streamUrl + (streamUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          }
        }, 2000);
      }, 1000);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      if (loadTimeout) clearTimeout(loadTimeout);
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [streamUrl, retryCount]);

  return (
    <div ref={containerRef} className={cn('relative w-full h-full bg-muted', className)}>
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10">
          <WifiOff className="w-12 h-12 text-destructive/50 mb-2" />
          <span className="text-sm text-destructive">Camera Offline</span>
          <button
            onClick={() => {
              setRetryCount(prev => prev + 1);
              setHasError(false);
            }}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 text-xs bg-background rounded-md hover:bg-secondary transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Loading stream...</span>
              </div>
            </div>
          )}
          
          {/* Drawing mode button */}
          <div className="absolute top-2 left-2 z-20">
            <Button
              variant={isDrawing ? "default" : "outline"}
              size="sm"
              onClick={toggleDrawingMode}
              className="gap-2"
            >
              {isDrawing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel Drawing
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  Draw ROI Region
                </>
              )}
            </Button>
          </div>

          {/* Instructions when drawing */}
          {isDrawing && (
            <div className="absolute top-12 left-2 z-20 bg-background/90 backdrop-blur px-3 py-2 rounded-md border border-primary">
              <p className="text-xs text-primary font-medium">
                Click and drag to draw ROI rectangle
              </p>
            </div>
          )}

          <div 
            className="relative w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
          >
            <img
              ref={videoRef}
              alt={`Camera ${cameraId || 'feed'}`}
              className={cn(
                'w-full h-full object-cover',
                isLoading && 'opacity-0'
              )}
              style={{ imageRendering: 'auto' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ imageRendering: 'auto' }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default VideoStreamWithROI;

