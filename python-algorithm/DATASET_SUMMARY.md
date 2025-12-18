# Dataset Summary - CCTV Gender Classifier Dataset

## Gender Count Statistics

### Current Dataset (Updated)
- **MALE images**: 7,744
- **FEMALE images**: 8,903
- **Total images**: 16,647

*Note: Dataset has been expanded for better model training accuracy.*

## Dataset Location

```
python-algorithm/
└── CCTV Gender Classifier Dataset/
    ├── MALE/          (7,744 image files)
    └── FEMALE/        (8,903 image files)
```

## Usage

To view the dataset statistics and generate visualizations, run:

```bash
python dataset_analysis.py
```

This will:
1. Count images in each class
2. Generate sample image visualizations
3. Create dataset distribution plots

Output files will be saved to `outputs/` directory.

## Training Notes

Due to the large dataset size (16,647 images), the training script uses batch loading to avoid memory issues. The model will train efficiently using data generators.
