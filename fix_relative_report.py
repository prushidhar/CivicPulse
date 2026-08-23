filepath = "citizen-dashboard/src/app/report/page.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('className="relative w-full h-[300px] bg-muted/20 rounded-2xl overflow-hidden border border-border/50"', 'className="relative w-full h-[300px] bg-muted/20 rounded-2xl overflow-hidden border border-border/50 relative"')
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
