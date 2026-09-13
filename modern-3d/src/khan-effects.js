/* ALTYN KHAN Modern 3D v0.4.1 — amplified KHAN finale effects.
 * Presentation-only layer. Financial result remains LMS-authoritative.
 */
(() => {
  'use strict';

  const DURATION_MS = 1850;
  let lastTicket = '';
  let cleanupTimer = 0;

  function injectStyles() {
    if (document.getElementById('altyn-khan-effects-style')) return;
    const style = document.createElement('style');
    style.id = 'altyn-khan-effects-style';
    style.textContent = `
      .khan-moment{
        position:absolute;left:50%;top:43%;z-index:3;width:230px;height:230px;
        transform:translate(-50%,-50%);display:flex;flex-direction:column;
        align-items:center;justify-content:center;pointer-events:none;isolation:isolate;
        filter:drop-shadow(0 12px 30px rgba(0,0,0,.42));
        animation:altynKhanMoment ${DURATION_MS}ms cubic-bezier(.15,.76,.16,1) forwards
      }
      .khan-screen-flash{
        position:absolute;left:50%;top:50%;width:520px;height:520px;border-radius:50%;
        transform:translate(-50%,-50%) scale(.18);opacity:0;z-index:-3;
        background:radial-gradient(circle,rgba(255,248,210,.38) 0%,rgba(255,201,84,.20) 24%,rgba(255,135,18,.08) 47%,rgba(255,135,18,0) 70%);
        animation:altynKhanScreenFlash .82s ease-out forwards
      }
      .khan-core-flash{
        position:absolute;left:50%;top:50%;width:138px;height:138px;border-radius:50%;
        transform:translate(-50%,-50%) scale(.20);opacity:0;z-index:-1;
        background:radial-gradient(circle,rgba(255,255,244,.98) 0%,rgba(255,239,154,.88) 16%,rgba(255,184,52,.50) 43%,rgba(255,125,0,.15) 68%,rgba(255,125,0,0) 78%);
        box-shadow:0 0 28px rgba(255,250,210,.95),0 0 62px rgba(255,192,66,.78),0 0 105px rgba(255,120,16,.46);
        animation:altynKhanCoreFlash .82s ease-out forwards
      }
      .khan-ring{
        position:absolute;left:50%;top:50%;width:114px;height:114px;border-radius:50%;
        transform:translate(-50%,-50%) scale(.14);opacity:0;z-index:0;
        border:5px solid rgba(255,234,150,.98);
        box-shadow:0 0 0 3px rgba(255,190,42,.28),0 0 22px rgba(255,242,183,.92),0 0 48px rgba(255,179,48,.74),0 0 88px rgba(255,122,16,.44),inset 0 0 17px rgba(255,248,205,.50);
        will-change:transform,opacity;
        animation:altynKhanRingBlast 1.46s cubic-bezier(.09,.61,.16,1) forwards
      }
      .khan-ring-1{animation-delay:0s;border-width:6px}
      .khan-ring-2{animation-delay:.08s;width:128px;height:128px;border-color:rgba(255,251,220,.98)}
      .khan-ring-3{animation-delay:.17s;width:142px;height:142px;border-width:4px;border-color:rgba(255,199,66,.96)}
      .khan-ring-4{animation-delay:.27s;width:156px;height:156px;border-width:4px;border-color:rgba(255,226,126,.90)}
      .khan-ring-5{animation-delay:.39s;width:174px;height:174px;border-width:3px;border-color:rgba(255,177,38,.82)}
      .khan-moment strong{
        position:relative;z-index:2;color:#ffd45d;font-family:Georgia,'Times New Roman',serif;
        font-size:clamp(42px,10.6vw,68px);font-weight:950;line-height:.86;letter-spacing:.066em;
        text-shadow:0 3px 0 rgba(85,49,0,.74),0 0 18px rgba(255,238,164,.94),0 0 40px rgba(255,170,38,.72),0 0 74px rgba(255,115,14,.42)
      }
      .khan-moment b{
        position:relative;z-index:2;margin-top:10px;color:#fff;font-size:clamp(24px,6vw,38px);
        line-height:1;font-weight:950;text-shadow:0 2px 10px rgba(0,0,0,.64),0 0 20px rgba(255,218,112,.52)
      }
      .khan-moment.khan-x20{width:250px;height:250px}
      .khan-moment.khan-x20 strong{font-size:clamp(47px,11.6vw,74px)}
      .khan-moment.khan-x20 .khan-ring{border-width:6px;animation-name:altynKhanRingBlastMax;box-shadow:0 0 0 4px rgba(255,195,42,.34),0 0 26px rgba(255,247,196,.98),0 0 58px rgba(255,176,42,.88),0 0 108px rgba(255,100,12,.58),inset 0 0 22px rgba(255,250,215,.58)}
      .khan-moment.khan-x20 .khan-core-flash{box-shadow:0 0 34px rgba(255,255,225,1),0 0 78px rgba(255,196,70,.92),0 0 138px rgba(255,100,10,.62)}
      .khan-score-flash{animation:altynKhanScoreFlash 1.35s ease-out 1}
      @keyframes altynKhanMoment{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.44);filter:blur(9px)}
        13%{opacity:1;transform:translate(-50%,-50%) scale(1.19);filter:blur(0)}
        27%{transform:translate(-50%,-50%) scale(.98)}
        68%{opacity:1;transform:translate(-50%,-54%) scale(1.02)}
        100%{opacity:0;transform:translate(-50%,-70%) scale(.90)}
      }
      @keyframes altynKhanScreenFlash{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.18)}
        16%{opacity:1;transform:translate(-50%,-50%) scale(.78)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.55)}
      }
      @keyframes altynKhanCoreFlash{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.18);filter:blur(10px)}
        17%{opacity:1;transform:translate(-50%,-50%) scale(1.42);filter:blur(0)}
        48%{opacity:.84;transform:translate(-50%,-50%) scale(1.05)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.90)}
      }
      @keyframes altynKhanRingBlast{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.14);filter:blur(4px)}
        10%{opacity:1;filter:blur(0)}
        46%{opacity:.98}
        100%{opacity:0;transform:translate(-50%,-50%) scale(2.75)}
      }
      @keyframes altynKhanRingBlastMax{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.10);filter:blur(4px)}
        9%{opacity:1;filter:blur(0)}
        50%{opacity:1}
        100%{opacity:0;transform:translate(-50%,-50%) scale(3.18)}
      }
      @keyframes altynKhanScoreFlash{
        0%,100%{transform:scale(1);filter:brightness(1)}
        24%{transform:scale(1.24);filter:brightness(1.78)}
        52%{transform:scale(.98);filter:brightness(1.25)}
      }
      @media (max-width:380px){
        .khan-moment{width:200px;height:200px;top:43.5%}
        .khan-moment.khan-x20{width:216px;height:216px}
        .khan-screen-flash{width:430px;height:430px}
      }
    `;
    document.head.appendChild(style);
  }

  function multiplierText() {
    const text = (document.getElementById('score-khan')?.textContent || '').trim();
    if (/^×(?:10|15|20)$/.test(text)) return text;
    return '×10';
  }

  function ticketKey() {
    return (document.getElementById('ticket-number')?.textContent || '').trim();
  }

  function clearMoment() {
    window.clearTimeout(cleanupTimer);
    document.querySelector('.khan-moment')?.remove();
  }

  function showMoment(detail = null) {
    const layer = document.getElementById('celebration-layer');
    if (!layer) return;

    const eventTicket = detail?.ticketId ? `№ ${detail.ticketId}` : '';
    const ticket = eventTicket || ticketKey();
    if (ticket && ticket !== '№ —' && ticket === lastTicket) return;
    if (ticket && ticket !== '№ —') lastTicket = ticket;

    clearMoment();
    const eventMultiplier = Number(detail?.multiplier || 0);
    const multiplier = [10,15,20].includes(eventMultiplier) ? `×${eventMultiplier}` : multiplierText();
    const numeric = Number(multiplier.replace(/[^0-9.]/g, '')) || 10;

    const moment = document.createElement('div');
    moment.className = `khan-moment khan-x${numeric}`;
    moment.setAttribute('aria-hidden', 'true');

    const screenFlash = document.createElement('span');
    screenFlash.className = 'khan-screen-flash';
    const coreFlash = document.createElement('span');
    coreFlash.className = 'khan-core-flash';
    moment.append(screenFlash, coreFlash);

    for (let i = 1; i <= 5; i++) {
      const ring = document.createElement('span');
      ring.className = `khan-ring khan-ring-${i}`;
      moment.appendChild(ring);
    }

    const title = document.createElement('strong');
    title.textContent = 'ХАН';
    const value = document.createElement('b');
    value.textContent = multiplier;
    moment.append(title, value);
    layer.appendChild(moment);

    const score = document.getElementById('score-khan');
    const scoreCell = score?.closest('.score-cell');
    scoreCell?.classList.remove('khan-score-flash');
    if (scoreCell) {
      void scoreCell.offsetWidth;
      scoreCell.classList.add('khan-score-flash');
      window.setTimeout(() => scoreCell.classList.remove('khan-score-flash'), 1450);
    }

    cleanupTimer = window.setTimeout(() => moment.remove(), DURATION_MS + 180);
  }

  function bind() {
    injectStyles();
    const toast = document.getElementById('result-toast');
    if (!toast) return;

    window.addEventListener('X2_ALTYN_KHAN_OUT', event => {
      showMoment(event.detail || null);
    });

    const check = () => {
      if (!toast.classList.contains('show') || !toast.classList.contains('khan-win')) return;
      requestAnimationFrame(() => requestAnimationFrame(() => showMoment()));
    };

    new MutationObserver(check).observe(toast, {
      attributes: true,
      attributeFilter: ['class']
    });
    check();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once:true });
  else bind();
})();
