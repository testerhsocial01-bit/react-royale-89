# Database Setup for Chat App

## Required Tables

Your Supabase database needs the following tables to support the chat app with profiles and rooms functionality:

### 1. profiles (existing, needs updates)
- `id` (UUID, primary key, references auth.users)
- `name` (TEXT)
- `avatar_url` (TEXT)
- `banner` (TEXT)
- `likes` (INTEGER, default 0)
- `bio` (TEXT) - **NEW FIELD**
- `avatar_emoji` (TEXT, default '😎') - **NEW FIELD**
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. rooms (NEW TABLE)
- `id` (UUID, primary key)
- `name` (TEXT, not null)
- `description` (TEXT)
- `is_private` (BOOLEAN, default false)
- `created_by` (UUID, references auth.users)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. messages (existing, may need updates)
- `id` (UUID, primary key)
- `room_id` (UUID, references rooms.id)
- `user_id` (UUID, references auth.users)
- `content` (TEXT, not null)
- `created_at` (TIMESTAMP)

### 4. room_members (NEW TABLE)
- `id` (UUID, primary key)
- `room_id` (UUID, references rooms.id)
- `user_id` (UUID, references auth.users)
- `joined_at` (TIMESTAMP)
- Unique constraint on (room_id, user_id)

### 5. reactions (existing)
- `id` (UUID, primary key)
- `message_id` (UUID, references messages.id)
- `user_id` (UUID, references auth.users)
- `emoji` (TEXT, not null)
- `created_at` (TIMESTAMP)

### 6. banners (existing)
- `id` (UUID, primary key)
- `name` (TEXT, not null)
- `emoji` (TEXT, not null)
- `rarity` (TEXT, check constraint for 'common', 'rare', 'epic', 'legendary')
- `description` (TEXT)
- `user_id` (UUID, references auth.users)
- `created_at` (TIMESTAMP)

## Setup Instructions

1. **Connect to Supabase**: Make sure your project is connected to Supabase using the green button in the top right.

2. **Run the SQL**: Copy the contents of `database-setup.sql` and run it in your Supabase SQL editor.

3. **Verify Tables**: Check that all tables are created in your Supabase dashboard.

4. **Test RLS**: The SQL includes Row Level Security policies to ensure users can only access data they should see.

## Key Features Enabled

- ✅ User profiles with bios and avatars
- ✅ Multiple chat rooms (public and private)
- ✅ Room creation and joining
- ✅ Message reactions
- ✅ User likes system
- ✅ Banner/achievement system
- ✅ Proper security with RLS policies

## Main Room

The system includes a main room with ID `00000000-0000-0000-0000-000000000001` that serves as the default chat room. All users are automatically added to this room when they create a profile.

## Security Notes

The RLS policies ensure:
- Users can only see messages in rooms they're members of
- Users can only edit their own profiles
- Room creators control their rooms
- Public rooms are visible to all, private rooms only to members