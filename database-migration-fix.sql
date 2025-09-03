-- Database Migration to Fix Foreign Key Relationships and Column Issues
-- Run this in your Supabase SQL editor to fix the chat app issues

-- Step 1: Add foreign key constraints to link user_id columns to profiles table
-- This will enable proper joins between messages/reactions/room_members and profiles

-- Add foreign key constraint for messages table
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_user_id_fkey,
ADD CONSTRAINT messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for reactions table  
ALTER TABLE public.reactions
DROP CONSTRAINT IF EXISTS reactions_user_id_fkey,
ADD CONSTRAINT reactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for room_members table
ALTER TABLE public.room_members
DROP CONSTRAINT IF EXISTS room_members_user_id_fkey,
ADD CONSTRAINT room_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 2: Fix rooms table column consistency
-- Check if we have is_public column and need to rename it to is_private
DO $$
BEGIN
    -- Check if is_public column exists and is_private doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' 
        AND column_name = 'is_private'
        AND table_schema = 'public'
    ) THEN
        -- Rename is_public to is_private and invert the logic
        ALTER TABLE public.rooms RENAME COLUMN is_public TO is_private;
        -- Invert the boolean values since the logic is opposite
        UPDATE public.rooms SET is_private = NOT is_private;
    END IF;
END $$;

-- Step 3: Ensure is_private column exists with correct default
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Step 4: Update RLS policies to use correct column names and relationships
-- Drop existing policies that might have issues
DROP POLICY IF EXISTS "Users can view public rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can view messages in main room or their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in main room or their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can view room members for rooms they're in" ON public.room_members;

-- Recreate policies with proper foreign key relationships
CREATE POLICY "Users can view public rooms" ON public.rooms
    FOR SELECT USING (NOT is_private OR created_by = auth.uid());

-- Updated messages policy using profiles foreign key
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

-- Updated room_members policy
CREATE POLICY "Users can view room members for rooms they're in" ON public.room_members
    FOR SELECT USING (
        room_id = '00000000-0000-0000-0000-000000000001'::uuid -- Main room accessible to all
        OR user_id = auth.uid() -- User can see their own memberships
        OR EXISTS (
            SELECT 1 FROM public.rooms r 
            WHERE r.id = room_members.room_id AND NOT r.is_private
        ) -- Public rooms are visible to all
    );

-- Step 5: Create indexes on the new foreign key constraints for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON public.room_members(user_id);

-- Step 6: Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verification queries (optional - you can run these to check if everything is working)
-- SELECT 'Messages with profiles' as test, COUNT(*) as count FROM messages m JOIN profiles p ON m.user_id = p.id;
-- SELECT 'Reactions with profiles' as test, COUNT(*) as count FROM reactions r JOIN profiles p ON r.user_id = p.id;
-- SELECT 'Room members with profiles' as test, COUNT(*) as count FROM room_members rm JOIN profiles p ON rm.user_id = p.id;
-- SELECT 'Rooms structure' as test, column_name FROM information_schema.columns WHERE table_name = 'rooms' AND table_schema = 'public';