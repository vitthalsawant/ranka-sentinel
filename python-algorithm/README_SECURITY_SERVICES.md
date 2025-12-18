# Security Services Integration Guide

This guide explains how to run the integrated security services that connect to the Security Dashboard.

## Overview

The security system consists of two main components:

1. **API Server** (`api_server.py`) - Flask API server that provides endpoints for the dashboard
2. **Unified Detection Service** (`people_counter_api.py`) - Combined YOLOv8 person detection + Gender classification service

## Quick Start

### Step 1: Train Gender Classification Model (First Time Only)

Before running the detection service, train the gender classification model:

```bash
python train_model.py
```

This creates `models/GenderClassification.h5` which is required for gender classification.

### Step 2: Start the API Server

In one terminal:

```bash
python api_server.py
```

The API server will start on `http://localhost:5000`

### Step 3: Start the Unified Detection Service

In another terminal:

```bash
python people_counter_api.py
```

This unified service will:
- ✅ Load YOLOv8 model for person detection
- ✅ Load gender classification model
- ✅ Open camera automatically (no GUI windows)
- ✅ Detect and count people in ROI
- ✅ Classify gender for detected people
- ✅ Send both counts to API server
- ✅ Stream video to web dashboard

**Press Ctrl+C to stop the service**

## Service Details

### Unified Detection Service

- **File**: `people_counter_api.py`
- **Type**: Headless (no GUI)
- **Auto-start**: Yes, camera starts automatically
- **Features**:
  - YOLOv8-based person detection
  - Gender classification using trained ResNet50 model
  - ROI (Region of Interest) configuration from dashboard
  - Tracks people entering/exiting ROI
  - Tracks gender counts (male/female)
  - Sends all data to API server
  - Video streaming to dashboard

**API Endpoints Used:**
- `POST /api/internal/update-count` - Update people counts
- `POST /api/gender-classification/update` - Update gender counts
- `POST /api/internal/update-frame` - Stream video frames

### API Server

- **File**: `api_server.py`
- **Port**: 5000
- **Purpose**: Central API server for dashboard communication

**Endpoints:**
- `GET /api/analytics` - Get all analytics including gender and people counts
- `GET /api/gender-classification` - Get gender classification data
- `GET /api/person-counting` - Get people counting data
- `POST /api/gender-classification/update` - Update gender counts
- `POST /api/internal/update-count` - Update people counts

## Dashboard Integration

The Security Dashboard automatically connects to the API server and displays:

1. **Gender Statistics**:
   - Male count
   - Female count
   - Total count

2. **People Counting**:
   - Total people counted
   - Current occupancy in ROI
   - Entry/exit statistics

3. **Live Video Stream**:
   - Real-time camera feed
   - Detection overlays
   - Gender labels on detected people

## How It Works

### Detection Flow

1. **Person Detection**:
   - YOLOv8 detects people in the configured ROI
   - Tracks unique people using center point tracking
   - Counts new entries

2. **Gender Classification**:
   - For each detected person, extracts face region
   - Uses Haar Cascade for face detection
   - Classifies gender using trained ResNet50 model
   - Tracks gender counts separately

3. **Data Transmission**:
   - Sends people count every 10 frames
   - Sends gender counts every 10 frames
   - Streams video frames continuously
   - All data goes to web dashboard

## Configuration

### Camera Settings

Default camera index is 0. To change:

Edit `people_counter_api.py`:
```python
camera_index = 0  # Change to desired index (1, 2, etc.)
```

### API Server URL

Default: `http://localhost:5000`

To change, edit `API_BASE_URL` in `people_counter_api.py`:
```python
API_BASE_URL = "http://localhost:5000"  # Change if needed
```

### Model Paths

Edit `config.py` to change:
- Model path: `MODEL_PATH`
- Image size: `IMAGE_SIZE`
- Face detection settings
- Tracking parameters

## Troubleshooting

### Camera Not Opening

- Check if camera is available: `python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"`
- Try different camera indices (0, 1, 2, etc.)
- Ensure no other application is using the camera
- Check camera permissions in OS settings

### API Server Not Responding

- Check if API server is running: `curl http://localhost:5000/api/status`
- Ensure port 5000 is not in use by another application
- Check firewall settings
- Verify Flask is installed: `pip install flask flask-cors`

### Services Not Connecting

- Verify API server is running first
- Check network connectivity
- Review error messages in console output
- Ensure all dependencies are installed

### Model Not Found

**Gender Classification Model:**
```bash
# Train the model first
python train_model.py
```

Ensure `models/GenderClassification.h5` exists after training.

**YOLOv8 Model:**
- Downloads automatically on first run
- Requires internet connection
- Check your internet connection if download fails

### ROI Not Working

1. Go to Detection Settings in dashboard
2. Draw ROI rectangle on video feed
3. Click Save Settings
4. Wait a few seconds for detection to start
5. You should see detection overlays appear

### Gender Classification Not Working

- Ensure model is trained: `python train_model.py`
- Check `models/GenderClassification.h5` exists
- Verify face cascade loads (check console output)
- Ensure faces are visible in ROI region

## Stopping Services

### Detection Service

Press `Ctrl+C` in the terminal running `people_counter_api.py`

### API Server

Press `Ctrl+C` in the terminal running `api_server.py`

### All Services

Close terminal windows or:
- Windows: `taskkill /F /IM python.exe`
- Linux/Mac: `pkill -f python`

## Complete Workflow

1. **Start API Server**:
   ```bash
   python api_server.py
   ```

2. **Start Detection Service**:
   ```bash
   python people_counter_api.py
   ```

3. **Open Dashboard**:
   - Navigate to `http://localhost:8080`
   - Go to Detection Settings
   - Configure ROI region
   - View live detection!

4. **Monitor Results**:
   - Security Dashboard shows all statistics
   - Live video stream with detections
   - Gender counts update in real-time
   - People counts update in real-time

## Notes

- ✅ **Single Camera**: One camera used for both services
- ✅ **Headless Operation**: No GUI windows, all output in web dashboard
- ✅ **Unified Service**: Both person counting and gender classification in one script
- ✅ **Real-time Updates**: Statistics update every 10 frames
- ✅ **Video Streaming**: Live video feed in dashboard
- ✅ **ROI Configuration**: Set detection region from dashboard
- ✅ **Auto-start**: Camera starts automatically, no user input needed

## Performance Tips

- Use GPU for faster YOLOv8 detection (change `device='cpu'` to `device='cuda'` in code)
- Reduce frame processing rate if CPU usage is high
- Use smaller YOLOv8 model (`yolov8n.pt` instead of `yolov8x.pt`) for faster detection
- Adjust `IMAGE_SIZE` in `config.py` for faster gender classification

## Next Steps

1. Train the model: `python train_model.py`
2. Start API server: `python api_server.py`
3. Start detection: `python people_counter_api.py`
4. Configure ROI in dashboard
5. View live results!

For more details, see:
- `README.md` - Complete project documentation
- `README_GENDER_CLASSIFICATION.md` - Gender classification guide
- `INTEGRATION_GUIDE.md` - Integration details
