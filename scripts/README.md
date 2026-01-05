# SWSE Scraping Scripts

Scripts for scraping data and images from the SWSE (Star Wars Saga Edition) Fandom Wiki.

## Requirements

```bash
pip install requests beautifulsoup4 lxml
```

## Available Scripts

### `scrape_species.py`
Scrapes species data including ability modifiers, descriptions, traits, and optionally downloads images.

```bash
# Scrape all species data
python scrape_species.py

# Also download species images
python scrape_species.py --images

# Limit to first 10 species (for testing)
python scrape_species.py --limit 10 --images
```

Output: `species_data.json` with species data formatted for the character creator.

### `scrape_images.py`
Downloads all images from a specific wiki page.

```bash
# Download images from a category page
python scrape_images.py "https://swse.fandom.com/wiki/Category:Species"

# Download to a specific folder
python scrape_images.py "https://swse.fandom.com/wiki/Human" --output human_images
```

## Usage Tips

1. **Rate Limiting**: Scripts include delays to avoid overwhelming the wiki. Don't reduce these.

2. **Image Naming**: Species images should be placed in `assets/species/` with filenames matching the `id` in `data.js` (e.g., `humain.png`, `twilek.png`).

3. **Converting Data**: After scraping, you'll need to manually review and adapt the JSON data for your campaign's needs (translating to French, adjusting point values, etc.).

## Legal Note

Respect the wiki's terms of service. This data is for personal tabletop gaming use only. Star Wars content is © Lucasfilm/Disney.
