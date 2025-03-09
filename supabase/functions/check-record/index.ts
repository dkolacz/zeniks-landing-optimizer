
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Check-record function invoked");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase Service Key available:", !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the record ID from the request
    const requestData = await req.json();
    const { recordId } = requestData;
    
    console.log(`Checking record ID: ${recordId}`);
    
    if (!recordId) {
      return new Response(
        JSON.stringify({ error: 'Record ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the record from the database
    const { data, error } = await supabase
      .from('listing_raw')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      console.error(`Error fetching record: ${error.message}`, error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch record: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!data) {
      console.error(`Record not found: ${recordId}`);
      return new Response(
        JSON.stringify({ error: `Record not found with ID: ${recordId}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the full record content for debugging
    console.log(`Record ${recordId} details:`, data);

    // Check if the JSON data is stored correctly
    const jsonData = data.json;
    let jsonAnalysis = {
      isNull: jsonData === null,
      type: typeof jsonData,
      isArray: Array.isArray(jsonData),
      isEmpty: jsonData && typeof jsonData === 'object' ? Object.keys(jsonData).length === 0 : true,
      hasStatus: jsonData && typeof jsonData === 'object' && 'status' in jsonData,
      status: jsonData && typeof jsonData === 'object' && 'status' in jsonData ? jsonData.status : null,
      keys: jsonData && typeof jsonData === 'object' ? Object.keys(jsonData) : [],
      size: JSON.stringify(jsonData).length
    };

    console.log(`JSON Data Analysis:`, jsonAnalysis);

    // Return the record data with detailed analysis
    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        recordStructure: {
          id: typeof data.id,
          created_at: typeof data.created_at,
          json: jsonAnalysis
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`, error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
