export function siteLogo(site, onStatus = () => {}) {
  const container = document.createElement('span');
  container.className = 'site-logo';
  container.setAttribute('aria-hidden', 'true');
  const fallback = document.createElement('span');
  fallback.className = 'initials';
  fallback.textContent = Array.from(site.name.trim())[0]?.toUpperCase() ?? '·';
  container.append(fallback);
  const automatic = site.logoMode === 'auto';
  const uploaded = site.logoMode === 'upload' && site.image instanceof ArrayBuffer;
  const sources = [];
  let localUrl;
  if (uploaded) {
    localUrl = URL.createObjectURL(new Blob([site.image], { type: 'image/png' }));
    sources.push(localUrl);
  } else if (!automatic && site.logo) {
    sources.push(new URL(site.logo, new URL('./assets/icons/', import.meta.url)).href);
  } else if (!automatic && site.icon) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS(svg.namespaceURI, 'use');
    svg.setAttribute('class', 'icon');
    use.setAttribute('href', './assets/ui.svg#' + site.icon);
    svg.append(use);
    container.replaceChildren(svg);
    return container;
  } else {
    const url = new URL(site.url);
    // Image requests can display cross-origin icons without reading their pixels or page HTML.
    const origin = 'https://' + url.host;
    sources.push(origin + '/favicon.ico', origin + '/apple-touch-icon.png',
      'https://icons.duckduckgo.com/ip3/' + encodeURIComponent(url.hostname) + '.ico',
      'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(url.hostname) + '&sz=64');
  }

  function tryNext() {
    const source = sources.shift();
    if (!source) { onStatus('fallback'); return; }
    const image = new Image(20, 20);
    image.alt = '';
    image.referrerPolicy = 'no-referrer';
    image.decoding = 'async';
    if (!automatic && !uploaded && site.invert) image.dataset.invert = '';
    if (uploaded) image.dataset.upload = '';
    const release = () => {
      clearTimeout(timer);
      image.onload = image.onerror = null;
      if (localUrl) { URL.revokeObjectURL(localUrl); localUrl = undefined; }
    };
    const timer = setTimeout(() => { release(); tryNext(); }, 3500);
    image.onload = () => {
      release();
      container.replaceChildren(image);
      onStatus('loaded');
    };
    image.onerror = () => { release(); tryNext(); };
    image.src = source;
  }
  tryNext();
  return container;
}
