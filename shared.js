/* Totally Real Meeting: shared data, icons, parody logos and settings. */

const ICONS = {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  slash: '<path d="M4 4l16 16"/>',
  cam: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-3v8l-5-3z"/>',
  share: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 14V8M9 11l3-3 3 3M8 21h8"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .5 3 2 3 5"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11V4.5a1.5 1.5 0 0 1 3 0V11V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.7L3.8 14a1.5 1.5 0 0 1 2.5-1.6z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01"/>',
  view: '<rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  exitfull: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  rec: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  cc: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10.5 10a2 2 0 1 0 0 4M17 10a2 2 0 1 0 0 4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  phone: '<path d="M2.5 14.2c5.2-5 13.8-5 19 0l-2.3 2.6-4.2-1.2v-3c-2-.8-4-.8-6 0v3l-4.2 1.2z" fill="currentColor" stroke="none"/>',
  person: '<circle cx="12" cy="9" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
const ico = (k, s = 20, extra = '') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}${extra}</svg>`;

/* Parody logos: our own drawings, deliberately not the real marks. */
const LOGO = {
  teams: s => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="4" width="22" height="22" rx="7" fill="#5B5FC7"/><path d="M8.5 11.5h9M13 11.5v9.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M22 14h6.5a1.5 1.5 0 0 1 1.5 1.5v6a5 5 0 0 1-5 5h-1" fill="#8B8FE8"/><circle cx="26" cy="9.5" r="3" fill="#8B8FE8"/></svg>`,
  zoom: s => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#1F6FEB"/><rect x="7.5" y="11" width="11.5" height="10" rx="3" fill="#fff"/><path d="M20 15l5-3v8l-5-3z" fill="#fff"/></svg>`,
  webex: s => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="9" fill="none" stroke="#14B8A6" stroke-width="4.5"/><circle cx="20" cy="16" r="9" fill="none" stroke="#3B82F6" stroke-width="4.5" stroke-opacity=".85"/></svg>`,
  meet: s => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="8" width="18" height="16" rx="4" fill="#34A853"/><rect x="3" y="8" width="9" height="8" rx="4" fill="#4285F4"/><rect x="12" y="16" width="9" height="8" rx="4" fill="#FBBC04"/><path d="M21 13.5l7-4.5v14l-7-4.5z" fill="#EA4335"/></svg>`
};
const SKINS = [
  { id: 'teams', name: 'Teamş', say: 'Teams parody', hint: 'Controls along the top, purple accent', modes: 'Light and dark' },
  { id: 'zoom', name: 'Zooм', say: 'Zoom parody', hint: 'Control bar along the bottom, green Share', modes: 'Dark' },
  { id: 'webex', name: 'Webbex', say: 'Webex parody', hint: 'Floating pill of round controls', modes: 'Light and dark' },
  { id: 'meet', name: 'Meeţ', say: 'Meet parody', hint: 'Round buttons on a charcoal stage', modes: 'Dark' }
];
const SKIN = Object.fromEntries(SKINS.map(s => [s.id, s]));
/* Visible parody name is hidden from screen readers; they hear the plain description instead. */
const brand = (id, size = 22) => `<span class="brand">${LOGO[id](size)}<span class="wm" aria-hidden="true" style="font-size:${Math.round(size * 0.72)}px">${SKIN[id].name}</span><span class="sr">${SKIN[id].say}</span></span>`;

const TOPICS = ['Budget review', 'Customer success', 'Engineering standup', 'Finance', 'HR', 'Leadership', 'Marketing', 'Product roadmap', 'Sales', 'Town hall'];
const TOPIC_TITLE = {
  'Budget review': 'Budget review: next quarter', 'Customer success': 'Customer success weekly', 'Engineering standup': 'Engineering standup',
  'Finance': 'Finance: Q3 numbers', 'HR': 'HR: policy update', 'Leadership': 'Leadership sync', 'Marketing': 'Marketing campaign review',
  'Product roadmap': 'Product roadmap planning', 'Sales': 'Sales pipeline review', 'Town hall': 'All-hands town hall'
};

const NAME_POOL = ['Maria Lopez', 'James Carter', 'Priya Nair', 'Tom Becker', 'Aisha Khan', 'Daniel Kim', 'Sofia Rossi', 'Liam O’Brien', 'Grace Chen', 'Omar Haddad', 'Emma Novak', 'Lucas Silva', 'Hannah Weber', 'Kenji Sato', 'Olivia Brooks', 'Mateo Garcia'];
const SPARE_NAMES = ['Rachel Green', 'Victor Hale', 'Nina Patel', 'Ben Foster', 'Zoe Martin', 'Ravi Shah', 'Chloe Dubois', 'Samuel Ortiz', 'Mia Johansson', 'Ethan Wright', 'Leila Ahmadi', 'Noah Fischer', 'Isabel Moreno', 'Yuki Tanaka', 'Adam Kowalski', 'Fatima Zahra'];
const AVATAR = [
  { bg: '#CDE7D6', fg: '#12391F', solid: '#0F766E' }, { bg: '#FCE2C4', fg: '#4A2A06', solid: '#C2410C' },
  { bg: '#D6E4FA', fg: '#0F2D5C', solid: '#1D4ED8' }, { bg: '#F6D5DA', fg: '#541624', solid: '#BE185D' },
  { bg: '#E3E0F7', fg: '#2A2160', solid: '#7C3AED' }, { bg: '#F5ECC2', fg: '#4A3B05', solid: '#A16207' },
  { bg: '#D3EEF2', fg: '#0C3A42', solid: '#0E7490' }, { bg: '#F3D9EE', fg: '#4D1640', solid: '#A21CAF' }
];
const initials = n => (n || '?').trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

/* Chat lines: generic ones by meeting phase, plus topic-specific ones. */
const CHAT_GENERIC = {
  open: ['Welcome!', 'Morning all', 'Hi everyone', 'Can you hear me okay?', 'Just joined, sorry I’m a minute late'],
  middle: ['Aha', 'Totally agree', '+1', 'Good point', 'Makes sense', 'Agreed', 'Interesting', 'Love that idea', 'Can we come back to this?', 'Noted'],
  close: ['Thanks all', 'Great session', 'Thanks, very helpful', 'Have a good one!', 'Talk soon']
};
const CHAT_TOPIC = {
  'Budget review': ['Can we see last quarter next to this?', 'That line item looks high', 'Is travel still frozen?'],
  'Customer success': ['That account renewed last week', 'Great feedback from them', 'Let’s loop in support'],
  'Engineering standup': ['No blockers here', 'PR is up for review', 'Deploy went out this morning'],
  'Finance': ['Can we see Q3 vs Q2?', 'Good point on margins', 'Forecast looks solid'],
  'HR': ['Will this be in the handbook?', 'When does it take effect?', 'Thanks for clarifying'],
  'Leadership': ['Big picture, I agree', 'Let’s align on priorities', 'Who owns this?'],
  'Marketing': ['Love the new creative', 'What was the click rate?', 'Let’s A/B test that'],
  'Product roadmap': ['Is that in Q1 or Q2?', 'Customers keep asking for this', 'Let’s scope it'],
  'Sales': ['That deal is close', 'Pipeline looks healthy', 'Great call yesterday'],
  'Town hall': ['Congrats to the team!', 'Will slides be shared?', 'Great update']
};

const DEFAULTS = {
  name: 'Eli', cam: true, count: 5, names: NAME_POOL.slice(), spare: SPARE_NAMES.slice(),
  skin: 'teams', topic: 'Finance', theme: 'system',
  chat: { on: true, generic: true, topic: true, own: false, freq: 'rare', ownText: 'Can everyone see my screen?\nSorry, my internet dropped for a sec\nLet’s take that offline' }
};
/* Paste a Formspree form URL here (https://formspree.io/f/xxxxxxx) to switch on the "Have an idea?" messages. */
const FEEDBACK_ENDPOINT = '';

const STORE_KEY = 'trm-settings-v1';
function loadSettings() {
  let s = null;
  try { const q = new URLSearchParams(location.search).get('s'); if (q) s = JSON.parse(q); } catch (e) {}
  if (!s) { try { s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {} }
  const out = Object.assign(structuredClone(DEFAULTS), s || {});
  out.chat = Object.assign(structuredClone(DEFAULTS.chat), (s && s.chat) || {});
  if (!SKIN[out.skin]) out.skin = 'teams';
  if (!TOPICS.includes(out.topic)) out.topic = 'Finance';
  out.count = Math.max(1, Math.min(16, +out.count || 5));
  return out;
}
function saveSettings(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }
function settingsUrl(page, s) {
  const slim = { ...s }; delete slim.spare;
  slim.names = s.names.slice(0, s.count);
  return page + '?s=' + encodeURIComponent(JSON.stringify(slim));
}
/* 'light' | 'dark', resolving 'system' from the device setting. */
function resolvedTheme(s) {
  if (s.theme === 'light' || s.theme === 'dark') return s.theme;
  return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applySiteTheme(s) { document.documentElement.dataset.theme = resolvedTheme(s); }
