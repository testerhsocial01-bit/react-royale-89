export interface User {
  id: string;
  name?: string;
  username?: string;
  avatar: string;
  avatar_emoji?: string;
  likes: number;
  permanentBanner: Banner;
  temporaryBanner?: Banner;
  isTopUser?: boolean;
}

export interface Banner {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  reactions: Record<string, Reaction>;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  users: User[];
  topMessage?: {
    messageId: string;
    userId: string;
    reactionType: string;
    count: number;
  };
}