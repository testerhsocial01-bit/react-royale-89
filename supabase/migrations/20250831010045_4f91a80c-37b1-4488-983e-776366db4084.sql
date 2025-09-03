-- Enable required extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cleanup function to run every 30 minutes
SELECT cron.schedule(
  'cleanup-old-messages',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://eqbdmmhoxykbxlcnheik.supabase.co/functions/v1/cleanup-messages',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmRtbWhveHlrYnhsY25oZWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjcwNjIsImV4cCI6MjA3MjE0MzA2Mn0.xbrAl49_i31-s6SuNBzfuUSkAOXF5HCY0eA4m1vPiAE"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);