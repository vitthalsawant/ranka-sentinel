# ROI Drawing Feature Documentation

## Overview

This document describes the ROI (Region of Interest) drawing feature that allows users to visually select the detection area directly on the camera feed by drawing a rectangle/square. This feature replaces the previous slider-based ROI configuration with an intuitive click-and-drag interface.

## Features

- **Visual ROI Selection**: Draw a rectangle directly on the live camera feed
- **Real-time Feedback**: See the ROI rectangle as you draw
- **Automatic Saving**: ROI is saved to the API immediately after drawing
- **Visual Indicators**: Different colors for existing ROI (blue) and drawing ROI (green)
- **Percentage-based Configuration**: Automatically converts pixel coordinates to percentage-based ROI config

## Components Created/Modified

### 1. New Component: `VideoStreamWithROI.tsx`

**Location**: `src/components/VideoStreamWithROI.tsx`

**Purpose**: Enhanced video stream component with ROI drawing capabilities.

**Key Features**:
- Mouse event handling for drawing rectangles
- Canvas overlay for drawing ROI visualization
- Coordinate conversion from pixels to percentages
- Integration with API for saving ROI configuration

**Key Code Sections**:

```typescript
// State management for drawing
const [isDrawing, setIsDrawing] = useState(false);
const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
const [drawnROI, setDrawnROI] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

// Mouse event handlers
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
```

**Canvas Drawing Logic**:

```typescript
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

  // Draw existing ROI (blue)
  if (drawnROI && !isDrawing) {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(drawnROI.x, drawnROI.y, drawnROI.width, drawnROI.height);
    
    // Draw semi-transparent fill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(drawnROI.x, drawnROI.y, drawnROI.width, drawnROI.height);
  }

  // Draw current drawing rectangle (green, dashed)
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
```

### 2. Modified Component: `CustomerDashboard.tsx`

**Location**: `src/pages/CustomerDashboard.tsx`

**Changes Made**:
- Replaced `VideoStream` with `VideoStreamWithROI`
- Added ROI state management
- Added API integration for saving ROI
- Added automatic ROI loading from API

**Key Code Sections**:

```typescript
// ROI state management
const [roiConfig, setRoiConfig] = useState<{
  x_start_percent: number;
  x_end_percent: number;
  y_start_percent: number;
  y_end_percent: number;
} | null>(null);

// Load current ROI from API
React.useEffect(() => {
  if (isConnected && analytics?.person_counting?.roi_config) {
    setRoiConfig(analytics.person_counting.roi_config);
  }
}, [isConnected, analytics]);

// Handle ROI change and save to API
const handleROIChange = async (roi: {
  x_start_percent: number;
  x_end_percent: number;
  y_start_percent: number;
  y_end_percent: number;
}) => {
  setRoiConfig(roi);
  
  // Save ROI to API
  try {
    const personCountingMode = { enabled: true, sensitivity: 80 };
    await fetch('http://localhost:5000/api/person-counting/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: personCountingMode.enabled,
        sensitivity: personCountingMode.sensitivity,
        roi_config: roi
      })
    });
    toast.success('ROI region saved successfully! Counting will start now.');
    refreshAll(); // Refresh to get updated data
  } catch (error) {
    toast.error('Failed to save ROI region. Please try again.');
  }
};
```

**Component Usage**:

```typescript
<VideoStreamWithROI 
  cameraId={camera.id}
  className="absolute inset-0"
  onROIChange={handleROIChange}
  currentROI={roiConfig}
/>
```

## Backend Integration

### API Endpoint: `/api/person-counting/settings`

**Method**: POST

**Request Body**:
```json
{
  "enabled": true,
  "sensitivity": 80,
  "roi_config": {
    "x_start_percent": 20.5,
    "x_end_percent": 79.3,
    "y_start_percent": 15.2,
    "y_end_percent": 85.7
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "current_settings": {
    "enabled": true,
    "sensitivity": 80,
    "confidence_threshold": 0.86,
    "roi_config": {
      "x_start_percent": 20.5,
      "x_end_percent": 79.3,
      "y_start_percent": 15.2,
      "y_end_percent": 85.7
    }
  }
}
```

### Python Detection Script Integration

**Location**: `python-algorithm/people_counter_api.py`

The detection script fetches ROI configuration from the API and uses it for person counting:

```python
def get_settings_from_api():
    """Fetch current settings from dashboard"""
    data = get_from_api("/api/person-counting")
    if data:
        roi_config = data.get("roi_config")
        # Check if ROI is properly configured
        roi_valid = roi_config is not None and isinstance(roi_config, dict) and \
                   all(key in roi_config for key in ["x_start_percent", "x_end_percent", "y_start_percent", "y_end_percent"])
        
        return {
            "enabled": data.get("enabled", True),
            "sensitivity": data.get("sensitivity", 80),
            "confidence_threshold": 0.5 + (data.get("sensitivity", 80) / 100) * 0.45,
            "roi_config": roi_config if roi_valid else None,
            "roi_valid": roi_valid
        }
    return {
        "enabled": True,
        "sensitivity": 80,
        "confidence_threshold": 0.8,
        "roi_config": None,
        "roi_valid": False
    }
```

**ROI Usage in Detection**:

```python
# Calculate ROI from settings
roi_x_start = int(current_width * roi_cfg["x_start_percent"] / 100)
roi_x_end = int(current_width * roi_cfg["x_end_percent"] / 100)
roi_y_start = int(current_height * roi_cfg["y_start_percent"] / 100)
roi_y_end = int(current_height * roi_cfg["y_end_percent"] / 100)

# Extract ROI region from frame
ROI = frame[roi_y_start:roi_y_end, roi_x_start:roi_x_end]

# Run YOLO detection only on ROI region
y_hat = model.predict(ROI, conf=conf_level, classes=[0], device='cpu', verbose=False)
```

## How It Works

### User Flow

1. **User clicks "Draw ROI Region" button**
   - Sets `isDrawing` state to `true`
   - Changes cursor to `crosshair`
   - Shows instruction message

2. **User clicks and drags on camera feed**
   - `handleMouseDown`: Captures starting point
   - `handleMouseMove`: Updates rectangle dimensions in real-time
   - Canvas draws green dashed rectangle as feedback

3. **User releases mouse**
   - `handleMouseUp`: Converts pixel coordinates to percentages
   - Validates ROI (minimum 10% in each dimension)
   - Calls `onROIChange` callback with ROI config
   - Saves to API via POST request

4. **API saves ROI configuration**
   - Backend stores ROI config in `person_counting_data`
   - Returns success response

5. **Python detection script fetches ROI**
   - Polls API every 5 seconds for updated settings
   - Uses ROI percentages to calculate pixel coordinates
   - Applies detection only within ROI region

### Coordinate Conversion

The component converts between two coordinate systems:

**Pixel Coordinates** (used for drawing):
- Based on actual image dimensions
- Used for canvas drawing and mouse events

**Percentage Coordinates** (used for API):
- Normalized to 0-100% range
- Independent of image resolution
- Allows ROI to work with different camera resolutions

**Conversion Formula**:
```typescript
xStartPercent = (pixelX / imageWidth) * 100
xEndPercent = ((pixelX + pixelWidth) / imageWidth) * 100
yStartPercent = (pixelY / imageHeight) * 100
yEndPercent = ((pixelY + pixelHeight) / imageHeight) * 100
```

### Visual Feedback

- **Blue Rectangle**: Existing ROI (saved and active)
  - Solid border, semi-transparent blue fill
  - Shows current detection area

- **Green Dashed Rectangle**: Drawing ROI (while dragging)
  - Dashed border, semi-transparent green fill
  - Provides real-time feedback during drawing

## Technical Details

### Dependencies

- **React Hooks**: `useState`, `useEffect`, `useRef`, `useCallback`
- **Canvas API**: For drawing ROI rectangles
- **Mouse Events**: `onMouseDown`, `onMouseMove`, `onMouseUp`
- **Fetch API**: For API communication

### Performance Considerations

- Uses `useCallback` to memoize event handlers
- Canvas redraws only when ROI state changes
- API calls are debounced (only on mouse up)
- Coordinate calculations are optimized

### Browser Compatibility

- Works in all modern browsers supporting Canvas API
- Requires ES6+ JavaScript support
- Mouse events work on desktop browsers
- Touch events can be added for mobile support

## Usage Instructions

### For End Users

1. Navigate to the Customer Dashboard
2. Locate the "Live Camera Feeds" section
3. Find the camera feed you want to configure
4. Click the **"Draw ROI Region"** button (top-left of camera feed)
5. Click and drag on the camera feed to draw a rectangle
6. Release the mouse button to save the ROI
7. You'll see a success message confirming the ROI is saved
8. Person counting will start automatically within the drawn region

### For Developers

1. Import the component:
   ```typescript
   import VideoStreamWithROI from '@/components/VideoStreamWithROI';
   ```

2. Use in your component:
   ```typescript
   <VideoStreamWithROI 
     cameraId="camera-1"
     onROIChange={(roi) => {
       // Handle ROI change
       console.log('ROI changed:', roi);
     }}
     currentROI={existingROI}
   />
   ```

3. Handle ROI changes:
   ```typescript
   const handleROIChange = async (roi) => {
     // Save to API
     await fetch('/api/person-counting/settings', {
       method: 'POST',
       body: JSON.stringify({ roi_config: roi })
     });
   };
   ```

## Benefits

1. **User-Friendly**: Visual selection is more intuitive than sliders
2. **Precise**: Users can see exactly where detection will occur
3. **Real-time**: Immediate visual feedback during drawing
4. **Flexible**: Works with any camera resolution
5. **Integrated**: Seamlessly integrates with existing detection system

## Future Enhancements

Potential improvements for future versions:

1. **Multiple ROI Support**: Allow drawing multiple detection regions
2. **ROI Editing**: Click and drag existing ROI to modify it
3. **ROI Templates**: Save and load common ROI configurations
4. **Touch Support**: Add touch events for mobile/tablet devices
5. **Undo/Redo**: Allow users to undo ROI changes
6. **ROI Validation**: Visual warnings for invalid ROI sizes
7. **Keyboard Shortcuts**: Quick keys for common operations

## Troubleshooting

### ROI Not Saving

- Check browser console for API errors
- Verify API server is running on `http://localhost:5000`
- Check network tab for failed requests

### ROI Not Displaying

- Ensure camera feed is loaded
- Check if `currentROI` prop is passed correctly
- Verify ROI config format matches expected structure

### Drawing Not Working

- Ensure "Draw ROI Region" button is clicked first
- Check browser console for JavaScript errors
- Verify mouse events are not blocked by other elements

## Related Files

- `src/components/VideoStreamWithROI.tsx` - Main ROI drawing component
- `src/pages/CustomerDashboard.tsx` - Dashboard integration
- `src/pages/DetectionSettings.tsx` - Alternative ROI configuration (sliders)
- `python-algorithm/api_server.py` - Backend API endpoint
- `python-algorithm/people_counter_api.py` - Detection script using ROI

## Version History

- **v1.0** (Current): Initial implementation with click-and-drag ROI drawing
  - Visual drawing interface
  - Automatic API saving
  - Real-time feedback
  - Percentage-based configuration

---

**Last Updated**: December 2024  
**Author**: Datamorphosis ML Project Team

