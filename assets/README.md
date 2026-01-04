# Assets Folder

Place your visual assets here:

## Required Files

- `logo.svg` or `logo.png` - Your logo (will appear in the header)
- `background.webp` or `background.jpg` - Background image for the datapad

## Optional Files

- `species/` - Folder for species images (e.g., `humain.webp`, `twilek.webp`)
- `icons/` - Folder for UI icons

## How to Enable Assets

After adding your images, update the CSS variables in `css/styles.css`:

```css
:root {
  --bg-img: url('../assets/background.webp');
  --logo-img: url('../assets/logo.svg');
}
```

## Recommended Formats

- **SVG** for logos and icons (scalable, small file size)
- **WebP** for photos and complex images (best compression)
- **PNG** for images requiring transparency
