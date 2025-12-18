# CCTV Gender Classification Project

This project implements a gender classification system using deep learning for CCTV footage analysis.

## Dataset Statistics

- **FEMALE images**: 1,324
- **MALE images**: 1,446
- **Total images**: 2,770

## Project Structure

```
python-algorithm/
├── config.py                          # Configuration settings
├── dataset_analysis.py                # Dataset visualization and counting
├── train_model.py                     # Model training script
├── live_cctv_app.py                   # GUI application for live detection
├── organize_dataset.py                # Dataset organization script
├── CCTV Gender Classifier Dataset/    # Dataset directory
│   ├── MALE/                          # Male images
│   └── FEMALE/                        # Female images
├── models/                            # Saved models directory
├── outputs/                           # Generated plots and visualizations
└── README_GENDER_CLASSIFICATION.md    # This file
```

## Files Description

### 1. `config.py`
Central configuration file containing:
- Dataset paths
- Model paths
- Training parameters
- Face detection settings
- Tracking parameters

### 2. `dataset_analysis.py`
Script for analyzing and visualizing the dataset:
- Counts images in each class
- Generates sample image visualizations
- Creates dataset distribution plots

**Usage:**
```bash
python dataset_analysis.py
```

### 3. `train_model.py`
Main training script that:
- Loads and preprocesses the dataset
- Creates a ResNet50-based model
- Trains the model with validation
- Evaluates on test set
- Saves the trained model
- Generates training history plots

**Usage:**
```bash
python train_model.py
```

### 4. `live_cctv_app.py`
GUI application for real-time gender classification:
- Live camera feed processing
- Face detection and tracking
- Gender classification
- Statistics display
- Person counting

**Usage:**
```bash
python live_cctv_app.py
```

### 5. `organize_dataset.py`
Script to organize dataset into train/validation/test splits:
- Creates organized directory structure
- Splits data with configurable ratios
- Maintains class balance

**Usage:**
```bash
python organize_dataset.py
```

## Quick Start

1. **Analyze the dataset:**
   ```bash
   python dataset_analysis.py
   ```
   This will show the dataset statistics and generate visualizations.

2. **Train the model:**
   ```bash
   python train_model.py
   ```
   This will train the model and save it to `models/GenderClassification.h5`.

3. **Run the live application:**
   ```bash
   python live_cctv_app.py
   ```
   This will start the GUI application for live gender classification.

## Configuration

Edit `config.py` to customize:
- Dataset paths
- Model parameters (learning rate, epochs, batch size)
- Image size
- Training/test split ratios
- Face detection parameters
- Tracking parameters

## Requirements

Install required packages:
```bash
pip install tensorflow opencv-python matplotlib numpy scikit-learn pillow tkinter
```

## Model Architecture

The model uses:
- **Base**: ResNet50 (pre-trained, frozen)
- **Head**: Custom dense layers with dropout
- **Output**: 2 classes (MALE, FEMALE)
- **Input size**: 200x100 pixels
- **Optimizer**: Adam
- **Loss**: Binary crossentropy

## Output Files

After running the scripts, you'll find:
- `models/GenderClassification.h5` - Trained model
- `outputs/sample_images.png` - Sample dataset images
- `outputs/dataset_distribution.png` - Dataset distribution plot
- `outputs/model_training_history.png` - Training curves
- `outputs/prediction_samples.png` - Test prediction samples

## Notes

- The original file `livecctv_gender_classification - Copy.py` has been split into organized modules
- All paths are now relative and configurable through `config.py`
- The GUI application requires a trained model to function
- Camera access is required for live detection
