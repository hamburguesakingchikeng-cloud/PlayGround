// Misiones principales y secundarias.
export const QUESTS = {
  main_awakening: {
    id: 'main_awakening', type: 'main', region: 'valdoria', title: 'El despertar',
    desc: 'Has vuelto a abrir los ojos en Valdoria. La Anciana Maren sabe por qué.',
    stages: [
      { text: 'Habla con la Anciana Maren en la Aldea de Lumen.', objectives: [{ type: 'talk', target: 'maren', label: 'Habla con Maren' }] },
    ],
    rewards: { xp: 80, gold: 50, items: [['potion_lumen', 2]], skillPoints: 0 },
    next: 'main_shrine',
  },
  main_shrine: {
    id: 'main_shrine', type: 'main', region: 'valdoria', title: 'La espada dormida',
    desc: 'El Santuario de la Estrella guarda un arma que no pertenece a este mundo.',
    stages: [
      { text: 'Llega al Santuario de la Estrella y examina el altar.', objectives: [{ type: 'interact', target: 'shrine-altar', label: 'Examina el altar' }] },
      { text: 'Sobrevive a la emboscada de los espectros.', objectives: [{ type: 'kill', target: 'wraith', count: 3, label: 'Derrota espectros' }] },
      { text: 'Habla con Lyra, la erudita que te observa.', objectives: [{ type: 'talk', target: 'lyra', label: 'Habla con Lyra' }] },
    ],
    rewards: { xp: 180, gold: 100, items: [['potion_lumen', 2]], skillPoints: 1 },
    next: 'main_roots',
  },
  main_roots: {
    id: 'main_roots', type: 'main', region: 'valdoria', title: 'Raíces corruptas',
    desc: 'Las Ruinas de Lumen esconden al Guardián que sostiene lo que queda del bosque.',
    stages: [
      { text: 'Enciende los tres brasales de las ruinas en el orden correcto.', objectives: [{ type: 'flag', target: 'val-puzzle', label: 'Resuelve el ritual de brasales' }] },
      { text: 'Abre el sello y derrota al Guardián de Raíces.', objectives: [{ type: 'boss', target: 'guardian', label: 'Derrota al Guardián' }] },
      { text: 'Recoge el Fragmento de la Gema.', objectives: [{ type: 'collect', target: 'gem_shard', count: 1, label: 'Fragmento de Gema' }] },
    ],
    rewards: { xp: 350, gold: 220, items: [['crystal_resonance', 2]], skillPoints: 1 },
    onComplete: { flags: { gem1: true } },
    next: 'main_drakmor',
  },
  main_drakmor: {
    id: 'main_drakmor', type: 'main', region: 'drakmor', title: 'Ceniza y juramento',
    desc: 'La Lágrima de la Primera Brasa sigue latiendo en la Fortaleza de Cendra.',
    stages: [
      { text: 'Cruza el Umbral de Drakmor y encuentra a Kael en el Puesto de Cendra.', objectives: [{ type: 'talk', target: 'kael', label: 'Habla con Kael' }] },
      { text: 'Activa las dos Runas de la Forja para abrir la Fortaleza.', objectives: [{ type: 'flag', target: 'drak-runes', label: 'Activa las runas' }] },
      { text: 'Derrota a la Dama de la Brasa y consigue la Lágrima.', objectives: [{ type: 'boss', target: 'dama', label: 'Derrota a la Dama' }] },
      { text: 'Decide qué hacer con la Dama.', objectives: [{ type: 'flag', target: 'dama-choice', label: 'Toma una decisión' }] },
    ],
    rewards: { xp: 650, gold: 380, items: [['potion_lumen', 4], ['living_ash', 4]], skillPoints: 1 },
    onComplete: { flags: { tear: true } },
    next: 'main_kansordore',
  },
  main_kansordore: {
    id: 'main_kansordore', type: 'main', region: 'kansordore', title: 'El cielo que recuerda',
    desc: 'Kansordore guarda la verdad sobre la Gema, el Velo y el Jugador Cero.',
    stages: [
      { text: 'Llega al Templo del Origen y habla con Aurel.', objectives: [{ type: 'talk', target: 'aurel', label: 'Habla con Aurel' }] },
      { text: 'Alinea los tres cristales de la Biblioteca Prohibida.', objectives: [{ type: 'flag', target: 'kan-library', label: 'Resuelve los cristales' }] },
      { text: 'Recupera las tres Páginas Prohibidas.', objectives: [{ type: 'collect', target: 'ancient_page', count: 3, label: 'Páginas prohibidas' }] },
      { text: 'Abre el Corazón del Velo.', objectives: [{ type: 'flag', target: 'kan-open', label: 'Abre el Corazón del Velo' }] },
    ],
    rewards: { xp: 900, gold: 500, items: [['celestial_plume', 2], ['elixir_mana', 4]], skillPoints: 2 },
    next: 'main_veil',
  },
  main_veil: {
    id: 'main_veil', type: 'main', region: 'kansordore', title: 'Jugador Cero',
    desc: 'El Velo te espera en el centro de la Convergencia. La elección es tuya.',
    stages: [
      { text: 'Derrota a El Velo en el Corazón de la Convergencia.', objectives: [{ type: 'boss', target: 'veil', label: 'Derrota a El Velo' }] },
      { text: 'Elige el destino de la Convergencia.', objectives: [{ type: 'flag', target: 'ending-choice', label: 'Elige un final' }] },
    ],
    rewards: { xp: 2000, gold: 1000, items: [], skillPoints: 3 },
  },

  side_lilies: {
    id: 'side_lilies', type: 'side', region: 'valdoria', title: 'Lirios para el altar',
    desc: 'Elna necesita cinco Lirios de Luna para el ritual de los caídos.',
    stages: [
      { text: 'Recoge cinco Lirios de Luna en Valdoria.', objectives: [{ type: 'collect', target: 'moon_lily', count: 5, label: 'Lirios de Luna' }] },
      { text: 'Lleva los lirios a Elna.', objectives: [{ type: 'talk', target: 'elna', label: 'Habla con Elna' }] },
    ],
    rewards: { xp: 120, gold: 90, items: [['potion_lumen', 3], ['antidote', 2]], skillPoints: 0 },
    onComplete: { flags: { lilies: true } },
  },
  side_hammer: {
    id: 'side_hammer', type: 'side', region: 'valdoria', title: 'El martillo de Orin',
    desc: 'Orin perdió su martillo en las ruinas. Sin él, la forja está de luto.',
    stages: [
      { text: 'Encuentra el Martillo de Orin en las Ruinas de Lumen.', objectives: [{ type: 'collect', target: 'orin_hammer', count: 1, label: 'Martillo de Orin' }] },
      { text: 'Devuélvele el martillo a Orin.', objectives: [{ type: 'talk', target: 'orin', label: 'Habla con Orin' }] },
    ],
    rewards: { xp: 150, gold: 140, items: [['pilgrim_blade', 1], ['iron', 4]], skillPoints: 0 },
    onComplete: { flags: { hammer: true } },
  },
  side_echo: {
    id: 'side_echo', type: 'side', region: 'valdoria', title: 'El eco perdido',
    desc: 'Tilo dice que ha visto un Musgo Luminoso llorando cerca del río. Quiere uno.',
    stages: [
      { text: 'Captura un Musgo Luminoso debilitándolo y usando Sintonizar.', objectives: [{ type: 'capture', target: 'musgo', label: 'Captura un Musgo' }] },
      { text: 'Muéstrale la resonancia a Tilo.', objectives: [{ type: 'talk', target: 'tilo', label: 'Habla con Tilo' }] },
    ],
    rewards: { xp: 100, gold: 60, items: [['resonance_ring', 1], ['crystal_resonance', 2]], skillPoints: 0 },
    onComplete: { flags: { tilo_echo: true } },
  },
  side_survivors: {
    id: 'side_survivors', type: 'side', region: 'drakmor', title: 'Los que no ardieron',
    desc: 'Kael busca a cuatro supervivientes de la Fortaleza. Cada marca en su chapa es un nombre.',
    stages: [
      { text: 'Encuentra a los cuatro supervivientes de Cendra.', objectives: [
        { type: 'flag', target: 'survivor1', label: 'Superviviente del bosque' },
        { type: 'flag', target: 'survivor2', label: 'Superviviente de la forja' },
        { type: 'flag', target: 'survivor3', label: 'Superviviente del umbral' },
        { type: 'flag', target: 'survivor4', label: 'Superviviente de la muralla' },
      ] },
      { text: 'Lleva las marcas a Kael.', objectives: [{ type: 'talk', target: 'kael', label: 'Habla con Kael' }] },
    ],
    rewards: { xp: 300, gold: 260, items: [['ash_cloak', 1], ['living_ash', 3]], skillPoints: 1 },
    onComplete: { flags: { survivors: true, kael_trust: true } },
  },
  side_obsidian: {
    id: 'side_obsidian', type: 'side', region: 'drakmor', title: 'Corazón de obsidiana',
    desc: 'Nira paga bien por los núcleos de los golems. «No preguntes para qué», dice.',
    stages: [
      { text: 'Derrota a cinco Golems de Obsidiana.', objectives: [{ type: 'kill', target: 'golem', count: 5, label: 'Golems derrotados' }] },
      { text: 'Cobra la recompensa con Nira.', objectives: [{ type: 'talk', target: 'nira', label: 'Habla con Nira' }] },
    ],
    rewards: { xp: 280, gold: 340, items: [['gem_shard', 1], ['obsidian_helm', 1]], skillPoints: 0 },
    onComplete: { flags: { nira_paid: true } },
  },
  side_garden: {
    id: 'side_garden', type: 'side', region: 'kansordore', title: 'El jardín imposible',
    desc: 'Vela cultiva un jardín con semillas de mundos que ya no existen. Los Serafines lo están quemando.',
    stages: [
      { text: 'Derrota a tres Serafines Corruptos.', objectives: [{ type: 'kill', target: 'seraph', count: 3, label: 'Serafines derrotados' }] },
      { text: 'Habla con Vela en la Biblioteca.', objectives: [{ type: 'talk', target: 'vela', label: 'Habla con Vela' }] },
    ],
    rewards: { xp: 420, gold: 300, items: [['celestial_plume', 2], ['halo', 1]], skillPoints: 1 },
    onComplete: { flags: { garden: true } },
  },
  side_balance: {
    id: 'side_balance', type: 'side', region: 'kansordore', title: 'La balanza de Aurel',
    desc: 'Aurel te ofrece una elección: entregar tus esencias o conservarlas. Ninguna es gratis.',
    stages: [
      { text: 'Lleva tres Esencias de Resonancia a Aurel.', objectives: [{ type: 'collect', target: 'resonance_essence', count: 3, label: 'Esencias de Resonancia' }] },
      { text: 'Escucha la balanza de Aurel.', objectives: [{ type: 'talk', target: 'aurel', label: 'Habla con Aurel' }] },
    ],
    rewards: { xp: 360, gold: 200, items: [['lucky_charm', 1]], skillPoints: 0 },
    onComplete: { flags: { balance: true } },
  },
};

export const MAIN_QUESTS = Object.values(QUESTS).filter(q => q.type === 'main');
export const SIDE_QUESTS = Object.values(QUESTS).filter(q => q.type === 'side');
