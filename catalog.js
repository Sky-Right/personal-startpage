import { categories as defaults, favorites as defaultFavorites, wallpapers } from './config.js';

export const emptyCatalog = () => ({ version: 1, categories: [], sites: [], deleted: [] });
export const newId = () => 'user-' + crypto.randomUUID();

export function normalizeUrl(value) {
  let text = value.trim();
  if (!text || /\s/.test(text)) throw new Error('Enter a valid website address.');
  if (/^\/\//.test(text)) text = 'https:' + text;
  if (!/^https?:\/\//i.test(text)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(text) && !/^[^/:]+:\d+(?:\/|$)/.test(text)) {
      throw new Error('Use an HTTP or HTTPS website address.');
    }
    text = 'https://' + text;
  }
  let url;
  try { url = new URL(text); } catch { throw new Error('Enter a valid website address.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      !url.hostname || (!url.hostname.includes('.') && url.hostname !== 'localhost' && !url.hostname.includes(':'))) {
    throw new Error('Enter an HTTP or HTTPS website address without login details.');
  }
  return url.href;
}

export function suggestedName(value) {
  const host = new URL(value).hostname.replace(/^www\./, '');
  const known = defaults.flatMap(group => group.sites).find(site => new URL(site.url).hostname.replace(/^www\./, '') === host);
  if (known) return known.name;
  return host.split('.')[0].replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

export function mergeCatalog(catalog) {
  const groups = [...defaults.map(({ sites, ...group }) => ({ ...group, sites: [] })),
    ...catalog.categories.map(group => ({ ...group, icon: 'folder', sites: [] }))];
  const deleted = new Set(catalog.deleted);
  const overrides = new Map(catalog.sites.map(site => [site.id, site]));
  const originals = defaults.flatMap(group => group.sites.map(site => ({
    ...site, categoryId: group.id, favorite: defaultFavorites.includes(site.id),
  })));
  const originalIds = new Set(originals.map(site => site.id));
  const entries = [...originals.map(site => {
    const override = overrides.get(site.id);
    const merged = { ...site, ...override };
    if (override && override.url !== site.url) { delete merged.note; delete merged.keywords; }
    return merged;
  }),
    ...catalog.sites.filter(site => !originalIds.has(site.id))];
  for (const site of entries) {
    if (deleted.has(site.id)) continue;
    const group = groups.find(group => group.id === site.categoryId) ?? groups.find(group => group.id === 'daily') ?? groups[0];
    group.sites.push(site);
  }
  return groups;
}

let database;
function openDatabase() {
  if (!database) {
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open('skyright-library', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('library');
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); database = undefined; };
        resolve(db);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close other SkyRight tabs and try again.'));
    }).catch(error => { database = undefined; throw error; });
  }
  return database;
}

// Each write reads the latest catalog inside the same transaction, including uploaded image bytes.
export async function updateCatalog(change) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('library', 'readwrite');
    const store = transaction.objectStore('library');
    let updated;
    let failure;
    const request = store.get('catalog');
    request.onsuccess = () => {
      try {
        const current = request.result ?? emptyCatalog();
        if (current.version !== 1) throw new Error('This library uses a newer data format. Export it before changing browsers.');
        updated = change(current);
        store.put(updated, 'catalog');
      } catch (error) {
        failure = error;
        transaction.abort();
      }
    };
    transaction.oncomplete = () => resolve(updated);
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('Your changes could not be saved.'));
    transaction.onerror = () => {};
  });
}

export async function readCatalog() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('library', 'readonly');
    const request = transaction.objectStore('library').get('catalog');
    transaction.oncomplete = () => {
      const catalog = request.result ?? emptyCatalog();
      if (catalog.version !== 1) reject(new Error('This library uses a newer data format.'));
      else resolve(catalog);
    };
    transaction.onabort = () => reject(transaction.error);
  });
}

export function combineCatalogs(current, incoming) {
  const mergeIds = (left, right) => [...new Map([...left, ...right].map(item => [item.id, item])).values()];
  const incomingSites = new Set(incoming.sites.map(site => site.id));
  return {
    version: 1,
    categories: mergeIds(current.categories, incoming.categories),
    sites: mergeIds(current.sites, incoming.sites).filter(site => !incoming.deleted.includes(site.id)),
    deleted: [...new Set([...current.deleted.filter(id => !incomingSites.has(id)), ...incoming.deleted])],
  };
}

export async function prepareImage(file, padding = 4) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 6 * 1024 * 1024) {
    throw new Error('Choose a PNG, JPG, or WebP image under 6 MB.');
  }
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error('This image could not be read. Try another image.'); }
  try {
    if (bitmap.width * bitmap.height > 32_000_000) throw new Error('Choose an image smaller than 32 megapixels.');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const scale = Math.min((128 - padding * 2) / bitmap.width, (128 - padding * 2) / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, (128 - width) / 2, (128 - height) / 2, width, height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('This image could not be saved. Try another image.');
    return await blob.arrayBuffer();
  } finally { bitmap.close(); }
}

function dataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([blob], { type: 'image/png' }));
  });
}

export async function exportCatalog(catalog, preferences) {
  const sites = await Promise.all(catalog.sites.map(async site => ({
    ...site, ...(site.image ? { image: await dataUrl(site.image) } : {}),
  })));
  return { format: 'skyright', version: 1, exportedAt: new Date().toISOString(), catalog: { ...catalog, sites }, preferences };
}

function requireValue(condition) {
  if (!condition) throw new Error('This file is not a valid SkyRight backup.');
}
const validId = value => typeof value === 'string' && /^[a-z0-9-]{1,100}$/.test(value);
const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;

export async function importCatalog(data) {
  requireValue(data?.format === 'skyright' && data.version === 1 && data.catalog?.version === 1);
  const source = data.catalog;
  for (const key of ['categories', 'sites', 'deleted']) {
    requireValue(Array.isArray(source[key]) && source[key].length <= 2000);
  }
  const catalog = emptyCatalog();
  const categoryIds = new Set(defaults.map(group => group.id));
  for (const group of source.categories) {
    requireValue(validId(group?.id) && group.id.startsWith('user-') && !categoryIds.has(group.id) && validText(group.name, 60));
    categoryIds.add(group.id);
    catalog.categories.push({ id: group.id, name: group.name.trim() });
  }
  const ids = new Set();
  for (const entry of source.sites) {
    requireValue(entry && validId(entry.id) && !ids.has(entry.id));
    requireValue(validText(entry.name, 100) && validText(entry.url, 2048) && categoryIds.has(entry.categoryId));
    requireValue(typeof entry.favorite === 'boolean' && ['default', 'auto', 'upload'].includes(entry.logoMode));
    const site = {
      id: entry.id, name: entry.name.trim(), url: normalizeUrl(entry.url),
      categoryId: entry.categoryId, favorite: entry.favorite, logoMode: entry.logoMode,
    };
    if (entry.logoMode === 'upload') {
      requireValue(typeof entry.image === 'string' && entry.image.length <= 150000 &&
        /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(entry.image));
      const bytes = Uint8Array.from(atob(entry.image.split(',')[1]), char => char.charCodeAt(0));
      site.image = await prepareImage(new Blob([bytes], { type: 'image/png' }), 0);
    }
    ids.add(entry.id);
    catalog.sites.push(site);
  }
  for (const id of source.deleted) {
    requireValue(validId(id) && !ids.has(id) && !catalog.deleted.includes(id));
    catalog.deleted.push(id);
  }
  const preferences = data.preferences;
  requireValue(preferences && ['system', 'light', 'dark'].includes(preferences.theme) &&
    ['bing', 'google', 'baidu'].includes(preferences.engine) &&
    wallpapers.some(wallpaper => wallpaper.id === preferences.wallpaper));
  return { catalog, preferences: { theme: preferences.theme, wallpaper: preferences.wallpaper, engine: preferences.engine } };
}
