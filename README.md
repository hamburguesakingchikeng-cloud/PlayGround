# PlayGround

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

---

# ⚔️ La Espada Celestial

RPG de acción 2D jugable en el navegador, sin dependencias ni proceso de compilación. Todo el arte se dibuja por código sobre Canvas y la interfaz usa HTML/CSS.

**Abrir el juego:** sirve esta carpeta con cualquier servidor estático (`python3 -m http.server 3002`) y visita `http://localhost:3002`. También funciona abriendo `index.html` directamente.

## Controles

| Acción | Teclado | Móvil |
| --- | --- | --- |
| Mover | WASD / flechas | Joystick izquierdo |
| Atacar | J | Botón ⚔ |
| Golpe Celestial | K | Botón ✦ |
| Curar | L | Botón ✚ |
| Poción | Q | Botón 🧪 |
| Interactuar | E / Espacio | Botón «Hablar» |
| Menú / inventario | I / Esc | Botón ☰ |

## Contenido

- **4 zonas:** Aldea Luz de Luna, Bosque Susurrante, Ruinas de Ceniza y Templo Celestial.
- **Campaña en 4 misiones** con jefes intermedios, cofre de reliquia y epílogo.
- **Combate de acción:** espada con arco, Golpe Celestial en área, curación, pociones, éteres y esquiva por posición.
- **Jefe final** con telegrafiado de golpe, abanico de proyectiles y segunda fase.
- **Progresión:** niveles, experiencia, oro, mejoras de espada y estadísticas.
- **Interfaz:** HUD de vida/maná/experiencia, seguimiento de misión, brújula de objetivo, inventario, misiones y guardado.
- **Guardado automático** en `localStorage` (también manual desde el menú).
- **Diseño responsive** con áreas seguras para Android/iOS, controles táctiles y alternativa de teclado.

## Archivos

- `index.html` — estructura, HUD, paneles y overlays.
- `style.css` — tema visual, diseño responsive y controles táctiles.
- `data.js` — utilidades, audio procedural, mapas, enemigos y misiones.
- `engine.js` — estado, colisiones, combate, IA, progresión y guardado.
- `render.js` — renderizado del mundo, personajes, efectos y brújula.
- `ui.js` — HUD, diálogos, inventario, entrada y bucle principal.

## Verificación

El juego fue probado en Chromium mediante Playwright: inicio de partida, diálogos, viaje entre zonas, combate, muerte y reaparición, guardado/carga, jefe, final y maquetación móvil a 390×844. No requiere conexión a internet ni recursos externos.

> Proyecto independiente: no es una exportación de «AI Game Maker» ni afirma serlo. Es una implementación web completa y ejecutable de La Espada Celestial.

