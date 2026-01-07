/**
 * STAR WARS CHARACTER CREATOR - TOOLTIP SYSTEM
 * 
 * Architecture:
 * - Tooltip container uses position: absolute with page coordinates
 * - SVG connector is inside the tooltip, using relative coordinates
 * - Everything is computed once on mouseenter based on bounding boxes
 * - Everything scrolls together naturally since it's all absolute positioned
 */

// Species descriptions loaded from JSON
let speciesDescriptions = {};

/**
 * Load species descriptions from JSON file
 */
function loadSpeciesDescriptions() {
  const paths = [
    './js/species_descriptions.json',
    'js/species_descriptions.json',
    '/js/species_descriptions.json'
  ];
  
  async function tryLoadFromPaths() {
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          const data = await res.json();
          speciesDescriptions = data;
          console.log(`Species descriptions loaded from ${path}:`, Object.keys(data).length, 'entries');
          return;
        }
      } catch (e) {
        console.warn(`Failed to load from ${path}:`, e.message);
      }
    }
    console.warn('Could not load species descriptions from any path');
  }
  
  tryLoadFromPaths();
}

// Load on script load
loadSpeciesDescriptions();

// =============================================================================
// TOOLTIP STATE
// =============================================================================
let activeTooltip = null;
let tooltipHoverTimeout = null;

/**
 * Show species tooltip anchored to an element
 */
function showSpeciesTooltip(speciesId, anchorEl) {
  // Clear any pending hide
  if (tooltipHoverTimeout) {
    clearTimeout(tooltipHoverTimeout);
    tooltipHoverTimeout = null;
  }
  
  // Remove existing tooltip
  hideSpeciesTooltipImmediate();
  
  const species = SPECIES.find(s => s.id === speciesId);
  if (!species) return;
  
  const description = speciesDescriptions[speciesId] || 'Description non disponible.';
  const imgId = species.id.toLowerCase().replace(/\s+/g, '_');
  
  // Add dot overlay on the hovered image
  let hoverDot = anchorEl.querySelector('.hover-dot');
  if (!hoverDot) {
    hoverDot = document.createElement('div');
    hoverDot.className = 'hover-dot';
    anchorEl.appendChild(hoverDot);
  }
  
  // Wait for dot to render, then compute positions
  requestAnimationFrame(() => {
    createAndPositionTooltip(species, description, imgId, anchorEl, hoverDot);
  });
}

/**
 * Create and position the tooltip based on dot position
 */
function createAndPositionTooltip(species, description, imgId, anchorEl, hoverDot) {
  // Get dot position in PAGE coordinates (absolute, includes scroll)
  const dotRect = hoverDot.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  
  const dotPageX = dotRect.left + scrollX + dotRect.width / 2;
  const dotPageY = dotRect.top + scrollY + dotRect.height / 2;
  
  // Viewport info
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // Determine which side: dot on right half → tooltip on left, and vice versa
  const dotViewportX = dotRect.left + dotRect.width / 2;
  const isLeftSide = dotViewportX > vw / 2;
  
  if (isLeftSide) {
    hoverDot.classList.add('left-side');
  }
  
  // Panel dimensions
  const panelWidth = 420;
  const panelHeight = 400; // Approximate
  
  // Calculate tooltip panel position in PAGE coordinates
  // Tooltip appears at viewport center vertically, offset horizontally
  const viewportCenterY = vh / 2;
  const margin = 60;
  
  let panelPageX, panelPageY;
  
  if (isLeftSide) {
    // Tooltip on left side of screen
    panelPageX = (vw / 2 - panelWidth / 2 - margin) + scrollX;
  } else {
    // Tooltip on right side of screen
    panelPageX = (vw / 2 - panelWidth / 2 + margin) + scrollX;
  }
  panelPageY = viewportCenterY + scrollY - panelHeight / 2;
  
  // Calculate connector line coordinates (relative to tooltip container)
  // Container will be positioned at the top-left of the entire bounding area
  const minX = Math.min(dotPageX, panelPageX, panelPageX + panelWidth);
  const maxX = Math.max(dotPageX, panelPageX, panelPageX + panelWidth);
  const minY = Math.min(dotPageY, panelPageY, panelPageY + panelHeight);
  const maxY = Math.max(dotPageY, panelPageY, panelPageY + panelHeight);
  
  // Add padding for the connector
  const padding = 50;
  const containerX = minX - padding;
  const containerY = minY - padding;
  const containerWidth = maxX - minX + padding * 2;
  const containerHeight = maxY - minY + padding * 2;
  
  // Convert positions to container-relative coordinates
  const dotRelX = dotPageX - containerX;
  const dotRelY = dotPageY - containerY;
  const panelRelX = panelPageX - containerX;
  const panelRelY = panelPageY - containerY;
  
  // Build the elbow connector path
  const elbowOffset = 40;
  let elbowX, connectorEndX, connectorEndY;
  
  if (isLeftSide) {
    // Connector goes: dot → left → down/up → right to panel's right edge
    elbowX = dotRelX - elbowOffset;
    connectorEndX = panelRelX + panelWidth;
    connectorEndY = panelRelY + panelHeight / 2;
  } else {
    // Connector goes: dot → right → down/up → left to panel's left edge
    elbowX = dotRelX + elbowOffset;
    connectorEndX = panelRelX;
    connectorEndY = panelRelY + panelHeight / 2;
  }
  
  const pathD = `M ${dotRelX} ${dotRelY} H ${elbowX} V ${connectorEndY} H ${connectorEndX}`;
  
  // Create tooltip container
  const tooltip = document.createElement('div');
  tooltip.className = 'species-tooltip' + (isLeftSide ? ' left-side' : '');
  tooltip.style.cssText = `
    position: absolute;
    left: ${containerX}px;
    top: ${containerY}px;
    width: ${containerWidth}px;
    height: ${containerHeight}px;
    pointer-events: none;
    z-index: 1000;
  `;
  
  tooltip.innerHTML = `
    <svg class="tooltip-connector-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: visible;">
      <defs>
        <filter id="connectorGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        class="connector-path" 
        d="${pathD}" 
        fill="none" 
        stroke="rgba(242, 193, 78, 0.8)" 
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#connectorGlow)"
      />
    </svg>
    <div class="tooltip-panel" style="position: absolute; left: ${panelRelX}px; top: ${panelRelY}px; width: ${panelWidth}px; pointer-events: auto;">
      <div class="tooltip-header">
        <span class="tooltip-title">${species.name}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-img-container">
          <img class="tooltip-species-img" 
               src="assets/species/${imgId}.png" 
               alt="${species.name}"
               data-species-id="${imgId}"
               onerror="tryNextSpeciesImage(this)">
        </div>
        <p class="tooltip-desc">${description}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(tooltip);
  activeTooltip = tooltip;
  
  // Store reference for cleanup
  tooltip.dataset.anchorId = species.id;
  
  // Animate in
  requestAnimationFrame(() => {
    tooltip.classList.add('visible');
  });
  
  // Add hover handlers to tooltip panel
  const panel = tooltip.querySelector('.tooltip-panel');
  panel.addEventListener('mouseenter', () => {
    if (tooltipHoverTimeout) {
      clearTimeout(tooltipHoverTimeout);
      tooltipHoverTimeout = null;
    }
  });
  
  panel.addEventListener('mouseleave', () => {
    scheduleHideTooltip();
  });
}

/**
 * Schedule tooltip hide with delay (allows moving mouse to tooltip)
 */
function scheduleHideTooltip() {
  if (tooltipHoverTimeout) {
    clearTimeout(tooltipHoverTimeout);
  }
  tooltipHoverTimeout = setTimeout(() => {
    hideSpeciesTooltip();
  }, 150);
}

/**
 * Hide tooltip with animation
 */
function hideSpeciesTooltip() {
  document.querySelectorAll('.hover-dot').forEach(dot => dot.remove());
  
  if (activeTooltip) {
    activeTooltip.classList.remove('visible');
    activeTooltip.classList.add('hiding');
    const tooltipToRemove = activeTooltip;
    activeTooltip = null;
    
    setTimeout(() => {
      if (tooltipToRemove && tooltipToRemove.parentNode) {
        tooltipToRemove.remove();
      }
    }, 300);
  }
}

/**
 * Hide tooltip immediately without animation
 */
function hideSpeciesTooltipImmediate() {
  document.querySelectorAll('.hover-dot').forEach(dot => dot.remove());
  
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

/**
 * Cancel any pending tooltip hide
 */
function cancelTooltipHide() {
  if (tooltipHoverTimeout) {
    clearTimeout(tooltipHoverTimeout);
    tooltipHoverTimeout = null;
  }
}

/**
 * Try next image format for species (fallback chain)
 */
function tryNextSpeciesImage(img) {
  const speciesId = img.dataset.speciesId;
  const currentSrc = img.src;
  
  const formats = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  const currentFormat = formats.find(f => currentSrc.toLowerCase().endsWith(f));
  const currentIndex = formats.indexOf(currentFormat);
  
  if (currentIndex < formats.length - 1) {
    const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('.'));
    img.src = basePath + formats[currentIndex + 1];
  } else {
    // All formats failed, use placeholder
    img.src = 'assets/species/placeholder.png';
    img.onerror = null;
  }
}

// =============================================================================
// PLANET TOOLTIPS
// =============================================================================
let activePlanetTooltip = null;
let planetTooltipTimeout = null;
let currentPlanetId = null;

/**
 * Show planet tooltip anchored to a planet node
 */
function showPlanetTooltip(planetId, anchorEl) {
  // Clear any pending hide timeout
  if (planetTooltipTimeout) {
    clearTimeout(planetTooltipTimeout);
    planetTooltipTimeout = null;
  }
  
  // If same planet, keep current tooltip
  if (currentPlanetId === planetId && activePlanetTooltip) {
    return;
  }
  
  // Remove existing tooltip
  hidePlanetTooltipImmediate();
  
  currentPlanetId = planetId;
  
  const planet = PLANETES.find(p => p.id === planetId);
  if (!planet) return;
  
  // Get anchor position in viewport
  const anchorRect = anchorEl.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // Tooltip dimensions (updated to match CSS)
  const tooltipWidth = 520;
  const tooltipHeight = 500;
  
  // Position tooltip to the side with most space
  let tooltipX, tooltipY;
  const margin = 20;
  
  // Prefer right side if there's room, otherwise left
  if (anchorRect.right + tooltipWidth + margin < vw) {
    tooltipX = anchorRect.right + margin + scrollX;
  } else if (anchorRect.left - tooltipWidth - margin > 0) {
    tooltipX = anchorRect.left - tooltipWidth - margin + scrollX;
  } else {
    // Center horizontally
    tooltipX = (vw - tooltipWidth) / 2 + scrollX;
  }
  
  // Vertical: try to center with anchor, but stay in viewport
  tooltipY = anchorRect.top + scrollY - tooltipHeight / 2 + anchorRect.height / 2;
  tooltipY = Math.max(scrollY + margin, Math.min(scrollY + vh - tooltipHeight - margin, tooltipY));
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'planet-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    left: ${tooltipX}px;
    top: ${tooltipY}px;
    z-index: 1000;
    pointer-events: auto;
  `;
  
  // Map planet IDs to file names and extensions
  // Ambiance folder (banner images)
  const ambianceFileMap = {
    'coruscant': 'Coruscant.webp',
    'alderaan': 'Alderaan.webp',
    'corellia': 'Corellia.webp',
    'balmorra': 'Balmorra.webp',
    'kashyyyk': 'Kashyyyk.jpg',
    'nar_shaddaa': 'NarShaddaa.jpg',
    'quesh': 'Quesh.webp',
    'tatooine': 'Tatooine.webp',
    'taris': 'Taris.webp',
    'hoth': 'Hoth.webp',
    'mustafar': 'Mustafar.webp',
    'ilum': 'Ilum.webp',
    'belsavis': 'Belsavis.webp',
    'voss': 'Voss.webp',
    'carrick_station': 'CarrickStation.webp',
    'vaiken_spacedock': 'VaikenSpacedock.jpg'
  };
  
  // Planets folder (planet view images - all webp)
  const planetFileMap = {
    'coruscant': 'Coruscant.webp',
    'alderaan': 'Alderaan.webp',
    'corellia': 'Corellia.webp',
    'balmorra': 'Balmorra.webp',
    'kashyyyk': 'Kashyyyk.webp',
    'nar_shaddaa': 'NarShaddaa.webp',
    'quesh': 'Quesh.webp',
    'tatooine': 'Tatooine.webp',
    'taris': 'Taris.webp',
    'hoth': 'Hoth.webp',
    'mustafar': 'Mustafar.webp',
    'ilum': 'Ilum.webp',
    'belsavis': 'Belsavis.webp',
    'voss': 'Voss.webp',
    'carrick_station': 'CarrickStation.webp',
    'vaiken_spacedock': 'VaikenSpacedock.webp'
  };
  
  const ambianceFile = ambianceFileMap[planet.id] || `${planet.id}.webp`;
  const planetFile = planetFileMap[planet.id] || `${planet.id}.webp`;
  const bannerPath = `assets/locations/ambiance/${ambianceFile}`;
  const planetViewPath = `assets/locations/planets/${planetFile}`;
  
  // Clean population value (remove leading dash, keep tilde as ±)
  let cleanPopulation = planet.population;
  if (cleanPopulation.startsWith('~')) {
    cleanPopulation = '± ' + cleanPopulation.substring(1).replace(/^[\-–—\s]+/, '');
  } else {
    cleanPopulation = cleanPopulation.replace(/^[\-–—\s]+/, '');
  }
  
  tooltip.innerHTML = `
    <div class="planet-tooltip-panel">
      <div class="planet-tooltip-banner">
        <img src="${bannerPath}" alt="${planet.name}" onerror="this.parentElement.style.display='none'">
        <div class="planet-tooltip-header-overlay">
          <h3 class="planet-tooltip-name">${planet.name}</h3>
          <div class="planet-tooltip-region">${planet.region}</div>
        </div>
      </div>
      <div class="planet-tooltip-body">
        <div class="planet-tooltip-stats">
          <div class="planet-stat-hex planet-stat-climat">
            <div class="hex-content">
              <div class="stat-box-label">Climat</div>
              <div class="stat-box-value">${planet.climat}</div>
            </div>
          </div>
          <div class="planet-tooltip-planet-view">
            <img src="${planetViewPath}" alt="${planet.name}" onerror="this.style.display='none'">
          </div>
          <div class="planet-stat-hex planet-stat-population">
            <div class="hex-content">
              <div class="stat-box-label">Population</div>
              <div class="stat-box-value">${cleanPopulation}</div>
            </div>
          </div>
        </div>
        <div class="planet-stat-hex planet-stat-terrain full-width">
          <div class="hex-content">
            <div class="stat-box-label">Géographie</div>
            <div class="stat-box-value">${planet.terrain}</div>
          </div>
        </div>
        <p class="planet-tooltip-desc">${planet.desc}</p>
      </div>
    </div>
  `;
  
  // Add hover handlers to keep tooltip visible when hovering over it
  tooltip.addEventListener('mouseenter', () => {
    // Clear any pending hide timeout
    if (planetTooltipTimeout) {
      clearTimeout(planetTooltipTimeout);
      planetTooltipTimeout = null;
    }
  });
  
  tooltip.addEventListener('mouseleave', () => {
    hidePlanetTooltip();
  });
  
  document.body.appendChild(tooltip);
  activePlanetTooltip = tooltip;
}

/**
 * Hide planet tooltip with delay
 */
function hidePlanetTooltip() {
  // Clear any existing timeout
  if (planetTooltipTimeout) {
    clearTimeout(planetTooltipTimeout);
  }
  
  // Small delay to allow moving to tooltip
  planetTooltipTimeout = setTimeout(() => {
    if (activePlanetTooltip && !activePlanetTooltip.matches(':hover')) {
      hidePlanetTooltipImmediate();
    }
    planetTooltipTimeout = null;
  }, 150);
}

/**
 * Hide planet tooltip immediately
 */
function hidePlanetTooltipImmediate() {
  if (planetTooltipTimeout) {
    clearTimeout(planetTooltipTimeout);
    planetTooltipTimeout = null;
  }
  if (activePlanetTooltip) {
    activePlanetTooltip.remove();
    activePlanetTooltip = null;
  }
  currentPlanetId = null;
}
