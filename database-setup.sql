-- Chat App Database Setup
-- Run this in your Supabase SQL editor to set up the required tables

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create room_members table (if not exists) 
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- Create reactions table (if not exists)
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(message_id, user_id, emoji)
);

-- Create banners table (if not exists)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update profiles table to include bio
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '😎';

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can view public rooms" ON public.rooms
    FOR SELECT USING (NOT is_private OR created_by = auth.uid());

CREATE POLICY "Users can create rooms" ON public.rooms
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can update their rooms" ON public.rooms
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Room creators can delete their rooms" ON public.rooms
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for messages (optimized to avoid recursion)
CREATE POLICY "Users can view messages in main room or their rooms" ON public.messages
    FOR SELECT USING (
        room_id = '00000000-0000-0000-0000-000000000001'::uuid -- Main room accessible to all
        OR EXISTS (
            SELECT 1 FROM public.room_members rm
            WHERE rm.room_id = messages.room_id AND rm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in main room or their rooms" ON public.messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND (
            room_id = '00000000-0000-0000-0000-000000000001'::uuid -- Main room
            OR EXISTS (
                SELECT 1 FROM public.room_members rm
                WHERE rm.room_id = messages.room_id AND rm.user_id = auth.uid()
            )
        )
    );

-- RLS Policies for room_members (fixed recursion)
CREATE POLICY "Users can view room members for rooms they're in" ON public.room_members
    FOR SELECT USING (
        room_id = '00000000-0000-0000-0000-000000000001'::uuid -- Main room accessible to all
        OR user_id = auth.uid() -- User can see their own memberships
        OR EXISTS (
            SELECT 1 FROM public.rooms r 
            WHERE r.id = room_members.room_id AND NOT r.is_private
        ) -- Public rooms are visible to all
    );

CREATE POLICY "Users can join rooms" ON public.room_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms" ON public.room_members
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for reactions
CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own reactions" ON public.reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON public.reactions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for banners
CREATE POLICY "Users can view all banners" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own banners" ON public.banners
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Insert main room if it doesn't exist
INSERT INTO public.rooms (id, name, description, is_private, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Chat Principal', 
    'Sala principal del chat donde todos pueden participar',
    false,
    null
) ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON public.reactions(message_id);

-- Functions to automatically add users to main room
CREATE OR REPLACE FUNCTION public.add_user_to_main_room()
RETURNS TRIGGER AS $$
BEGIN
  -- Add user to main room when profile is created
  INSERT INTO public.room_members (room_id, user_id)
  VALUES ('00000000-0000-0000-0000-000000000001'::uuid, NEW.id)
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add users to main room automatically
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.add_user_to_main_room();