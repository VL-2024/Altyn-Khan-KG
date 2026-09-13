/* ALTYN KHAN Modern 3D v0.4.3 — synchronize score counters with win effects. */
(() => {
  'use strict';

  const C = window.CHUKO3D_CONFIG || {};
  let activeTicket = null;
  let khanSyncUntil = 0;
  let khanSyncRaf = 0;

  function formatMoney(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('ru-RU') : '0';
  }

  function rememberTicket(ticket) {
    if (!ticket) return ticket;
    activeTicket = {
      ticketId: String(ticket.ticketId || ''),
      scenario: Number(ticket.scenario || 0),
      win: Number(ticket.win || 0),
      multiplier: Number(ticket.multiplier || 0)
    };
    return ticket;
  }

  function hookTicketCreation() {
    const lms = window.X2LMS;
    if (!lms || lms.__altynCounterSyncHooked) return;
    ['createTicket', 'createDemoTicket'].forEach(name => {
      const original = lms[name];
      if (typeof original !== 'function') return;
      lms[name] = async function(...args) {
        const ticket = await original.apply(this, args);
        rememberTicket(ticket);
        return ticket;
      };
    });
    lms.__altynCounterSyncHooked = true;
  }

  function greenRingMetric(scene, mesh) {
    const canvas = document.getElementById('renderCanvas');
    const field = document.querySelector('.field-photo');
    const camera = scene?.activeCamera;
    const engine = scene?.getEngine?.();
    if (!canvas || !field || !camera || !engine || !mesh) return null;

    const rw = Math.max(1, engine.getRenderWidth());
    const rh = Math.max(1, engine.getRenderHeight());
    const viewport = camera.viewport.toGlobal(rw, rh);
    const pos = mesh.getAbsolutePosition ? mesh.getAbsolutePosition() : mesh.position;
    const projected = BABYLON.Vector3.Project(pos, BABYLON.Matrix.Identity(), scene.getTransformMatrix(), viewport);
    const canvasRect = canvas.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height || !fieldRect.width || !fieldRect.height) return null;

    const x = canvasRect.left + projected.x * canvasRect.width / rw;
    const y = canvasRect.top + projected.y * canvasRect.height / rh;
    const cx = fieldRect.left + fieldRect.width * Number(C.game?.greenRingCx || 0.5075);
    const cy = fieldRect.top + fieldRect.height * Number(C.game?.greenRingCy || 0.4692);
    const rx = fieldRect.width * Number(C.game?.greenRingRx || 0.4140);
    const ry = fieldRect.height * Number(C.game?.greenRingRy || 0.2945);
    if (rx <= 1 || ry <= 1) return null;
    return Math.hypot((x - cx) / rx, (y - cy) / ry);
  }

  function countOutsideOrdinary() {
    const scene = window.BABYLON?.EngineStore?.LastCreatedScene;
    if (!scene?.activeCamera) return null;
    let outside = 0;
    for (let i = 1; i <= Number(C.pile?.chukoCount || 11); i++) {
      const mesh = scene.getMeshByName?.(`chuko-${i}`);
      const metric = greenRingMetric(scene, mesh);
      if (metric != null && Number.isFinite(metric) && metric >= 1.02) outside++;
    }
    return outside;
  }

  function localizedStood() {
    const htmlLang = String(document.documentElement.lang || 'ru').toLowerCase();
    const lang = htmlLang.startsWith('ky') ? 'KG' : htmlLang.startsWith('en') ? 'EN' : htmlLang.startsWith('zh') ? 'ZH' : 'RU';
    return window.CHUKO_I18N?.[lang]?.stood || (lang === 'EN' ? 'Stands' : lang === 'KG' ? 'Турат' : lang === 'ZH' ? '未出界' : 'Стоит');
  }

  function pulseCounter(el) {
    const cell = el?.closest?.('.score-cell');
    if (!cell) return;
    cell.classList.remove('counter-sync-pop');
    void cell.offsetWidth;
    cell.classList.add('counter-sync-pop');
    window.setTimeout(() => cell.classList.remove('counter-sync-pop'), 900);
  }

  function syncCounters(detail = {}, isKhan = false) {
    const ticketId = String(detail.ticketId || '');
    const sameTicket = activeTicket && (!ticketId || !activeTicket.ticketId || activeTicket.ticketId === ticketId);
    const win = Number(detail.win ?? (sameTicket ? activeTicket.win : NaN));
    const knocked = Number.isFinite(Number(detail.knocked)) ? Number(detail.knocked) : countOutsideOrdinary();
    const multiplier = Number(detail.multiplier || (sameTicket ? activeTicket.multiplier : 0));

    const knockedEl = document.getElementById('score-knocked');
    const khanEl = document.getElementById('score-khan');
    const winEl = document.getElementById('score-win');

    if (knockedEl && Number.isFinite(Number(knocked))) {
      knockedEl.textContent = String(Math.max(0, Number(knocked)));
      pulseCounter(knockedEl);
    }
    if (winEl && Number.isFinite(win)) {
      winEl.textContent = formatMoney(win);
      pulseCounter(winEl);
    }
    if (khanEl) {
      if (isKhan && [10, 15, 20].includes(multiplier)) khanEl.textContent = `×${multiplier}`;
      else if (!isKhan) khanEl.textContent = localizedStood();
      pulseCounter(khanEl);
    }
  }

  function keepKhanKnockedCounterLive() {
    window.cancelAnimationFrame(khanSyncRaf);
    khanSyncUntil = performance.now() + 700;
    const tick = () => {
      const knocked = countOutsideOrdinary();
      const el = document.getElementById('score-knocked');
      if (el && Number.isFinite(Number(knocked))) el.textContent = String(Math.max(0, Number(knocked)));
      if (performance.now() < khanSyncUntil) khanSyncRaf = requestAnimationFrame(tick);
    };
    khanSyncRaf = requestAnimationFrame(tick);
  }

  function injectStyle() {
    if (document.getElementById('counter-sync-style')) return;
    const style = document.createElement('style');
    style.id = 'counter-sync-style';
    style.textContent = `
      .counter-sync-pop{animation:counterSyncPop .82s ease-out 1}
      @keyframes counterSyncPop{
        0%,100%{transform:scale(1);filter:brightness(1)}
        24%{transform:scale(1.14);filter:brightness(1.55)}
        54%{transform:scale(.99);filter:brightness(1.12)}
      }
    `;
    document.head.appendChild(style);
  }

  injectStyle();
  hookTicketCreation();

  window.addEventListener('X2_ALTYN_NORMAL_WIN_OUT', event => {
    syncCounters(event.detail || {}, false);
  });

  window.addEventListener('X2_ALTYN_KHAN_OUT', event => {
    syncCounters(event.detail || {}, true);
    keepKhanKnockedCounterLive();
  });
})();
