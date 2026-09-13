from pathlib import Path
import re

v = '0.4.7'

p = Path('index.html')
s = p.read_text()
s = s.replace('0.4.6', v)
p.write_text(s)

p = Path('src/config.js')
s = p.read_text()
s = re.sub(r"version: '0\.4\.\d+'", f"version: '{v}'", s, count=1)
p.write_text(s)

p = Path('styles.css')
s = p.read_text()

# Hint: 5px above controls and 5px below action row, enough for two lines.
s = s.replace('bottom:calc(0.4% + 45px);\n  height:42px;', 'bottom:calc(0.4% + 45px);\n  height:44px;', 1)
s = s.replace('font-size:clamp(14px,3.4vw,18px);font-weight:850;line-height:1.15;', 'font-size:clamp(16px,3.8vw,21px);font-weight:900;line-height:1.12;', 1)
s = s.replace(
    'flex:0 0 20px;width:20px;height:20px;padding:0;border-radius:50%;line-height:1;\n  border:1px solid rgba(255,255,255,.30);background:rgba(3,12,16,.55);color:rgba(255,255,255,.75);\n  font-size:11px;cursor:pointer',
    'flex:0 0 28px;width:28px;height:28px;padding:0;border-radius:50%;line-height:1;\n  border:2px solid rgba(219,230,60,.88);background:rgba(3,23,54,.92);color:#fff;\n  box-shadow:0 0 0 2px rgba(0,0,0,.18),0 0 12px rgba(219,230,60,.22);font-size:21px;font-weight:1000;cursor:pointer',
    1,
)
s = s.replace('bottom:calc(0.4% + 92px);height:5.8%;', 'bottom:calc(0.4% + 94px);height:5.8%;', 1)
s = s.replace('bottom:calc(0.4% + 97px + 5.8%);', 'bottom:calc(0.4% + 99px + 5.8%);', 1)

# Denomination.
s = s.replace('font-size:clamp(13px,2.8vw,17px);font-weight:950;text-align:center', 'font-size:clamp(18px,4.0vw,23px);font-weight:1000;text-align:center', 1)

# Info dropdown.
s = s.replace('width:190px;padding:8px;', 'width:214px;padding:9px;', 1)
s = s.replace('min-height:42px;padding:9px 11px;', 'min-height:46px;padding:10px 12px;', 1)
s = s.replace('background:#183f84;color:#fff;font-size:13px;font-weight:850;line-height:1.18;', 'background:#183f84;color:#fff;font-size:15px;font-weight:900;line-height:1.2;', 1)

# Dialogs and recent-ticket modal.
s = s.replace('font-size:clamp(18px,4.4vw,25px);font-weight:950', 'font-size:clamp(21px,5vw,29px);font-weight:1000', 1)
s = s.replace('font-size:clamp(13px,3vw,17px)', 'font-size:clamp(15px,3.5vw,20px)', 1)
s = s.replace('font-size:14px;font-weight:900;cursor:pointer', 'font-size:17px;font-weight:950;cursor:pointer', 1)
s = s.replace('font-size:clamp(11px,2.55vw,14px);font-weight:800;line-height:1.18', 'font-size:clamp(13px,3vw,17px);font-weight:850;line-height:1.22', 1)
s = s.replace('font-size:clamp(13px,3vw,17px);font-weight:950;white-space:nowrap', 'font-size:clamp(15px,3.4vw,19px);font-weight:1000;white-space:nowrap', 1)
s = s.replace('font-size:clamp(13px,2.9vw,16px)', 'font-size:clamp(15px,3.3vw,19px)', 1)
s = s.replace('font-size:clamp(13px,3vw,17px);line-height:1.34', 'font-size:clamp(15px,3.5vw,20px);line-height:1.38', 1)
s = s.replace('width:26px;height:26px;', 'width:30px;height:30px;', 1)

# Score cards: same font scale across all three cards.
s = s.replace('.score-label{font-size:clamp(10px,2.4vw,14px);font-weight:850;line-height:1.05;color:#b8c6db}', '.score-label{font-size:clamp(12px,2.9vw,16px);font-weight:950;line-height:1.05;color:#d3dceb}', 1)
s = s.replace('.score-value{font-size:clamp(19px,4.7vw,28px);font-weight:950;margin-top:3px;line-height:1;white-space:nowrap}', '.score-value{font-size:clamp(23px,5.4vw,32px);font-weight:1000;margin-top:4px;line-height:1;white-space:nowrap}', 1)
s = s.replace('.score-value.accent{color:#dbe63c;font-size:clamp(19px,4.7vw,28px);white-space:nowrap}', '.score-value.accent{color:#dbe63c;font-size:clamp(23px,5.4vw,32px);white-space:nowrap}', 1)

# Ticket and autoplay popup.
s = s.replace('font-size:clamp(12px,2.8vw,16px);font-weight:900;line-height:40px', 'font-size:clamp(13px,3.0vw,17px);font-weight:950;line-height:40px', 1)
s = s.replace('.autoplay-menu-title{margin-bottom:8px;color:#b8c6db;text-align:center;font-size:10px;font-weight:850}', '.autoplay-menu-title{margin-bottom:9px;color:#d0d9e7;text-align:center;font-size:13px;font-weight:900}', 1)
s = s.replace('color:#fff;font-size:12px;font-weight:950;cursor:pointer', 'color:#fff;font-size:15px;font-weight:1000;cursor:pointer', 1)

# Keep mobile typography readable instead of shrinking back down.
s = re.sub(
    r'@media\(max-width:380px\)\{.*?\n\}',
    '''@media(max-width:380px){
  .wallet{width:44%;padding:0 7px}
  .deposit{width:31px;height:31px}
  .action-row{left:4%;right:4%;gap:4px}
  .denom-select{flex-basis:24%;min-width:64px;font-size:18px}
  .action{font-size:16px}
  .autoplay-btn{flex-basis:31%;min-width:82px;font-size:16px}
  .bottom-tools{left:1.5%;right:1.5%;gap:5px}
  .bottom-controls{gap:4px}
  .mode-switch button{min-width:48px;padding:7px 5px;font-size:12px}
  .info-btn{min-width:66px;height:36px;padding:0 10px;font-size:13px}
  .audio-toggle{flex-basis:38px;width:38px;height:36px;font-size:19px}
  .bottom-tools>.ticket-number{font-size:12px;line-height:40px;padding-left:2px}
  .info-menu{width:205px}
  .hint-bar{left:4%;right:4%}
  .hint-text{font-size:15px}
  .score{left:2.5%;right:2.5%;gap:5px}
  .score-label{font-size:11px}
  .score-value,.score-value.accent{font-size:22px}
  .autoplay-menu{width:184px}
}''',
    s,
    count=1,
    flags=re.S,
)
p.write_text(s)

Path('BUILD.txt').write_text(
    'ORDO / ALTYN KHAN 3D build: 0.4.7\n'
    'Accessibility UI: larger denomination, info dialogs, score cards and hint close control\n'
    'Spacing: fixed 5px clearance above and below hint zone, including two-line hints\n'
    'Core mechanics/audio/scenarios unchanged from v0.4.6\n'
)
