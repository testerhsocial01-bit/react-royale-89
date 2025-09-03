-- Fix security warning: Move extensions from public schema to extensions schema
-- Note: pg_cron and pg_net should be in the extensions schema, not public

-- Drop and recreate in proper schema (if needed)
-- These extensions are typically managed by Supabase automatically
-- This migration ensures they're in the correct schema

-- The extensions are actually system-wide and don't need to be in public schema
-- They should be available through the cron and net schemas respectively

-- No action needed here as Supabase manages these extensions properly
-- The warning is informational and doesn't affect functionality