import { Banner } from '@/types/chat';

export interface DetailedBanner extends Banner {
  category: 'automatic' | 'unlockable' | 'exclusive';
  requirement: string;
  isTemporary?: boolean;
  hasAnimation?: boolean;
}

export const DETAILED_BANNERS: DetailedBanner[] = [
  // 🌟 Automáticos (según reacciones en el chat)
  {
    id: 'adorado',
    name: 'Adorado',
    emoji: '❤️',
    rarity: 'epic',
    description: 'Si tus últimos mensajes acumulan muchos ❤️',
    category: 'automatic',
    requirement: 'Recibe más ❤️ que cualquier otra reacción en el chat actual',
    isTemporary: true
  },
  {
    id: 'cacas',
    name: 'El Cacas',
    emoji: '💩',
    rarity: 'common',
    description: 'Si recibes más 💩 que cualquier otra reacción',
    category: 'automatic',
    requirement: 'El usuario con más 💩 en el chat actual',
    isTemporary: true
  },
  {
    id: 'popular',
    name: 'Popular',
    emoji: '🔥',
    rarity: 'rare',
    description: 'Cuando eres el que más reacciones acumula en el chat actual',
    category: 'automatic',
    requirement: 'El usuario con más reacciones totales en el chat',
    isTemporary: true
  },
  {
    id: 'espanta-viejas',
    name: 'Espanta Viejas',
    emoji: '👻',
    rarity: 'common',
    description: 'Si recibes varias 💩 + 😂 en combinación',
    category: 'automatic',
    requirement: 'Recibe al menos 3 💩 y 3 😂 en tus mensajes recientes',
    isTemporary: true
  },
  {
    id: 'coquito',
    name: 'Coquito',
    emoji: '🧠',
    rarity: 'rare',
    description: 'Cuando recibes varias 💡 en tus mensajes (inteligente)',
    category: 'automatic',
    requirement: 'El usuario con más 💡 en el chat actual',
    isTemporary: true
  },
  {
    id: 'siuuuuu',
    name: 'Siuuuuu',
    emoji: '⚽',
    rarity: 'rare',
    description: 'Activado cuando recibes varias 💪 o 😂 seguidas (modo hype)',
    category: 'automatic',
    requirement: 'Recibe al menos 5 💪 o 😂 en tus últimos mensajes',
    isTemporary: true
  },

  // 🏆 Desbloqueables por Misiones
  {
    id: 'nuevo-h',
    name: 'Nuevo en H',
    emoji: '👶',
    rarity: 'common',
    description: 'Primer mensaje enviado',
    category: 'unlockable',
    requirement: 'Envía tu primer mensaje en el chat'
  },
  {
    id: 'leyenda',
    name: 'La Leyenda',
    emoji: '👑',
    rarity: 'legendary',
    description: '100 reacciones acumuladas en total',
    category: 'unlockable',
    requirement: 'Acumula 100 reacciones en total'
  },
  {
    id: 'goat',
    name: 'El GOAT',
    emoji: '🐐',
    rarity: 'epic',
    description: '50 ❤️ en total',
    category: 'unlockable',
    requirement: 'Recibe 50 ❤️ en total'
  },
  {
    id: 'bello-cur',
    name: 'Lo más bello de la CUR',
    emoji: '💕',
    rarity: 'epic',
    description: '25 ❤️ recibidos en una sola semana',
    category: 'unlockable',
    requirement: 'Recibe 25 ❤️ en una semana'
  },
  {
    id: 'todo-terreno',
    name: 'Todo Terreno',
    emoji: '🎭',
    rarity: 'rare',
    description: 'Recibe al menos 5 ❤️, 5 💡 y 5 😂',
    category: 'unlockable',
    requirement: 'Recibe 5 de cada: ❤️, 💡, 😂'
  },
  {
    id: 'constante',
    name: 'Constante',
    emoji: '⏳',
    rarity: 'rare',
    description: 'Chatear 7 días seguidos sin faltar',
    category: 'unlockable',
    requirement: 'Envía al menos 1 mensaje por día durante 7 días consecutivos'
  },
  {
    id: 'brujo',
    name: 'El Brujo',
    emoji: '🔮',
    rarity: 'rare',
    description: 'Recibir 15 💡 en total',
    category: 'unlockable',
    requirement: 'Acumula 15 💡 en total'
  },
  {
    id: 'payaso',
    name: 'Payaso',
    emoji: '🤡',
    rarity: 'common',
    description: '20 😂 en total',
    category: 'unlockable',
    requirement: 'Acumula 20 😂 en total'
  },
  {
    id: 'modo-diablo',
    name: 'Modo Diablo',
    emoji: '😈',
    rarity: 'epic',
    description: 'Envía 200 mensajes',
    category: 'unlockable',
    requirement: 'Envía 200 mensajes en total'
  },

  // 🎖️ Exclusivos / Especiales
  {
    id: 'fundador',
    name: 'Fundador y Rey del Todo',
    emoji: '👑🔥',
    rarity: 'legendary',
    description: 'Solo se desbloquea con contraseña secreta. Tiene animación épica al enviar mensajes',
    category: 'exclusive',
    requirement: 'Ingresa la contraseña secreta',
    hasAnimation: true
  },
  {
    id: 'misterioso',
    name: 'Misterioso',
    emoji: '🕶️',
    rarity: 'epic',
    description: 'Desbloqueado al no hablar durante 7 días y luego enviar 1 mensaje',
    category: 'exclusive',
    requirement: 'No envíes mensajes por 7 días, luego envía 1 mensaje'
  },
  {
    id: 'inmortal',
    name: 'Inmortal',
    emoji: '⚔️',
    rarity: 'legendary',
    description: 'Estar 1 mes activo sin perder racha',
    category: 'exclusive',
    requirement: 'Mantén actividad diaria por 30 días consecutivos'
  },
  {
    id: 'corazon-oro',
    name: 'Corazón de Oro',
    emoji: '💛',
    rarity: 'epic',
    description: 'Conseguir 20 ❤️ en un solo día',
    category: 'exclusive',
    requirement: 'Recibe 20 ❤️ en un solo día'
  },
  {
    id: 'fantasma',
    name: 'El Fantasma',
    emoji: '👻',
    rarity: 'rare',
    description: 'Estar conectado pero no escribir nada por 3 días',
    category: 'exclusive',
    requirement: 'Mantente conectado sin enviar mensajes por 3 días'
  }
];