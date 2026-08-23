import sys
sys.path.append('.')
from app.ai.classification.gemini_adapter import analyze_media_with_gemini
import logging
import base64
logging.basicConfig(level=logging.INFO)

media_bytes = base64.b64decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAGBAQABAAAAAQ//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAn//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/An//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IX//2Q==')

print('Testing vision...')
res = analyze_media_with_gemini(media_bytes, 'image/jpeg')
print('Result:', res)
