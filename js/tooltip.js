/**
 * STAR WARS CHARACTER CREATOR - TOOLTIP SYSTEM
 */

// Species descriptions loaded from JSON
let speciesDescriptions = {};

// Fallback descriptions for local file:// protocol
const FALLBACK_DESCRIPTIONS = {
  "humain": "Les Humains dominent les Mondes du Noyau et peuvent être trouvés dans pratiquement chaque coin de la galaxie.",
  "twilek": "Les Twi'leks sont une espèce humanoïde originaire de Ryloth. Leurs lekku sont des organes sensoriels.",
  "zabrak": "Les Zabraks sont une espèce fière et indépendante, reconnaissable à leurs cornes crâniennes distinctives.",
  "miraluka": "Les Miraluka n'ont pas d'yeux, mais peuvent «voir» en utilisant la Force.",
  "chiss": "Les Chiss sont technologiquement avancés, originaires du monde glacial de Csilla.",
  "rattataki": "Les Rattataki sont une espèce à la peau pâle, naturellement résistants et combatifs.",
  "cathar": "Les Cathar sont des humanoïdes félins connus pour leur férocité au combat.",
  "togruta": "Les Togrutas sont des chasseurs de meute naturels avec des cornes et lekkus distinctifs.",
  "wookiee": "Les Wookiees sont l'une des espèces les plus fortes de la galaxie.",
  "trandoshan": "Les Trandoshans reptiliens sont connus pour leur grande force.",
  "nautolan": "Les Nautolans sont une espèce aquatique de Glee Anselm.",
  "mirialan": "Les Mirialans sont reconnaissables à leurs tatouages géométriques traditionnels.",
  "rodian": "Les Rodians sont une espèce reptilienne originaire de Rodia.",
  "duros": "Les Duros sont l'une des premières espèces à avoir développé le voyage interstellaire.",
  "bothan": "Les Bothans sont réputés pour leur réseau d'espionnage galactique.",
  "sith_pureblood": "Les Sith de sang-pur sont les descendants de l'ancienne espèce Sith.",
  "droide": "Les droïdes sont des êtres mécaniques créés pour servir diverses fonctions."
};

/**
 * Load species descriptions from JSON file with fallback
 */
function loadSpeciesDescriptions() {
  // Check if we're on file:// protocol (local)
  if (window.location.protocol === 'file:') {
    console.log('Local file protocol detected, using fallback descriptions');
    speciesDescriptions = FALLBACK_DESCRIPTIONS;
    return;
  }
  
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
        // Try next path
      }
    }
    console.warn('Failed to load descriptions from server, using fallback');
    speciesDescriptions = FALLBACK_DESCRIPTIONS;
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
  
  // Create tooltip container
  const tooltip = document.createElement('div');
  tooltip.className = 'species-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-connector">
      <div class="connector-h1"></div>
      <div class="connector-v"></div>
      <div class="connector-h2"></div>
    </div>
    <div class="tooltip-panel">
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
  
  // Store reference to anchor for cleanup
  tooltip.dataset.anchorId = speciesId;
  
  // Position and animate
  positionTooltip(tooltip, anchorEl);
  
  requestAnimationFrame(() => {
    tooltip.classList.add('visible');
  });
  
  // Add mouseleave handler to tooltip itself
  tooltip.addEventListener('mouseenter', () => {
    if (tooltipHoverTimeout) {
      clearTimeout(tooltipHoverTimeout);
      tooltipHoverTimeout = null;
    }
  });
  
  tooltip.addEventListener('mouseleave', () => {
    scheduleHideTooltip();
  });
}

/**
 * Position tooltip next to the dot
 * Uses absolute positioning so it scrolls with the page
 */
function positionTooltip(tooltip, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;
  
  // Dot is positioned at right: -6px, 10px wide, so center is at rect.right - 1
  const dotCenterX = rect.right - 1 + scrollX;
  const dotCenterY = rect.top + rect.height / 2 + scrollY;
  
  // Position tooltip at the dot, centered vertically on the dot
  tooltip.style.position = 'absolute';
  tooltip.style.left = `${dotCenterX}px`;
  tooltip.style.top = `${dotCenterY}px`;
  tooltip.style.transform = 'translateY(-50%)'; // Center vertically on dot
  
  // Check if tooltip would go off right edge
  requestAnimationFrame(() => {
    const tooltipPanel = tooltip.querySelector('.tooltip-panel');
    if (!tooltipPanel) return;
    const tooltipRect = tooltipPanel.getBoundingClientRect();
    
    if (tooltipRect.right > window.innerWidth - 20) {
      tooltip.classList.add('left-side');
      const dot = anchorEl.querySelector('.hover-dot');
      if (dot) dot.classList.add('left-side');
      // Position at left side of the image
      tooltip.style.left = `${rect.left + 1 + scrollX}px`;
    }
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
