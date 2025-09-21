import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Admin client (uses service role) to bypass RLS for server-side updates
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const { listing_id, request_id } = await req.json();
    console.log('Triggering scraper for listing_id:', listing_id, 'request_id:', request_id);

    // Call the external scraper API
    const scraperResponse = await fetch('https://zeniks.onrender.com/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listing_id }),
    });

    console.log('Scraper API response status:', scraperResponse.status);
    
    if (!scraperResponse.ok) {
      const errorText = await scraperResponse.text();
      console.error('Scraper API error body:', errorText);
      throw new Error(`Scraper API returned ${scraperResponse.status}: ${errorText}`);
    }

    const data = await scraperResponse.json();

    // Update the requests row server-side to avoid client RLS issues
    if (request_id) {
      const { error: updateError } = await supabaseAdmin
        .from('requests')
        .update({
          data,
          fetched_at: new Date().toISOString(),
          status: 'done',
        })
        .eq('id', request_id);

      if (updateError) {
        console.error('Admin update error:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error triggering scraper:', error);
    try {
      const { request_id } = await req.json().catch(() => ({ request_id: null }));
      if (request_id) {
        await supabaseAdmin
          .from('requests')
          .update({ fetched_at: new Date().toISOString(), status: 'failed' })
          .eq('id', request_id);
      }
    } catch (e) {
      console.error('Failed to mark request as failed:', e);
    }
    return new Response(
      JSON.stringify({ success: false, error: (error as any)?.message || 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});