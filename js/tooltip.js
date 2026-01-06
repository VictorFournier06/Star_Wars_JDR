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
