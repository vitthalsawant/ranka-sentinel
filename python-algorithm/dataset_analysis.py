# -*- coding: utf-8 -*-
"""
Dataset Analysis Script
Analyzes and visualizes the CCTV Gender Classifier Dataset
"""

import os
import random
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from config import MALE_FOLDER, FEMALE_FOLDER, OUTPUT_DIR, SAMPLE_IMAGES_PATH, DATASET_DISTRIBUTION_PATH


def count_dataset_images():
    """
    Count images in the dataset
    
    Returns:
        tuple: (num_male_images, num_female_images, total_images)
    """
    if not os.path.exists(MALE_FOLDER):
        print(f"[WARNING] MALE folder not found: {MALE_FOLDER}")
        num_male_images = 0
    else:
        num_male_images = len([f for f in os.listdir(MALE_FOLDER) 
                               if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    if not os.path.exists(FEMALE_FOLDER):
        print(f"[WARNING] FEMALE folder not found: {FEMALE_FOLDER}")
        num_female_images = 0
    else:
        num_female_images = len([f for f in os.listdir(FEMALE_FOLDER) 
                                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    total_images = num_male_images + num_female_images
    
    return num_male_images, num_female_images, total_images


def visualize_random_images(male_folder, female_folder, num_images=5, output_path=None):
    """
    Visualize random sample images from the dataset
    
    Args:
        male_folder (str): Path to male images folder
        female_folder (str): Path to female images folder
        num_images (int): Number of images to display per class
        output_path (str): Path to save the visualization
    """
    if output_path is None:
        output_path = SAMPLE_IMAGES_PATH
    
    if not os.path.exists(male_folder) or not os.path.exists(female_folder):
        print(f"[ERROR] One or both folders not found!")
        return
    
    male_images = [f for f in os.listdir(male_folder) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    female_images = [f for f in os.listdir(female_folder) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    if len(male_images) == 0 or len(female_images) == 0:
        print(f"[ERROR] No images found in one or both folders!")
        return
    
    fig, axes = plt.subplots(2, num_images, figsize=(15, 7))
    plt.subplots_adjust(wspace=0.3, hspace=0.3)
    
    for i in range(num_images):
        male_image_path = os.path.join(male_folder, random.choice(male_images))
        female_image_path = os.path.join(female_folder, random.choice(female_images))
        
        try:
            male_img = plt.imread(male_image_path)
            female_img = plt.imread(female_image_path)
            
            axes[0, i].imshow(male_img)
            axes[0, i].axis('off')
            axes[0, i].set_title('Male')
            
            axes[1, i].imshow(female_img)
            axes[1, i].axis('off')
            axes[1, i].set_title('Female')
        except Exception as e:
            print(f"[WARNING] Error loading image: {e}")
            continue
    
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"[INFO] Sample images saved to: {output_path}")


def plot_dataset_distribution(num_male_images, num_female_images, output_path=None):
    """
    Create a bar plot showing the distribution of images in the dataset
    
    Args:
        num_male_images (int): Number of male images
        num_female_images (int): Number of female images
        output_path (str): Path to save the plot
    """
    if output_path is None:
        output_path = DATASET_DISTRIBUTION_PATH
    
    categories = ['Male', 'Female']
    num_images = [num_male_images, num_female_images]
    
    plt.figure(figsize=(8, 6))
    plt.bar(categories, num_images, color=['#2196F3', '#E91E63'])
    plt.xlabel('Category', fontsize=12)
    plt.ylabel('Number of Images', fontsize=12)
    plt.title('Dataset Distribution - Number of Images in Each Category', fontsize=14, fontweight='bold')
    
    # Add value labels on bars
    for i, v in enumerate(num_images):
        plt.text(i, v + 10, str(v), ha='center', va='bottom', fontsize=12, fontweight='bold')
    
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"[INFO] Dataset distribution plot saved to: {output_path}")


def analyze_dataset():
    """
    Main function to analyze the dataset
    """
    print("=" * 60)
    print("Dataset Analysis")
    print("=" * 60)
    
    # Count images
    num_male_images, num_female_images, total_images = count_dataset_images()
    
    print(f"\n[INFO] Dataset Statistics:")
    print(f"  - Male images: {num_male_images}")
    print(f"  - Female images: {num_female_images}")
    print(f"  - Total images: {total_images}")
    
    if total_images == 0:
        print("\n[ERROR] No images found in the dataset!")
        return
    
    # Visualize random images
    print("\n[INFO] Generating sample images visualization...")
    visualize_random_images(MALE_FOLDER, FEMALE_FOLDER)
    
    # Plot distribution
    print("\n[INFO] Generating dataset distribution plot...")
    plot_dataset_distribution(num_male_images, num_female_images)
    
    print("\n" + "=" * 60)
    print("[INFO] Dataset analysis completed!")
    print("=" * 60)


if __name__ == '__main__':
    analyze_dataset()
