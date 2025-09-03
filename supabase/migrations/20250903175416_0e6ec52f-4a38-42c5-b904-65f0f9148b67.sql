-- Fix infinite recursion in room_members RLS policy

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of rooms they're in" ON public.room_members;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.messages;

-- Step 2: Create new policies without recursive references
CREATE POLICY "Users can view room members for rooms they're in" ON public.room_members
    FOR SELECT USING (
        room_id = '00000000-0000-0000-0000-000000000001'::uuid -- Main room accessible to all
        OR user_id = auth.uid() -- User can see their own memberships
        OR EXISTS (
            SELECT 1 FROM public.rooms r 
            WHERE r.id = room_members.room_id AND r.is_public = true
        ) -- Public rooms are visible to all
    );

-- Step 3: Fix messages policy to work with the corrected room_members policy
CREATE POLICY "Users can view messages in their rooms" ON public.messages
    FOR SELECT USING (
        room_id = '00000000-0000-0000-0000-000000000001'::uuid -- Main room accessible to all
        OR EXISTS (
            SELECT 1 FROM public.room_members rm
            WHERE rm.room_id = messages.room_id AND rm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.rooms r 
            WHERE r.id = messages.room_id AND r.is_public = true
        ) -- Public rooms messages are visible to all
    );

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON public.room_members(room_id);