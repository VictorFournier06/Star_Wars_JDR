#!/usr/bin/env python3
"""
SWSE Species Scraper
Scrapes species data from the SWSE Fandom Wiki for the Star Wars JDR character creator.

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    python scrape_species.py
    python scrape_species.py --images  # Also download species images
"""

import os
import re
import json
import time
import argparse
from pathlib import Path
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Please install required packages:")
    print("  pip install requests beautifulsoup4 lxml")
    exit(1)


BASE_URL = "https://swse.fandom.com"
SPECIES_LIST_URL = f"{BASE_URL}/wiki/Species"
SPECIES_CATEGORY_URL = f"{BASE_URL}/wiki/Category:Species"

OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "species"
DATA_OUTPUT = Path(__file__).parent / "species_data.json"

# Rate limiting
REQUEST_DELAY = 0.5  # seconds between requests


def get_soup(url: str) -> BeautifulSoup:
    """Fetch a page and return a BeautifulSoup object."""
    print(f"  Fetching: {url}")
    response = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StarWarsJDR-Scraper/1.0"
    })
    response.raise_for_status()
    time.sleep(REQUEST_DELAY)
    return BeautifulSoup(response.text, "lxml")


def extract_species_links(soup: BeautifulSoup) -> list[dict]:
    """Extract species links from the category or list page."""
    species = []
    
    # Try to find species in category listing
    for link in soup.select(".category-page__member-link, .mw-category a"):
        name = link.get_text(strip=True)
        href = link.get("href")
        if href and not href.startswith("#"):
            species.append({
                "name": name,
                "url": urljoin(BASE_URL, href)
            })
    
    # Also try wiki content tables
    for link in soup.select("#mw-content-text a"):
        href = link.get("href", "")
        name = link.get_text(strip=True)
        if "/wiki/" in href and name and not any(x in href for x in [":", "Category", "File", "Template"]):
            if len(name) > 2 and name[0].isupper():
                species.append({
                    "name": name,
                    "url": urljoin(BASE_URL, href)
                })
    
    # Remove duplicates
    seen = set()
    unique = []
    for s in species:
        if s["name"] not in seen:
            seen.add(s["name"])
            unique.append(s)
    
    return unique


def extract_ability_mods(soup: BeautifulSoup) -> str:
    """Extract ability score modifiers from a species page."""
    mods = []
    
    # Look for ability modifiers in various formats
    text = soup.get_text()
    
    # Pattern: "+2 Dexterity, -2 Constitution" etc.
    ability_names = {
        "Strength": "FOR",
        "Dexterity": "DEX", 
        "Constitution": "CON",
        "Intelligence": "INT",
        "Wisdom": "SAG",
        "Charisma": "CHA"
    }
    
    for full_name, abbr in ability_names.items():
        # Look for patterns like "+2 Strength" or "-2 Dexterity"
        pattern = rf"([+-]?\d+)\s*{full_name}"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = match.group(1)
            if not value.startswith(("+", "-")):
                value = f"+{value}"
            mods.append(f"{value} {abbr}")
    
    return ", ".join(mods) if mods else "Aucun"


def extract_species_image(soup: BeautifulSoup) -> str | None:
    """Extract the main species image URL."""
    # Try infobox image first
    img = soup.select_one(".pi-image-thumbnail, .infobox img, .thumb img")
    if img:
        src = img.get("src") or img.get("data-src")
        if src:
            # Remove Fandom image sizing parameters
            src = re.sub(r"/revision/.*$", "", src)
            return src
    return None


def extract_species_description(soup: BeautifulSoup) -> str:
    """Extract a brief description of the species."""
    # Get first paragraph after the infobox
    content = soup.select_one("#mw-content-text .mw-parser-output")
    if content:
        for p in content.find_all("p", recursive=False):
            text = p.get_text(strip=True)
            if len(text) > 50:  # Skip short paragraphs
                # Clean up wiki formatting
                text = re.sub(r"\[\d+\]", "", text)  # Remove citation markers
                text = re.sub(r"\s+", " ", text)  # Normalize whitespace
                # Limit to ~200 chars
                if len(text) > 200:
                    text = text[:197] + "..."
                return text
    return ""


def extract_species_traits(soup: BeautifulSoup) -> list[str]:
    """Extract special traits/abilities."""
    traits = []
    
    # Look for trait sections
    for header in soup.find_all(["h2", "h3"]):
        if "trait" in header.get_text().lower() or "special" in header.get_text().lower():
            ul = header.find_next("ul")
            if ul:
                for li in ul.find_all("li"):
                    trait_name = li.get_text(strip=True).split(":")[0]
                    if trait_name and len(trait_name) < 50:
                        traits.append(trait_name)
    
    return traits[:5]  # Limit to 5 traits


def extract_languages(soup: BeautifulSoup) -> list[str]:
    """Extract languages spoken."""
    languages = ["Basic"]  # Most species speak Basic
    
    text = soup.get_text()
    
    # Look for language mentions
    lang_pattern = r"speak\s+(\w+)|language[s]?.*?(\w+)"
    for match in re.finditer(lang_pattern, text, re.IGNORECASE):
        lang = match.group(1) or match.group(2)
        if lang and lang.lower() not in ["the", "a", "and", "or", "basic"]:
            languages.append(lang.capitalize())
    
    return list(set(languages))[:3]


def scrape_species_page(url: str) -> dict:
    """Scrape detailed information from a species page."""
    soup = get_soup(url)
    
    return {
        "abilityMods": extract_ability_mods(soup),
        "description": extract_species_description(soup),
        "traits": extract_species_traits(soup),
        "languages": extract_languages(soup),
        "image_url": extract_species_image(soup)
    }


def download_image(url: str, filename: str) -> bool:
    """Download an image to the species folder."""
    if not url:
        return False
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    filepath = OUTPUT_DIR / filename
    
    if filepath.exists():
        print(f"    Image already exists: {filename}")
        return True
    
    try:
        print(f"    Downloading: {filename}")
        response = requests.get(url, stream=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StarWarsJDR-Scraper/1.0"
        })
        response.raise_for_status()
        
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        time.sleep(REQUEST_DELAY)
        return True
    except Exception as e:
        print(f"    Failed to download image: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Scrape SWSE species data")
    parser.add_argument("--images", action="store_true", help="Also download species images")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of species to scrape (0 = all)")
    args = parser.parse_args()
    
    print("=" * 60)
    print("SWSE Species Scraper")
    print("=" * 60)
    
    # Get species list
    print("\n[1/3] Fetching species list...")
    soup = get_soup(SPECIES_CATEGORY_URL)
    species_list = extract_species_links(soup)
    
    if args.limit > 0:
        species_list = species_list[:args.limit]
    
    print(f"  Found {len(species_list)} species")
    
    # Scrape each species
    print("\n[2/3] Scraping species details...")
    species_data = []
    
    for i, species in enumerate(species_list, 1):
        print(f"\n  [{i}/{len(species_list)}] {species['name']}")
        
        try:
            details = scrape_species_page(species["url"])
            
            # Create filename-safe ID
            species_id = re.sub(r"[^a-z0-9_]", "_", species["name"].lower())
            species_id = re.sub(r"_+", "_", species_id).strip("_")
            
            entry = {
                "id": species_id,
                "name": species["name"],
                "url": species["url"],
                "blurb": details["description"],
                "image": f"{species_id}.png",
                "hidden": {
                    "abilityMods": details["abilityMods"],
                    "languages": details["languages"],
                    "traits": details["traits"]
                }
            }
            
            species_data.append(entry)
            
            # Download image if requested
            if args.images and details["image_url"]:
                download_image(details["image_url"], f"{species_id}.png")
                
        except Exception as e:
            print(f"    Error: {e}")
    
    # Save data
    print("\n[3/3] Saving data...")
    with open(DATA_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(species_data, f, ensure_ascii=False, indent=2)
    
    print(f"  Saved to: {DATA_OUTPUT}")
    print(f"\n✓ Done! Scraped {len(species_data)} species.")
    
    # Print sample for verification
    if species_data:
        print("\nSample entry:")
        print(json.dumps(species_data[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
