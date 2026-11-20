/* Totally Real Meeting: shared data, icons, parody logos and settings. */

const ICONS = {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  slash: '<path d="M4 4l16 16"/>',
  speaker: '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  sparkle: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
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
SKINS.push({ id: 'custom', name: 'Your app', say: 'Custom meeting app', hint: 'Your own name, colour, logo and layout', modes: 'Light and dark' });
const SKIN = Object.fromEntries(SKINS.map(s => [s.id, s]));
const escHtml = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* The custom look: the visitor picks its name, colour, logo letter, logo shape and layout. */
const CUSTOM_COLORS = ['#E4572E', '#2F9E44', '#7048E8', '#0B7285', '#D6336C', '#1C7ED6', '#F08C00', '#495057'];
const CUSTOM_LAYOUTS = [
  { id: 'top', label: 'Controls on top' },
  { id: 'bottom', label: 'Control bar at the bottom' },
  { id: 'pill', label: 'Floating pill' }
];
let CUSTOM_APP = { name: 'MeetSpace', color: '#E4572E', letter: 'M', shape: 'square', layout: 'bottom' };
function setCustomApp(c) {
  const ok = c && typeof c === 'object' ? c : {};
  CUSTOM_APP = {
    name: String(ok.name || '').trim().slice(0, 24) || 'MeetSpace',
    color: /^#[0-9a-f]{6}$/i.test(ok.color || '') ? ok.color : '#E4572E',
    letter: (String(ok.letter || '').trim()[0] || (String(ok.name || 'M').trim()[0] || 'M')).toUpperCase(),
    shape: ok.shape === 'circle' ? 'circle' : 'square',
    layout: ['top', 'bottom', 'pill'].includes(ok.layout) ? ok.layout : 'bottom'
  };
  SKIN.custom.name = CUSTOM_APP.name;
  SKIN.custom.say = CUSTOM_APP.name + ' (custom meeting app)';
  return CUSTOM_APP;
}
LOGO.custom = s => {
  const c = CUSTOM_APP, shape = c.shape === 'circle' ? '<circle cx="16" cy="16" r="14"' : '<rect x="2" y="2" width="28" height="28" rx="8"';
  return `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true">${shape} fill="${c.color}"/><text x="16" y="21.5" text-anchor="middle" font-family="Fredoka, Figtree, sans-serif" font-weight="600" font-size="16" fill="#fff">${escHtml(c.letter)}</text></svg>`;
};
/* Visible parody name is hidden from screen readers; they hear the plain description instead. */
const brand = (id, size = 22) => `<span class="brand">${LOGO[id](size)}<span class="wm" aria-hidden="true" style="font-size:${Math.round(size * 0.72)}px">${escHtml(SKIN[id].name)}</span><span class="sr">${escHtml(SKIN[id].say)}</span></span>`;

const TOPICS = ['Budget review', 'Customer success', 'Engineering standup', 'Finance', 'HR', 'Leadership', 'Marketing', 'Product roadmap', 'Sales', 'Town hall',
  /* scenarios: the funny ones */
  'Absurd corporate training', 'Completely pointless brainstorming', 'Corporate disaster meeting', 'IT outage', 'Monday morning status meeting'];
const TOPIC_TITLE = {
  'Budget review': 'Budget review: next quarter', 'Customer success': 'Customer success weekly', 'Engineering standup': 'Engineering standup',
  'Finance': 'Finance: Q3 numbers', 'HR': 'HR: policy update', 'Leadership': 'Leadership sync', 'Marketing': 'Marketing campaign review',
  'Product roadmap': 'Product roadmap planning', 'Sales': 'Sales pipeline review', 'Town hall': 'All-hands town hall',
  'Absurd corporate training': 'Mandatory training: email etiquette (module 7 of 12)', 'Completely pointless brainstorming': 'Brainstorm: blue-sky ideas',
  'Corporate disaster meeting': 'URGENT: launch damage control', 'IT outage': 'P1 incident bridge: all systems down', 'Monday morning status meeting': 'Monday morning status'
};

/* 'Custom' lets the visitor write their own meeting title and conversation lines. */
const CUSTOM_TOPIC = 'Custom';
function topicTitle(s) {
  if (activeSample(s)) return SAMPLES[activeSample(s)].title;
  if (s.topic === CUSTOM_TOPIC) return (s.customTopic.title || '').trim() || 'Team meeting';
  return TOPIC_TITLE[s.topic];
}
function topicLines(s) {
  if (activeSample(s)) return SAMPLES[activeSample(s)].chat;
  if (s.topic === CUSTOM_TOPIC) return (s.customTopic.lines || '').split('\n').map(t => t.trim()).filter(Boolean);
  return CHAT_TOPIC[s.topic] || [];
}

/* "With audio": meetings with real people on camera and real voices. Three pairs of coworkers were filmed for research
   (Seamless Interaction dataset by Meta, CC BY-NC 4.0). Each version has its own title, cast and files:
   - short: you join at 15:00, partway through, and it runs about 15 more minutes. Video first: only the six filmed
     people talk. Everyone else is the visitor's own participant names, muted with cameras off: the first one hosts
     and types the questions in the chat, the next ones react there. Files in sample/short/.
   - hour: the full "Team connect hour" from the start; the camera-off colleagues speak with text-to-speech (Kokoro).
     Files in sample/.
   - humortxt, humor, humorvid: the comedy meeting "Mandatory Fun: Quarterly Vibe Check" (about 13 minutes, original jokes),
     with captions only (no sound), with computer voices, or with computer voices plus four filmed colleagues who
     sit in silently. All three share one timeline. Files in sample/humor/.
   kind: 'video' is filmed, 'voice' speaks with a computer voice, 'quiet' stays on mute with the camera off;
   muted: true keeps a filmed person on mute (they only listen). */
const SAMPLE_PEOPLE = {
  priya: 'Priya Shah', greg: 'Greg Walsh', lauren: 'Lauren Mills', mike: 'Mike Torres', ryan: 'Ryan Doyle',
  daniel: 'Daniel Brooks', hannah: 'Hannah Clarke', aisha: 'Aisha Khan', megan: 'Megan Price', bill: 'Bill Novak',
  brenda: 'Brenda Holt', gary: 'Gary Pike', tess: 'Tess Morgan', doug: 'Doug Ferris', nate: 'Nate Coleman'
};
const sampleCast = kinds => Object.entries(kinds).map(([media, kind]) => kind === 'listen'
  ? { name: SAMPLE_PEOPLE[media], media, kind: 'video', muted: true } : { name: SAMPLE_PEOPLE[media], media, kind });
const HUMOR_VOICES = { brenda: 'voice', gary: 'voice', tess: 'voice', doug: 'voice', nate: 'voice' };
const HUMOR = { title: 'Mandatory Fun: Quarterly Vibe Check', dir: 'sample/humor/', tl: 'humor', ownNames: true, ownRoles: ['p1', 'p2', 'p3', 'p4'], chat: [] };
const SAMPLES = {
  short: {
    title: 'Team connect', dir: 'sample/short/',
    cast: sampleCast({ greg: 'video', lauren: 'video', mike: 'video', ryan: 'video', megan: 'video', bill: 'video' }),
    ownNames: true,   /* plus the visitor's participant names, camera off and muted */
    chat: []   /* the chat is scripted in its timeline */
  },
  hour: {
    title: 'Team connect hour', dir: 'sample/',
    cast: sampleCast({ priya: 'voice', greg: 'video', lauren: 'video', mike: 'video', ryan: 'video', daniel: 'voice', hannah: 'voice', aisha: 'quiet', megan: 'video', bill: 'video' }),
    chat: ['Love this format', 'Ha, so relatable', 'This is the best one of these so far', 'Can we do these every month?',
      'Sorry, had to step away for a sec. What did I miss?', 'My camera is being weird today too', 'Great stories, everyone']
  },
  humortxt: { ...HUMOR, silent: true, cast: sampleCast(HUMOR_VOICES) },   /* no sound: the voices show as captions */
  humor: { ...HUMOR, cast: sampleCast(HUMOR_VOICES) },
  humorvid: { ...HUMOR, cast: sampleCast({ brenda: 'voice', lauren: 'listen', gary: 'voice', mike: 'listen', tess: 'voice', megan: 'listen', doug: 'voice', greg: 'listen', nate: 'voice' }) }
};
/* Which of these meetings the settings pick, if any: the comedy with captions plays with sound off, the rest with sound on. */
const SAMPLE_KEYS = ['short', 'hour', 'humortxt', 'humor', 'humorvid'];
function activeSample(s) {
  if (s.sample === 'humortxt') return s.audio ? null : 'humortxt';
  return s.audio ? s.sample : null;
}
/* Everyone in one of these meetings, in tile order. With ownNames, the visitor's names fill the chat-only roles of the
   timeline (in the short one priya hosts and asks the questions, daniel and hannah react, aisha listens; in the comedy
   p1 to p4 chat); names past those get x4, x5... In the short one your first name hosts, so it comes first. */
const SAMPLE_ROLES = ['priya', 'daniel', 'hannah', 'aisha'];
function sampleCastFor(s) {
  const info = SAMPLES[activeSample(s)];
  if (!info.ownNames) return info.cast;
  const roles = info.ownRoles || SAMPLE_ROLES;
  const own = s.names.slice(0, s.count).map((n, i) => ({ name: n.trim() || 'Guest ' + (i + 1), media: roles[i] || 'x' + i, kind: 'quiet' }));
  return info.ownRoles ? [...info.cast, ...own] : [own[0], ...info.cast, ...own.slice(1)];
}

/* What people say out loud (the captions) lives in talk.js. */

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
  'Town hall': ['Congrats to the team!', 'Will slides be shared?', 'Great update'],
  'Absurd corporate training': ['Is this on the quiz?', 'My fruit is a grape. Small, but part of a bunch', 'Do we get a certificate for the icebreaker too?'],
  'Completely pointless brainstorming': ['Writing this down: toast?', 'Is the cat idea still alive?', 'Can we get more dots?'],
  'Corporate disaster meeting': ['The banana has its own fan account now', 'Legal says please stop typing “oops” in here too', 'My mum saw it. She’s very proud'],
  'IT outage': ['Is it just me or is everything down?', 'Status page says green, so we’re fine?', 'Did someone kick the router again'],
  'Monday morning status meeting': ['Need. Coffee.', 'Is it Friday yet?', 'Green-ish here too']
};

/* Replies to what you type in the meeting chat. The first rule whose pattern matches wins.
   {name} is your first name and {other} is another person in the call.
   A rule with "when" picks its lines by your mic or camera: "muted" or "live", "on" or "off".
   "who" is how many people answer (a greeting can get two). "chance" below 1 means people sometimes stay quiet. */
const CHAT_REPLIES = [
  { pattern: /\b(can|could|do|does)\s+(you|u|everyone|anyone|any1|y'?all|you guys|you all)\s+hear\s+me\b|\bam i (audible|on mute|muted)\b|\bhear me (ok|okay|now)\b|\bis my (mic|audio|sound) (on|working|ok|okay)\b/i,
    when: 'mic', lines: {
      live: ['Yes, we can hear you.', 'Loud and clear, {name}.', 'Yep, you sound great.', 'Yes! All good.'],
      muted: ['You’re on mute, {name}.', 'Nope, {name}, you’re muted.', 'We can’t hear you. Your mic is off.', 'You’re still on mute 🙂'] } },
  { pattern: /\b(can|could|do|does)\s+(you|u|everyone|anyone|y'?all|you guys|you all)\s+see\s+me\b|\bsee my (video|camera|face)\b|\bis my (camera|video|cam) (on|working|ok|okay)\b/i,
    when: 'cam', lines: {
      on: ['Yeah, we see you.', 'Yep, looking good, {name}.', 'We can see you!'],
      off: ['Nope, {name}, your camera is off.', 'Your video is off, we only see your initials.', 'Not yet, your camera looks off.'] } },
  { pattern: /\b(can|could|do)\s+(you|u|everyone|anyone|y'?all)\s+see\s+my\s+screen\b|\b(am i|is it) sharing\b/i,
    lines: ['Not yet, still loading on my end.', 'Nothing is shared yet.', 'I just see your tile, {name}.'] },
  /* Greetings depend on when you came in: on time, late, or back after leaving. */
  { pattern: /^\s*(hi+|hello+|hey+|hiya|howdy|yo|morning|good (morning|afternoon|evening)|greetings)\b/i, who: 2, when: 'late', lines: {
      early: ['Thank you for joining, {name}!', 'Hi {name}!', 'Hey {name}, welcome.', 'Hello!', 'Glad you could make it, {name}.', 'Hi! 👋'],
      late: ['Hi {name}, thank you for joining. Better late than never!', 'Hey {name}! Better late than never 😄', 'Hi {name}, glad you made it.', 'Welcome, {name}. I’ll send you the notes after.', 'Hi! We’ll catch you up later.'],
      back: ['Welcome back, {name}!', 'Hey, you’re back!', 'Welcome back. You didn’t miss much.', 'Oh hi again, {name}.'] } },
  { pattern: /\b(sorry|apologies)\b.*\blate\b|\brunning late\b|\bjust joined\b/i, when: 'late', lines: {
      early: ['No worries, we just started.', 'All good, {name}.', 'You didn’t miss much!'],
      late: ['No worries, {name}. Better late than never.', 'All good, I’ll send you the notes.', 'No problem, we’ll catch you up after.'],
      back: ['No worries, welcome back.', 'All good, {name}.'] } },
  { pattern: /\b(bye|goodbye|see (you|ya)|gotta (go|run)|have to (go|drop|run)|dropping off|signing off)\b/i, who: 2,
    lines: ['Bye {name}!', 'Thanks, {name}. See you next time.', 'Take care!', 'Have a good one!'] },
  { pattern: /\b(thanks|thank you|thx|ty|cheers)\b/i,
    lines: ['Of course!', 'Anytime, {name}.', 'Thank you too!', 'Happy to help.'] },
  { pattern: /\b(lag+(ing|gy)?|frozen|froze|freezing|cutting out|breaking up|robot(ic)?)\b/i,
    lines: ['You froze for a second there.', 'It’s fine on my end.', 'Might be the Wi-Fi.', 'Same here, it’s choppy.'] },
  { pattern: /\b(lol|haha+|lmao|😂|🤣)\b|😂|🤣/i, chance: 0.6,
    lines: ['😂', 'haha', 'lol', 'Right?!'] },
  { pattern: /\?\s*$/, chance: 0.7,
    lines: ['Good question.', 'Let me get back to you on that.', 'I think so?', 'Not sure, {other} might know.', 'Let’s take that offline.', '{other}, can you take that one?'] },
  { pattern: /.*/, chance: 0.3,
    lines: ['👍', '+1', 'Agreed', 'Makes sense', 'Noted, {name}.'] }
];

const DEFAULTS = {
  name: 'Guest', cam: true, count: 5, names: NAME_POOL.slice(), spare: SPARE_NAMES.slice(),
  skin: 'teams', topic: 'Finance', theme: 'system',
  audio: false,   /* false: silent meeting on the chosen topic, captions on. true: a real-video meeting with sound (SAMPLES), captions off */
  sample: 'short',   /* which prepared meeting plays: 'short' (15 minutes, joining at 15:00) or 'hour' with audio on, the comedy as
                         'humortxt' (audio off, captions) or 'humor' / 'humorvid' (audio on); see activeSample() */
  timer: 0,   /* minutes the call has already been running when you join: 0, 15, 30 or 60 */
  length: 'full',   /* 'full': the meeting runs start to finish (about an hour) and ends; 'loop': it keeps going */
  drift: 'some',    /* 'some': small talk, jokes and side-tracks now and then; 'none': stays on topic */
  wildcard: 'none', /* one participant with a personality (WILDCARDS in talk.js): 'none', 'talker', 'knowitall' or 'confused' */
  customTopic: { title: 'Weekly team sync', lines: 'Can we circle back on this?\nGood progress this week\nWho\u2019s taking the action item?' },
  customApp: { name: 'MeetSpace', color: '#E4572E', letter: 'M', shape: 'square', layout: 'bottom' },
  chat: { on: true, generic: true, topic: true, own: false, freq: 'rare', ownText: 'Can everyone see my screen?\nSorry, my internet dropped for a sec\nLet’s take that offline' }
};
/* Paste a Formspree form URL here (https://formspree.io/f/xxxxxxx) to switch on the "Have an idea?" messages. */
const FEEDBACK_ENDPOINT = '';

const TIMER_STARTS = [{ min: 0, label: 'Just started (00:00)', short: 'From 00:00' }, { min: 15, label: '15 min', short: 'From 15:00' }, { min: 30, label: '30 min', short: 'From 30:00' }, { min: 60, label: '1 hour', short: 'From 1:00:00' }];
const WILDCARD_KINDS = ['none', 'talker', 'knowitall', 'confused'];
const STORE_KEY = 'trm-settings-v1';
function loadSettings() {
  let s = null;
  try { const q = new URLSearchParams(location.search).get('s'); if (q) s = JSON.parse(q); } catch (e) {}
  if (!s) { try { s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {} }
  const out = Object.assign(structuredClone(DEFAULTS), s || {});
  out.chat = Object.assign(structuredClone(DEFAULTS.chat), (s && s.chat) || {});
  out.customTopic = Object.assign(structuredClone(DEFAULTS.customTopic), (s && s.customTopic) || {});
  out.customApp = setCustomApp(Object.assign(structuredClone(DEFAULTS.customApp), (s && s.customApp) || {}));
  if (!SKIN[out.skin]) out.skin = 'teams';
  if (!TOPICS.includes(out.topic) && out.topic !== CUSTOM_TOPIC) out.topic = 'Finance';
  out.count = Math.max(1, Math.min(16, +out.count || 5));
  out.timer = TIMER_STARTS.some(t => t.min === +out.timer) ? +out.timer : 0;
  if (out.length !== 'loop') out.length = 'full';
  if (out.drift !== 'none') out.drift = 'some';
  if (!WILDCARD_KINDS.includes(out.wildcard)) out.wildcard = 'none';
  out.audio = out.audio === true;
  if (!SAMPLE_KEYS.includes(out.sample)) out.sample = 'short';
  if (out.sample === 'humortxt' && out.audio) out.sample = 'short';
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
