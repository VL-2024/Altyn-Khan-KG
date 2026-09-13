from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = "if (u.searchParams.get('build') !== '0.4.9') {\n        u.searchParams.set('build','0.4.9');"
new = "if (u.searchParams.get('build') !== '0.5.1') {\n        u.searchParams.set('build','0.5.1');"
if old not in s:
    raise SystemExit('Expected legacy build query 0.4.9 not found')
p.write_text(s.replace(old, new, 1), encoding='utf-8')
