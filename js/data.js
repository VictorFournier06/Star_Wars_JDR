/**
 * STAR WARS CHARACTER CREATOR - GAME DATA
 * 
 * This file contains all the data for species, professions, and traits.
 * Edit this file to add/modify content without touching the app logic.
 */

// =============================================================================
// SPECIES
// Curated for Old Republic / Eternal Empire era intrigue campaigns
// Image files should be placed in assets/species/ folder
// =============================================================================
const SPECIES = [
  // --- CORE SPECIES (Classic choices) ---
  {
    id: 'humain',
    name: "Humain",
    points: 0,
    blurb: "Adaptable et répandu dans toute la galaxie. Tu t'intègres partout.",
    tags: ["polyvalent", "diplomatie"],
    image: "humain.png",
    hidden: {
      abilityMods: "Aucun",
      languages: ["Basic"],
      skills: ["Persuasion"],
      traits: ["Bonus Feat", "Bonus Skill"]
    }
  },
  {
    id: 'twilek',
    name: "Twi'lek",
    points: 0,
    blurb: "Expressif et charismatique. Tes lekku trahissent parfois tes émotions.",
    tags: ["social", "charme"],
    image: "twilek.png",
    hidden: {
      abilityMods: "+2 CHA, -2 SAG",
      languages: ["Basic", "Ryl"],
      skills: ["Persuasion", "Tromperie"],
      traits: ["Deceptive", "Great Fortitude"]
    }
  },
  {
    id: 'zabrak',
    name: "Zabrak",
    points: 0,
    blurb: "Tenace et déterminé. Les épreuves te rendent plus fort.",
    tags: ["endurant", "volonté"],
    image: "zabrak.png",
    hidden: {
      abilityMods: "Aucun",
      languages: ["Basic", "Zabrak"],
      skills: ["Endurance"],
      traits: ["Heightened Awareness", "Superior Defenses"]
    }
  },
  {
    id: 'miraluka',
    name: "Miraluka",
    points: -2,
    blurb: "Tu vois à travers la Force, pas avec des yeux. Perceptif au-delà du visible.",
    tags: ["Force", "perception"],
    image: "miraluka.png",
    hidden: {
      abilityMods: "+2 INT, -2 DEX",
      languages: ["Basic", "Miralukese"],
      skills: ["Perception", "Use the Force"],
      traits: ["Force Sight", "Conditional Bonus Feat"]
    }
  },
  {
    id: 'chiss',
    name: "Chiss",
    points: -2,
    blurb: "Stratège et calculateur. Tu analyses avant d'agir.",
    tags: ["tactique", "intelligence"],
    image: "chiss.png",
    hidden: {
      abilityMods: "+2 INT",
      languages: ["Basic", "Cheunh"],
      skills: ["Perception", "Connaissance (tactique)"],
      traits: ["Low-Light Vision", "Tactician"]
    }
  },
  {
    id: 'rattataki',
    name: "Rattataki",
    points: 0,
    blurb: "Guerrier-né d'une planète brutale. La violence est ton langage.",
    tags: ["combat", "intimidation"],
    image: "rattataki.png",
    hidden: {
      abilityMods: "Aucun",
      languages: ["Basic", "Rattataki"],
      skills: ["Intimidation", "Endurance"],
      traits: ["Bonus Feat (Martial Arts)", "Intimidating"]
    }
  },
  {
    id: 'cathar',
    name: "Cathar",
    points: 0,
    blurb: "Félin et agile. Tes instincts de chasseur te guident.",
    tags: ["agilité", "instinct"],
    image: "cathar.png",
    hidden: {
      abilityMods: "+2 DEX, -2 INT",
      languages: ["Basic", "Catharese"],
      skills: ["Acrobaties", "Perception"],
      traits: ["Natural Weapons", "Heightened Awareness"]
    }
  },

  // --- ESPÈCES TECHNIQUES ---
  {
    id: 'duros',
    name: "Duros",
    points: 0,
    blurb: "Explorateur et pilote né. L'hyperespace n'a pas de secrets pour toi.",
    tags: ["pilotage", "exploration"],
    image: "duros.png",
    hidden: {
      abilityMods: "+2 DEX, +2 INT, -2 CON",
      languages: ["Basic", "Durese"],
      skills: ["Pilotage", "Mécanique"],
      traits: ["Expert Pilot", "Spacer"]
    }
  },
  {
    id: 'sullustan',
    name: "Sullustan",
    points: 0,
    blurb: "Navigateur exceptionnel avec une mémoire spatiale infaillible.",
    tags: ["navigation", "technique"],
    image: "sullustan.jpg",
    hidden: {
      abilityMods: "+2 DEX, -2 CON",
      languages: ["Basic", "Sullustese"],
      skills: ["Pilotage", "Connaissance (galactique)"],
      traits: ["Darkvision", "Expert Pilot"]
    }
  },

  // --- ESPÈCES SOCIALES / INTRIGUE ---
  {
    id: 'bothan',
    name: "Bothan",
    points: 0,
    blurb: "Maître espion. L'information est ta monnaie.",
    tags: ["espionnage", "réseau"],
    image: "bothan.png",
    hidden: {
      abilityMods: "+2 DEX, -2 CON",
      languages: ["Basic", "Bothese"],
      skills: ["Renseignement", "Tromperie"],
      traits: ["Heightened Awareness", "Bonus Feat (Skill Focus)"]
    }
  },
  {
    id: 'zeltron',
    name: "Zeltron",
    points: 0,
    blurb: "Empathique et séduisant. Tu ressens et influences les émotions.",
    tags: ["empathie", "charme"],
    image: "zeltron.png",
    hidden: {
      abilityMods: "+2 CHA, -2 SAG",
      languages: ["Basic", "Zeltron"],
      skills: ["Persuasion", "Perception"],
      traits: ["Pheromones", "Empathy"]
    }
  },
  {
    id: 'falleen',
    name: "Falleen",
    points: -2,
    blurb: "Noble et magnétique. Tes phéromones font plier les volontés.",
    tags: ["manipulation", "noblesse"],
    image: "falleen.png",
    hidden: {
      abilityMods: "+2 CHA, -2 SAG",
      languages: ["Basic", "Falleen"],
      skills: ["Persuasion", "Tromperie"],
      traits: ["Pheromones", "Hold Breath"]
    }
  },

  // --- ESPÈCES PHYSIQUES / COMBAT ---
  {
    id: 'wookiee',
    name: "Wookiee",
    points: -2,
    blurb: "Colosse loyal. Ta force est légendaire, ta dette d'honneur absolue.",
    tags: ["force", "loyauté"],
    image: "wookiee.png",
    hidden: {
      abilityMods: "+4 FOR, +2 CON, -2 DEX, -2 SAG, -2 CHA",
      languages: ["Shyriiwook (Basic compris)"],
      skills: ["Escalade", "Intimidation"],
      traits: ["Extraordinary Recuperation", "Rage", "Intimidating"]
    }
  },
  {
    id: 'trandoshan',
    name: "Trandoshan",
    points: 0,
    blurb: "Chasseur impitoyable. La traque est un art sacré.",
    tags: ["chasseur", "brutal"],
    image: "trandoshan.png",
    hidden: {
      abilityMods: "+2 FOR, -2 DEX",
      languages: ["Basic", "Dosh"],
      skills: ["Survie", "Perception"],
      traits: ["Darkvision", "Natural Weapons", "Regeneration"]
    }
  },
  {
    id: 'keldor',
    name: "Kel Dor",
    points: 0,
    blurb: "Sage et juste. Tu respires un air que les autres ne peuvent survivre.",
    tags: ["sagesse", "justice"],
    image: "keldor.png",
    hidden: {
      abilityMods: "+2 DEX, +2 SAG, -2 CON",
      languages: ["Basic", "Kel Dor"],
      skills: ["Perception", "Persuasion"],
      traits: ["Low-Light Vision", "Atmospheric Dependence"]
    }
  },
  {
    id: 'togruta',
    name: "Togruta",
    points: 0,
    blurb: "Chasseur de meute. Tes montrals captent ce que d'autres ne perçoivent pas.",
    tags: ["perception", "communauté"],
    image: "togruta.png",
    hidden: {
      abilityMods: "+2 DEX, -2 CON",
      languages: ["Basic", "Togruti"],
      skills: ["Perception", "Survie"],
      traits: ["Spatial Awareness", "Pack Hunter"]
    }
  },
  {
    id: 'nautolan',
    name: "Nautolan",
    points: 0,
    blurb: "Amphibien empathique. Tes tentacules lisent les phéromones émotionnelles.",
    tags: ["empathie", "aquatique"],
    image: "nautolan.png",
    hidden: {
      abilityMods: "+2 CON, -2 INT, -2 SAG",
      languages: ["Basic", "Nautila"],
      skills: ["Natation", "Perception"],
      traits: ["Expert Swimmer", "Pheromone Detection", "Low-Light Vision"]
    }
  },

  // --- ESPÈCES ADDITIONNELLES (Old Republic) ---
  {
    id: 'mirialan',
    name: "Mirialan",
    points: 0,
    blurb: "Spirituel et réfléchi. Tes tatouages racontent ton histoire et tes accomplissements.",
    tags: ["spirituel", "discipline"],
    image: "mirialan.png",
    hidden: {
      abilityMods: "+2 SAG, -2 CHA",
      languages: ["Basic", "Mirialan"],
      skills: ["Perception", "Survie"],
      traits: ["Heightened Awareness", "Superior Defenses"]
    }
  },
  {
    id: 'rodian',
    name: "Rodian",
    points: 0,
    blurb: "Chasseur instinctif de Rodia. La traque est dans ton sang.",
    tags: ["chasseur", "perception"],
    image: "rodian.png",
    hidden: {
      abilityMods: "+2 DEX, -2 SAG, -2 CHA",
      languages: ["Basic", "Rodese"],
      skills: ["Survie", "Perception"],
      traits: ["Low-Light Vision", "Heightened Awareness"]
    }
  },
  {
    id: 'devaronian',
    name: "Devaronien",
    points: 0,
    blurb: "Voyageur né. Les mâles errent, les femelles bâtissent. Tu appartiens aux étoiles.",
    tags: ["voyage", "commerce"],
    image: "devaronian.png",
    hidden: {
      abilityMods: "Aucun",
      languages: ["Basic", "Devaronese"],
      skills: ["Tromperie", "Persuasion"],
      traits: ["Bonus Feat (Skill Focus)", "Low-Light Vision"]
    }
  },
  {
    id: 'arkanian',
    name: "Arkanien",
    points: -2,
    blurb: "Scientifique de génie, arrogant par nature. La génétique est ton art.",
    tags: ["science", "génétique"],
    image: "arkanian.png",
    hidden: {
      abilityMods: "+2 INT, -2 SAG",
      languages: ["Basic", "Arkanian"],
      skills: ["Connaissance (science)", "Informatique"],
      traits: ["Darkvision", "Bonus Feat (Skill Focus)"]
    }
  },
  {
    id: 'weequay',
    name: "Weequay",
    points: +2,
    blurb: "Rugueux et résistant. Ton peuple communique par phéromones — les étrangers ne comprennent jamais.",
    tags: ["résistant", "mercenaire"],
    image: "weequay.png",
    hidden: {
      abilityMods: "-2 CHA",
      languages: ["Basic", "Weequay"],
      skills: ["Survie", "Intimidation"],
      traits: ["Great Fortitude"]
    }
  },
  {
    id: 'gamorrean',
    name: "Gamorréen",
    points: +2,
    blurb: "Brutal et loyal. Ta force est légendaire, ta subtilité... moins.",
    tags: ["force brute", "combat"],
    image: "gamorrean.png",
    hidden: {
      abilityMods: "+4 FOR, +2 CON, -4 INT, -2 SAG, -2 CHA",
      languages: ["Gamorrese (Basic compris)"],
      skills: ["Mêlée", "Intimidation"],
      traits: ["Primitive", "Great Fortitude"]
    }
  },
  {
    id: 'ithorian',
    name: "Ithorien",
    points: 0,
    blurb: "Pacifiste de la jungle. Ta voix stéréo peut aussi être une arme.",
    tags: ["pacifiste", "nature"],
    image: "ithorian.png",
    hidden: {
      abilityMods: "+2 SAG, +2 CHA, -2 DEX",
      languages: ["Basic", "Ithorian"],
      skills: ["Persuasion", "Connaissance (vie)"],
      traits: ["Bellow", "Pacifist"]
    }
  },
  {
    id: 'selkath',
    name: "Selkath",
    points: 0,
    blurb: "Amphibien de Manaan. Neutres par tradition, impitoyables quand poussés à bout.",
    tags: ["aquatique", "neutre"],
    image: "selkath.png",
    hidden: {
      abilityMods: "+2 SAG, -2 CHA",
      languages: ["Basic", "Selkath"],
      skills: ["Médecine", "Perception"],
      traits: ["Amphibious", "Natural Claws"]
    }
  },
  {
    id: 'pureblood_massassi',
    name: "Massassi",
    points: -2,
    blurb: "Guerrier Sith antique. Ta caste était l'armée des Seigneurs Sith.",
    tags: ["guerrier", "sith"],
    image: "massassi.png",
    hidden: {
      abilityMods: "+4 FOR, +2 CON, -2 INT, -2 CHA",
      languages: ["Sith", "Basic (limité)"],
      skills: ["Mêlée", "Intimidation"],
      traits: ["Rage", "Dark Side Affinity"]
    }
  },

  // --- ESPÈCES ADDITIONNELLES (avec images disponibles) ---
  {
    id: 'anzat',
    name: "Anzat",
    points: -4,
    blurb: "Prédateur ancien qui se nourrit de la 'soupe' — l'essence vitale des êtres vivants.",
    tags: ["prédateur", "furtif"],
    image: "anzat.webp",
    hidden: {
      abilityMods: "+2 FOR, +2 DEX, -2 CHA",
      languages: ["Basic", "Anzati"],
      skills: ["Discrétion", "Perception"],
      traits: ["Telepathy", "Long-lived"]
    }
  },
  {
    id: 'cerean',
    name: "Cerean",
    points: 0,
    blurb: "Penseur binaire avec deux cerveaux. Tu analyses les problèmes sous tous les angles.",
    tags: ["intellectuel", "sagesse"],
    image: "cerean.webp",
    hidden: {
      abilityMods: "+2 INT, +2 SAG, -2 DEX",
      languages: ["Basic", "Cerean"],
      skills: ["Connaissance (tout)", "Perception"],
      traits: ["Binary Processing", "Intuitive Initiative"]
    }
  },
  {
    id: 'ewok',
    name: "Ewok",
    points: +2,
    blurb: "Petit mais rusé. Tu survis grâce à l'ingéniosité et la communauté.",
    tags: ["primitif", "survie"],
    image: "ewok.png",
    hidden: {
      abilityMods: "+2 DEX, -2 FOR",
      languages: ["Ewokese"],
      skills: ["Survie", "Discrétion"],
      traits: ["Primitive", "Scent"]
    }
  },
  {
    id: 'gand',
    name: "Gand",
    points: 0,
    blurb: "Traqueur mystique. Tu dois gagner ton nom par tes actes.",
    tags: ["chasseur", "mystique"],
    image: "gand.jpg",
    hidden: {
      abilityMods: "-2 CHA",
      languages: ["Basic", "Gand"],
      skills: ["Survie", "Perception"],
      traits: ["Ammonia Breather", "Findsman Ceremonies"]
    }
  },
  {
    id: 'gungan',
    name: "Gungan",
    points: +2,
    blurb: "Amphibien de Naboo. Maladroit sur terre, gracieux dans l'eau.",
    tags: ["aquatique", "résistant"],
    image: "gungan.webp",
    hidden: {
      abilityMods: "+2 CON, -2 INT, -2 SAG",
      languages: ["Basic", "Gungan"],
      skills: ["Natation", "Endurance"],
      traits: ["Expert Swimmer", "Heightened Awareness"]
    }
  },
  {
    id: 'hutt',
    name: "Hutt",
    points: -6,
    blurb: "Seigneur du crime massif. Le pouvoir et la manipulation sont ton art.",
    tags: ["crime", "manipulation"],
    image: "hutt.png",
    hidden: {
      abilityMods: "+4 CON, -4 DEX",
      languages: ["Basic", "Huttese"],
      skills: ["Persuasion", "Tromperie"],
      traits: ["Force Resistance", "Influential"]
    }
  },
  {
    id: 'iktotchi',
    name: "Iktotchi",
    points: -2,
    blurb: "Télépathe cornu. Tes visions du futur te guident.",
    tags: ["prescience", "Force"],
    image: "iktotchi.webp",
    hidden: {
      abilityMods: "+2 SAG, -2 CHA",
      languages: ["Basic", "Iktotchese"],
      skills: ["Perception", "Use the Force"],
      traits: ["Precognition", "Telepathy"]
    }
  },
  {
    id: 'jawa',
    name: "Jawa",
    points: +4,
    blurb: "Petit récupérateur du désert. La technologie abandonnée est ton trésor.",
    tags: ["tech", "commerce"],
    image: "jawa.webp",
    hidden: {
      abilityMods: "+2 DEX, -2 FOR, -2 CHA",
      languages: ["Jawaese", "Basic (compris)"],
      skills: ["Mécanique", "Tromperie"],
      traits: ["Scavenger", "Darkvision"]
    }
  },
  {
    id: 'kaleesh',
    name: "Kaleesh",
    points: -2,
    blurb: "Guerrier masqué. L'honneur au combat définit ton existence.",
    tags: ["guerrier", "honneur"],
    image: "kaleesh.webp",
    hidden: {
      abilityMods: "+2 DEX, -2 INT",
      languages: ["Basic", "Kaleesh"],
      skills: ["Perception", "Survie"],
      traits: ["Darkvision", "Intimidating"]
    }
  },
  {
    id: 'mon_calamari',
    name: "Mon Calamari",
    points: 0,
    blurb: "Stratège aquatique. Tu construis des vaisseaux et planifies des victoires.",
    tags: ["tactique", "aquatique"],
    image: "mon_calamari.webp",
    hidden: {
      abilityMods: "+2 INT, -2 CON",
      languages: ["Basic", "Mon Calamarian"],
      skills: ["Connaissance (tactique)", "Mécanique"],
      traits: ["Expert Swimmer", "Low-Light Vision"]
    }
  },
  {
    id: 'nikto',
    name: "Nikto",
    points: +2,
    blurb: "Serviteur des Hutts depuis des millénaires. Résistant et adaptable.",
    tags: ["résistant", "serviteur"],
    image: "nikto.jpg",
    hidden: {
      abilityMods: "-2 INT, -2 CHA",
      languages: ["Basic", "Huttese", "Nikto"],
      skills: ["Survie", "Intimidation"],
      traits: ["Natural Armor", "Primitive"]
    }
  },
  {
    id: 'quarren',
    name: "Quarren",
    points: 0,
    blurb: "Habitant des profondeurs de Mon Cala. Pragmatique et méfiant.",
    tags: ["aquatique", "pragmatique"],
    image: "quarren.png",
    hidden: {
      abilityMods: "+2 CON, -2 SAG, -2 CHA",
      languages: ["Basic", "Quarrenese"],
      skills: ["Natation", "Perception"],
      traits: ["Expert Swimmer", "Darkvision", "Low-Light Vision"]
    }
  },

  // --- ESPÈCES ADDITIONNELLES ---
  {
    id: 'gran',
    name: "Gran",
    points: +1,
    blurb: "Pacifiste aux trois yeux. Communauté et harmonie avant tout.",
    tags: ["pacifiste", "communauté", "perception"],
    image: "gran.webp",
    hidden: {
      abilityMods: "+2 SAG, -2 FOR",
      languages: ["Basic", "Gran"],
      skills: ["Diplomatie", "Perception"],
      traits: ["Three-Eyed Vision", "Peaceful Nature"]
    }
  },
  {
    id: 'bith',
    name: "Bith",
    points: +1,
    blurb: "Musicien et scientifique. Sens aiguisés et intellect supérieur.",
    tags: ["intelligent", "musique", "science"],
    image: "bith.webp",
    hidden: {
      abilityMods: "+2 INT, -2 FOR",
      languages: ["Basic", "Bith"],
      skills: ["Connaissance", "Arts"],
      traits: ["Enhanced Senses", "Scientific Mind"]
    }
  },
  {
    id: 'rakata',
    name: "Rakata",
    points: -3,
    blurb: "Ancien conquérant de la galaxie. Puissance et cruauté légendaires.",
    tags: ["ancien", "Force", "conquérant"],
    image: "rakata.webp",
    hidden: {
      abilityMods: "+2 INT, +2 CHA, -2 SAG",
      languages: ["Basic", "Rakata"],
      skills: ["Force Use", "Intimidation"],
      traits: ["Force Sensitivity", "Ancient Knowledge", "Arrogant"]
    }
  },
];

// =============================================================================
// PROFESSIONS
// Designed for intrigue, espionage, and non-Jedi gameplay in the Old Republic era
// =============================================================================
const PROFESSIONS = [
  // --- INTELLIGENCE & ESPIONAGE ---
  {
    id: 'intel',
    name: "Agent de renseignement",
    points: -6,
    blurb: "Tu entres et tu sors sans laisser de trace. Tu sais qui ment — et pourquoi.",
    tags: ["infiltration", "réseau"],
    hidden: {
      talent: "Couverture",
      skills: ["Discrétion", "Tromperie", "Renseignement", "Perception"],
      abilityMods: "+1 INT, +1 SAG"
    }
  },
  {
    id: 'assassin',
    name: "Assassin",
    points: -8,
    blurb: "Un seul coup bien placé. Pas de témoins, pas de trace, pas de regrets.",
    tags: ["élimination", "furtif"],
    hidden: {
      talent: "Frappe mortelle",
      skills: ["Discrétion", "Mêlée", "Perception", "Acrobaties"],
      abilityMods: "+2 DEX"
    }
  },
  {
    id: 'infiltrator',
    name: "Infiltrateur",
    points: -6,
    blurb: "Tu deviens celui qu'on veut que tu sois. Ton vrai visage n'existe plus.",
    tags: ["imposture", "terrain"],
    hidden: {
      talent: "Identité de couverture",
      skills: ["Tromperie", "Discrétion", "Perception", "Persuasion"],
      abilityMods: "+1 CHA, +1 INT"
    }
  },
  {
    id: 'slicer',
    name: "Slicer",
    points: -5,
    blurb: "Les systèmes te parlent. Tu décryptes, tu t'infiltres, tu disparais.",
    tags: ["informatique", "HoloNet"],
    hidden: {
      talent: "Fantôme numérique",
      skills: ["Informatique", "Mécanique", "Renseignement", "Discrétion"],
      abilityMods: "+2 INT"
    }
  },

  // --- DIPLOMATIE & INTRIGUE ---
  {
    id: 'diplo',
    name: "Diplomate subalterne",
    points: -4,
    blurb: "Tu manœuvres entre egos, lois et menaces voilées.",
    tags: ["négociation", "protocole"],
    hidden: {
      talent: "Protocole",
      skills: ["Persuasion", "Bureaucratie", "Connaissance (social)", "Perception"],
      abilityMods: "+1 CHA, +1 SAG"
    }
  },
  {
    id: 'noble',
    name: "Noble mineur",
    points: -6,
    blurb: "Le sang et le nom ouvrent des portes. Les dettes et les scandales les ferment.",
    tags: ["lignée", "influence"],
    hidden: {
      talent: "Réputation",
      skills: ["Persuasion", "Connaissance (noblesse)", "Tromperie", "Intimidation"],
      abilityMods: "+2 CHA"
    }
  },
  {
    id: 'courtier',
    name: "Courtier",
    points: -5,
    blurb: "L'information, c'est du pouvoir. Tu vends les deux au plus offrant.",
    tags: ["information", "contacts"],
    hidden: {
      talent: "Réseau d'informateurs",
      skills: ["Renseignement", "Persuasion", "Perception", "Tromperie"],
      abilityMods: "+1 INT, +1 CHA"
    }
  },
  {
    id: 'provocateur',
    name: "Provocateur",
    points: -4,
    blurb: "Tu sèmes le doute, la discorde, le chaos contrôlé. Tes ennemis s'entredéchirent.",
    tags: ["manipulation", "subversion"],
    hidden: {
      talent: "Rumeur",
      skills: ["Tromperie", "Persuasion", "Intimidation", "Connaissance (social)"],
      abilityMods: "+2 CHA"
    }
  },

  // --- SUPPORT TECHNIQUE ---
  {
    id: 'arch',
    name: "Archiviste / Analyste",
    points: -2,
    blurb: "Tu transformes un détail oublié en levier stratégique.",
    tags: ["archives", "déduction"],
    hidden: {
      talent: "Accès archives",
      skills: ["Recherche", "Linguistique", "Connaissance (galactique)", "Connaissance (bureaucratie)"],
      abilityMods: "+2 INT"
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
      skills: ["Mécanique", "Informatique", "Systèmes", "Endurance"],
      abilityMods: "+1 INT, +1 CON"
    }
  },
  {
    id: 'medic',
    name: "Médecin de terrain",
    points: -4,
    blurb: "Dans le chaos, tu es la différence entre la mort et un jour de plus.",
    tags: ["médecine", "urgence"],
    hidden: {
      talent: "Chirurgie d'urgence",
      skills: ["Médecine", "Perception", "Endurance", "Connaissance (biologie)"],
      abilityMods: "+1 SAG, +1 INT"
    }
  },
  {
    id: 'improviser',
    name: "Bricoleur de génie",
    points: -3,
    blurb: "Deux fils, un condensateur et du ruban. Tu fais des miracles avec rien.",
    tags: ["improvisation", "gadgets"],
    hidden: {
      talent: "Récupération",
      skills: ["Mécanique", "Survie", "Informatique", "Perception"],
      abilityMods: "+2 INT"
    }
  },

  // --- COMBAT & TERRAIN ---
  {
    id: 'pilot',
    name: "Pilote d'escorte",
    points: -6,
    blurb: "Tu fais passer un chasseur entre deux tirs comme si c'était une routine.",
    tags: ["poursuite", "spatial"],
    hidden: {
      talent: "Instinct de vol",
      skills: ["Pilotage", "Perception", "Tactique", "Endurance"],
      abilityMods: "+1 DEX, +1 SAG"
    }
  },
  {
    id: 'gunner',
    name: "Artilleur",
    points: -4,
    blurb: "Une cible, un tir. Tu ne gaspilles pas de munitions.",
    tags: ["tir", "précision"],
    hidden: {
      talent: "Oeil de tireur",
      skills: ["Tir", "Perception", "Mécanique", "Tactique"],
      abilityMods: "+2 DEX"
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
      skills: ["Discrétion", "Mécanique", "Informatique", "Tromperie"],
      abilityMods: "+1 DEX, +1 INT"
    }
  },
  {
    id: 'commando',
    name: "Commando",
    points: -6,
    blurb: "Insertion, objectif, extraction. En équipe ou seul, tu fais le travail.",
    tags: ["combat", "tactique"],
    hidden: {
      talent: "Travail d'équipe",
      skills: ["Tir", "Discrétion", "Tactique", "Endurance"],
      abilityMods: "+1 FOR, +1 CON"
    }
  },
  {
    id: 'bounty',
    name: "Chasseur de primes",
    points: -6,
    blurb: "Tu traques, tu trouves, tu ramènes. Mort ou vif — selon le contrat.",
    tags: ["traque", "prime"],
    hidden: {
      talent: "Traque",
      skills: ["Survie", "Perception", "Intimidation", "Tir"],
      abilityMods: "+1 DEX, +1 SAG"
    }
  },
  {
    id: 'merc',
    name: "Mercenaire",
    points: -4,
    blurb: "Pas de drapeau, pas de camp. Juste les crédits et le prochain contrat.",
    tags: ["combat", "indépendant"],
    hidden: {
      talent: "Vétéran",
      skills: ["Tir", "Mêlée", "Tactique", "Survie"],
      abilityMods: "+1 FOR, +1 CON"
    }
  },
  {
    id: 'bodyguard',
    name: "Garde du corps",
    points: -4,
    blurb: "Entre la menace et le client, il y a toi. Et tu ne bouges pas.",
    tags: ["protection", "vigilance"],
    hidden: {
      talent: "Bouclier humain",
      skills: ["Perception", "Mêlée", "Intimidation", "Endurance"],
      abilityMods: "+1 CON, +1 SAG"
    }
  },

  // --- CRIME & UNDERWORLD ---
  {
    id: 'smuggler',
    name: "Contrebandier",
    points: -4,
    blurb: "Cargaison sensible, route dangereuse, douanes corrompues. Juste un mardi.",
    tags: ["contrebande", "pilotage"],
    hidden: {
      talent: "Compartiments secrets",
      skills: ["Pilotage", "Tromperie", "Négociation", "Discrétion"],
      abilityMods: "+1 DEX, +1 CHA"
    }
  },
  {
    id: 'thief',
    name: "Voleur professionnel",
    points: -5,
    blurb: "Ce qui est à toi peut être à moi. Question de timing et de doigts agiles.",
    tags: ["larcin", "infiltration"],
    hidden: {
      talent: "Doigts de fée",
      skills: ["Discrétion", "Acrobaties", "Perception", "Mécanique"],
      abilityMods: "+2 DEX"
    }
  },
  {
    id: 'enforcer',
    name: "Homme de main",
    points: -2,
    blurb: "Quand les mots ne suffisent plus, il reste les poings. Et tu parles bien.",
    tags: ["intimidation", "violence"],
    hidden: {
      talent: "Présence",
      skills: ["Intimidation", "Mêlée", "Perception", "Endurance"],
      abilityMods: "+2 FOR"
    }
  },
  {
    id: 'fixer',
    name: "Intermédiaire",
    points: -4,
    blurb: "Tu connais quelqu'un qui connaît quelqu'un. Les connexions, c'est ton métier.",
    tags: ["contacts", "deals"],
    hidden: {
      talent: "Réseau criminel",
      skills: ["Renseignement", "Négociation", "Tromperie", "Connaissance (pègre)"],
      abilityMods: "+1 INT, +1 CHA"
    }
  },

  // --- FORCE-ADJACENT (for those who want a taste) ---
  {
    id: 'exile',
    name: "Exilé sensible",
    points: -8,
    blurb: "La Force murmure, mais tu as appris à l'ignorer. Ou à t'en servir en secret.",
    tags: ["Force", "secret"],
    hidden: {
      talent: "Intuition",
      skills: ["Perception", "Discrétion", "Use the Force", "Tromperie"],
      abilityMods: "+1 SAG, +1 CHA"
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
//
// Inspired by SWSE Talents & Feats, adapted for narrative play
// =============================================================================
const TRAITS = [
  // ========================================
  // MENTAL / INTELLIGENCE
  // ========================================
  {
    id: 'analytique',
    name: "Esprit analytique",
    value: +3,
    desc: "Recoupements rapides, logique, déductions. Tu vois les patterns que d'autres ignorent.",
    tags: ["enquête", "mental"],
    incompatible: ["impulsif"],
    hidden: { abilityMods: "+2 INT" }
  },
  {
    id: 'tacticien',
    name: "Tacticien",
    value: +6,
    desc: "Tu analyses le terrain, anticipes les mouvements. En combat, tu places tes alliés avec précision.",
    tags: ["tactique", "combat"],
    incompatible: [],
    hidden: { abilityMods: "+2 INT" }
  },
  {
    id: 'memoire_eidetique',
    name: "Mémoire eidétique",
    value: +4,
    desc: "Tu n'oublies rien. Plans, visages, conversations — tout est archivé dans ta tête.",
    tags: ["mental", "archives"],
    incompatible: ["confusion"],
    hidden: { abilityMods: "+1 INT" }
  },
  {
    id: 'linguiste',
    name: "Linguiste galactique",
    value: +6,
    desc: "Tu déchiffres des écritures rares et accélères toute traduction. Les langues sont ton terrain de jeu.",
    tags: ["langues", "archives"],
    incompatible: [],
    hidden: { abilityMods: "+1 INT" }
  },
  {
    id: 'gearhead',
    name: "Technophile",
    value: +4,
    desc: "Les machines te parlent. Tu bidouilles, optimises, répares plus vite que les manuels le prévoient.",
    tags: ["technique", "mécanique"],
    incompatible: ["technophobe"]
  },
  {
    id: 'slicer_talent',
    name: "Ghost dans le système",
    value: +6,
    desc: "Les réseaux n'ont pas de secrets pour toi. Tu infiltres, extrais, disparais sans laisser de trace.",
    tags: ["informatique", "infiltration"],
    incompatible: []
  },

  // ========================================
  // SOCIAL / INFLUENCE
  // ========================================
  {
    id: 'reseau',
    name: "Réseau discret",
    value: +8,
    desc: "Trois contacts fiables : info, logistique, planque. Tu ne voyages jamais seul.",
    tags: ["intrigue", "contacts"],
    incompatible: ["surveillance"]
  },
  {
    id: 'manipulateur',
    name: "Manipulateur né",
    value: +6,
    desc: "Tu retournes les gens contre eux-mêmes. Tes ennemis s'entredéchirent sans savoir pourquoi.",
    tags: ["manipulation", "social"],
    incompatible: ["franc"]
  },
  {
    id: 'charisme',
    name: "Présence magnétique",
    value: +4,
    desc: "Quand tu parles, on t'écoute. Tu attires l'attention — pour le meilleur ou le pire.",
    tags: ["charisme", "leadership"],
    incompatible: ["effacement"],
    hidden: { abilityMods: "+2 CHA" }
  },
  {
    id: 'intimidant',
    name: "Regard de fer",
    value: +4,
    desc: "Un regard suffit. Les faibles reculent, les forts hésitent. Tu inspires la crainte.",
    tags: ["intimidation", "présence"],
    incompatible: [],
    hidden: { abilityMods: "+1 CHA" }
  },
  {
    id: 'silver_tongue',
    name: "Langue d'argent",
    value: +5,
    desc: "Les mots coulent, les doutes s'installent. Tu convaincs avant même qu'on réfléchisse.",
    tags: ["persuasion", "social"],
    incompatible: ["bègue"],
    hidden: { abilityMods: "+2 CHA" }
  },
  {
    id: 'empathique',
    name: "Empathie profonde",
    value: +3,
    desc: "Tu ressens les émotions des autres. Leurs mensonges te sautent aux yeux.",
    tags: ["perception", "social"],
    incompatible: ["sociopathe"],
    hidden: { abilityMods: "+2 SAG" }
  },
  {
    id: 'informateur',
    name: "Oreilles partout",
    value: +5,
    desc: "Tu sais toujours ce qui se dit. Les rumeurs te trouvent avant les autres.",
    tags: ["information", "réseau"],
    incompatible: []
  },

  // ========================================
  // COMBAT / PHYSIQUE
  // ========================================
  {
    id: 'pilotage',
    name: "As du pilotage",
    value: +10,
    desc: "Poursuites spatiales, manœuvres risquées, évasion. Aux commandes, tu es imbattable.",
    tags: ["spatial", "pilotage"],
    incompatible: ["phobie_espace"],
    hidden: { abilityMods: "+2 DEX" }
  },
  {
    id: 'as_du_tir',
    name: "As du tir",
    value: +8,
    desc: "Un tir, une cible. Précision et sang-froid sous pression, même dans le chaos.",
    tags: ["combat", "précision"],
    incompatible: ["aveugle"],
    hidden: { abilityMods: "+2 DEX" }
  },
  {
    id: 'martial_artist',
    name: "Arts martiaux",
    value: +6,
    desc: "Ton corps est une arme. Sans blaster, tu restes mortel.",
    tags: ["mêlée", "discipline"],
    incompatible: ["fragile"],
    hidden: { abilityMods: "+1 FOR, +1 DEX" }
  },
  {
    id: 'duelist',
    name: "Duelliste",
    value: +6,
    desc: "En combat singulier, tu excelles. Chaque parade, chaque feinte est calculée.",
    tags: ["mêlée", "duel"],
    incompatible: []
  },
  {
    id: 'endurance',
    name: "Endurance exceptionnelle",
    value: +4,
    desc: "Tu continues quand les autres s'effondrent. La douleur est un signal, pas un ordre.",
    tags: ["physique", "survie"],
    incompatible: ["fragile"],
    hidden: { abilityMods: "+2 CON" }
  },
  {
    id: 'acrobate',
    name: "Acrobate",
    value: +4,
    desc: "Sauts, roulades, escalade — ton corps obéit sans hésitation.",
    tags: ["agilité", "infiltration"],
    incompatible: ["lourd"],
    hidden: { abilityMods: "+2 DEX" }
  },
  {
    id: 'tireur_embusque',
    name: "Tireur d'élite",
    value: +6,
    desc: "À longue portée, tu es invisible et mortel. Une balle, un message.",
    tags: ["précision", "furtif"],
    incompatible: []
  },
  {
    id: 'reflexes',
    name: "Réflexes fulgurants",
    value: +5,
    desc: "Tu réagis avant de penser. Dans une embuscade, tu tires en premier.",
    tags: ["combat", "initiative"],
    incompatible: ["lent"],
    hidden: { abilityMods: "+2 DEX" }
  },
  {
    id: 'bagarreur',
    name: "Bagarreur de cantina",
    value: +3,
    desc: "Les règles, c'est pour les autres. Tu mords, tu frappes, tu survis.",
    tags: ["mêlée", "sale"],
    incompatible: [],
    hidden: { abilityMods: "+1 FOR" }
  },

  // ========================================
  // FURTIVITÉ / INFILTRATION
  // ========================================
  {
    id: 'ombre',
    name: "Ombre vivante",
    value: +6,
    desc: "Tu te fonds dans l'environnement. Même les capteurs ont du mal à te trouver.",
    tags: ["furtif", "infiltration"],
    incompatible: ["voyant"]
  },
  {
    id: 'imposteur',
    name: "Imposteur parfait",
    value: +6,
    desc: "Tu deviens quelqu'un d'autre. Voix, posture, habitudes — tout y passe.",
    tags: ["imposture", "infiltration"],
    incompatible: ["connu"]
  },
  {
    id: 'pickpocket',
    name: "Doigts agiles",
    value: +3,
    desc: "Ce qui est dans ta poche était dans la leur. Ils n'ont rien vu.",
    tags: ["larcin", "discrétion"],
    incompatible: []
  },
  {
    id: 'evasion',
    name: "Maître de l'évasion",
    value: +4,
    desc: "Menottes, cellules, pièges — rien ne te retient longtemps.",
    tags: ["évasion", "survie"],
    incompatible: []
  },

  // ========================================
  // SURVIE / TERRAIN
  // ========================================
  {
    id: 'survivant',
    name: "Survivant",
    value: +4,
    desc: "Tu as survécu à pire. Le désert, le vide, la jungle — rien ne te surprend.",
    tags: ["survie", "terrain"],
    incompatible: [],
    hidden: { abilityMods: "+1 CON" }
  },
  {
    id: 'pisteur',
    name: "Pisteur",
    value: +4,
    desc: "Tu lis les traces comme d'autres lisent un datapad. Ta proie ne t'échappe pas.",
    tags: ["traque", "perception"],
    incompatible: [],
    hidden: { abilityMods: "+1 SAG" }
  },
  {
    id: 'premier_secours',
    name: "Premiers secours",
    value: +3,
    desc: "Tu stabilises, tu sutures, tu sauves. Pas besoin d'hôpital quand tu es là.",
    tags: ["médecine", "terrain"],
    incompatible: []
  },
  {
    id: 'frugal',
    name: "Frugal",
    value: +2,
    desc: "Peu de ressources, beaucoup de résultats. Tu fais durer ce que d'autres gaspillent.",
    tags: ["survie", "économe"],
    incompatible: ["extravagant"]
  },

  // ========================================
  // CHANCE / DESTIN
  // ========================================
  {
    id: 'chance',
    name: "Bonne étoile",
    value: +4,
    desc: "La chance te sourit. Les coups partent à côté, les portes s'ouvrent au bon moment.",
    tags: ["chance", "destin"],
    incompatible: ["malchance"]
  },
  {
    id: 'bad_feeling',
    name: "Mauvais pressentiment",
    value: +3,
    desc: "Tu sens les ennuis arriver. Une intuition qui t'a sauvé plus d'une fois.",
    tags: ["intuition", "survie"],
    incompatible: []
  },

  // ========================================
  // FORCE-ADJACENT
  // ========================================
  {
    id: 'sensible',
    name: "Sensible à la Force",
    value: +8,
    desc: "La Force murmure en toi. Des intuitions, des pressentiments — rien de spectaculaire, mais assez.",
    tags: ["Force", "potentiel"],
    incompatible: ["vide_force"],
    hidden: { abilityMods: "+1 SAG" }
  },
  {
    id: 'instinct_force',
    name: "Instinct de la Force",
    value: +4,
    desc: "Sans formation, tu ressens les émotions fortes, les dangers imminents, les mensonges.",
    tags: ["Force", "perception"],
    incompatible: ["vide_force"]
  },

  // ========================================
  // DRAWBACKS (value < 0 = grants points)
  // ========================================
  
  // --- Mental ---
  {
    id: 'impulsif',
    name: "Impulsif",
    value: -4,
    desc: "Tu décides trop vite. Quand il faut temporiser, tu fonces.",
    tags: ["caractère", "défaut"],
    incompatible: ["analytique"],
    hidden: { abilityMods: "-2 SAG" }
  },
  {
    id: 'confusion',
    name: "Mémoire fragmentée",
    value: -4,
    desc: "Des trous, des flashs. Tu oublies parfois des choses importantes.",
    tags: ["mental", "défaut"],
    incompatible: ["memoire_eidetique"],
    hidden: { abilityMods: "-1 INT" }
  },
  {
    id: 'technophobe',
    name: "Technophobe",
    value: -4,
    desc: "Les machines te détestent. Ou c'est toi qui les détestes. Dans tous les cas, ça finit mal.",
    tags: ["technique", "défaut"],
    incompatible: ["gearhead", "slicer_talent"]
  },
  {
    id: 'naif',
    name: "Naïf",
    value: -3,
    desc: "Tu fais confiance trop facilement. On t'a déjà eu, et ça arrivera encore.",
    tags: ["social", "défaut"],
    incompatible: ["manipulateur"],
    hidden: { abilityMods: "-1 SAG" }
  },

  // --- Social ---
  {
    id: 'franc',
    name: "Trop franc",
    value: -3,
    desc: "Tu dis ce que tu penses. La diplomatie, c'est pour les lâches.",
    tags: ["social", "défaut"],
    incompatible: ["manipulateur", "silver_tongue"]
  },
  {
    id: 'effacement',
    name: "Effacé",
    value: -2,
    desc: "On t'oublie facilement. Dans une foule, tu disparais — même quand tu ne veux pas.",
    tags: ["social", "défaut"],
    incompatible: ["charisme"],
    hidden: { abilityMods: "-2 CHA" }
  },
  {
    id: 'sociopathe',
    name: "Détaché",
    value: -4,
    desc: "Les émotions des autres te laissent froid. Ça se voit, et ça dérange.",
    tags: ["psy", "défaut"],
    incompatible: ["empathique"],
    hidden: { abilityMods: "-2 CHA" }
  },
  {
    id: 'bègue',
    name: "Bègue",
    value: -3,
    desc: "Sous pression, les mots se bloquent. Pas idéal pour négocier.",
    tags: ["communication", "défaut"],
    incompatible: ["silver_tongue"]
  },
  {
    id: 'surveillance',
    name: "Sous surveillance",
    value: -6,
    desc: "Contrôles, audits, informateurs. Tu laisses des traces, et quelqu'un les suit.",
    tags: ["intrigue", "défaut"],
    incompatible: ["reseau"]
  },
  {
    id: 'connu',
    name: "Visage connu",
    value: -4,
    desc: "Trop de gens te reconnaissent. L'anonymat, c'est fini pour toi.",
    tags: ["notoriété", "défaut"],
    incompatible: ["imposteur"]
  },

  // --- Combat / Physique ---
  {
    id: 'fragile',
    name: "Constitution fragile",
    value: -4,
    desc: "Tu encaisses mal. Une blessure légère te cloue au sol.",
    tags: ["physique", "défaut"],
    incompatible: ["endurance", "martial_artist"],
    hidden: { abilityMods: "-2 CON" }
  },
  {
    id: 'lourd',
    name: "Lourdaud",
    value: -3,
    desc: "L'agilité, ce n'est pas ton truc. Tu fais du bruit, tu renverses des trucs.",
    tags: ["physique", "défaut"],
    incompatible: ["acrobate"],
    hidden: { abilityMods: "-2 DEX" }
  },
  {
    id: 'lent',
    name: "Réflexes lents",
    value: -4,
    desc: "Tu réagis après les autres. Dans une embuscade, tu es toujours surpris.",
    tags: ["combat", "défaut"],
    incompatible: ["reflexes"],
    hidden: { abilityMods: "-2 DEX" }
  },
  {
    id: 'aveugle',
    name: "Aveugle",
    value: -8,
    desc: "Tu ne vois pas. Assistance techno ou allié requis pour compenser.",
    tags: ["handicap", "majeur"],
    incompatible: ["as_du_tir", "tireur_embusque"]
  },

  // --- Phobies / Traumas ---
  {
    id: 'trauma',
    name: "Traumatisé par la guerre",
    value: -6,
    desc: "Le chaos réveille des souvenirs. Panique, gel ou colère — selon la scène.",
    tags: ["psy", "trauma"],
    incompatible: []
  },
  {
    id: 'phobie_espace',
    name: "Phobie de l'espace",
    value: -6,
    desc: "Le vide, l'EVA, la dérive. Tu perds tes moyens face à l'infini noir.",
    tags: ["spatial", "phobie"],
    incompatible: ["pilotage"]
  },
  {
    id: 'claustrophobe',
    name: "Claustrophobe",
    value: -4,
    desc: "Les espaces clos te paralysent. Conduits, cellules, cockpits étroits — cauchemar.",
    tags: ["phobie", "défaut"],
    incompatible: []
  },
  {
    id: 'pyrophobe',
    name: "Pyrophobe",
    value: -3,
    desc: "Le feu te terrorise. Même une bougie te met mal à l'aise.",
    tags: ["phobie", "défaut"],
    incompatible: []
  },

  // --- Réputation / Social ---
  {
    id: 'recherche',
    name: "Recherché",
    value: -6,
    desc: "Quelqu'un veut ta tête. Prime, vengeance, ou justice — tu ne sais pas toujours.",
    tags: ["criminel", "défaut"],
    incompatible: []
  },
  {
    id: 'dette',
    name: "Endetté jusqu'au cou",
    value: -4,
    desc: "Tu dois des crédits. Beaucoup. Et tes créanciers ne sont pas patients.",
    tags: ["argent", "défaut"],
    incompatible: []
  },
  {
    id: 'parjure',
    name: "Parjure",
    value: -4,
    desc: "Tu as trahi quelqu'un d'important. Ils s'en souviennent, et toi aussi.",
    tags: ["réputation", "défaut"],
    incompatible: []
  },
  {
    id: 'voyant',
    name: "Voyant",
    value: -3,
    desc: "Tu ne sais pas passer inaperçu. Couleurs vives, attitude remarquable, voix forte.",
    tags: ["style", "défaut"],
    incompatible: ["ombre"]
  },
  {
    id: 'extravagant',
    name: "Extravagant",
    value: -3,
    desc: "Tu dépenses trop. Le confort, c'est non-négociable.",
    tags: ["argent", "défaut"],
    incompatible: ["frugal"]
  },

  // --- Addictions / Vices ---
  {
    id: 'addiction',
    name: "Dépendance",
    value: -5,
    desc: "Une substance, un jeu, un comportement. Tu as besoin de ta dose.",
    tags: ["vice", "défaut"],
    incompatible: []
  },
  {
    id: 'joueur',
    name: "Joueur compulsif",
    value: -4,
    desc: "Les dés, les cartes, les paris. Tu ne peux pas résister à un pari.",
    tags: ["vice", "argent"],
    incompatible: []
  },

  // --- Divers ---
  {
    id: 'malchance',
    name: "Poissard",
    value: -4,
    desc: "La malchance te colle. Les machines tombent en panne, les gens t'évitent.",
    tags: ["malchance", "défaut"],
    incompatible: ["chance"]
  },
  {
    id: 'secret',
    name: "Secret dangereux",
    value: -5,
    desc: "Tu sais quelque chose que tu ne devrais pas. Et quelqu'un le sait.",
    tags: ["intrigue", "défaut"],
    incompatible: []
  },
  {
    id: 'vide_force',
    name: "Vide dans la Force",
    value: -2,
    desc: "La Force ne te touche pas. Tu es invisible aux sensitifs — et ça les perturbe.",
    tags: ["Force", "spécial"],
    incompatible: ["sensible", "instinct_force"]
  },
];

// =============================================================================
// PLANETS (ORIGINE)
// Coordinates in percentage (0-100) for positioning on galaxy map
// Connections define hyperspace lanes between planets
// =============================================================================
const PLANETES = [
  // --- Core Worlds ---
  {
    id: 'coruscant',
    name: "Coruscant",
    region: "Mondes du Noyau",
    climat: "Tempéré (artificiel)",
    terrain: "Écuménopole planétaire",
    population: "~3 billions",
    desc: "Capitale de la République Galactique, Coruscant est une planète-cité entièrement recouverte d'immeubles titanesques. Centre politique et culturel de la galaxie, elle abrite le Sénat, le Temple Jedi, et d'innombrables niveaux souterrains où règnent crime et misère.",
    x: 48, y: 48,
    connections: ['alderaan', 'corellia', 'balmorra'],
    image: "https://static.wikia.nocookie.net/starwars/images/3/32/Coruscant_Promenade_-_FoD.png"
  },
  {
    id: 'alderaan',
    name: "Alderaan",
    region: "Mondes du Noyau",
    climat: "Tempéré",
    terrain: "Montagnes, plaines, forêts",
    population: "~2 milliards",
    desc: "Monde pacifique célèbre pour sa beauté naturelle et sa culture raffinée. Alderaan est un centre diplomatique majeur, connu pour son opposition aux armes et son engagement pour la paix. Ses montagnes enneigées et ses prairies verdoyantes en font un joyau des Mondes du Noyau.",
    x: 52, y: 42,
    connections: ['coruscant', 'corellia'],
    image: "https://static.wikia.nocookie.net/starwars/images/4/4a/Alderaan.jpg"
  },
  {
    id: 'corellia',
    name: "Corellia",
    region: "Mondes du Noyau",
    climat: "Tempéré",
    terrain: "Plaines, forêts, zones urbaines",
    population: "~3 milliards",
    desc: "Célèbre pour ses chantiers navals et ses pilotes légendaires, Corellia produit certains des meilleurs vaisseaux de la galaxie. Sa population indépendante et frondeuse a donné naissance à de nombreux contrebandiers et héros. Les Corelliens sont réputés pour leur esprit aventurier.",
    x: 44, y: 44,
    connections: ['coruscant', 'alderaan', 'nar_shaddaa'],
    image: "https://static.wikia.nocookie.net/starwars/images/d/d7/Corellia-SWCT.png"
  },
  // --- Colonies & Mid Rim ---
  {
    id: 'balmorra',
    name: "Balmorra",
    region: "Colonies",
    climat: "Tempéré à aride",
    terrain: "Montagnes, usines, terres stériles",
    population: "~700 millions",
    desc: "Monde industriel spécialisé dans la fabrication de droïdes de combat et d'armements. Balmorra a été ravagée par de nombreux conflits, laissant des cicatrices sur son paysage. Ses usines tournent jour et nuit pour alimenter les armées de la galaxie.",
    x: 55, y: 52,
    connections: ['coruscant', 'taris'],
    image: "https://static.wikia.nocookie.net/starwars/images/b/bb/BalmorraTBB.png"
  },
  {
    id: 'kashyyyk',
    name: "Kashyyyk",
    region: "Bordure Médiane",
    climat: "Tempéré tropical",
    terrain: "Forêts géantes, océans",
    population: "~56 millions",
    desc: "Monde natal des Wookies, recouvert d'arbres wroshyr gigantesques. Les Wookies vivent dans des cités arboricoles, tandis que les niveaux inférieurs de la forêt abritent des créatures dangereuses. Kashyyyk est un symbole de liberté et de résistance.",
    x: 40, y: 55,
    connections: ['corellia', 'nar_shaddaa'],
    image: "https://static.wikia.nocookie.net/starwars/images/e/ea/Kashyyyk-SW-MTHC.png"
  },
  // --- Hutt Space ---
  {
    id: 'nar_shaddaa',
    name: "Nar Shaddaa",
    region: "Espace Hutt",
    climat: "Pollué, artificiel",
    terrain: "Écuménopole lunaire",
    population: "~85 milliards",
    desc: "Surnommée la 'Lune des Contrebandiers', cette lune de Nal Hutta est un repaire de criminels, chasseurs de primes et opportunistes. Ses néons crasseux illuminent des rues où tout s'achète et se vend. Le crime organisé des Hutts y règne en maître.",
    x: 62, y: 50,
    connections: ['corellia', 'tatooine', 'quesh'],
    image: "https://static.wikia.nocookie.net/starwars/images/d/dc/NarShaddaa-2015StarWars8.png"
  },
  {
    id: 'quesh',
    name: "Quesh",
    region: "Espace Hutt",
    climat: "Toxique",
    terrain: "Marécages pollués, industrie",
    population: "~50 000",
    desc: "Monde empoisonné dont l'atmosphère toxique nécessite des masques respiratoires. Quesh est exploité pour ses composés chimiques rares utilisés dans la fabrication d'adrénalines de combat. Une guerre froide économique s'y déroule entre la République et les Hutts.",
    x: 68, y: 45,
    connections: ['nar_shaddaa', 'voss'],
    image: "https://static.wikia.nocookie.net/starwars/images/3/3b/Quesh_TOR_new.png"
  },
  // --- Outer Rim ---
  {
    id: 'tatooine',
    name: "Tatooine",
    region: "Bordure Extérieure",
    climat: "Aride, désertique",
    terrain: "Déserts, canyons, dunes",
    population: "~200 000",
    desc: "Monde désertique sous deux soleils, contrôlé par les Hutts. Tatooine est un refuge pour les hors-la-loi, contrebandiers et esclaves. Ses villes comme Mos Eisley sont des repaires de vilenie, tandis que les Tuskens et les Jawas parcourent ses étendues arides.",
    x: 72, y: 60,
    connections: ['nar_shaddaa', 'hoth'],
    image: "https://static.wikia.nocookie.net/starwars/images/b/b0/Tatooine_TPM.png"
  },
  {
    id: 'taris',
    name: "Taris",
    region: "Bordure Extérieure",
    climat: "Tempéré pollué",
    terrain: "Ruines urbaines, marécages",
    population: "~Quelques milliers",
    desc: "Autrefois une écuménopole prospère, Taris fut bombardée et laissée en ruines. Ses gratte-ciel effondrés et ses marécages toxiques témoignent de sa chute. La République tente de reconstruire, mais rakgoules et pillards rendent la tâche périlleuse.",
    x: 35, y: 35,
    connections: ['balmorra', 'ilum'],
    image: "https://static.wikia.nocookie.net/starwars/images/7/76/Taris-TFABG.jpg"
  },
  {
    id: 'hoth',
    name: "Hoth",
    region: "Bordure Extérieure",
    climat: "Glacial",
    terrain: "Plaines de glace, cavernes",
    population: "~Moins de 10",
    desc: "Monde gelé balayé par des blizzards mortels. Hoth n'abrite que des créatures résistantes au froid comme les tauntauns et les wampas. Son isolement en fait un lieu idéal pour des bases secrètes, loin des regards indiscrets.",
    x: 28, y: 62,
    connections: ['tatooine', 'mustafar'],
    image: "https://static.wikia.nocookie.net/starwars/images/a/a1/Hoth-2024SWHyperspace.png"
  },
  {
    id: 'mustafar',
    name: "Mustafar",
    region: "Bordure Extérieure",
    climat: "Volcanique, brûlant",
    terrain: "Mers de lave, volcans",
    population: "~20 000",
    desc: "Petite planète volcanique dont la surface est recouverte de rivières de lave. Autrefois un monde verdoyant, Mustafar fut transformée en enfer par des forces cosmiques. Elle attire ceux qui cherchent le pouvoir du côté obscur et les exploitants de minerais rares.",
    x: 22, y: 70,
    connections: ['hoth', 'belsavis'],
    image: "https://static.wikia.nocookie.net/starwars/images/6/61/Mustafar-TROSGG.png"
  },
  // --- Unknown Regions & Special ---
  {
    id: 'ilum',
    name: "Ilum",
    region: "Régions Inconnues",
    climat: "Glacial",
    terrain: "Glace, cavernes de cristal",
    population: "~5 000",
    desc: "Monde sacré pour les Jedi, source des cristaux Adegan utilisés dans les sabres laser. Ses cavernes de cristal sont un lieu d'épreuves pour les jeunes Padawans. L'Empire Sith convoite ses ressources, transformant ce sanctuaire en champ de bataille.",
    x: 25, y: 28,
    connections: ['taris', 'belsavis'],
    image: "https://static.wikia.nocookie.net/starwars/images/0/02/Jedi_Temple_Ilum.png"
  },
  {
    id: 'belsavis',
    name: "Belsavis",
    region: "Bordure Extérieure",
    climat: "Glacial / Tropical (failles)",
    terrain: "Glaciers, vallées volcaniques",
    population: "~Quelques milliers",
    desc: "Prison planétaire antique construite par les Rakatas. Sous sa surface glacée se cachent des vallées tropicales et des cryptes contenant les pires criminels de la galaxie. Des secrets millénaires y dorment, gardés par la République.",
    x: 18, y: 55,
    connections: ['ilum', 'mustafar'],
    image: "https://static.wikia.nocookie.net/starwars/images/2/2b/Belsavis-CLNE.png"
  },
  {
    id: 'voss',
    name: "Voss",
    region: "Bordure Extérieure",
    climat: "Tempéré",
    terrain: "Forêts, montagnes, plateaux",
    population: "~Inconnue",
    desc: "Monde mystique habité par les Voss, un peuple de mystiques doués de visions prophétiques, et les Gormaks, leurs ennemis héréditaires. Les deux factions galactiques courtisent les Voss pour leurs pouvoirs, mais ce peuple reste farouchement neutre.",
    x: 75, y: 35,
    connections: ['quesh', 'vaiken_spacedock'],
    image: "https://static.wikia.nocookie.net/starwars/images/5/5a/Voss_TOR.jpg"
  },
  // --- Stations spatiales ---
  {
    id: 'carrick_station',
    name: "Station Carrick",
    region: "Mondes du Noyau (orbite)",
    climat: "Artificiel",
    terrain: "Station spatiale",
    population: "~50 000",
    desc: "Quartier général de la Flotte de la République, cette station spatiale massive orbite dans les Mondes du Noyau. Point de ralliement pour les forces républicaines, elle abrite hangars, centres de commandement et zones commerciales. Nommée en l'honneur de Zayne Carrick.",
    x: 42, y: 38,
    connections: ['coruscant', 'taris', 'alderaan'],
    image: "https://static.wikia.nocookie.net/starwars/images/2/25/CarrickStation_Cropped.png"
  },
  {
    id: 'vaiken_spacedock',
    name: "Spatioport Vaiken",
    region: "Bordure Extérieure (orbite)",
    climat: "Artificiel",
    terrain: "Station spatiale",
    population: "~40 000",
    desc: "Principal port spatial de la Flotte Impériale Sith, nommé d'après le Grand Moff Odile Vaiken. Cette station colossale sert de point de départ pour les opérations militaires impériales. Le Conseil Noir s'y réunit parfois pour des affaires urgentes.",
    x: 78, y: 28,
    connections: ['voss', 'quesh'],
    image: "https://static.wikia.nocookie.net/starwars/images/7/77/VaikenSpacedock_Cropped.png"
  },
];

// =============================================================================
// PAGE CONFIGURATION
// =============================================================================
const PAGE_NAMES = [
  "Espèce",
  "Profession",
  "Traits",
  "Origine",
  "Morale",
  "Identité",
  "Dossier final"
];

// =============================================================================
// MORALE OPTIONS
// =============================================================================
const DOCTRINES = [
  { id: 'idealiste', name: 'Idéaliste', desc: 'Tu crois en une cause plus grande que toi.' },
  { id: 'patriote', name: 'Patriote', desc: 'Ta loyauté va à ton peuple ou ta nation.' },
  { id: 'pragmatique', name: 'Pragmatique', desc: 'Tu fais ce qui fonctionne, point.' },
  { id: 'opportuniste', name: 'Opportuniste', desc: 'Chaque situation a un avantage à saisir.' },
  { id: 'vengeur', name: 'Vengeur', desc: 'Quelqu\'un doit payer. Tu t\'en assures.' },
  { id: 'survivant', name: 'Survivant', desc: 'Rester en vie est la seule victoire.' },
  { id: 'fanatique', name: 'Fanatique', desc: 'Ta conviction ne tolère aucun doute.' },
  { id: 'professionnel', name: 'Professionnel', desc: 'C\'est un métier. Tu l\'exerces avec rigueur.' },
];

const METHODES = [
  { id: 'propre', name: 'Propre', desc: 'Preuves, procédures, légalité. Tu respectes les règles.', icon: '◇' },
  { id: 'grise', name: 'Grise', desc: 'Chantage, deals, zones floues. La fin justifie certains moyens.', icon: '◈' },
  { id: 'sale', name: 'Sale', desc: 'Menaces, dommages collatéraux. Tu fais le nécessaire.', icon: '◆' },
];

const LIGNES_ROUGES = [
  { id: 'torture', name: 'Torture', desc: 'Jamais de souffrance infligée délibérément.' },
  { id: 'civils', name: 'Dommages collatéraux', desc: 'Pas de victimes innocentes dans l\'équation.' },
  { id: 'trahison', name: 'Trahison d\'alliés', desc: 'On ne retourne pas sa veste.' },
  { id: 'assassinat', name: 'Assassinat politique', desc: 'Pas d\'élimination ciblée de leaders.' },
  { id: 'meurtre', name: 'Meurtre de sang-froid', desc: 'Pas d\'exécution sans nécessité.' },
  { id: 'enfants', name: 'Impliquer des enfants', desc: 'Les enfants ne sont jamais des outils.' },
  { id: 'genocide', name: 'Génocide', desc: 'Aucune extermination de masse.' },
  { id: 'esclavage', name: 'Esclavage', desc: 'Personne n\'est une propriété.' },
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
