import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useRooms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load available rooms
  useEffect(() => {
    if (!user) return;

    const loadRooms = async () => {
      try {
        // Get all rooms first
        const { data: roomsData, error: roomsError } = await (supabase as any)
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false });

        if (roomsError) {
          console.warn('Rooms error:', roomsError);
          return;
        }

        // Get room members for all rooms
        const { data: allMembersData } = await (supabase as any)
          .from('room_members')
          .select('*');

        // Get profiles for creators and members
        const creatorIds = [...new Set(roomsData?.map((r: any) => r.created_by).filter(Boolean) || [])];
        const memberIds = [...new Set(allMembersData?.map((m: any) => m.user_id) || [])];
        const allUserIds = [...new Set([...creatorIds, ...memberIds])];
        
        const { data: profilesData } = await (supabase as any)
          .from('profiles')
          .select('*')
          .in('id', allUserIds);

        // Process rooms data to include counts and member info
        const processedRooms = roomsData?.map((room: any) => {
          const creatorProfile = profilesData?.find((p: any) => p.id === room.created_by);
          const roomMembers = allMembersData?.filter((m: any) => m.room_id === room.id) || [];
          const memberProfiles = roomMembers.map((m: any) => 
            profilesData?.find((p: any) => p.id === m.user_id)
          ).filter(Boolean);
          
          return {
            ...room,
            is_private: !room.is_public,
            created_by_name: creatorProfile?.name || 'Usuario desconocido',
            member_count: roomMembers.length,
            members: memberProfiles,
            message_count: 0
          };
        }) || [];

        setRooms(processedRooms);
        
      } catch (error: any) {
        console.error('Error loading rooms:', error);
        toast({
          title: "Error al cargar las salas",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [user, toast]);

  const createRoom = async (name: string, description?: string, isPrivate: boolean = false) => {
    if (!user || !name.trim()) return false;

    try {
      // Create the room
      const { data: roomData, error: roomError } = await (supabase as any)
        .from('rooms')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          is_public: !isPrivate,
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) {
        toast({
          title: "Error al crear la sala",
          description: roomError.message,
          variant: "destructive",
        });
        return false;
      }

      // Add creator as member
      const { error: memberError } = await (supabase as any)
        .from('room_members')
        .insert({
          room_id: roomData.id,
          user_id: user.id
        });

      if (memberError) {
        console.warn('Error adding creator as member:', memberError);
      }

      // Refresh rooms list
      const { data: updatedRoomsData } = await (supabase as any)
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (updatedRoomsData) {
        // Get updated room members
        const { data: updatedMembersData } = await (supabase as any)
          .from('room_members')
          .select('*');

        // Get updated profiles
        const updatedCreatorIds = [...new Set(updatedRoomsData.map((r: any) => r.created_by).filter(Boolean))];
        const updatedMemberIds = [...new Set(updatedMembersData?.map((m: any) => m.user_id) || [])];
        const updatedAllUserIds = [...new Set([...updatedCreatorIds, ...updatedMemberIds])];
        
        const { data: updatedProfilesData } = await (supabase as any)
          .from('profiles')
          .select('*')
          .in('id', updatedAllUserIds);

        const processedRooms = updatedRoomsData.map((room: any) => {
          const creatorProfile = updatedProfilesData?.find((p: any) => p.id === room.created_by);
          const roomMembers = updatedMembersData?.filter((m: any) => m.room_id === room.id) || [];
          const memberProfiles = roomMembers.map((m: any) => 
            updatedProfilesData?.find((p: any) => p.id === m.user_id)
          ).filter(Boolean);
          
          return {
            ...room,
            is_private: !room.is_public,
            created_by_name: creatorProfile?.name || 'Usuario desconocido',
            member_count: roomMembers.length,
            members: memberProfiles,
            message_count: 0
          };
        });
        setRooms(processedRooms);
      }

      toast({
        title: "¡Sala creada!",
        description: `La sala "${name}" ha sido creada exitosamente`,
      });

      return true;
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error al crear la sala",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return false;

    try {
      // Check if user is already a member
      const { data: existingMember } = await (supabase as any)
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Ya eres miembro",
          description: "Ya perteneces a esta sala",
          variant: "destructive",
        });
        return false;
      }

      // Add user to room
      const { error } = await (supabase as any)
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: user.id
        });

      if (error) {
        toast({
          title: "Error al unirse a la sala",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Update local rooms state
      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            member_count: room.member_count + 1,
            members: [...room.members, { id: user.id, name: user.user_metadata?.name || 'Usuario' }]
          };
        }
        return room;
      }));

      toast({
        title: "¡Te has unido a la sala!",
        description: "Ahora puedes participar en las conversaciones",
      });

      return true;
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast({
        title: "Error al unirse a la sala",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase as any)
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error al salir de la sala",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Update local rooms state
      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            member_count: Math.max(0, room.member_count - 1),
            members: room.members.filter((member: any) => member.id !== user.id)
          };
        }
        return room;
      }));

      toast({
        title: "Has salido de la sala",
        description: "Ya no eres miembro de esta sala",
      });

      return true;
    } catch (error: any) {
      console.error('Error leaving room:', error);
      toast({
        title: "Error al salir de la sala",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
  };
};