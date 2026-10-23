# STEM 207 brand guide (co-branded with STEM Coliseum)

**STEM Coliseum and Learning Center** is the parent company. **STEM 207, LLC** is a program offered exclusively through STEM Coliseum. The site is co-branded: the STEM 207 logo leads, and STEM Coliseum appears as the parent on every page.

Sources: the *STEM 207 Brand Guide v1.0* (October 2026, `brand/STEM207_Brand_Guide.pdf`), adopted as the standard from October 20, 2026, and the *STEM Coliseum Media Brand Guide v1.1* (`brand/coliseum/STEM_Coliseum_Brand_Guide.docx`). These replace earlier directions, including the indigo/lime palette.

## Files
- `brand/STEM207_Brand_Kit.zip`: the whole kit in one download.
- `brand/logos/stem-207/`: the STEM 207 logo, reverse logo, and Maine-zero mark (SVG, plus 2000 px and 512 px PNGs).
- `brand/logos/lockups/`: the "STEM 207 powered by STEM Coliseum" lockups, horizontal and stacked, on white.
- `brand/coliseum/`: the parent guide and the nine STEM Coliseum logo files.
- `brand/colors/`: the palette as CSS and plain text.
- Use these originals. Never recreate a logo or use an AI-generated version of one.

## Mission and exact wording
- Mission: **Keep the humanity in technology.** Use these exact words, with the period.
- Beside logos: **STEM 207 powered by STEM Coliseum**. In text: **STEM 207, powered by STEM Coliseum**.
- Formal line: **STEM 207, LLC is a program offered exclusively through STEM Coliseum and Learning Center.**
- STEM Coliseum's tagline is **STEM • SPORT • LEARN**.
- "STEM207bySCLC" is only the kit's package name, not a public name.

## Voice
- Warm, curious, and plain. Short sentences that suit grades 2–8.
- Lead line: **Wonder what you could make.** Follow-up line: **Your idea. Give it a go.**
- Technology supports the learner's ideas. The learner is the maker; the tool is never the hero.

## How the two brands appear together
| Place | What shows |
| --- | --- |
| Top of every page | A white brand row: the STEM 207 logo (links home), "powered by", and a large full-color STEM Coliseum logo that links to the STEM Coliseum and Learning Center website, https://stem-coliseum.odoo.com/ (new tab) |
| Header | The navigation, under the brand row |
| Footer | The STEM Coliseum and Learning Center logo on a white plate (links to the STEM Coliseum site), "STEM 207, LLC is a program offered exclusively through STEM Coliseum and Learning Center", STEM • SPORT • LEARN, and the STEM 207 mission |
| Sign-in card | "Powered by" + the STEM Coliseum logo (links to the STEM Coliseum site) |
| Certificates | The STEM 207 logo, then "Powered by" + the STEM Coliseum logo |

## STEM Coliseum logo rules (from the parent guide)
- Use the original files only (`assets/img/brand/coliseum/` for the site, all versions in `brand/coliseum/`). Never recolor, stretch, redraw, or add shadows or effects.
- The full-color versions go on white or light backgrounds only. On the site they always sit on white, in light and dark mode.
- Keep clear space around it equal to the height of the "C" in COLISEUM. Minimum 120 px wide on screens.
- The files supplied are 700 px wide PNGs with solid backgrounds. Ask the STEM Coliseum media team for SVG or transparent PNG originals before large or print use.

## Short screens (Chromebooks)
On screens 760 px tall or less and at least 1,000 px wide (a school Chromebook is 1366×768, about 650 px of page), the brand row is compact: the STEM 207 logo is 128 px wide and the STEM Coliseum logo is 190 px wide, still full color, on white, with "powered by" and its link. Elsewhere the Coliseum logo stays at 300 px. Never go below 120 px.

## STEM 207 logo
- Same drawing as before (the pine in the M, Maine in the 0), recolored to the parent palette: **STEM in Dark Teal #012d2b, 207 in Green 2 #94c93d**. On dark backgrounds, STEM turns white.
- Site copy: `assets/img/brand/stem207-logo.svg` (plus `-reverse`, `-mark`, `-pine`). `assets/js/brand.js` draws it inline. The kit originals are in `brand/logos/stem-207/`. Use those for print and marketing.
- Minimum width: 120 px on screen or 1 inch in print. Clear space: the height of the S in STEM on every side. Use the reverse version (white STEM) on Dark Teal, and the mark for icons and favicons.
- For flyers, social posts, and partner sheets, put the horizontal lockup at the top or bottom, and include the exact mission line.

## Color (STEM Coliseum palette)
| Role | Color | Site token |
| --- | --- | --- |
| Anchor: dark backgrounds (header, page tops, footer), main text | Dark Teal `#012d2b` | `--navy`, `--fg`, `--brand-dark-teal` |
| Primary accent: large headings, borders, graphics, certificate frame | Teal `#03968f` | `--brand-teal` |
| Links, small accent text, primary buttons | Teal, text shade `#037872` | `--teal` |
| Calls to action (dark teal text on green), energy | Green 2 `#94c93d` | `--orange` (name kept for code history) |
| Interactive highlights (available, used sparingly) | Blue `#3b8bcb` | `--brand-blue` |
| Body text, muted | `#555555` | `--muted` |

**Why the text shade:** brand Teal and Blue measure 3.6:1 on white. That passes for large text and graphics but not for small text (WCAG needs 4.5:1). Small text and button labels use `#037872` (5.3:1 on white, 4.8:1 on the light teal tint), so the site stays readable for grades 2–8. Never put Pink on orange or yellow. Use at most three brand colors in a layout; the site uses Dark Teal, Teal, and Green 2.

## Type
- **Montserrat** for headings, navigation, and buttons. **Open Sans** for body text. Both from Google Fonts. No other typefaces.

## Imagery and claims (STEM 207)
- STEM 207 site and marketing images show **no people**, and never students' faces. (The parent guide's photo style, with real students, is for STEM Coliseum's own media and needs parental consent on file. It isn't used on this site.)
- STEM 207 concept artwork is AI-generated and illustrative only. Don't present it as real facilities, equipment, or programs.
- Advertise coding, AI, VR, or AR sessions only when they're confirmed.

- Before publishing, confirm offerings, dates, grade ranges, prices, venue, and links, and remove every template placeholder.

## Marketing kit status
The Round 2 marketing kit (`brand/marketing-kit/`, indigo and lime, no STEM Coliseum) has been retired and removed. It's still in git history. New co-branded flyers, social posts, and a copy bank are in the October 2026 kit (`OneDrive/Desktop/STEM_207/STEM207bySCLC/`). Bring files into the repo as they're needed.
