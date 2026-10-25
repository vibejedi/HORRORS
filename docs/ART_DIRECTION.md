# ART DIRECTION — Haunted personal archive

## Core visual idea
The whole game IS the wiki: a machine's mind palace whose entries grow hostile as the reader commits revisions. Reference points for high-level *feel*, not asset reuse: an eccentric personal wiki, a 1-bit investigation RPG, bulletin-board software, a cryptographic audit console. Visuals are wholly original and textured by typography, silence and whitespace.

## Palette and type
Near-black spruce `#111413`, panel `#171b19`, archival chalk `#ddd9c9`, sickly green `#d5e890`, muted olive `#8e998a`, error rust `#d6806f`. Prefer DM Mono (system monospace fallback) for data and ASCII, Space Grotesk for headings. Import font for convenience but keep a complete system-font fallback for offline mode. Contrast stays legible; maintain 44px or larger touch targets whenever possible.

## Composition
Desktop: 210–254px sticky left archive tree, large center document, narrow right session/status column. Phone at 760px or less: fixed top bar, drawer navigation with tap-outside dismiss, active document full width, page-choice controls within thumb reach, session stats beneath. Status and boss intent must not be encoded by color alone. Show exactly what each combat choice costs. Every archive page has `slug`, title, short teaser, body and preformatted ASCII image. Never make ASCII dependent on emoji width.

## ASCII craft rules
- Invent original drawings; never trace protected commercial artwork or reuse its sprites.
- Write in plain text, `String.raw` for backslashes; render `<pre>` in dark inset with horizontal overflow when needed.
- Align glyphs within monospace and prefer ASCII punctuation; Unicode (`◈`, `◇`, `⌁`, `✳`) belongs in badges and relic labels, not alignment-critical art.
- Most illustrations 20–32 columns; enemy portraits should appear with readable text labels.
- Keep scene art highly recognizable at a glance, with deliberate asymmetry and negative space.
- Occasional unsettling change in a page's label may convey progression; don't animate words so often it impairs readability.

## Content voice
Intimate, cryptic, grimly bureaucratic. The archive notices the player. Witnesses are distinct: the Mirror Cache is evasive and self-protective; the Redundancy Choir is procedural and paranoid; the Ledger of Ash thinks in agreements and collateral. Fictional wallet signatures are covenants and breadcrumbs, never real DeFi promises. Keep paragraph copy short, choices consequential, enemy intent plain.

## Interaction priorities
Tap/click first; keyboard arrows are not required. Reader must see: where they are, which pages remain, what they lose on each choice, and whose turn it is. Combat controls remain action buttons, not vague conversation prompts. No external AI or wallet prompts. Disable locked chapters, explain unlock prerequisites in the design, show readable outcome messages, and distinguish *local* score history from shared competition.

## Illustrated archive assets (v0.3)
- Source illustrations were generated for Terminal of Horrors; optimized mono WebP files live in `public/art/`, linked via typed `src/game/art.ts`.
- Keep images black-and-white / chalk-on-ink with intentionally visible stipple. Avoid colour filters, full-screen gradients and overscaled pixelation that destroys texture.
- Portraits should be vertically framed; locations use wide illustrations. Text, user choices, stats and HUD must be **real HTML**, not flattened text embedded in generated images. Art may contain decorative inscriptions only.
- Combat: desktop two-column scene / controls; on phones use short cropped illustration above visible intent and 48px+ touch-friendly action buttons. Never bury controls behind full-height art.
- Retain the original ASCII asset in a `<details>` disclosure in every document as an archive artifact, alongside the illustrated attachment.
- Never upload third-party artwork extracted from WORLD OF HORROR to this directory; its purchase provides no redistribution licence.
