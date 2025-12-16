import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoStreamProps {
  src?: string;
  cameraId?: string;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
}

const VideoStream: React.FC<VideoStreamProps> = ({
  src,
  cameraId,
  className,
  showControls = false,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Default to main camera stream if no src provided
  const streamUrl = src || 'http://localhost:5000/api/video/stream';

  useEffect(() => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setHasError(false);

    // For MJPEG stream, use img tag
    const img = videoRef.current;
    
    // MJPEG stream URL - add timestamp to prevent caching
    const urlWithTimestamp = streamUrl + (streamUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    img.src = urlWithTimestamp;

    let loadTimeout: NodeJS.Timeout;
    let errorTimeout: NodeJS.Timeout;

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
      // Clear any pending error timeout
      if (errorTimeout) clearTimeout(errorTimeout);
      
      // For MJPEG streams, the browser may cache the image
      // Force refresh by updating src periodically
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
      
      // Don't immediately show error - MJPEG streams can have temporary issues
      errorTimeout = setTimeout(() => {
        setHasError(true);
        // Retry after 2 seconds
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
    <div className={cn('relative w-full h-full bg-muted', className)}>
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
          <img
            ref={videoRef}
            alt={`Camera ${cameraId || 'feed'}`}
            className={cn(
              'w-full h-full object-cover',
              isLoading && 'opacity-0'
            )}
            style={{ imageRendering: 'auto' }}
          />
        </>
      )}
    </div>
  );
};

export default VideoStream;

