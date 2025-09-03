import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting message cleanup process...');
    
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate 30 minutes ago
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    console.log(`Deleting messages older than: ${thirtyMinutesAgo.toISOString()}`);
    
    // First get the count of messages to be deleted for logging
    const { count: messagesToDelete } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyMinutesAgo.toISOString());
    
    console.log(`Found ${messagesToDelete || 0} messages to delete`);
    
    // Delete reactions first (due to foreign key constraints)
    const { error: reactionsError } = await supabase
      .from('reactions')
      .delete()
      .in('message_id', 
        supabase
          .from('messages')
          .select('id')
          .lt('created_at', thirtyMinutesAgo.toISOString())
      );
    
    if (reactionsError) {
      console.error('Error deleting reactions:', reactionsError);
      throw reactionsError;
    }
    
    // Then delete the messages
    const { error: messagesError, count: deletedCount } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .lt('created_at', thirtyMinutesAgo.toISOString());
    
    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      throw messagesError;
    }
    
    const result = {
      success: true,
      deletedMessages: deletedCount || 0,
      cutoffTime: thirtyMinutesAgo.toISOString(),
      timestamp: new Date().toISOString()
    };
    
    console.log('Cleanup completed successfully:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error in cleanup-messages function:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});