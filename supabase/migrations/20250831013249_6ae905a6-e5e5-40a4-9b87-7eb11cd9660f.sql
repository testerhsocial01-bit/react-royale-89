-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.add_user_to_main_room()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.room_members (room_id, user_id)
    VALUES ('00000000-0000-0000-0000-000000000001'::uuid, NEW.id)
    ON CONFLICT (room_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;