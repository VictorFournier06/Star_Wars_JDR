# Star Wars JDR - Création de Personnage

Un outil interactif de création de personnages pour un jeu de rôle Star Wars, inspiré du système de traits de Project Zomboid.

## 🚀 Accès

Le site est hébergé sur GitHub Pages : [VictorFournier06.github.io/Star_Wars_JDR](https://VictorFournier06.github.io/Star_Wars_JDR)

## 📁 Structure du projet

```
Star_Wars_JDR/
├── index.html          # Page principale
├── css/
│   └── styles.css      # Styles (thème datapad)
├── js/
│   ├── data.js         # Données (espèces, professions, traits)
│   └── app.js          # Logique applicative
├── assets/
│   └── README.md       # Instructions pour les assets
└── README.md           # Ce fichier
```

## 🎮 Fonctionnalités

- **Choix d'espèce** avec bonus/malus de points
- **Choix de profession** avec compétences cachées
- **Système de traits** (avantages/désavantages) avec incompatibilités
- **Équilibrage par points** (total doit être ≥ 0)
- **Export en image PNG** du dossier final

## 🛠️ Personnalisation

### Ajouter du contenu

Modifiez `js/data.js` pour ajouter :
- Nouvelles espèces dans `SPECIES`
- Nouvelles professions dans `PROFESSIONS`  
- Nouveaux traits dans `TRAITS`

### Ajouter des assets visuels

1. Placez vos images dans le dossier `assets/`
2. Mettez à jour les variables CSS dans `css/styles.css`:

```css
:root {
  --bg-img: url('../assets/background.webp');
  --logo-img: url('../assets/logo.svg');
}
```

## 📋 Développement local

Ouvrez simplement `index.html` dans un navigateur, ou utilisez un serveur local:

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js
npx serve
```

## 📜 Licence

Projet personnel pour usage en jeu de rôle. Star Wars est une marque déposée de Lucasfilm Ltd.