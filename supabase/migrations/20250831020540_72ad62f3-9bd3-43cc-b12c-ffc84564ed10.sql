-- Update the secret code function to use the new secure code
CREATE OR REPLACE FUNCTION public.award_banner_with_code(p_code text)
RETURNS TABLE(banner_id text, banner_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id uuid;
    v_banner_id text;
    v_banner_name text;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check the secret code and assign corresponding banner
    CASE p_code
        WHEN 'Heiderelcrakxd' THEN
            v_banner_id := 'founder-king';
            v_banner_name := 'Fundador y Rey del Todo';
        ELSE
            RAISE EXCEPTION 'Invalid secret code';
    END CASE;
    
    -- Check if user already has this banner
    IF EXISTS (
        SELECT 1 FROM user_banners 
        WHERE user_id = v_user_id AND banner_id = v_banner_id
    ) THEN
        RAISE EXCEPTION 'You already have this banner';
    END IF;
    
    -- Award the banner
    INSERT INTO user_banners (user_id, banner_id, unlocked_at)
    VALUES (v_user_id, v_banner_id, now());
    
    -- Return the banner information
    RETURN QUERY SELECT v_banner_id, v_banner_name;
END;
$function$

-- Add avatar_emoji field to profiles table for emoji avatars
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_emoji text DEFAULT '🧑‍💻';