#!/usr/bin/env python3
"""
Download species images and descriptions for Star Wars JDR Character Creator.
Fetches data from SWSE Fandom Wiki for each species.

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    python download_species_images.py
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

# Species to download - maps to wiki page names
SPECIES_LIST = [
    ("humain", "Human"),
    ("twilek", "Twi'lek"),
    ("zabrak", "Zabrak"),
    ("miraluka", "Miraluka"),
    ("chiss", "Chiss"),
    ("rattataki", "Rattataki"),
    ("cathar", "Cathar"),
    ("togruta", "Togruta"),
    ("mirialan", "Mirialan"),
    ("sith_pureblood", "Sith_(Species)"),
    ("nautolan", "Nautolan"),
    ("rodien", "Rodian"),
    ("wookiee", "Wookiee"),
    ("trandoshan", "Trandoshan"),
    ("duros", "Duros"),
    ("bothan", "Bothan"),
    ("keldor", "Kel_Dor"),
    ("devaronian", "Devaronian"),
    ("zeltron", "Zeltron"),
    ("echani", "Echani"),
    ("arkanian", "Arkanian"),
    ("gand", "Gand"),
    ("sullustan", "Sullustan"),
    ("iktotchi", "Iktotchi"),
    ("falleen", "Falleen"),
    ("selkath", "Selkath"),
    ("dathomiri", "Dathomiri_(Near-Human)"),
    ("mandalorien", "Mandalorian"),
    ("massassi", "Massassi"),
    ("jawa", "Jawa"),
    ("nikto", "Nikto"),
    ("weequay", "Weequay"),
    ("kaleesh", "Kaleesh"),
    ("anzat", "Anzati"),
    ("voss", "Voss")
]

BASE_URL = "https://swse.fandom.com/wiki/"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "species"
DESCRIPTIONS_FILE = Path(__file__).parent.parent / "js" / "species_descriptions.json"
REQUEST_DELAY = 0.8


def get_soup(url: str) -> BeautifulSoup | None:
    """Fetch a page and return a BeautifulSoup object."""
    print(f"  Fetching: {url}")
    try:
        response = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }, timeout=30)
        response.raise_for_status()
        time.sleep(REQUEST_DELAY)
        return BeautifulSoup(response.text, "lxml")
    except Exception as e:
        print(f"    Error fetching page: {e}")
        return None


def get_species_data(wiki_page: str) -> tuple[str | None, str | None]:
    """
    Get the image URL and description from a species wiki page.
    Returns (image_url, description) tuple.
    """
    url = BASE_URL + quote(wiki_page, safe="()_")
    soup = get_soup(url)
    
    if not soup:
        return None, None
    
    image_url = None
    description = None
    
    # Find the main content area
    content = soup.find("div", class_="mw-parser-output")
    if not content:
        return None, None
    
    # --- Get Image ---
    # Look for the floated image at the start (common in SWSE wiki)
    # Format: <a class="image image-thumbnail" href="..."><img src="..."></a>
    img_link = content.find("a", class_="image")
    if img_link:
        img = img_link.find("img")
        if img:
            # Try data-src first (lazy loaded), then src
            src = img.get("data-src") or img.get("src")
            if src and "static.wikia.nocookie.net" in src:
                # Get full resolution by removing scaling parameters
                image_url = re.sub(r"/scale-to-width-down/\d+", "", src)
                image_url = re.sub(r"/revision/latest.*$", "", image_url)
    
    # Fallback: look for any image in an aside (infobox)
    if not image_url:
        infobox = soup.find("aside", class_="portable-infobox")
        if infobox:
            img = infobox.find("img")
            if img:
                src = img.get("data-src") or img.get("src")
                if src:
                    image_url = re.sub(r"/scale-to-width-down/\d+", "", src)
                    image_url = re.sub(r"/revision/latest.*$", "", image_url)
    
    # --- Get Description ---
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
        if text and len(text) > 20:  # Skip short metadata lines
            desc_parts.append(text)
    
    if desc_parts:
        description = " ".join(desc_parts)
        # Limit length
        if len(description) > 800:
            description = description[:797] + "..."
    
    return image_url, description


def download_image(url: str, filename: str) -> bool:
    """Download an image and save it."""
    if not url:
        return False
        
    try:
        print(f"  Downloading image...")
        # Add revision/latest back for download
        download_url = url + "/revision/latest"
        
        response = requests.get(download_url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }, timeout=30)
        response.raise_for_status()
        
        # Determine extension from URL
        if ".png" in url.lower():
            ext = ".png"
        elif ".gif" in url.lower():
            ext = ".gif"
        elif ".webp" in url.lower():
            ext = ".webp"
        else:
            ext = ".jpg"
        
        filepath = OUTPUT_DIR / f"{filename}{ext}"
        
        with open(filepath, "wb") as f:
            f.write(response.content)
            
        print(f"    Saved: {filepath.name} ({len(response.content) // 1024} KB)")
        return True
    except Exception as e:
        print(f"    Download failed: {e}")
        return False


def main():
    """Download all species images and descriptions."""
    print("=" * 60)
    print("Star Wars JDR - Species Data Downloader")
    print("=" * 60)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nOutput folder: {OUTPUT_DIR}")
    
    img_success = 0
    img_failed = 0
    descriptions = {}
    
    for species_id, wiki_page in SPECIES_LIST:
        print(f"\n[{species_id}] -> {wiki_page}")
        
        # Check if image already exists
        existing_img = None
        for ext in [".png", ".jpg", ".gif", ".webp"]:
            if (OUTPUT_DIR / f"{species_id}{ext}").exists():
                existing_img = ext
                break
        
        if existing_img:
            print(f"  Image already exists ({species_id}{existing_img})")
            img_success += 1
            # Still get description
            _, description = get_species_data(wiki_page)
            if description:
                descriptions[species_id] = description
                print(f"  Description: {description[:80]}...")
            continue
        
        # Get image URL and description
        img_url, description = get_species_data(wiki_page)
        
        if description:
            descriptions[species_id] = description
            print(f"  Description: {description[:80]}...")
        else:
            print("  No description found")
        
        if img_url:
            print(f"  Image URL: {img_url[:60]}...")
            if download_image(img_url, species_id):
                img_success += 1
            else:
                img_failed += 1
        else:
            print("  No image found on wiki page")
            img_failed += 1
    
    # Save descriptions to JSON
    print(f"\n\nSaving {len(descriptions)} descriptions to {DESCRIPTIONS_FILE}")
    with open(DESCRIPTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(descriptions, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Images: {img_success} downloaded, {img_failed} failed")
    print(f"Descriptions: {len(descriptions)} saved")
    print("=" * 60)


if __name__ == "__main__":
    main()
