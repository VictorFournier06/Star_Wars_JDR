#!/usr/bin/env python3
"""
SWSE Image Scraper
Downloads images from the SWSE Fandom Wiki.

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    python scrape_images.py <wiki_url> [--output <folder>]
    
Examples:
    python scrape_images.py "https://swse.fandom.com/wiki/Category:Species"
    python scrape_images.py "https://swse.fandom.com/wiki/Human" --output human_images
"""

import os
import re
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


REQUEST_DELAY = 0.3


def get_soup(url: str) -> BeautifulSoup:
    """Fetch a page and return a BeautifulSoup object."""
    print(f"Fetching: {url}")
    response = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StarWarsJDR-Scraper/1.0"
    })
    response.raise_for_status()
    time.sleep(REQUEST_DELAY)
    return BeautifulSoup(response.text, "lxml")


def extract_images(soup: BeautifulSoup, base_url: str) -> list[dict]:
    """Extract all significant images from a page."""
    images = []
    
    # Find all images
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if not src:
            continue
            
        # Skip tiny images, icons, etc.
        width = img.get("width", "0")
        height = img.get("height", "0")
        try:
            if int(width) < 50 or int(height) < 50:
                continue
        except (ValueError, TypeError):
            pass
        
        # Skip Fandom UI images
        if any(x in src for x in ["static.wikia", "fandom.com/images", "/skins/", "/extensions/"]):
            continue
        
        # Get full URL
        full_url = urljoin(base_url, src)
        
        # Remove Fandom image sizing to get full resolution
        full_url = re.sub(r"/revision/.*$", "", full_url)
        full_url = re.sub(r"/scale-to-width-down/\d+", "", full_url)
        
        # Get filename
        parsed = urlparse(full_url)
        filename = Path(parsed.path).name
        filename = re.sub(r"\?.*$", "", filename)  # Remove query params
        
        # Get alt text for context
        alt = img.get("alt", filename)
        
        images.append({
            "url": full_url,
            "filename": filename,
            "alt": alt
        })
    
    # Remove duplicates
    seen = set()
    unique = []
    for img in images:
        if img["url"] not in seen:
            seen.add(img["url"])
            unique.append(img)
    
    return unique


def download_image(url: str, output_dir: Path, filename: str) -> bool:
    """Download an image."""
    output_dir.mkdir(parents=True, exist_ok=True)
    filepath = output_dir / filename
    
    if filepath.exists():
        print(f"  Skipped (exists): {filename}")
        return True
    
    try:
        print(f"  Downloading: {filename}")
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
        print(f"  Failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Download images from SWSE wiki")
    parser.add_argument("url", help="Wiki page URL to scrape images from")
    parser.add_argument("--output", "-o", default="downloaded_images", 
                        help="Output directory (default: downloaded_images)")
    parser.add_argument("--min-size", type=int, default=100,
                        help="Minimum image dimension in pixels (default: 100)")
    args = parser.parse_args()
    
    print("=" * 60)
    print("SWSE Image Scraper")
    print("=" * 60)
    
    # Fetch page
    soup = get_soup(args.url)
    
    # Extract images
    print(f"\nExtracting images...")
    images = extract_images(soup, args.url)
    print(f"Found {len(images)} images")
    
    if not images:
        print("No images found.")
        return
    
    # Show found images
    print("\nImages found:")
    for i, img in enumerate(images, 1):
        print(f"  {i}. {img['filename']} - {img['alt'][:50]}")
    
    # Confirm download
    print(f"\nDownloading to: {args.output}/")
    output_dir = Path(args.output)
    
    # Download
    success = 0
    for img in images:
        if download_image(img["url"], output_dir, img["filename"]):
            success += 1
    
    print(f"\n✓ Downloaded {success}/{len(images)} images to {output_dir}/")


if __name__ == "__main__":
    main()
