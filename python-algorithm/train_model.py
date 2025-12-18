# -*- coding: utf-8 -*-
"""
Model Training Script - Memory Efficient Version
Trains a ResNet50-based gender classification model using generators
"""

import os
import random
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

# Configure TensorFlow to use memory growth and limit memory allocation
import tensorflow as tf

# Limit TensorFlow memory usage
try:
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("[INFO] GPU memory growth enabled")
except:
    pass

# Set memory limit for CPU operations to prevent memory errors
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
# Disable oneDNN optimizations that can cause memory issues
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.layers import Dense, AveragePooling2D, Flatten, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.models import Model, load_model

from sklearn.metrics import classification_report
import config
import gc  # For garbage collection


def create_resnet50_model(input_shape, learning_rate, epochs):
    """
    Create a ResNet50-based model for gender classification
    
    Args:
        input_shape (tuple): Input shape (height, width, channels)
        learning_rate (float): Learning rate for optimizer
        epochs (int): Number of epochs
    
    Returns:
        tuple: (model, callback, epochs)
    """
    basemodel = ResNet50(include_top=False, input_shape=input_shape, weights='imagenet')
    headmodel = basemodel.output
    headmodel = AveragePooling2D(pool_size=(3, 3))(headmodel)
    
    headmodel = Flatten(name="flatten")(headmodel)
    headmodel = Dense(512, activation="relu")(headmodel)
    headmodel = Dropout(0.3)(headmodel)
    headmodel = Dense(256, activation="relu")(headmodel)
    headmodel = Dropout(0.3)(headmodel)
    headmodel = Dense(128, activation="relu")(headmodel)
    headmodel = Dropout(0.3)(headmodel)
    headmodel = Dense(64, activation="relu")(headmodel)
    headmodel = Dense(2, activation='softmax')(headmodel)
    
    model = Model(inputs=basemodel.input, outputs=headmodel)
    
    # Freeze base model layers
    for layer in basemodel.layers:
        layer.trainable = False
    
    opt = Adam(learning_rate=learning_rate)
    model.compile(loss="binary_crossentropy", optimizer=opt, metrics=["accuracy"])
    callback = EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True)
    
    return model, callback, epochs


def plot_training_history(history, output_dir):
    """
    Plot training history (accuracy and loss)
    """
    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train')
    plt.plot(history.history['val_accuracy'], label='Validation')
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend(loc='upper left')
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train')
    plt.plot(history.history['val_loss'], label='Validation')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(loc='upper left')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'model_training_history.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print(f"[INFO] Training history plots saved")


def train_model_with_generators():
    """
    Train model using ImageDataGenerator (memory efficient - loads images on-demand)
    """
    print("=" * 60)
    print("Gender Classification Model Training (Memory Efficient)")
    print("=" * 60)
    
    # Check if organized dataset exists, if not, create it
    dataset_dir = os.path.join(config.BASE_DIR, 'dataset')
    if not os.path.exists(dataset_dir) or not os.path.exists(os.path.join(dataset_dir, 'train')):
        print("\n[INFO] Organized dataset not found. Creating train/val/test splits...")
        print("[INFO] This will organize the dataset into separate folders...")
        
        # Import and run organize_dataset
        from organize_dataset import organize_dataset
        organize_dataset()
        
        if not os.path.exists(dataset_dir):
            print("[ERROR] Failed to create organized dataset!")
            return None
    
    # Paths for organized dataset
    train_dir = os.path.join(dataset_dir, 'train')
    val_dir = os.path.join(dataset_dir, 'validation')
    test_dir = os.path.join(dataset_dir, 'test')
    
    # Check if directories exist
    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        print("[ERROR] Organized dataset directories not found!")
        print(f"[ERROR] Expected: {train_dir}, {val_dir}")
        return None
    
    print(f"\n[INFO] Using organized dataset from: {dataset_dir}")
    
    # Create data generators (loads images on-demand from disk)
    print("\n[INFO] Creating data generators...")
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1
    )
    
    # No augmentation for validation/test
    val_test_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input
    )
    
    # Batch size - use small batches for memory efficiency
    batch_size = 8  # Small batch size to avoid memory errors
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=config.IMAGE_SIZE,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=True,
        color_mode='rgb'
    )
    
    val_generator = val_test_datagen.flow_from_directory(
        val_dir,
        target_size=config.IMAGE_SIZE,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False,
        color_mode='rgb'
    )
    
    test_generator = val_test_datagen.flow_from_directory(
        test_dir,
        target_size=config.IMAGE_SIZE,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False,
        color_mode='rgb'
    )
    
    print(f"\n[INFO] Training samples: {train_generator.samples}")
    print(f"[INFO] Validation samples: {val_generator.samples}")
    print(f"[INFO] Test samples: {test_generator.samples}")
    print(f"[INFO] Batch size: {batch_size}")
    
    # Print class indices mapping (important for predictions!)
    print(f"\n[INFO] Class indices mapping (from generator):")
    print(f"  {train_generator.class_indices}")
    print(f"[INFO] IMPORTANT: Generator assigns classes alphabetically:")
    print(f"  - female = 0")
    print(f"  - male = 1")
    print(f"[INFO] This matches config: INT2LABELS = {config.INT2LABELS}")
    
    # Create model
    print("\n[INFO] Creating ResNet50 model...")
    input_shape = (*config.IMAGE_SIZE, 3)
    model, callback, epochs = create_resnet50_model(
        input_shape=input_shape,
        learning_rate=config.LEARNING_RATE,
        epochs=config.EPOCHS
    )
    
    print("\n[INFO] Model architecture:")
    model.summary()
    
    # Set steps per epoch to 400 as requested
    steps_per_epoch = 400
    # Calculate validation steps (use reasonable number)
    validation_steps = min(100, val_generator.samples // batch_size)
    
    print(f"\n[INFO] Steps per epoch: {steps_per_epoch} (fixed)")
    print(f"[INFO] Validation steps: {validation_steps}")
    print(f"[INFO] Total training samples available: {train_generator.samples}")
    print(f"[INFO] Samples per epoch: {steps_per_epoch * batch_size} (will cycle through dataset)")
    
    # Train model
    print(f"\n[INFO] Training model for {epochs} epochs...")
    print("[INFO] Using generators - images loaded on-demand (memory efficient)")
    print(f"[INFO] Each epoch will process {steps_per_epoch} batches ({steps_per_epoch * batch_size} samples)")
    
    # Model checkpoint to save best model
    checkpoint = ModelCheckpoint(
        config.MODEL_PATH,
        monitor='val_loss',
        save_best_only=True,
        verbose=1
    )
    
    try:
        history = model.fit(
            train_generator,
            steps_per_epoch=steps_per_epoch,
            epochs=epochs,
            validation_data=val_generator,
            validation_steps=validation_steps,
            callbacks=[callback, checkpoint],
            verbose=1
        )
    except Exception as e:
        print(f"\n[ERROR] Training error: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    # Plot training history
    print("\n[INFO] Generating training history plots...")
    plot_training_history(history, config.OUTPUT_DIR)
    
    # Evaluate on test set
    print("\n[INFO] Evaluating model on test set...")
    test_steps = min(100, test_generator.samples // batch_size)  # Limit test steps for efficiency
    
    scores = model.evaluate(test_generator, steps=test_steps, verbose=1)
    print(f"[INFO] Test Loss: {scores[0]:.4f}")
    print(f"[INFO] Test Accuracy: {scores[1]:.4f}")
    
    # Generate classification report
    print("\n[INFO] Generating classification report...")
    test_generator.reset()
    predictions = model.predict(test_generator, steps=test_steps, verbose=0)
    predicted_classes = np.argmax(predictions, axis=1)
    
    # Get true labels
    true_classes = []
    test_generator.reset()
    for i in range(test_steps):
        _, labels = next(test_generator)
        true_classes.extend(np.argmax(labels, axis=1))
    
    true_classes = np.array(true_classes[:len(predicted_classes)])
    
    # Map class indices to names (generator uses alphabetical: female=0, male=1)
    class_names_mapped = ['FEMALE', 'MALE']  # Match generator's alphabetical order
    
    print("\n[INFO] Classification Report:")
    print(classification_report(true_classes, predicted_classes, target_names=class_names_mapped))
    
    # Save model
    print(f"\n[INFO] Saving model to {config.MODEL_PATH}...")
    model.save(config.MODEL_PATH)
    print("[INFO] Model saved successfully!")
    
    print("\n" + "=" * 60)
    print("[INFO] Training completed!")
    print("=" * 60)
    
    return model


def train_model():
    """
    Main function - uses generator-based training for memory efficiency
    """
    return train_model_with_generators()


if __name__ == '__main__':
    train_model()
