import { User, Banner, Message, Chat } from '@/types/chat';

export const BANNERS: Banner[] = [
  // Permanent Banners (por likes)
  { id: 'nuevo', name: 'Nuevo en el chat', emoji: '🔰', rarity: 'common', description: '10+ likes' },
  { id: 'popular', name: 'Popular', emoji: '⭐', rarity: 'rare', description: '50+ likes' },
  { id: 'querido', name: 'Muy querido', emoji: '💖', rarity: 'epic', description: '100+ likes' },
  { id: 'leyenda', name: 'Leyenda', emoji: '👑', rarity: 'legendary', description: '500+ likes' },
  
  // Temporary Banners (por reacciones top)
  { id: 'cacas', name: 'El Cacas', emoji: '💩', rarity: 'common', description: 'Más 💩 en el chat' },
  { id: 'comediante', name: 'Comediante', emoji: '🎭', rarity: 'rare', description: 'Más 😂 en el chat' },
  { id: 'inteligente', name: 'Inteligente', emoji: '🤓', rarity: 'epic', description: 'Más 💡 en el chat' },
  { id: 'adorado', name: 'Adorado', emoji: '❤️', rarity: 'legendary', description: 'Más ❤️ en el chat' }
];

export const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex',
    avatar: '👨‍💻',
    likes: 156,
    permanentBanner: BANNERS[2], // Muy querido
    temporaryBanner: BANNERS[7], // Adorado (top del chat)
    isTopUser: true
  },
  {
    id: 'user-2',
    name: 'Maria',
    avatar: '👩‍🎨',
    likes: 89,
    permanentBanner: BANNERS[1], // Popular
    temporaryBanner: BANNERS[5] // Comediante
  },
  {
    id: 'user-3',
    name: 'Carlos',
    avatar: '🧙‍♂️',
    likes: 23,
    permanentBanner: BANNERS[0], // Nuevo
    temporaryBanner: BANNERS[4] // El Cacas
  },
  {
    id: 'current-user',
    name: 'Tú',
    avatar: '😎',
    likes: 67,
    permanentBanner: BANNERS[1] // Popular
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    userId: 'user-2',
    content: '¡Hola a todos! ¿Qué tal el fin de semana? 😊',
    timestamp: new Date(Date.now() - 3600000),
    reactions: {
      '😂': { emoji: '😂', count: 3, users: ['user-1', 'user-3', 'current-user'] },
      '❤️': { emoji: '❤️', count: 2, users: ['user-1', 'current-user'] }
    }
  },
  {
    id: 'msg-2', 
    userId: 'user-3',
    content: 'jajaja que burrada lo de ayer 💩💩💩',
    timestamp: new Date(Date.now() - 3000000),
    reactions: {
      '💩': { emoji: '💩', count: 8, users: ['user-1', 'user-2', 'current-user'] },
      '😂': { emoji: '😂', count: 4, users: ['user-1', 'user-2'] }
    }
  },
  {
    id: 'msg-3',
    userId: 'user-1', 
    content: 'Creo que deberíamos organizar mejor nuestras reuniones. Tengo algunas ideas interesantes 💡',
    timestamp: new Date(Date.now() - 1800000),
    reactions: {
      '❤️': { emoji: '❤️', count: 12, users: ['user-2', 'user-3', 'current-user'] },
      '💡': { emoji: '💡', count: 6, users: ['user-2', 'current-user'] }
    }
  },
  {
    id: 'msg-4',
    userId: 'current-user',
    content: '¡Me encanta esta nueva función de reacciones! 🚀',
    timestamp: new Date(Date.now() - 600000),
    reactions: {
      '🚀': { emoji: '🚀', count: 2, users: ['user-1', 'user-2'] }
    }
  }
];

export const MOCK_CHAT: Chat = {
  id: 'main-chat',
  name: 'Chat Principal', 
  messages: MOCK_MESSAGES,
  users: USERS,
  topMessage: {
    messageId: 'msg-3',
    userId: 'user-1', 
    reactionType: '❤️',
    count: 12
  }
};