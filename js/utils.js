/**
 * STAR WARS CHARACTER CREATOR - UTILITY FUNCTIONS
 */

// =============================================================================
// DOM UTILITIES
// =============================================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// =============================================================================
// IMAGE HANDLING
// =============================================================================
const IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'gif'];
const FALLBACK_SVG = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23111%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2240%22>?</text></svg>";

/**
 * Get the base image path for a species
 */
function getSpeciesImageSrc(speciesId) {
  return `assets/species/${speciesId}`;
}

/**
 * Create image helper for species
 */
function createSpeciesImage(speciesId) {
  const basePath = getSpeciesImageSrc(speciesId);
  return { basePath, fallbackSvg: FALLBACK_SVG };
}

/**
 * Try next image extension when current one fails
 */
function tryNextSpeciesImage(img) {
  const speciesId = img.dataset.speciesId;
  if (!speciesId) {
    img.onerror = null;
    img.src = FALLBACK_SVG;
    return;
  }
  
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
    img.onerror = null;
    img.src = FALLBACK_SVG;
  }
}

// =============================================================================
// ABILITY MODIFIERS PARSING
// =============================================================================

/**
 * Parse ability modifiers from string like "+2 FOR, -2 DEX"
 * Returns object like { FOR: 2, DEX: -2 }
 */
function parseAbilityMods(modString) {
  const mods = { FOR: 0, DEX: 0, CON: 0, INT: 0, SAG: 0, CHA: 0 };
  if (!modString || modString === 'Aucun' || modString === 'Variable selon modèle') {
    return mods;
  }
  
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
