import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useBanners = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userBanners, setUserBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's banners
  useEffect(() => {
    if (!user) return;

    const loadUserBanners = async () => {
      try {
        const { data: bannersData, error } = await (supabase as any)
          .from('user_banners')
          .select('*, banners(*)')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading banners:', error);
          return;
        }

        setUserBanners(bannersData || []);
      } catch (error: any) {
        console.error('Error loading user banners:', error);
        toast({
          title: "Error al cargar banners",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserBanners();
  }, [user, toast]);

  const toggleBannerVisibility = async (userBannerId: string, isActive: boolean) => {
    if (!user) return false;

    try {
      // Check current active count
      const activeCount = userBanners.filter(ub => ub.is_active).length;
      
      if (isActive && activeCount >= 3) {
        toast({
          title: "Límite alcanzado",
          description: "Solo puedes mostrar máximo 3 banners",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await (supabase as any)
        .from('user_banners')
        .update({ is_active: isActive })
        .eq('id', userBannerId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error al actualizar banner",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setUserBanners(prev => 
        prev.map(ub => 
          ub.id === userBannerId 
            ? { ...ub, is_active: isActive }
            : ub
        )
      );

      toast({
        title: isActive ? "Banner activado" : "Banner desactivado",
        description: isActive 
          ? "El banner ahora es visible en tu perfil" 
          : "El banner ya no es visible en tu perfil",
      });

      return true;
    } catch (error: any) {
      console.error('Error toggling banner:', error);
      toast({
        title: "Error al actualizar banner",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    userBanners,
    loading,
    toggleBannerVisibility,
  };
};