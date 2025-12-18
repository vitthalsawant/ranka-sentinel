# -*- coding: utf-8 -*-
"""
Unified Security Services Starter
Starts both gender classification service and people counter API together
"""

import subprocess
import sys
import os
import time
import signal
import threading

# Store process references
processes = []


def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n[INFO] Stopping all services...")
    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except:
            try:
                process.kill()
            except:
                pass
    print("[INFO] All services stopped.")
    sys.exit(0)


def start_gender_classification_service():
    """Start the gender classification service"""
    print("[INFO] Starting Gender Classification Service...")
    try:
        process = subprocess.Popen(
            [sys.executable, "gender_classification_service.py"],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        processes.append(process)
        
        # Print output in real-time
        def print_output():
            for line in iter(process.stdout.readline, ''):
                if line:
                    print(f"[GENDER] {line.strip()}")
        
        thread = threading.Thread(target=print_output, daemon=True)
        thread.start()
        
        return process
    except Exception as e:
        print(f"[ERROR] Failed to start gender classification service: {e}")
        return None


def start_people_counter():
    """Start the people counter API"""
    print("[INFO] Starting People Counter API...")
    try:
        process = subprocess.Popen(
            [sys.executable, "people_counter_api.py"],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        processes.append(process)
        
        # Print output in real-time
        def print_output():
            for line in iter(process.stdout.readline, ''):
                if line:
                    print(f"[PEOPLE] {line.strip()}")
        
        thread = threading.Thread(target=print_output, daemon=True)
        thread.start()
        
        return process
    except Exception as e:
        print(f"[ERROR] Failed to start people counter: {e}")
        return None


def check_api_server():
    """Check if API server is running"""
    import requests
    try:
        response = requests.get("http://localhost:5000/api/status", timeout=2)
        return response.status_code == 200
    except:
        return False


def main():
    """Main function"""
    print("=" * 60)
    print("Security Services Starter")
    print("=" * 60)
    print("\n[INFO] This script will start:")
    print("  1. Gender Classification Service (headless, auto-starts camera)")
    print("  2. People Counter API (auto-starts camera)")
    print("\n[INFO] Make sure the API server is running:")
    print("  python api_server.py")
    print("\n[WARNING] Both services will use camera index 0.")
    print("[WARNING] If you have multiple cameras, you can modify the camera index in each script.")
    print("=" * 60 + "\n")
    
    # Check if API server is running
    if not check_api_server():
        print("[WARNING] API server doesn't seem to be running!")
        print("[WARNING] Please start it first: python api_server.py")
        print("\n[INFO] Starting API server check...")
        response = input("Continue anyway? (y/n): ").strip().lower()
        if response != 'y':
            print("[INFO] Exiting...")
            return
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("\n[INFO] Starting services...")
    
    # Start services - both will try to use camera 0
    # Note: They may conflict if camera doesn't support multiple simultaneous access
    # In that case, consider using different camera indices or combining into one service
    gender_process = start_gender_classification_service()
    time.sleep(3)  # Give gender service time to initialize camera
    
    people_process = start_people_counter()
    time.sleep(3)  # Give people counter time to initialize
    
    if not gender_process or not people_process:
        print("[ERROR] Failed to start one or more services!")
        signal_handler(None, None)
        return
    
    print("\n" + "=" * 60)
    print("[INFO] All services started successfully!")
    print("[INFO] Services are running and sending data to the Security Dashboard")
    print("[INFO] Open the dashboard at http://localhost:8080 to view results")
    print("[INFO] Press Ctrl+C to stop all services")
    print("=" * 60 + "\n")
    
    # Monitor processes
    try:
        while True:
            # Check if processes are still running
            if gender_process.poll() is not None:
                print("[ERROR] Gender classification service stopped unexpectedly!")
                print(f"[ERROR] Exit code: {gender_process.returncode}")
                break
            
            if people_process.poll() is not None:
                print("[ERROR] People counter stopped unexpectedly!")
                print(f"[ERROR] Exit code: {people_process.returncode}")
                break
            
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    
    signal_handler(None, None)


if __name__ == "__main__":
    main()
