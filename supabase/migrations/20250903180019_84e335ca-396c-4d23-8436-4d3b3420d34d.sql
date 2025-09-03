-- Fix RLS security issues

-- Enable RLS on banners table
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for banners table
CREATE POLICY "Banners are viewable by everyone" ON public.banners
    FOR SELECT USING (true);

-- Allow authenticated users to view banners
CREATE POLICY "Authenticated users can view banners" ON public.banners
    FOR ALL TO authenticated
    USING (true);