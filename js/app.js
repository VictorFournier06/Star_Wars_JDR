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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
 * Calculate total points remaining
 */
function totalPoints() {
  let sum = 0;
  
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

function renderSpecies() {
  const host = $('#speciesList');
  host.innerHTML = '';

  SPECIES.forEach(s => {
    const row = document.createElement('div');
    row.className = 'choice' + (state.speciesId === s.id ? ' active' : '');
    row.setAttribute('role', 'button');
    row.tabIndex = 0;

    const chosen = state.speciesId === s.id;
    const pts = s.points || 0;
    const sign = pts >= 0 ? '+' : '';

    row.innerHTML = `
      <div class="left">
        <strong>${s.name}</strong>
        <p>${s.blurb}</p>
        <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap">
          ${(s.tags || []).slice(0, 3).map(t => `<span class="chip">${t}</span>`).join('')}
          ${chosen ? `<span class="chip pos">Sélectionnée</span>` : ''}
        </div>
      </div>
      <div class="right">
        <span class="chip ${pts >= 0 ? 'pos' : 'neg'}">${sign}${pts}</span>
      </div>
    `;

    const selectIt = () => {
      state.speciesId = s.id;
      renderSpecies();
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

function renderProfessions() {
  const host = $('#profList');
  host.innerHTML = '';

  PROFESSIONS.forEach(p => {
    const row = document.createElement('div');
    row.className = 'choice' + (state.professionId === p.id ? ' active' : '');
    row.setAttribute('role', 'button');
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
          ${chosen ? `<span class="chip pos">Sélectionnée</span>` : ''}
        </div>
      </div>
      <div class="right">
        <span class="chip ${pts >= 0 ? 'pos' : 'neg'}">${sign}${pts}</span>
      </div>
    `;

    const selectIt = () => {
      state.professionId = p.id;
      renderProfessions();
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

  if (typeof window.html2canvas !== 'function') {
    alert("html2canvas n'est pas chargé. Vérifie que le CDN est bien inclus.");
    return;
  }

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
