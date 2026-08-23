filepath = "citizen-dashboard/src/app/report/page.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("<Map\n", "<Map\n                style={{ width: \"100%\", height: \"100%\" }}\n")
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
