import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReactionButton } from './ReactionButton';
import { Plus, Smile } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmojiReactionPanelProps {
  messageId: string;
  reactions: Record<string, any>;
  onReact: (messageId: string, emoji: string) => void;
  currentUserId: string;
  isOwn: boolean;
}

const REACTION_EMOJIS = ['😂', '❤️', '💡', '💩', '🚀', '🔥', '👍', '👎', '😍', '😢', '😮', '🎉'];

export const EmojiReactionPanel = ({ 
  messageId, 
  reactions, 
  onReact, 
  currentUserId, 
  isOwn 
}: EmojiReactionPanelProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleReact = (emoji: string) => {
    onReact(messageId, emoji);
    if (isMobile) {
      setOpen(false);
    }
  };

  // Show existing reactions
  const existingReactions = Object.values(reactions).filter(reaction => reaction.count > 0);

  return (
    <div className={`flex items-center gap-1 mt-2 flex-wrap ${isOwn ? 'justify-end' : ''}`}>
      {/* Existing reactions */}
      {existingReactions.map((reaction: any) => (
        <ReactionButton
          key={reaction.emoji}
          emoji={reaction.emoji}
          reaction={reaction}
          onReact={handleReact}
          currentUserId={currentUserId}
        />
      ))}
      
      {/* Add reaction button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 reaction-button hover:reaction-hover"
          >
            {isMobile ? <Smile className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2 bg-card border-border" 
          align={isOwn ? "end" : "start"}
          sideOffset={5}
        >
          <div className="grid grid-cols-6 gap-1">
            {REACTION_EMOJIS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-lg hover:bg-muted"
                onClick={() => handleReact(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
