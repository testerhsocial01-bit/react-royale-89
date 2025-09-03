import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { achievements } from '@/data/achievements';
import { useToast } from '@/hooks/use-toast';

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  is_active: boolean;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadAchievements = async () => {
      try {
        const { data } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id);

        setUserAchievements(data || []);
      } catch (error: any) {
        console.error('Error loading achievements:', error);
        toast({
          title: "Error al cargar logros",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [user, toast]);

  const toggleAchievement = async (achievementId: string, isActive: boolean) => {
    if (!user) return;

    try {
      // Count currently active achievements
      const activeCount = userAchievements.filter(ua => ua.is_active).length;
      
      // If trying to activate and already have 3 active, don't allow
      if (isActive && activeCount >= 3) {
        toast({
          title: "Límite alcanzado",
          description: "Solo puedes tener máximo 3 logros activos",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('achievements')
        .update({ is_active: isActive })
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId);

      if (error) throw error;

      // Update local state
      setUserAchievements(prev => 
        prev.map(ua => 
          ua.achievement_id === achievementId 
            ? { ...ua, is_active: isActive }
            : ua
        )
      );

      toast({
        title: isActive ? "Logro activado" : "Logro desactivado",
        description: `El logro se ${isActive ? 'mostrará' : 'ocultará'} en tu perfil`,
      });
    } catch (error: any) {
      console.error('Error toggling achievement:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el logro",
        variant: "destructive",
      });
    }
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(achievement => 
      userAchievements.some(ua => ua.achievement_id === achievement.id)
    ).map(achievement => ({
      ...achievement,
      isActive: userAchievements.find(ua => ua.achievement_id === achievement.id)?.is_active || false,
      unlockedAt: userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at
    }));
  };

  const getActiveAchievements = () => {
    return getUnlockedAchievements().filter(achievement => achievement.isActive);
  };

  return {
    userAchievements,
    loading,
    toggleAchievement,
    getUnlockedAchievements,
    getActiveAchievements,
  };
};