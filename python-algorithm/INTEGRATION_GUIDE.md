# Security Dashboard Integration Guide

## Overview

This guide explains how to run the integrated security services that automatically connect to the Security Dashboard. Both gender classification and people counting services run headless (no GUI) and send data directly to the dashboard.

## Quick Start

### Step 1: Start the API Server

In one terminal, start the Flask API server:

```bash
python api_server.py
```

The API server will run on `http://localhost:5000` and provides endpoints for the dashboard.

### Step 2: Start Both Services Together

In another terminal, start both services simultaneously:

```bash
python start_security_services.py
```

This will automatically:
- Start the Gender Classification Service (headless, auto-starts camera)
- Start the People Counter API (auto-starts camera)
- Both services send data to the API server
- All output appears in the Security Dashboard

### Step 3: View Results in Dashboard

Open your browser and navigate to:
```
http://localhost:8080
```

The Security Dashboard will display:
- **Gender Statistics**: Male count, Female count, Total count
- **People Counting**: Total people counted, Current occupancy
- **Live Video Stream**: Real-time camera feed with detections

## How It Works

### Service Architecture

```
┌─────────────────────────────────────────┐
│     Security Dashboard (Frontend)      │
│         http://localhost:8080          │
└─────────────────┬───────────────────────┘
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────┐
│      API Server (Flask)                 │
│      http://localhost:5000              │
│  - Receives data from services          │
│  - Provides endpoints for dashboard     │
└───────┬───────────────────┬─────────────┘
        │                   │
        │ POST              │ POST
        │                   │
┌───────▼────────┐  ┌──────▼─────────────┐
│ Gender         │  │ People Counter      │
│ Classification │  │ API                  │
│ Service        │  │                      │
│                │  │                      │
│ - Face detect  │  │ - YOLOv8 detection  │
│ - Gender class │  │ - ROI tracking       │
│ - Auto-start   │  │ - Auto-start         │
│ - No GUI       │  │ - No GUI             │
└────────────────┘  └─────────────────────┘
```

### Data Flow

1. **Gender Classification Service**:
   - Opens camera automatically (no GUI)
   - Detects faces in real-time
   - Classifies gender (Male/Female)
   - Tracks unique people
   - Sends counts to API: `POST /api/gender-classification/update`

2. **People Counter API**:
   - Opens camera automatically (no GUI)
   - Uses YOLOv8 for person detection
   - Tracks people in ROI (Region of Interest)
   - Counts entries/exits
   - Sends counts to API: `POST /api/internal/update-count`

3. **API Server**:
   - Receives data from both services
   - Stores analytics data
   - Provides REST endpoints for dashboard
   - Streams video frames

4. **Security Dashboard**:
   - Polls API every 3 seconds
   - Displays real-time statistics
   - Shows live video stream
   - Updates automatically

## Files Created/Modified

### New Files

1. **`gender_classification_service.py`**
   - Headless gender classification service
   - Auto-starts camera
   - No GUI (tkinter removed)
   - Sends data to API server

2. **`start_security_services.py`**
   - Unified starter script
   - Starts both services together
   - Manages process lifecycle
   - Handles graceful shutdown

### Modified Files

1. **`api_server.py`**
   - Added gender classification data structure
   - Added endpoint: `POST /api/gender-classification/update`
   - Added endpoint: `GET /api/gender-classification`
   - Updated analytics endpoint to include gender data

2. **`people_counter_api.py`**
   - Removed user input prompt
   - Auto-starts camera automatically
   - No manual confirmation needed

## API Endpoints

### Gender Classification

- **GET** `/api/gender-classification` - Get current gender statistics
- **POST** `/api/gender-classification/update` - Update gender counts

### People Counting

- **GET** `/api/person-counting` - Get people counting data
- **POST** `/api/internal/update-count` - Update people counts

### Analytics

- **GET** `/api/analytics` - Get all analytics (includes both gender and people counts)

## Configuration

### Camera Settings

Both services use camera index 0 by default. To use different cameras:

**Gender Classification Service** (`gender_classification_service.py`):
```python
self.camera = cv2.VideoCapture(0)  # Change 0 to desired index
```

**People Counter** (`people_counter_api.py`):
```python
camera_index = 0  # Change 0 to desired index
```

### API Server URL

Default: `http://localhost:5000`

To change, edit `API_BASE_URL` in:
- `gender_classification_service.py`
- `people_counter_api.py`

## Troubleshooting

### Both Services Can't Access Camera

If both services try to use the same camera and one fails:

**Solution 1**: Use different cameras
- Modify camera indices in each service
- Use camera 0 for one, camera 1 for the other

**Solution 2**: Run services sequentially
- Start one service, let it run
- Then start the other (may have limited functionality)

**Solution 3**: Use the combined approach
- The API server shares video frames
- Services can read from shared frame buffer (future enhancement)

### Services Not Connecting to API

1. Verify API server is running:
   ```bash
   curl http://localhost:5000/api/status
   ```

2. Check firewall settings
3. Ensure port 5000 is not in use
4. Review error messages in console

### Model Not Found

**Gender Classification**:
```bash
python train_model.py
```
This creates `models/GenderClassification.h5`

**People Counter**:
YOLOv8 model downloads automatically on first run. Ensure internet connection.

## Stopping Services

### Using Unified Starter

Press `Ctrl+C` in the terminal running `start_security_services.py`

This will gracefully stop both services.

### Individual Services

If running individually, press `Ctrl+C` in each terminal.

## Dashboard Features

The Security Dashboard automatically displays:

1. **Gender Statistics Card**:
   - Male Count
   - Female Count
   - Total Count
   - Updates in real-time

2. **People Counting Card**:
   - Total People Counted
   - Current Occupancy
   - Entry/Exit Statistics

3. **Live Video Stream**:
   - Real-time camera feed
   - Detection overlays
   - Statistics overlay

4. **API Connection Status**:
   - Shows connection status
   - Displays errors if disconnected
   - Auto-retry functionality

## Notes

- Both services run **headless** (no GUI windows)
- Camera starts **automatically** (no user input needed)
- All data goes to the **Security Dashboard**
- Services can run **simultaneously** (may need different cameras)
- Press `Ctrl+C` to stop all services gracefully

## Next Steps

1. Start API server: `python api_server.py`
2. Start services: `python start_security_services.py`
3. Open dashboard: `http://localhost:8080`
4. View real-time statistics and video stream

All services are now integrated and ready to use!
