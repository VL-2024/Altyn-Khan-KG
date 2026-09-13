/* ALTYN KHAN Modern 3D v0.4.2: immediate, clearly tiered ordinary-win effects. */
(() => {
  'use strict';

  const S = window.X2AltynScenarioConfig || window.X2ChukoScenarioConfig;
  const C = window.CHUKO3D_CONFIG || {};
  const levels = {
    0.5: { cls:'x05', rings:1, flashScale:1.05, ringScale:1.85, popScale:1.04, glow:.48 },
    1:   { cls:'x1',  rings:1, flashScale:1.18, ringScale:2.05, popScale:1.08, glow:.60 },
    3:   { cls:'x3',  rings:2, flashScale:1.34, ringScale:2.35, popScale:1.13, glow:.76 },
    4:   { cls:'x4',  rings:3, flashScale:1.50, ringScale:2.62, popScale:1.18, glow:.90 },
    5:   { cls:'x5',  rings:4, flashScale:1.68, ringScale:2.92, popScale:1.24, glow:1.00 }
  };

  let lastKey = '';
  let cleanupTimer = 0;
  let activeTicket = null;

  function injectStyles() {
    if (document.getElementById('normal-win-fx-style')) return;
    const style = document.createElement('style');
    style.id = 'normal-win-fx-style';
    style.textContent = `
      .normal-win-fx{
        position:absolute;left:50%;top:46%;width:230px;height:230px;
        transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;
        pointer-events:none;z-index:3;isolation:isolate;
        --flash-scale:1.2;--ring-scale:2.2;--pop-scale:1.1;--glow:.7
      }
      .normal-win-flash{
        position:absolute;left:50%;top:50%;width:390px;height:390px;border-radius:50%;
        transform:translate(-50%,-50%) scale(.18);opacity:0;z-index:-2;
        background:radial-gradient(circle,rgba(248,255,255,.82) 0%,rgba(137,245,255,.46) 22%,rgba(72,207,255,.22) 42%,rgba(37,155,222,.07) 57%,rgba(37,155,222,0) 72%);
        animation:normalWinFlash .92s ease-out forwards
      }
      .normal-win-core{
        position:absolute;left:50%;top:50%;width:120px;height:120px;border-radius:50%;
        transform:translate(-50%,-50%) scale(.25);opacity:0;z-index:-1;
        background:radial-gradient(circle,rgba(255,255,255,.98),rgba(184,250,255,.78) 25%,rgba(83,214,255,.34) 52%,rgba(83,214,255,0) 74%);
        box-shadow:0 0 28px rgba(214,255,255,.92),0 0 65px rgba(91,226,255,.70);
        animation:normalWinCore .82s ease-out forwards
      }
      .normal-win-ring{
        position:absolute;left:50%;top:50%;width:116px;height:116px;border-radius:50%;
        transform:translate(-50%,-50%) scale(.18);opacity:0;
        border:4px solid rgba(224,253,255,.98);
        box-shadow:0 0 0 2px rgba(104,222,255,.18),0 0 22px rgba(154,246,255,.92),0 0 48px rgba(66,205,255,.58);
        animation:normalWinRing 1.15s cubic-bezier(.08,.62,.15,1) forwards
      }
      .normal-win-ring.r2{width:132px;height:132px;animation-delay:.09s;border-width:4px}
      .normal-win-ring.r3{width:148px;height:148px;animation-delay:.18s;border-width:3px}
      .normal-win-ring.r4{width:164px;height:164px;animation-delay:.28s;border-width:3px}
      .normal-win-value{
        position:relative;z-index:2;font-size:clamp(44px,10vw,64px);font-weight:950;line-height:1;
        color:#f8ffff;text-shadow:0 0 16px rgba(208,255,255,.96),0 0 34px rgba(88,224,255,.82),0 4px 10px rgba(0,35,60,.72);
        animation:normalWinValue 1.08s ease-out forwards
      }
      .normal-win-score{animation:normalWinScore 1.05s ease-out 1}
      .normal-win-fx.x05{--flash-scale:1.05;--ring-scale:1.85;--pop-scale:1.04;--glow:.48}
      .normal-win-fx.x1{--flash-scale:1.18;--ring-scale:2.05;--pop-scale:1.08;--glow:.60}
      .normal-win-fx.x3{--flash-scale:1.34;--ring-scale:2.35;--pop-scale:1.13;--glow:.76}
      .normal-win-fx.x4{--flash-scale:1.50;--ring-scale:2.62;--pop-scale:1.18;--glow:.90}
      .normal-win-fx.x5{--flash-scale:1.68;--ring-scale:2.92;--pop-scale:1.24;--glow:1}
      .normal-win-fx.x5 .normal-win-ring{border-width:5px;box-shadow:0 0 0 3px rgba(117,229,255,.22),0 0 28px rgba(203,255,255,.98),0 0 62px rgba(70,216,255,.76)}
      @keyframes normalWinFlash{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.18)}
        16%{opacity:var(--glow);transform:translate(-50%,-50%) scale(.68)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(var(--flash-scale))}
      }
      @keyframes normalWinCore{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.2);filter:blur(8px)}
        18%{opacity:var(--glow);transform:translate(-50%,-50%) scale(1.25);filter:blur(0)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.9)}
      }
      @keyframes normalWinRing{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.18);filter:blur(3px)}
        10%{opacity:1;filter:blur(0)}
        48%{opacity:.92}
        100%{opacity:0;transform:translate(-50%,-50%) scale(var(--ring-scale))}
      }
      @keyframes normalWinValue{
        0%{opacity:0;transform:scale(.52);filter:blur(5px)}
        18%{opacity:1;transform:scale(var(--pop-scale));filter:blur(0)}
        58%{opacity:1;transform:scale(1)}
        100%{opacity:0;transform:translateY(-22px) scale(.94)}
      }
      @keyframes normalWinScore{
        0%,100%{transform:scale(1);filter:brightness(1)}
        22%{transform:scale(1.2);filter:brightness(1.75)}
        52%{transform:scale(.98);filter:brightness(1.18)}
      }
      @media (max-width:380px){
        .normal-win-fx{width:205px;height:205px;top:46.5%}
        .normal-win-flash{width:330px;height:330px}
      }
    `;
    document.head.appendChild(style);
  }

  function show(multiplier, key) {
    const layer = document.getElementById('celebration-layer');
    const cfg = levels[multiplier];
    if (!layer || !cfg || key === lastKey) return;
    lastKey = key;
    clearTimeout(cleanupTimer);
    document.querySelector('.normal-win-fx')?.remove();

    const box = document.createElement('div');
    box.className = `normal-win-fx ${cfg.cls}`;
    box.setAttribute('aria-hidden', 'true');

    const flash = document.createElement('span');
    flash.className = 'normal-win-flash';
    const core = document.createElement('span');
    core.className = 'normal-win-core';
    box.append(flash, core);

    for (let i = 0; i < cfg.rings; i++) {
      const ring = document.createElement('span');
      ring.className = `normal-win-ring ${i === 1 ? 'r2' : i === 2 ? 'r3' : i === 3 ? 'r4' : ''}`;
      box.appendChild(ring);
    }

    const value = document.createElement('strong');
    value.className = 'normal-win-value';
    value.textContent = `×${multiplier}`;
    box.appendChild(value);
    layer.appendChild(box);

    const cell = document.getElementById('score-win')?.closest('.score-cell');
    cell?.classList.remove('normal-win-score');
    if (cell) {
      void cell.offsetWidth;
      cell.classList.add('normal-win-score');
    }

    cleanupTimer = setTimeout(() => {
      box.remove();
      cell?.classList.remove('normal-win-score');
    }, 1450);
  }

  function rememberTicket(ticket) {
    const scenario = Number(ticket?.scenario || 0);
    const item = S?.get?.(scenario);
    const multiplier = Number(item?.demoMultiplier ?? ticket?.multiplier ?? 0);
    if (!item || item.khan || !levels[multiplier] || item.regularMode !== 'fixed') {
      activeTicket = null;
      return ticket;
    }
    activeTicket = {
      ticketId: String(ticket?.ticketId || ''),
      scenario,
      multiplier,
      targetRegular: Number(item.regular || 0),
      armed: false,
      fired: false
    };
    return ticket;
  }

  function hookTicketCreation() {
    const lms = window.X2LMS;
    if (!lms || lms.__altynNormalWinHooked) return;
    ['createTicket', 'createDemoTicket'].forEach(name => {
      const original = lms[name];
      if (typeof original !== 'function') return;
      lms[name] = async function(...args) {
        const ticket = await original.apply(this, args);
        rememberTicket(ticket);
        return ticket;
      };
    });
    lms.__altynNormalWinHooked = true;
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

  function boundaryWatcher() {
    const ticket = activeTicket;
    if (ticket && !ticket.fired && ticket.targetRegular > 0) {
      const scene = window.BABYLON?.EngineStore?.LastCreatedScene;
      if (scene?.activeCamera) {
        let outside = 0;
        for (let i = 1; i <= Number(C.pile?.chukoCount || 11); i++) {
          const mesh = scene.getMeshByName?.(`chuko-${i}`);
          const metric = greenRingMetric(scene, mesh);
          if (metric != null && Number.isFinite(metric) && metric >= 1.02) outside++;
        }

        // A new ticket can be received while the previous result is still on
        // screen for a frame. Arm only after the new round is visibly below
        // its final target count; then fire the instant the last required
        // ordinary piece crosses the boundary on the final throw.
        if (!ticket.armed) {
          if (outside < ticket.targetRegular) ticket.armed = true;
        } else if (outside >= ticket.targetRegular) {
          ticket.fired = true;
          window.dispatchEvent(new CustomEvent('X2_ALTYN_NORMAL_WIN_OUT', {
            detail: {
              ticketId: ticket.ticketId,
              scenario: ticket.scenario,
              multiplier: ticket.multiplier
            }
          }));
        }
      }
    }
    requestAnimationFrame(boundaryWatcher);
  }

  function onWinEvent(event) {
    const d = event.detail || {};
    const scenario = Number(d.scenario ?? d.ticket?.scenario ?? 0);
    const item = S?.get?.(scenario);
    const multiplier = Number(d.multiplier ?? item?.demoMultiplier ?? 0);
    if (!item || item.khan || !levels[multiplier]) return;
    const ticketId = String(d.ticketId ?? d.ticket?.ticketId ?? `scenario-${scenario}-${Date.now()}`);
    requestAnimationFrame(() => show(multiplier, `${ticketId}:${scenario}`));
  }

  injectStyles();
  hookTicketCreation();
  requestAnimationFrame(boundaryWatcher);
  // Primary trigger: boundary crossing, matching KHAN timing.
  window.addEventListener('X2_ALTYN_NORMAL_WIN_OUT', onWinEvent);
  // Safety fallback only; lastKey prevents a duplicate for the same ticket.
  window.addEventListener('X2_GAME_ROUND_COMPLETE', onWinEvent);
})();
