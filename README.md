# GRAVEBOUND

**The dead are endless. The loot is not.**

A playable browser game that fuses a **Vampire Survivors-style auto-battler run** with **Diablo-style 2D loot**. Carve through a rising horde, chase loot beams, and build a character out of whatever the graveyard bleeds.

![Gravebound combat](screenshots/combat-03.png)

## Play

No build step, no dependencies, no install. Serve the folder with any static file server and open it:

```bash
python3 -m http.server 3002
# http://localhost:3002
```

Or use any equivalent static host.

## The run

- Survive **4 minutes** until **The Blood Count** awakens. Kill him to win.
- Attacks are automatic; you steer, dodge, and collect.
- Elites drop extra gear. **Treasure fiends** flee and burst into a hoard when killed.
- XP gems level you up and offer one of three **boons** (11 upgrade tracks).
- Death or victory ends the run with a summary of relics, legendaries, kills, and gear power.

## The loot

- **6 slots:** weapon, helm, chest, boots, amulet, ring.
- **5 rarities:** common, magic, rare, legendary, mythic, each with more affixes and higher power.
- **14 affixes** across offense, defense, movement, pickup, XP, luck, and area.
- **8 legendary powers**, including chaining soul bolts, loot gravity, harvesting low-health enemies, and orbiting bone blades.
- Every beam is auto-pulled when you walk over it. New gear is compared against what you wear, and anything useful goes to the **24-slot satchel**.
- Open the satchel to inspect affixes, compare power, equip upgrades, or **devour** spare relics for XP.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | `WASD` / arrow keys | Drag the left side of the screen |
| Inventory | `I` / bag button | Bag button |
| Choose boon | `1` `2` `3` / click | Tap a card |
| Pause | `Esc` / pause button | Pause button |
| Mute | `M` / speaker button | Speaker button |

Sound is synthesized with WebAudio; the mute preference persists between sessions.

## Tech

- Vanilla HTML, CSS, and JavaScript modules. No framework, no bundler, no image or audio assets.
- Canvas 2D renderer with procedurally painted ground, sprites, item icons, beams, fog, and lighting.
- Procedural WebAudio SFX and ambience.
- DOM overlays for the HUD, inventory, boon cards, pause, and end screens.
- Fully responsive, including a compact mobile inventory and touch joystick.

## Project layout

```
index.html            DOM shell, HUD, overlays, SVG icon sprite
styles.css            gothic UI, responsive layout, inventory paper doll
src/main.js           boot and animation loop
src/game.js           run state, combat, spawning, loot pickup, boss flow
src/renderer.js       canvas world, lighting, beams, sprites, effects
src/sprites.js        procedural ground, characters, props, item icons
src/loot.js           rarities, affixes, names, legendary powers, scoring
src/ui.js             HUD, boons, inventory, feed, banners, end screens
src/audio.js          synthesized music and sound effects
src/rng.js            seedable random helpers
test/run.mjs          Node tests for the loot system
```

## Tests

The source uses browser-native `.js` ES modules without a `package.json`, so the test runner stages the source in a temporary module directory:

```bash
node test/run.mjs
```

Covers deterministic generation, rarity/affix rules, legendary powers, luck scaling, item level scaling, naming, stat aggregation, scoring, and comparison helpers.

---

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/hamburguesakingchikeng-cloud/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/hamburguesakingchikeng-cloud/PlayGround)

- 🎮 [Open the project](https://omgithub.com/hamburguesakingchikeng-cloud/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=hamburguesakingchikeng-cloud%2FPlayGround).
- 💻 [Explore the source](https://github.com/hamburguesakingchikeng-cloud/PlayGround).
- 🛠️ [Check build runs](https://github.com/hamburguesakingchikeng-cloud/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/hamburguesakingchikeng-cloud/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/hamburguesakingchikeng-cloud).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->
