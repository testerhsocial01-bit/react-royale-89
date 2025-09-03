import { useState } from 'react';
import { MessageBubbleV2 } from './MessageBubbleV2';
import { MobileMenu } from './MobileMenu';
import { AchievementNotification } from './AchievementNotification';
import { FloatingNotification } from './FloatingNotification';
import { useChatSimple } from '@/hooks/useChatSimple';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAutomaticBanners } from '@/hooks/useAutomaticBanners';
import { Send, Award, LogOut, User, MessageSquare, ArrowLeft, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatAppV2Props {
  roomId?: string;
}

export const ChatAppV2 = ({ roomId }: ChatAppV2Props) => {
  const { user, signOut } = useAuth();
  const { messages, banners, roomMembers, roomInfo, getUserAutomaticBanners, loading, sendMessage, toggleReaction, likeUser } = useChatSimple(roomId);
  const [newMessage, setNewMessage] = useState('');
  const [notification, setNotification] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  const isMobile = useIsMobile();
  
  const EMOJI_OPTIONS = ['😂', '❤️', '💡', '💩', '🚀', '🔥', '👍', '👎', '😍', '😢', '😮', '🎉', '🤔', '😎', '🤗', '🙌', '✨', '💪', '🎯', '🌟'];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const handleLikeUser = (userId: string) => {
    likeUser(userId);
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleNotification = (message: string) => {
    setNotification(message);
    setShowNotification(true);
  };

  const hideNotification = () => {
    setShowNotification(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AchievementNotification onNotification={handleNotification} />
      <FloatingNotification 
        message={notification}
        show={showNotification}
        onHide={hideNotification}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-card">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {roomId && (
            <Button variant="ghost" size="sm" asChild className="p-1 md:p-2">
              <Link to="/" className="flex items-center">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          )}
          <div className="text-xl md:text-2xl">💬</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm md:text-lg font-semibold text-foreground truncate">
              {roomInfo ? roomInfo.name : 'Chat Principal'}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">{roomMembers.length} usuarios</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <div className="text-sm text-muted-foreground max-w-[150px] truncate flex items-center gap-1">
            <span className="text-lg">{user?.user_metadata?.avatar_emoji || '🧑‍💻'}</span>
            <span>{user?.user_metadata?.name || user?.email}</span>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link to="/rooms" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Salas
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link to="/banners" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Banners
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu roomId={roomId} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No hay mensajes aún. ¡Sé el primero en escribir algo!</p>
          </div>
        ) : (
          messages.map((message: any) => {
            const user = message.profiles;
            if (!user) return null;

            return (
              <MessageBubbleV2
                key={message.id}
                message={message}
                automaticBanners={getUserAutomaticBanners()}
                onToggleReaction={handleReact}
                onLikeUser={handleLikeUser}
              />
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 md:p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isMobile ? "Mensaje..." : "Escribe un mensaje..."}
            className="flex-1 text-sm md:text-base"
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="shrink-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-2 bg-card border-border" 
              align="end"
              sideOffset={5}
            >
              <div className="grid grid-cols-5 gap-1">
                {EMOJI_OPTIONS.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-lg hover:bg-muted"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleSendMessage} size={isMobile ? "sm" : "default"}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};