# Aside — Pixel Art Asset Guide

## Directory Structure

```
public/assets/
├── backgrounds/          ← Scene background images (PNG, 800×450px)
│   ├── bedroom_night.png
│   ├── livingroom_evening.png
│   ├── kitchen_morning.png
│   ├── outdoor_park.png
│   ├── cafe.png
│   └── office.png
│
├── sprites/              ← Character sprite images (PNG, transparent bg)
│   ├── char_a/           ← Partner A sprites (apply hue-rotate in CSS)
│   │   ├── short_casual_neutral.png
│   │   ├── short_casual_sad.png
│   │   ├── short_casual_angry.png
│   │   ├── short_casual_anxious.png
│   │   ├── short_casual_defensive.png
│   │   ├── short_casual_soft.png
│   │   ├── short_casual_surprised.png
│   │   ├── short_casual_withdrawn.png
│   │   ├── medium_casual_neutral.png
│   │   └── ... (hair × outfit × emotion combos)
│   └── char_b/           ← Partner B sprites (same set, different CSS filter)
│
└── ui/                   ← Small UI preview images (64×64px)
    ├── hair_short.png
    ├── hair_medium.png
    ├── hair_long.png
    ├── hair_tied.png
    └── hair_curly.png
```

## Asset Specifications

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| Backgrounds | 800×450px | PNG | 16:9, no characters, pixel art style |
| Character sprites | 200×300px | PNG transparent | Front-facing, chibi/VN style |
| Hair UI previews | 64×64px | PNG transparent | Small swatches for selector |

## Recommended Sources

### Backgrounds
1. **Itch.io** — search "pixel art indoor background" / "visual novel room background"
   - "Pixel Art Room Pack" by penusbmic
   - "Free VN Backgrounds" packs (many CC0/CC-BY)
2. **AI generation** — Midjourney / SDXL prompt:
   ```
   pixel art [room type], front view, no characters, 16-bit SNES style,
   detailed furniture, warm lighting, 800x450px, game background
   ```

### Character Sprites
1. **Itch.io** — search "chibi character sprite sheet emotions" / "visual novel character sprite"
   - Front-facing VN-style characters with emotion variants
   - Transparent PNG background required
2. **LPC Character Generator** — https://lpc.opengameart.org/content/lpc-character-generator
   - Open source (CC-BY-SA 3.0), generates custom sprite sheets
3. **AI generation** — Stable Diffusion with pixel art LoRA:
   ```
   pixel art chibi character, front facing, [emotion] expression,
   transparent background, visual novel style, 200x300px
   ```

## CSS Color Differentiation (Key Technique)

We use ONE set of base sprites and differentiate A vs B via CSS filters.
No need for separate A/B sprite files — just place images in either folder
and the rendering code applies the correct filter automatically:

```css
/* Partner A — blue tint */
filter: hue-rotate(210deg) saturate(1.3) brightness(1.05);

/* Partner B — warm/red tint */
filter: hue-rotate(340deg) saturate(1.2) brightness(1.0);
```

## Fallback Behavior

If a PNG file is missing (404), the system automatically falls back to:
- **Characters**: CSS gradient + SVG PixelChar avatar (existing system)
- **Backgrounds**: CSS gradient scene with vector furniture elements

The app is fully functional without any PNG assets. Add assets to upgrade
visual quality without changing any code.

## Sprite Naming Convention

```
{hairStyle}_{outfitStyle}_{emotion}.png
```

Examples:
- `short_casual_neutral.png`
- `medium_formal_sad.png`
- `long_sporty_angry.png`
- `tied_casual_anxious.png`

Emotion keys: neutral, sad, angry, anxious, defensive, soft, surprised, withdrawn

## Scene → Background File Mapping

| Scene key | File |
|-----------|------|
| `bedroom_night` | `backgrounds/bedroom_night.png` |
| `livingroom_evening` | `backgrounds/livingroom_evening.png` |
| `kitchen_morning` | `backgrounds/kitchen_morning.png` |
| `outdoor_park` | `backgrounds/outdoor_park.png` |
| `cafe` | `backgrounds/cafe.png` |
| `office` | `backgrounds/office.png` |
