content = """<Marker 
                    key={i}
                    position={{ lat: r.latitude, lng: r.longitude }}
                    onClick={() => setSelectedReport(r)}
                  />"""

with open("government-dashboard/src/pages/HotspotMap.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
text = re.sub(r'<Marker\s+key=\{i\}\s+position=\{\{\s*lat:\s*r\.latitude,\s*lng:\s*r\.longitude\s*\}\}\s*onClick=\{[^<]*/>', content, text)

with open("government-dashboard/src/pages/HotspotMap.tsx", "w", encoding="utf-8") as f:
    f.write(text)
