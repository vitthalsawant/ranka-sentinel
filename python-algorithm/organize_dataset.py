# -*- coding: utf-8 -*-
"""
Dataset Organization Script
Organizes the CCTV Gender Classifier Dataset into train/validation/test splits.
"""

import os
import shutil
import random
from pathlib import Path

# Configuration
SOURCE_DIR = 'CCTV Gender Classifier Dataset'
DATASET_DIR = 'dataset'
TRAIN_RATIO = 0.7
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15

# Set random seed for reproducibility
random.seed(42)

def organize_dataset():
    """Organize dataset into train/validation/test splits"""
    print("=" * 60)
    print("Dataset Organization Script")
    print("=" * 60)
    
    # Check if source directory exists
    if not os.path.exists(SOURCE_DIR):
        print(f"[ERROR] Source directory not found: {SOURCE_DIR}")
        return
    
    # Create dataset directory structure
    splits = ['train', 'validation', 'test']
    classes = ['male', 'female']  # Use lowercase for ImageDataGenerator compatibility
    
    # Clear existing dataset if it exists
    if os.path.exists(DATASET_DIR):
        print(f"[INFO] Clearing existing dataset directory: {DATASET_DIR}")
        import shutil
        try:
            shutil.rmtree(DATASET_DIR)
        except:
            pass
    
    for split in splits:
        for class_name in classes:
            dir_path = os.path.join(DATASET_DIR, split, class_name)
            os.makedirs(dir_path, exist_ok=True)
    
    # Process each class
    source_male_dir = os.path.join(SOURCE_DIR, 'MALE')
    source_female_dir = os.path.join(SOURCE_DIR, 'FEMALE')
    
    # Process MALE images
    if os.path.exists(source_male_dir):
        male_images = [f for f in os.listdir(source_male_dir) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"\n[INFO] Found {len(male_images)} MALE images")
        
        # Shuffle and split
        random.shuffle(male_images)
        train_end = int(len(male_images) * TRAIN_RATIO)
        val_end = train_end + int(len(male_images) * VALIDATION_RATIO)
        
        train_images = male_images[:train_end]
        val_images = male_images[train_end:val_end]
        test_images = male_images[val_end:]
        
        # Copy files
        for img in train_images:
            shutil.copy2(os.path.join(source_male_dir, img), 
                        os.path.join(DATASET_DIR, 'train', 'male', img))
        for img in val_images:
            shutil.copy2(os.path.join(source_male_dir, img), 
                        os.path.join(DATASET_DIR, 'validation', 'male', img))
        for img in test_images:
            shutil.copy2(os.path.join(source_male_dir, img), 
                        os.path.join(DATASET_DIR, 'test', 'male', img))
        
        print(f"[INFO] MALE: Train={len(train_images)}, Val={len(val_images)}, Test={len(test_images)}")
    else:
        print(f"[WARNING] MALE directory not found: {source_male_dir}")
    
    # Process FEMALE images
    if os.path.exists(source_female_dir):
        female_images = [f for f in os.listdir(source_female_dir) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"\n[INFO] Found {len(female_images)} FEMALE images")
        
        # Shuffle and split
        random.shuffle(female_images)
        train_end = int(len(female_images) * TRAIN_RATIO)
        val_end = train_end + int(len(female_images) * VALIDATION_RATIO)
        
        train_images = female_images[:train_end]
        val_images = female_images[train_end:val_end]
        test_images = female_images[val_end:]
        
        # Copy files
        for img in train_images:
            shutil.copy2(os.path.join(source_female_dir, img), 
                        os.path.join(DATASET_DIR, 'train', 'female', img))
        for img in val_images:
            shutil.copy2(os.path.join(source_female_dir, img), 
                        os.path.join(DATASET_DIR, 'validation', 'female', img))
        for img in test_images:
            shutil.copy2(os.path.join(source_female_dir, img), 
                        os.path.join(DATASET_DIR, 'test', 'female', img))
        
        print(f"[INFO] FEMALE: Train={len(train_images)}, Val={len(val_images)}, Test={len(test_images)}")
    else:
        print(f"[WARNING] FEMALE directory not found: {source_female_dir}")
    
    print("\n" + "=" * 60)
    print("[INFO] Dataset organization completed!")
    print(f"[INFO] Dataset structure created in: {DATASET_DIR}")
    print("=" * 60)

if __name__ == '__main__':
    organize_dataset()
