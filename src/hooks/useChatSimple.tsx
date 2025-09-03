import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const MAIN_ROOM_ID = '00000000-0000-0000-0000-000000000001';

export const useChatSimple = (roomId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use provided roomId or default to main room
  const currentRoomId = roomId || MAIN_ROOM_ID;

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      try {
        console.log('Loading messages for room:', currentRoomId);
        
        // Try to load messages directly without complex joins
        const { data: messagesData, error: messagesError } = await (supabase as any)
          .from('messages')
          .select('*')
          .eq('room_id', currentRoomId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Messages error:', messagesError);
          // If messages fail, show empty chat
          setMessages([]);
        } else {
          console.log('Loaded messages:', messagesData?.length || 0);
          
          // Get user profiles for the messages separately
          let messagesWithProfiles = messagesData || [];
          if (messagesData && messagesData.length > 0) {
            const userIds = [...new Set(messagesData.map((m: any) => m.user_id))];
            
            try {
              const { data: profilesData } = await (supabase as any)
                .from('profiles')
                .select('*')
                .in('id', userIds);
                
              messagesWithProfiles = messagesData.map((message: any) => ({
                ...message,
                profiles: profilesData?.find((p: any) => p.id === message.user_id) || {
                  id: message.user_id,
                  username: 'Usuario',
                  avatar_emoji: '🧑‍💻'
                }
              }));
            } catch (profileError) {
              console.warn('Profile load error:', profileError);
              // Use messages without profiles if profile loading fails
              messagesWithProfiles = messagesData.map((message: any) => ({
                ...message,
                profiles: {
                  id: message.user_id,
                  username: 'Usuario',
                  avatar_emoji: '🧑‍💻'
                }
              }));
            }
          }
          
          setMessages(messagesWithProfiles);
        }

        // Try to load reactions
        try {
          const { data: reactionsData, error: reactionsError } = await (supabase as any)
            .from('reactions')
            .select('*');
            
          if (reactionsError) {
            console.warn('Reactions error:', reactionsError);
            setReactions([]);
          } else {
            // Get user profiles for reactions
            let reactionsWithProfiles = reactionsData || [];
            if (reactionsData && reactionsData.length > 0) {
              const reactionUserIds = [...new Set(reactionsData.map((r: any) => r.user_id))];
              
              try {
                const { data: reactionProfilesData } = await (supabase as any)
                  .from('profiles')
                  .select('*')
                  .in('id', reactionUserIds);
                  
                reactionsWithProfiles = reactionsData.map((reaction: any) => ({
                  ...reaction,
                  profiles: reactionProfilesData?.find((p: any) => p.id === reaction.user_id) || null
                }));
              } catch (profileError) {
                console.warn('Reaction profiles error:', profileError);
                reactionsWithProfiles = reactionsData;
              }
            }
            
            setReactions(reactionsWithProfiles);
          }
        } catch (error) {
          console.warn('Reactions load failed:', error);
          setReactions([]);
        }
        
      } catch (error: any) {
        console.error('Error loading chat data:', error);
        toast({
          title: "Error al cargar el chat",
          description: "Algunos datos no se pudieron cargar",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, toast, currentRoomId]);

  // Set up realtime subscriptions for messages
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${currentRoomId}`
        },
        async (payload) => {
          console.log('New message received:', payload.new);
          
          try {
            // Get the user profile for the new message
            const { data: profileData } = await (supabase as any)
              .from('profiles')
              .select('*')
              .eq('id', payload.new.user_id)
              .single();
              
            const messageWithProfile = {
              ...payload.new,
              profiles: profileData || {
                id: payload.new.user_id,
                username: 'Usuario',
                avatar_emoji: '🧑‍💻'
              }
            };
            
            setMessages(prev => [...prev, messageWithProfile]);
          } catch (error) {
            console.warn('Error loading profile for new message:', error);
            // Add message without profile if profile loading fails
            const messageWithProfile = {
              ...payload.new,
              profiles: {
                id: payload.new.user_id,
                username: 'Usuario',
                avatar_emoji: '🧑‍💻'
              }
            };
            setMessages(prev => [...prev, messageWithProfile]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, currentRoomId]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      console.log('Sending message:', { content, roomId: currentRoomId, userId: user.id });
      
      const { error: insertError } = await (supabase as any)
        .from('messages')
        .insert({
          room_id: currentRoomId,
          user_id: user.id,
          content: content.trim()
        });

      if (insertError) {
        console.error('Message insert error:', insertError);
        toast({
          title: "Error al enviar mensaje",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Message sent successfully');
      return true;
    } catch (error: any) {
      console.error('Unexpected error sending message:', error);
      toast({
        title: "Error inesperado",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if user has already reacted with this emoji
    const existingReaction = reactions.find(
      (r: any) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await (supabase as any)
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) {
        toast({
          title: "Error al quitar reacción",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      // Add reaction
      const { error } = await (supabase as any)
        .from('reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji
        });

      if (error) {
        toast({
          title: "Error al agregar reacción",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const likeUser = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return;

    try {
      // Get current likes and increment
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('total_likes')
        .eq('id', targetUserId)
        .single();

      if (profile) {
        const { error: updateError } = await (supabase as any)
          .from('profiles')
          .update({ total_likes: (profile.total_likes || 0) + 1 })
          .eq('id', targetUserId);

        if (!updateError) {
          toast({
            title: "¡Like enviado!",
            description: "Has dado like a este usuario",
          });
        }
      }
    } catch (error) {
      console.warn('Error liking user:', error);
    }
  };

  // Process messages with reactions
  const messagesWithReactions = messages.map((message: any) => {
    const messageReactions = reactions.filter((r: any) => r.message_id === message.id);
    const reactionCounts: Record<string, { count: number; users: any[] }> = {};

    messageReactions.forEach((reaction: any) => {
      if (!reactionCounts[reaction.emoji]) {
        reactionCounts[reaction.emoji] = { count: 0, users: [] };
      }
      reactionCounts[reaction.emoji].count++;
      if (reaction.profiles) {
        reactionCounts[reaction.emoji].users.push(reaction.profiles);
      }
    });

    return {
      ...message,
      reactions: reactionCounts
    };
  });

  return {
    messages: messagesWithReactions,
    banners: [], // Empty for now to avoid errors
    roomMembers: [], // Empty for now to avoid errors
    roomInfo: null,
    getUserAutomaticBanners: () => [], // Empty function to avoid errors
    loading,
    sendMessage,
    toggleReaction,
    likeUser,
  };
};