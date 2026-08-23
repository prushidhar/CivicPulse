import re
import os

files = [
    "citizen-dashboard/src/app/page.tsx",
    "government-dashboard/src/pages/Dashboard.tsx",
    "government-dashboard/src/pages/HotspotMap.tsx"
]

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Import Marker instead of AdvancedMarker
    content = content.replace("AdvancedMarker", "Marker")
    
    # 2. Remove mapId from Map
    content = re.sub(r'mapId="[^"]+"\s*', '', content)
    
    # 3. Strip HTML children from Marker and replace with standard Marker props
    # Since Marker doesn't support children, we must convert:
    # <Marker ...> <div...></div> </Marker> 
    # to <Marker ... />
    content = re.sub(r'(<Marker[^>]+position=\{[^}]+\})([^>]*>)\s*<div[^>]*>.*?</Marker>', r'\1\2 />', content, flags=re.DOTALL)
    
    # Wait, HotspotMap.tsx has nested divs inside Marker!
    # Let's just do a greedy replacement:
    content = re.sub(r'(<Marker[^>]*position=\{[^}]+\}[^>]*)>.*?</Marker>', r'\1 />', content, flags=re.DOTALL)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
