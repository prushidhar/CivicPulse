from sqlalchemy import create_engine
import urllib.parse
from sqlalchemy.engine.url import URL

password = r"fb\-GikaFS~.=7[l"
print(f"Password raw: {password}")

encoded_password = urllib.parse.quote_plus(password)
print(f"Encoded password: {encoded_password}")

# Try connecting
engine_url = f"postgresql://postgres:{encoded_password}@34.9.198.190:5432/postgres"
engine = create_engine(engine_url)

try:
    with engine.connect() as conn:
        print("SUCCESS! Connected via URL.")
except Exception as e:
    print(f"FAILED via URL: {e}")
