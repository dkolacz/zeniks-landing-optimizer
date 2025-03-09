
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

// Define CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create and return a response with proper headers
function createResponse(body: any, status: number = 200) {
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Create a Supabase client with environment variables
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  console.log("Database connection available:", !!supabaseUrl && !!supabaseServiceKey);
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Create an initial record in the database
async function createInitialRecord(supabase: any, listingUrl: string) {
  console.log(`Creating initial record for URL: ${listingUrl}`);
  
  const { data, error } = await supabase
    .from('listing_raw')
    .insert([{ 
      listing_url: listingUrl,
      status: 'pending',
      json: { url: listingUrl }
    }])
    .select('id');
  
  if (error) {
    console.error("Error creating initial record:", error);
    throw new Error(`Failed to create database record: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    console.error("No record ID returned after insert");
    throw new Error("Failed to create database record: No ID returned");
  }
  
  const recordId = data[0].id;
  console.log(`Created record with ID: ${recordId}`);
  return recordId;
}

// Update a record with an error message
async function updateRecordWithError(supabase: any, recordId: number, listingUrl: string, errorMessage: string) {
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

// Call the Apify actor synchronously
async function callApifyActorSync(listingUrl: string) {
  const apifyApiKey = Deno.env.get('APIFY_API_KEY');
  if (!apifyApiKey) {
    throw new Error("Missing APIFY_API_KEY environment variable");
  }
  
  console.log(`Using direct run-sync endpoint for Apify actor`);
  
  // Use the run-sync endpoint
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

// Update a record with successful result
async function updateRecordWithSuccess(supabase: any, recordId: number, apifyResult: any) {
  const { error } = await supabase
    .from('listing_raw')
    .update({ 
      status: 'success',
      json: apifyResult
    })
    .eq('id', recordId);
  
  if (error) {
    console.error(`Error updating record ${recordId}:`, error);
    throw new Error(`Failed to update record: ${error.message}`);
  }

  console.log(`Successfully updated record ${recordId} with Apify data`);
}

// Process the Airbnb listing
async function processAirbnbListing(listingUrl: string) {
  console.log(`Processing listing URL: ${listingUrl}`);
  
  // Create a Supabase client
  const supabase = createSupabaseClient();
  
  // Create an initial record
  const recordId = await createInitialRecord(supabase, listingUrl);
  
  // Call Apify synchronously
  try {
    console.log("Calling Apify API synchronously...");
    const apifyResult = await callApifyActorSync(listingUrl);
    
    if (apifyResult) {
      // Update the record with the result
      await updateRecordWithSuccess(supabase, recordId, apifyResult);
    } else {
      // Handle empty result
      await updateRecordWithError(supabase, recordId, listingUrl, "No data returned from analysis service");
    }
  } catch (error) {
    console.error("Apify API error:", error);
    await updateRecordWithError(supabase, recordId, listingUrl, error.message);
    // Still return the recordId so the UI can show the error
  }
  
  return recordId;
}

// Main function handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Scrape-airbnb function invoked");
    
    // Get the listingUrl from the request body
    const { listingUrl } = await req.json();
    
    if (!listingUrl) {
      console.error("Missing listing URL in request");
      return createResponse({ error: "Listing URL is required" }, 400);
    }
    
    // Process the Airbnb listing
    const recordId = await processAirbnbListing(listingUrl);
    
    // Return the record ID for the frontend to use
    return createResponse({ 
      success: true, 
      message: "Analysis started", 
      recordId 
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return createResponse({ error: `Internal server error: ${error.message}` }, 500);
  }
});
