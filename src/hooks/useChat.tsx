import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAutomaticBanners } from '@/hooks/useAutomaticBanners';

const MAIN_ROOM_ID = '00000000-0000-0000-0000-000000000001';

export const useChat = (roomId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use provided roomId or default to main room
  const currentRoomId = roomId || MAIN_ROOM_ID;

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      try {
        // Load room info if not main room
        if (currentRoomId !== MAIN_ROOM_ID) {
          const { data: roomData } = await (supabase as any)
            .from('rooms')
            .select('*, profiles!rooms_created_by_fkey(name)')
            .eq('id', currentRoomId)
            .single();
          
          setRoomInfo(roomData);
        }

        // Load messages first, then get profiles separately
        const { data: messagesData, error: messagesError } = await (supabase as any)
          .from('messages')
          .select('*')
          .eq('room_id', currentRoomId)
          .order('created_at', { ascending: true });
          
        // Get user profiles for the messages
        let messagesWithProfiles = messagesData || [];
        if (messagesData && messagesData.length > 0) {
          const userIds = [...new Set(messagesData.map((m: any) => m.user_id))];
          const { data: profilesData } = await (supabase as any)
            .from('profiles')
            .select('*')
            .in('id', userIds);
            
          messagesWithProfiles = messagesData.map((message: any) => ({
            ...message,
            profiles: profilesData?.find((p: any) => p.id === message.user_id) || null
          }));
        }

        if (messagesError) {
          console.warn('Messages error:', messagesError);
        }

        // Load reactions first, then get profiles separately
        const { data: reactionsData, error: reactionsError } = await (supabase as any)
          .from('reactions')
          .select('*');
          
        // Get user profiles for the reactions
        let reactionsWithProfiles = reactionsData || [];
        if (reactionsData && reactionsData.length > 0) {
          const reactionUserIds = [...new Set(reactionsData.map((r: any) => r.user_id))];
          const { data: reactionProfilesData } = await (supabase as any)
            .from('profiles')
            .select('*')
            .in('id', reactionUserIds);
            
          reactionsWithProfiles = reactionsData.map((reaction: any) => ({
            ...reaction,
            profiles: reactionProfilesData?.find((p: any) => p.id === reaction.user_id) || null
          }));
        }

        if (reactionsError) {
          console.warn('Reactions error:', reactionsError);
        }

        // Load banners
        const { data: bannersData, error: bannersError } = await (supabase as any)
          .from('banners')
          .select('*')
          .order('created_at', { ascending: true });

        if (bannersError) {
          console.warn('Banners error:', bannersError);
        }

        // Load room members first, then get profiles separately
        const { data: membersData, error: membersError } = await (supabase as any)
          .from('room_members')
          .select('*')
          .eq('room_id', currentRoomId);
          
        // Get user profiles for the members
        let membersWithProfiles = [];
        if (membersData && membersData.length > 0) {
          const memberUserIds = [...new Set(membersData.map((m: any) => m.user_id))];
          const { data: memberProfilesData } = await (supabase as any)
            .from('profiles')
            .select('*')
            .in('id', memberUserIds);
            
          membersWithProfiles = memberProfilesData || [];
        }

        if (membersError) {
          console.warn('Members error:', membersError);
        }

        setMessages(messagesWithProfiles);
        setReactions(reactionsWithProfiles);
        setBanners(bannersData || []);
        setRoomMembers(membersWithProfiles);
        
      } catch (error: any) {
        console.error('Error loading chat data:', error);
        toast({
          title: "Error al cargar el chat",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, toast, currentRoomId]);

  // Set up realtime subscriptions
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
          // Load the message first, then get profile separately
          const { data: messageData } = await (supabase as any)
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (messageData) {
            // Get the user profile
            const { data: profileData } = await (supabase as any)
              .from('profiles')
              .select('*')
              .eq('id', messageData.user_id)
              .single();
              
            const messageWithProfile = {
              ...messageData,
              profiles: profileData
            };
            
            setMessages(prev => [...prev, messageWithProfile]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions'
        },
        async (payload) => {
          // Load the reaction first, then get profile separately
          const { data: reactionData } = await (supabase as any)
            .from('reactions')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (reactionData) {
            // Get the user profile
            const { data: profileData } = await (supabase as any)
              .from('profiles')
              .select('*')
              .eq('id', reactionData.user_id)
              .single();
              
            const reactionWithProfile = {
              ...reactionData,
              profiles: profileData
            };
            
            setReactions(prev => [...prev, reactionWithProfile]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reactions'
        },
        (payload) => {
          setReactions(prev => prev.filter((r: any) => r.id !== payload.old.id));
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
      setLoading(true);
      
      console.log('Sending message:', { content, roomId: currentRoomId, userId: user.id });
      
      // Direct insert to avoid type issues
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
    } finally {
      setLoading(false);
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

    // Get current likes and increment
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('likes')
      .eq('id', targetUserId)
      .single();

    if (profile) {
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ likes: profile.likes + 1 })
        .eq('id', targetUserId);

      if (updateError) {
        toast({
          title: "Error al dar like",
          description: updateError.message,
          variant: "destructive",
        });
      }
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

  // Get automatic banners for current user
  const { getUserAutomaticBanners } = useAutomaticBanners(messagesWithReactions);

  return {
    messages: messagesWithReactions,
    banners,
    roomMembers,
    roomInfo,
    getUserAutomaticBanners,
    loading,
    sendMessage,
    toggleReaction,
    likeUser,
  };
};