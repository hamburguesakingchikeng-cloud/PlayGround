# Verificación — vertical slice

Fecha: 2026-10-31
Entorno: contenedor Linux, Node 24, Chromium sin interfaz (build de Playwright recién instalado), servidor estático en el puerto 3002.

Este documento recoge **solo lo que se ejecutó y se observó**. Las capturas están en `docs/capturas/` y se tomaron del build que se describe aquí.

## Cómo se ejecutó

```
python3 -m http.server 3002
playwright-cli open "http://localhost:3002/?touch=1"
```

## Pruebas realizadas

| # | Prueba | Resultado |
|---|---|---|
| 1 | Carga de la página | Sin errores de JS. Único 404 inicial: `favicon.ico`, corregido con un icono embebido. |
| 2 | Pantalla de título (escritorio 1200×750) | Correcta. `docs/capturas/01-titulo.png` |
| 3 | Inicio de partida y diálogo introductorio | Correcto: máquina de escribir, avance con Espacio/toque. `02-dialogo.png` |
| 4 | Oleada I → II → III | Correcto: se generan 4, 5 y 7 enemigos; el rótulo de oleada aparece y desaparece. |
| 5 | Combate cuerpo a cuerpo | Correcto: `Corte` aplica 17 de daño a nivel 1, otorga Qi y produce retroceso. |
| 6 | `Corte Celestial` | Correcto: consume 30 de Qi, daño en área, destruye orbes y ondas. |
| 7 | `Esquiva` | Correcto: `inv` sube a 0.38 s y el enfriamiento a 0.62 s tras el uso. |
| 8 | Oleadas completas → jefe | Correcto: tras la tercera oleada se abre el diálogo y aparece el Centinela. `04-jefe.png` |
| 9 | Jefe: fase 1 → 2 | Correcto: al bajar del 60 % cambia de fase, invoca 2 espectros y se anuncia. |
| 10 | Jefe: fase 2 → 3 | Correcto: cambia al 25 %, patrón de abanico más amplio. |
| 11 | Muerte del jefe | Correcto: animación, epílogo y pantalla de victoria; el guardado registra el fragmento. |
| 12 | Guardado manual desde pausa | Correcto: `localStorage["lecel.save.v1"]` escrito con nivel, XP y mejor marca. |
| 13 | `Continuar` tras recargar | Correcto: el botón se habilita y arranca con el nivel guardado. |
| 14 | Controles táctiles | Correcto: `Corte` (38 → 21 PV), `Corte Celestial` (mata, −30 Qi), `Esquiva` (i-frames), joystick (el knob se desplaza y el jugador se mueve). |
| 15 | Vista móvil 390×844 | Correcta: HUD, botones y zonas seguras. `05-movil.png`, `06-movil-titulo.png` |

## Fallos encontrados durante la verificación y corregidos

1. **Cámara sin inicializar**: al empezar, el jugador quedaba fuera de cuadro. Se inicializa y se ajusta con límites de arena.
2. **Radio negativo en el canvas**: `b.r + 22 + (1 - tele) * 30` podía ser negativo y `ctx.arc` lanzaba `IndexSizeError`, lo que **detenía el bucle de juego por completo**. Se acota el radio y el bucle captura errores por frame.
3. **Barra del jefe sobre el HUD**: se solapaba con la vida del jugador en escritorio. Reposicionada.
4. **Controles táctiles sobre el diálogo**: se atenuaban pero seguían capturando toques. Ahora se desactivan durante el diálogo.
5. **Vacío excesivo en los bordes de la arena**: la cámara seguía al jugador fuera del escenario. Ahora se limita al área de juego y se añadió fondo de nubes.
6. **Icono 404**: añadido favicon embebido.

## Lo que NO se ha verificado

- Ejecución en un dispositivo Android real (solo emulación de viewport y puntero).
- Rendimiento en hardware móvil de gama baja (aquí, renderizado por software).
- Audio: el sintetizador WebAudio existe, pero no se ha evaluado musicalmente ni probado en navegadores móviles con restricciones de autoplay.
- Guardado entre dispositivos o en la nube: solo `localStorage`.
- Cualquier integración con AI Game Maker: no se ha identificado la herramienta ni se ha ejecutado nada dentro de ella.

## Nota sobre el arte

Todo el arte es procedural (formas, degradados y partículas dibujadas en canvas). No hay sprites ni música importados. Es un slice funcional, no arte final.
