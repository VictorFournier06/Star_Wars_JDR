#!/usr/bin/env python3
"""
Scrape detailed species lore from SWSE wiki and Wookieepedia pages.
Gets extensive descriptions including biology, society, and culture sections.

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

# Species to scrape - maps species ID to (swse_page, wookieepedia_page)
SPECIES_PAGES = {
    "humain": ("Human", "Human/Legends"),
    "twilek": ("Twi'lek", "Twi%27lek/Legends"),
    "zabrak": ("Zabrak", "Zabrak/Legends"),
    "miraluka": ("Miraluka", "Miraluka/Legends"),
    "chiss": ("Chiss", "Chiss/Legends"),
    "rattataki": ("Rattataki", "Rattataki"),
    "cathar": ("Cathar", "Cathar/Legends"),
    "togruta": ("Togruta", "Togruta/Legends"),
    "mirialan": ("Mirialan", "Mirialan/Legends"),
    "sith_pureblood": ("Sith_(Species)", "Sith_(species)/Legends"),
    "nautolan": ("Nautolan", "Nautolan/Legends"),
    "rodian": ("Rodian", "Rodian/Legends"),
    "wookiee": ("Wookiee", "Wookiee/Legends"),
    "trandoshan": ("Trandoshan", "Trandoshan/Legends"),
    "duros": ("Duros", "Duros/Legends"),
    "bothan": ("Bothan", "Bothan/Legends"),
    "keldor": ("Kel_Dor", "Kel_Dor/Legends"),
    "devaronian": ("Devaronian", "Devaronian/Legends"),
    "zeltron": ("Zeltron", "Zeltron/Legends"),
    "echani": ("Echani", "Echani/Legends"),
    "arkanian": ("Arkanian", "Arkanian/Legends"),
    "gand": ("Gand", "Gand/Legends"),
    "sullustan": ("Sullustan", "Sullustan/Legends"),
    "iktotchi": ("Iktotchi", "Iktotchi/Legends"),
    "falleen": ("Falleen", "Falleen/Legends"),
    "selkath": ("Selkath", "Selkath"),
    "mandalorian_human": ("Mandalorian", "Mandalorian/Legends"),
    "pureblood_massassi": ("Massassi", "Massassi/Legends"),
    "massassi": ("Massassi", "Massassi/Legends"),
    "jawa": ("Jawa", "Jawa/Legends"),
    "nikto": ("Nikto", "Nikto/Legends"),
    "weequay": ("Weequay", "Weequay/Legends"),
    "kaleesh": ("Kaleesh", "Kaleesh/Legends"),
    "gamorrean": ("Gamorrean", "Gamorrean/Legends"),
    "ithorian": ("Ithorian", "Ithorian/Legends"),
    "gran": ("Gran", "Gran/Legends"),
    "bith": ("Bith", "Bith/Legends"),
    "rakata": ("Rakata", "Rakata/Legends"),
    "cerean": ("Cerean", "Cerean/Legends"),
    "ewok": ("Ewok", "Ewok/Legends"),
    "gungan": ("Gungan", "Gungan/Legends"),
    "hutt": ("Hutt", "Hutt/Legends"),
    "mon_calamari": ("Mon_Calamari", "Mon_Calamari/Legends"),
    "quarren": ("Quarren", "Quarren/Legends"),
    "anzat": ("Anzat", "Anzat/Legends"),
    "droide": (None, "Droid/Legends"),
}

SWSE_BASE_URL = "https://swse.fandom.com/wiki/"
WOOKIEEPEDIA_BASE_URL = "https://starwars.fandom.com/wiki/"
OUTPUT_FILE = Path(__file__).parent.parent / "js" / "species_descriptions.json"
REQUEST_DELAY = 1.0

# Sections to include for extended lore
LORE_SECTIONS = [
    "Biology and appearance",
    "Biology and Appearance", 
    "Society and culture",
    "Society and Culture",
    "History",
    "Characteristics",
    "Culture",
    "Biology",
]

# Maximum characters for description (extended for detailed lore)
MAX_DESCRIPTION_LENGTH = 2000


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


def clean_text(text: str) -> str:
    """Clean scraped text."""
    # Remove citation brackets like [1], [2]
    text = re.sub(r'\[\d+\]', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def get_section_content(soup: BeautifulSoup, section_name: str) -> str:
    """Get content from a specific section by heading."""
    content = soup.find("div", class_="mw-parser-output")
    if not content:
        return ""
    
    paragraphs = []
    in_section = False
    
    for elem in content.children:
        # Check if this is our target heading
        if elem.name in ["h2", "h3"]:
            heading_text = elem.get_text(strip=True)
            if section_name.lower() in heading_text.lower():
                in_section = True
                continue
            elif in_section:
                # We've reached the next heading, stop
                break
        
        if in_section and elem.name == "p":
            text = clean_text(elem.get_text())
            if text and len(text) > 20:
                paragraphs.append(text)
    
    return " ".join(paragraphs)


def get_intro_paragraphs(soup: BeautifulSoup, max_chars: int = 800) -> str:
    """Get intro paragraphs before first heading."""
    content = soup.find("div", class_="mw-parser-output")
    if not content:
        return ""
    
    paragraphs = []
    total_chars = 0
    
    for elem in content.children:
        if elem.name in ["h2", "h3"]:
            break
        if elem.name != "p":
            continue
        
        text = clean_text(elem.get_text())
        if not text or len(text) < 30:
            continue
        # Skip metadata
        if text.startswith("Reference Book:") or text.startswith("See also:"):
            continue
            
        paragraphs.append(text)
        total_chars += len(text)
        
        if total_chars >= max_chars:
            break
    
    return " ".join(paragraphs)


def get_species_description_wookieepedia(wiki_page: str) -> str | None:
    """
    Get detailed lore from Wookieepedia.
    Includes intro + biology + society sections.
    """
    url = WOOKIEEPEDIA_BASE_URL + wiki_page
    print(f"  Fetching Wookieepedia: {url}")
    
    soup = get_soup(url)
    if not soup:
        return None
    
    parts = []
    
    # Get intro
    intro = get_intro_paragraphs(soup, max_chars=800)
    if intro:
        parts.append(intro)
    
    # Get additional sections
    for section in LORE_SECTIONS:
        section_text = get_section_content(soup, section)
        if section_text:
            # Take first 400 chars from each section
            if len(section_text) > 400:
                cut = section_text.rfind('.', 0, 400)
                if cut > 200:
                    section_text = section_text[:cut + 1]
                else:
                    section_text = section_text[:400] + "..."
            parts.append(section_text)
    
    if parts:
        description = " ".join(parts)
        description = clean_text(description)
        
        # Enforce max length
        if len(description) > MAX_DESCRIPTION_LENGTH:
            cut = description.rfind('.', 0, MAX_DESCRIPTION_LENGTH)
            if cut > MAX_DESCRIPTION_LENGTH // 2:
                description = description[:cut + 1]
            else:
                description = description[:MAX_DESCRIPTION_LENGTH - 3] + "..."
        
        return description
    
    return None


def get_species_description_swse(wiki_page: str) -> str | None:
    """
    Get description from SWSE wiki (usually shorter but game-relevant).
    """
    url = SWSE_BASE_URL + quote(wiki_page, safe="()_")
    print(f"  Fetching SWSE: {url}")
    
    soup = get_soup(url)
    if not soup:
        return None
    
    intro = get_intro_paragraphs(soup, max_chars=600)
    return intro if intro else None


def main():
    print("=" * 60)
    print("Star Wars JDR - Extended Species Lore Scraper")
    print("=" * 60)
    print(f"Max description length: {MAX_DESCRIPTION_LENGTH} chars")
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)
    
    # Load existing descriptions
    existing = {}
    if OUTPUT_FILE.exists():
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
            print(f"Loaded {len(existing)} existing descriptions")
        except:
            pass
    
    # Start fresh for extended lore
    descriptions = {}
    success = 0
    failed = 0
    
    for species_id, (swse_page, wookieepedia_page) in SPECIES_PAGES.items():
        print(f"\n[{species_id}]")
        
        desc = None
        
        # Try Wookieepedia first for detailed lore
        if wookieepedia_page:
            desc = get_species_description_wookieepedia(wookieepedia_page)
        
        # Fallback to SWSE if Wookieepedia failed
        if not desc and swse_page:
            desc = get_species_description_swse(swse_page)
        
        # Use existing if scraping failed
        if not desc and species_id in existing:
            desc = existing[species_id]
            print(f"  Using existing: {desc[:50]}...")
        
        if desc:
            descriptions[species_id] = desc
            print(f"  ✓ Got {len(desc)} chars")
            success += 1
        else:
            print("  ✗ No description found")
            failed += 1
    
    # Save descriptions
    print(f"\n\nSaving {len(descriptions)} descriptions to {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(descriptions, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Results: {success} success, {failed} failed")
    print(f"Total descriptions: {len(descriptions)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
