import { Banner } from '@/types/chat';
import { Crown } from 'lucide-react';

interface UserBannerProps {
  banner: Banner;
  isTop?: boolean;
  className?: string;
}

export const UserBanner = ({ banner, isTop = false, className = "" }: UserBannerProps) => {
  const getRarityClasses = (rarity: Banner['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'banner-legendary text-white font-bold';
      case 'epic':
        return 'banner-epic text-white font-bold';
      case 'rare':
        return 'banner-rare text-white font-semibold';
      default:
        return 'banner-common text-white';
    }
  };

  return (
    <div 
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
        ${getRarityClasses(banner.rarity)}
        ${isTop ? 'banner-glow crown-spin' : ''}
        ${className}
      `}
      title={banner.description}
    >
      {isTop && <Crown className="w-3 h-3" />}
      <span>{banner.emoji}</span>
      <span className="font-medium">{banner.name}</span>
    </div>
  );
};