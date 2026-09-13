/* ALTYN KHAN Modern 3D — runtime / LMS settings. */
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
    balance: '/api/lms/player/balance',
    newGame: '/api/lms/game/new'
  },

  initMode: 'postMessage',
  sessionMode: 'postMessage',
  sessionQueryParam: 'session',
  sessionHeader: 'X-Session-ID',
  parentOrigin: '*',
  allowedParentOrigins: ['*'],
  requestTimeoutMs: 10000
};
