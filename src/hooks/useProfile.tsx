import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  // Load profile data
  useEffect(() => {
    if (!targetUserId) return;

    const loadProfile = async () => {
      try {
        // Get basic profile info
        const { data: profileData, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (profileError) {
          console.warn('Profile error:', profileError);
          return;
        }

        // Get user's banners from user_banners table
        const { data: bannersData } = await (supabase as any)
          .from('user_banners')
          .select('*, banners(*)')
          .eq('user_id', targetUserId);

        // Get message count
        const { count: messageCount } = await (supabase as any)
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId);

        // Check if user is in top users (you can define your own criteria)
        const isTopUser = (profileData?.likes || 0) > 100; // Example criteria

        const enrichedProfile = {
          ...profileData,
          banners: bannersData?.map(ub => ub.banners).filter(Boolean) || [],
          userBanners: bannersData || [],
          messageCount: messageCount || 0,
          isTopUser,
          bio: profileData?.bio || '', // Add bio field support
        };

        setProfile(enrichedProfile);
        
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error al cargar el perfil",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [targetUserId, toast]);

  const updateProfile = async (updates: { name?: string; bio?: string; avatar_url?: string; avatar_emoji?: string }) => {
    if (!user || !targetUserId || targetUserId !== user.id) {
      toast({
        title: "Error",
        description: "No puedes editar este perfil",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', targetUserId);

      if (error) {
        toast({
          title: "Error al actualizar el perfil",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProfile((prev: any) => ({
        ...prev,
        ...updates
      }));

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error al actualizar el perfil",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const likeUser = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return false;

    try {
      // Get current likes and increment
      const { data: targetProfile } = await (supabase as any)
        .from('profiles')
        .select('likes')
        .eq('id', targetUserId)
        .single();

      if (targetProfile) {
        const { error: updateError } = await (supabase as any)
          .from('profiles')
          .update({ likes: targetProfile.likes + 1 })
          .eq('id', targetUserId);

        if (updateError) {
          toast({
            title: "Error al dar like",
            description: updateError.message,
            variant: "destructive",
          });
          return false;
        }

        // Update local state if viewing the liked user's profile
        if (targetUserId === profile?.id) {
          setProfile((prev: any) => ({
            ...prev,
            likes: (prev?.likes || 0) + 1
          }));
        }

        toast({
          title: "¡Like enviado!",
          description: "Has dado like a este usuario",
        });

        return true;
      }
    } catch (error: any) {
      console.error('Error liking user:', error);
      toast({
        title: "Error al dar like",
        description: error.message,
        variant: "destructive",
      });
    }

    return false;
  };

  return {
    profile,
    loading,
    updateProfile,
    likeUser,
  };
};