import assert from 'node:assert/strict';
import { access, cp, mkdir, readFile, rm } from 'node:fs/promises';
import { categories, defaults, favorites, wallpapers } from '../config.js';

const root = new URL('../', import.meta.url);
const resolve = path => new URL(path, root);
const files = ['index.html', 'styles.css', 'app.js', 'config.js', 'assets'];
const svg = await readFile(resolve('assets/ui.svg'), 'utf8');
for (const file of ['index.html', 'styles.css']) {
  const contents = await readFile(resolve(file), 'utf8');
  for (const [, path] of contents.matchAll(/["'](\.\/assets\/[^"'\s#]+)(?:#[^"']*)?["']/g)) {
    await access(resolve(path));
  }
}

function checkIcon(icon) {
  if (icon) assert(svg.includes('id="' + icon + '"'), '找不到图标：' + icon);
}

function checkIds(entries) {
  const ids = entries.map(entry => entry.id);
  assert(ids.every(id => typeof id === 'string' && /^[a-z0-9-]+$/.test(id)), 'ID 只能使用小写字母、数字和连字符。');
  assert.equal(new Set(ids).size, ids.length, 'ID 有重复。');
}

checkIds(categories);
checkIds(wallpapers);
const sites = categories.flatMap(category => category.sites);
checkIds(sites);
assert(categories.length && categories.every(category => category.name?.trim() && category.sites.length), '分类需要名称和至少一个网站。');
assert.equal(new Set(favorites).size, favorites.length, '常用网站有重复。');
for (const id of favorites) {
  assert(sites.some(site => site.id === id), '常用网站 ID 不存在：' + id);
}
for (const category of categories) checkIcon(category.icon);
for (const site of sites) {
  assert(site.name?.trim(), '网站名称为空：' + site.id);
  assert.equal(new URL(site.url).protocol, 'https:', '请使用 HTTPS：' + site.id);
  checkIcon(site.icon);
  if (site.logo) {
    assert(/^[\w.-]+\.(svg|png|webp|ico|jpe?g)$/i.test(site.logo), 'Logo 应填写 assets/icons 内的文件名：' + site.id);
    await access(resolve('assets/icons/' + site.logo));
  }
}
assert(['system', 'light', 'dark'].includes(defaults.theme), '默认主题无效。');
assert(['bing', 'google', 'baidu'].includes(defaults.engine), '默认搜索引擎无效。');
assert(wallpapers.some(wallpaper => wallpaper.id === defaults.wallpaper), '默认背景不存在。');
for (const wallpaper of wallpapers) {
  assert(wallpaper.name?.trim(), '背景名称为空：' + wallpaper.id);
  const variants = wallpaper.srcset?.split(',').map(variant => variant.trim().split(/\s+/)[0]) ?? [];
  for (const image of [wallpaper.image, ...variants].filter(Boolean)) {
    assert(image.startsWith('./assets/'), '背景图应存放在 assets 目录：' + image);
    await access(resolve(image));
  }
}

const dist = resolve('dist/');
await rm(dist, { recursive: true, force: true });
await mkdir(dist);
for (const file of files) {
  await cp(resolve(file), new URL(file, dist), { recursive: true, filter: path => !path.endsWith('/.DS_Store') });
}
console.log('已构建 dist/，包含 ' + sites.length + ' 个网站。');
