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

    // Get all results that haven't been normalized yet
    const { data: results, error: fetchError } = await supabase
      .from('results')
      .select('id')
      .not('listing_id', 'in', `(SELECT listing_id FROM listings)`)
      .order('id', { ascending: false });

    if (fetchError) {
      console.error('Error fetching unnormalized results:', fetchError);
      throw new Error(`Failed to fetch results: ${fetchError.message}`);
    }

    console.log(`Found ${results?.length || 0} results to normalize`);

    // Normalize each result
    const normalizedResults = [];
    for (const result of results || []) {
      try {
        // Call the normalize function for each result
        const response = await fetch(`${supabaseUrl}/functions/v1/normalize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ result_id: result.id })
        });

        if (response.ok) {
          const data = await response.json();
          normalizedResults.push({ result_id: result.id, success: true, listing_id: data.listing_id });
          console.log(`Successfully normalized result ${result.id}`);
        } else {
          console.error(`Failed to normalize result ${result.id}:`, await response.text());
          normalizedResults.push({ result_id: result.id, success: false, error: await response.text() });
        }
      } catch (error) {
        console.error(`Error normalizing result ${result.id}:`, error);
        normalizedResults.push({ result_id: result.id, success: false, error: error.message });
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