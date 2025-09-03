import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { achievements } from '@/data/achievements';

interface AchievementNotificationProps {
  onNotification?: (message: string) => void;
}

export const AchievementNotification = ({ onNotification }: AchievementNotificationProps) => {
  const { user } = useAuth();
  const [lastReactionCount, setLastReactionCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    // Listen for reaction changes
    const channel = supabase
      .channel('reaction-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions'
        },
        async (payload) => {
          // Get message info to check if it's current user's message
          const { data: messageData } = await supabase
            .from('messages')
            .select('user_id, content')
            .eq('id', payload.new.message_id)
            .single();

          if (messageData?.user_id === user.id) {
            // Count reactions for this message
            const { data: reactionCount } = await supabase
              .from('reactions')
              .select('id', { count: 'exact' })
              .eq('message_id', payload.new.message_id);

            const count = reactionCount?.length || 0;

            // Show notification based on reaction type and count
            if (count === 5) {
              const reactionType = payload.new.reaction_type;
              let category = '';
              
              switch (reactionType) {
                case 'heart':
                  category = 'Querido';
                  break;
                case 'laugh':
                  category = 'Gracioso';
                  break;
                case 'idea':
                  category = 'Brillante';
                  break;
                case 'poop':
                  category = 'Controversial';
                  break;
                default:
                  category = 'Popular';
              }

              // Get user profile for name
              const { data: profileData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();

              const username = profileData?.username || 'Usuario';
              const message = `🎉 ¡El sistema ha catalogado a ${username} como "${category}"!`;
              
              onNotification?.(message);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onNotification]);

  return null; // This component doesn't render anything
};