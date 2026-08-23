import os

files = [
    "citizen-dashboard/src/app/page.tsx",
    "citizen-dashboard/src/app/report/page.tsx",
    "government-dashboard/src/pages/Dashboard.tsx",
    "government-dashboard/src/pages/HotspotMap.tsx"
]

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("'AIzaSyDummyKeyForDevelopmentPurposesOnly'", "''")
    content = content.replace('"AIzaSyDummyKeyForDevelopmentPurposesOnly"', "''")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
