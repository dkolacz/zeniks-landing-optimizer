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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get recent results (we'll skip those already in listings)
    const { data: results, error: fetchError } = await supabase
      .from('results')
      .select('id, listing_id')
      .order('id', { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error('Error fetching unnormalized results:', fetchError);
      throw new Error(`Failed to fetch results: ${fetchError.message}`);
    }

    console.log(`Found ${results?.length || 0} results to normalize`);

    // Normalize each result if not already in listings
    const normalizedResults = [];
    for (const result of results || []) {
      try {
        // Skip if listing already exists
        const { data: existing, error: existErr } = await supabase
          .from('listings')
          .select('id')
          .eq('listing_id', String(result.listing_id))
          .maybeSingle();

        if (existErr) {
          console.warn(`Check existing listing error for ${result.listing_id}:`, existErr);
        }
        if (existing) {
          normalizedResults.push({ result_id: result.id, listing_id: result.listing_id, skipped: true, reason: 'already_exists' });
          continue;
        }

        const { data, error } = await supabase.functions.invoke('normalize', {
          body: { result_id: result.id },
        });

        if (error) {
          console.error(`Failed to normalize result ${result.id}:`, error);
          normalizedResults.push({ result_id: result.id, success: false, error: error.message });
        } else {
          normalizedResults.push({ result_id: result.id, success: true, listing_id: data?.listing_id ?? null });
          console.log(`Successfully normalized result ${result.id}`);
        }
      } catch (error) {
        console.error(`Error normalizing result ${result.id}:`, error);
        normalizedResults.push({ result_id: result.id, success: false, error: (error as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: normalizedResults.length,
        results: normalizedResults 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Manual normalization error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});