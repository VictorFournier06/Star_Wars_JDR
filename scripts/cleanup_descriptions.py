#!/usr/bin/env python3
"""
Clean up scraped species descriptions by:
1. Removing wiki metadata (infobox content)
2. Removing duplicate paragraphs
3. Keeping only the most relevant lore
"""

import json
import re
from pathlib import Path

INPUT_FILE = Path(__file__).parent.parent / "js" / "species_descriptions.json"
OUTPUT_FILE = INPUT_FILE  # Overwrite

# Patterns to remove
METADATA_PATTERNS = [
    r'Biological classification\s*',
    r'Designation\s+Sentient\s*',
    r'Classification\s+\w+\s*',
    r'Physical characteristics\s*',
    r'Average height\s+[\d\.\-\s]+meters?\s*',
    r'Average mass\s+[\d\.\-\s]+kilograms?\s*',
    r'Skin color\s+\w+(?:\w+)*\s*',
    r'Hair color\s+\w+(?:\w+)*\s*',
    r'Eye color\s+\w+(?:\w+)*\s*',
    r'Distinctions\s+[^\.]+\s*',
    r'Average lifespan\s+[^\.]+\s*',
    r'Sociocultural characteristics\s*',
    r'Point of origin\s+\w+\s*',
    r'Diet\s+\w+\s*',
    r'Language\s+\w+(?:\w+)*\s*',
    r'\[Source\]\s*',
    r'Subspecies\s+\w+(?:\w+)*\s*',
    r'Races\s+\w+(?:\w+)*\s*',
    r'Habitat\s+\w+\s*',
]


def remove_metadata(text: str) -> str:
    """Remove wiki infobox metadata from text."""
    # Remove metadata patterns
    for pattern in METADATA_PATTERNS:
        text = re.sub(pattern, ' ', text, flags=re.IGNORECASE)
    
    # Remove patterns like "1.7 meters" or "75 kilograms" alone
    text = re.sub(r'\b[\d\.]+ meters?\b', '', text)
    text = re.sub(r'\b[\d\.]+ kilograms?\b', '', text)
    
    # Remove color lists like "RedBlueGreenOrange"
    text = re.sub(r'\b([A-Z][a-z]+){3,}\b', '', text)
    
    return text


def remove_duplicates(text: str) -> str:
    """Remove duplicate sentences/paragraphs."""
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    seen = set()
    unique = []
    for s in sentences:
        # Normalize for comparison
        normalized = s.strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique.append(s.strip())
    
    return ' '.join(unique)


def clean_text(text: str) -> str:
    """Clean up spacing and formatting."""
    # Fix multiple spaces
    text = re.sub(r'\s+', ' ', text)
    # Fix spaces before punctuation
    text = re.sub(r'\s+([.,;:!?])', r'\1', text)
    # Fix missing space after periods
    text = re.sub(r'\.([A-Z])', r'. \1', text)
    return text.strip()


def extract_key_paragraphs(text: str, max_length: int = 1200) -> str:
    """Extract the most important paragraphs for role-playing context."""
    # Split into sentences
    sentences = text.split('. ')
    
    # Keywords that indicate relevant lore for RPG
    priority_keywords = [
        'were known', 'known for', 'culture', 'society', 'believed', 
        'traits', 'abilities', 'skills', 'Force', 'warriors', 'hunters',
        'homeworld', 'planet', 'species', 'native', 'originated',
        'distinguished', 'recognizable', 'distinctive', 'unique',
        'personality', 'temperament', 'nature', 'reputation'
    ]
    
    result = []
    current_length = 0
    
    for sentence in sentences:
        if current_length >= max_length:
            break
        
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # Skip very short sentences
        if len(sentence) < 30:
            continue
            
        # Skip sentences that look like metadata
        if any(meta in sentence.lower() for meta in ['biological', 'classification', 'average height', 'skin color']):
            continue
        
        result.append(sentence)
        current_length += len(sentence)
    
    final_text = '. '.join(result)
    if final_text and not final_text.endswith('.'):
        final_text += '.'
    
    return final_text


def process_description(text: str) -> str:
    """Full processing pipeline for a description."""
    # Step 1: Remove metadata
    text = remove_metadata(text)
    
    # Step 2: Clean up text
    text = clean_text(text)
    
    # Step 3: Remove duplicates
    text = remove_duplicates(text)
    
    # Step 4: Extract key paragraphs (limit length)
    text = extract_key_paragraphs(text, max_length=1200)
    
    # Final cleanup
    text = clean_text(text)
    
    return text


def main():
    print("=" * 60)
    print("Species Description Cleanup")
    print("=" * 60)
    
    # Load descriptions
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        descriptions = json.load(f)
    
    print(f"Loaded {len(descriptions)} descriptions")
    
    # Process each description
    cleaned = {}
    for species_id, text in descriptions.items():
        original_len = len(text)
        cleaned_text = process_description(text)
        cleaned[species_id] = cleaned_text
        
        print(f"  {species_id}: {original_len} -> {len(cleaned_text)} chars")
    
    # Save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved cleaned descriptions to {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
