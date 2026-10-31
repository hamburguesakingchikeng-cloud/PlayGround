const P = {
  sword: '<path d="M14.5 3.5 20 9l-9 9-3 1-1-3 9-9Z"/><path d="m4 20 3-3M3 21l2-2"/>',
  wand: '<path d="m5 19 9-9"/><path d="m14 10 2-2 4 4-2 2-4-4Z"/><circle cx="6" cy="6" r="2"/>',
  bow: '<path d="M6 3c6 3 9 9 9 15M6 3l-1 3M15 18l-2 3M9 9l6 6"/>',
  scythe: '<path d="M5 21 17 5"/><path d="M17 5c3 1 5 3 5 6-4-3-8-4-12-3"/>',
  helm: '<path d="M5 12a7 7 0 0 1 14 0v5H5v-5Z"/><path d="M9 17v-4M15 17v-4"/>',
  chest: '<path d="M8 4 4 7v11l8 3 8-3V7l-4-3-4 2-4-2Z"/><path d="M12 6v15"/>',
  gloves: '<path d="M7 12V5a2 2 0 0 1 4 0v6M11 11V4a2 2 0 0 1 4 0v7M15 11V6a2 2 0 0 1 4 0v8c0 4-3 7-7 7s-7-3-7-7v-4"/>',
  boots: '<path d="M8 3v9l-3 4v4h13v-3c-3-1-4-3-4-6V3H8Z"/>',
  ring: '<circle cx="12" cy="14" r="5"/><path d="m9 9 3-6 3 6"/>',
  amulet: '<path d="M6 4c2 5 4 7 6 7s4-2 6-7"/><circle cx="12" cy="15" r="4"/>',
  heart: '<path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/>',
  shield: '<path d="M12 3 20 6v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z"/>',
  magnet: '<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4H6Z"/>',
  clover: '<path d="M12 12c-5-1-6-6-2-7 2-1 4 1 4 4 0-3 2-5 4-4 4 1 3 6-2 7 5 1 6 6 2 7-2 1-4-1-4-4 0 3-2 5-4 4-4-1-3-6 2-7Z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  skull: '<path d="M12 3a8 8 0 0 0-5 14v4h10v-4a8 8 0 0 0-5-14Z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 17h4"/>',
  leaf: '<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16Z"/><path d="M4 20 14 10"/>',
  book: '<path d="M4 5c3-2 5-2 8 0 3-2 5-2 8 0v14c-3-2-5-2-8 0-3-2-5-2-8 0V5Z"/><path d="M12 5v14"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 9h5a2 2 0 0 1 0 4H9"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 6 10 6 10 0M7 21c0-6 10-6 10 0"/>',
  bag: '<path d="M6 8h12l2 12H4L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4V9Z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4V9Z"/><path d="m17 9 4 6M21 9l-4 6"/>',
  reroll: '<path d="M20 12a8 8 0 1 1-2-5"/><path d="M20 4v5h-5"/>',
  chest: '<path d="M4 10h16v10H4V10Z"/><path d="M3 7h18v3H3V7Z"/><path d="M10 13h4v4h-4z"/>',
  bolt: '<path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z"/>',
  circle: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  flame: '<path d="M12 3c4 5 6 7 6 10a6 6 0 0 1-12 0c0-2 1-4 3-6 0 2 1 3 2 3 0-2 1-4 1-7Z"/>',
};

export function icon(name, cls = '') {
  const path = P[name] || P.skull;
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
