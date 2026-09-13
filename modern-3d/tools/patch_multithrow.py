from pathlib import Path

p = Path('src/game.js')
s = p.read_text(encoding='utf-8')


def between(text, start, end, replacement):
    a = text.find(start)
    if a < 0:
        raise SystemExit(f'start marker not found: {start}')
    b = text.find(end, a)
    if b < 0:
        raise SystemExit(f'end marker not found: {end}')
    return text[:a] + replacement + text[b:]


def snippet(name):
    return Path('tools/snippets', name).read_text(encoding='utf-8')


old = "  const ScenarioCfg = window.X2ChukoScenarioConfig;\n"
new = "  const ScenarioCfg = window.X2AltynScenarioConfig || window.X2ChukoScenarioConfig;\n  const AltynScenarioController = window.X2AltynScenarioController;\n"
if old not in s:
    raise SystemExit('ScenarioCfg marker missing')
s = s.replace(old, new, 1)

marker = "  // v0.13.20: dynamic round objects are created once and reused on every reset.\n"
if marker not in s:
    raise SystemExit('runtime marker missing')
s = s.replace(marker, snippet('runtime-state.txt') + marker, 1)

s = between(s, "  function prepareScenarioRuntime(ticket) {", "  function tr(key) {", snippet('scenario-runtime.txt'))
s = between(s, "  function renderScore() {", "  // --- Autoplay (ported from CHUKO v20.61) -----------------------------", snippet('score-payout.txt'))
s = between(s, "  function validateFinalScenarioVisual(plan=scenarioRuntime.plan) {", "  function deterministicLandingRotation(seed, index, isKhan=false) {", snippet('vv.txt'))
s = between(s, "  function computePhysicalResult() {", "  function freezeItemAtCurrentPosition(item) {", snippet('physical-result.txt'))
s = between(
    s,
    "  function showGameResult() {",
    "  async function refreshBalance() {",
    snippet('round-state.txt') + snippet('round-reset.txt') + snippet('round-resolve.txt') + snippet('round-final.txt')
)

# Adapt the inherited Chuko landing planner instead of replacing the proven geometry.
landing_start = s.find("  function prepareScenarioLandingPlan(tp) {")
landing_end = s.find("  function startScenarioScatter() {", landing_start)
if landing_start < 0 or landing_end < 0:
    raise SystemExit('landing planner markers missing')
landing = s[landing_start:landing_end]

old_scored = """    const scored = roundPool.chukos.map((item,index)=>({
      index,
      item,
      score: Math.hypot(
        (item?.mesh?.position?.x || 0) - tp.x,
        (item?.mesh?.position?.z || 0) - tp.z
      ) + rng()*0.018
    })).sort((a,b)=>a.score-b.score);"""
new_scored = """    const scored = roundPool.chukos.map((item,index)=>({
      index,
      item,
      score: Math.hypot(
        (item?.mesh?.position?.x || 0) - tp.x,
        (item?.mesh?.position?.z || 0) - tp.z
      ) + rng()*0.018
    })).filter(v => !altynRound.outIds.has(v.index)).sort((a,b)=>a.score-b.score);"""
if old_scored not in landing:
    raise SystemExit('landing scored block missing')
landing = landing.replace(old_scored, new_scored, 1)

old_inside = """    const insideIds = [...Array(C.pile.chukoCount).keys()]
      .filter(i=>!scenarioRuntime.targetIds.has(i));"""
new_inside = """    const insideIds = [...Array(C.pile.chukoCount).keys()]
      .filter(i=>!scenarioRuntime.targetIds.has(i) && !altynRound.outIds.has(i));"""
if old_inside not in landing:
    raise SystemExit('insideIds block missing')
landing = landing.replace(old_inside, new_inside, 1)

khan_comment = "    // KHAN: inside unless FIVE_KHAN. Keep it separated from chükö too.\n"
kp = landing.find(khan_comment)
if kp < 0:
    raise SystemExit('KHAN landing marker missing')
if_pos = landing.find("    if (roundPool.khan?.mesh) {", kp)
if if_pos < 0:
    raise SystemExit('KHAN landing if missing')
old_if = "    if (roundPool.khan?.mesh) {"
new_if = "    if (roundPool.khan?.mesh && (plan.khan || !altynRound.active)) {"
landing = landing[:if_pos] + landing[if_pos:].replace(old_if, new_if, 1)
s = s[:landing_start] + landing + s[landing_end:]

old_timer = """    resetTimer = window.setTimeout(() => {
      throwState.active = false;
      showGameResult();
      setHint('hintResultLocked');
    }, C.throw.settleMs);"""
new_timer = """    resetTimer = window.setTimeout(() => {
      resolveCurrentAltynThrow();
    }, C.throw.settleMs);"""
if old_timer not in s:
    raise SystemExit('settle timer marker missing')
s = s.replace(old_timer, new_timer, 1)

old_positions = "    positions.forEach(([px, pz], i) => {"
if old_positions not in s:
    raise SystemExit('positions loop missing')
s = s.replace(old_positions, "    positions.slice(0, C.pile.chukoCount).forEach(([px, pz], i) => {", 1)

snap_start = s.find("  function snapLandingPointToNearestChuko(point) {")
needle = "    roundPool.chukos.forEach((item, index) => {\n      if (!item?.mesh) return;\n"
pos = s.find(needle, snap_start)
if snap_start < 0 or pos < 0:
    raise SystemExit('snap loop missing')
repl = "    roundPool.chukos.forEach((item, index) => {\n      if (!item?.mesh) return;\n      if (altynRound.active && altynRound.outIds.has(index)) return;\n"
s = s[:pos] + repl + s[pos+len(needle):]

old_ready = "      case 'ready': label = tr('makeThrow'); break;"
new_ready = "      case 'ready': { const step=currentAltynThrow(); label = step ? `${tr('makeThrow')} ${step.index}/${altynRound.plan.throws.length}` : tr('makeThrow'); break; }"
if old_ready not in s:
    raise SystemExit('ready case missing')
s = s.replace(old_ready, new_ready, 1)
s = s.replace("console.info('[CHUKO] scenario set'", "console.info('[ALTYN] scenario set'", 1)

p.write_text(s, encoding='utf-8')

p = Path('index.html')
s = p.read_text(encoding='utf-8').replace('0.1.0', '0.2.0')
s = s.replace('ALTYN KHAN v0.2.0 · Babylon.js 9.25 + Havok · base CHUKO v9', 'ALTYN KHAN v0.2.0 · 3-throw controller · Babylon.js 9.25 + Havok')
p.write_text(s, encoding='utf-8')

p = Path('src/config.js')
s = p.read_text(encoding='utf-8').replace("version: '0.1.0'", "version: '0.2.0'", 1)
p.write_text(s, encoding='utf-8')

Path('BUILD.txt').write_text(
    'ALTYN KHAN Modern 3D build: 0.2.0\n'
    'Base: CHUKO Modern 3D v9 / 0.13.21\n'
    'Stage: multi-throw Round Controller (1..3 throws per LMS ticket)\n'
    'Scenario source: ALTYN KHAN 1..9\n'
    'Financial result source: LMS authoritative\n',
    encoding='utf-8'
)
print('patched')
