# LA ESPADA CELESTIAL

Documento de diseño — versión 0.1
Estado: **diseño**. El único elemento ejecutado y verificado hasta ahora es el vertical slice web descrito en la sección 9.

Este documento no depende de ningún motor ni de ninguna aplicación concreta. Se puede trasladar a Godot, Unity, un motor propio en HTML5 o a un generador de juegos por bloques. Lo que cambia al trasladarlo es la implementación, no el contenido.

---

## 1. Premisa

El cielo se rompió hace trescientos años. No cayó: **se astilló**, como un espejo mal templado, y los fragmentos quedaron suspendidos sobre el mundo formando islas de luz solidificada. Bajo ellas sobrevive el pueblo de **Yunhe**, en un valle donde la lluvia sube en lugar de bajar.

La Espada Celestial no es un arma legendaria guardada en un templo: es el **ancla** que mantenía el cielo entero. Al romperse, cada fragmento conserva una ley física distinta. Hay islas donde la gravedad es una sugerencia, islas donde el tiempo se repite cada nueve minutos, islas donde nada puede morir del todo.

El jugador es **Lian**, la última aprendiz de la orden que custodiaba el ancla. No es la elegida. Es la única que quedó viva por una razón que el juego tarda en revelar: fue ella quien rompió la espada.

### Tono

Melancolía de paisaje, no de personaje. Lian no se lamenta: sube. El humor viene de los secundarios, nunca del peligro. Nada de cinismo. La violencia es rápida, seca y con consecuencias visibles en el escenario.

### Temas

- Reparar algo roto no lo devuelve a su estado anterior.
- La culpa sin testimonio: nadie sabe lo que hiciste y aun así lo cargas.
- Las instituciones que sobreviven a su propio propósito.

---

## 2. Estructura narrativa

Cinco actos, cada uno con una isla como eje. Longitud objetivo: 12–16 horas en primera partida.

| Acto | Isla | Ley local | Antagonista | Cierre |
|---|---|---|---|---|
| Prólogo | Yunhe (valle) | La lluvia sube | — | Lian cruza el primer fragmento |
| I | Jardín de las Cimas | La altura pesa más cuanto más subes | Centinela del Cielo Roto | Primer fragmento del ancla |
| II | Mercado de las Nueve Repeticiones | Nueve minutos que se repiten | La Cómplice | Descubre su propio papel en la ruptura |
| III | Osario de Sal | Los muertos no terminan de morir | El Coro | Aprende a soltar un nombre |
| IV | La Costura | Las leyes no aplican | La Ancla (la espada misma) | Elige qué se repara |
| V | Yunhe, después | — | — | Tres finales según lo que aceptes perder |

### Regla de escritura

Cada acto entrega **una** respuesta y **dos** preguntas nuevas. Ningún giro depende de información que el jugador no haya podido ver antes.

### Finales

1. **Cosido** — reparas el cielo. El mundo vuelve a ser habitable y olvida que se rompió. Lian desaparece del recuerdo de todos.
2. **Astillado** — no reparas nada. Enseñas a Yunhe a vivir en islas. Más difícil, más lento, el mundo sigue.
3. **Testigo** — te quedas en la Costura sosteniendo la grieta. El cielo no cae mientras alguien lo mire.

---

## 3. Sistemas de juego

### 3.1 Combate

Acción en tiempo real, vista cenital 2.5D. Cuatro verbos, sin más:

- **Corte** — arco frontal corto. Rápido, sin coste, encadenable.
- **Corte Celestial** — estallido radial. Consume Qi. Rompe guardias y proyectiles.
- **Esquiva** — desplazamiento con invulnerabilidad breve. Es la única defensa real: no hay bloqueo.
- **Concentración** — mantienes pulsado para recuperar Qi y ver las líneas de ataque enemigas. Te deja quieto.

El diseño se sostiene en que **no puedes atacar y defenderte a la vez**. Todo lo demás son consecuencias.

### 3.2 Qi

Barra propia, se regenera despacio (≈6/s) y sube al golpear. El Qi es también la moneda de las habilidades desbloqueables, así que el jugador elige entre daño inmediato y utilidad. Sin recarga automática total: si te vacías, estás vendido unos segundos.

### 3.3 Progresión

Sin clases. Una sola rama de espada que se abre en tres estilos intercambiables en cualquier momento (fuera de combate):

| Estilo | Fuerte | Débil |
|---|---|---|
| **Filo** | Daño directo, alcance | Sin control de multitudes |
| **Marea** | Barridos amplios, empuje | Daño bajo por golpe |
| **Aguja** | Precisión, crítico, atraviesa guardia | Castiga el fallo, ventana estrecha |

Niveles por experiencia de combate, no por misiones. Cada nivel: +12 HP máximo, +1 punto de estilo. Techo: nivel 30.

### 3.4 Guardado

Un slot manual, autoguardado al cambiar de isla y al vencer un jefe. Guarda: nivel, estilo activo, fragmentos del ancla, diálogos vistos, puertas abiertas, tiempo jugado. Nunca guarda dentro de combate: el jugador siempre puede repetir una sala limpia.

### 3.5 Muerte

Sin vidas. Reapareces en el último punto de descanso con la sala reseteada y el botín de la sala perdido. El progreso narrativo no se pierde nunca.

---

## 4. Enemigos

| Nombre | Rol | Comportamiento | Lectura |
|---|---|---|---|
| Sombra Errante | Presión básica | Persigue, telegrafía embestida | Silueta baja, borde violeta |
| Guardián de Jade | Control de espacio | Mantiene distancia, dispara orbes | Quieto, brillo cian en el pecho |
| Espectro | Castigo a la pasividad | Ráfagas rápidas con pausa | Estela rosada, casi translúcido |
| Coro Menor | Enjambre | Se mueve en grupo, se dispersa al matar a uno | Varios cuerpos, un solo sonido |
| Portador | Élite | Escuda a otros, hay que flanquearlo | Placas dorsales |

Diseño de lectura: **cada enemigo tiene un color y una silueta propios**. Si el jugador no puede nombrarlo en un segundo, el diseño está mal.

---

## 5. Jefes

### Centinela del Cielo Roto (Acto I)

Guardián de la primera astilla. No odia a Lian: ejecuta una orden que ya no tiene sentido.

- **Fase 1 (100–60 %)**: carga lineal telegrafiada + abanico de cinco orbes.
- **Fase 2 (60–25 %)**: añade golpe al suelo con onda expansiva y llama dos Espectros.
- **Fase 3 (<25 %)**: espiral continua de orbes, carga doble, el escenario pierde gravedad un segundo.

Frase de muerte: *"La orden era sostener. Nadie dijo sostener qué."*

### La Cómplice (Acto II)

Combate de espejo: usa tus mismas habilidades con retraso de nueve minutos. Se resuelve descubriendo qué ataque está repitiendo.

### El Coro (Acto III)

No tiene barra de vida única. Hay que silenciar cinco voces en el escenario mientras el coro canta; cada voz callada acorta el canto.

### La Ancla (Acto IV)

La espada. Cambia de forma según el estilo que lleves. El combate enseña el sistema en lugar de examinarlo.

---

## 6. Mapas

Cada isla es un grafo de 8–14 salas con tres tipos:

- **Sala de tránsito** — combate corto, enseña un verbo.
- **Sala de decisión** — dos puertas, recompensa distinta, ninguna obligatoria.
- **Sala de descanso** — guardado, mejora, conversación.

Sin minimapa permanente. Un mapa de papel que se rellena al explorar, consultable desde el menú.

### Isla I — Jardín de las Cimas (vertical slice)

1. **Terraza Baja** — tutorial sin texto: un enemigo, un hueco, una puerta.
2. **Jardín Quebrado** — tres oleadas, arena abierta, columnas rompibles.
3. **Ascenso** — pasillo con Espectros, castiga correr.
4. **Cima del Centinela** — jefe.

---

## 7. Interfaz

- Vida y Qi arriba a la izquierda, siempre visibles, sin números grandes.
- Nombre de la oleada/sala centrado, desaparece a los dos segundos.
- Diálogo en panel inferior, avance por toque o tecla, sin elección salvo en tres momentos del juego.
- Menú de pausa con: Continuar, Estilo, Mapa, Guardar, Ajustes.
- **Móvil**: joystick virtual a la izquierda, tres botones a la derecha (Corte, Corte Celestial, Esquiva), respetando las zonas seguras del dispositivo. Ningún gesto del navegador debe interferir con el combate.

---

## 8. Dirección de arte

- Paleta: índigo profundo, jade, oro pálido para lo sagrado, violeta para lo roto.
- Luz: una sola fuente por sala, sombras largas, niebla baja.
- Personajes: silueta legible a 64 px de alto, sin detalles que se pierdan.
- Efectos: el corte deja una estela fina; el impacto, una chispa corta; nada de explosiones blandas.

### Recursos necesarios por isla

- 1 tileset de suelo + 1 de pared + 3 props.
- 1 hoja de personaje jugable (8 direcciones, 6 animaciones).
- 4 enemigos × 4 animaciones.
- 1 jefe × 6 animaciones.
- 1 pista musical por isla + 1 tema de jefe + 1 de descanso.

---

## 9. Estado técnico real

Lo único ejecutado y comprobado en este repositorio:

- **Vertical slice web** (`index.html`, `assets/game.js`, `assets/style.css`): arena única, tres oleadas, un jefe con tres fases, controles de teclado y táctiles, HUD, diálogo, guardado en `localStorage`. Arte procedural (formas y degradados), sin assets externos.
- Verificado ejecutándolo en Chromium y capturando la pantalla. Ver `docs/VERIFICACION.md`.

Lo que **no** está hecho:

- Arte y audio finales.
- Actos II–V, mapas de isla, secundarios, misiones.
- Build de Android empaquetada.
- Cualquier integración con AI Game Maker: no se ha identificado la herramienta ni se ha ejecutado nada dentro de ella.

## 10. Compatibilidad con AI Game Maker

Para trasladar esto a una herramienta de creación por bloques o asistida, hace falta saber tres cosas que aún no tenemos:

1. Nombre exacto y desarrollador de la aplicación (o enlace de tienda).
2. Si exporta a Android de forma nativa, web o solo dentro de la app.
3. Qué acepta como entrada: bloques, scripts en un lenguaje propio, JavaScript, o solo prompts.

Sin esos tres datos, cualquier afirmación sobre compatibilidad sería inventada. Lo que sí es cierto: los sistemas de las secciones 3–7 están escritos como reglas, no como código, y se pueden reimplementar en cualquiera de esos modelos.
