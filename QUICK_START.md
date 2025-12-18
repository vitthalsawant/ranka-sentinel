# Quick Start Guide

## 🚀 Get Started in 5 Steps

### Step 1: Install Dependencies

```bash
cd python-algorithm
pip install -r requirements.txt
```

### Step 2: Train Gender Model (First Time Only)

```bash
python train_model.py
```

⏱️ Takes 10-30 minutes. Creates `models/GenderClassification.h5`

### Step 3: Start API Server

**Terminal 1:**
```bash
cd python-algorithm
python api_server.py
```

✅ Server running on `http://localhost:5000`

### Step 4: Start Detection Service

**Terminal 2:**
```bash
cd python-algorithm
python people_counter_api.py
```

✅ Camera starts automatically  
✅ Detection begins (after ROI is configured)

### Step 5: Open Dashboard

**Terminal 3:**
```bash
npm install  # First time only
npm run dev
```

✅ Dashboard at `http://localhost:8080`

## 📋 Configure ROI

1. Open dashboard: `http://localhost:8080`
2. Go to **Detection Settings**
3. Draw ROI rectangle on video
4. Click **Save Settings**
5. Detection starts automatically!

## ✅ What You'll See

- **Security Dashboard**: Total visitors, gender stats, live video
- **Detection Settings**: People count, ROI configuration
- **Analytics**: Charts and trends

## 🛑 Stop Services

Press `Ctrl+C` in each terminal

## ❓ Troubleshooting

**Model not found?**
```bash
python train_model.py
```

**Camera not working?**
- Check camera permissions
- Try camera index 1 instead of 0

**API not connecting?**
- Make sure API server is running first
- Check `http://localhost:5000/api/status`

## 📚 Full Documentation

- `README.md` - Complete guide
- `python-algorithm/README_SECURITY_SERVICES.md` - Service details
