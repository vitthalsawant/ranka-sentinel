# -*- coding: utf-8 -*-
"""
Test Gender Prediction Script
Tests the gender classification model on a single image to verify predictions
"""

import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
import config


def preprocess_face(face_roi):
    """Preprocess face ROI for gender classification"""
    face_resized = cv2.resize(face_roi, (config.IMAGE_SIZE[1], config.IMAGE_SIZE[0]))
    face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
    face_array = preprocess_input(face_rgb)
    face_array = np.expand_dims(face_array, axis=0)
    return face_array


def test_gender_prediction(image_path=None):
    """
    Test gender prediction on an image
    
    Args:
        image_path: Path to test image (if None, uses camera)
    """
    print("=" * 60)
    print("Gender Classification Test")
    print("=" * 60)
    
    # Load model
    if not os.path.exists(config.MODEL_PATH):
        print(f"[ERROR] Model not found at {config.MODEL_PATH}")
        print("[INFO] Please train the model first: python train_model.py")
        return
    
    print(f"\n[INFO] Loading model from {config.MODEL_PATH}...")
    model = load_model(config.MODEL_PATH)
    print("[INFO] Model loaded successfully!")
    
    # Load face cascade
    try:
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        if face_cascade.empty():
            raise Exception("Could not load face cascade")
        print("[INFO] Face cascade loaded successfully!")
    except Exception as e:
        print(f"[ERROR] Error loading face cascade: {e}")
        return
    
    print("\n[INFO] Class mapping:")
    print(f"  Index 0 = {config.INT2LABELS[0]} (FEMALE)")
    print(f"  Index 1 = {config.INT2LABELS[1]} (MALE)")
    print("\n[INFO] This matches ImageDataGenerator's alphabetical order:")
    print("  female = 0, male = 1")
    
    if image_path:
        # Test on provided image
        print(f"\n[INFO] Testing on image: {image_path}")
        if not os.path.exists(image_path):
            print(f"[ERROR] Image not found: {image_path}")
            return
        
        frame = cv2.imread(image_path)
        if frame is None:
            print(f"[ERROR] Could not read image: {image_path}")
            return
    else:
        # Test on camera
        print("\n[INFO] Testing on camera feed...")
        print("[INFO] Press SPACE to capture, 'q' to quit")
        
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("[ERROR] Could not open camera!")
            return
        
        while True:
            ret, frame = camera.read()
            if not ret:
                break
            
            # Flip for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Detect faces
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=config.SCALE_FACTOR,
                minNeighbors=config.MIN_NEIGHBORS,
                minSize=config.MIN_FACE_SIZE
            )
            
            # Draw face rectangles
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            cv2.putText(frame, "Press SPACE to test prediction, 'q' to quit", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.imshow('Gender Classification Test', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                camera.release()
                cv2.destroyAllWindows()
                return
            elif key == ord(' '):  # Space bar
                if len(faces) > 0:
                    # Use largest face
                    faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
                    x, y, w, h = faces[0]
                    break
                else:
                    print("[WARNING] No face detected! Try again.")
        
        camera.release()
        cv2.destroyAllWindows()
    
    # Process face
    if len(faces) == 0:
        print("[ERROR] No face detected in image!")
        return
    
    # Use largest face
    faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
    x, y, w, h = faces[0]
    face_roi = frame[y:y+h, x:x+w]
    
    print(f"\n[INFO] Face detected: {w}x{h} pixels")
    
    # Predict gender
    try:
        face_array = preprocess_face(face_roi)
        prediction = model.predict(face_array, verbose=0)
        
        # Get probabilities
        female_prob = prediction[0][0]  # Index 0 = FEMALE
        male_prob = prediction[0][1]    # Index 1 = MALE
        
        gender_idx = np.argmax(prediction[0])
        confidence = prediction[0][gender_idx]
        predicted_gender = config.INT2LABELS[gender_idx]
        
        print("\n" + "=" * 60)
        print("PREDICTION RESULTS")
        print("=" * 60)
        print(f"Female probability: {female_prob:.4f} ({female_prob*100:.2f}%)")
        print(f"Male probability:   {male_prob:.4f} ({male_prob*100:.2f}%)")
        print(f"\nPredicted Gender: {predicted_gender}")
        print(f"Confidence: {confidence:.4f} ({confidence*100:.2f}%)")
        print(f"Prediction Index: {gender_idx}")
        print("=" * 60)
        
        if gender_idx == 0:
            print("\n[INFO] Model predicts: FEMALE (index 0)")
        else:
            print("\n[INFO] Model predicts: MALE (index 1)")
        
        # Verify mapping
        print("\n[INFO] Class mapping verification:")
        print(f"  config.INT2LABELS[0] = {config.INT2LABELS[0]}")
        print(f"  config.INT2LABELS[1] = {config.INT2LABELS[1]}")
        
    except Exception as e:
        print(f"[ERROR] Error in prediction: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        # Test on provided image
        test_gender_prediction(sys.argv[1])
    else:
        # Test on camera
        test_gender_prediction()
