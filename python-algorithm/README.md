# Python Camera Analysis Algorithm

Place your Python algorithm files in this folder.

## Setup Instructions

### 1. Install Required Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Flask and Flask-CORS for API server
- OpenCV for image processing
- TensorFlow for gender classification model
- Ultralytics for YOLOv8 person detection
- And other dependencies

### 2. Train Gender Classification Model (Optional but Recommended)

The system uses a CNN model for gender classification. To train the model:

```bash
# First, organize the dataset (if not already done)
python organize_dataset.py

# Then train the model
python train_gender_model.py
```

The training script will:
- Load images from `dataset/train/` and `dataset/validation/`
- Train a CNN model with data augmentation
- Save the best model to `models/gender_classifier.h5`
- Evaluate on test set and generate metrics

**Note**: If the model is not trained, the system will fall back to heuristic-based gender classification.

### 3. Run the API Server

```bash
python api_server.py
```

The server will start on `http://localhost:5000`

### 4. Run People Detection and Counting

In a separate terminal:

```bash
python people_counter_api.py
```

This will:
- Load YOLOv8 model for person detection
- Load gender classification model (if available)
- Start camera feed and detection
- Send data to the API server

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get camera and system status |
| `/api/analytics` | GET | Get current analytics data |
| `/api/detections` | GET | Get recent detections |
| `/api/heatmap` | GET | Get heatmap data |

## Integration with Dashboard

The Lovable dashboard will poll these endpoints to display:
- Live camera status
- Visitor analytics (count, gender, age)
- Detection alerts
- Heatmap visualization

## Example Response Format

### /api/analytics
```json
{
  "total_visitors": 1250,
  "male_count": 680,
  "female_count": 570,
  "hourly_data": [...],
  "age_distribution": {...}
}
```

### /api/detections
```json
{
  "detections": [
    {
      "id": "det_001",
      "type": "person_counting",
      "confidence": 0.95,
      "timestamp": "2024-01-15T10:30:00Z",
      "camera": "Main Entrance"
    }
  ]
}
```
