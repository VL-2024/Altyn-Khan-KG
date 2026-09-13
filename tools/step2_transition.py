from pathlib import Path


def replace_between(text: str, start: str, end: str, replacement: str) -> str:
    a = text.find(start)
    if a < 0:
        raise SystemExit(f'start marker not found: {start}')
    b = text.find(end, a)
    if b < 0:
        raise SystemExit(f'end marker not found: {end}')
    return text[:a] + replacement + text[b:]


p = Path('src/game.js')
s = p.read_text(encoding='utf-8')

if 'function transitionToNextAltynThrow()' not in s:
    replacement = r'''  function setAltynThrowHint() {
    if (!ui.hint || !altynRound.active || !altynRound.plan) return;
    const current = Math.min(altynRound.plan.throws.length, altynRound.throwIndex + 1);
    const total = altynRound.plan.throws.length;
    setHint('hintThrowProgress', { current, total });
  }

  function waitMs(ms) {
    return new Promise(resolve => window.setTimeout(resolve, Math.max(0, Number(ms) || 0)));
  }

  function animateSakaReturnToStart(durationMs) {
    return new Promise(resolve => {
      const item = roundPool.saka;
      const mesh = item?.mesh;
      if (!mesh) { resolve(); return; }

      freezeItemAtCurrentPosition(item);
      const from = mesh.position.clone();
      const start = throwStartPoint();
      const to = new BABYLON.Vector3(start.x, start.y, start.z);
      const fromRot = mesh.rotationQuaternion ? mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
      const toRot = BABYLON.Quaternion.FromEulerAngles(0.18, -0.45, 0.12);
      const duration = Math.max(120, Number(durationMs) || 420);
      const started = performance.now();

      const frame = now => {
        if (!altynRound.active || gameState.phase !== 'transition') { resolve(); return; }
        const t = Math.max(0, Math.min(1, (now - started) / duration));
        const ease = t * t * (3 - 2 * t);
        mesh.position.x = from.x + (to.x - from.x) * ease;
        mesh.position.y = from.y + (to.y - from.y) * ease;
        mesh.position.z = from.z + (to.z - from.z) * ease;
        if (!mesh.rotationQuaternion) mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
        BABYLON.Quaternion.SlerpToRef(fromRot, toRot, ease, mesh.rotationQuaternion);
        mesh.computeWorldMatrix(true);
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  async function transitionToNextAltynThrow() {
    if (!altynRound.active || !altynRound.plan || gameState.resultShown) return;
    const nextIndex = altynRound.throwIndex + 1;
    if (nextIndex >= altynRound.plan.throws.length) { showGameResult(); return; }

    altynRound.throwIndex = nextIndex;
    activateAltynThrow(nextIndex);
    gameState.phase = 'transition';
    gameState.busy = true;
    gameState.ticketReady = true;
    hideAimVisuals();
    if (ui.aimPower) ui.aimPower.hidden = true;
    renderState();
    setAltynThrowHint();

    await waitMs(Number(C.game?.betweenThrowPauseMs ?? 320));
    await animateSakaReturnToStart(Number(C.game?.sakaReturnDurationMs ?? 420));
    if (!altynRound.active || gameState.resultShown || !gameState.ticket) return;

    resetSakaForNextAltynThrow();
    if (ui.action) {
      ui.action.classList.remove('next-throw-ready');
      void ui.action.offsetWidth;
      ui.action.classList.add('next-throw-ready');
      window.setTimeout(() => ui.action?.classList.remove('next-throw-ready'), Number(C.game?.nextThrowPulseMs ?? 850));
    }
  }

'''
    s = replace_between(
        s,
        '  function setAltynThrowHint() {',
        '  function resetSakaForNextAltynThrow() {',
        replacement,
    )

    old_tail = '''    altynRound.throwIndex += 1;\n    activateAltynThrow(altynRound.throwIndex);\n    resetSakaForNextAltynThrow();'''
    if old_tail not in s:
        raise SystemExit('resolveCurrentAltynThrow tail not found')
    s = s.replace(old_tail, '    transitionToNextAltynThrow();', 1)

if "case 'transition':" not in s:
    old = "      case 'ready': { const step=currentAltynThrow(); label = step ? `${tr('makeThrow')} ${step.index}/${altynRound.plan.throws.length}` : tr('makeThrow'); break; }\n      case 'throwing': label = tr('throwing'); disabled = true; break;"
    new = "      case 'ready': { const step=currentAltynThrow(); label = step ? `${tr('makeThrow')} ${step.index}/${altynRound.plan.throws.length}` : tr('makeThrow'); break; }\n      case 'transition': { const step=currentAltynThrow(); label = step ? `${tr('makeThrow')} ${step.index}/${altynRound.plan.throws.length}` : tr('makeThrow'); disabled = true; break; }\n      case 'throwing': label = tr('throwing'); disabled = true; break;"
    if old not in s:
        raise SystemExit('renderState marker not found')
    s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')

p = Path('src/i18n.js')
s = p.read_text(encoding='utf-8')
s = s.replace("makeThrow:        { RU:'Сделать бросок',              EN:'Throw',                        KG:'Ыргытуу',                      ZH:'投掷' },", "makeThrow:        { RU:'Бросок',                       EN:'Throw',                        KG:'Ыргытуу',                      ZH:'投掷' },")
s = s.replace("RU:'Потяни САКА вниз и отпусти — или нажми «Сделать бросок».',", "RU:'Потяни САКА вниз и отпусти — или нажми «Бросок».',")
if 'hintThrowProgress' not in s:
    marker = "  hintChooseDenom:  { RU:'Выберите номинал и нажмите «Новая игра»',"
    insert = "  hintThrowProgress:{ RU:'Бросок {current} из {total}',\n                      EN:'Throw {current} of {total}',\n                      KG:'Ыргытуу {current}/{total}',\n                      ZH:'投掷 {current}/{total}' },\n"
    if marker not in s:
        raise SystemExit('i18n insertion marker not found')
    s = s.replace(marker, insert + marker, 1)
p.write_text(s, encoding='utf-8')

p = Path('src/config.js')
s = p.read_text(encoding='utf-8')
s = s.replace("version: '0.2.0'", "version: '0.2.1'", 1)
if 'betweenThrowPauseMs' not in s:
    marker = '    deterministicScatter: true,\n'
    if marker not in s:
        raise SystemExit('config insertion marker not found')
    s = s.replace(marker, marker + '    betweenThrowPauseMs: 320,\n    sakaReturnDurationMs: 420,\n    nextThrowPulseMs: 850,\n', 1)
p.write_text(s, encoding='utf-8')

p = Path('styles.css')
s = p.read_text(encoding='utf-8')
if 'altyn-next-throw-ready' not in s:
    s += '''\n\n/* ALTYN KHAN: subtle cue when SAKA has returned and the next throw is ready. */\n@keyframes altyn-next-throw-ready {\n  0% { transform: scale(1); filter: brightness(1); }\n  42% { transform: scale(1.025); filter: brightness(1.12); }\n  100% { transform: scale(1); filter: brightness(1); }\n}\n#action-btn.next-throw-ready {\n  animation: altyn-next-throw-ready .78s ease-out 1;\n}\n'''
p.write_text(s, encoding='utf-8')

p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('<title>АЛТЫН ХАН Modern 3D — v0.1</title>', '<title>АЛТЫН ХАН Modern 3D — v0.2.1</title>')
s = s.replace('?v=0.2.0', '?v=0.2.1')
s = s.replace("window.X2_ALTYN_BUILD = '0.2.0'", "window.X2_ALTYN_BUILD = '0.2.1'")
p.write_text(s, encoding='utf-8')

Path('BUILD.txt').write_text(
    'ALTYN KHAN Modern 3D build: 0.2.1\n'
    'Base: CHUKO Modern 3D v9 / 0.13.21\n'
    'Stage: polished between-throw transition + smooth SAKA return\n'
    'Scenario source: ALTYN KHAN 1..9\n'
    'Financial result source: LMS authoritative\n',
    encoding='utf-8',
)

print('step2 transition patch complete')
