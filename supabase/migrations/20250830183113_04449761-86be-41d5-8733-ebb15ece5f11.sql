-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '😎';

-- Create security definer function to check room membership
CREATE OR REPLACE FUNCTION public.is_user_in_room(p_user_id UUID, p_room_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE user_id = p_user_id AND room_id = p_room_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view messages in rooms they're members of" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to rooms they're members of" ON public.messages;
DROP POLICY IF EXISTS "Room members can view memberships in their rooms" ON public.room_members;

-- Create new policies using the security definer function
CREATE POLICY "Users can view messages in rooms they're members of" 
ON public.messages 
FOR SELECT 
USING (public.is_user_in_room(auth.uid(), room_id));

CREATE POLICY "Users can send messages to rooms they're members of" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND public.is_user_in_room(auth.uid(), room_id));

-- Fix room_members policy
CREATE POLICY "Room members can view memberships in their rooms" 
ON public.room_members 
FOR SELECT 
USING (user_id = auth.uid() OR public.is_user_in_room(auth.uid(), room_id));