from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'marker not found: {label}')
    return text.replace(old, new, 1)


# --- game.js -------------------------------------------------------------
p = Path('src/game.js')
s = p.read_text(encoding='utf-8')

old_launch = """  function launchCelebration({ khan = false } = {}) {
    clearCelebration();
    launchConfetti({ khan });
  }

"""
new_launch = """  function launchCelebration({ khan = false } = {}) {
    clearCelebration();
    launchConfetti({ khan });
  }

  function playKhanMomentTone() {
    if (!audioSettings.soundEnabled) return;
    ensureAudioContext().then(() => {
      tone({ frequency:196, endFrequency:132, duration:.34, gain:.070, type:'triangle' });
      tone({ frequency:392, endFrequency:520, duration:.23, gain:.045, type:'sine', delay:.07 });
      tone({ frequency:784, endFrequency:660, duration:.16, gain:.028, type:'sine', delay:.16 });
    });
  }

  function showKhanMoment() {
    if (!ui.celebration) return;
    ui.celebration.querySelector('.khan-moment')?.remove();
    const item = ScenarioCfg?.getOrDefault(gameState.ticket?.scenario);
    const multiplier = Number(item?.demoMultiplier || gameState.ticket?.multiplier || 0);
    const el = document.createElement('div');
    el.className = 'khan-moment';
    const title = document.createElement('strong');
    title.textContent = 'ХАН';
    const value = document.createElement('b');
    value.textContent = `×${multiplier}`;
    el.append(title, value);
    ui.celebration.appendChild(el);
    playKhanMomentTone();
    window.setTimeout(() => el.remove(), Number(C.game?.khanMomentDurationMs ?? 1250) + 120);
  }

"""
s = replace_once(s, old_launch, new_launch, 'launchCelebration')

old_khan_block = """    // KHAN: inside unless FIVE_KHAN. Keep it separated from chükö too.
    if (roundPool.khan?.mesh && (plan.khan || !altynRound.active)) {
      const targeted = !!plan.khan;
"""
new_khan_block = """    // KHAN participates in every throw. Before its assigned winning throw it
    // is deterministically kept INSIDE the white circle, so Havok/contact can
    // make it feel involved without ever allowing an accidental early win.
    // On the assigned throw it becomes the targeted OUT object.
    if (roundPool.khan?.mesh) {
      const targeted = !!plan.khan;
"""
s = replace_once(s, old_khan_block, new_khan_block, 'khan flight-plan condition')

old_khan_motion = """        delay:targeted ? 25+rng()*35 : 45+rng()*38,
        duration:targeted ? durMax*0.95 : durMin*0.88,
        arc:targeted
          ? Number(C.game?.scatterArcOutsideMax||0.54)*0.92
          : Number(C.game?.scatterArcInsideMin||0.12)*0.85
"""
new_khan_motion = """        delay:targeted ? 12+rng()*24 : 45+rng()*38,
        duration:targeted
          ? durMax*Number(C.game?.khanFlightDurationFactor || 1.16)
          : durMin*0.88,
        arc:targeted
          ? Number(C.game?.scatterArcOutsideMax||0.54)*Number(C.game?.khanFlightArcFactor || 1.42)
          : Number(C.game?.scatterArcInsideMin||0.12)*0.85
"""
s = replace_once(s, old_khan_motion, new_khan_motion, 'khan flight motion')

old_scatter_state = """    scenarioRuntime.scatterActive = true;
    scenarioRuntime.impactAt = now;
    scenarioRuntime.outIds = new Set();
    scenarioRuntime.khanOut = false;

    scenarioRuntime.flightPlan.forEach(entry=>{
"""
new_scatter_state = """    scenarioRuntime.scatterActive = true;
    scenarioRuntime.impactAt = now;
    scenarioRuntime.outIds = new Set();
    scenarioRuntime.khanOut = false;

    // Winning KHAN throw: make the exact impact moment visually distinct.
    // The multiplier/result was already fixed by LMS; this is display only.
    if (scenarioRuntime.plan?.khan) showKhanMoment();

    scenarioRuntime.flightPlan.forEach(entry=>{
"""
s = replace_once(s, old_scatter_state, new_scatter_state, 'scatter KHAN cue')

p.write_text(s, encoding='utf-8')


# --- config.js -----------------------------------------------------------
p = Path('src/config.js')
s = p.read_text(encoding='utf-8')
s = s.replace("version: '0.2.1'", "version: '0.3.0'", 1)
marker = "    nextThrowPulseMs: 850,\n"
if 'khanFlightArcFactor' not in s:
    s = replace_once(
        s,
        marker,
        marker + "    khanFlightArcFactor: 1.42,\n    khanFlightDurationFactor: 1.16,\n    khanMomentDurationMs: 1250,\n",
        'config nextThrowPulseMs'
    )
p.write_text(s, encoding='utf-8')


# --- styles.css ----------------------------------------------------------
p = Path('styles.css')
s = p.read_text(encoding='utf-8')
if '.khan-moment{' not in s:
    s += r'''

/* ALTYN KHAN v0.3: brief gold cue exactly when the winning KHAN throw lands. */
.khan-moment{
  position:absolute;left:50%;top:43%;width:160px;height:160px;
  transform:translate(-50%,-50%);display:flex;flex-direction:column;
  align-items:center;justify-content:center;pointer-events:none;
  filter:drop-shadow(0 8px 22px rgba(0,0,0,.34));
  animation:altyn-khan-moment 1.25s cubic-bezier(.18,.72,.2,1) forwards
}
.khan-moment::before,.khan-moment::after{
  content:"";position:absolute;inset:19px;border-radius:50%;
  border:2px solid rgba(255,212,93,.78);box-shadow:0 0 22px rgba(255,192,63,.38);
  animation:altyn-khan-ring 1.05s ease-out forwards
}
.khan-moment::after{inset:34px;border-width:1px;animation-delay:.08s}
.khan-moment strong{
  position:relative;z-index:1;color:#ffd45d;font-family:Georgia,'Times New Roman',serif;
  font-size:clamp(34px,9vw,54px);font-weight:950;line-height:.88;letter-spacing:.055em;
  text-shadow:0 2px 0 rgba(91,52,0,.72),0 0 16px rgba(255,212,93,.68),0 0 30px rgba(255,159,46,.34)
}
.khan-moment b{
  position:relative;z-index:1;margin-top:7px;color:#fff;font-size:clamp(19px,5vw,30px);
  line-height:1;font-weight:950;text-shadow:0 2px 8px rgba(0,0,0,.55)
}
@keyframes altyn-khan-moment{
  0%{opacity:0;transform:translate(-50%,-50%) scale(.46);filter:blur(8px) drop-shadow(0 8px 22px rgba(0,0,0,.34))}
  18%{opacity:1;transform:translate(-50%,-50%) scale(1.12);filter:blur(0) drop-shadow(0 8px 22px rgba(0,0,0,.34))}
  31%{transform:translate(-50%,-50%) scale(.98)}
  68%{opacity:1;transform:translate(-50%,-53%) scale(1)}
  100%{opacity:0;transform:translate(-50%,-67%) scale(.90)}
}
@keyframes altyn-khan-ring{
  0%{opacity:0;transform:scale(.45)}
  18%{opacity:.95}
  100%{opacity:0;transform:scale(1.45)}
}
'''
p.write_text(s, encoding='utf-8')


# --- index.html / cache bust --------------------------------------------
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('<title>АЛТЫН ХАН Modern 3D — v0.2.1</title>', '<title>АЛТЫН ХАН Modern 3D — v0.3.0</title>')
s = s.replace('?v=0.2.1', '?v=0.3.0')
s = s.replace("window.X2_ALTYN_BUILD = '0.2.1'", "window.X2_ALTYN_BUILD = '0.3.0'")
p.write_text(s, encoding='utf-8')


Path('BUILD.txt').write_text(
    'ALTYN KHAN Modern 3D build: 0.3.0\n'
    'Base: CHUKO Modern 3D v9 / 0.13.21\n'
    'Stage: KHAN scenarios 7-9 visual polish and early-KHAN protection\n'
    'KHAN: deterministic inside motion before target throw; expressive winning flight\n'
    'Scenario source: ALTYN KHAN 1..9\n'
    'Financial result source: LMS authoritative\n',
    encoding='utf-8'
)
