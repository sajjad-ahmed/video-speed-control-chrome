const SPEED_MIN = 0.25;
const SPEED_MAX = 4.0;
const SPEED_STEP = 0.25;
const MAX_SITES = 10;

const globalSpeedEl = document.getElementById('globalSpeed');
const globalBadgeEl = document.getElementById('globalBadge');
const siteListEl = document.getElementById('siteList');
const addSiteBtnEl = document.getElementById('addSiteBtn');
const useCurrentSiteBtnEl = document.getElementById('useCurrentSiteBtn');
const countBadgeEl = document.getElementById('countBadge');
const toastEl = document.getElementById('toast');
const resetAllBtnEl = document.getElementById('resetAllBtn');
const resetGlobalBtnEl = document.getElementById('resetGlobalBtn');

let toastTimeout = null;
let currentTabDomain = '';

function isValidSiteUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const invalidProtocols = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'brave:', 'file:', 'devtools:'];
    if (invalidProtocols.includes(parsed.protocol)) return false;
    if (!parsed.hostname || parsed.hostname === 'newtab' || parsed.hostname === 'extensions') return false;
    return true;
  } catch {
    return false;
  }
}

function initCurrentSiteButton() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;
    const tab = tabs[0];
    if (isValidSiteUrl(tab.url)) {
      currentTabDomain = extractDomain(tab.url);
      const currentCount = siteListEl.querySelectorAll('.site-card').length;
      useCurrentSiteBtnEl.disabled = currentCount >= MAX_SITES;
    }
  });
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  toastEl.classList.add('visible');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('visible');
    toastEl.classList.add('hidden');
  }, 1800);
}

function generateSpeedOptions() {
  const options = [];
  for (let s = SPEED_MIN; s <= SPEED_MAX + 0.001; s += SPEED_STEP) {
    options.push(parseFloat(s.toFixed(2)));
  }
  return options;
}

function populateSelect(selectEl, selectedValue) {
  selectEl.innerHTML = '';
  const speeds = generateSpeedOptions();
  speeds.forEach((speed) => {
    const opt = document.createElement('option');
    opt.value = speed;
    opt.textContent = speed.toFixed(2) + 'x';
    if (Math.abs(speed - selectedValue) < 0.001) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });
}

function updateGlobalBadge(speed) {
  globalBadgeEl.textContent = parseFloat(speed).toFixed(2) + 'x';
}

function updateCountBadge(count) {
  countBadgeEl.textContent = count + ' / ' + MAX_SITES;
  addSiteBtnEl.disabled = count >= MAX_SITES;
  useCurrentSiteBtnEl.disabled = count >= MAX_SITES || !currentTabDomain;
}

function saveOverrides(siteOverrides) {
  chrome.storage.sync.set({ siteOverrides });
  updateCountBadge(siteOverrides.length);
}

function getCurrentOverrides() {
  const cards = siteListEl.querySelectorAll('.site-card');
  const overrides = [];
  cards.forEach((card) => {
    const domain = card.querySelector('.site-domain-input').value.trim().toLowerCase();
    const speed = parseFloat(card.querySelector('.site-speed-select').value);
    if (domain) {
      overrides.push({ domain, speed });
    }
  });
  return overrides;
}

function createSiteCard(domain, speed) {
  const card = document.createElement('div');
  card.className = 'site-card';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'site-domain-input';
  input.placeholder = 'e.g. youtube.com';
  input.value = domain || '';

  const speedWrapper = document.createElement('div');
  speedWrapper.className = 'site-speed-wrapper';

  const select = document.createElement('select');
  select.className = 'site-speed-select';
  populateSelect(select, speed || 1.0);

  const arrow = document.createElement('span');
  arrow.className = 'site-speed-arrow';
  arrow.innerHTML = '&#9662;';

  speedWrapper.appendChild(select);
  speedWrapper.appendChild(arrow);

  const actions = document.createElement('div');
  actions.className = 'site-card-actions';

  const applyBtn = document.createElement('button');
  applyBtn.className = 'btn-apply';
  applyBtn.type = 'button';
  applyBtn.innerHTML = '&#10003;';
  applyBtn.title = 'Apply speed';

  applyBtn.addEventListener('click', () => {
    const domainVal = input.value.trim().toLowerCase();
    if (!domainVal) {
      showToast('Please enter a domain first');
      return;
    }
    const overrides = getCurrentOverrides();
    saveOverrides(overrides);
    applyBtn.classList.add('applied');
    showToast('Speed applied for ' + domainVal);
    setTimeout(() => applyBtn.classList.remove('applied'), 600);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.type = 'button';
  deleteBtn.innerHTML = '&#10005;';
  deleteBtn.title = 'Remove site';

  deleteBtn.addEventListener('click', () => {
    card.classList.add('removing');
    setTimeout(() => {
      card.remove();
      saveOverrides(getCurrentOverrides());
    }, 200);
  });

  select.addEventListener('change', () => {
    applyBtn.classList.remove('applied');
  });

  input.addEventListener('input', () => {
    applyBtn.classList.remove('applied');
  });

  actions.appendChild(applyBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(input);
  card.appendChild(speedWrapper);
  card.appendChild(actions);

  return card;
}

function renderSiteList(siteOverrides) {
  siteListEl.innerHTML = '';
  siteOverrides.forEach((entry) => {
    siteListEl.appendChild(createSiteCard(entry.domain, entry.speed));
  });
  updateCountBadge(siteOverrides.length);
}

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

populateSelect(globalSpeedEl, 1.0);

chrome.storage.sync.get({ globalSpeed: 1.0, siteOverrides: [] }, (data) => {
  populateSelect(globalSpeedEl, data.globalSpeed);
  updateGlobalBadge(data.globalSpeed);
  renderSiteList(data.siteOverrides);
  initCurrentSiteButton();
});

globalSpeedEl.addEventListener('change', () => {
  const speed = parseFloat(globalSpeedEl.value);
  chrome.storage.sync.set({ globalSpeed: speed });
  updateGlobalBadge(speed);
});

addSiteBtnEl.addEventListener('click', () => {
  const currentCount = siteListEl.querySelectorAll('.site-card').length;
  if (currentCount >= MAX_SITES) return;
  const card = createSiteCard('', 1.0);
  siteListEl.appendChild(card);
  updateCountBadge(currentCount + 1);
  card.querySelector('.site-domain-input').focus();
});

useCurrentSiteBtnEl.addEventListener('click', () => {
  if (!currentTabDomain) {
    showToast('Not on a valid site');
    return;
  }

  const currentCount = siteListEl.querySelectorAll('.site-card').length;
  if (currentCount >= MAX_SITES) {
    showToast('Maximum ' + MAX_SITES + ' sites reached');
    return;
  }

  const existing = getCurrentOverrides();
  const alreadyExists = existing.some(
    (e) => e.domain === currentTabDomain || currentTabDomain.endsWith('.' + e.domain) || e.domain.endsWith('.' + currentTabDomain)
  );

  if (alreadyExists) {
    showToast(currentTabDomain + ' is already in the list');
    return;
  }

  const card = createSiteCard(currentTabDomain, 1.0);
  siteListEl.appendChild(card);
  updateCountBadge(currentCount + 1);
  showToast('Added ' + currentTabDomain);
});

resetGlobalBtnEl.addEventListener('click', () => {
  populateSelect(globalSpeedEl, 1.0);
  updateGlobalBadge(1.0);
  chrome.storage.sync.set({ globalSpeed: 1.0 });
  showToast('Global speed reset to 1.00x');
});

resetAllBtnEl.addEventListener('click', () => {
  if (!confirm('This will reset the global speed and remove all site-specific rules. Are you sure?')) return;
  chrome.storage.sync.set({ globalSpeed: 1.0, siteOverrides: [] }, () => {
    populateSelect(globalSpeedEl, 1.0);
    updateGlobalBadge(1.0);
    siteListEl.innerHTML = '';
    updateCountBadge(0);
    showToast('Everything has been reset');
  });
});
