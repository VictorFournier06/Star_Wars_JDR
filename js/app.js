/**
 * STAR WARS CHARACTER CREATOR - MAIN APPLICATION
 * 
 * Dependencies: data.js, utils.js, tooltip.js, effects.js (load in order)
 */

// =============================================================================
// STATE
// =============================================================================
const state = {
  page: 0,
  speciesId: null,
  professionId: null,
  selectedTraits: new Set(),
};

// =============================================================================
// DATA LOOKUPS
// =============================================================================
function speciesChosen() {
  return SPECIES.find(s => s.id === state.speciesId) || null;
}

function profession() {
  return PROFESSIONS.find(p => p.id === state.professionId) || null;
}

function traitById(id) {
  return TRAITS.find(t => t.id === id);
}

// =============================================================================
// POINTS CALCULATION
// =============================================================================
const BASE_POINTS = 20;

function traitPoints(t) {
  return -(t?.value ?? 0);
}

function disabledTraitsSet(selectedIds) {
  const disabled = new Set();
  selectedIds.forEach(id => {
    const t = traitById(id);
    (t?.incompatible || []).forEach(x => disabled.add(x));
  });
  return disabled;
}

function getComputedStats() {
  const base = 10;
  const mods = { FOR: 0, DEX: 0, CON: 0, INT: 0, SAG: 0, CHA: 0 };
  
  // Species modifiers
  const s = speciesChosen();
  if (s?.hidden?.abilityMods) {
    const speciesMods = parseAbilityMods(s.hidden.abilityMods);
    Object.keys(speciesMods).forEach(stat => mods[stat] += speciesMods[stat]);
  }
  
  // Profession modifiers
  const p = profession();
  if (p?.hidden?.abilityMods) {
    const profMods = parseAbilityMods(p.hidden.abilityMods);
    Object.keys(profMods).forEach(stat => mods[stat] += profMods[stat]);
  }
  
  // Trait modifiers
  state.selectedTraits.forEach(traitId => {
    const trait = traitById(traitId);
    if (trait?.hidden?.abilityMods) {
      const traitMods = parseAbilityMods(trait.hidden.abilityMods);
      Object.keys(traitMods).forEach(stat => mods[stat] += traitMods[stat]);
    }
  });
  
  return STATS.map(stat => ({
    id: stat.id,
    name: stat.name,
    abbr: stat.abbr,
    base,
    mod: mods[stat.id] || 0,
    total: base + (mods[stat.id] || 0)
  }));
}

function totalPoints() {
  let sum = BASE_POINTS;
  
  const s = speciesChosen();
  if (s) sum += s.points || 0;
  
  const p = profession();
  if (p) sum += p.points || 0;
  
  state.selectedTraits.forEach(id => {
    const t = traitById(id);
    if (t) sum += traitPoints(t);
  });
  
  return sum;
}

// =============================================================================
// UI UPDATES
// =============================================================================
function setTotalUI() {
  const t = totalPoints();
  
  const el = $('#totalVal');
  if (el) {
    el.textContent = t;
    el.classList.toggle('ok', t >= 0);
    el.classList.toggle('bad', t < 0);
  }

  const chip = $('#totalChip');
  if (chip) {
    chip.textContent = `POINTS ${t}`;
    chip.className = 'chip ' + (t >= 0 ? '' : 'amber');
  }

  const status = $('#statusChip');
  if (status) {
    status.textContent = t >= 0 ? 'Prêt' : 'Dépassement';
    status.className = 'chip ' + (t >= 0 ? '' : 'amber');
  }
}

// =============================================================================
// NAVIGATION
// =============================================================================
function goTo(i) {
  state.page = Math.max(0, Math.min(PAGE_NAMES.length - 1, i));
  
  $$('.page').forEach(p => {
    p.classList.toggle('active', Number(p.dataset.page) === state.page);
  });
  
  $$('.tab').forEach((b, idx) => {
    b.classList.toggle('active', idx === state.page);
  });
  
  $('#prevBtn').disabled = state.page === 0;
  $('#nextBtn').disabled = state.page === PAGE_NAMES.length - 1;

  if (state.page === 4) renderSummary();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================================
// RENDER FUNCTIONS
// =============================================================================
function renderTabs() {
  const tabs = $('#tabs');
  tabs.innerHTML = '';
  
  PAGE_NAMES.forEach((name, idx) => {
    const b = document.createElement('button');
    b.className = 'tab' + (idx === state.page ? ' active' : '');
    b.textContent = `${idx + 1} • ${name}`;
    b.addEventListener('click', () => {
      goTo(idx);
      AudioManager.playSelect();
    });
    tabs.appendChild(b);
  });
}

function renderSpecies(forceRebuild = false) {
  const host = $('#speciesList');
  
  if (host.children.length === SPECIES.length && !forceRebuild) {
    updateSpeciesSelection();
    return;
  }
  
  host.innerHTML = '';

  SPECIES.forEach(s => {
    const card = document.createElement('div');
    const chosen = state.speciesId === s.id;
    card.className = 'species-card' + (chosen ? ' active' : '');
    card.setAttribute('role', 'button');
    card.setAttribute('data-species-id', s.id);
    card.tabIndex = 0;

    const pts = s.points || 0;
    const sign = pts >= 0 ? '+' : '';
    const imgHelper = createSpeciesImage(s.id);

    card.innerHTML = `
      <div class="species-img-wrap" data-species-id="${s.id}">
        <img class="species-img" data-species-id="${s.id}" alt="${s.name}" 
             src="${imgHelper.basePath}.png" onerror="tryNextSpeciesImage(this)">
      </div>
      <div class="species-content">
        <div class="species-name">${s.name}</div>
        <p class="species-blurb">${s.blurb}</p>
        <div class="species-tags">
          ${(s.tags || []).slice(0, 3).map(t => `<span class="chip">${t}</span>`).join('')}
          <span class="chip pos selected-chip" style="display:${chosen ? 'inline-block' : 'none'}">Sélectionnée</span>
        </div>
      </div>
      <div class="species-pts">
        <span class="chip ${pts >= 0 ? 'pos' : 'neg'}">${sign}${pts}</span>
      </div>
    `;

    // Tooltip on image hover
    const imgWrap = card.querySelector('.species-img-wrap');
    let hoverTimeout = null;
    
    imgWrap.addEventListener('mouseenter', () => {
      cancelTooltipHide();
      hoverTimeout = setTimeout(() => {
        showSpeciesTooltip(s.id, imgWrap);
      }, 200);
    });
    
    imgWrap.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      scheduleHideTooltip();
    });

    // Selection
    const selectIt = () => {
      state.speciesId = s.id;
      updateSpeciesSelection();
      setTotalUI();
      AudioManager.playSelect();
    };

    card.addEventListener('click', selectIt);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectIt();
      }
    });

    host.appendChild(card);
  });
}

function updateSpeciesSelection() {
  $$('#speciesList .species-card').forEach(card => {
    const isSelected = card.dataset.speciesId === state.speciesId;
    card.classList.toggle('active', isSelected);
    const selectedChip = card.querySelector('.selected-chip');
    if (selectedChip) {
      selectedChip.style.display = isSelected ? 'inline-block' : 'none';
    }
  });
}

function renderProfessions(forceRebuild = false) {
  const host = $('#profList');
  
  if (host.children.length === PROFESSIONS.length && !forceRebuild) {
    updateProfessionSelection();
    return;
  }
  
  host.innerHTML = '';

  PROFESSIONS.forEach(p => {
    const row = document.createElement('div');
    row.className = 'choice' + (state.professionId === p.id ? ' active' : '');
    row.setAttribute('role', 'button');
    row.setAttribute('data-profession-id', p.id);
    row.tabIndex = 0;

    const chosen = state.professionId === p.id;
    const pts = p.points || 0;
    const sign = pts >= 0 ? '+' : '';

    row.innerHTML = `
      <div class="left">
        <strong>${p.name}</strong>
        <p>${p.blurb}</p>
        <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap">
          ${(p.tags || []).slice(0, 3).map(t => `<span class="chip">${t}</span>`).join('')}
          <span class="chip pos selected-chip" style="display:${chosen ? 'inline-block' : 'none'}">Sélectionnée</span>
        </div>
      </div>
      <div class="right">
        <span class="chip ${pts >= 0 ? 'pos' : 'neg'}">${sign}${pts}</span>
      </div>
    `;

    const selectIt = () => {
      state.professionId = p.id;
      updateProfessionSelection();
      setTotalUI();
      AudioManager.playSelect();
    };

    row.addEventListener('click', selectIt);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectIt();
      }
    });

    host.appendChild(row);
  });
}

function updateProfessionSelection() {
  $$('#profList .choice').forEach(row => {
    const isSelected = row.dataset.professionId === state.professionId;
    row.classList.toggle('active', isSelected);
    const selectedChip = row.querySelector('.selected-chip');
    if (selectedChip) {
      selectedChip.style.display = isSelected ? 'inline-block' : 'none';
    }
  });
}

function renderTraits(filterText = '') {
  const host = $('#traitList');
  const q = (filterText || '').trim().toLowerCase();
  host.innerHTML = '';

  const disabled = disabledTraitsSet(state.selectedTraits);

  TRAITS
    .filter(t => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    })
    .forEach(t => {
      const checked = state.selectedTraits.has(t.id);
      const isDisabled = !checked && disabled.has(t.id);

      const card = document.createElement('div');
      card.className = 'trait' + (checked ? ' active' : '') + (isDisabled ? ' disabled' : '');
      card.setAttribute('role', 'button');
      card.tabIndex = isDisabled ? -1 : 0;

      const pts = traitPoints(t);
      const valClass = pts >= 0 ? 'pos' : 'neg';
      const sign = pts >= 0 ? '+' : '';

      let incompat = '';
      if ((t.incompatible || []).length && (checked || isDisabled)) {
        const names = (t.incompatible || []).map(x => traitById(x)?.name || x).join(' • ');
        incompat = `<div style="margin-top:10px"><span class="chip amber wrap">Incompatible : ${names}</span></div>`;
      }

      const tag = (t.tags || [])[0];

      card.innerHTML = `
        <div class="dot" aria-hidden="true"></div>
        <div class="body">
          <div class="top">
            <p class="name">${t.name}</p>
            <span class="chip ${valClass}">${sign}${pts}</span>
          </div>
          <p class="desc">${t.desc}</p>
          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap">
            ${tag ? `<span class="chip">${tag}</span>` : ''}
            ${checked ? `<span class="chip pos">Sélectionné</span>` : ''}
            ${isDisabled ? `<span class="chip amber">Bloqué</span>` : ''}
          </div>
          ${incompat}
        </div>
      `;

      const toggle = () => {
        if (isDisabled) return;
        state.selectedTraits.has(t.id) 
          ? state.selectedTraits.delete(t.id) 
          : state.selectedTraits.add(t.id);
        renderTraits($('#traitSearch').value);
        setTotalUI();
        AudioManager.playSelect();
      };

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      host.appendChild(card);
    });

  setTotalUI();
}

function renderStats() {
  const grid = $('#statsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const stats = getComputedStats();
  
  stats.forEach(stat => {
    const field = document.createElement('div');
    field.className = 'field';
    
    // Display stat abbreviation with modifier indicator
    const modSign = stat.mod >= 0 ? '+' : '';
    const modDisplay = stat.mod !== 0 
      ? ` <span class="stat-mod ${stat.mod > 0 ? 'pos' : 'neg'}">(${modSign}${stat.mod})</span>` 
      : '';
    
    field.innerHTML = `
      <label>${stat.abbr}${modDisplay}</label>
      <input type="number" id="${stat.id}" value="${stat.total}" readonly class="readonly-stat" />
    `;
    
    grid.appendChild(field);
  });
}

function renderSkills() {
  const ul = $('#skillsList');
  if (!ul) return;
  ul.innerHTML = '';

  const s = speciesChosen();
  const p = profession();
  const skills = [...new Set([...(s?.hidden?.skills || []), ...(p?.hidden?.skills || [])])];
  
  if (!skills.length) {
    ul.innerHTML = '<li>—</li>';
    return;
  }

  skills.forEach(sk => {
    const li = document.createElement('li');
    li.textContent = sk;
    ul.appendChild(li);
  });
}

function renderSummary() {
  const ul = $('#summary');
  ul.innerHTML = '';

  const add = (label, value) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${label}</b> : <span class="muted">${value || '—'}</span>`;
    ul.appendChild(li);
  };

  add('Nom de code', $('#codename')?.value);
  add('Concept', $('#concept')?.value);
  add('Camp', $('#aff')?.value);
  add('Espèce', speciesChosen()?.name);
  add('Profession', profession()?.name);

  const tList = Array.from(state.selectedTraits)
    .map(id => traitById(id))
    .filter(Boolean)
    .sort((a, b) => traitPoints(b) - traitPoints(a));

  const traitText = tList.length
    ? tList.map(t => `${t.name} (${traitPoints(t) >= 0 ? '+' : ''}${traitPoints(t)})`).join(' — ')
    : '—';
  add('Traits', traitText);
  add('Points restants', String(totalPoints()));

  renderStats();
  renderSkills();
  setTotalUI();
}

// =============================================================================
// SAVE / EXPORT
// =============================================================================
function buildSavePayload() {
  const s = speciesChosen();
  const p = profession();
  const skills = [...new Set([...(s?.hidden?.skills || []), ...(p?.hidden?.skills || [])])];
  
  return {
    version: 'v0.5',
    codename: $('#codename')?.value || '',
    concept: $('#concept')?.value || '',
    notes: $('#notes')?.value || '',
    camp: $('#aff')?.value || '',
    speciesId: state.speciesId,
    professionId: state.professionId,
    selectedTraits: Array.from(state.selectedTraits),
    pointsRemaining: totalPoints(),
    stats: Object.fromEntries(STATS.map(st => [st.id, Number($(`#${st.id}`)?.value || 0)])),
    resolved: {
      species: s?.name || null,
      profession: p?.name || null,
      skills,
      traits: Array.from(state.selectedTraits)
        .map(id => traitById(id))
        .filter(Boolean)
        .map(t => ({ id: t.id, name: t.name, points: traitPoints(t) }))
    }
  };
}

async function downloadFinalPNG() {
  if (state.page !== 4) {
    goTo(4);
    await new Promise(r => setTimeout(r, 220));
  }
  
  renderSummary();
  await new Promise(r => setTimeout(r, 80));

  const target = document.getElementById('finalCapture') || document.getElementById('finalPage');
  if (!target) return;

  const exportPanel = document.getElementById('exportPanel');
  if (exportPanel) exportPanel.style.display = 'none';

  if (typeof window.html2canvas !== 'function') {
    if (exportPanel) exportPanel.style.display = '';
    alert("html2canvas n'est pas chargé.");
    return;
  }

  try {
    const canvas = await window.html2canvas(target, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const payload = buildSavePayload();
    const name = (payload.codename || 'dossier')
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/gi, '_')
      .slice(0, 64);

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name || 'dossier'}_dossier.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  } finally {
    if (exportPanel) exportPanel.style.display = '';
  }
}

// =============================================================================
// GOOGLE SHEETS SUBMISSION
// =============================================================================

// ⚠️ REPLACE THIS URL with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9TztCU58gCGQg2nV6jTaC8rWf8qLmUIO7tlei6u4AmGAfffJTWETY-DjAuEO_8q6V/exec';


async function submitToGoogleSheets() {
  const btn = $('#submitBtn');
  const status = $('#submitStatus');
  
  // Validate required fields
  const playerName = $('#playerName')?.value?.trim() || '';
  const codename = $('#codename')?.value?.trim() || '';
  
  if (!playerName) {
    showSubmitStatus('error', '❌ Entre ton nom de joueur dans l\'onglet Identité');
    return;
  }
  
  if (!codename) {
    showSubmitStatus('error', '❌ Entre un nom de code pour ton personnage');
    return;
  }
  
  if (totalPoints() < 0) {
    showSubmitStatus('error', '❌ Personnage invalide : points négatifs');
    return;
  }
  
  // Disable button during submission
  btn.disabled = true;
  btn.textContent = 'Envoi...';
  showSubmitStatus('', '⏳ Transmission en cours...');
  
  try {
    const payload = buildSavePayload();
    payload.playerName = playerName;
    payload.submittedAt = new Date().toISOString();
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // With no-cors, we can't read the response, but if no error was thrown, it likely worked
    showSubmitStatus('success', '✅ Personnage envoyé au MJ !');
    btn.classList.add('success');
    btn.textContent = 'Envoyé ✓';
    AudioManager.playSelect();
    
    // Re-enable after delay
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('success');
      btn.textContent = 'Envoyer au MJ';
    }, 5000);
    
  } catch (error) {
    console.error('Submission error:', error);
    showSubmitStatus('error', '❌ Erreur de connexion. Réessaie.');
    btn.disabled = false;
    btn.textContent = 'Envoyer au MJ';
  }
}

function showSubmitStatus(type, message) {
  const status = $('#submitStatus');
  if (!status) return;
  
  status.textContent = message;
  status.className = 'hint submit-status' + (type ? ` ${type}` : '');
  status.style.display = message ? 'block' : 'none';
}

// =============================================================================
// RESET
// =============================================================================
function resetAll() {
  state.selectedTraits.clear();
  state.professionId = null;
  state.speciesId = null;
  
  $('#traitSearch').value = '';
  $('#playerName').value = '';
  $('#codename').value = '';
  $('#concept').value = '';
  $('#notes').value = '';
  $('#aff').value = '';
  
  // Reset custom dropdown
  const affSelect = document.getElementById('affSelect');
  if (affSelect) {
    const valueDisplay = affSelect.querySelector('.custom-select-value');
    const options = affSelect.querySelectorAll('.custom-select-option');
    if (valueDisplay) valueDisplay.textContent = '— Choisis —';
    options.forEach(o => o.classList.remove('selected'));
  }
  
  STATS.forEach(stat => {
    const el = $(`#${stat.id}`);
    if (el) el.value = 0;
  });
  
  renderSpecies();
  renderProfessions();
  renderTraits('');
  setTotalUI();
}

// =============================================================================
// CUSTOM DROPDOWN
// =============================================================================
function initCustomSelect(selectEl) {
  const trigger = selectEl.querySelector('.custom-select-trigger');
  const valueDisplay = selectEl.querySelector('.custom-select-value');
  const options = selectEl.querySelectorAll('.custom-select-option');
  const hiddenInput = selectEl.querySelector('input[type="hidden"]');
  
  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other dropdowns
    document.querySelectorAll('.custom-select.open').forEach(s => {
      if (s !== selectEl) s.classList.remove('open');
    });
    selectEl.classList.toggle('open');
  });
  
  // Keyboard navigation
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectEl.classList.toggle('open');
    } else if (e.key === 'Escape') {
      selectEl.classList.remove('open');
    }
  });
  
  // Option selection
  options.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.dataset.value;
      const text = option.textContent.trim();
      
      // Update display
      valueDisplay.textContent = text;
      hiddenInput.value = value;
      
      // Update selected state
      options.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      
      // Close dropdown
      selectEl.classList.remove('open');
      
      // Play select sound
      AudioManager.playSelect();
      
      // Dispatch change event for compatibility
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!selectEl.contains(e.target)) {
      selectEl.classList.remove('open');
    }
  });
}

// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
  renderTabs();
  renderSpecies();
  renderProfessions();
  renderTraits('');
  setTotalUI();

  $('#prevBtn').addEventListener('click', () => goTo(state.page - 1));
  $('#nextBtn').addEventListener('click', () => goTo(state.page + 1));
  $('#resetBtn').addEventListener('click', resetAll);
  $('#traitSearch').addEventListener('input', () => renderTraits($('#traitSearch').value));
  $('#saveBtn')?.addEventListener('click', downloadFinalPNG);
  $('#submitBtn')?.addEventListener('click', submitToGoogleSheets);
  
  // Initialize custom dropdowns
  document.querySelectorAll('.custom-select').forEach(initCustomSelect);

  goTo(0);
  
  startFlicker();
  startRefreshSweep();
  
  // Initialize audio system
  AudioManager.init();
  
  // Start music on first user interaction (browser autoplay policy)
  const startMusicOnce = () => {
    AudioManager.startMusic();
    document.removeEventListener('click', startMusicOnce);
    document.removeEventListener('keydown', startMusicOnce);
  };
  document.addEventListener('click', startMusicOnce);
  document.addEventListener('keydown', startMusicOnce);
  
  console.log('✓ App initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
