-- Add avatar_emoji field to profiles table for emoji avatars
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_emoji text DEFAULT '🧑‍💻'