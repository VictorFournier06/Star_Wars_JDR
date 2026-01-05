#!/usr/bin/env python3
"""
Scrape species descriptions/lore from individual SWSE wiki pages.
This gets the full description text from each species' dedicated page.

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    python scrape_species_descriptions.py
"""

import json
import re
import time
from pathlib import Path
from urllib.parse import quote

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Please install required packages:")
    print("  pip install requests beautifulsoup4 lxml")
    exit(1)

# Species to scrape - maps species ID to wiki page name
SPECIES_PAGES = {
    "humain": "Human",
    "twilek": "Twi'lek",
    "zabrak": "Zabrak",
    "miraluka": "Miraluka",
    "chiss": "Chiss",
    "rattataki": "Rattataki",
    "cathar": "Cathar",
    "togruta": "Togruta",
    "mirialan": "Mirialan",
    "sith_pureblood": "Sith_(Species)",
    "nautolan": "Nautolan",
    "rodien": "Rodian",
    "wookiee": "Wookiee",
    "trandoshan": "Trandoshan",
    "duros": "Duros",
    "bothan": "Bothan",
    "keldor": "Kel_Dor",
    "devaronian": "Devaronian",
    "zeltron": "Zeltron",
    "echani": "Echani",
    "arkanian": "Arkanian",
    "gand": "Gand",
    "sullustain": "Sullustan",
    "iktotchi": "Iktotchi",
    "falleen": "Falleen",
    "selkath": "Selkath",
    "mandalorian_human": "Mandalorian",
    "pureblood_massassi": "Massassi",
    "jawa": "Jawa",
    "nikto": "Nikto",
    "weequay": "Weequay",
    "kaleesh": "Kaleesh",
    "gamorrean": "Gamorrean",
    "ithorian": "Ithorian",
    "gran": "Gran",
    "bith": "Bith",
    "rakata": "Rakata",
    # Additional from species list
    "cerean": "Cerean",
    "ewok": "Ewok",
    "gungan": "Gungan",
    "hutt": "Hutt",
    "mon_calamari": "Mon_Calamari",
    "quarren": "Quarren",
}

BASE_URL = "https://swse.fandom.com/wiki/"
OUTPUT_FILE = Path(__file__).parent.parent / "js" / "species_descriptions.json"
REQUEST_DELAY = 0.8


def get_soup(url: str) -> BeautifulSoup | None:
    """Fetch a page and return a BeautifulSoup object."""
    try:
        response = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }, timeout=30)
        response.raise_for_status()
        time.sleep(REQUEST_DELAY)
        return BeautifulSoup(response.text, "lxml")
    except Exception as e:
        print(f"    Error: {e}")
        return None


def get_species_description(wiki_page: str) -> str | None:
    """
    Get the description/lore text from a species wiki page.
    Returns the intro paragraphs before the first heading.
    """
    url = BASE_URL + quote(wiki_page, safe="()_")
    print(f"  Fetching: {url}")
    
    soup = get_soup(url)
    if not soup:
        return None
    
    # Find the main content area
    content = soup.find("div", class_="mw-parser-output")
    if not content:
        return None
    
    # Get paragraphs before the first heading (h2/h3)
    desc_parts = []
    for elem in content.children:
        # Stop at first heading
        if elem.name in ["h2", "h3"]:
            break
        # Skip non-paragraph elements
        if elem.name != "p":
            continue
        # Get text and clean it
        text = elem.get_text(strip=True)
        # Skip short lines (usually metadata like "Reference Book: ...")
        if text and len(text) > 30:
            # Skip reference book citations
            if text.startswith("Reference Book:") or text.startswith("See also:"):
                continue
            desc_parts.append(text)
    
    if desc_parts:
        description = " ".join(desc_parts)
        # Clean up multiple spaces
        description = re.sub(r'\s+', ' ', description)
        # Limit length for tooltips (around 600 chars is reasonable)
        if len(description) > 600:
            # Try to cut at a sentence boundary
            cut_point = description.rfind('.', 0, 600)
            if cut_point > 300:
                description = description[:cut_point + 1]
            else:
                description = description[:597] + "..."
        return description
    
    return None


def main():
    print("=" * 60)
    print("Star Wars JDR - Species Description Scraper")
    print("=" * 60)
    
    # Load existing descriptions if any
    existing = {}
    if OUTPUT_FILE.exists():
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
            print(f"Loaded {len(existing)} existing descriptions")
        except:
            pass
    
    descriptions = dict(existing)
    success = 0
    failed = 0
    skipped = 0
    
    for species_id, wiki_page in SPECIES_PAGES.items():
        print(f"\n[{species_id}]")
        
        # Skip if already have a good description
        if species_id in descriptions and len(descriptions[species_id]) > 50:
            print("  Already have description, skipping")
            skipped += 1
            continue
        
        desc = get_species_description(wiki_page)
        if desc:
            descriptions[species_id] = desc
            print(f"  Got: {desc[:60]}...")
            success += 1
        else:
            print("  No description found")
            failed += 1
    
    # Save descriptions
    print(f"\n\nSaving {len(descriptions)} descriptions to {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(descriptions, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Results: {success} new, {skipped} skipped, {failed} failed")
    print(f"Total descriptions: {len(descriptions)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
