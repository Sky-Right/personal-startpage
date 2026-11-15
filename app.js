import { categories, defaults, favorites, wallpapers } from './config.js';

const engines = {
  bing: { name: 'Bing', url: 'https://www.bing.com/search', param: 'q' },
  google: { name: 'Google', url: 'https://www.google.com/search', param: 'q' },
  baidu: { name: '百度', url: 'https://www.baidu.com/s', param: 'wd' },
};
const sites = categories.flatMap(category => category.sites);
const storageKey = 'startpage.preferences';
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const byId = id => document.getElementById(id);
const preferences = { ...defaults };

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (['system', 'light', 'dark'].includes(saved?.theme)) preferences.theme = saved.theme;
  if (wallpapers.some(wallpaper => wallpaper.id === saved?.wallpaper)) preferences.wallpaper = saved.wallpaper;
  if (Object.hasOwn(engines, saved?.engine)) preferences.engine = saved.engine;
} catch {
  // 浏览器禁用存储时使用默认值。
}

function savePreference(key, value) {
  preferences[key] = value;
  try {
    const { theme, wallpaper, engine } = preferences;
    localStorage.setItem(storageKey, JSON.stringify({ theme, wallpaper, engine }));
  } catch {
    byId('settings-note').textContent = '浏览器存储不可用，设置仅在本次访问生效。';
  }
}

function makeIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', './assets/ui.svg#' + name);
  svg.append(use);
  return svg;
}

function makeSiteItem(site, showDetail = true) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'site-link';
  link.href = site.url;
  const description = site.note ?? new URL(site.url).hostname.replace(/^www\./, '');
  link.title = site.name + ' · ' + description;
  if (site.openInNewTab ?? defaults.openInNewTab) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  const logo = document.createElement('span');
  logo.className = 'site-logo';
  logo.setAttribute('aria-hidden', 'true');
  const showFallback = () => {
    if (site.icon) {
      logo.replaceChildren(makeIcon(site.icon));
      return;
    }
    const initials = document.createElement('span');
    initials.className = 'initials';
    initials.textContent = Array.from(site.name.trim())[0]?.toUpperCase() ?? '·';
    logo.replaceChildren(initials);
  };
  if (site.logo) {
    const image = document.createElement('img');
    image.alt = '';
    image.width = 20;
    image.height = 20;
    image.decoding = 'async';
    if (site.invert) image.dataset.invert = '';
    image.addEventListener('error', showFallback, { once: true });
    image.src = new URL(site.logo, new URL('./assets/icons/', import.meta.url)).href;
    logo.append(image);
  } else {
    showFallback();
  }

  const label = document.createElement('span');
  label.className = 'site-label';
  const name = document.createElement('span');
  name.className = 'site-name';
  name.textContent = site.name;
  label.append(name);
  if (showDetail) {
    const detail = document.createElement('span');
    detail.className = 'site-note';
    detail.textContent = description;
    label.append(detail);
  }
  link.append(logo, label);
  item.append(link);
  return item;
}

const pinned = favorites.map(id => sites.find(site => site.id === id)).filter(Boolean);
const pinnedList = byId('favorites');
pinnedList.append(...pinned.map(site => makeSiteItem(site, false)));
pinnedList.closest('section').hidden = pinned.length === 0;

const groups = byId('groups');
const filters = byId('category-filters');
for (const category of [{ id: '', name: '全部' }, ...categories]) {
  const filter = document.createElement('button');
  filter.type = 'button';
  filter.textContent = category.name;
  filter.dataset.category = category.id;
  filter.setAttribute('aria-pressed', String(!category.id));
  filters.append(filter);
  if (!category.id) continue;

  const group = document.createElement('section');
  group.className = 'group';
  group.dataset.category = category.id;
  const title = document.createElement('h3');
  title.textContent = category.name;
  if (category.icon) title.prepend(makeIcon(category.icon));
  const list = document.createElement('ul');
  list.className = 'site-list';
  list.append(...category.sites.map(site => makeSiteItem(site)));
  group.append(title, list);
  groups.append(group);
}

filters.addEventListener('click', event => {
  const filter = event.target.closest('button[data-category]');
  if (!filter || filter.getAttribute('aria-pressed') === 'true') return;
  filters.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
  filter.setAttribute('aria-pressed', 'true');
  const selected = filter.dataset.category;
  groups.toggleAttribute('data-filtered', Boolean(selected));
  for (const group of groups.children) {
    group.hidden = Boolean(selected && group.dataset.category !== selected);
  }
});

const clock = byId('clock-time');
const date = byId('clock-date');
const clockFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const weekdayFormat = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' });
let clockTimer;

function updateClock() {
  clearTimeout(clockTimer);
  const now = new Date();
  clock.textContent = clock.dateTime = clockFormat.format(now);
  const month = now.getMonth() + 1;
  const day = now.getDate();
  date.textContent = month + '月' + day + '日 · ' + weekdayFormat.format(now);
  date.dateTime = [now.getFullYear(), month, day].map(value => String(value).padStart(2, '0')).join('-');
  if (!document.hidden) {
    clockTimer = setTimeout(updateClock, 60_000 - now.getTime() % 60_000);
  }
}
document.addEventListener('visibilitychange', updateClock);
updateClock();

const search = byId('search');
const form = byId('web-search');
const query = byId('query');
const clearQuery = byId('clear-query');
const engineSelect = byId('engine-select');
const resultPanel = byId('site-results');
const resultCaption = byId('result-caption');
const resultList = byId('result-list');
const normalize = text => text.normalize('NFKC').toLowerCase().trim();
const index = sites.map(site => ({
  site,
  name: normalize(site.name),
  text: normalize([site.name, site.url, site.keywords, site.note].join(' ')),
}));

function applyEngine() {
  const engine = engines[preferences.engine];
  engineSelect.value = preferences.engine;
  byId('engine-label').textContent = engine.name;
  byId('engine-icon').src = './assets/icons/' + preferences.engine + '.svg';
  form.action = engine.url;
  query.name = engine.param;
}

function refreshResults() {
  const value = normalize(query.value);
  clearQuery.hidden = query.value.length === 0;
  resultPanel.hidden = !value;
  if (!value) {
    resultList.replaceChildren();
    resultCaption.textContent = '';
    return;
  }
  const words = value.split(/\s+/);
  const matches = index.filter(entry => words.every(word => entry.text.includes(word)));
  const ranked = matches.sort((a, b) => Number(b.name.startsWith(value)) - Number(a.name.startsWith(value)));
  const visible = ranked.slice(0, 5);
  resultCaption.textContent = ranked.length
    ? '站内匹配 · ' + (ranked.length > visible.length ? visible.length + ' / ' : '') + ranked.length + ' 个'
    : '未找到匹配的网站';
  resultList.replaceChildren(...visible.map(entry => makeSiteItem(entry.site, false)));
}

applyEngine();
engineSelect.addEventListener('change', () => {
  savePreference('engine', engineSelect.value);
  applyEngine();
  if (!reducedMotion.matches) {
    byId('engine-icon').animate([{ opacity: .35 }, { opacity: 1 }], { duration: 220 });
  }
});
query.addEventListener('input', refreshResults);
query.addEventListener('focus', refreshResults);
clearQuery.addEventListener('click', () => {
  query.value = '';
  query.focus();
  refreshResults();
});
document.addEventListener('focusin', event => {
  if (!search.contains(event.target)) resultPanel.hidden = true;
});
resultList.addEventListener('click', () => { resultPanel.hidden = true; });
document.addEventListener('pointerdown', event => {
  if (!search.contains(event.target)) resultPanel.hidden = true;
});
form.addEventListener('submit', event => {
  if (!query.value.trim()) {
    event.preventDefault();
    query.focus();
    return;
  }
  resultPanel.hidden = true;
});
search.addEventListener('keydown', event => {
  if (event.isComposing || event.keyCode === 229 || resultPanel.hidden) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    query.focus();
    resultPanel.hidden = true;
  }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  const links = [...resultList.querySelectorAll('a')];
  const position = links.indexOf(document.activeElement);
  if (document.activeElement === query && event.key !== 'ArrowDown') return;
  if (document.activeElement !== query && position < 0) return;
  const next = links[position + (event.key === 'ArrowDown' ? 1 : -1)];
  if (next || position === 0 && event.key === 'ArrowUp') {
    event.preventDefault();
    (next ?? query).focus();
  }
});

const settings = byId('settings');
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || settings.open || event.altKey || event.shiftKey) return;
  const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
  const editing = event.target.closest?.('input, textarea, select, [contenteditable]');
  if (command || event.key === '/' && !editing && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    query.focus();
    refreshResults();
  }
});

const themeToggle = byId('theme-toggle');
function applyTheme() {
  const dark = preferences.theme === 'system' ? systemTheme.matches : preferences.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const label = dark ? '切换至浅色' : '切换至深色';
  themeToggle.title = label;
  themeToggle.setAttribute('aria-label', label);
  byId('theme-choices').querySelector('input[value="' + preferences.theme + '"]').checked = true;
}

themeToggle.addEventListener('click', () => {
  savePreference('theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  applyTheme();
});
systemTheme.addEventListener('change', applyTheme);

const wallpaperChoices = byId('wallpaper-choices');
for (const wallpaper of wallpapers) {
  const choice = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'wallpaper';
  input.value = wallpaper.id;
  const label = document.createElement('span');
  label.textContent = wallpaper.name;
  choice.append(input, label);
  wallpaperChoices.append(choice);
}

const wallpaperImage = byId('wallpaper');
const photoCredit = byId('photo-credit');
function applyWallpaper() {
  const wallpaper = wallpapers.find(option => option.id === preferences.wallpaper);
  document.documentElement.dataset.wallpaper = wallpaper.image ? wallpaper.id : 'solid';
  for (const input of wallpaperChoices.querySelectorAll('input')) {
    input.checked = input.value === wallpaper.id;
  }
  if (wallpaper.image) {
    wallpaperImage.sizes = '(max-width: 660px) calc(100vw - 34px), (max-width: 1200px) 70vw, 800px';
    wallpaperImage.srcset = wallpaper.srcset ?? '';
    wallpaperImage.src = wallpaper.image;
  } else {
    wallpaperImage.removeAttribute('src');
    wallpaperImage.removeAttribute('srcset');
  }
  photoCredit.hidden = !wallpaper.credit || !wallpaper.source;
  if (!photoCredit.hidden) {
    photoCredit.textContent = '摄影 · ' + wallpaper.credit;
    photoCredit.href = wallpaper.source;
  }
}

applyTheme();
applyWallpaper();
byId('open-settings').addEventListener('click', () => settings.showModal());
settings.addEventListener('change', event => {
  const { name, value } = event.target;
  if (name === 'theme') {
    savePreference(name, value);
    applyTheme();
  }
  if (name === 'wallpaper') {
    savePreference(name, value);
    applyWallpaper();
  }
});
