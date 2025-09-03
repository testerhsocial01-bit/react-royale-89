import { DetailedBanner } from '@/data/bannerData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Crown, Zap } from 'lucide-react';

interface BannerCardProps {
  banner: DetailedBanner;
  isUnlocked?: boolean;
  progress?: number;
  maxProgress?: number;
  description?: string;
  className?: string;
}

export const BannerCard = ({ 
  banner, 
  isUnlocked = false, 
  progress = 0, 
  maxProgress = 100,
  description,
  className = "" 
}: BannerCardProps) => {
  const getRarityClasses = (rarity: string) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exclusive':
        return <Crown className="w-4 h-4" />;
      case 'automatic':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${className} ${
      banner.hasAnimation ? 'banner-glow' : ''
    } ${!isUnlocked ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Banner Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{banner.emoji}</div>
            <div>
              <h3 className="font-semibold text-sm">{banner.name}</h3>
              <Badge variant="outline" className={`text-xs ${getRarityClasses(banner.rarity)} border-0`}>
                {banner.rarity}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {getCategoryIcon(banner.category)}
            {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            {banner.isTemporary && (
              <Badge variant="outline" className="text-xs">
                Temporal
              </Badge>
            )}
          </div>
        </div>

        {/* Banner Description */}
        <p className="text-xs text-muted-foreground mb-3">
          {banner.description}
        </p>

        {/* Requirement */}
        <div className="mb-3">
          <p className="text-xs font-medium text-foreground mb-1">
            {description ? 'Progreso:' : 'Requisito:'}
          </p>
          <p className="text-xs text-muted-foreground">
            {description || banner.requirement}
          </p>
        </div>

        {/* Progress Bar (for unlockable banners) */}
        {banner.category === 'unlockable' && !isUnlocked && maxProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progreso:</span>
              <span className="text-foreground font-medium">
                {progress}/{maxProgress}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Special Effects Indicator */}
        {banner.hasAnimation && (
          <div className="mt-2 text-center">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
              ✨ Efectos Especiales
            </Badge>
          </div>
        )}

        {/* Unlocked Indicator */}
        {isUnlocked && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};