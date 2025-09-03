-- Create simplified achievements system
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own achievements" 
ON public.achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add simple counters to profiles
ALTER TABLE public.profiles 
ADD COLUMN message_count INTEGER DEFAULT 0,
ADD COLUMN total_reactions INTEGER DEFAULT 0;

-- Create function to update counters
CREATE OR REPLACE FUNCTION update_profile_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update message count
    IF TG_TABLE_NAME = 'messages' THEN
      UPDATE profiles 
      SET message_count = message_count + 1
      WHERE id = NEW.user_id;
    END IF;
    
    -- Update reaction count
    IF TG_TABLE_NAME = 'reactions' THEN
      UPDATE profiles 
      SET total_reactions = total_reactions + 1
      WHERE id = (SELECT user_id FROM messages WHERE id = NEW.message_id);
      
      -- Check for achievements
      PERFORM check_and_unlock_achievements((SELECT user_id FROM messages WHERE id = NEW.message_id));
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_message_counter
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_counters();

CREATE TRIGGER update_reaction_counter
  AFTER INSERT ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_counters();

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get user stats
  SELECT message_count, total_reactions, total_likes
  INTO user_profile
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Check achievements
  -- First message
  IF user_profile.message_count >= 1 THEN
    INSERT INTO achievements (user_id, achievement_id)
    VALUES (p_user_id, 'first-message')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  -- Popular (50 reactions)
  IF user_profile.total_reactions >= 50 THEN
    INSERT INTO achievements (user_id, achievement_id)
    VALUES (p_user_id, 'popular')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  -- Beloved (100 likes)
  IF user_profile.total_likes >= 100 THEN
    INSERT INTO achievements (user_id, achievement_id)
    VALUES (p_user_id, 'beloved')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  -- Active (50 messages)
  IF user_profile.message_count >= 50 THEN
    INSERT INTO achievements (user_id, achievement_id)
    VALUES (p_user_id, 'active')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  -- Legend (200 reactions)
  IF user_profile.total_reactions >= 200 THEN
    INSERT INTO achievements (user_id, achievement_id)
    VALUES (p_user_id, 'legend')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  -- Champion (500 messages)
  IF user_profile.message_count >= 500 THEN
    INSERT INTO achievements (user_id, achievement_id)
    VALUES (p_user_id, 'champion')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;