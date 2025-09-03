import { useState, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { User, Message, Chat } from '@/types/chat';
import { MOCK_CHAT, BANNERS } from '@/data/mockData';
import { Send, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const ChatApp = () => {
  const [chat, setChat] = useState<Chat>(MOCK_CHAT);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  // Calcular el mensaje top y asignar banner temporal
  useEffect(() => {
    const messages = chat.messages;
    let topMessage = null;
    let maxReactions = 0;
    let topReactionType = '';

    messages.forEach(message => {
      Object.entries(message.reactions).forEach(([emoji, reaction]) => {
        if (reaction.count > maxReactions) {
          maxReactions = reaction.count;
          topMessage = {
            messageId: message.id,
            userId: message.userId,
            reactionType: emoji,
            count: reaction.count
          };
          topReactionType = emoji;
        }
      });
    });

    if (topMessage) {
      const newChat = { ...chat };
      newChat.topMessage = topMessage;

      // Limpiar banners temporales previos
      newChat.users = newChat.users.map(user => ({
        ...user,
        temporaryBanner: undefined,
        isTopUser: false
      }));

      // Asignar nuevo banner temporal al top user
      const topUser = newChat.users.find(u => u.id === topMessage.userId);
      if (topUser) {
        let bannerType = '';
        switch (topReactionType) {
          case '💩':
            bannerType = 'cacas';
            break;
          case '😂':
            bannerType = 'comediante';
            break;
          case '💡':
            bannerType = 'inteligente';
            break;
          case '❤️':
            bannerType = 'adorado';
            break;
          default:
            bannerType = 'comediante';
        }

        const banner = BANNERS.find(b => b.id === bannerType);
        if (banner) {
          topUser.temporaryBanner = banner;
          topUser.isTopUser = true;

          // Mostrar notificación
          toast({
            title: "🏆 ¡Nuevo Top del Chat!",
            description: `${topUser.name} ha obtenido el banner "${banner.name}" con ${maxReactions} ${topReactionType}`,
            duration: 4000,
          });
        }
      }

      setChat(newChat);
    }
  }, [chat.messages, toast]);

  const handleReact = (messageId: string, emoji: string) => {
    const newChat = { ...chat };
    const message = newChat.messages.find(m => m.id === messageId);
    const currentUserId = 'current-user';

    if (message) {
      if (!message.reactions[emoji]) {
        message.reactions[emoji] = {
          emoji,
          count: 0,
          users: []
        };
      }

      const reaction = message.reactions[emoji];
      const hasReacted = reaction.users.includes(currentUserId);

      if (hasReacted) {
        // Quitar reacción
        reaction.count = Math.max(0, reaction.count - 1);
        reaction.users = reaction.users.filter(id => id !== currentUserId);
      } else {
        // Agregar reacción
        reaction.count += 1;
        reaction.users.push(currentUserId);
      }

      setChat(newChat);
    }
  };

  const handleLikeUser = (userId: string) => {
    const newChat = { ...chat };
    const user = newChat.users.find(u => u.id === userId);
    
    if (user && userId !== 'current-user') {
      user.likes += 1;

      // Verificar si desbloquea un nuevo banner permanente
      let newBanner = null;
      if (user.likes >= 500) {
        newBanner = BANNERS.find(b => b.id === 'leyenda');
      } else if (user.likes >= 100) {
        newBanner = BANNERS.find(b => b.id === 'querido');
      } else if (user.likes >= 50) {
        newBanner = BANNERS.find(b => b.id === 'popular');
      } else if (user.likes >= 10) {
        newBanner = BANNERS.find(b => b.id === 'nuevo');
      }

      if (newBanner && newBanner.id !== user.permanentBanner.id) {
        user.permanentBanner = newBanner;
        toast({
          title: "✨ ¡Banner Desbloqueado!",
          description: `${user.name} ha obtenido el banner permanente "${newBanner.name}"`,
          duration: 3000,
        });
      }

      setChat(newChat);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: 'current-user',
      content: newMessage,
      timestamp: new Date(),
      reactions: {}
    };

    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💬</div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{chat.name}</h1>
            <p className="text-sm text-muted-foreground">{chat.users.length} usuarios</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/banners">
              <Award className="w-4 h-4 mr-2" />
              Banners
            </Link>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.messages.map(message => {
          const user = chat.users.find(u => u.id === message.userId);
          if (!user) return null;

          const isOwn = message.userId === 'current-user';
          const isTopMessage = chat.topMessage?.messageId === message.id;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              user={user}
              isOwn={isOwn}
              isTopMessage={isTopMessage}
              onReact={handleReact}
              onLikeUser={handleLikeUser}
            />
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="default">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};