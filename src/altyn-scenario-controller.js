/* ALTYН ХАН Modern 3D v0.1.0 — deterministic visual throw planner.
 *
 * One LMS ticket -> one immutable financial scenario.
 * This module expands ticketId + scenario into a reproducible sequence of
 * visual throws. It never calculates or changes a payout.
 */
(function (global) {
  'use strict';

  const ScenarioCfg = global.X2AltynScenarioConfig;

  function hash32(text) {
    let h = 2166136261 >>> 0;
    const s = String(text ?? '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h += h << 13; h ^= h >>> 7;
    h += h << 3;  h ^= h >>> 17;
    h += h << 5;
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function random() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng(seedText) {
    return mulberry32(hash32(seedText));
  }

  function intBetween(rng, min, max) {
    const lo = Math.ceil(Number(min));
    const hi = Math.floor(Number(max));
    if (hi <= lo) return lo;
    return lo + Math.floor(rng() * (hi - lo + 1));
  }

  function shuffled(items, rng) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function distribute(total, slots, rng, preferEveryThrow = false) {
    const count = Math.max(1, Number(slots) || 1);
    const out = Array(count).fill(0);
    let left = Math.max(0, Number(total) || 0);

    if (preferEveryThrow && left >= count) {
      for (let i = 0; i < count; i++) {
        out[i] = 1;
        left--;
      }
    }

    while (left > 0) {
      const i = Math.floor(rng() * count);
      out[i]++;
      left--;
    }

    // Avoid a visually front-loaded deterministic pattern by shuffling slots.
    return shuffled(out, rng);
  }

  function ordinaryTotalForScenario(item, rng) {
    if (item.regularMode === 'range') {
      return intBetween(rng, item.regularMin, item.regularMax);
    }
    if (item.regularMode === 'fixed') {
      return Math.max(0, Number(item.regular) || 0);
    }
    return 0;
  }

  function ordinaryVisualTotalBeforeKhan(khanThrow, rng) {
    // Intermediate ordinary pieces are visual-only and do not change payout.
    // Ranges are intentionally modest so the KHAN remains the visual focus.
    if (khanThrow === 1) return intBetween(rng, 0, 2);
    if (khanThrow === 2) return intBetween(rng, 1, 4);
    return intBetween(rng, 2, 5);
  }

  function makeThrow(index, regularOut, khanOut, seedBase, isFinal) {
    return Object.freeze({
      index,
      regularOut: Math.max(0, Number(regularOut) || 0),
      khanOut: Boolean(khanOut),
      final: Boolean(isFinal),
      seed: `${seedBase}|throw:${index}`
    });
  }

  function buildPlan(ticketId, scenarioValue) {
    if (!ScenarioCfg) throw new Error('ALTYN_SCENARIO_CONFIG_NOT_LOADED');

    const scenario = ScenarioCfg.getOrDefault(scenarioValue);
    const seedBase = `ALTYN3D|${String(ticketId ?? 'NO-TICKET')}|scenario:${scenario.id}|plan:v1`;
    const rng = makeRng(seedBase);
    const throws = [];

    if (!scenario.khan) {
      const total = ordinaryTotalForScenario(scenario, rng);
      const counts = distribute(total, 3, rng, total >= 3);
      for (let i = 0; i < 3; i++) {
        throws.push(makeThrow(i + 1, counts[i], false, seedBase, i === 2));
      }

      return Object.freeze({
        version: 1,
        ticketId: String(ticketId ?? ''),
        scenarioId: scenario.id,
        scenarioKey: scenario.key,
        multiplier: Number(scenario.demoMultiplier || 0),
        khanThrow: null,
        maxThrows: 3,
        plannedRegularTotal: total,
        throws: Object.freeze(throws),
        seed: seedBase
      });
    }

    const khanThrow = Math.max(1, Math.min(3, Number(scenario.khanThrow) || 1));
    const ordinaryTotal = ordinaryVisualTotalBeforeKhan(khanThrow, rng);
    const counts = distribute(ordinaryTotal, khanThrow, rng, ordinaryTotal >= khanThrow);

    for (let i = 0; i < khanThrow; i++) {
      const throwIndex = i + 1;
      const khanOut = throwIndex === khanThrow;
      throws.push(makeThrow(throwIndex, counts[i], khanOut, seedBase, khanOut));
    }

    return Object.freeze({
      version: 1,
      ticketId: String(ticketId ?? ''),
      scenarioId: scenario.id,
      scenarioKey: scenario.key,
      multiplier: Number(scenario.demoMultiplier || 0),
      khanThrow,
      maxThrows: khanThrow,
      plannedRegularTotal: ordinaryTotal,
      throws: Object.freeze(throws),
      seed: seedBase
    });
  }

  function selectTargetIds(remainingIds, count, throwSeed) {
    const ids = [...remainingIds];
    const rng = makeRng(`${throwSeed}|targets`);
    return shuffled(ids, rng).slice(0, Math.max(0, Number(count) || 0));
  }

  function validatePlan(plan) {
    if (!plan || !Array.isArray(plan.throws) || !plan.throws.length) return false;
    const scenario = ScenarioCfg?.get(plan.scenarioId);
    if (!scenario) return false;

    const khanThrows = plan.throws.filter(t => t.khanOut);
    if (!scenario.khan && khanThrows.length !== 0) return false;
    if (scenario.khan) {
      if (khanThrows.length !== 1) return false;
      if (khanThrows[0].index !== Number(scenario.khanThrow)) return false;
    }

    if (scenario.regularMode === 'fixed') {
      const sum = plan.throws.reduce((n, t) => n + Number(t.regularOut || 0), 0);
      if (sum !== Number(scenario.regular || 0)) return false;
    }

    if (scenario.regularMode === 'range') {
      const sum = plan.throws.reduce((n, t) => n + Number(t.regularOut || 0), 0);
      if (sum < Number(scenario.regularMin) || sum > Number(scenario.regularMax)) return false;
    }

    return true;
  }

  global.X2AltynScenarioController = Object.freeze({
    buildPlan,
    selectTargetIds,
    validatePlan,
    makeRng,
    controllerVersion: '0.1.0'
  });
})(window);
