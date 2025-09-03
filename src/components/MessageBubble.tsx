import { useState } from 'react';
import { Message, User } from '@/types/chat';
import { UserBanner } from './UserBanner';
import { EmojiReactionPanel } from './EmojiReactionPanel';
import { Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageBubbleProps {
  message: Message;
  user: User;
  isOwn: boolean;
  isTopMessage?: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onLikeUser: (userId: string) => void;
}

export const MessageBubble = ({ 
  message, 
  user, 
  isOwn, 
  isTopMessage,
  onReact,
  onLikeUser 
}: MessageBubbleProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const isMobile = useIsMobile();

  const handleLike = () => {
    setIsLikeAnimating(true);
    onLikeUser(user.id);
    setTimeout(() => setIsLikeAnimating(false), 600);
  };

  const currentUserId = 'current-user';

  return (
    <div className={`flex gap-2 md:gap-3 mb-3 md:mb-4 message-appear ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar y info del usuario */}
      <div className="flex flex-col items-center gap-1 min-w-[40px] md:min-w-[50px]">
        <div className="text-lg md:text-2xl">{user.avatar}</div>
        <button 
          onClick={handleLike}
          className={`
            flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-full bg-card border
            hover:scale-110 transition-transform duration-200 text-xs
            ${isLikeAnimating ? 'animate-pulse' : ''}
          `}
        >
          <Heart 
            className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isLikeAnimating ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
          <span className="text-xs text-muted-foreground">{user.likes}</span>
        </button>
      </div>

      {/* Mensaje */}
      <div className={`flex-1 max-w-[75%] md:max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
        {/* Header con nombre y banner */}
        <div className={`flex items-center gap-1 md:gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
          <div className="flex items-center gap-1">
            <span className="text-lg">{user.avatar_emoji || '🧑‍💻'}</span>
            <span className="text-xs md:text-sm font-medium text-foreground">{user.username || user.name}</span>
          </div>
          {user.temporaryBanner && (
            <UserBanner 
              banner={user.temporaryBanner} 
              isTop={isTopMessage}
            />
          )}
          {user.permanentBanner && !user.temporaryBanner && (
            <UserBanner banner={user.permanentBanner} />
          )}
        </div>

        {/* Burbuja del mensaje */}
        <div
          className={`
            relative px-3 md:px-4 py-2 md:py-3 rounded-2xl max-w-full break-words
            ${isOwn ? 'message-sent rounded-br-md' : 'message-received rounded-bl-md'}
            ${isTopMessage ? 'ring-2 ring-primary/50' : ''}
          `}
          onMouseEnter={() => !isMobile && setShowReactions(true)}
          onMouseLeave={() => !isMobile && setShowReactions(false)}
          onClick={() => isMobile && setShowReactions(!showReactions)}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 opacity-70 ${isOwn ? 'text-right' : ''}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Mobile/Desktop reaction system */}
        {(showReactions || Object.keys(message.reactions).length > 0) && (
          <EmojiReactionPanel
            messageId={message.id}
            reactions={message.reactions}
            onReact={onReact}
            currentUserId={currentUserId}
            isOwn={isOwn}
          />
        )}
      </div>
    </div>
  );
};