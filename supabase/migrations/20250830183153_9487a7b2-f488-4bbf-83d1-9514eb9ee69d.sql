-- Fix search_path for all functions to prevent security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    main_room_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Create profile
    INSERT INTO public.profiles (
        id, 
        name, 
        avatar_emoji, 
        likes,
        current_permanent_banner_id
    ) VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario Nuevo'),
        '😎',
        0,
        'nuevo'
    );
    
    -- Add to main chat room
    INSERT INTO public.room_members (room_id, user_id, role) 
    VALUES (main_room_id, NEW.id, 'member');
    
    -- Give first banner
    INSERT INTO public.user_banners (user_id, banner_id, is_active)
    VALUES (NEW.id, 'nuevo', true);
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_permanent_banner(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    user_likes INTEGER;
    new_banner_id TEXT;
BEGIN
    -- Get user's current likes
    SELECT likes INTO user_likes FROM public.profiles WHERE id = user_uuid;
    
    -- Determine appropriate banner based on likes
    IF user_likes >= 500 THEN
        new_banner_id := 'leyenda';
    ELSIF user_likes >= 100 THEN
        new_banner_id := 'querido';
    ELSIF user_likes >= 50 THEN
        new_banner_id := 'popular';
    ELSE
        new_banner_id := 'nuevo';
    END IF;
    
    -- Update user's permanent banner
    UPDATE public.profiles 
    SET current_permanent_banner_id = new_banner_id
    WHERE id = user_uuid;
    
    -- Add banner to user_banners if not exists
    INSERT INTO public.user_banners (user_id, banner_id, is_active)
    VALUES (user_uuid, new_banner_id, true)
    ON CONFLICT (user_id, banner_id) DO UPDATE SET is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_profile_likes_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.likes != NEW.likes THEN
        PERFORM public.update_user_permanent_banner(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_in_room(p_user_id UUID, p_room_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE user_id = p_user_id AND room_id = p_room_id
  );
END;
$$;