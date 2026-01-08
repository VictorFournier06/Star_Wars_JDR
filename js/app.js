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
  // Origine
  origineId: null,
  // Morale
  doctrineId: null,
  methodeId: null,
  lignesRouges: new Set(),
  // Allégences (Draft)
  draftPacks: [],
  draftPicks: [], // Array of picked cards (one per pack slot, null if not picked)
  draftRerolls: DRAFT_CONFIG?.REROLLS || 2,
  factionValues: {}, // Computed faction reputation values
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

  if (state.page === 7) renderSummary();
  
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

// =============================================================================
// ORIGINE (GALAXY MAP) RENDER FUNCTIONS
// =============================================================================
function planetById(id) {
  return PLANETES.find(p => p.id === id);
}

// Galaxy rotation animation state
let galaxyAnimationId = null;
let galaxyStartTime = null;
const GALAXY_ROTATION_DURATION = 480000; // 480s in ms

/**
 * Calculate rotated position around center (50%, 50%)
 * @param {number} x - Original x position (0-100)
 * @param {number} y - Original y position (0-100)
 * @param {number} angle - Rotation angle in radians
 * @returns {{x: number, y: number}} - Rotated position
 */
function rotatePoint(x, y, angle) {
  const centerX = 50;
  const centerY = 50;
  const dx = x - centerX;
  const dy = y - centerY;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos
  };
}

/**
 * Update all planet and line positions based on current rotation angle
 */
function updateGalaxyPositions() {
  const nodesContainer = $('#galaxyNodes');
  const linesContainer = document.querySelector('.galaxy-lines');
  if (!nodesContainer || !linesContainer) return;
  
  // Calculate current rotation angle
  const elapsed = performance.now() - galaxyStartTime;
  const angle = (elapsed / GALAXY_ROTATION_DURATION) * 2 * Math.PI;
  
  // Update planet node positions (round to 2 decimal places to reduce sub-pixel flickering)
  const nodes = nodesContainer.querySelectorAll('.planet-node');
  nodes.forEach(node => {
    const planetId = node.dataset.id;
    const planet = planetById(planetId);
    if (!planet) return;
    
    const rotated = rotatePoint(planet.x, planet.y, angle);
    node.style.left = Math.round(rotated.x * 100) / 100 + '%';
    node.style.top = Math.round(rotated.y * 10) / 10 + '%';
  });
  
  // Update hyperspace line positions (also rounded)
  const lines = linesContainer.querySelectorAll('line');
  let lineIndex = 0;
  const drawnLines = new Set();
  
  PLANETES.forEach(planet => {
    (planet.connections || []).forEach(targetId => {
      const target = planetById(targetId);
      if (!target) return;
      
      const lineKey = [planet.id, targetId].sort().join('-');
      if (drawnLines.has(lineKey)) return;
      drawnLines.add(lineKey);
      
      const line = lines[lineIndex];
      if (line) {
        const p1 = rotatePoint(planet.x, planet.y, angle);
        const p2 = rotatePoint(target.x, target.y, angle);
        // Round to 2 decimal places
        line.setAttribute('x1', Math.round(p1.x * 100) / 100 + '%');
        line.setAttribute('y1', Math.round(p1.y * 100) / 100 + '%');
        line.setAttribute('x2', Math.round(p2.x * 100) / 100 + '%');
        line.setAttribute('y2', Math.round(p2.y * 100) / 100 + '%');
      }
      lineIndex++;
    });
  });
  
  // Continue animation
  galaxyAnimationId = requestAnimationFrame(updateGalaxyPositions);
}

/**
 * Start galaxy rotation animation
 */
function startGalaxyAnimation() {
  if (galaxyAnimationId) {
    cancelAnimationFrame(galaxyAnimationId);
  }
  if (galaxyStartTime === null) {
    galaxyStartTime = performance.now();
  }
  galaxyAnimationId = requestAnimationFrame(updateGalaxyPositions);
}

/**
 * Stop galaxy rotation animation
 */
function stopGalaxyAnimation() {
  if (galaxyAnimationId) {
    cancelAnimationFrame(galaxyAnimationId);
    galaxyAnimationId = null;
  }
}

function renderOrigine() {
  const nodesContainer = $('#galaxyNodes');
  const linesContainer = document.querySelector('.galaxy-lines');
  if (!nodesContainer || !linesContainer) return;
  
  // Stop existing animation during re-render
  stopGalaxyAnimation();
  
  nodesContainer.innerHTML = '';
  linesContainer.innerHTML = '';
  
  // Draw hyperspace lines first (will be updated by animation)
  const drawnLines = new Set();
  PLANETES.forEach(planet => {
    (planet.connections || []).forEach(targetId => {
      const target = planetById(targetId);
      if (!target) return;
      
      // Avoid drawing duplicate lines
      const lineKey = [planet.id, targetId].sort().join('-');
      if (drawnLines.has(lineKey)) return;
      drawnLines.add(lineKey);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', planet.x + '%');
      line.setAttribute('y1', planet.y + '%');
      line.setAttribute('x2', target.x + '%');
      line.setAttribute('y2', target.y + '%');
      linesContainer.appendChild(line);
    });
  });
  
  // Create planet nodes
  PLANETES.forEach(planet => {
    const node = document.createElement('div');
    const isStation = planet.id.includes('station') || planet.id.includes('spacedock');
    const isSelected = state.origineId === planet.id;
    
    node.className = 'planet-node' + (isStation ? ' station' : '') + (isSelected ? ' selected' : '');
    node.style.left = planet.x + '%';
    node.style.top = planet.y + '%';
    node.dataset.id = planet.id;
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', planet.name);
    
    node.innerHTML = `
      <div class="planet-dot"></div>
      <span class="planet-label">${planet.name}</span>
    `;
    
    // Click to select
    const selectPlanet = () => {
      state.origineId = planet.id;
      renderOrigine();
      setTotalUI();
      AudioManager.playSelect();
    };
    
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPlanet();
    });
    
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectPlanet();
      }
    });
    
    // Hover tooltip - use pointerenter/leave for better tracking with moving elements
    node.addEventListener('pointerenter', (e) => {
      // Only respond to mouse pointer
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        showPlanetTooltip(planet.id, node);
      }
    });
    
    node.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        hidePlanetTooltip();
      }
    });
    
    nodesContainer.appendChild(node);
  });
  
  // Start position animation
  startGalaxyAnimation();
}

// =============================================================================
// MORALE RENDER FUNCTIONS
// =============================================================================
function renderDoctrines() {
  const host = $('#doctrineList');
  if (!host) return;
  host.innerHTML = '';

  DOCTRINES.forEach(d => {
    const option = document.createElement('div');
    const isSelected = state.doctrineId === d.id;
    option.className = 'morale-option' + (isSelected ? ' active' : '');
    option.setAttribute('role', 'button');
    option.setAttribute('data-id', d.id);
    option.tabIndex = 0;

    option.innerHTML = `
      <span class="morale-name">${d.name}</span>
      <span class="morale-desc">${d.desc}</span>
    `;

    const selectIt = () => {
      state.doctrineId = d.id;
      updateDoctrineSelection();
      AudioManager.playSelect();
    };

    option.addEventListener('click', selectIt);
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectIt();
      }
    });

    host.appendChild(option);
  });
}

function updateDoctrineSelection() {
  $$('#doctrineList .morale-option').forEach(opt => {
    const isSelected = opt.dataset.id === state.doctrineId;
    opt.classList.toggle('active', isSelected);
  });
}

function renderMethodes() {
  const host = $('#methodesList');
  if (!host) return;
  host.innerHTML = '';

  METHODES.forEach(m => {
    const option = document.createElement('div');
    const isSelected = state.methodeId === m.id;
    option.className = 'morale-option methode' + (isSelected ? ' active' : '');
    option.setAttribute('role', 'button');
    option.setAttribute('data-id', m.id);
    option.tabIndex = 0;

    option.innerHTML = `
      <span class="methode-icon">${m.icon}</span>
      <span class="morale-name">${m.name}</span>
      <span class="morale-desc">${m.desc}</span>
    `;

    const selectIt = () => {
      state.methodeId = m.id;
      updateMethodeSelection();
      AudioManager.playSelect();
    };

    option.addEventListener('click', selectIt);
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectIt();
      }
    });

    host.appendChild(option);
  });
}

function updateMethodeSelection() {
  $$('#methodesList .morale-option').forEach(opt => {
    const isSelected = opt.dataset.id === state.methodeId;
    opt.classList.toggle('active', isSelected);
  });
}

function renderLignesRouges() {
  const host = $('#lignesList');
  if (!host) return;
  host.innerHTML = '';

  LIGNES_ROUGES.forEach(l => {
    const option = document.createElement('div');
    const isSelected = state.lignesRouges.has(l.id);
    option.className = 'morale-option ligne' + (isSelected ? ' active' : '');
    option.setAttribute('role', 'button');
    option.setAttribute('data-id', l.id);
    option.tabIndex = 0;

    option.innerHTML = `
      <span class="ligne-check">${isSelected ? '✕' : '○'}</span>
      <span class="morale-name">${l.name}</span>
    `;

    const toggleIt = () => {
      if (state.lignesRouges.has(l.id)) {
        state.lignesRouges.delete(l.id);
      } else {
        state.lignesRouges.add(l.id);
      }
      renderLignesRouges();
      AudioManager.playSelect();
    };

    option.addEventListener('click', toggleIt);
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleIt();
      }
    });

    host.appendChild(option);
  });
}

// =============================================================================
// ALLÉGENCES / DRAFT SYSTEM
// =============================================================================

function initDraft() {
  const config = DRAFT_CONFIG || { PACKS: 3, PACK_SIZE: 5, REROLLS: 2, MAX_FACTION_VALUE: 50 };
  
  // Initialize picks as empty array if not already
  if (!Array.isArray(state.draftPicks)) {
    state.draftPicks = [];
  }
  
  // Initialize faction values
  if (Object.keys(state.factionValues).length === 0) {
    FACTIONS.forEach(f => {
      state.factionValues[f.id] = 0;
    });
  }
}

function generateAllPacks(numPacks, packSize) {
  const allCards = [...DRAFT_CARDS];
  const usedIds = new Set();
  const packs = [];
  
  for (let p = 0; p < numPacks; p++) {
    const pack = sampleCards(allCards, packSize, usedIds);
    pack.forEach(card => usedIds.add(card.id));
    packs.push(pack);
  }
  
  return packs;
}

function sampleCards(pool, count, excludeIds) {
  const available = pool.filter(c => !excludeIds.has(c.id));
  const result = [];
  const used = new Set();
  
  const max = Math.min(count, available.length);
  while (result.length < max) {
    const idx = Math.floor(Math.random() * available.length);
    const card = available[idx];
    if (!used.has(card.id)) {
      used.add(card.id);
      result.push(card);
    }
  }
  
  return result;
}

function getActivePackIndex() {
  for (let i = 0; i < state.draftPicks.length; i++) {
    if (!state.draftPicks[i]) return i;
  }
  return -1; // All packs picked
}

function computeFactionValues() {
  const config = DRAFT_CONFIG || { MAX_FACTION_VALUE: 50 };
  const values = {};
  
  FACTIONS.forEach(f => {
    values[f.id] = 0;
  });
  
  state.draftPicks.forEach(card => {
    if (!card) return;
    Object.entries(card.effects || {}).forEach(([factionId, amount]) => {
      if (values.hasOwnProperty(factionId)) {
        values[factionId] = Math.max(-config.MAX_FACTION_VALUE, 
          Math.min(config.MAX_FACTION_VALUE, values[factionId] + amount));
      }
    });
  });
  
  state.factionValues = values;
  return values;
}

function renderDraft() {
  initDraft();
  
  const packContainer = $('#draftPack');
  const handContainer = $('#draftHand');
  const factionsGrid = $('#factionsGrid');
  
  if (!packContainer || !handContainer || !factionsGrid) return;
  
  // Get picked card IDs for marking as picked
  const pickedIds = new Set();
  state.draftPicks.forEach(pick => {
    if (pick) pickedIds.add(pick.id);
  });
  
  // Render ALL cards (not just current pack)
  packContainer.innerHTML = '';
  
  DRAFT_CARDS.forEach(card => {
    const isPicked = pickedIds.has(card.id);
    const cardEl = createDraftCardElement(card, false, isPicked ? null : () => pickCard(card));
    if (isPicked) {
      cardEl.classList.add('picked');
    }
    packContainer.appendChild(cardEl);
  });
  
  // Render hand - click anywhere on card to remove
  handContainer.innerHTML = '';
  state.draftPicks.forEach((picked, i) => {
    if (picked) {
      const wrapper = document.createElement('div');
      wrapper.className = 'hand-card';
      
      const cardEl = createDraftCardElement(picked, true, () => removePickAt(i));
      wrapper.appendChild(cardEl);
      
      handContainer.appendChild(wrapper);
    }
  });
  
  // Render factions
  renderFactions();
}

function createDraftCardElement(card, isMini = false, onClick = null) {
  const el = document.createElement('div');
  el.className = 'draft-card' + (isMini ? ' mini' : '');
  
  const hue = hashStringToHue(card.id);
  
  // Use card image if available, otherwise use procedural gradient
  let artStyle;
  let extraClass = '';
  const darkImages = ['Burnt.webp', 'hideout.webp', 'psychic.webp'];
  if (card.image) {
    const brightnessFilter = darkImages.includes(card.image) ? 'brightness(0.9)' : 'brightness(0.6)';
    artStyle = `
      background-image: 
        linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%),
        url('assets/cards/${card.image}');
      background-size: cover;
      background-position: top center;
      filter: ${brightnessFilter} saturate(0.8);
    `;
  } else {
    artStyle = `
      background-image: 
        radial-gradient(800px 300px at 20% 15%, hsla(${hue}, 70%, 55%, 0.35), transparent 60%),
        radial-gradient(600px 300px at 80% 30%, hsla(${(hue + 30) % 360}, 80%, 50%, 0.25), transparent 55%),
        radial-gradient(600px 300px at 60% 90%, hsla(${(hue + 180) % 360}, 70%, 55%, 0.20), transparent 60%),
        linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55));
    `;
  }
  
  el.innerHTML = `
    <div class="draft-card-art">
      <div class="draft-card-art-bg" style="${artStyle}"></div>
      <div class="draft-card-art-overlay"></div>
      <div class="draft-card-corners">
        <div class="draft-card-corner tl"></div>
        <div class="draft-card-corner tr"></div>
        <div class="draft-card-corner bl"></div>
        <div class="draft-card-corner br"></div>
      </div>
      <div class="draft-card-rarity">${card.rarity || 'Commune'}</div>
    </div>
    <div class="draft-card-body">
      <div class="draft-card-header">
        <h4 class="draft-card-title">${card.title}</h4>
      </div>
      <p class="draft-card-text">${card.text}</p>
      <div class="draft-card-tags">
        ${(card.tags || []).map(t => `<span class="draft-card-tag">${t}</span>`).join('')}
      </div>
      ${!isMini ? `
        <div class="draft-card-effects">
          ${Object.entries(card.effects || {}).map(([fId, val]) => {
            const faction = FACTIONS.find(f => f.id === fId);
            const fName = faction ? faction.name : fId;
            const sign = val >= 0 ? '+' : '';
            const cls = val >= 0 ? 'positive' : 'negative';
            return `
              <div class="draft-card-effect">
                <span class="draft-card-effect-faction">${fName}</span>
                <span class="draft-card-effect-value ${cls}">${sign}${val}</span>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
    <div class="draft-card-sheen"></div>
  `;
  
  if (onClick) {
    el.addEventListener('click', onClick);
  }
  
  return el;
}

function hashStringToHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function pickCard(card) {
  // Add card to picks array
  state.draftPicks.push(card);
  computeFactionValues();
  renderDraft();
  AudioManager.playSelect();
}

function removePickAt(index) {
  // Remove card at index
  state.draftPicks.splice(index, 1);
  computeFactionValues();
  renderDraft();
  AudioManager.playSelect();
}

function rerollCurrentPack() {
  if (state.draftRerolls <= 0) return;
  
  const activeIdx = getActivePackIndex();
  if (activeIdx < 0) return;
  
  const config = DRAFT_CONFIG || { PACK_SIZE: 5 };
  
  // Get all used card IDs (from other packs and picks)
  const usedIds = new Set();
  state.draftPacks.forEach((pack, idx) => {
    if (idx !== activeIdx) {
      pack.forEach(c => usedIds.add(c.id));
    }
  });
  state.draftPicks.forEach(pick => {
    if (pick) usedIds.add(pick.id);
  });
  
  // Generate new pack
  const newPack = sampleCards(DRAFT_CARDS, config.PACK_SIZE, usedIds);
  state.draftPacks[activeIdx] = newPack;
  state.draftRerolls--;
  
  renderDraft();
  AudioManager.playSelect();
}

function restartDraft() {
  // Clear picks - all cards become available again
  state.draftPicks = [];
  
  FACTIONS.forEach(f => {
    state.factionValues[f.id] = 0;
  });
  
  renderDraft();
  AudioManager.playSelect();
}

function renderFactions() {
  const grid = $('#factionsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const config = DRAFT_CONFIG || { MAX_FACTION_VALUE: 100 };
  const maxVal = config.MAX_FACTION_VALUE;
  
  // Render factions organized by sections
  FACTION_SECTIONS.forEach(section => {
    // Section header
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'faction-section';
    
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'faction-section-title';
    sectionTitle.textContent = section.name;
    sectionDiv.appendChild(sectionTitle);
    
    const sectionGrid = document.createElement('div');
    sectionGrid.className = 'faction-section-grid';
    
    section.factions.forEach(faction => {
      const value = state.factionValues[faction.id] || 0;
      const absVal = Math.abs(value);
      const percent = Math.min(absVal / maxVal, 1);
      
      // Calculate SVG circle parameters
      const radius = 35;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - percent);
      
      let gaugeClass = 'neutral';
      if (value > 0) gaugeClass = 'positive';
      else if (value < 0) gaugeClass = 'negative';
      
      let valueClass = 'neutral';
      if (value > 0) valueClass = 'positive';
      else if (value < 0) valueClass = 'negative';
      
      const sign = value >= 0 ? '+' : '';
      
      const hex = document.createElement('div');
      hex.className = 'faction-hex';
      hex.dataset.factionId = faction.id;
      
      // For negative values, flip the SVG to make gauge go left
      const svgClass = value < 0 ? 'faction-hex-svg negative-direction' : 'faction-hex-svg';
      
      hex.innerHTML = `
        <svg class="${svgClass}" viewBox="0 0 100 100">
          <circle class="faction-hex-bg" cx="50" cy="50" r="${radius}" />
          <circle class="faction-hex-gauge ${gaugeClass}" cx="50" cy="50" r="${radius}" 
                  stroke-dasharray="${circumference}" 
                  stroke-dashoffset="${offset}" />
        </svg>
        <div class="faction-hex-inner">
          <img class="faction-hex-img" src="assets/factions/${faction.image}" alt="${faction.name}" 
               onerror="this.style.display='none'">
        </div>
        <span class="faction-hex-value ${valueClass}">${sign}${value}</span>
      `;
      
      // Tooltip on hover
      hex.addEventListener('mouseenter', () => showFactionTooltip(faction, hex));
      hex.addEventListener('mouseleave', hideFactionTooltip);
      
      sectionGrid.appendChild(hex);
    });
    
    sectionDiv.appendChild(sectionGrid);
    grid.appendChild(sectionDiv);
  });
}

// Faction tooltip
let factionTooltipEl = null;

function showFactionTooltip(faction, anchor) {
  if (!factionTooltipEl) {
    factionTooltipEl = document.createElement('div');
    factionTooltipEl.className = 'faction-tooltip';
    document.body.appendChild(factionTooltipEl);
  }
  
  const imgHtml = faction.image 
    ? `<div class="faction-tooltip-img-wrapper">
         <img class="faction-tooltip-img faction-img-${faction.id}" src="assets/factions/${faction.image}" alt="${faction.name}" onerror="this.parentElement.style.display='none'">
       </div>`
    : '';
  
  factionTooltipEl.innerHTML = `
    <div class="faction-tooltip-panel">
      ${imgHtml}
      <h4 class="faction-tooltip-name">${faction.name}</h4>
      <p class="faction-tooltip-desc">${faction.desc}</p>
    </div>
  `;
  
  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const isBottomHalf = rect.top > viewportHeight / 2;
  
  // Position tooltip - make visible briefly to measure height
  factionTooltipEl.style.visibility = 'hidden';
  factionTooltipEl.classList.add('visible');
  const tooltipHeight = factionTooltipEl.offsetHeight;
  factionTooltipEl.style.visibility = '';
  
  factionTooltipEl.style.left = `${rect.left - 80}px`;
  
  if (isBottomHalf) {
    // Show above the element
    factionTooltipEl.style.top = `${rect.top - tooltipHeight - 10}px`;
  } else {
    // Show below the element
    factionTooltipEl.style.top = `${rect.bottom + 10}px`;
  }
}

function hideFactionTooltip() {
  if (factionTooltipEl) {
    factionTooltipEl.classList.remove('visible');
  }
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

  // Origine summary
  const origine = PLANETES.find(p => p.id === state.origineId);
  add('Origine', origine ? `${origine.name} (${origine.region})` : null);

  // Morale summary
  const doctrine = DOCTRINES.find(d => d.id === state.doctrineId);
  const methode = METHODES.find(m => m.id === state.methodeId);
  const lignes = Array.from(state.lignesRouges)
    .map(id => LIGNES_ROUGES.find(l => l.id === id)?.name)
    .filter(Boolean);
  
  add('Doctrine', doctrine?.name);
  add('Méthodes', methode?.name);
  add('Lignes rouges', lignes.length ? lignes.join(', ') : '—');

  // Allegiances summary - drafted cards and faction standings
  if (state.draftPicks && state.draftPicks.length > 0) {
    const cardTitles = state.draftPicks.map(c => c.title).join(', ');
    add('Cartes d\'allégeance', cardTitles);
    
    // Show significant faction standings (positive allies, negative enemies)
    const allies = [];
    const enemies = [];
    Object.entries(state.factionValues || {}).forEach(([factionId, value]) => {
      const faction = FACTIONS.find(f => f.id === factionId);
      if (faction && value >= 25) {
        allies.push(`${faction.name} (+${value})`);
      } else if (faction && value <= -25) {
        enemies.push(`${faction.name} (${value})`);
      }
    });
    
    if (allies.length > 0) {
      add('Alliés notables', allies.join(', '));
    }
    if (enemies.length > 0) {
      add('Ennemis notables', enemies.join(', '));
    }
  }

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
  
  // Resolve origine choice
  const origine = PLANETES.find(pl => pl.id === state.origineId);
  
  // Resolve morale choices
  const doctrine = DOCTRINES.find(d => d.id === state.doctrineId);
  const methode = METHODES.find(m => m.id === state.methodeId);
  const lignes = Array.from(state.lignesRouges)
    .map(id => LIGNES_ROUGES.find(l => l.id === id))
    .filter(Boolean);
  
  return {
    version: 'v0.7',
    codename: $('#codename')?.value || '',
    concept: $('#concept')?.value || '',
    notes: $('#notes')?.value || '',
    camp: $('#aff')?.value || '',
    speciesId: state.speciesId,
    professionId: state.professionId,
    selectedTraits: Array.from(state.selectedTraits),
    // Origine
    origineId: state.origineId,
    // Morale
    doctrineId: state.doctrineId,
    methodeId: state.methodeId,
    lignesRouges: Array.from(state.lignesRouges),
    pointsRemaining: totalPoints(),
    stats: Object.fromEntries(STATS.map(st => [st.id, Number($(`#${st.id}`)?.value || 0)])),
    resolved: {
      species: s?.name || null,
      profession: p?.name || null,
      skills,
      traits: Array.from(state.selectedTraits)
        .map(id => traitById(id))
        .filter(Boolean)
        .map(t => ({ id: t.id, name: t.name, points: traitPoints(t) })),
      // Origine resolved
      origine: origine?.name || null,
      origineRegion: origine?.region || null,
      // Morale resolved
      doctrine: doctrine?.name || null,
      methode: methode?.name || null,
      lignesRouges: lignes.map(l => l.name),
      // Allegiances resolved
      draftedCards: (state.draftPicks || []).map(c => ({ id: c.id, title: c.title })),
      factionStandings: Object.entries(state.factionValues || {})
        .filter(([_, v]) => v !== 0)
        .map(([id, value]) => {
          const faction = FACTIONS.find(f => f.id === id);
          return { id, name: faction?.name || id, value };
        })
        .sort((a, b) => b.value - a.value)
    }
  };
}

async function downloadFinalPNG() {
  if (state.page !== 6) {
    goTo(6);
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
  // Reset origine
  state.origineId = null;
  // Reset morale
  state.doctrineId = null;
  state.methodeId = null;
  state.lignesRouges.clear();
  // Reset draft
  state.draftPicks = [];
  FACTIONS.forEach(f => {
    state.factionValues[f.id] = 0;
  });
  
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
  renderOrigine();
  renderDoctrines();
  renderMethodes();
  renderLignesRouges();
  renderDraft();
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
  // Origine
  renderOrigine();
  // Morale
  renderDoctrines();
  renderMethodes();
  renderLignesRouges();
  // Allégences
  renderDraft();
  setTotalUI();

  $('#prevBtn').addEventListener('click', () => goTo(state.page - 1));
  $('#nextBtn').addEventListener('click', () => goTo(state.page + 1));
  $('#resetBtn').addEventListener('click', resetAll);
  $('#traitSearch').addEventListener('input', () => renderTraits($('#traitSearch').value));
  $('#saveBtn')?.addEventListener('click', downloadFinalPNG);
  $('#submitBtn')?.addEventListener('click', submitToGoogleSheets);
  
  // Draft buttons
  $('#rerollPackBtn')?.addEventListener('click', rerollCurrentPack);
  $('#restartDraftBtn')?.addEventListener('click', restartDraft);
  
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
