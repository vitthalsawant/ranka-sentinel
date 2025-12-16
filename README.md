# Datamorphosis ML Project

A real-time person counting and analytics dashboard powered by YOLOv8 and React. This project provides live camera feeds, visitor analytics, heatmaps, and detection settings through an intuitive web interface.

## 🚀 Quick Start Guide

The dashboard preview may show "Failed to fetch" errors initially - this is expected until the Python server is running.

### Step 1: Download Python Files

1. Click on the **Code** tab (top-left in GitHub)
2. Download the `python-algorithm` folder to your computer

### Step 2: Run the Python API Server

Open a terminal on your machine:

```bash
cd python-algorithm
pip install -r requirements.txt
python api_server.py
```

The API server will start on `http://localhost:5000`

### Step 3: View Results

- The dashboard preview will automatically connect to your local Python server
- You'll see the "Python API not connected" message change to "Connected"
- Navigate to **Detection Settings** to see live person counting stats

### Step 4: Run YOLOv8 Detection (Optional)

In another terminal:

```bash
cd python-algorithm
python people_counter_api.py
```

This activates your camera and sends live counts to the dashboard.

**Note:** The Python API must run on YOUR local machine (localhost:5000) - the preview connects to it.

## 📊 Where to See Results

| Page | What You See |
|------|-------------|
| **Customer Dashboard** (`/customer`) | Total visitors, detections, camera status |
| **Detection Settings** | Person counting stats, sensitivity controls |
| **Analytics** | Visitor charts and trends |
| **Heatmaps** | Zone traffic data |

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **Webcam** (for live video detection)

## 🏗️ Project Structure

```
Datamorphosis_ML_Project/
├── src/                    # React frontend (TypeScript + Vite)
│   ├── pages/             # Dashboard pages
│   ├── components/        # React components
│   └── hooks/            # Custom hooks (API integration)
└── python-algorithm/      # Python backend
    ├── api_server.py      # Flask API server
    ├── people_counter_api.py  # YOLOv8 detection script
    └── requirements.txt   # Python dependencies
```

## 🛠️ Development Setup

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Backend Development

```bash
cd python-algorithm

# Install Python dependencies
pip install -r requirements.txt

# Start API server
python api_server.py

# Start detection script (in separate terminal)
python people_counter_api.py
```

## 🌐 Access Points

- **Web Dashboard**: http://localhost:8080 (or your configured port)
- **API Server**: http://localhost:5000
- **API Info**: http://localhost:5000/api

## 🔌 API Endpoints

- `GET /api/status` - System status
- `GET /api/analytics` - Visitor analytics
- `GET /api/detections` - Recent detections
- `GET /api/heatmap` - Heatmap data
- `GET /api/video/stream` - Live video stream (MJPEG)
- `GET /api/person-counting` - Person counting data
- `POST /api/person-counting/settings` - Update settings

## ✨ Features

✅ **Live Camera Feeds** - View real-time video streams  
✅ **Person Counting** - AI-powered people detection and counting  
✅ **Analytics Dashboard** - View visitor statistics and analytics  
✅ **Camera Management** - Manage multiple camera feeds  
✅ **Detection Settings** - Configure detection sensitivity and ROI  
✅ **Heatmaps** - Visualize zone traffic patterns  

## 🔧 Troubleshooting

### Port Already in Use

If port 5000 or 8080 is already in use:
- **Flask (5000)**: Change port in `api_server.py`
- **Frontend (8080)**: Change port in `vite.config.ts`

### Camera Not Working

- Make sure your webcam is connected and not being used by another application
- Check camera permissions in your OS settings
- Try changing `camera_index = 0` to `camera_index = 1` in `people_counter_api.py`

### API Connection Issues

- Ensure Flask server is running before starting the frontend
- Check browser console for CORS errors
- Verify API server is accessible at `http://localhost:5000/api/status`
- Make sure the Python API server is running on your local machine

## 📝 Notes

- The Flask API server must be running for the frontend to display live data
- The detection script (`people_counter_api.py`) is optional but required for live video feeds
- Video streaming requires both the API server and detection script to be running
- The dashboard preview connects to your local Python server at `localhost:5000`

## 🛠️ Technologies Used

**Frontend:**
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui

**Backend:**
- Python
- Flask
- YOLOv8
- OpenCV

## 📄 License

This project is part of the Datamorphosis ML Project.
