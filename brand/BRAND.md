# STEM 207 brand guide (co-branded with STEM Coliseum)

**STEM Coliseum and Learning Center** is the parent company. **STEM 207, LLC** is a program offered exclusively through STEM Coliseum. The site is co-branded: the STEM 207 logo leads, and STEM Coliseum appears as the parent on every page.

Sources: the *STEM Coliseum Media Brand Guide v1.1* (`brand/coliseum/STEM_Coliseum_Brand_Guide.docx`, with its logo files in `brand/coliseum/`) and the STEM 207 marketing kit (`brand/marketing-kit/`).

## Mission (exact wording)
**Keep the humanity in technology.** STEM 207's mission. Use these exact words, with the period.
STEM Coliseum's tagline is **STEM • SPORT • LEARN**.

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

## STEM 207 logo
- Same drawing as before (the pine in the M, Maine in the 0), recolored to the parent palette: **STEM in Dark Teal #012d2b, 207 in Green 2 #94c93d**. On dark backgrounds, STEM turns white.
- Master: `assets/img/brand/stem207-logo.svg` (plus `-reverse`, `-mark`, `-pine`). `assets/js/brand.js` draws it inline.

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

## Marketing kit status
`brand/marketing-kit/` (social posts, banner, flyer and partner templates) was made in the earlier indigo and lime colors and doesn't show STEM Coliseum. It needs a co-branded refresh before it's used again.
