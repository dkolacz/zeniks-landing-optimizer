
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
    console.log("Scrape-airbnb function invoked");
    
    // Get the listingUrl from the request body
    const { listingUrl } = await req.json();
    
    if (!listingUrl) {
      console.error("Missing listing URL in request");
      return new Response(
        JSON.stringify({ error: "Listing URL is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Processing listing URL: ${listingUrl}`);
    
    // Create a record in the database to store the raw results
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log("Database connection available:", !!supabaseUrl && !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create an initial record to store the Apify results
    const { data: recordData, error: recordError } = await supabase
      .from('listing_raw')
      .insert([{ 
        listing_url: listingUrl,
        status: 'pending',
        json: { url: listingUrl }
      }])
      .select('id')
      .single(); // Use single() instead of maybeSingle() to ensure one row
    
    if (recordError) {
      console.error("Error creating initial record:", recordError);
      return new Response(
        JSON.stringify({ error: `Failed to create database record: ${recordError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!recordData) {
      console.error("No record ID returned after insert");
      return new Response(
        JSON.stringify({ error: "Failed to create database record: No ID returned" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const recordId = recordData.id;
    console.log(`Created record with ID: ${recordId}`);
    
    // Call Apify synchronously
    try {
      console.log("Calling Apify API synchronously...");
      const apifyResult = await callApifyActorSync(listingUrl);
      
      if (apifyResult) {
        // Update the record with the result
        const { error: updateError } = await supabase
          .from('listing_raw')
          .update({ 
            status: 'success',
            json: apifyResult
          })
          .eq('id', recordId);
        
        if (updateError) {
          console.error(`Error updating record ${recordId}:`, updateError);
          return new Response(
            JSON.stringify({ error: `Failed to update record: ${updateError.message}`, recordId }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        // Handle empty result
        await updateRecordWithError(supabase, recordId, listingUrl, "No data returned from analysis service");
      }
    } catch (error) {
      console.error("Apify API error:", error);
      await updateRecordWithError(supabase, recordId, listingUrl, error.message);
      // Still return the recordId so the UI can show the error
    }
    
    // Return the record ID for the frontend to use
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Analysis completed", 
        recordId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function updateRecordWithError(supabase, recordId, listingUrl, errorMessage) {
  try {
    const { error } = await supabase
      .from('listing_raw')
      .update({ 
        status: 'error',
        error_message: errorMessage || "Unknown error",
        json: { 
          url: listingUrl,
          error: errorMessage || "Unknown error" 
        }
      })
      .eq('id', recordId);
    
    if (error) {
      console.error(`Failed to update error status for record ${recordId}:`, error);
    } else {
      console.log(`Updated record ${recordId} with error status: ${errorMessage}`);
    }
  } catch (err) {
    console.error(`Failed to update error status for record ${recordId}:`, err);
  }
}

async function callApifyActorSync(listingUrl) {
  const apifyApiKey = Deno.env.get('APIFY_API_KEY');
  if (!apifyApiKey) {
    throw new Error("Missing APIFY_API_KEY environment variable");
  }
  
  console.log(`Using direct run-sync endpoint for Apify actor`);
  
  // Use the run-sync endpoint as requested
  const syncEndpoint = `https://api.apify.com/v2/acts/onidivo~airbnb-scraper/run-sync?token=${apifyApiKey}`;
  
  // Prepare the input as specified
  const input = {
    addMoreHostInfo: false,
    calendarMonths: 0,
    currency: "USD",
    extraData: true,
    limitPoints: 100,
    maxConcurrency: 50,
    maxItems: 1,
    maxReviews: 100,
    proxyConfiguration: {
      useApifyProxy: true
    },
    startUrls: [
      {
        url: listingUrl,
        method: "GET"
      }
    ],
    timeoutMs: 600000
  };
  
  console.log("Calling Apify with input:", JSON.stringify(input));
  
  const response = await fetch(syncEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Apify API error (${response.status}):`, errorText);
    throw new Error(`Apify API returned ${response.status}: ${errorText}`);
  }
  
  // Parse the response data
  const responseData = await response.json();
  
  if (Array.isArray(responseData.data.items) && responseData.data.items.length > 0) {
    console.log(`Found ${responseData.data.items.length} items in dataset`);
    return responseData.data.items[0]; // Return the first item
  } else {
    console.log("No items in dataset");
    return { 
      warning: "No data extracted from the page",
      extracted: false
    };
  }
}
