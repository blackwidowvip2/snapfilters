import type { FilterDefinition } from '../types';

export const FILTER_CATEGORIES = [
  { id: 'animal' as const,    label: '🐾 Dyr' },
  { id: 'makeup' as const,    label: '💄 Makeup' },
  { id: 'character' as const, label: '👻 Karakter' },
  { id: 'style' as const,     label: '🎨 Stil' },
  { id: 'effect' as const,    label: '✨ Effekt' },
];

export const FILTERS: FilterDefinition[] = [
  // ── Animal ──────────────────────────────────────────────
  {
    id: 'dog',
    label: 'Hund',
    icon: '🐶',
    category: 'animal',
    description: 'Flopping ears, wet nose & whiskers',
  },
  {
    id: 'cat',
    label: 'Kat',
    icon: '🐱',
    category: 'animal',
    description: 'Triangle ears, slit pupils & whiskers',
  },
  {
    id: 'bunny',
    label: 'Kanin',
    icon: '🐰',
    category: 'animal',
    description: 'Tall fluffy ears & pink nose',
  },
  {
    id: 'fox',
    label: 'Ræv',
    icon: '🦊',
    category: 'animal',
    description: 'Pointed ears, white cheeks & orange mask',
  },
  {
    id: 'lion',
    label: 'Løve',
    icon: '🦁',
    category: 'animal',
    description: 'Animated mane & fierce whiskers',
  },
  // ── Makeup ──────────────────────────────────────────────
  {
    id: 'lip_red',
    label: 'Rød læbe',
    icon: '💋',
    category: 'makeup',
    description: 'Classic red lipstick with gloss',
  },
  {
    id: 'lip_pink',
    label: 'Pink læbe',
    icon: '🌸',
    category: 'makeup',
    description: 'Soft pink with shimmer',
  },
  {
    id: 'eyeshadow_smoky',
    label: 'Smoky Eye',
    icon: '🖤',
    category: 'makeup',
    description: 'Blended smoky black with liner & lashes',
  },
  {
    id: 'eyeshadow_glam',
    label: 'Glitter Eye',
    icon: '✨',
    category: 'makeup',
    description: 'Gold glitter eyeshadow & defined brows',
  },
  {
    id: 'full_glam',
    label: 'Full Glam',
    icon: '👑',
    category: 'makeup',
    description: 'Contour + highlight + lashes + red lips',
  },
  // ── Character ───────────────────────────────────────────
  {
    id: 'vampire',
    label: 'Vampyr',
    icon: '🧛',
    category: 'character',
    description: 'Fangs, pale skin tint & blood drips',
  },
  {
    id: 'zombie',
    label: 'Zombie',
    icon: '🧟',
    category: 'character',
    description: 'Green skin, bloodshot eyes & wounds',
  },
  {
    id: 'devil',
    label: 'Djævel',
    icon: '😈',
    category: 'character',
    description: 'Red horns & glowing eyes',
  },
  {
    id: 'angel',
    label: 'Engel',
    icon: '😇',
    category: 'character',
    description: 'Glowing halo & ethereal wings',
  },
  {
    id: 'alien',
    label: 'Alien',
    icon: '👽',
    category: 'character',
    description: 'Large black eyes & bioluminescent markings',
  },
  // ── Style ───────────────────────────────────────────────
  {
    id: 'neon',
    label: 'Neon',
    icon: '⚡',
    category: 'style',
    description: 'Chromatic edge detection on dark bg',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    icon: '🤖',
    category: 'style',
    description: 'HUD rings, circuit lines & teal/magenta',
  },
  {
    id: 'gold',
    label: 'Guld',
    icon: '🏆',
    category: 'style',
    description: 'Gold leaf particles & metallic makeup',
  },
  // ── Effect ──────────────────────────────────────────────
  {
    id: 'glitch',
    label: 'Glitch',
    icon: '📺',
    category: 'effect',
    description: 'RGB channel split & scan-line noise',
  },
  {
    id: 'thermal',
    label: 'Termisk',
    icon: '🌡️',
    category: 'effect',
    description: 'Infrared heat-map palette',
  },
];

export const ALL_FILTERS: FilterDefinition[] = [
  { id: 'none', label: 'Ingen', icon: '🚫', category: 'animal', description: 'No filter' },
  ...FILTERS,
];
