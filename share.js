/* share.js: the shared screen. Someone in the meeting shares their computer screen: a spreadsheet, a slide deck or
   (by mistake) their whole desktop. Everything is drawn in HTML and CSS on a 1280 x 720 "screen", then scaled to fit,
   the way a real screen share is scaled down on your side. No images, so it stays light and sharp on any display.

   The office apps and the operating system are lookalikes, drawn after the real ones. Their names use one look-alike
   letter (a Cyrillic е or і), the same trick as the meeting apps' names, and their icons are our own drawings.
   Screen readers get plain words instead (see shareLabel). */

const APP_NAME = { excel: 'Excеl', ppt: 'PowerPoіnt', edge: 'Edgе' };

/* Numbers people say out loud are drawn once per meeting, so the spreadsheet shows what the captions say. */
const PCT_WORDS = { eight: 8, twelve: 12, fifteen: 15, eighteen: 18, twenty: 20, 'twenty-five': 25, thirty: 30 };
const K_WORDS = { twenty: 20, 'thirty-five': 35, forty: 40, sixty: 60, eighty: 80, 'a hundred and twenty': 120 };

/* ---------- what each meeting shares ----------
   Topics share during the agenda, one step per agenda item. The comedy shares at fixed moments of its timeline. */
const SHARE_TOPICS = {
  'Finance': { os: 'win', app: 'excel', file: 'Q3 numbers.xlsx', steps: 4 },
  'Absurd corporate training': { os: 'mac', app: 'ppt', file: 'Email etiquette - Module 7 of 12.pptx', steps: 4 }
};
/* the comedy: Doug shares his whole desktop by mistake; later Brenda shows the company values poster */
const SHARE_SAMPLE = {
  humor: [
    { by: 'doug', os: 'win', app: 'desktop', from: 164.4, to: 189.0, steps: [[164.4, 0], [175.3, 1], [179.2, 2]] },
    { by: 'brenda', os: 'mac', app: 'ppt', file: 'Company values FINAL.pptx', poster: true, from: 503.6, to: 531.6, steps: [[503.6, 0]] }
  ]
};

/* ---------- small drawing helpers ---------- */
const sx = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = (w, h, body, extra = '') => `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
const G = {
  min: '<path d="M6 12h12"/>', max: '<rect x="6" y="6" width="12" height="12" rx="1"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>', undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>',
  redo: '<path d="M15 7l5 5-5 5"/><path d="M20 12H10a6 6 0 0 0 0 12"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  down: '<path d="M7 10l5 5 5-5"/>', paste: '<rect x="6" y="5" width="12" height="16" rx="1.5"/><path d="M9 5V3h6v2"/>',
  bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', ital: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>',
  under: '<path d="M7 4v7a5 5 0 0 0 10 0V4M6 21h12"/>', border: '<rect x="4" y="4" width="16" height="16"/><path d="M4 12h16M12 4v16" stroke-dasharray="2 2"/>',
  fill: '<path d="M5 13l7-7 6 6-7 7z"/><path d="M19 15s2 2.5 2 3.5a2 2 0 0 1-4 0c0-1 2-3.5 2-3.5"/>', fcolor: '<path d="M7 17l5-12 5 12M9 12.5h6"/>',
  left: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>', center: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>', wrap: '<path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4M15 16l-2 2 2 2M4 18h5"/>',
  merge: '<rect x="3" y="6" width="18" height="12"/><path d="M8 12h8M10 10l-2 2 2 2M14 10l2 2-2 2"/>', sum: '<path d="M18 5H6l6 7-6 7h12"/>',
  sort: '<path d="M4 6h16l-6 7v6l-4-2v-4z"/>', cf: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 10h16M4 16h16M10 4v16"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 9h16M9 9v10M15 9v10"/>', fx: '', comment: '<path d="M4 5h16v11H9l-5 4z"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r=".8" fill="currentColor"/>',
  vol: '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  batt: '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/><rect x="4" y="9" width="11" height="6" rx="1" fill="currentColor" stroke="none"/>',
  up: '<path d="M7 14l5-5 5 5"/>', plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M15 6l-6 6 6 6"/>', fwd: '<path d="M9 6l6 6-6 6"/>',
  reload: '<path d="M19 12a7 7 0 1 1-2-5M19 4v4h-4"/>', star: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
  dots: '<circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>', grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'
};
const g = (k, s = 16, extra = '') => svg(s, s, G[k], extra);

/* the app icons on the taskbar, title bars and dock: our own simple drawings in each app's colours */
function appIcon(kind, s = 20) {
  const r = Math.round(s * 0.22);
  const box = (bg, inner) => `<span class="sh-ai" style="width:${s}px;height:${s}px;border-radius:${r}px;background:${bg}">${inner}</span>`;
  const letter = (t, c = '#fff') => `<b style="font-size:${Math.round(s * 0.55)}px;color:${c}">${t}</b>`;
  if (kind === 'excel') return box('linear-gradient(135deg,#21A366,#107C41)', `<svg width="${s * .62}" height="${s * .62}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M3 9h18M3 15h18M9 3v18" stroke="#fff" stroke-width="1.6"/></svg>`);
  if (kind === 'ppt') return box('linear-gradient(135deg,#ED6C47,#C43E1C)', `<svg width="${s * .62}" height="${s * .62}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 4v8h8" fill="#fff" stroke="#fff" stroke-width="1"/></svg>`);
  if (kind === 'edge') return `<span class="sh-ai" style="width:${s}px;height:${s}px;border-radius:50%;background:conic-gradient(from 200deg,#0C59A4,#1B9DE2,#35C1F1,#50E6A0,#1B9DE2)"><span style="width:${s * .42}px;height:${s * .42}px;border-radius:50%;background:#fff;opacity:.9"></span></span>`;
  if (kind === 'files') return box('linear-gradient(180deg,#FFD866,#F2B532)', '');
  if (kind === 'chat') return box('linear-gradient(135deg,#7B83EB,#4B53BC)', letter('T'));
  if (kind === 'mail') return box('linear-gradient(135deg,#28A8EA,#0A64AD)', `<svg width="${s * .6}" height="${s * .6}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="1.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M3 7l9 6 9-6" fill="none" stroke="#fff" stroke-width="2"/></svg>`);
  if (kind === 'store') return box('linear-gradient(135deg,#3A96DD,#1F5FA8)', '');
  if (kind === 'finder') return box('linear-gradient(90deg,#5AC8FA 50%,#E9F2FF 50%)', '');
  if (kind === 'safari') return `<span class="sh-ai" style="width:${s}px;height:${s}px;border-radius:${r}px;background:#fff"><span style="width:${s * .8}px;height:${s * .8}px;border-radius:50%;background:radial-gradient(circle,#4FC3F7,#1E88E5)"></span></span>`;
  if (kind === 'meet') return box('#fff', letter('M', '#5B5FC7'));
  return box('#888', '');
}
/* a start button in the style of Windows 11 */
const startBtn = s => `<span class="sh-start" style="width:${s}px;height:${s}px">${[0, 1, 2, 3].map(() => '<i></i>').join('')}</span>`;

/* ---------- Windows 11 ---------- */
function winTaskbar(apps, active, now) {
  const t = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const d = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  return `<div class="sh-task">
    <div class="sh-task-mid">${startBtn(22)}<span class="sh-tsearch">${g('search', 14)}<span>Search</span></span>
      ${apps.map(a => `<span class="sh-tapp${a === active ? ' on' : ''}">${appIcon(a, 24)}</span>`).join('')}</div>
    <div class="sh-tray">${g('up', 14)}<span class="sh-trayic">${g('wifi', 15)}${g('vol', 15)}${g('batt', 16)}</span><span class="sh-clock"><span>${t}</span><span>${d}</span></span></div></div>`;
}
function winTitleButtons(color) {
  return `<span class="sh-wbtns" style="color:${color}"><span>${g('min', 15)}</span><span>${svg(13, 13, '<rect x="5" y="5" width="14" height="14" rx="2"/>')}</span><span class="x">${g('close', 15)}</span></span>`;
}

/* ---------- the spreadsheet: Finance, Q3 numbers ---------- */
const money = n => '$' + n.toLocaleString('en-US');
function financeSheets(nums) {
  const pct = nums.pct / 100, rev0 = 4180, rev1 = Math.round(rev0 * (1 + pct)), exist0 = 3120, exist1 = Math.round(exist0 * (1 + pct * 1.45));
  const new0 = rev0 - exist0, new1 = rev1 - exist1;
  const yoy = (a, b) => ((b - a) / a * 100).toFixed(1) + '%';
  return [
    { tab: 'Summary', title: 'Q3 at a glance ($ thousands)', head: ['', 'Q3 last year', 'Q3 this year', 'Year over year', 'Forecast'],
      rows: [['Revenue', rev0, rev1, yoy(rev0, rev1), Math.round(rev1 * 0.985)], ['  Existing customers', exist0, exist1, yoy(exist0, exist1), Math.round(exist1 * 0.97)],
        ['  New business', new0, new1, yoy(new0, new1), Math.round(new1 * 1.12)], ['Gross margin', '59.8%', '60.2%', '+0.4 pts', '60.0%'],
        ['Operating expenses', 2240, 2465, yoy(2240, 2465), 2410], ['Operating income', 260, Math.round(rev1 * 0.602 - 2465), yoy(260, Math.round(rev1 * 0.602 - 2465)), 232]],
      sel: [2, 3], chart: [['Q4', 3720], ['Q1', 3850], ['Q2', 4010], ['Q3', rev1]] },
    { tab: 'Margins', title: 'Costs against budget ($ thousands)', head: ['', 'Budget', 'Actual', 'Variance', 'Note'],
      rows: [['Hosting', 410, 468, '+14.1%', 'Renegotiating next month'], ['Payroll', 1520, 1584, '+4.2%', 'Two hires in August'], ['Marketing', 300, 300, '0.0%', 'On budget'],
        ['Travel', 120, 71, '-40.8%', 'Well under'], ['Software', 145, 152, '+4.8%', 'Renewals'], ['Total', 2495, 2575, '+3.2%', '']],
      sel: [1, 3] },
    { tab: 'Cash', title: 'Receivables by age ($ thousands)', head: ['', 'Current', '1-30 days', '31-60 days', '60+ days'],
      rows: [['Enterprise', 1210, 340, 95, Math.round(nums.k * 0.8)], ['Mid-market', 640, 180, 60, Math.round(nums.k * 0.15)], ['Small business', 220, 75, 28, nums.k - Math.round(nums.k * 0.8) - Math.round(nums.k * 0.15)],
        ['Total', 2070, 595, 183, nums.k], ['', '', '', '', ''], ['Cash on hand', 9840, '', 'Runway', '18 months']],
      sel: [4, 4] },
    { tab: 'Outlook', title: 'Full year outlook ($ thousands)', head: ['', 'Previous', 'Revised', 'Change', 'Depends on'],
      rows: [['Revenue', 16200, 16650, '+2.8%', 'Two large deals in Q4'], ['Gross margin', '59.5%', '60.0%', '+0.5 pts', ''], ['Operating income', 820, 905, '+10.4%', ''],
        ['Books closed', '', '', '', 'By the 10th'], ['Board pack', '', '', '', 'Next week'], ['Audit prep', '', '', '', 'Starts next month']],
      sel: [0, 2] }
  ];
}
const COLS = 'ABCDEFGHIJKL';
function excelScreen(file, step, nums, now, who) {
  const sheets = financeSheets(nums), sh = sheets[Math.max(0, Math.min(sheets.length - 1, step))];
  const [sr, sc] = sh.sel;   /* the selected cell, by data row and column (0 = labels) */
  const cellRef = COLS[sc] + (sr + 3);
  const fmt = v => typeof v === 'number' ? v.toLocaleString('en-US') : sx(v);
  const selVal = sh.rows[sr][sc];
  const widths = [190, 120, 120, 130, 190, 90, 90, 90, 90, 90, 90];
  const colHead = `<tr><th class="corner"></th>${widths.map((w, i) => `<th style="width:${w}px"${i === sc ? ' class="hs"' : ''}>${COLS[i]}</th>`).join('')}</tr>`;
  const rowsHtml = [];
  for (let r = 1; r <= 17; r++) {
    let cells;
    if (r === 1) cells = [`<td class="b big">${sx(sh.title)}</td>`, ...widths.slice(1).map(() => '<td></td>')];
    else if (r === 2) cells = sh.head.map((h, i) => `<td class="b hd${i ? ' n' : ''}">${sx(h)}</td>`).concat(widths.slice(sh.head.length).map(() => '<td></td>'));
    else if (r - 3 < sh.rows.length) {
      const row = sh.rows[r - 3];
      cells = row.map((v, i) => {
        const total = /^(Total|Revenue|Operating income)$/.test(String(row[0]).trim());
        const cls = [i ? 'n' : '', total ? 'b' : '', i === sc && r - 3 === sr ? 'sel' : '', typeof v === 'string' && /^[+-]?\d/.test(v) && v.startsWith('-') ? 'neg' : ''].filter(Boolean).join(' ');
        return `<td${cls ? ` class="${cls}"` : ''}>${i === 0 ? sx(String(v)).replace(/^ {2}/, '&emsp;') : fmt(v)}</td>`;
      }).concat(widths.slice(row.length).map(() => '<td></td>'));
    } else cells = widths.map(() => '<td></td>');
    rowsHtml.push(`<tr><th${r === sr + 3 ? ' class="hs"' : ''}>${r}</th>${cells.join('')}</tr>`);
  }
  const chart = sh.chart ? (() => {
    const max = Math.max(...sh.chart.map(c => c[1]));
    return `<div class="sh-xchart"><div class="t">Revenue by quarter</div><div class="bars">${sh.chart.map(([q, v]) => `<div class="bar"><i style="height:${Math.round(v / max * 150)}px"></i><span>${q}</span></div>`).join('')}</div></div>`;
  })() : '';
  const tabs = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate', 'Help'];
  const sum = sh.rows.map(r => r[sc]).filter(v => typeof v === 'number');
  return `<div class="sh-screen sh-win">
    <div class="sh-xwin">
      <div class="sh-xtitle">
        <span class="l">${appIcon('excel', 18)}<span class="as">AutoSave <span class="tog"><i></i></span> Off</span>${g('save', 16)}${g('undo', 15)}${g('redo', 15)}${g('down', 12)}</span>
        <span class="m">${sx(file.replace(/\.xlsx$/, ''))} &bull; Saved to this PC ${g('down', 11)}</span>
        <span class="r"><span class="srch">${g('search', 14)}Search</span><span class="me">${sx(initials(who || ''))}</span>${winTitleButtons('#fff')}</span>
      </div>
      <div class="sh-xtabs">${tabs.map(t => `<span${t === 'Home' ? ' class="on"' : ''}>${t}</span>`).join('')}<span class="sp"></span><span class="cm">${g('comment', 14)} Comments</span><span class="shr">${g('up', 13)} Share ${g('down', 11)}</span></div>
      <div class="sh-xribbon">
        <span class="grp">${g('paste', 22)}<span class="lbl">Paste</span></span><i class="sep"></i>
        <span class="grp col"><span class="row"><span class="dd w">Aptos Narrow ${g('down', 10)}</span><span class="dd">11 ${g('down', 10)}</span></span><span class="row">${g('bold', 15)}${g('ital', 15)}${g('under', 15)}${g('border', 15)}${g('fill', 15)}${g('fcolor', 15)}</span></span><i class="sep"></i>
        <span class="grp col"><span class="row">${g('left', 15)}${g('center', 15)}${g('wrap', 15)}</span><span class="row">${g('merge', 15)}<span class="lbl">Merge &amp; Center</span></span></span><i class="sep"></i>
        <span class="grp col"><span class="row"><span class="dd w">${typeof selVal === 'number' ? 'Number' : 'General'} ${g('down', 10)}</span></span><span class="row"><b class="cur">$</b><b class="cur">%</b><b class="cur">,</b><b class="cur">.0</b><b class="cur">.00</b></span></span><i class="sep"></i>
        <span class="grp">${g('cf', 20)}<span class="lbl">Conditional<br>Formatting</span></span><span class="grp">${g('table', 20)}<span class="lbl">Format as<br>Table</span></span><i class="sep"></i>
        <span class="grp">${g('sum', 20)}<span class="lbl">AutoSum</span></span><span class="grp">${g('sort', 20)}<span class="lbl">Sort &amp;<br>Filter</span></span>
      </div>
      <div class="sh-xfx"><span class="nb">${cellRef} ${g('down', 10)}</span><span class="ic">${g('close', 13)}<span class="ok">&#10003;</span><i>fx</i></span><span class="v">${typeof selVal === 'number' ? selVal : sx(selVal)}</span></div>
      <div class="sh-xgrid"><table>${colHead}${rowsHtml.join('')}</table>${chart}</div>
      <div class="sh-xsheets"><span class="nav">${g('back', 12)}${g('fwd', 12)}</span>${sheets.map(s => `<span class="st${s === sh ? ' on' : ''}">${s.tab}</span>`).join('')}<span class="add">${g('plus', 14)}</span><span class="sp"></span></div>
      <div class="sh-xstatus"><span>Ready</span><span class="sp"></span>${sum.length > 1 ? `<span>Average: ${Math.round(sum.reduce((a, b) => a + b, 0) / sum.length).toLocaleString('en-US')}</span><span>Count: ${sum.length}</span><span>Sum: ${sum.reduce((a, b) => a + b, 0).toLocaleString('en-US')}</span>` : ''}<span class="views">${g('grid', 13)}</span><span class="zoom">${g('min', 12)}<i><b></b></i>${g('plus', 12)} 100%</span></div>
    </div>
    ${winTaskbar(['files', 'edge', 'mail', 'chat', 'excel', 'store'], 'excel', now)}
  </div>`;
}

/* ---------- slides: Mandatory training (and the comedy's values poster) ---------- */
const TRAINING_SLIDES = [
  { n: 3, title: 'Icebreaker', sub: 'Share your favourite spreadsheet', bullets: ['Rename yourself: your name + a fruit that represents your work style', 'Example: Pineapple. Tough outside, collaborative inside.', 'There are no wrong answers*'], foot: '*except on the quiz' },
  { n: 14, title: 'Reply all: a powerful tool', sub: 'Before you reply all, ask yourself:', list: ['Does everyone need to read this?', 'Does anyone need to read this?', 'Is this a fire extinguisher or a leaf blower?', 'Would the printer in Belgium agree?'], foot: 'Questions 5 to 40 continue on the next 9 slides' },
  { n: 22, title: 'Group exercise', sub: 'Breakout rooms of one · 4 minutes', flow: ['Meeting', 'Email', 'Meeting'], foot: 'Please nominate a spokesperson (whoever forgot to mute)' },
  { n: 31, title: 'Quiz: question 1 of 12', sub: 'What is the ideal font for an apology?', options: ['Comic Sans, 14 pt', 'Calibri, 11 pt, with a sincere tone', 'Papyrus', 'All capitals, for clarity'], foot: 'You need 80% to pass. You may retake the quiz until you pass.' }
];
const VALUES_POSTER = { letters: [['S', 'Synergy'], ['Y', 'Yes to synergy'], ['N', 'Now, more synergy'], ['E', 'Everyone, synergy'], ['R', 'Relentless synergy'], ['G', 'Go team (synergy)'], ['Y', 'Yes, again']] };

function slideHtml(sl, deckTitle, total) {
  if (sl.poster) return `<div class="sh-slide poster"><div class="pt">Our values</div><div class="word">${VALUES_POSTER.letters.map(([l]) => `<b>${l}</b>`).join('')}</div>
    <div class="defs">${VALUES_POSTER.letters.map(([l, d]) => `<span><b>${l}</b>${sx(d)}</span>`).join('')}</div><div class="pf">Brought to you by Leadership</div></div>`;
  let body = '';
  if (sl.bullets) body = `<ul>${sl.bullets.map(b => `<li>${sx(b)}</li>`).join('')}</ul>`;
  if (sl.list) body = `<ol>${sl.list.map(b => `<li>${sx(b)}</li>`).join('')}</ol>`;
  if (sl.flow) body = `<div class="flow">${sl.flow.map(f => `<span class="box">${f}</span>`).join('<span class="arr">&rarr;</span>')}<span class="loop">&#8635; and back again</span></div>`;
  if (sl.options) body = `<div class="opts">${sl.options.map((o, i) => `<span><b>${'ABCD'[i]}</b>${sx(o)}</span>`).join('')}</div>`;
  return `<div class="sh-slide"><div class="band"></div><div class="hd"><div class="t">${sx(sl.title)}</div><div class="s">${sx(sl.sub)}</div></div>${body}
    <div class="ft"><span>${sx(deckTitle)}</span><span>${sx(sl.foot || '')}</span><span>${sl.n}</span></div></div>`;
}
function macMenuBar(app, menus, now) {
  const t = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + '  ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `<div class="sh-mbar"><span class="l"><b>${app}</b>${menus.map(m => `<span>${m}</span>`).join('')}</span><span class="r">${g('batt', 16)}${g('wifi', 14)}${g('search', 13)}<span>${t}</span></span></div>`;
}
/* PowerPoint on a Mac: for a moment the editing window, then the slide show fills the screen */
function pptScreen(share, step, mode, now) {
  const poster = !!share.poster;
  const slides = poster ? [{ poster: true, n: 1 }] : TRAINING_SLIDES;
  const sl = slides[Math.max(0, Math.min(slides.length - 1, step))];
  const deck = poster ? 'Company values' : 'Mandatory training · Module 7 of 12';
  if (mode === 'show') return `<div class="sh-screen sh-show">${slideHtml(sl, deck, slides.length)}</div>`;
  const total = poster ? 1 : 38;
  const thumbs = (poster ? [sl] : [{ n: sl.n - 1 }, sl, { n: sl.n + 1 }, { n: sl.n + 2 }]).map(t => `<div class="th${t === sl ? ' on' : ''}"><span>${t.n}</span><div>${t === sl ? `<div class="mini">${slideHtml(sl, deck, total)}</div>` : '<i></i><i></i><i></i>'}</div></div>`).join('');
  const tabs = ['Home', 'Insert', 'Draw', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Record', 'Review', 'View'];
  return `<div class="sh-screen sh-mac">${macMenuBar(APP_NAME.ppt, ['File', 'Edit', 'View', 'Insert', 'Format', 'Arrange', 'Tools', 'Slide Show', 'Window', 'Help'], now)}
    <div class="sh-pwin">
      <div class="sh-ptitle"><span class="lights"><i></i><i></i><i></i></span><span class="tools">${g('save', 15)}${g('undo', 14)}${g('redo', 14)}</span><span class="m">${appIcon('ppt', 16)} ${sx(share.file)}</span><span class="srch">${g('search', 13)} Search</span></div>
      <div class="sh-ptabs">${tabs.map(t => `<span${t === 'Slide Show' ? ' class="on"' : ''}>${t}</span>`).join('')}<span class="sp"></span><span class="play">${g('play', 12)} Play from Start</span><span class="shr">Share</span></div>
      <div class="sh-pribbon"><span class="big">${g('play', 22)}<span>Play from<br>Start</span></span><span class="big">${g('play', 22)}<span>Play from<br>Current Slide</span></span><i class="sep"></i><span class="big">${g('grid', 22)}<span>Presenter<br>View</span></span><span class="big">${g('cf', 22)}<span>Rehearse<br>with Coach</span></span><i class="sep"></i><span class="chk">&#9745; Use Timings</span><span class="chk">&#9745; Play Narrations</span></div>
      <div class="sh-pbody"><div class="sh-pthumbs">${thumbs}</div><div class="sh-pmain"><div class="slidewrap">${slideHtml(sl, deck, total)}</div><div class="notes">Click to add notes</div></div></div>
      <div class="sh-pstatus"><span>Slide ${sl.n} of ${total}</span><span>English (United States)</span><span class="sp"></span><span>Notes</span><span>Comments</span><span>${g('grid', 12)}</span><span>114%</span></div>
    </div></div>`;
}

/* ---------- Doug's desktop: a browser with tabs he would rather nobody saw ---------- */
const DOUG_TABS = [
  { t: 'how to sound smart in meetings', results: ['10 phrases that make you sound smart in any meeting', 'What does "let’s take this offline" actually mean?', 'How to nod thoughtfully: a step-by-step guide', 'Is "circle back" a real verb? Experts weigh in'] },
  { t: 'is it bad if my plant is shiny', results: ['Why are my plant’s leaves shiny? 5 common causes', 'Shiny leaves: healthy glow or something sticky?', 'Plant forum: "My plant looks like it was waxed"', 'Do plants like desk lamps? What to know'] },
  { t: 'morale survey chart FINAL (2).xlsx', results: [] }
];
function dougScreen(step, now) {
  const tab = DOUG_TABS[Math.min(step, 1)];
  const icons = [['bin', 'Recycle Bin'], ['xlsx', 'morale chart FINAL.xlsx'], ['xlsx', 'morale chart FINAL (2).xlsx'], ['pdf', 'desk lamp receipt.pdf'], ['folder', 'New folder (3)']];
  const icon = k => k === 'xlsx' ? appIcon('excel', 34) : k === 'pdf' ? `<span class="sh-file pdf">PDF</span>` : k === 'folder' ? appIcon('files', 34) : `<span class="sh-file bin">${g('close', 18)}</span>`;
  return `<div class="sh-screen sh-win sh-desk">
    <div class="sh-icons">${icons.map(([k, n]) => `<span class="di">${icon(k)}<span>${sx(n)}</span></span>`).join('')}</div>
    <div class="sh-bwin">
      <div class="sh-btabs">${appIcon('edge', 16)}${DOUG_TABS.map(t => `<span class="bt${t === tab ? ' on' : ''}">${t.results.length ? g('search', 12) : appIcon('excel', 12)}<span>${sx(t.t)}${t.results.length ? ' - Search' : ''}</span>${g('close', 11)}</span>`).join('')}<span class="nt">${g('plus', 14)}</span><span class="sp"></span>${winTitleButtons('#222')}</div>
      <div class="sh-baddr">${g('back', 16)}${g('fwd', 16)}${g('reload', 15)}<span class="url">${g('search', 13)} ${sx(tab.t)}</span>${g('star', 15)}${g('dots', 16)}</div>
      <div class="sh-bpage"><div class="sbox">${g('search', 16)} ${sx(tab.t)}</div><div class="cnt">About ${(1.2e6 + step * 3.4e5).toLocaleString('en-US')} results</div>
        ${tab.results.map((r, i) => `<div class="res"><span class="u">www.example-answers.com &rsaquo; ${i ? 'advice' : 'work-life'}</span><span class="h">${sx(r)}</span><span class="d">${i ? 'Updated 3 days ago. ' : ''}A quick read for anyone who has ever said "great point" without hearing the point.</span></div>`).join('')}</div>
    </div>
    ${step === 2 ? `<div class="sh-toast">${g('comment', 16)}<div><b>Gary Pike</b><span>you are still sharing</span></div></div>` : ''}
    ${winTaskbar(['files', 'edge', 'mail', 'chat', 'excel'], 'edge', now)}
  </div>`;
}

/* ---------- the whole screen, for the current step ---------- */
function screenHtml(share, step, mode, nums, now, who) {   /* who: the presenter's name, for the account picture in the title bar */
  if (share.app === 'excel') return excelScreen(share.file, step, nums, now, who);
  if (share.app === 'ppt') return pptScreen(share, step, mode, now);
  if (share.app === 'desktop') return dougScreen(step, now);
  return '';
}
function shareLabel(share) {
  return share.app === 'excel' ? 'A spreadsheet' : share.app === 'ppt' ? 'A slide presentation' : 'A computer desktop with a web browser open';
}

/* the styles of the drawn screens; injected once */
(function () {
  const css = `
.sh-box{position:relative;flex:1;min-height:0;min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.sh-scale{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:0 0}
.sh-screen{position:absolute;inset:0;overflow:hidden;font-family:'Segoe UI Variable Text','Segoe UI',system-ui,-apple-system,sans-serif;color:#242424;background:#fff;text-align:left;line-height:1.3}
.sh-ai{display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:0 1px 2px rgba(0,0,0,.18)}
.sh-start{display:inline-grid;grid-template-columns:1fr 1fr;gap:2px}.sh-start i{background:linear-gradient(135deg,#4CC2FF,#0078D4);border-radius:1.5px}
.sh-task{position:absolute;left:0;right:0;bottom:0;height:48px;display:flex;align-items:center;justify-content:center;background:rgba(238,242,248,.92);border-top:1px solid rgba(0,0,0,.08);backdrop-filter:blur(20px)}
.sh-task-mid{display:flex;align-items:center;gap:6px}.sh-task-mid>*{margin:0 3px}
.sh-tsearch{display:flex;align-items:center;gap:8px;width:190px;height:32px;padding:0 12px;border-radius:16px;background:#fff;color:#5f5f5f;font-size:13px;border:1px solid rgba(0,0,0,.06)}
.sh-tapp{position:relative;display:flex;width:40px;height:40px;align-items:center;justify-content:center;border-radius:4px}.sh-tapp.on{background:rgba(255,255,255,.7)}
.sh-tapp.on::after{content:'';position:absolute;bottom:2px;width:16px;height:3px;border-radius:2px;background:#0067C0}
.sh-tray{position:absolute;right:10px;display:flex;align-items:center;gap:10px;font-size:12px;color:#1a1a1a}.sh-trayic{display:flex;gap:6px}
.sh-clock{display:flex;flex-direction:column;align-items:flex-end;line-height:1.25}
.sh-wbtns{display:flex;height:100%}.sh-wbtns span{width:46px;display:flex;align-items:center;justify-content:center}
/* Excel */
.sh-xwin{position:absolute;left:0;right:0;top:0;bottom:48px;display:flex;flex-direction:column;background:#fff}
.sh-xtitle{height:38px;flex:none;display:flex;align-items:center;justify-content:space-between;background:#107C41;color:#fff;font-size:12.5px}
.sh-xtitle .l{display:flex;align-items:center;gap:12px;padding-left:12px}.sh-xtitle .as{display:flex;align-items:center;gap:6px}
.sh-xtitle .tog{display:inline-block;width:30px;height:15px;border:1px solid #fff;border-radius:8px;position:relative}.sh-xtitle .tog i{position:absolute;left:3px;top:3px;width:7px;height:7px;border-radius:50%;background:#fff}
.sh-xtitle .m{display:flex;align-items:center;gap:6px;font-size:13px}
.sh-xtitle .r{display:flex;align-items:center;gap:12px;height:100%}.sh-xtitle .srch{display:flex;align-items:center;gap:8px;width:250px;height:26px;padding:0 10px;border-radius:5px;background:rgba(255,255,255,.88);color:#444}
.sh-xtitle .me{width:26px;height:26px;border-radius:50%;background:#C8E6D2;color:#0B5A2F;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600}
.sh-xtabs{height:34px;flex:none;display:flex;align-items:center;gap:2px;padding:0 8px;background:#F3F3F3;font-size:13px;color:#333}
.sh-xtabs span{padding:6px 9px;border-radius:4px}.sh-xtabs .on{color:#107C41;font-weight:600;box-shadow:inset 0 -3px 0 #107C41;border-radius:0}
.sh-xtabs .sp,.sh-xsheets .sp,.sh-xstatus .sp,.sh-ptabs .sp,.sh-pstatus .sp,.sh-btabs .sp{flex:1}
.sh-xtabs .cm{display:flex;align-items:center;gap:6px;border:1px solid #c8c8c8;background:#fff}
.sh-xtabs .shr{display:flex;align-items:center;gap:6px;background:#107C41;color:#fff;margin-left:6px}
.sh-xribbon{height:66px;flex:none;display:flex;align-items:center;gap:10px;padding:0 12px;background:#F3F3F3;border-bottom:1px solid #DADADA;color:#333;font-size:12px}
.sh-xribbon .grp{display:flex;flex-direction:column;align-items:center;gap:3px}.sh-xribbon .grp.col{gap:6px;align-items:flex-start}
.sh-xribbon .row{display:flex;align-items:center;gap:7px}.sh-xribbon .lbl{font-size:11px;text-align:center;line-height:1.15}
.sh-xribbon .sep{width:1px;height:48px;background:#D4D4D4}
.sh-xribbon .dd{display:flex;align-items:center;justify-content:space-between;gap:6px;height:22px;padding:0 6px;border:1px solid #C8C8C8;background:#fff;border-radius:3px;min-width:40px}.sh-xribbon .dd.w{min-width:110px}
.sh-xribbon .cur{font-weight:600;font-size:12px;min-width:12px;text-align:center}
.sh-xfx{height:30px;flex:none;display:flex;align-items:center;border-bottom:1px solid #DADADA;font-size:13px}
.sh-xfx .nb{display:flex;align-items:center;justify-content:space-between;width:96px;height:22px;margin:0 6px;padding:0 6px;border:1px solid #C8C8C8;border-radius:3px}
.sh-xfx .ic{display:flex;align-items:center;gap:10px;padding:0 10px;color:#666;border-right:1px solid #DADADA;height:100%}.sh-xfx .ic i{font-family:Georgia,serif;font-size:14px}
.sh-xfx .v{padding-left:10px}
.sh-xgrid{position:relative;flex:1;min-height:0;overflow:hidden;background:#fff}
.sh-xgrid table{border-collapse:collapse;table-layout:fixed;font-family:'Aptos Narrow',Calibri,'Segoe UI',Arial,sans-serif;font-size:14px}
.sh-xgrid th{height:22px;background:#F5F5F5;color:#555;font-weight:400;font-size:12px;border:1px solid #DCDCDC;text-align:center}
.sh-xgrid th.corner{width:34px}.sh-xgrid tr>th:first-child{width:34px}
.sh-xgrid th.hs{background:#D3F0E0;color:#0B5A2F;font-weight:600;border-bottom:2px solid #107C41}
.sh-xgrid td{height:22px;padding:0 6px;border:1px solid #E6E6E6;white-space:nowrap;overflow:hidden}
.sh-xgrid td.n{text-align:right}.sh-xgrid td.b{font-weight:700}.sh-xgrid td.big{font-size:17px;overflow:visible}.sh-xgrid td.hd{background:#E8F3EC;border-bottom:1px solid #9BC9AE}
.sh-xgrid td.neg{color:#C00000}
.sh-xgrid td.sel{outline:2px solid #107C41;outline-offset:-2px;position:relative}
.sh-xgrid td.sel::after{content:'';position:absolute;right:-4px;bottom:-4px;width:6px;height:6px;background:#107C41;border:1px solid #fff}
.sh-xchart{position:absolute;left:830px;top:58px;width:360px;height:240px;background:#fff;border:1px solid #C8C8C8;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:12px 16px}
.sh-xchart .t{text-align:center;font-size:15px;color:#595959}
.sh-xchart .bars{display:flex;align-items:flex-end;justify-content:space-around;height:180px;border-bottom:1px solid #BFBFBF;margin-top:8px}
.sh-xchart .bar{display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;top:22px}.sh-xchart .bar i{width:44px;background:#156082}.sh-xchart .bar span{font-size:12px;color:#595959}
.sh-xsheets{height:30px;flex:none;display:flex;align-items:center;gap:2px;padding:0 8px;background:#F3F3F3;border-top:1px solid #DADADA;font-size:13px}
.sh-xsheets .nav{display:flex;gap:6px;color:#999;margin-right:8px}.sh-xsheets .st{padding:5px 14px;color:#333}
.sh-xsheets .st.on{background:#fff;color:#107C41;font-weight:600;box-shadow:inset 0 -3px 0 #107C41}.sh-xsheets .add{display:flex;padding:4px;color:#555}
.sh-xstatus{height:24px;flex:none;display:flex;align-items:center;gap:18px;padding:0 12px;background:#F3F3F3;font-size:12px;color:#444}
.sh-xstatus .zoom{display:flex;align-items:center;gap:6px}.sh-xstatus .zoom i{position:relative;width:90px;height:2px;background:#999}.sh-xstatus .zoom b{position:absolute;left:44px;top:-5px;width:3px;height:12px;background:#444}
/* Mac and PowerPoint */
.sh-mac{background:linear-gradient(160deg,#3B4C7A,#7A5C8E 50%,#D9877A);font-family:-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif}
.sh-mbar{height:26px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:rgba(246,246,246,.86);font-size:13px;color:#111}
.sh-mbar .l{display:flex;align-items:center;gap:18px}.sh-mbar .dot{width:13px;height:13px;border-radius:50%;background:#111}.sh-mbar .r{display:flex;align-items:center;gap:14px}
.sh-pwin{position:absolute;left:20px;right:20px;top:36px;bottom:16px;display:flex;flex-direction:column;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.4)}
.sh-ptitle{height:38px;flex:none;display:flex;align-items:center;gap:14px;padding:0 14px;background:#C43E1C;color:#fff;font-size:13px}
.sh-ptitle .lights{display:flex;gap:8px}.sh-ptitle .lights i{width:12px;height:12px;border-radius:50%;background:#FF5F57}.sh-ptitle .lights i:nth-child(2){background:#FEBC2E}.sh-ptitle .lights i:nth-child(3){background:#28C840}
.sh-ptitle .tools{display:flex;gap:10px}.sh-ptitle .m{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600}
.sh-ptitle .srch{display:flex;align-items:center;gap:6px;width:200px;height:24px;padding:0 10px;border-radius:6px;background:rgba(255,255,255,.22)}
.sh-ptabs{height:32px;flex:none;display:flex;align-items:center;gap:4px;padding:0 10px;background:#F7F7F7;font-size:13px;color:#333}
.sh-ptabs span{padding:5px 9px}.sh-ptabs .on{color:#C43E1C;font-weight:600;box-shadow:inset 0 -3px 0 #C43E1C}
.sh-ptabs .play{display:flex;align-items:center;gap:6px;border:1px solid #ccc;border-radius:5px;background:#fff}.sh-ptabs .shr{background:#C43E1C;color:#fff;border-radius:5px;margin-left:6px}
.sh-pribbon{height:64px;flex:none;display:flex;align-items:center;gap:16px;padding:0 14px;background:#F7F7F7;border-bottom:1px solid #DDD;font-size:11px;color:#333}
.sh-pribbon .big{display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;line-height:1.15;color:#333}.sh-pribbon .big svg{color:#C43E1C}
.sh-pribbon .sep{width:1px;height:46px;background:#DDD}.sh-pribbon .chk{font-size:12px}
.sh-pbody{flex:1;min-height:0;display:flex;background:#E9E9E9}
.sh-pthumbs{width:168px;flex:none;display:flex;flex-direction:column;gap:12px;padding:12px 10px;background:#F3F3F3;border-right:1px solid #DDD;overflow:hidden}
.sh-pthumbs .th{display:flex;gap:6px;font-size:11px;color:#666}.sh-pthumbs .th>div{position:relative;width:128px;height:72px;background:#fff;border:1px solid #CFCFCF;overflow:hidden;padding:8px;display:flex;flex-direction:column;gap:5px}
.sh-pthumbs .th.on>div{outline:2px solid #C43E1C;outline-offset:1px}.sh-pthumbs .th i{display:block;height:5px;background:#DCDCDC;border-radius:2px}.sh-pthumbs .th i:first-child{width:70%;height:8px;background:#B9C7D4}
.sh-pthumbs .mini{position:absolute;left:0;top:0;width:1120px;height:630px;transform:scale(.1143);transform-origin:0 0}
.sh-pmain{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px}
.sh-pmain .slidewrap{position:relative;width:720px;height:405px;box-shadow:0 2px 8px rgba(0,0,0,.18);overflow:hidden}
.sh-pmain .slidewrap .sh-slide{width:1120px;height:630px;transform:scale(.6429);transform-origin:0 0}
.sh-pmain .notes{width:720px;padding:8px 10px;background:#fff;border:1px solid #DDD;color:#888;font-size:13px}
.sh-pstatus{height:24px;flex:none;display:flex;align-items:center;gap:18px;padding:0 12px;background:#F3F3F3;border-top:1px solid #DDD;font-size:11.5px;color:#555}
.sh-show{background:#000}.sh-show .sh-slide{position:absolute;left:0;top:0;width:1120px;height:630px;transform:scale(1.142857);transform-origin:0 0}
.sh-slide{position:relative;width:1120px;height:630px;background:#fff;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;color:#1F2A37;overflow:hidden}
.sh-slide .band{position:absolute;left:0;top:0;bottom:0;width:22px;background:linear-gradient(#0F766E,#14B8A6)}
.sh-slide .hd{padding:56px 80px 0 84px}.sh-slide .t{font-size:46px;font-weight:700;letter-spacing:-.5px;color:#0F3D3A}.sh-slide .s{margin-top:8px;font-size:26px;color:#4B5563}
.sh-slide ul,.sh-slide ol{margin:34px 80px 0 120px;padding:0;font-size:27px;line-height:1.45}.sh-slide li{margin-bottom:14px}.sh-slide ul li::marker{color:#14B8A6}.sh-slide ol li::marker{color:#0F766E;font-weight:700}
.sh-slide .flow{display:flex;align-items:center;gap:22px;margin:70px 0 0 120px;font-size:28px;flex-wrap:wrap}
.sh-slide .flow .box{padding:26px 34px;border-radius:14px;background:#E6F6F4;border:2px solid #14B8A6;font-weight:600}.sh-slide .flow .arr{font-size:40px;color:#0F766E}
.sh-slide .flow .loop{flex-basis:100%;margin-top:22px;color:#6B7280;font-size:22px}
.sh-slide .opts{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:38px 80px 0 84px}
.sh-slide .opts span{display:flex;align-items:center;gap:16px;padding:20px 22px;border:2px solid #D1D5DB;border-radius:12px;font-size:24px}
.sh-slide .opts b{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;flex:none;border-radius:50%;background:#0F766E;color:#fff}
.sh-slide .ft{position:absolute;left:84px;right:48px;bottom:26px;display:flex;justify-content:space-between;gap:30px;font-size:15px;color:#6B7280}
.sh-slide .ft span:nth-child(2){flex:1;text-align:center}
.sh-slide.poster{background:radial-gradient(circle at 30% 20%,#FFF7E6,#FDE2C4);text-align:center;color:#3B1F0E}
.sh-slide.poster .pt{margin-top:38px;font-size:30px;letter-spacing:8px;text-transform:uppercase;color:#B4532A}
.sh-slide.poster .word{display:flex;justify-content:center;gap:18px;margin-top:10px}.sh-slide.poster .word b{font-size:120px;line-height:1.05;color:#C2410C;font-family:Georgia,serif}
.sh-slide.poster .defs{display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(4,auto);grid-auto-flow:column;gap:10px 40px;margin:18px 120px 0;text-align:left;font-size:22px}
.sh-slide.poster .defs b{display:inline-block;width:34px;color:#C2410C;font-family:Georgia,serif}.sh-slide.poster .pf{position:absolute;left:0;right:0;bottom:22px;font-size:15px;color:#9A6A4A}
/* Doug's desktop */
.sh-desk{background:radial-gradient(ellipse at 70% 60%,#9CC7F5,#3E7CD6 40%,#1C3D8F 80%)}
.sh-icons{position:absolute;left:10px;top:10px;display:flex;flex-direction:column;gap:14px;width:86px}
.sh-icons .di{display:flex;flex-direction:column;align-items:center;gap:4px;color:#fff;font-size:11.5px;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.7)}
.sh-file{display:flex;align-items:center;justify-content:center;width:30px;height:36px;border-radius:3px;background:#fff;color:#C00;font-size:9px;font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,.3)}.sh-file.bin{background:rgba(255,255,255,.75);color:#555;border-radius:4px}
.sh-bwin{position:absolute;left:130px;top:34px;width:1000px;height:600px;display:flex;flex-direction:column;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.35);border:1px solid rgba(0,0,0,.2)}
.sh-btabs{height:40px;flex:none;display:flex;align-items:flex-end;gap:2px;padding:0 0 0 10px;background:#E8EBF0;font-size:12px}
.sh-btabs>.sh-ai{align-self:center;margin-right:6px}
.sh-btabs .bt{display:flex;align-items:center;gap:7px;width:220px;height:32px;padding:0 10px;border-radius:8px 8px 0 0;color:#333}.sh-btabs .bt>span:not(.sh-ai){flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-btabs .bt.on{background:#fff}.sh-btabs .nt{display:flex;align-self:center;padding:6px}.sh-btabs .sh-wbtns{align-self:stretch;height:40px}
.sh-baddr{height:40px;flex:none;display:flex;align-items:center;gap:14px;padding:0 12px;color:#444;border-bottom:1px solid #E3E3E3}
.sh-baddr .url{flex:1;display:flex;align-items:center;gap:8px;height:28px;padding:0 12px;border-radius:14px;background:#F1F3F4;font-size:13px;color:#222}
.sh-bpage{flex:1;padding:22px 40px;overflow:hidden;font-family:Arial,sans-serif}
.sh-bpage .sbox{display:flex;align-items:center;gap:10px;width:600px;height:44px;padding:0 18px;border-radius:22px;box-shadow:0 1px 6px rgba(32,33,36,.28);font-size:16px}
.sh-bpage .cnt{margin:12px 0 10px 4px;color:#70757a;font-size:13px}
.sh-bpage .res{display:flex;flex-direction:column;gap:3px;margin-bottom:20px;max-width:640px}.sh-bpage .u{font-size:12.5px;color:#4d5156}
.sh-bpage .h{font-size:20px;color:#1a0dab}.sh-bpage .d{font-size:14px;color:#4d5156}
.sh-toast{position:absolute;right:12px;bottom:60px;width:300px;display:flex;gap:12px;padding:14px;border-radius:8px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:13px;color:#333}
.sh-toast div{display:flex;flex-direction:column;gap:2px}
/* the frame each meeting app draws around a share */
.shr-wrap{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column}
.shr-bar{flex:none;display:flex;align-items:center;justify-content:center;gap:10px;font-size:13px}
.shr-name{position:absolute;left:10px;bottom:10px;padding:3px 8px;border-radius:4px;font-size:12px;z-index:1}
.shr-main .captions.inband{position:relative;left:auto;right:auto;bottom:auto;transform:none;flex:none;margin:8px auto 0;max-width:min(760px,100%);width:max-content}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();
/* the numbers the captions use, as numbers for the spreadsheet */
const SHARE_NUMS = { pct: PCT_WORDS[MEETING_NUMS.pct] || 15, k: K_WORDS[MEETING_NUMS.k] || 40 };
