#!/usr/bin/env python3
"""
SWTOR Faction & Card Image Downloader

Downloads faction logos and card-relevant images from SWTOR/Wookieepedia sources.
Images are saved to assets/factions/ and assets/cards/ folders.
"""

import os
import requests
import time
from pathlib import Path
from urllib.parse import urlparse, unquote

# Base paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
FACTIONS_DIR = PROJECT_ROOT / "assets" / "factions"
CARDS_DIR = PROJECT_ROOT / "assets" / "cards"

# Ensure directories exist
FACTIONS_DIR.mkdir(parents=True, exist_ok=True)
CARDS_DIR.mkdir(parents=True, exist_ok=True)

# Headers to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
}

# =============================================================================
# FACTION LOGOS/EMBLEMS - SWTOR Era
# =============================================================================
FACTION_IMAGES = {
    # Superpowers
    'republic': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/0/0b/GalacticRepublicEmblem-Traced-TORkit.svg/revision/latest?cb=20250720050039',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/1/12/Republic_Emblem.svg/revision/latest?cb=20130326202215',
        'desc': 'Republic Crest'
    },
    'empire': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/5/5e/Sith_Empire_Logo.svg/revision/latest?cb=20200228090753',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/4/41/EmpireReclaims_Galactic_Senate.jpg/revision/latest?cb=20111004015428',
        'desc': 'Sith Empire Emblem'
    },
    
    # Spy Agencies
    'sis': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/e/e3/SIS.png/revision/latest?cb=20120326040857',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/7/7d/Republic_soldier.png/revision/latest?cb=20091005185352',
        'desc': 'Strategic Information Service'
    },
    'imperial_intel': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/f/f4/Imperial_Intelligence.png/revision/latest?cb=20111225211358',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/b/b3/Imperial_Agent-TOR.jpg/revision/latest?cb=20091204184306',
        'desc': 'Imperial Intelligence'
    },
    
    # Neutral Blocs
    'hutt': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/b/bc/Hutt_Cartel_leaders.jpg/revision/latest?cb=20131121001336',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/e/e0/HuttCartel-Timeline4.jpg/revision/latest?cb=20090904202012',
        'desc': 'Hutt Cartel'
    },
    'chiss': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/3/39/ChissAscendancySymbol-InsiderFFGEoE.png/revision/latest?cb=20240312020918',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/8/87/Chiss_NEGAS.jpg/revision/latest?cb=20061126165128',
        'desc': 'Chiss Ascendancy'
    },
    'czerka': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/7/70/Czerka_Corporation_logo.svg/revision/latest?cb=20140422135912',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/4/46/Czerka_logo.png/revision/latest?cb=20111217060347',
        'desc': 'Czerka Corporation'
    },
    
    # Underworld
    'exchange': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/d/d2/Exchange_Logo.png/revision/latest?cb=20120213135047',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/5/5d/Nar_Shaddaa-TOR.jpg/revision/latest?cb=20091005111543',
        'desc': 'The Exchange'
    },
    'blacksun': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/4/47/Black_Sun_logo.svg/revision/latest?cb=20130812203712',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/d/df/BlackSun-Underworld.jpg/revision/latest?cb=20131107034741',
        'desc': 'Black Sun'
    },
    'bountyguild': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/4/44/BountyHuntersGuild-FoD.png/revision/latest?cb=20190822181148',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/7/71/TOR_Bounty_Hunter.jpg/revision/latest?cb=20091114040851',
        'desc': 'Bounty Hunters Guild'
    },
    'mandal': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/f/f4/Mandalorian_skull_logo.svg/revision/latest?cb=20210201063818',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/9/9b/Poscassus.jpg/revision/latest?cb=20150806125037',
        'desc': 'Mandalorians'
    },
    
    # Proxy Theaters (Alderaan)
    'organa': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/2/22/House_Organa.svg/revision/latest?cb=20120411155109',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/5/5a/Alderaan-TOR.jpg/revision/latest?cb=20091023230316',
        'desc': 'House Organa'
    },
    'thul': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/3/3f/House_Thul.svg/revision/latest?cb=20120411155138',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/5/5a/Alderaan-TOR.jpg/revision/latest?cb=20091023230316',
        'desc': 'House Thul'
    },
    'ulgo': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/7/78/House_Ulgo.svg/revision/latest?cb=20120411155117',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/5/5a/Alderaan-TOR.jpg/revision/latest?cb=20091023230316',
        'desc': 'House Ulgo'
    },
    
    # Force Orders
    'jedi': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/9/9d/Jedi_symbol.svg/revision/latest?cb=20080329163323',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/b/bd/Tython_rediscovery.jpg/revision/latest?cb=20200530201401',
        'desc': 'Jedi Order'
    },
    'sith': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/9/9b/Sith_Eternal_insignia.svg/revision/latest?cb=20240831062413',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/5/5e/Sith_Empire_Logo.svg/revision/latest?cb=20200228090753',
        'desc': 'Sith Order'
    },
    
    # Secret Societies
    'revanites': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/7/75/Order_of_Revan_symbol.png/revision/latest?cb=20141225004853',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/1/1a/Revan_SWTOR.png/revision/latest?cb=20141127201137',
        'desc': 'Order of Revan'
    },
    'starcabal': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/d/d7/Star_Cabal_logo.png/revision/latest?cb=20120413151017',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/5/5d/Nar_Shaddaa-TOR.jpg/revision/latest?cb=20091005111543',
        'desc': 'Star Cabal'
    },
    'genoharadan': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/a/ac/GenoHaradan_symbol.svg/revision/latest?cb=20130808184541',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/0/05/GenoHaradanlogo.png/revision/latest?cb=20080509110541',
        'desc': 'GenoHaradan'
    },
    'dreadmasters': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/9/96/DreadMasters-TOR.jpg/revision/latest?cb=20120217223555',
        'fallback': 'https://static.wikia.nocookie.net/starwars/images/1/14/Styrakhologram.jpg/revision/latest?cb=20150411185252',
        'desc': 'Dread Masters'
    },
}

# =============================================================================
# CARD IMAGES - Relevant SWTOR/Cold War imagery
# Filenames must match the 'image' field in DRAFT_CARDS in data.js
# =============================================================================
CARD_IMAGES = {
    # Espionage
    'coruscant-lower': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/a/a5/Coruscantlowerlevelsky.jpg/revision/latest?cb=20061024175813',
        'desc': 'Coruscant Lower Levels'
    },
    'nar-shaddaa': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/5/5d/Nar_Shaddaa-TOR.jpg/revision/latest?cb=20091005111543',
        'desc': 'Nar Shaddaa'
    },
    'smuggler-ship': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/6/6e/XS_freighter_over_Ord_Mantell.jpg/revision/latest?cb=20091023232406',
        'desc': 'Smuggler Ship'
    },
    'imperial-agent': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/b/b3/Imperial_Agent-TOR.jpg/revision/latest?cb=20091204184306',
        'desc': 'Imperial Agent'
    },
    'keeper': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/a/a4/KeeperImpIntel.jpg/revision/latest?cb=20120118045327',
        'desc': 'Keeper - Imperial Intelligence'
    },
    
    # Underworld
    'hutt-cartel': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/e/e0/HuttCartel-Timeline4.jpg/revision/latest?cb=20090904202012',
        'desc': 'Hutt Cartel'
    },
    'exchange': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/d/d2/Exchange_Logo.png/revision/latest?cb=20120213135047',
        'desc': 'The Exchange'
    },
    'blacksun': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/d/df/BlackSun-Underworld.jpg/revision/latest?cb=20131107034741',
        'desc': 'Black Sun'
    },
    'bounty-hunter': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/7/71/TOR_Bounty_Hunter.jpg/revision/latest?cb=20091114040851',
        'desc': 'Bounty Hunter'
    },
    'genoharadan': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/0/05/GenoHaradanlogo.png/revision/latest?cb=20080509110541',
        'desc': 'GenoHaradan'
    },
    
    # Corporate
    'czerka': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/4/46/Czerka_logo.png/revision/latest?cb=20111217060347',
        'desc': 'Czerka Corporation'
    },
    
    # Alderaan
    'alderaan': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/5/5a/Alderaan-TOR.jpg/revision/latest?cb=20091023230316',
        'desc': 'Alderaan'
    },
    
    # Mandalorians
    'mandalorians': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/9/9b/Poscassus.jpg/revision/latest?cb=20150806125037',
        'desc': 'Mandalorians'
    },
    'coruscant-sack': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/4/41/EmpireReclaims_Galactic_Senate.jpg/revision/latest?cb=20111004015428',
        'desc': 'Sacking of Coruscant'
    },
    
    # Chiss
    'chiss': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/8/87/Chiss_NEGAS.jpg/revision/latest?cb=20061126165128',
        'desc': 'Chiss'
    },
    
    # Force Cults
    'revan': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/1/1a/Revan_SWTOR.png/revision/latest?cb=20141127201137',
        'desc': 'Revan'
    },
    'starcabal': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/d/d7/Star_Cabal_logo.png/revision/latest?cb=20120413151017',
        'desc': 'Star Cabal'
    },
    'dreadmasters': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/9/96/DreadMasters-TOR.jpg/revision/latest?cb=20120217223555',
        'desc': 'Dread Masters'
    },
    'korriban': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/0/0a/Korriban-TOR.jpg/revision/latest?cb=20091005110845',
        'desc': 'Korriban'
    },
    'tython': {
        'url': 'https://static.wikia.nocookie.net/starwars/images/b/bd/Tython_rediscovery.jpg/revision/latest?cb=20200530201401',
        'desc': 'Tython'
    },
}


def download_image(url: str, output_path: Path, retries: int = 2) -> bool:
    """Download an image from URL to the specified path."""
    for attempt in range(retries + 1):
        try:
            print(f"  Downloading: {url[:80]}...")
            response = requests.get(url, headers=HEADERS, timeout=30, stream=True)
            response.raise_for_status()
            
            # Determine file extension from content-type or URL
            content_type = response.headers.get('Content-Type', '')
            if 'svg' in content_type or url.endswith('.svg'):
                ext = '.svg'
            elif 'png' in content_type or 'png' in url.lower():
                ext = '.png'
            elif 'jpeg' in content_type or 'jpg' in url.lower():
                ext = '.jpg'
            elif 'webp' in content_type:
                ext = '.webp'
            else:
                ext = '.png'  # default
            
            # Update path with correct extension
            final_path = output_path.with_suffix(ext)
            
            with open(final_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"  ✓ Saved to: {final_path.name}")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"  ✗ Attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(1)
    
    return False


def download_faction_images():
    """Download all faction logos/emblems."""
    print("\n" + "=" * 60)
    print("DOWNLOADING FACTION IMAGES")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for faction_id, info in FACTION_IMAGES.items():
        print(f"\n[{faction_id}] {info['desc']}")
        output_path = FACTIONS_DIR / faction_id
        
        # Try primary URL
        if download_image(info['url'], output_path):
            success_count += 1
        # Try fallback if primary fails
        elif 'fallback' in info and download_image(info['fallback'], output_path):
            success_count += 1
        else:
            fail_count += 1
            print(f"  ⚠ Failed to download image for {faction_id}")
        
        time.sleep(0.5)  # Be nice to servers
    
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
    
    for card_id, info in CARD_IMAGES.items():
        print(f"\n[{card_id}] {info['desc']}")
        output_path = CARDS_DIR / card_id
        
        if download_image(info['url'], output_path):
            success_count += 1
        else:
            fail_count += 1
            print(f"  ⚠ Failed to download image for {card_id}")
        
        time.sleep(0.5)
    
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
    print(f"Factions: {faction_success}/{len(FACTION_IMAGES)} downloaded")
    print(f"Cards: {card_success}/{len(CARD_IMAGES)} downloaded")
    print("\nDone! Check the assets/factions/ and assets/cards/ folders.")


if __name__ == "__main__":
    main()
