-- Complete database schema for chat rooms functionality

-- 1. Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_rooms_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Create room_members table
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_room_members_room_id FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_members_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT unique_room_user UNIQUE (room_id, user_id)
);

-- 3. Add room_id to messages table (optional, with default to main room)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS room_id UUID;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON public.rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_rooms_is_public ON public.rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);

-- 5. Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for rooms
CREATE POLICY "Public rooms are viewable by everyone" ON public.rooms
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own private rooms" ON public.rooms
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON public.rooms
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" ON public.rooms
    FOR DELETE USING (auth.uid() = created_by);

-- 7. Create RLS policies for room_members
CREATE POLICY "Users can view members of rooms they're in" ON public.room_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        room_id IN (
            SELECT id FROM public.rooms WHERE is_public = true
        ) OR
        room_id IN (
            SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join public rooms" ON public.room_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        room_id IN (SELECT id FROM public.rooms WHERE is_public = true)
    );

CREATE POLICY "Users can leave rooms" ON public.room_members
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Update messages RLS policies to include room-based access
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;

CREATE POLICY "Users can view messages in their rooms" ON public.messages
    FOR SELECT USING (
        room_id IS NULL OR -- Legacy messages without room
        room_id IN (
            SELECT room_id FROM public.room_members WHERE user_id = auth.uid()
        ) OR
        room_id IN (
            SELECT id FROM public.rooms WHERE is_public = true
        )
    );

-- 9. Insert default main room
INSERT INTO public.rooms (id, name, description, is_public, created_by) 
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Chat Principal',
    'Sala principal donde todos pueden conversar',
    true,
    (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT (id) DO NOTHING;

-- 10. Create function to automatically add users to main room
CREATE OR REPLACE FUNCTION public.add_user_to_main_room()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.room_members (room_id, user_id)
    VALUES ('00000000-0000-0000-0000-000000000001'::uuid, NEW.id)
    ON CONFLICT (room_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger to add new users to main room
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.add_user_to_main_room();

-- 12. Update existing messages to belong to main room if they don't have a room
UPDATE public.messages 
SET room_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE room_id IS NULL;

-- 13. Make room_id NOT NULL after migration
ALTER TABLE public.messages ALTER COLUMN room_id SET NOT NULL;
ALTER TABLE public.messages ALTER COLUMN room_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

-- 14. Add foreign key for messages room_id
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_room_id 
FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;