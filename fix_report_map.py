import re

filepath = "citizen-dashboard/src/app/report/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace import
content = content.replace("AdvancedMarker", "Marker")

# 2. Remove mapId
content = re.sub(r'mapId="[^"]+"\s*', '', content)

# 3. Rename AdvancedMarker tag to Marker
content = content.replace("<AdvancedMarker", "<Marker")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
