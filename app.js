import { categories as defaultCategories, defaults, favorites, wallpapers } from './config.js';
import { initializeManager } from './manager.js';
import { siteLogo } from './logos.js';

const engines = {
  bing: { name: 'Bing', url: 'https://www.bing.com/search', param: 'q' },
  google: { name: 'Google', url: 'https://www.google.com/search', param: 'q' },
  baidu: { name: 'Baidu', url: 'https://www.baidu.com/s', param: 'wd' },
};

let categories = defaultCategories;
let sites = categories.flatMap(category => category.sites);
let selectedCategory = '';
const favoriteOrder = id => favorites.includes(id) ? favorites.indexOf(id) : favorites.length;
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
  // Use defaults when browser storage is unavailable.
}

const brandPhoto = byId('brand-photo');
brandPhoto.addEventListener('error', () => { brandPhoto.hidden = true; });
if (brandPhoto.complete && !brandPhoto.naturalWidth) brandPhoto.hidden = true;

function savePreference(key, value) {
  preferences[key] = value;
  try {
    const { theme, wallpaper, engine } = preferences;
    localStorage.setItem(storageKey, JSON.stringify({ theme, wallpaper, engine }));
  } catch {
    byId('settings-note').textContent = 'Browser storage is unavailable. Changes apply to this visit.';
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

  const logo = siteLogo(site);

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
  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'site-edit';
  edit.dataset.editSite = site.id;
  edit.setAttribute('aria-label', 'Edit ' + site.name);
  if (document.body.classList.contains('is-managing')) link.tabIndex = -1;
  item.append(link, edit);
  return item;
}

const groups = byId('groups');
const filters = byId('category-filters');

function renderDirectory(next) {
  categories = next;
  sites = categories.flatMap(category => category.sites);
  if (!categories.some(group => group.id === selectedCategory)) selectedCategory = '';
  const pinned = sites.filter(site => site.favorite);
  // Preserve the configured order for existing favorites.
  pinned.sort((left, right) => favoriteOrder(left.id) - favoriteOrder(right.id));
  const pinnedList = byId('favorites');
  pinnedList.replaceChildren(...pinned.map(site => makeSiteItem(site, false)));
  pinnedList.closest('section').hidden = pinned.length === 0;
  filters.replaceChildren();
  groups.replaceChildren();
  groups.toggleAttribute('data-filtered', Boolean(selectedCategory));
  for (const category of [{ id: '', name: 'All' }, ...categories]) {
    const filter = document.createElement('button');
    filter.type = 'button';
    filter.textContent = category.name;
    filter.dataset.category = category.id;
    filter.setAttribute('aria-pressed', String(category.id === selectedCategory));
    filters.append(filter);
    if (!category.id) continue;
    const group = document.createElement('section');
    group.className = 'group';
    group.dataset.category = category.id;
    group.hidden = Boolean(selectedCategory && selectedCategory !== category.id);
    const title = document.createElement('h3');
    title.textContent = category.name;
    if (category.icon) title.prepend(makeIcon(category.icon));
    const list = document.createElement('ul');
    list.className = 'site-list';
    list.append(...category.sites.map(site => makeSiteItem(site)));
    group.append(title, list);
    if (!category.sites.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-category';
      empty.textContent = 'No websites yet. Use + to add one.';
      group.append(empty);
    }
    groups.append(group);
  }
  if (query.value.trim() && document.activeElement === query) refreshResults();
  else resultPanel.hidden = true;
}

filters.addEventListener('click', event => {
  const filter = event.target.closest('button[data-category]');
  if (!filter || filter.getAttribute('aria-pressed') === 'true') return;
  filters.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
  filter.setAttribute('aria-pressed', 'true');
  const selected = selectedCategory = filter.dataset.category;
  groups.toggleAttribute('data-filtered', Boolean(selected));
  for (const group of groups.children) {
    group.hidden = Boolean(selected && group.dataset.category !== selected);
  }
});

const clock = byId('clock-time');
const date = byId('clock-date');
const clockFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
let clockTimer;

function updateClock() {
  clearTimeout(clockTimer);
  const now = new Date();
  clock.textContent = clock.dateTime = clockFormat.format(now);
  const month = now.getMonth() + 1;
  const day = now.getDate();
  date.textContent = dateFormat.format(now);
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
  const index = sites.map(site => ({
    site, name: normalize(site.name), text: normalize([site.name, site.url, site.keywords, site.note].join(' ')),
  }));
  const matches = index.filter(entry => words.every(word => entry.text.includes(word)));
  const ranked = matches.sort((a, b) => Number(b.name.startsWith(value)) - Number(a.name.startsWith(value)));
  const visible = ranked.slice(0, 5);
  resultCaption.textContent = ranked.length
    ? 'Matching sites (' + (ranked.length > visible.length ? visible.length + ' of ' : '') + ranked.length + ')'
    : 'No matching sites';
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
  if (event.defaultPrevented || event.isComposing || document.querySelector('dialog[open]') || event.altKey || event.shiftKey) return;
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
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
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
    wallpaperImage.sizes = '100vw';
    wallpaperImage.srcset = wallpaper.srcset ?? '';
    wallpaperImage.src = wallpaper.image;
  } else {
    wallpaperImage.removeAttribute('src');
    wallpaperImage.removeAttribute('srcset');
  }
  photoCredit.hidden = !wallpaper.credit || !wallpaper.source;
  if (!photoCredit.hidden) {
    photoCredit.textContent = 'Photography by ' + wallpaper.credit;
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

initializeManager({
  onChange: renderDirectory,
  getPreferences: () => ({ theme: preferences.theme, wallpaper: preferences.wallpaper, engine: preferences.engine }),
  applyPreferences: saved => {
    for (const [key, value] of Object.entries(saved)) savePreference(key, value);
    applyTheme();
    applyWallpaper();
    applyEngine();
  },
});
