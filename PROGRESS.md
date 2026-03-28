# KnivesFactory Theme — Build Checklist

Track progress of all visual/UX upgrades on top of the cloned base theme.

---

## Upgrades

- [x] **1. Fonts** — Replace DM Sans with Bebas Neue (H1/hero) + Oswald (nav/labels/secondary)
- [x] **2. Scanline overlay** — CRT horizontal line texture on hero and featured sections
- [x] **3. Grain/noise texture** — Subtle SVG noise overlay on page background (HUD screen feel)
- [x] **4. Crosshair cursor** — Valorant-style crosshair SVG as custom CSS cursor
- [x] **5. Glitch text effect** — CSS-only RGB-split distortion on H1/H2 headings
- [x] **6. Product card hover** — Scale + border glow + metallic glare sweep + HUD stats overlay slide-in
- [ ] **7. Button press animation** — Scale press-down (0.97) on click for all CTAs
- [ ] **8. Toast notifications** — Elimination-feed style (dark pill, red left border, slides from top-right)
- [ ] **9. Circular Gallery** — Featured bundle rotating knife carousel on homepage
- [ ] **10. Gun-Buddy Masonry** — Variable-height keychain collection grid layout
- [ ] **11. HUD stat chips** — Tactical labels on product pages `[MATERIAL: STEEL]` `[GRADE: A]`
- [ ] **12. Inspect lightbox** — Full-screen product image viewer with dark bg + crosshair cursor

---

## Push to Shopify

After each item is checked off, run:
```
shopify theme push --store=ckk43q-vx.myshopify.com --theme=159616499965
```
