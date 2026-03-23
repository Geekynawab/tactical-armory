# CLAUDE.md — Shopify Custom Theme for Valorant Merch Store

## Project Overview
Building a custom Shopify theme with a Riot Games / Valorant-inspired aesthetic. The theme will be developed locally, pushed to GitHub, and deployed to Shopify via CLI.

## Design Direction

### Layout Inspiration: Knify.gg
Reference: https://knify.gg/
Take the layout structure from Knify but apply Riot Games / Valorant dark color palette.

**What to copy from Knify's layout:**
- Top announcement bar (shipping info, promos)
- Mega menu navigation organized by product category (Knives, Skins, Accessories, etc.)
- Hero banner with featured product/collection
- Product grid with large product images, skin name, price
- Category browsing by knife type AND by skin collection (dual navigation)
- "Mystery boxes" / "Packs" section (bundle deals)
- Product page: large image left, details right, add-to-cart, skin variant selector
- Floating help/support button
- Login/register with wishlist functionality
- Clean cart sidebar (slide-in, not separate page)
- Trust badges (shipping, returns, quality)
- Blog section for SEO content

**What to change from Knify → Your store:**
- Knify uses light/white backgrounds → Switch to **dark backgrounds**
- Knify categories are CS2-focused → Yours are Valorant-focused (Knives, Keychains, Gun Models, Apparel, Deskmats, Collectibles)
- Add Riot Games-style angular geometric accents and shapes
- Add glowing hover effects on product cards

### Color Palette (Riot Games / Valorant Inspired)
```
Background Primary:    #0F1923  (Valorant dark navy)
Background Secondary:  #1C2A38  (slightly lighter panel)
Background Cards:      #253240  (card/product backgrounds)
Accent Primary:        #FF4655  (Valorant red)
Accent Secondary:      #BD3944  (darker red for hover)
Accent Highlight:      #00FFC2  (teal/cyan glow — used sparingly)
Text Primary:          #ECE8E1  (warm white)
Text Secondary:        #8B978F  (muted gray-green)
Text Muted:            #5B6B65  (subtle text)
Border:                #2A3A48  (subtle borders)
Success:               #00C48C  (green for "in stock", etc.)
Warning:               #FFB800  (yellow for "low stock")
Error:                 #FF4655  (same as accent for errors)
```

### Typography
```
Headlines:     "DM Sans" or "Inter" — Bold, uppercase, wide letter-spacing (0.05-0.1em)
Body:          "Inter" or "DM Sans" — Regular weight, clean
Buttons:       Uppercase, bold, slightly tracked
Price:         Bold, accent color for sale prices
```

### UI Elements Style
- **Buttons:** Angular/clipped corners (not fully rounded), Valorant red fill, white text, glow on hover
- **Product cards:** Dark card background, subtle border, image scales slightly on hover, price in bottom-left
- **Navigation:** Dark transparent/semi-transparent top bar, white text, red accent on active/hover
- **Announcement bar:** Valorant red background (#FF4655), white text
- **Badges:** Angular shape (not rounded pills), "NEW" in teal, "SALE" in red
- **Icons:** Thin line icons, white or teal
- **Dividers/accents:** Angular clip-paths, diagonal slashes, Valorant-style geometric shapes

### Navigation Structure (adapted from Knify for Valorant)
```
├── Knives & Melee
│   ├── Karambit
│   ├── Butterfly Knife
│   ├── Kunai / Throwing
│   ├── Katana / Sword
│   ├── M9 Bayonet
│   └── Tactical Knife
│
├── By Skin Collection
│   ├── Reaver
│   ├── Prime
│   ├── RGX 11z Pro
│   ├── Oni
│   ├── Champions
│   ├── Araxys
│   ├── Evori Dreamwings
│   └── Gaia's Vengeance
│
├── Gun Models (3D Printed)
│   ├── Vandal
│   ├── Phantom
│   ├── Sheriff
│   ├── Ghost
│   └── Shorty
│
├── Keychains
│   ├── Weapon Keychains
│   ├── Knife Keychains
│   └── Rank Keychains
│
├── Apparel & Accessories
│   ├── T-Shirts
│   ├── Hats / Cosplay
│   └── Deskmats / Mousepads
│
├── Collectibles
│   ├── Figures
│   ├── Plush
│   └── Stickers
│
├── Bundles & Packs
│   ├── Mystery Box
│   └── Collection Packs
│
└── Sale / Battle Scarred
```

---

## Shopify Theme File Structure

```
your-theme/
├── assets/            # CSS, JS, images, fonts
│   ├── theme.css
│   ├── theme.js
│   └── (images, fonts, etc.)
│
├── config/            # Theme settings (colors, typography, etc.)
│   ├── settings_schema.json   # Defines theme editor settings
│   └── settings_data.json     # Stores setting values
│
├── layout/            # Base HTML wrapper for all pages
│   └── theme.liquid            # Main layout (required)
│
├── locales/           # Translations
│   └── en.default.json
│
├── sections/          # Modular, reusable content blocks
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero-banner.liquid
│   ├── featured-collection.liquid
│   ├── product-card.liquid
│   ├── newsletter.liquid
│   └── announcement-bar.liquid
│
├── snippets/          # Small reusable Liquid partials
│   ├── product-card.liquid
│   ├── price.liquid
│   ├── icon-cart.liquid
│   └── social-icons.liquid
│
├── templates/         # Page-level templates (JSON or Liquid)
│   ├── index.json              # Homepage
│   ├── product.json            # Product page
│   ├── collection.json         # Collection page
│   ├── cart.json               # Cart page
│   ├── page.json               # Generic pages (about, contact, etc.)
│   ├── blog.json               # Blog listing
│   ├── article.json            # Blog post
│   ├── search.json             # Search results
│   ├── 404.json                # 404 page
│   └── gift_card.liquid        # Gift card (must be .liquid, not JSON)
│
└── robots.txt.liquid  # SEO robots file
```

---

## How to Give Claude Theme Files

### Option A: Share individual files (recommended)
Paste the contents of specific `.liquid` or `.json` files directly in chat. Example:
```
Here's my sections/header.liquid:
[paste code]
```

### Option B: Share via GitHub
Push your theme to a GitHub repo and share the repo link. Claude can review the structure and help you edit files.

### Option C: Upload files to this project
Upload `.liquid` files to the project knowledge. Claude can search and reference them.

**Important:** Shopify themes use `.liquid` files (Liquid + HTML), NOT plain `.html` files. CSS and JS go in the `/assets/` folder.

---

## Development Workflow

### 1. Setup (one-time)
```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Create a new theme (starts from Dawn base)
shopify theme init my-valorant-theme

# OR create from scratch
mkdir my-valorant-theme
cd my-valorant-theme
# Create the directory structure manually
```

### 2. Local Development
```bash
# Start local dev server (live preview)
shopify theme dev --store your-store.myshopify.com

# This gives you a localhost URL that hot-reloads as you edit files
```

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial theme"
git remote add origin https://github.com/yourusername/your-theme.git
git push -u origin main
```

### 4. Deploy to Shopify
```bash
# Push theme to your Shopify store
shopify theme push --store your-store.myshopify.com

# Or push as unpublished theme (safe — won't go live)
shopify theme push --unpublished --store your-store.myshopify.com
```

### 5. Connect GitHub to Shopify (auto-deploy)
- Go to Shopify Admin → Online Store → Themes
- Click "Add theme" → "Connect from GitHub"
- Select your repo and branch
- Every push to that branch will auto-update your theme

---

## Approach: Start from Dawn, Customize

The fastest path is to fork Shopify's **Dawn** theme (their free reference theme) and customize it:

1. `shopify theme init` — pulls Dawn as your base
2. Modify colors, typography, and layout to match Valorant aesthetic
3. Add custom sections for your store (hero banner, featured skins, etc.)
4. Push to GitHub → connect to Shopify

This is better than building from scratch because Dawn already handles:
- Cart functionality
- Product pages
- Collection filtering
- Mobile responsiveness
- SEO basics
- Accessibility

You just reskin it to look like a Valorant store.

---

## Key Customization Areas

### Colors (config/settings_schema.json)
```json
{
  "name": "Colors",
  "settings": [
    { "type": "color", "id": "color_primary", "label": "Primary", "default": "#FF4655" },
    { "type": "color", "id": "color_secondary", "label": "Secondary", "default": "#0FF" },
    { "type": "color", "id": "color_bg", "label": "Background", "default": "#0F1923" },
    { "type": "color", "id": "color_text", "label": "Text", "default": "#ECE8E1" }
  ]
}
```

### Typography
- Headlines: Bold, uppercase, wide tracking
- Body: Clean sans-serif
- Buttons: Angular, glowing hover effects

### Sections to Build/Customize
- [ ] Hero banner with angular clip-path edges
- [ ] Product cards with skin-style hover animations
- [ ] Collection page with dark grid layout
- [ ] Product page with large image + skin name prominence
- [ ] Cart with upsell suggestions
- [ ] Footer with Discord/TikTok/IG links
- [ ] Announcement bar ("Free shipping on orders $50+")
- [ ] Age verification popup (for knife products)

---

## Liquid Basics (Quick Reference)

### Output a variable
```liquid
{{ product.title }}
{{ product.price | money }}
```

### Conditional
```liquid
{% if product.available %}
  <button>Add to Cart</button>
{% else %}
  <p>Sold Out</p>
{% endif %}
```

### Loop
```liquid
{% for product in collection.products %}
  <h2>{{ product.title }}</h2>
  <p>{{ product.price | money }}</p>
{% endfor %}
```

### Include a snippet
```liquid
{% render 'product-card', product: product %}
```

### Section schema (makes it editable in theme editor)
```liquid
{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Your Favorite Skins, IRL" },
    { "type": "image_picker", "id": "bg_image", "label": "Background Image" }
  ]
}
{% endschema %}
```

---

## Legal Reminders for Theme
- [ ] Include fan-made disclaimer in footer: "Not affiliated with or endorsed by Riot Games or VALORANT"
- [ ] Age verification gate for knife products (18+)
- [ ] Legal disclaimer for blade products on product pages
- [ ] Cookie consent banner
- [ ] Privacy policy & terms pages

---

## Next Steps
1. ☐ Install Shopify CLI
2. ☐ Create Shopify development store (free via Shopify Partners)
3. ☐ Run `shopify theme init` to pull Dawn
4. ☐ Create GitHub repo
5. ☐ Start customizing colors & typography
6. ☐ Build hero banner section
7. ☐ Customize product card layout
8. ☐ Push to GitHub & connect to Shopify
