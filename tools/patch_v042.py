from pathlib import Path

p = Path('src/game.js')
s = p.read_text(encoding='utf-8')
old = """    scenarioRuntime.outIds = new Set();\n    scenarioRuntime.khanOut = false;\n\n    scenarioRuntime.flightPlan.forEach(entry=>{"""
new = """    scenarioRuntime.outIds = new Set();\n    scenarioRuntime.khanOut = false;\n    scenarioRuntime.normalWinFxTriggered = false;\n\n    scenarioRuntime.flightPlan.forEach(entry=>{"""
if old not in s:
    raise SystemExit('scatter reset block not found')
s = s.replace(old, new, 1)

marker = "      if (entry.isKhan && entry.targeted && !entry.khanFxTriggered) {"
insert = """      // Ordinary winning scenarios fire at the same visual moment as KHAN:\n      // when the final planned target(s) cross the outer boundary.\n      if (!entry.isKhan && entry.targeted && !entry.normalWinFxCrossed) {\n        const metric = greenRingMetricForWorld(item.mesh.position);\n        if ((metric != null && Number.isFinite(metric) && metric >= 1.02) || t >= 0.82) {\n          entry.normalWinFxCrossed = true;\n          const scenarioItem = ScenarioCfg?.getOrDefault(gameState.ticket?.scenario);\n          const step = currentAltynThrow();\n          const lastThrowIndex = Math.max(0, Number(altynRound.plan?.throws?.length || 1) - 1);\n          const isFinalOrdinary = Boolean(\n            altynRound.active && scenarioItem && !scenarioItem.khan &&\n            (step?.final || altynRound.throwIndex >= lastThrowIndex)\n          );\n          if (isFinalOrdinary && !scenarioRuntime.normalWinFxTriggered) {\n            const targetedOrdinary = scenarioRuntime.flightPlan.filter(e => e?.targeted && !e?.isKhan);\n            const allCrossed = targetedOrdinary.length > 0 && targetedOrdinary.every(e => e.normalWinFxCrossed || e === entry);\n            if (allCrossed) {\n              scenarioRuntime.normalWinFxTriggered = true;\n              window.dispatchEvent(new CustomEvent('X2_ALTYN_NORMAL_WIN_OUT', {\n                detail: {\n                  ticketId: String(gameState.ticket?.ticketId || ''),\n                  scenario: Number(gameState.ticket?.scenario || 0),\n                  multiplier: Number(scenarioItem?.demoMultiplier || gameState.ticket?.multiplier || 0)\n                }\n              }));\n            }\n          }\n        }\n      }\n\n      if (entry.isKhan && entry.targeted && !entry.khanFxTriggered) {"""
if marker not in s:
    raise SystemExit('KHAN trigger marker not found')
s = s.replace(marker, insert, 1)
p.write_text(s, encoding='utf-8')

p = Path('src/win-effects.js')
s = p.read_text(encoding='utf-8').replace('Modern 3D v0.4.1', 'Modern 3D v0.4.2', 1)
old = """  function onRoundComplete(event) {\n    const d = event.detail || {};\n    const scenario = Number(d.scenario ?? d.ticket?.scenario ?? 0);\n    const item = S?.get?.(scenario);\n    const multiplier = Number(item?.demoMultiplier ?? 0);\n    if (!item || item.khan || !levels[multiplier]) return;\n    const ticketId = String(d.ticketId ?? d.ticket?.ticketId ?? `scenario-${scenario}-${Date.now()}`);\n    requestAnimationFrame(() => show(multiplier, `${ticketId}:${scenario}`));\n  }\n\n  injectStyles();\n  window.addEventListener('X2_GAME_ROUND_COMPLETE', onRoundComplete);"""
new = """  function onWinEvent(event) {\n    const d = event.detail || {};\n    const scenario = Number(d.scenario ?? d.ticket?.scenario ?? 0);\n    const item = S?.get?.(scenario);\n    const multiplier = Number(d.multiplier ?? item?.demoMultiplier ?? 0);\n    if (!item || item.khan || !levels[multiplier]) return;\n    const ticketId = String(d.ticketId ?? d.ticket?.ticketId ?? `scenario-${scenario}-${Date.now()}`);\n    requestAnimationFrame(() => show(multiplier, `${ticketId}:${scenario}`));\n  }\n\n  injectStyles();\n  window.addEventListener('X2_ALTYN_NORMAL_WIN_OUT', onWinEvent);\n  window.addEventListener('X2_GAME_ROUND_COMPLETE', onWinEvent);"""
if old not in s:
    raise SystemExit('win event block not found')
p.write_text(s.replace(old, new, 1), encoding='utf-8')

p = Path('index.html')
s = p.read_text(encoding='utf-8').replace('0.4.1', '0.4.2')
s = s.replace('tiered wins fixed + KHAN', 'instant tiered wins + KHAN')
p.write_text(s, encoding='utf-8')

p = Path('src/config.js')
s = p.read_text(encoding='utf-8').replace("version: '0.4.1'", "version: '0.4.2'", 1)
p.write_text(s, encoding='utf-8')

p = Path('src/khan-effects.js')
s = p.read_text(encoding='utf-8').replace('Modern 3D v0.4.1', 'Modern 3D v0.4.2', 1)
p.write_text(s, encoding='utf-8')

Path('BUILD.txt').write_text(
    'ALTYN KHAN Modern 3D build: 0.4.2\n'
    'Base: CHUKO Modern 3D v9 / 0.13.21\n'
    'Stage: immediate tiered ordinary-win effects\n'
    'Core mechanics: v0.3.2 stable flow retained\n'
    'Ordinary wins: effect starts on final boundary crossing, matching KHAN timing\n'
    'Visual tiers: x0.5 / x1 / x3 / x4 / x5\n'
    'KHAN: separate gold x10 / x15 / x20 finale retained\n'
    'Financial result source: LMS authoritative\n',
    encoding='utf-8'
)
