/* ALTYN KHAN Modern 3D — runtime / LMS settings. */
/* © 2026 ISS LLC. Vadim Lunev. All rights reserved. */
window.X2_GAME_CONFIG = {
  gameId: 'ALTYN_KHAN',
  denomination: 25,
  denominations: [25, 50, 100],
  language: 'RU',
  currency: 'KGS',
  currencyDisplay: 'сом',
  mode: 'demo',
  demoAllowed: true,
  demoBalance: 10000,

  autoPlayCounts: [5, 10, 20, 50],
  autoPlayThrowDelayMs: 450,
  autoPlayNextRoundDelayMs: 900,

  audio: {
    soundEnabled: true,
    musicEnabled: false,
    soundVolume: 0.22,
    musicVolume: 0.20,
    musicTracks: [
      'assets/music/mountain-sunset.mp3',
      'assets/music/nomads-sunset.mp3'
    ],
    voiceTags: [
      'assets/voice/x2-voice-01.mp3',
      'assets/voice/x2-voice-02.mp3'
    ],
    voiceVolume: 0.12,
    voiceMinDelayMs: 28000,
    voiceMaxDelayMs: 45000,
    musicDuckFactor: 0.68,
    soundFiles: {
      throw: 'assets/sounds/impact-chuko.mp3',
      impact: 'assets/sounds/throw-whoosh.mp3',
      khanImpact: 'assets/sounds/impact-khan.mp3',
      win: 'assets/sounds/win-accent.mp3'
    },
    effectFileVolume: 0.42
  },

  localTicketHistoryLimit: 5,

  // Standalone QA only. Production LMS must set mock=false.
  mock: true,

  apiBase: '',
  endpoints: {
    // Single Method=-based endpoint — same URL serves PayTicket (Method=
    // PayTicket) and the balance keep-alive (Method=Balance), matching the
    // real backend contract confirmed for the sibling X2 LOTO games
    // (Mahjong Luck / Upay / ЧҮКӨ-ОРДО). The placeholder REST-style
    // `/api/lms/player/balance` path this used to point to was never real
    // — Method=Balance rides this same endpoint instead.
    newGame: '/api/lms/game/new'
  },

  initMode: 'postMessage',
  // Team decision (2026-09, Telegram): auth rides the browser session
  // (cookie), not a bearer token — same call across the whole X2 LOTO
  // lineup (Mahjong Luck / Upay / ЧҮКӨ-ОРДО already switched; this brings
  // Алтын Хан in line). This ONLY works if the game is served from the
  // same domain as the LMS site itself (Vladislav Laptev's condition) — a
  // cross-domain iframe won't get the cookie sent at all (SameSite,
  // Safari ITP). Whoever deploys this to x2.kg must host it under that
  // same domain, not a separate CDN/Pages domain.
  sessionMode: 'cookie',
  sessionQueryParam: 'session',
  sessionHeader: 'X-Session-ID',
  parentOrigin: '*',
  allowedParentOrigins: ['*'],
  requestTimeoutMs: 10000,

  // Keep-alive: any authorized request resets the LMS backend's 15-minute
  // inactivity timeout (confirmed with the LMS team), so the game polls
  // Method=Balance on this interval — comfortably under 15 min — so a
  // player who's idle for a while doesn't hit an expired session on their
  // next PayTicket. See X2LMS.getBalance() / startBalancePolling() in
  // src/game.js.
  balancePollIntervalMs: 5 * 60 * 1000
};
