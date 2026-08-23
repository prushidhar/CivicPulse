files = [
    "citizen-dashboard/src/app/page.tsx",
    "government-dashboard/src/pages/Dashboard.tsx",
    "government-dashboard/src/pages/HotspotMap.tsx"
]

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("> />", " />")
    content = content.replace(">>", ">")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
