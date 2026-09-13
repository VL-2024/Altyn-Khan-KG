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
if old not in s: raise SystemExit('ScenarioCfg marker missing')
s = s.replace(old, new, 1)

marker = "  // v0.13.20: dynamic round objects are created once and reused on every reset.\n"
if marker not in s: raise SystemExit('runtime marker missing')
s = s.replace(marker, snippet('runtime-state.txt') + marker, 1)

s = between(s, "  function prepareScenarioRuntime(ticket) {", "  function tr(key) {", snippet('scenario-runtime.txt'))
s = between(s, "  function renderScore() {", "  // --- Autoplay (ported from CHUKO v20.61) -----------------------------", snippet('score-payout.txt'))
s = between(s, "  function validateFinalScenarioVisual(plan=scenarioRuntime.plan) {", "  function deterministicLandingRotation(seed, index, isKhan=false) {", snippet('visual-validation.txt'))
s = between(s, "  function prepareScenarioLandingPlan(tp) {", "  function startScenarioScatter() {", snippet('landing-plan.txt'))
s = between(s, "  function computePhysicalResult() {", "  function freezeItemAtCurrentPosition(item) {", snippet('physical-result.txt'))
s = between(s, "  function showGameResult() {", "  async function refreshBalance() {", snippet('round-resolution.txt'))

old_timer = """    resetTimer = window.setTimeout(() => {\n      throwState.active = false;\n      showGameResult();\n      setHint('hintResultLocked');\n    }, C.throw.settleMs);"""
new_timer = """    resetTimer = window.setTimeout(() => {\n      resolveCurrentAltynThrow();\n    }, C.throw.settleMs);"""
if old_timer not in s: raise SystemExit('settle timer marker missing')
s = s.replace(old_timer, new_timer, 1)

old_positions = "    positions.forEach(([px, pz], i) => {"
if old_positions not in s: raise SystemExit('positions loop missing')
s = s.replace(old_positions, "    positions.slice(0, C.pile.chukoCount).forEach(([px, pz], i) => {", 1)

snap_start = s.find("  function snapLandingPointToNearestChuko(point) {")
needle = "    roundPool.chukos.forEach((item, index) => {\n      if (!item?.mesh) return;\n"
pos = s.find(needle, snap_start)
if snap_start < 0 or pos < 0: raise SystemExit('snap loop missing')
repl = "    roundPool.chukos.forEach((item, index) => {\n      if (!item?.mesh) return;\n      if (altynRound.active && altynRound.outIds.has(index)) return;\n"
s = s[:pos] + repl + s[pos+len(needle):]

old_ready = "      case 'ready': label = tr('makeThrow'); break;"
new_ready = "      case 'ready': { const step=currentAltynThrow(); label = step ? `${tr('makeThrow')} ${step.index}/${altynRound.plan.throws.length}` : tr('makeThrow'); break; }"
if old_ready not in s: raise SystemExit('ready case missing')
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

Path('BUILD.txt').write_text('ALTYN KHAN Modern 3D build: 0.2.0\nBase: CHUKO Modern 3D v9 / 0.13.21\nStage: multi-throw Round Controller (1..3 throws per LMS ticket)\nScenario source: ALTYN KHAN 1..9\nFinancial result source: LMS authoritative\n', encoding='utf-8')
print('patched')
