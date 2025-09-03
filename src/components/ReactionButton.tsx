import { useState } from 'react';
import { Reaction } from '@/types/chat';

interface ReactionButtonProps {
  emoji: string;
  reaction?: Reaction;
  onReact: (emoji: string) => void;
  currentUserId: string;
}

export const ReactionButton = ({ emoji, reaction, onReact, currentUserId }: ReactionButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const hasUserReacted = reaction?.users.includes(currentUserId) || false;
  const count = reaction?.count || 0;

  const handleClick = () => {
    setIsAnimating(true);
    onReact(emoji);
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        reaction-button flex items-center gap-1 px-2 py-1 rounded-full text-xs
        ${hasUserReacted ? 'reaction-active' : ''}
        ${isAnimating ? 'reaction-pop' : ''}
      `}
    >
      <span className="text-sm">{emoji}</span>
      {count > 0 && (
        <span className={`font-medium ${hasUserReacted ? 'text-black' : 'text-white'}`}>
          {count}
        </span>
      )}
    </button>
  );
};