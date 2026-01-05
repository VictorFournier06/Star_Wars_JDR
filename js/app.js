/**
 * STAR WARS CHARACTER CREATOR - APPLICATION LOGIC
 * 
 * This file contains all the interactive functionality.
 * Data is loaded from data.js (must be included before this file).
 */

// =============================================================================
// STATE MANAGEMENT
// =============================================================================
const state = {
  page: 0,
  speciesId: null,
  professionId: null,
  selectedTraits: new Set(),
};

// Species descriptions loaded from JSON
let speciesDescriptions = {};

// Load species descriptions
fetch('./js/species_descriptions.json')
  .then(res => res.json())
  .then(data => { speciesDescriptions = data; })
  .catch(err => console.warn('Could not load species descriptions:', err));

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Image extensions to try (in order of preference)
const IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'gif'];
const FALLBACK_SVG = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23111%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2240%22>?</text></svg>";

/**
 * Get the image path for a species, trying multiple extensions
 */
function getSpeciesImageSrc(speciesId) {
  // Use species ID to construct base path
  return `assets/species/${speciesId}`;
}

/**
 * Create an image element that tries multiple extensions
 */
function createSpeciesImage(speciesId, altText) {
  const basePath = getSpeciesImageSrc(speciesId);
  return { basePath, fallbackSvg: FALLBACK_SVG };
}

/**
 * Try next image extension when current one fails to load
 */
function tryNextSpeciesImage(img) {
  const speciesId = img.dataset.speciesId;
  const currentSrc = img.src;
  const basePath = `assets/species/${speciesId}`;
  
  // Find current extension index
  let currentExtIndex = -1;
  for (let i = 0; i < IMAGE_EXTENSIONS.length; i++) {
    if (currentSrc.endsWith(`.${IMAGE_EXTENSIONS[i]}`)) {
      currentExtIndex = i;
      break;
    }
  }
  
  // Try next extension
  const nextIndex = currentExtIndex + 1;
  if (nextIndex < IMAGE_EXTENSIONS.length) {
    img.src = `${basePath}.${IMAGE_EXTENSIONS[nextIndex]}`;
  } else {
    // All extensions exhausted, use fallback
    img.onerror = null; // Prevent infinite loop
    img.src = FALLBACK_SVG;
  }
}

function speciesChosen() {
  return SPECIES.find(s => s.id === state.speciesId) || null;
}

function profession() {
  return PROFESSIONS.find(p => p.id === state.professionId) || null;
}

function traitById(id) {
  return TRAITS.find(t => t.id === id);
}

/**
 * Convert trait value to points display
 * Advantages (value > 0) cost points (show negative)
 * Drawbacks (value < 0) grant points (show positive)
 */
function traitPoints(t) {
  return -(t?.value ?? 0);
}

/**
 * Get set of trait IDs that are disabled due to incompatibilities
 */
function disabledTraitsSet(selectedIds) {
  const disabled = new Set();
  selectedIds.forEach(id => {
    const t = traitById(id);
    (t?.incompatible || []).forEach(x => disabled.add(x));
  });
  return disabled;
}

/**
 * Parse species ability modifiers from string like "+2 FOR, -2 DEX"
 * Returns object like { FOR: 2, DEX: -2 }
 */
function parseAbilityMods(modString) {
  const mods = { FOR: 0, DEX: 0, CON: 0, INT: 0, SAG: 0, CHA: 0 };
  if (!modString || modString === 'Aucun' || modString === 'Variable selon modèle') {
    return mods;
  }
  
  // Match patterns like "+2 FOR" or "-2 DEX"
  const regex = /([+-]?\d+)\s*(FOR|DEX|CON|INT|SAG|CHA)/gi;
  let match;
  while ((match = regex.exec(modString)) !== null) {
    const value = parseInt(match[1], 10);
    const stat = match[2].toUpperCase();
    if (mods.hasOwnProperty(stat)) {
      mods[stat] = value;
    }
  }
  return mods;
}

/**
 * Get computed stats (base 10 + species + profession + traits modifiers)
 */
function getComputedStats() {
  const base = 10;
  const s = speciesChosen();
  const p = profession();
  
  // Initialize mods object
  const mods = { FOR: 0, DEX: 0, CON: 0, INT: 0, SAG: 0, CHA: 0 };
  
  // Add species modifiers
  if (s?.hidden?.abilityMods) {
    const speciesMods = parseAbilityMods(s.hidden.abilityMods);
    Object.keys(speciesMods).forEach(stat => {
      mods[stat] += speciesMods[stat];
    });
  }
  
  // Add profession modifiers (if any)
  if (p?.hidden?.abilityMods) {
    const profMods = parseAbilityMods(p.hidden.abilityMods);
    Object.keys(profMods).forEach(stat => {
      mods[stat] += profMods[stat];
    });
  }
  
  // Add trait modifiers
  state.selectedTraits.forEach(traitId => {
    const trait = traitById(traitId);
    if (trait?.hidden?.abilityMods) {
      const traitMods = parseAbilityMods(trait.hidden.abilityMods);
      Object.keys(traitMods).forEach(stat => {
        mods[stat] += traitMods[stat];
      });
    }
  });
  
  return STATS.map(stat => ({
    ...stat,
    base: base,
    mod: mods[stat.id] || 0,
    total: base + (mods[stat.id] || 0)
  }));
}

/**
 * Calculate total points remaining
 * Players start with BASE_POINTS and spend/gain based on choices
 */
const BASE_POINTS = 20; // Starting points for character creation

function totalPoints() {
  let sum = BASE_POINTS;
  
  const s = speciesChosen();
  const p = profession();
  
  if (s) sum += (s.points || 0);
  if (p) sum += (p.points || 0);
  
  state.selectedTraits.forEach(id => {
    sum += traitPoints(traitById(id));
  });
  
  return sum;
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================
function setTotalUI() {
  const t = totalPoints();
  
  // Update header meter
  const el = $('#totalVal');
  if (el) {
    el.textContent = t;
    el.classList.toggle('ok', t >= 0);
    el.classList.toggle('bad', t < 0);
  }

  // Update summary chip
  const chip = $('#totalChip');
  if (chip) {
    chip.textContent = `POINTS ${t}`;
    chip.className = 'chip ' + (t >= 0 ? '' : 'amber');
  }

  // Update status chip
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
  
  // Update page visibility
  $$('.page').forEach(p => {
    p.classList.toggle('active', Number(p.dataset.page) === state.page);
  });
  
  // Update tab states
  $$('.tab').forEach((b, idx) => {
    b.classList.toggle('active', idx === state.page);
  });
  
  // Update navigation buttons
  $('#prevBtn').disabled = state.page === 0;
  $('#nextBtn').disabled = state.page === PAGE_NAMES.length - 1;

  // Render summary if on final page
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
    b.addEventListener('click', () => goTo(idx));
    tabs.appendChild(b);
  });
}

function renderSpecies(forceRebuild = false) {
  const host = $('#speciesList');
  
  // If already rendered and not forcing rebuild, just update classes
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

    // Image handling - try multiple extensions
    const imgHelper = createSpeciesImage(s.id, s.name);
    const fallbackSvg = imgHelper.fallbackSvg;

    card.innerHTML = `
      <div class="species-img-wrap">
        <img class="species-img" data-species-id="${s.id}" alt="${s.name}" src="${imgHelper.basePath}.png" onerror="tryNextSpeciesImage(this)">
        <button class="info-btn" data-species-id="${s.id}" title="Voir la description" aria-label="Voir la description de ${s.name}">
          <span class="info-dot"></span>
        </button>
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

    // Info button handler - show tooltip
    const infoBtn = card.querySelector('.info-btn');
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSpeciesTooltip(s.id, infoBtn);
    });

    const selectIt = () => {
      state.speciesId = s.id;
      updateSpeciesSelection();
      setTotalUI();
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
  
  // If already rendered and not forcing rebuild, just update classes
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
        incompat = `<div style="margin-top:10px"><span class="chip amber wrap">Incompatible avec : ${names}</span></div>`;
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
        if (state.selectedTraits.has(t.id)) {
          state.selectedTraits.delete(t.id);
        } else {
          state.selectedTraits.add(t.id);
        }
        renderTraits($('#traitSearch').value);
        setTotalUI();
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

function renderSkills() {
  const ul = $('#skillsList');
  if (!ul) return;
  ul.innerHTML = '';

  const s = speciesChosen();
  const p = profession();
  const skills = [...(s?.hidden?.skills || []), ...(p?.hidden?.skills || [])];
  const uniq = [...new Set(skills)];
  
  if (!uniq.length) {
    const li = document.createElement('li');
    li.textContent = '—';
    ul.appendChild(li);
    return;
  }

  uniq.forEach(sk => {
    const li = document.createElement('li');
    li.textContent = sk;
    ul.appendChild(li);
  });
}

function renderStats() {
  const grid = $('#statsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const stats = getComputedStats();
  
  stats.forEach(stat => {
    const field = document.createElement('div');
    field.className = 'field';
    
    const modSign = stat.mod >= 0 ? '+' : '';
    const modDisplay = stat.mod !== 0 ? ` <span class="stat-mod ${stat.mod > 0 ? 'pos' : 'neg'}">(${modSign}${stat.mod})</span>` : '';
    
    field.innerHTML = `
      <label>${stat.abbr}${modDisplay}</label>
      <input type="number" id="${stat.id}" value="${stat.total}" readonly class="readonly-stat" />
    `;
    
    grid.appendChild(field);
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
    .sort((a, b) => (traitPoints(b) - traitPoints(a)));

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
  return {
    version: 'v0.4',
    codename: $('#codename')?.value || '',
    concept: $('#concept')?.value || '',
    notes: $('#notes')?.value || '',
    camp: $('#aff')?.value || '',
    speciesId: state.speciesId,
    professionId: state.professionId,
    selectedTraits: Array.from(state.selectedTraits),
    pointsRemaining: totalPoints(),
    stats: {
      FOR: Number($('#FOR')?.value || 0),
      DEX: Number($('#DEX')?.value || 0),
      CON: Number($('#CON')?.value || 0),
      INT: Number($('#INT')?.value || 0),
      SAG: Number($('#SAG')?.value || 0),
      CHA: Number($('#CHA')?.value || 0),
    },
    resolved: {
      species: speciesChosen()?.name || null,
      profession: profession()?.name || null,
      skills: (() => {
        const s = speciesChosen();
        const p = profession();
        const skills = [...(s?.hidden?.skills || []), ...(p?.hidden?.skills || [])];
        return [...new Set(skills)];
      })(),
      traits: Array.from(state.selectedTraits).map(id => {
        const t = traitById(id);
        if (!t) return null;
        return { id: t.id, name: t.name, points: traitPoints(t) };
      }).filter(Boolean)
    }
  };
}

async function downloadFinalPNG() {
  // Ensure we're on the final page so the content is visible
  if (state.page !== 4) {
    goTo(4);
    await new Promise(r => setTimeout(r, 220));
  }
  
  renderSummary();
  await new Promise(r => setTimeout(r, 80));

  const target = document.getElementById('finalCapture') || document.getElementById('finalPage');
  if (!target) return;

  // Hide export section during capture
  const exportPanel = document.getElementById('exportPanel');
  if (exportPanel) exportPanel.style.display = 'none';

  if (typeof window.html2canvas !== 'function') {
    if (exportPanel) exportPanel.style.display = '';
    alert("html2canvas n'est pas chargé. Vérifie que le CDN est bien inclus.");
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

    canvas.toBlob((blob) => {
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
    // Restore export section
    if (exportPanel) exportPanel.style.display = '';
  }
}

// =============================================================================
// VISUAL EFFECTS
// =============================================================================
function startFlicker() {
  const el = $('#flicker');
  if (!el) return;
  
  const tick = () => {
    const on = Math.random() < 0.18;
    el.classList.toggle('on', on);
    const delay = 120 + Math.random() * 650;
    setTimeout(tick, delay);
  };
  tick();
}

function startRefreshSweep() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  const el = $('#refresh');
  if (!el) return;
  
  const fire = () => {
    el.classList.remove('on');
    void el.offsetWidth; // Force reflow
    el.classList.add('on');
  };
  
  const tick = () => {
    if (Math.random() < 0.40) fire();
    const delay = 1800 + Math.random() * 5200;
    setTimeout(tick, delay);
  };
  
  el.addEventListener('animationend', () => el.classList.remove('on'));
  tick();
}

// =============================================================================
// SPECIES TOOLTIP SYSTEM
// =============================================================================
let activeTooltip = null;

function showSpeciesTooltip(speciesId, anchorEl) {
  // Remove existing tooltip
  hideSpeciesTooltip();
  
  const species = SPECIES.find(s => s.id === speciesId);
  if (!species) return;
  
  const description = speciesDescriptions[speciesId] || 'Description non disponible.';
  
  // Create tooltip container
  const tooltip = document.createElement('div');
  tooltip.className = 'species-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-connector">
      <div class="connector-dot"></div>
      <div class="connector-line"></div>
    </div>
    <div class="tooltip-panel">
      <div class="tooltip-header">
        <span class="tooltip-title">${species.name}</span>
        <button class="tooltip-close" aria-label="Fermer">×</button>
      </div>
      <div class="tooltip-body">
        <p class="tooltip-desc">${description}</p>
        ${species.hidden?.abilityMods && species.hidden.abilityMods !== 'Aucun' ? `
        <div class="tooltip-mods">
          <span class="tooltip-mod-label">Modificateurs:</span>
          <span class="tooltip-mod-value">${species.hidden.abilityMods}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(tooltip);
  activeTooltip = tooltip;
  
  // Position tooltip
  positionTooltip(tooltip, anchorEl);
  
  // Animate in
  requestAnimationFrame(() => {
    tooltip.classList.add('visible');
  });
  
  // Close button handler
  tooltip.querySelector('.tooltip-close').addEventListener('click', (e) => {
    e.stopPropagation();
    hideSpeciesTooltip();
  });
  
  // Click outside to close
  setTimeout(() => {
    document.addEventListener('click', handleTooltipOutsideClick);
  }, 10);
}

function positionTooltip(tooltip, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const tooltipPanel = tooltip.querySelector('.tooltip-panel');
  
  // Position the tooltip to the right of the info button
  tooltip.style.position = 'fixed';
  tooltip.style.left = `${rect.right + 10}px`;
  tooltip.style.top = `${rect.top + rect.height / 2}px`;
  
  // Adjust if off-screen
  requestAnimationFrame(() => {
    const tooltipRect = tooltipPanel.getBoundingClientRect();
    
    // If tooltip goes off right edge, position to the left instead
    if (tooltipRect.right > window.innerWidth - 20) {
      tooltip.classList.add('left-side');
      tooltip.style.left = `${rect.left - 10}px`;
    }
    
    // If tooltip goes off bottom, adjust vertically
    if (tooltipRect.bottom > window.innerHeight - 20) {
      const overflow = tooltipRect.bottom - window.innerHeight + 20;
      tooltip.style.top = `${rect.top + rect.height / 2 - overflow}px`;
    }
    
    // If tooltip goes off top
    if (tooltipRect.top < 20) {
      tooltip.style.top = `${rect.top + rect.height / 2 + (20 - tooltipRect.top)}px`;
    }
  });
}

function hideSpeciesTooltip() {
  if (activeTooltip) {
    activeTooltip.classList.remove('visible');
    activeTooltip.classList.add('hiding');
    setTimeout(() => {
      if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
      }
    }, 200);
    document.removeEventListener('click', handleTooltipOutsideClick);
  }
}

function handleTooltipOutsideClick(e) {
  if (activeTooltip && !activeTooltip.contains(e.target) && !e.target.closest('.info-btn')) {
    hideSpeciesTooltip();
  }
}

// =============================================================================
// RESET FUNCTION
// =============================================================================
function resetAll() {
  state.selectedTraits.clear();
  state.professionId = null;
  state.speciesId = null;
  
  $('#traitSearch').value = '';
  $('#codename').value = '';
  $('#concept').value = '';
  $('#notes').value = '';
  $('#aff').value = '';
  
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
// TESTS
// =============================================================================
function runTests() {
  const assert = (cond, msg) => {
    if (!cond) throw new Error('TEST FAILED: ' + msg);
  };

  // Reset state for testing
  state.selectedTraits.clear();
  state.professionId = null;
  state.speciesId = null;

  assert(totalPoints() === 0, 'totalPoints should start at 0 with nothing selected');

  state.speciesId = 'droid';
  assert(totalPoints() === 4, 'species points should add to totalPoints');

  assert(PAGE_NAMES.length === 5 && PAGE_NAMES[4] === 'Dossier final', 'pageNames should end with Dossier final');

  state.professionId = 'intel';
  assert(totalPoints() === -2, 'profession points should add to totalPoints');

  state.selectedTraits.add('analytique');
  assert(totalPoints() === -5, 'traits should invert points and be included');

  state.selectedTraits.clear();
  state.selectedTraits.add('analytique');
  const d = disabledTraitsSet(state.selectedTraits);
  assert(d.has('impulsif'), 'analytique should disable impulsif');

  const payload = buildSavePayload();
  assert(payload && typeof payload === 'object', 'save payload should be an object');
  assert(Array.isArray(payload.selectedTraits), 'save payload selectedTraits should be an array');

  // Reset state after testing
  state.selectedTraits.clear();
  state.professionId = null;
  state.speciesId = null;
  
  console.log('✓ All tests passed');
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

  // Navigation buttons
  $('#prevBtn').addEventListener('click', () => goTo(state.page - 1));
  $('#nextBtn').addEventListener('click', () => goTo(state.page + 1));
  $('#resetBtn').addEventListener('click', resetAll);

  // Search filter
  $('#traitSearch').addEventListener('input', () => {
    renderTraits($('#traitSearch').value);
  });

  // Save button
  $('#saveBtn')?.addEventListener('click', downloadFinalPNG);

  // Initial page
  goTo(0);
  
  // Visual effects
  startFlicker();
  startRefreshSweep();
  
  // Run tests in development
  runTests();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
