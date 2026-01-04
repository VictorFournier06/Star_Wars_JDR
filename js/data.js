/**
 * STAR WARS CHARACTER CREATOR - GAME DATA
 * 
 * This file contains all the data for species, professions, and traits.
 * Edit this file to add/modify content without touching the app logic.
 */

// =============================================================================
// SPECIES
// =============================================================================
const SPECIES = [
  {
    id: 'humain',
    name: "Humain",
    points: 0,
    blurb: "Adaptable. Tu t'intègres partout — et tu survis dans les zones grises.",
    tags: ["polyvalent"],
    hidden: {
      skills: ["Persuasion"]
    }
  },
  {
    id: 'twi',
    name: "Twi'lek",
    points: 0,
    blurb: "Expressif, social, résilient. Tu lis les gens avant qu'ils parlent.",
    tags: ["social"],
    hidden: {
      skills: ["Persuasion", "Perception"]
    }
  },
  {
    id: 'zabrak',
    name: "Zabrak",
    points: 0,
    blurb: "Tenace. Tu encaisses, tu avances. Les compromis, c'est pour les autres.",
    tags: ["endurant"],
    hidden: {
      skills: ["Endurance"]
    }
  },
  {
    id: 'droid',
    name: "Droïde",
    points: +4,
    blurb: "Efficace. Tu es une fonction… avec une volonté.",
    tags: ["tech"],
    hidden: {
      skills: ["Informatique", "Mécanique"]
    }
  },
];

// =============================================================================
// PROFESSIONS
// =============================================================================
const PROFESSIONS = [
  {
    id: 'intel',
    name: "Agent de renseignement",
    points: -6,
    blurb: "Tu entres et tu sors sans laisser de trace. Tu sais qui ment — et pourquoi.",
    tags: ["infiltration", "réseau"],
    hidden: {
      talent: "Couverture",
      skills: ["Discrétion", "Tromperie", "Renseignement", "Perception"]
    }
  },
  {
    id: 'diplo',
    name: "Diplomate subalterne",
    points: -4,
    blurb: "Tu manœuvres entre egos, lois et menaces voilées.",
    tags: ["négociation", "protocole"],
    hidden: {
      talent: "Protocole",
      skills: ["Persuasion", "Bureaucratie", "Connaissance (social)", "Perception"]
    }
  },
  {
    id: 'arch',
    name: "Archiviste / analyste",
    points: -2,
    blurb: "Tu transformes un détail oublié en levier stratégique.",
    tags: ["archives", "déduction"],
    hidden: {
      talent: "Accès archives",
      skills: ["Recherche", "Linguistique", "Connaissance (galactique)", "Connaissance (bureaucratie)"]
    }
  },
  {
    id: 'tech',
    name: "Technicien de flotte",
    points: -4,
    blurb: "Tu maintiens des machines en vie quand tout brûle.",
    tags: ["réparation", "terrain"],
    hidden: {
      talent: "Ingénieur terrain",
      skills: ["Mécanique", "Informatique", "Systèmes", "Endurance"]
    }
  },
  {
    id: 'pilot',
    name: "Pilote d'escorte",
    points: -6,
    blurb: "Tu fais passer un chasseur entre deux tirs comme si c'était une routine.",
    tags: ["poursuite", "spatial"],
    hidden: {
      talent: "Instinct",
      skills: ["Pilotage", "Perception", "Tactique", "Endurance"]
    }
  },
  {
    id: 'sabo',
    name: "Saboteur civil",
    points: -5,
    blurb: "Une porte est un problème. Un problème a une solution.",
    tags: ["sabotage", "furtif"],
    hidden: {
      talent: "Charge improvisée",
      skills: ["Discrétion", "Mécanique", "Informatique", "Tromperie"]
    }
  },
];

// =============================================================================
// TRAITS
// 
// value > 0 = Advantage (costs points to take)
// value < 0 = Drawback (grants points when taken)
// 
// For display, the points shown are INVERTED:
//   - Advantages show negative (you spend points)
//   - Drawbacks show positive (you gain points)
// =============================================================================
const TRAITS = [
  // ---- ADVANTAGES ----
  {
    id: 'analytique',
    name: "Esprit analytique",
    value: +3,
    desc: "Recoupements rapides, logique, déductions.",
    tags: ["enquête"],
    incompatible: ["impulsif"]
  },
  {
    id: 'linguiste',
    name: "Linguiste galactique",
    value: +6,
    desc: "Déchiffre des écritures rares, accélère une traduction.",
    tags: ["langues"],
    incompatible: []
  },
  {
    id: 'reseau',
    name: "Réseau discret",
    value: +8,
    desc: "Trois contacts fiables : info, logistique, planque.",
    tags: ["intrigue"],
    incompatible: ["surveillance"]
  },
  {
    id: 'pilotage',
    name: "As du pilotage",
    value: +10,
    desc: "Poursuites spatiales, manœuvres risquées, évasion.",
    tags: ["spatial"],
    incompatible: ["phobie_espace"]
  },
  {
    id: 'as_du_tir',
    name: "As du tir",
    value: +8,
    desc: "Tirs utiles, précision et sang-froid sous pression.",
    tags: ["combat"],
    incompatible: ["aveugle"]
  },

  // ---- DRAWBACKS ----
  {
    id: 'impulsif',
    name: "Impulsif",
    value: -4,
    desc: "Décisions trop rapides : tu t'exposes quand il faut temporiser.",
    tags: ["caractère"],
    incompatible: ["analytique"]
  },
  {
    id: 'surveillance',
    name: "Sous surveillance",
    value: -6,
    desc: "Contrôles, audits, informateurs : tu laisses des traces.",
    tags: ["intrigue"],
    incompatible: ["reseau"]
  },
  {
    id: 'trauma',
    name: "Traumatisé par la guerre",
    value: -6,
    desc: "Sous chaos : panique, gel ou colère (selon la scène).",
    tags: ["psy"],
    incompatible: []
  },
  {
    id: 'phobie_espace',
    name: "Phobie de l'espace",
    value: -6,
    desc: "Vide, EVA, dérive : tu perds tes moyens.",
    tags: ["spatial"],
    incompatible: ["pilotage"]
  },
  {
    id: 'aveugle',
    name: "Aveugle",
    value: -8,
    desc: "Handicap majeur : assistance techno ou allié requis.",
    tags: ["handicap"],
    incompatible: ["as_du_tir"]
  },
];

// =============================================================================
// PAGE CONFIGURATION
// =============================================================================
const PAGE_NAMES = [
  "Espèce",
  "Profession",
  "Traits",
  "Identité",
  "Dossier final"
];

// =============================================================================
// CAMP OPTIONS
// =============================================================================
const CAMP_OPTIONS = [
  { value: "", label: "— Choisis —" },
  { value: "République", label: "République" },
  { value: "Empire Sith", label: "Empire Sith" },
  { value: "Indépendant", label: "Indépendant" },
  { value: "Double agent", label: "Double agent" },
];

// =============================================================================
// STATS CONFIGURATION
// =============================================================================
const STATS = [
  { id: 'FOR', name: 'Force', abbr: 'FOR' },
  { id: 'DEX', name: 'Dextérité', abbr: 'DEX' },
  { id: 'CON', name: 'Constitution', abbr: 'CON' },
  { id: 'INT', name: 'Intelligence', abbr: 'INT' },
  { id: 'SAG', name: 'Sagesse', abbr: 'SAG' },
  { id: 'CHA', name: 'Charisme', abbr: 'CHA' },
];

// =============================================================================
// EXPORTS (for use with ES modules, if desired)
// =============================================================================
// If you want to use ES modules later, uncomment this:
// export { SPECIES, PROFESSIONS, TRAITS, PAGE_NAMES, CAMP_OPTIONS, STATS };
