filepath = "citizen-dashboard/src/app/page.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('className="h-[400px] w-full bg-gray-100"', 'className="h-[400px] w-full bg-gray-100 relative"')
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
