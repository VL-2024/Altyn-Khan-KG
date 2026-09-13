/* ALTYN KHAN Modern 3D v0.1.0 — authoritative scenario catalogue.
 *
 * Financial result is LMS-authoritative. This catalogue describes only how an
 * already purchased ticket is visually revealed in 1..3 throws.
 *
 * Compatibility note: X2ChukoScenarioConfig is kept as a temporary alias while
 * the inherited Chuko v9 engine is being refactored. New code must use
 * X2AltynScenarioConfig.
 */
(function (global) {
  'use strict';

  const scenarios = Object.freeze({
    1: Object.freeze({
      id: 1,
      key: 'LOSS_1_3',
      regularMode: 'range',
      regularMin: 1,
      regularMax: 3,
      regular: 3,
      khan: false,
      khanThrow: null,
      maxThrows: 3,
      demoMultiplier: 0,
      seriesCount1000: 300,
      probability: 0.300
    }),
    2: Object.freeze({
      id: 2,
      key: 'FOUR',
      regularMode: 'fixed',
      regular: 4,
      khan: false,
      khanThrow: null,
      maxThrows: 3,
      demoMultiplier: 0.5,
      seriesCount1000: 252,
      probability: 0.252
    }),
    3: Object.freeze({
      id: 3,
      key: 'FIVE',
      regularMode: 'fixed',
      regular: 5,
      khan: false,
      khanThrow: null,
      maxThrows: 3,
      demoMultiplier: 1,
      seriesCount1000: 329,
      probability: 0.329
    }),
    4: Object.freeze({
      id: 4,
      key: 'SIX',
      regularMode: 'fixed',
      regular: 6,
      khan: false,
      khanThrow: null,
      maxThrows: 3,
      demoMultiplier: 3,
      seriesCount1000: 80,
      probability: 0.080
    }),
    5: Object.freeze({
      id: 5,
      key: 'SEVEN',
      regularMode: 'fixed',
      regular: 7,
      khan: false,
      khanThrow: null,
      maxThrows: 3,
      demoMultiplier: 4,
      seriesCount1000: 20,
      probability: 0.020
    }),
    6: Object.freeze({
      id: 6,
      key: 'EIGHT',
      regularMode: 'fixed',
      regular: 8,
      khan: false,
      khanThrow: null,
      maxThrows: 3,
      demoMultiplier: 5,
      seriesCount1000: 10,
      probability: 0.010
    }),
    7: Object.freeze({
      id: 7,
      key: 'KHAN_THROW_3',
      regularMode: 'visual-before-khan',
      regular: 0,
      khan: true,
      khanThrow: 3,
      maxThrows: 3,
      demoMultiplier: 10,
      seriesCount1000: 4,
      probability: 0.004
    }),
    8: Object.freeze({
      id: 8,
      key: 'KHAN_THROW_2',
      regularMode: 'visual-before-khan',
      regular: 0,
      khan: true,
      khanThrow: 2,
      maxThrows: 2,
      demoMultiplier: 15,
      seriesCount1000: 3,
      probability: 0.003
    }),
    9: Object.freeze({
      id: 9,
      key: 'KHAN_THROW_1',
      regularMode: 'visual-before-khan',
      regular: 0,
      khan: true,
      khanThrow: 1,
      maxThrows: 1,
      demoMultiplier: 20,
      seriesCount1000: 2,
      probability: 0.002
    })
  });

  const ids = Object.freeze([1,2,3,4,5,6,7,8,9]);
  const byKey = Object.freeze(Object.fromEntries(Object.values(scenarios).map(item => [item.key, item])));
  const demoOrder = Object.freeze([1,2,1,3,1,4,1,5,1,6,1,7,1,8,1,9]);

  function get(value) {
    if (typeof value === 'string') {
      const key = value.trim().toUpperCase();
      if (byKey[key]) return byKey[key];
    }
    const n = Number(value);
    return Number.isFinite(n) && scenarios[n] ? scenarios[n] : null;
  }

  function has(value) { return !!get(value); }
  function getOrDefault(value) { return get(value) || scenarios[1]; }
  function demoMultiplier(value) { return Number(getOrDefault(value).demoMultiplier || 0); }
  function demoAt(index) {
    const id = demoOrder[((Number(index) || 0) % demoOrder.length + demoOrder.length) % demoOrder.length];
    return scenarios[id];
  }

  const api = Object.freeze({
    scenarios,
    ids,
    byKey,
    demoOrder,
    get,
    has,
    getOrDefault,
    demoMultiplier,
    demoAt,
    seriesSize: 1000,
    scenarioSetVersion: 'altyn-khan-modern-3d-2026-09-12-v1'
  });

  global.X2_ALTYN_SCENARIOS = scenarios;
  global.X2AltynScenarioConfig = api;
  global.X2_CHUKO_SCENARIOS = scenarios;
  global.X2ChukoScenarioConfig = api;
})(window);
