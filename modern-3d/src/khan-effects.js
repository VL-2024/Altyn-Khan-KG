/* ALTYN KHAN Modern 3D v0.3.0 — KHAN finale effects.
 * Presentation-only layer. Financial result remains LMS-authoritative.
 */
(() => {
  'use strict';

  const DURATION_MS = 1450;
  let lastTicket = '';
  let cleanupTimer = 0;

  function injectStyles() {
    if (document.getElementById('altyn-khan-effects-style')) return;
    const style = document.createElement('style');
    style.id = 'altyn-khan-effects-style';
    style.textContent = `
      .khan-moment{position:absolute;left:50%;top:43%;z-index:3;width:172px;height:172px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;animation:altynKhanMoment ${DURATION_MS}ms cubic-bezier(.18,.72,.2,1) forwards}
      .khan-moment::before,.khan-moment::after{content:"";position:absolute;inset:18px;border-radius:50%;border:2px solid rgba(255,212,93,.84);box-shadow:0 0 18px rgba(255,212,93,.55),inset 0 0 18px rgba(255,185,54,.18);animation:altynKhanRing 1.10s ease-out forwards}
      .khan-moment::after{inset:35px;border-width:1px;animation-delay:.08s}
      .khan-moment strong{position:relative;z-index:2;color:#ffd45d;font-family:Georgia,'Times New Roman',serif;font-size:clamp(36px,9.8vw,58px);font-weight:950;line-height:.88;letter-spacing:.06em;text-shadow:0 3px 0 rgba(85,49,0,.70),0 0 15px rgba(255,212,93,.82),0 0 32px rgba(255,155,45,.48)}
      .khan-moment b{position:relative;z-index:2;margin-top:8px;color:#fff;font-size:clamp(22px,5.6vw,34px);line-height:1;font-weight:950;text-shadow:0 2px 9px rgba(0,0,0,.62),0 0 15px rgba(255,212,93,.40)}
      .khan-moment.khan-x20{width:190px;height:190px}.khan-moment.khan-x20 strong{font-size:clamp(41px,10.8vw,64px)}
      .khan-score-flash{animation:altynKhanScoreFlash 1.18s ease-out 1}
      @keyframes altynKhanMoment{0%{opacity:0;transform:translate(-50%,-50%) scale(.42);filter:blur(8px)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.16);filter:blur(0)}28%{transform:translate(-50%,-50%) scale(.97)}62%{opacity:1;transform:translate(-50%,-53%) scale(1)}100%{opacity:0;transform:translate(-50%,-70%) scale(.88)}}
      @keyframes altynKhanRing{0%{opacity:0;transform:scale(.42)}15%{opacity:1}100%{opacity:0;transform:scale(1.55)}}
      @keyframes altynKhanScoreFlash{0%,100%{transform:scale(1);filter:brightness(1)}28%{transform:scale(1.20);filter:brightness(1.55)}55%{transform:scale(.98);filter:brightness(1.18)}}
      @media (max-width:380px){.khan-moment{width:150px;height:150px;top:43.5%}.khan-moment.khan-x20{width:165px;height:165px}}
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

  function showMoment() {
    const layer = document.getElementById('celebration-layer');
    if (!layer) return;
    const ticket = ticketKey();
    if (ticket && ticket !== '№ —' && ticket === lastTicket) return;
    if (ticket && ticket !== '№ —') lastTicket = ticket;
    clearMoment();
    const multiplier = multiplierText();
    const numeric = Number(multiplier.replace(/[^0-9.]/g, '')) || 10;
    const moment = document.createElement('div');
    moment.className = `khan-moment khan-x${numeric}`;
    moment.setAttribute('aria-hidden', 'true');
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
      window.setTimeout(() => scoreCell.classList.remove('khan-score-flash'), 1250);
    }
    cleanupTimer = window.setTimeout(() => moment.remove(), DURATION_MS + 100);
  }

  function bind() {
    injectStyles();
    const toast = document.getElementById('result-toast');
    if (!toast) return;
    const check = () => {
      if (!toast.classList.contains('show') || !toast.classList.contains('khan-win')) return;
      requestAnimationFrame(() => requestAnimationFrame(showMoment));
    };
    new MutationObserver(check).observe(toast, { attributes:true, attributeFilter:['class'] });
    check();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once:true });
  else bind();
})();
