import { useState } from 'react';
import { UserBanner } from './UserBanner';
import { ReactionButton } from './ReactionButton';
import { EmojiReactionPanel } from './EmojiReactionPanel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Smile, Link as LinkIcon } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import { Banner } from '@/types/chat';

interface MessageBubbleV2Props {
  message: any;
  automaticBanners?: Banner[];
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onLikeUser?: (userId: string) => void;
}

export const MessageBubbleV2 = ({ 
  message, 
  automaticBanners = [],
  onToggleReaction,
  onLikeUser 
}: MessageBubbleV2Props) => {
  const { profile: currentUserProfile } = useProfile();
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showProfileLink, setShowProfileLink] = useState(false);

  // Get automatic banners for this user
  const userAutomaticBanners = automaticBanners.filter(banner => 
    message.user_id && message.profiles?.id === message.user_id
  );
  
  // Get permanent banners from profile (if available)
  const permanentBanners = message.profiles?.userBanners?.filter((ub: any) => ub.is_active)?.map((ub: any) => ub.banners).filter(Boolean) || [];

  const profile = message.profiles;
  const isCurrentUser = currentUserProfile?.id === message.user_id;
  const userLikes = profile?.likes || 0;

  return (
    <div className="group flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors message-appear">
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
            {profile?.avatar_emoji || profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* User Likes Badge */}
        {userLikes > 0 && (
          <div className="absolute -top-1 -right-1 bg-like-heart text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
            {userLikes}
          </div>
        )}

        {/* Like Button */}
        {!isCurrentUser && (
          <Button
            size="sm" 
            variant="ghost"
            className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-background border opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            onClick={() => {
              if (onLikeUser && message.user_id) {
                onLikeUser(message.user_id);
              }
            }}
          >
            <Heart className="h-3 w-3 text-like-heart" />
          </Button>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          {/* User Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-primary">
                {profile?.name || 'Usuario'}
              </span>
              
              {/* Automatic Banners - Show with glow effect */}
              {userAutomaticBanners.slice(0, 1).map((banner) => (
                <UserBanner 
                  key={`auto-${banner.id}`}
                  banner={banner} 
                  isTop={banner.rarity === 'legendary' || banner.rarity === 'epic'}
                  className="banner-glow animate-pulse"
                />
              ))}
              
              {/* Permanent Banners (from profile) - Show up to 2 */}
              {permanentBanners.slice(0, 2).map((banner: any) => (
                <UserBanner 
                  key={`perm-${banner.id}`}
                  banner={banner} 
                  isTop={banner.rarity === 'legendary'}
                />
              ))}
              
              {/* Likes display next to name */}
              {userLikes > 0 && (
                <div className="flex items-center gap-1 text-xs bg-like-heart/20 text-like-heart px-2 py-1 rounded-full">
                  <Heart className="w-3 h-3" />
                  <span className="font-medium">{userLikes}</span>
                </div>
              )}
              
              <span className="text-xs text-muted-foreground">
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>

              {/* Profile Link */}
              <Link 
                to={`/profile/${message.user_id}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-primary/20"
                  title={`Ver perfil de ${profile?.name}`}
                >
                  <LinkIcon className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Message Content */}
          <div className="mt-1">
            <div className={`
              p-3 rounded-2xl max-w-sm break-words
              ${isCurrentUser 
                ? 'message-sent ml-auto' 
                : 'message-received'
              }
            `}>
              <p className="text-sm">
                {message.content}
              </p>
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, data]: [string, any]) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs reaction-button hover:reaction-active"
                  onClick={() => onToggleReaction?.(message.id, emoji)}
                >
                  <span className="text-base mr-1">{emoji}</span>
                  <span className="font-medium">{data.count}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Emoji Panel */}
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setShowEmojiPanel(!showEmojiPanel)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {showEmojiPanel && (
            <div className="flex gap-1 mt-2 p-3 bg-card/50 backdrop-blur-sm rounded-lg border">
              {['❤️', '😂', '💡', '💩', '🔥', '👍'].map(emoji => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-lg hover:scale-110 transition-transform reaction-button"
                  onClick={() => {
                    onToggleReaction?.(message.id, emoji);
                    setShowEmojiPanel(false);
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};