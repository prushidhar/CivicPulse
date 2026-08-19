import time
import requests

print("Waiting for backend to fully start...")
time.sleep(5)

payload = {
    "title": "Massive pothole on main road",
    "description": "There is a massive pothole in the middle of the street near the central park. Cars are swerving to avoid it and it's causing a lot of traffic. Needs immediate repair before someone gets hurt.",
    "latitude": 17.3850, # Example coordinate (Hyderabad)
    "longitude": 78.4867,
    "user_id": "citizen-123",
    "image_url": "https://example.com/pothole.jpg"
}

print("Submitting live citizen request...")
try:
    response = requests.post("http://127.0.0.1:8000/api/v1/requests", json=payload)
    if response.status_code == 200:
        print("Success! Request submitted. Gemini processed the request.")
        print(response.json())
    else:
        print(f"Failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error connecting to backend: {e}")
