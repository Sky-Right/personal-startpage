import assert from 'node:assert/strict';
import { categories } from '../config.js';
import { emptyCatalog, normalizeUrl, mergeCatalog, combineCatalogs, importCatalog } from '../catalog.js';

assert.equal(normalizeUrl(' example.com/docs?q=AI '), 'https://example.com/docs?q=AI');
assert.equal(normalizeUrl('http://localhost:8080'), 'http://localhost:8080/');
assert.equal(normalizeUrl('//example.com'), 'https://example.com/');
for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'file:///tmp/a', 'https://user:pass@example.com', 'word with spaces']) {
  assert.throws(() => normalizeUrl(url));
}

const baseline = mergeCatalog(emptyCatalog());
const defaultCount = categories.flatMap(group => group.sites).length;
assert.equal(baseline.flatMap(group => group.sites).length, defaultCount);
const changed = emptyCatalog();
changed.categories.push({ id: 'user-lab', name: 'Lab' });
changed.sites.push({ id: 'github', name: 'My GitHub', url: 'https://example.com/', categoryId: 'user-lab', favorite: true, logoMode: 'auto' });
changed.deleted.push('claude');
const merged = mergeCatalog(changed);
assert.equal(merged.flatMap(group => group.sites).length, defaultCount - 1);
assert.equal(merged.find(group => group.id === 'user-lab').sites[0].name, 'My GitHub');
assert.equal(merged.flatMap(group => group.sites).find(site => site.id === 'github').favorite, true);
assert.equal(mergeCatalog(emptyCatalog()).flatMap(group => group.sites).length, defaultCount);

const incoming = emptyCatalog();
incoming.deleted.push('github');
assert(!combineCatalogs(changed, incoming).sites.some(site => site.id === 'github'));
assert(combineCatalogs(changed, incoming).deleted.includes('github'));
assert(!combineCatalogs(incoming, changed).deleted.includes('github'));
assert.equal(combineCatalogs(incoming, changed).sites.find(site => site.id === 'github').name, 'My GitHub');

const preferences = { theme: 'system', wallpaper: 'mountains', engine: 'bing' };
const backup = { format: 'skyright', version: 1, catalog: changed, preferences };
assert.deepEqual((await importCatalog(backup)).catalog, changed);
await assert.rejects(importCatalog({ ...backup, version: 99 }));
await assert.rejects(importCatalog({ ...backup, catalog: { ...changed, deleted: ['github'] } }));
await assert.rejects(importCatalog({ ...backup, catalog: { ...changed, sites: [{ ...changed.sites[0], url: 'javascript:alert(1)' }] } }));
await assert.rejects(importCatalog({ ...backup, catalog: { ...changed, sites: [{ ...changed.sites[0], logoMode: 'upload', image: '<svg></svg>' }] } }));
console.log('Catalog validation, default merging, and backup conflict checks passed.');
