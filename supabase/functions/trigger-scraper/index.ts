import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const { listing_id } = await req.json();
    console.log('Triggering scraper for listing_id:', listing_id);

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
      throw new Error(`Scraper API returned ${scraperResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Scraper triggered successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error triggering scraper:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});