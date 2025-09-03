-- Create missing user_banners table and fix database structure

-- Step 1: Check if banners table exists, if not create it
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create user_banners table to link users with their unlocked banners
CREATE TABLE IF NOT EXISTS public.user_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    banner_id TEXT NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, banner_id)
);

-- Step 3: Create user_daily_stats table for statistics
CREATE TABLE IF NOT EXISTS public.user_daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    messages_sent_total INTEGER DEFAULT 0,
    reactions_received_total INTEGER DEFAULT 0,
    hearts_total INTEGER DEFAULT 0,
    laughs_total INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, day)
);

-- Step 4: Enable RLS on new tables
ALTER TABLE public.user_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for user_banners
CREATE POLICY "Users can view all user banners" ON public.user_banners
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own banners" ON public.user_banners
    FOR ALL USING (auth.uid() = user_id);

-- Step 6: Create RLS policies for user_daily_stats  
CREATE POLICY "Users can view all stats" ON public.user_daily_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own stats" ON public.user_daily_stats
    FOR ALL USING (auth.uid() = user_id);

-- Step 7: Insert default banners if they don't exist
INSERT INTO public.banners (id, name, emoji, description, rarity) VALUES
('founder-king', 'Fundador y Rey del Todo', '👑', 'Banner exclusivo para los fundadores de la plataforma', 'legendary'),
('first-message', 'Primer Mensaje', '💬', 'Enviaste tu primer mensaje', 'common'),
('active-chatter', 'Charlador Activo', '🔥', 'Has sido muy activo en el chat', 'rare')
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_banners_user_id ON public.user_banners(user_id);
CREATE INDEX IF NOT EXISTS idx_user_banners_banner_id ON public.user_banners(banner_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_id ON public.user_daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_day ON public.user_daily_stats(day);