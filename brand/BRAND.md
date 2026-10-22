# STEM 207 brand guide

Source: *STEM207bySCLC Updated Brand Marketing Kit* (October 20, 2026), which adopts `STEM207_Brand_Guide.pdf` v1.0 (October 2026). The approved logos and colors are copied, unchanged, into this repo:
- `brand/logos/stem-207/`: the STEM 207 logo, reverse logo, and mark (SVG and PNG)
- `brand/logos/lockups/`: "STEM 207 powered by STEM Coliseum", horizontal and stacked, on white
- `brand/logos/stem-coliseum/`: the nine approved STEM Coliseum logo versions
- `brand/colors/`: the palette as CSS and plain text

The rest of the kit is kept outside this repo, in `OneDrive/Desktop/STEM_207/STEM207bySCLC/`: the brand guide PDF, the detailed standards (`01_Guide/STEM207bySCLC_Standards.md`), draft copy (`05_Copy/STEM207bySCLC_Copy_Bank.md`), the flyer, social posts, and fonts. This page pulls out the rules that matter for the site and for any new material.

**These standards replace earlier visual directions,** including the retired indigo/lime palette. The Round 2 marketing kit (`brand/marketing-kit/`) has been removed; it is still in git history. See "Site status" below.

## Identity and exact wording
- Brand: **STEM 207**. Maine-rooted STEM learning for grades 2–8.
- Mission, with the period: **Keep the humanity in technology.** This is the mission, not a campaign tagline. Don't rephrase it (e.g. "Keeping the humanity…").
- Beside logos: **STEM 207 powered by STEM Coliseum**
- Short reference in text: **STEM 207, powered by STEM Coliseum**
- Formal line (website footer, formal materials): **STEM 207, LLC is a program offered exclusively through STEM Coliseum and Learning Center.**
- Parent brand: STEM Coliseum and Learning Center. Its tagline is **STEM • SPORT • LEARN**, and its website is https://stem-coliseum.odoo.com/
- "STEM207bySCLC" is only the kit's package name. It is not a public name or logo.

## Voice
- Warm, curious, and plain. Short sentences that suit grades 2–8.
- Lead line: **Wonder what you could make.** Follow-up line: **Your idea. Give it a go.**
- Hierarchy on any piece: logo first, invitation second, one clear next step, mission always.
- Technology supports the learner's ideas. The learner is the maker; the tool is never the hero.

## Logos and co-branding
- The approved logo has a pine tree forming the right edge of the M and Maine inside the zero. STEM is Dark Teal and 207 is Green 2. Keep the 207.
- Use the supplied files; never redraw them. Prefer the SVGs: `stem207-logo.svg` (full color, on white), `stem207-logo-reverse.svg` (white STEM, on Dark Teal), and `stem207-mark.svg` (the Maine-zero mark, for icons and favicons). PNG versions are 2000 px wide; the mark is 512 px.
- Minimum full-logo width: 120 px on screen or 1 inch in print. Clear space: the height of the S in STEM on every side.
- Co-brand lockup: STEM 207 first, then POWERED BY, then the full-color STEM Coliseum logo, on white. Use the supplied horizontal or stacked PNG lockups.
- STEM Coliseum logo: clear space is the height of the C in COLISEUM, and minimum width is 120 px or 1 inch. Its supplied files are 700 px wide; get originals from the parent media team for large print. Show the full-color logo on white only, and keep its original multicolor version.
- Never recolor, stretch, or redraw either logo, and never add shadows, glows, or outlines. Never use an AI-generated rendering of a logo.

## Color
| Color | Hex | Use |
| --- | --- | --- |
| Dark Teal | `#012d2b` | Anchor: main text, dark backgrounds, STEM in the logo |
| Teal | `#03968f` | Large headings, borders, graphics |
| Text teal | `#037872` | Small text, links, buttons (5.3:1 on white) |
| Green 2 | `#94c93d` | Calls to action with Dark Teal text on it; 207 in the logo |
| Blue | `#3b8bcb` | Interactive highlights, sparingly |
| Body gray | `#555555` | Body and muted text |
| White | `#ffffff` | Backgrounds; full-color logo fields |

- Use at most three brand colors in one layout. The usual set is Dark Teal, Teal, and Green 2.
- Parent-brand extras (Green 1 `#66aa44`, Orange 1 `#fac01b`, Orange 2 `#f68922`, Pink `#ec008c`) are for STEM Coliseum materials and its logo, not STEM 207 layouts.
- Never put Pink on Orange or Yellow. Never put Dark Teal on a dark background.
- Contrast: 4.5:1 for small text, 3:1 for large text and graphics. Teal and Blue on white are for large headings or graphics only. Use Text teal for small text on white. Green 2 is a fill behind Dark Teal text, never the color of text on white.
- The kit's CSS tokens: `--dark-teal`, `--teal`, `--teal-text`, `--green-2`, `--blue`, `--body-gray`, `--white` (`brand/colors/stem207-colors.css`).

## Type
| Typeface | Weights | Use |
| --- | --- | --- |
| Montserrat | Bold, SemiBold | Titles, headings, navigation, buttons, POWERED BY |
| Open Sans | Regular, Bold | Body text, captions, form fields |

The standard says to use no other typefaces. Never stretch or condense type. The kit ships the fonts and their SIL Open Font Licenses in `fonts/`.

## Imagery
- Maine scenes (pines, coast, lighthouses, harbors) next to inventive technology.
- **No people in STEM 207 imagery, and never students' faces.** This also fits the classroom rule against collecting or showing student faces. (STEM Coliseum's own materials need parental consent on file for any real student photo.)
- AI-generated concept art is illustrative only. Never present it as real facilities, equipment, software, or programs.

## Where each element goes
- **Website:** a white brand row on every page. Link the STEM Coliseum logo to its website, and put the formal line in the footer.
- **Sign-in and certificates:** include "Powered by" with the STEM Coliseum logo.
- **Flyers, social posts, partner sheets:** the horizontal lockup at the top or bottom, plus the exact mission line.
- **Anything else new:** the same logos, palette, type, voice, and imagery rules.

## Claims and accuracy
- Advertise coding, AI, VR, or AR sessions only when the curriculum, equipment, and delivery are confirmed.
- Before publishing, confirm offerings, dates, grade ranges, prices, venue, capacity, and links. Remove every template placeholder.
- The copy bank's captions, partner email, and event template are drafts. Nothing has been posted or sent.
- Use only the permissions and organizational claims the brand owner has approved. The kit transcribes the formal line; it doesn't verify legal status.

## Site status (not yet updated)
Adopting the new standards did not change the site. As of October 21, 2026, the app still uses the retired brand:
- Colors in `assets/css/styles.css`: indigo `--navy #302568` and `--teal #4a3ba6`, lime `--orange #8cc832`, with dark-mode versions.
- Logos in `assets/img/brand/` and `assets/js/brand.js`: the older indigo logo. It doesn't match the approved `brand/logos/stem-207/stem207-logo.svg`.
- There is no STEM Coliseum lockup, "Powered by" line, or formal footer line on the site, sign-in, or certificates yet.

**Site exception (decided):** the site keeps **Atkinson Hyperlegible** for body text, with Montserrat headings, because it is easier for young readers. Use Open Sans for marketing and other new materials.

A site retheme needs the accessibility test to stay at 0 findings in light and dark mode (`python3 tests/site/test_a11y.py`).
