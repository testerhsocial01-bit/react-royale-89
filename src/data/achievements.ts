export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
}

export const achievements: Achievement[] = [
  {
    id: 'first-message',
    name: 'Primer Paso',
    description: 'Envía tu primer mensaje',
    emoji: '🌟',
    rarity: 'common',
    requirement: '1 mensaje enviado'
  },
  {
    id: 'active',
    name: 'Usuario Activo',
    description: 'Participa activamente en conversaciones',
    emoji: '💬',
    rarity: 'rare',
    requirement: '50 mensajes enviados'
  },
  {
    id: 'popular',
    name: 'Popular',
    description: 'Recibe muchas reacciones en tus mensajes',
    emoji: '⭐',
    rarity: 'rare',
    requirement: '50 reacciones recibidas'
  },
  {
    id: 'beloved',
    name: 'Querido',
    description: 'Eres muy querido por la comunidad',
    emoji: '❤️',
    rarity: 'epic',
    requirement: '100 likes recibidos'
  },
  {
    id: 'legend',
    name: 'Leyenda',
    description: 'Has alcanzado el estatus de leyenda',
    emoji: '🏆',
    rarity: 'legendary',
    requirement: '200 reacciones recibidas'
  },
  {
    id: 'champion',
    name: 'Campeón',
    description: 'Maestro de la conversación',
    emoji: '👑',
    rarity: 'legendary',
    requirement: '500 mensajes enviados'
  }
];

export const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'legendary': return 'from-yellow-400 to-orange-500';
    case 'epic': return 'from-purple-400 to-pink-500';
    case 'rare': return 'from-blue-400 to-cyan-500';
    default: return 'from-gray-400 to-gray-500';
  }
};