import type { FilterDefinition } from '../types';

export const FILTER_CATEGORIES = [
  { id: 'animal'    as const, label: '🐾 Dyr' },
  { id: 'makeup'    as const, label: '💄 Makeup' },
  { id: 'character' as const, label: '👻 Karakter' },
  { id: 'style'     as const, label: '🎨 Stil' },
  { id: 'effect'    as const, label: '✨ Effekt' },
];

export const FILTERS: FilterDefinition[] = [
  // Animal
  { id:'dog',              label:'Hund',        icon:'🐶', category:'animal',    description:'Hunde-ører, næse og tunge' },
  { id:'cat',              label:'Kat',          icon:'🐱', category:'animal',    description:'Katteøjne med slidsepupiller' },
  { id:'bunny',            label:'Kanin',        icon:'🐰', category:'animal',    description:'Lange ører og lyserød næse' },
  { id:'fox',              label:'Ræv',          icon:'🦊', category:'animal',    description:'Spidse ører og hvide kinder' },
  { id:'lion',             label:'Løve',         icon:'🦁', category:'animal',    description:'Animeret manke og knurhår' },
  // Makeup
  { id:'lip_red',          label:'Rød læbe',     icon:'💋', category:'makeup',   description:'Klassisk rød læbestift' },
  { id:'lip_pink',         label:'Pink læbe',    icon:'🌸', category:'makeup',   description:'Blød pink med glans' },
  { id:'eyeshadow_smoky',  label:'Smoky Eye',    icon:'🖤', category:'makeup',   description:'Blended sort øjenskygge' },
  { id:'eyeshadow_glam',   label:'Glitter Eye',  icon:'✨', category:'makeup',   description:'Guldglitter øjenskygge' },
  { id:'full_glam',        label:'Full Glam',    icon:'👑', category:'makeup',   description:'Kontur + highlighter + vipper' },
  // Character
  { id:'vampire',          label:'Vampyr',       icon:'🧛', category:'character', description:'Hugtænder og blod' },
  { id:'zombie',           label:'Zombie',       icon:'🧟', category:'character', description:'Blodskudte øjne og sår' },
  { id:'devil',            label:'Djævel',       icon:'😈', category:'character', description:'Røde horn og glødende øjne' },
  { id:'angel',            label:'Engel',        icon:'😇', category:'character', description:'Glødende glorie og vinger' },
  { id:'alien',            label:'Alien',        icon:'👽', category:'character', description:'Store sorte øjne og glød' },
  // Style
  { id:'neon',             label:'Neon',         icon:'⚡', category:'style',    description:'Farverige kantlinjer på mørk baggrund' },
  { id:'cyberpunk',        label:'Cyberpunk',    icon:'🤖', category:'style',    description:'HUD-ringe, kredsløb og scanning' },
  { id:'gold',             label:'Guld',         icon:'🏆', category:'style',    description:'Guldpartikler og metallic makeup' },
  { id:'cartoon',          label:'Tegneserie',   icon:'🎨', category:'style',    description:'Fed omrids og halvtone-rødme' },
  { id:'noir',             label:'Noir',         icon:'🎞️', category:'style',   description:'Sort/hvid med filmkorn og vignette' },
  { id:'watercolor',       label:'Akvarel',      icon:'🖌️', category:'style',   description:'Bløde pastelfarver' },
  { id:'oil_paint',        label:'Olie-maleri',  icon:'🖼️', category:'style',   description:'Malet penselstrøg og rige farver' },
  // Effect
  { id:'glitch',           label:'Glitch',       icon:'📺', category:'effect',   description:'RGB-kanal split og støj' },
  { id:'thermal',          label:'Termisk',      icon:'🌡️', category:'effect',  description:'Infrarød varmekort-palet' },
  { id:'night_vision',     label:'Nattesyn',     icon:'🌙', category:'effect',   description:'Grøn nattesyn med crosshair' },
  { id:'hologram',         label:'Hologram',     icon:'💠', category:'effect',   description:'Cyan holografisk overlay' },
  { id:'infrared',         label:'Infrared',     icon:'🔴', category:'effect',   description:'Infrarød farvepalet' },
];

export const ALL_FILTERS: FilterDefinition[] = [
  { id:'none', label:'Ingen', icon:'🚫', category:'animal', description:'Intet filter' },
  ...FILTERS,
];
