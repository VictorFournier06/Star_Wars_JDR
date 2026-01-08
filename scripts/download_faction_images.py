#!/usr/bin/env python3
"""
SWTOR Faction & Card Image Downloader

Downloads faction logos and card-relevant images by scraping Wookieepedia pages.
Images are saved to assets/factions/ and assets/cards/ folders.

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    python download_faction_images.py
"""

import os
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

# Base paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
FACTIONS_DIR = PROJECT_ROOT / "assets" / "factions"
CARDS_DIR = PROJECT_ROOT / "assets" / "cards"

# Ensure directories exist
FACTIONS_DIR.mkdir(parents=True, exist_ok=True)
CARDS_DIR.mkdir(parents=True, exist_ok=True)

# Base URL for Wookieepedia
BASE_URL = "https://starwars.fandom.com/wiki/"
REQUEST_DELAY = 0.8

# =============================================================================
# FACTION DATA - Maps faction ID to wiki page name
# =============================================================================
FACTION_PAGES = {
    # Superpowers
    'republic': 'Galactic_Republic/Legends',
    'empire': 'Sith_Empire_(Post%E2%80%93Great_Hyperspace_War)',
    
    # Spy Agencies  
    'sis': 'Strategic_Information_Service',
    'imperial_intel': 'Imperial_Intelligence_(Sith_Empire)',
    
    # Neutral Blocs
    'hutt': 'Hutt_Cartel/Legends',
    'chiss': 'Chiss_Ascendancy/Legends',
    'czerka': 'Czerka_Corporation',
    
    # Underworld
    'exchange': 'Exchange',
    'blacksun': 'Black_Sun/Legends',
    'bountyguild': 'Bounty_Hunters%27_Guild/Legends',
    'mandal': 'Mandalorian/Legends',
    
    # Proxy Theaters (Alderaan)
    'organa': 'House_of_Organa/Legends',
    'thul': 'House_Thul',
    'ulgo': 'House_Ulgo',
    
    # Force Orders
    'jedi': 'Jedi_Order/Legends',
    'sith': 'Order_of_the_Sith_Lords',
    
    # Secret Societies
    'revanites': 'Order_of_Revan',
    'starcabal': 'Star_Cabal',
    'genoharadan': 'GenoHaradan',
    'dreadmasters': 'Dread_Masters',
}

# =============================================================================
# CARD DATA - Maps card image name to wiki page name
# =============================================================================
CARD_PAGES = {
    'coruscant-lower': 'Coruscant/Legends',
    'nar-shaddaa': 'Nar_Shaddaa/Legends',
    'smuggler-ship': 'XS_stock_light_freighter',
    'imperial-agent': 'Imperial_Agent',
    'keeper': 'Keeper_(Imperial_Intelligence)',
    'hutt-cartel': 'Hutt_Cartel/Legends',
    'exchange': 'Exchange',
    'blacksun': 'Black_Sun/Legends',
    'bounty-hunter': 'Bounty_hunter/Legends',
    'genoharadan': 'GenoHaradan',
    'czerka': 'Czerka_Corporation',
    'alderaan': 'Alderaan/Legends',
    'mandalorians': 'Mandalorian/Legends',
    'coruscant-sack': 'Sacking_of_Coruscant',
    'chiss': 'Chiss/Legends',
    'revan': 'Revan/Legends',
    'starcabal': 'Star_Cabal',
    'dreadmasters': 'Dread_Masters',
    'korriban': 'Korriban',
    'tython': 'Tython/Legends',
}


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


def get_page_image(wiki_page: str) -> str | None:
    """
    Get the main image URL from a wiki page.
    Returns the image URL or None.
    """
    url = BASE_URL + wiki_page
    soup = get_soup(url)
    
    if not soup:
        return None
    
    image_url = None
    
    # --- Strategy 1: Look for infobox image (most reliable for faction pages) ---
    infobox = soup.find("aside", class_="portable-infobox")
    if infobox:
        img = infobox.find("img")
        if img:
            src = img.get("data-src") or img.get("src")
            if src and "static.wikia.nocookie.net" in src:
                # Get full resolution by removing scaling parameters
                image_url = re.sub(r"/scale-to-width-down/\d+", "", src)
                image_url = re.sub(r"/revision/latest.*$", "", image_url)
                print(f"    Found infobox image")
                return image_url
    
    # --- Strategy 2: Look for figure with image ---
    figure = soup.find("figure", class_="pi-image")
    if figure:
        img = figure.find("img")
        if img:
            src = img.get("data-src") or img.get("src")
            if src and "static.wikia.nocookie.net" in src:
                image_url = re.sub(r"/scale-to-width-down/\d+", "", src)
                image_url = re.sub(r"/revision/latest.*$", "", image_url)
                print(f"    Found figure image")
                return image_url
    
    # --- Strategy 3: Look in main content area ---
    content = soup.find("div", class_="mw-parser-output")
    if content:
        # Look for any floated image
        img_link = content.find("a", class_="image")
        if img_link:
            img = img_link.find("img")
            if img:
                src = img.get("data-src") or img.get("src")
                if src and "static.wikia.nocookie.net" in src:
                    image_url = re.sub(r"/scale-to-width-down/\d+", "", src)
                    image_url = re.sub(r"/revision/latest.*$", "", image_url)
                    print(f"    Found content image")
                    return image_url
    
    # --- Strategy 4: Look for any image on the page ---
    all_imgs = soup.find_all("img")
    for img in all_imgs:
        src = img.get("data-src") or img.get("src")
        if src and "static.wikia.nocookie.net" in src and "/images/" in src:
            # Skip tiny icons and UI elements
            if "scale-to-width-down/20" in src or "scale-to-width-down/16" in src:
                continue
            if "Icon" in src or "icon" in src:
                continue
            image_url = re.sub(r"/scale-to-width-down/\d+", "", src)
            image_url = re.sub(r"/revision/latest.*$", "", image_url)
            print(f"    Found fallback image")
            return image_url
    
    return None


def download_image(url: str, output_path: Path) -> bool:
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
        elif ".svg" in url.lower():
            ext = ".svg"
        else:
            ext = ".jpg"
        
        filepath = output_path.with_suffix(ext)
        
        with open(filepath, "wb") as f:
            f.write(response.content)
        
        print(f"  ✓ Saved: {filepath.name}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error downloading: {e}")
        return False


def download_faction_images():
    """Download all faction logos/emblems."""
    print("\n" + "=" * 60)
    print("DOWNLOADING FACTION IMAGES")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for faction_id, wiki_page in FACTION_PAGES.items():
        print(f"\n[{faction_id}]")
        output_path = FACTIONS_DIR / faction_id
        
        # Check if already downloaded
        existing = list(FACTIONS_DIR.glob(f"{faction_id}.*"))
        if existing:
            print(f"  Already exists: {existing[0].name}")
            success_count += 1
            continue
        
        image_url = get_page_image(wiki_page)
        if image_url and download_image(image_url, output_path):
            success_count += 1
        else:
            fail_count += 1
            print(f"  ⚠ Failed to get image")
    
    print(f"\n{'=' * 60}")
    print(f"Factions: {success_count} succeeded, {fail_count} failed")
    return success_count, fail_count


def download_card_images():
    """Download card-relevant images."""
    print("\n" + "=" * 60)
    print("DOWNLOADING CARD IMAGES")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for card_id, wiki_page in CARD_PAGES.items():
        print(f"\n[{card_id}]")
        output_path = CARDS_DIR / card_id
        
        # Check if already downloaded
        existing = list(CARDS_DIR.glob(f"{card_id}.*"))
        if existing:
            print(f"  Already exists: {existing[0].name}")
            success_count += 1
            continue
        
        image_url = get_page_image(wiki_page)
        if image_url and download_image(image_url, output_path):
            success_count += 1
        else:
            fail_count += 1
            print(f"  ⚠ Failed to get image")
    
    print(f"\n{'=' * 60}")
    print(f"Cards: {success_count} succeeded, {fail_count} failed")
    return success_count, fail_count


def main():
    """Main entry point."""
    print("SWTOR Faction & Card Image Downloader")
    print("=" * 60)
    print(f"Factions directory: {FACTIONS_DIR}")
    print(f"Cards directory: {CARDS_DIR}")
    
    faction_success, faction_fail = download_faction_images()
    card_success, card_fail = download_card_images()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Factions: {faction_success}/{len(FACTION_PAGES)} downloaded")
    print(f"Cards: {card_success}/{len(CARD_PAGES)} downloaded")
    print("\nDone! Check the assets/factions/ and assets/cards/ folders.")


if __name__ == "__main__":
    main()
