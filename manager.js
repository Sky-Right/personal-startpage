import { categories as defaultCategories } from './config.js';
import { emptyCatalog, newId, normalizeUrl, suggestedName, mergeCatalog, readCatalog, updateCatalog,
  prepareImage, exportCatalog, importCatalog, combineCatalogs } from './catalog.js';
import { siteLogo } from './logos.js';

export function initializeManager({ onChange, getPreferences, applyPreferences }) {
  const $ = id => document.getElementById(id);
  const editor = $('website-editor');
  const form = $('website-form');
  const urlInput = $('website-url');
  const nameInput = $('website-name');
  const categoryInput = $('website-category');
  const categoryName = $('new-category');
  const saveButton = $('save-website');
  const backupDialog = $('backup-dialog');
  const buttons = ['add-website', 'manage-websites', 'import-data', 'export-data'];
  let catalog = emptyCatalog();
  let editing;
  let draftLogo;
  let nameEdited = false;
  let currentUrl = '';
  let busy = false;
  let imageTask = 0;
  let previewTask = 0;
  let urlTimer;
  let statusTimer;
  let pendingImport;
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('skyright-library') : null;

  function notify(message) {
    clearTimeout(statusTimer);
    $('library-status').textContent = message;
    $('library-status').hidden = false;
    statusTimer = setTimeout(() => { $('library-status').hidden = true; }, 9000);
  }

  function showError(id, message = '') {
    $(id).textContent = message;
    $(id).hidden = !message;
  }

  function refresh(next) {
    catalog = next;
    onChange(mergeCatalog(next));
  }

  async function commit(change) {
    const next = await updateCatalog(change);
    refresh(next);
    channel?.postMessage('updated');
  }

  function setBusy(value) {
    busy = value;
    $('editor-fields').disabled = value;
    for (const button of editor.querySelectorAll('button')) button.disabled = value;
    editor.setAttribute('aria-busy', String(value));
  }

  function preview() {
    const token = ++previewTask;
    const name = nameInput.value.trim() || 'Website';
    const site = { ...editing, ...draftLogo, name, url: currentUrl || 'https://example.com/' };
    $('logo-preview').replaceChildren(siteLogo(site, status => {
      if (token !== previewTask) return;
      $('logo-note').textContent = status === 'fallback'
        ? 'Using a default icon. You can upload your own.'
        : 'PNG, JPG, or WebP. Up to 6 MB.';
    }));
  }

  function identifyUrl() {
    let url;
    try { url = normalizeUrl(urlInput.value); } catch { return; }
    if (url === currentUrl) return;
    currentUrl = url;
    if (!nameEdited) nameInput.value = suggestedName(url);
    if (draftLogo.logoMode === 'default') draftLogo = { logoMode: 'auto' };
    preview();
  }

  function closeEditor() {
    if (!busy) editor.close();
  }

  function openEditor(site) {
    editing = site;
    nameEdited = Boolean(site);
    currentUrl = site?.url ?? '';
    draftLogo = { logoMode: site?.logoMode ?? (site ? 'default' : 'auto'), ...(site?.image ? { image: site.image } : {}) };
    form.reset();
    urlInput.value = site?.url ?? '';
    nameInput.value = site?.name ?? '';
    $('editor-title').textContent = site ? 'Edit website' : 'Add website';
    saveButton.textContent = site ? 'Save changes' : 'Add website';
    $('delete-website').hidden = !site;
    $('delete-confirmation').hidden = true;
    showError('editor-error');
    const groups = mergeCatalog(catalog);
    categoryInput.replaceChildren(...groups.map(group => new Option(group.name, group.id)), new Option('New category…', '__new__'));
    const selected = document.querySelector('#category-filters [aria-pressed="true"]')?.dataset.category;
    categoryInput.value = site?.categoryId ?? (selected || groups.find(group => group.id === 'daily')?.id || groups[0].id);
    categoryName.hidden = $('new-category-label').hidden = true;
    categoryName.required = false;
    $('website-favorite').checked = site?.favorite ?? false;
    $('logo-note').textContent = 'PNG, JPG, or WebP. Up to 6 MB.';
    preview();
    editor.showModal();
    urlInput.focus();
  }

  $('add-website').addEventListener('click', () => openEditor());
  document.addEventListener('click', event => {
    const edit = event.target.closest('[data-edit-site]');
    if (!edit) return;
    const site = mergeCatalog(catalog).flatMap(group => group.sites).find(site => site.id === edit.dataset.editSite);
    if (site) openEditor(site);
  });
  for (const button of editor.querySelectorAll('[data-close-editor]')) button.addEventListener('click', closeEditor);
  editor.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  editor.addEventListener('close', () => { clearTimeout(urlTimer); imageTask++; previewTask++; });

  urlInput.addEventListener('input', () => {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(identifyUrl, 400);
  });
  urlInput.addEventListener('blur', identifyUrl);
  nameInput.addEventListener('input', () => { nameEdited = true; });
  nameInput.addEventListener('change', preview);
  categoryInput.addEventListener('change', () => {
    const adding = categoryInput.value === '__new__';
    categoryName.hidden = $('new-category-label').hidden = !adding;
    categoryName.required = adding;
    if (adding) categoryName.focus();
  });

  $('website-logo').addEventListener('change', async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const token = ++imageTask;
    showError('editor-error');
    saveButton.disabled = true;
    $('logo-note').textContent = 'Preparing image…';
    try {
      const image = await prepareImage(file);
      if (token !== imageTask || !editor.open) return;
      draftLogo = { logoMode: 'upload', image };
      preview();
    } catch (error) {
      if (token === imageTask) {
        showError('editor-error', error.message);
        $('logo-note').textContent = 'PNG, JPG, or WebP. Up to 6 MB.';
      }
    } finally {
      if (token === imageTask) saveButton.disabled = false;
    }
  });
  $('automatic-logo').addEventListener('click', () => {
    imageTask++;
    saveButton.disabled = false;
    showError('editor-error');
    draftLogo = { logoMode: 'auto' };
    identifyUrl();
    preview();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    showError('editor-error');
    let url;
    try { url = normalizeUrl(urlInput.value); } catch (error) {
      showError('editor-error', error.message);
      urlInput.focus();
      return;
    }
    identifyUrl();
    urlInput.value = url;
    if (!nameInput.value.trim()) nameInput.value = suggestedName(url);
    const name = nameInput.value.trim();
    const newCategoryName = categoryName.value.trim();
    if (categoryInput.value === '__new__' && !newCategoryName) {
      showError('editor-error', 'Enter a category name.');
      categoryName.focus();
      return;
    }
    setBusy(true);
    try {
      const id = editing?.id ?? newId();
      const groupId = newId();
      await commit(current => {
        let categoryId = categoryInput.value;
        if (categoryId === '__new__') {
          const existing = [...defaultCategories, ...current.categories].find(group => group.name.toLowerCase() === newCategoryName.toLowerCase());
          categoryId = existing?.id ?? groupId;
          if (!existing) current.categories.push({ id: categoryId, name: newCategoryName });
        }
        const site = { id, name, url, categoryId, favorite: $('website-favorite').checked, ...draftLogo };
        const position = current.sites.findIndex(entry => entry.id === id);
        if (position < 0) current.sites.push(site);
        else current.sites[position] = site;
        current.deleted = current.deleted.filter(entry => entry !== id);
        return current;
      });
      editor.close();
      notify(editing ? 'Website updated.' : 'Website added.');
    } catch {
      showError('editor-error', 'Your website could not be saved. Check available browser storage and try again.');
    } finally { setBusy(false); }
  });

  $('delete-website').addEventListener('click', () => {
    $('delete-confirmation').hidden = false;
    $('confirm-delete').focus();
  });
  $('cancel-delete').addEventListener('click', () => {
    $('delete-confirmation').hidden = true;
    $('delete-website').focus();
  });
  $('confirm-delete').addEventListener('click', async () => {
    if (busy || !editing) return;
    setBusy(true);
    try {
      await commit(current => ({
        ...current, sites: current.sites.filter(site => site.id !== editing.id),
        deleted: [...new Set([...current.deleted, editing.id])],
      }));
      editor.close();
      notify('Website deleted.');
    } catch { showError('editor-error', 'The website could not be deleted. Try again.'); }
    finally { setBusy(false); }
  });

  function manage(value) {
    document.body.classList.toggle('is-managing', value);
    $('manage-bar').hidden = !value;
    for (const link of document.querySelectorAll('.site-link')) {
      if (value) link.tabIndex = -1;
      else link.removeAttribute('tabindex');
    }
  }
  $('manage-websites').addEventListener('click', () => {
    $('settings').close();
    manage(true);
    $('done-managing').focus();
  });
  $('done-managing').addEventListener('click', () => { manage(false); $('add-website').focus(); });

  $('export-data').addEventListener('click', async () => {
    $('export-data').disabled = true;
    try {
      const backup = await exportCatalog(await readCatalog(), getPreferences());
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'skyright-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('settings-note').textContent = 'Backup exported, including uploaded logos.';
    } catch { $('settings-note').textContent = 'The backup could not be exported. Try again.'; }
    finally { $('export-data').disabled = false; }
  });

  $('import-data').addEventListener('click', () => $('backup-file').click());
  $('backup-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    $('import-data').disabled = true;
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error('Choose a SkyRight backup under 12 MB.');
      pendingImport = await importCatalog(JSON.parse(await file.text()));
      const data = pendingImport.catalog;
      $('backup-summary').textContent = data.sites.length + ' website changes, ' + data.categories.length +
        ' custom categories, and ' + data.deleted.length + ' deletions.';
      showError('import-error');
      backupDialog.querySelector('[value="merge"]').checked = true;
      $('settings').close();
      backupDialog.showModal();
    } catch (error) {
      $('settings-note').textContent = error instanceof SyntaxError ? 'This file is not valid JSON.' : error.message;
    } finally { $('import-data').disabled = false; }
  });
  $('cancel-import').addEventListener('click', () => backupDialog.close());
  backupDialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  backupDialog.addEventListener('close', () => { pendingImport = undefined; });
  $('confirm-import').addEventListener('click', async () => {
    if (!pendingImport || busy) return;
    busy = true;
    $('confirm-import').disabled = $('cancel-import').disabled = true;
    showError('import-error');
    try {
      const backup = pendingImport;
      const mode = backupDialog.querySelector('[name="import-mode"]:checked').value;
      await commit(current => mode === 'replace' ? backup.catalog : combineCatalogs(current, backup.catalog));
      applyPreferences(backup.preferences);
      backupDialog.close();
      notify('Backup imported.');
    } catch { showError('import-error', 'The backup could not be saved. Your current library is unchanged.'); }
    finally {
      busy = false;
      $('confirm-import').disabled = $('cancel-import').disabled = false;
    }
  });

  channel?.addEventListener('message', () => {
    readCatalog().then(refresh).catch(() => notify('The library could not be refreshed. Reload this page to try again.'));
  });
  readCatalog().then(next => {
    refresh(next);
    for (const id of buttons) $(id).disabled = false;
  }).catch(() => {
    refresh(emptyCatalog());
    notify('Your library could not be opened. Enable browser storage, then reload this page.');
    $('settings-note').textContent = 'Website management needs browser storage. Enable it and reload this page.';
  });
}
