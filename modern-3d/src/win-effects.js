/* ALTYN KHAN Modern 3D v0.4.0: ordinary win tiers. */
(() => {
  'use strict';
  const S = window.X2AltynScenarioConfig || window.X2ChukoScenarioConfig;
  const levels = {0.5:['x05',0],1:['x1',0],3:['x3',1],4:['x4',2],5:['x5',3]};
  let last = '';

  function styles() {
    if (document.getElementById('normal-win-fx-style')) return;
    const e = document.createElement('style');
    e.id = 'normal-win-fx-style';
    e.textContent = `
      .normal-win-fx{position:absolute;left:50%;top:47%;width:210px;height:210px;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2;--power:1}
      .normal-win-fx:before{content:"";position:absolute;width:310px;height:310px;border-radius:50%;background:radial-gradient(circle,rgba(238,255,255,.64),rgba(105,235,255,.25) 30%,rgba(45,180,225,0) 70%);animation:nwf .9s ease-out forwards}
      .normal-win-ring{position:absolute;width:118px;height:118px;border:3px solid rgba(210,253,255,.94);border-radius:50%;box-shadow:0 0 18px rgba(125,240,255,.72);animation:nwr 1s ease-out forwards}
      .normal-win-ring.r2{animation-delay:.10s;width:140px;height:140px}.normal-win-ring.r3{animation-delay:.20s;width:160px;height:160px}
      .normal-win-value{position:relative;font-size:46px;font-weight:950;color:#f7ffff;text-shadow:0 0 18px rgba(130,244,255,.88),0 3px 8px rgba(0,35,60,.7);animation:nwv 1s ease-out forwards}
      .normal-win-fx.x05{--power:.55}.normal-win-fx.x1{--power:.70}.normal-win-fx.x3{--power:.88}.normal-win-fx.x4{--power:1.02}.normal-win-fx.x5{--power:1.18}
      .normal-win-score{animation:nws .9s ease-out 1}
      @keyframes nwf{0%{opacity:0;transform:scale(.2)}18%{opacity:calc(.55 * var(--power));transform:scale(calc(.72 * var(--power)))}100%{opacity:0;transform:scale(calc(1.15 * var(--power)))}}
      @keyframes nwr{0%{opacity:0;transform:scale(.25)}14%{opacity:.9}100%{opacity:0;transform:scale(calc(2.15 * var(--power)))}}
      @keyframes nwv{0%{opacity:0;transform:scale(.55)}20%{opacity:1;transform:scale(calc(.92 + .16 * var(--power)))}65%{opacity:1;transform:scale(1)}100%{opacity:0;transform:translateY(-18px) scale(.94)}}
      @keyframes nws{0%,100%{transform:scale(1);filter:brightness(1)}25%{transform:scale(1.15);filter:brightness(1.5)}}
    `;
    document.head.appendChild(e);
  }

  function show(mult, key) {
    const layer = document.getElementById('celebration-layer');
    const cfg = levels[mult];
    if (!layer || !cfg || key === last) return;
    last = key;
    document.querySelector('.normal-win-fx')?.remove();
    const box = document.createElement('div');
    box.className = `normal-win-fx ${cfg[0]}`;
    for (let i=0; i<cfg[1]; i++) {
      const ring = document.createElement('span');
      ring.className = `normal-win-ring ${i===1?'r2':i===2?'r3':''}`;
      box.appendChild(ring);
    }
    const value = document.createElement('strong');
    value.className = 'normal-win-value';
    value.textContent = `×${mult}`;
    box.appendChild(value);
    layer.appendChild(box);
    const cell = document.getElementById('score-win')?.closest('.score-cell');
    cell?.classList.add('normal-win-score');
    setTimeout(() => { box.remove(); cell?.classList.remove('normal-win-score'); }, 1250);
  }

  function complete(ev) {
    const d = ev.detail || {};
    const scenario = Number(d.scenario ?? d.ticket?.scenario ?? 0);
    const item = S?.get?.(scenario);
    if (!item || item.khan || !levels[item.demoMultiplier]) return;
    const id = String(d.ticket?.ticketId || 'round');
    requestAnimationFrame(() => show(item.demoMultiplier, `${id}:${scenario}`));
  }

  styles();
  window.addEventListener('X2_GAME_ROUND_COMPLETE', complete);
})();
