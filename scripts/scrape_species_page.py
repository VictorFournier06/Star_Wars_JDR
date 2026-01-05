#!/usr/bin/env python3
"""
Scrape species images from the main SWSE Species page tables.
All images are in the IMAGE column of the species tables.

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    python scrape_species_page.py
"""

import json
import re
import time
from pathlib import Path
from urllib.parse import unquote

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Please install required packages:")
    print("  pip install requests beautifulsoup4 lxml")
    exit(1)

# Map our species IDs to the wiki species names (as they appear in the table)
SPECIES_MAPPING = {
    "Human": "humain",
    "Twi'lek": "twilek",
    "Zabrak": "zabrak",
    "Miraluka": "miraluka",
    "Chiss": "chiss",
    "Rattataki": "rattataki",
    "Cathar": "cathar",
    "Togruta": "togruta",
    "Mirialan": "mirialan",
    "Sith": "sith_pureblood",
    "Nautolan": "nautolan",
    "Rodian": "rodien",
    "Wookiee": "wookiee",
    "Trandoshan": "trandoshan",
    "Duros": "duros",
    "Bothan": "bothan",
    "Kel Dor": "keldor",
    "Devaronian": "devaronian",
    "Zeltron": "zeltron",
    "Echani": "echani",
    "Arkanian": "arkanian",
    "Gand": "gand",
    "Sullustan": "sullustan",
    "Iktotchi": "iktotchi",
    "Falleen": "falleen",
    "Selkath": "selkath",
    "Dathomiri": "dathomiri",
    "Dathomiri (Near-Human)": "dathomiri",
    "Mandalorian": "mandalorien",
    "Massassi": "massassi",
    "Jawa": "jawa",
    "Nikto": "nikto",
    "Weequay": "weequay",
    "Kaleesh": "kaleesh",
    "Anzati": "anzat",
    "Voss": "voss",
    # Additional common species we might find
    "Mon Calamari": "mon_calamari",
    "Ithorian": "ithorian",
    "Cerean": "cerean",
    "Gamorrean": "gamorrean",
    "Gungan": "gungan",
    "Quarren": "quarren",
    "Ewok": "ewok",
    "Hutt": "hutt",
}

SPECIES_URL = "https://swse.fandom.com/wiki/Species"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "species"
REQUEST_DELAY = 0.5


def get_soup(url: str) -> BeautifulSoup:
    """Fetch a page and return a BeautifulSoup object."""
    print(f"Fetching: {url}")
    response = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
    }, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "lxml")


def extract_species_name_from_link(cell) -> str | None:
    """Extract species name from a table cell containing a link."""
    link = cell.find("a")
    if link:
        return link.get_text(strip=True)
    return cell.get_text(strip=True)


def extract_image_url(cell) -> str | None:
    """Extract image URL from a table cell."""
    img = cell.find("img")
    if not img:
        return None
    
    # Try data-src first (lazy loading), then src
    src = img.get("data-src") or img.get("src")
    if not src:
        return None
    
    # Skip placeholder/icon images
    if "Homebrew" in src or "Warning" in src or "1x1" in src:
        return None
    
    # Get full resolution by removing scaling
    src = re.sub(r"/scale-to-width-down/\d+", "", src)
    # Keep revision for download but clean it up
    src = re.sub(r"/revision/latest/.*$", "/revision/latest", src)
    
    return src


def download_image(url: str, species_id: str) -> bool:
    """Download an image and save it."""
    try:
        print(f"  Downloading {species_id}...")
        response = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }, timeout=30)
        response.raise_for_status()
        
        # Determine extension from URL or content-type
        content_type = response.headers.get("Content-Type", "")
        if "png" in url.lower() or "png" in content_type:
            ext = ".png"
        elif "gif" in url.lower() or "gif" in content_type:
            ext = ".gif"
        elif "webp" in url.lower() or "webp" in content_type:
            ext = ".webp"
        else:
            ext = ".jpg"
        
        filepath = OUTPUT_DIR / f"{species_id}{ext}"
        
        with open(filepath, "wb") as f:
            f.write(response.content)
        
        print(f"    Saved: {filepath.name} ({len(response.content) // 1024} KB)")
        time.sleep(REQUEST_DELAY)
        return True
    except Exception as e:
        print(f"    Failed: {e}")
        return False


def main():
    print("=" * 60)
    print("Star Wars JDR - Species Image Scraper (from /Species page)")
    print("=" * 60)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Output folder: {OUTPUT_DIR}\n")
    
    # Fetch the Species page
    soup = get_soup(SPECIES_URL)
    
    # Find all tables on the page
    tables = soup.find_all("table")
    print(f"Found {len(tables)} tables\n")
    
    found_species = {}
    
    for table_idx, table in enumerate(tables):
        # Check if this table has the expected structure (SPECIES, ABILITY MODIFIERS, IMAGE)
        headers = table.find_all("th")
        header_texts = [h.get_text(strip=True).upper() for h in headers]
        
        if "SPECIES" not in header_texts or "IMAGE" not in header_texts:
            continue
        
        species_col = header_texts.index("SPECIES")
        image_col = header_texts.index("IMAGE")
        
        print(f"Table {table_idx}: Found species table with {len(table.find_all('tr'))} rows")
        
        # Process each row
        rows = table.find_all("tr")[1:]  # Skip header row
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) <= max(species_col, image_col):
                continue
            
            # Get species name
            species_name = extract_species_name_from_link(cells[species_col])
            if not species_name:
                continue
            
            # Check if this is a species we want
            species_id = SPECIES_MAPPING.get(species_name)
            if not species_id:
                # Try partial match
                for wiki_name, sid in SPECIES_MAPPING.items():
                    if wiki_name.lower() in species_name.lower() or species_name.lower() in wiki_name.lower():
                        species_id = sid
                        break
            
            if not species_id:
                continue
            
            # Get image URL
            img_url = extract_image_url(cells[image_col])
            if img_url and species_id not in found_species:
                found_species[species_id] = {
                    "name": species_name,
                    "url": img_url
                }
                print(f"  Found: {species_name} -> {species_id}")
    
    print(f"\nFound {len(found_species)} species images to download\n")
    
    # Download images
    success = 0
    skipped = 0
    failed = 0
    
    for species_id, data in found_species.items():
        # Check if already exists
        existing = list(OUTPUT_DIR.glob(f"{species_id}.*"))
        if existing:
            print(f"  {species_id}: Already exists, skipping")
            skipped += 1
            continue
        
        if download_image(data["url"], species_id):
            success += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"Results: {success} downloaded, {skipped} skipped, {failed} failed")
    print(f"Total images in folder: {len(list(OUTPUT_DIR.glob('*.*')))}")
    print("=" * 60)


if __name__ == "__main__":
    main()
