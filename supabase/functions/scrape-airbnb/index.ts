
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
      .maybeSingle();
    
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
    
    // Start the Apify actor in the background
    // This will run asynchronously and update the record later
    processListingInBackground(listingUrl, recordId, supabase).catch(err => {
      console.error(`Background processing error for record ${recordId}:`, err);
    });
    
    // Return success immediately with the record ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Analysis started", 
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

async function processListingInBackground(listingUrl, recordId, supabase) {
  try {
    console.log(`Starting background processing for record ${recordId}`);
    
    // Update record to show we're processing
    await supabase
      .from('listing_raw')
      .update({ 
        status: 'processing',
        json: { url: listingUrl }
      })
      .eq('id', recordId);
    
    // Call Apify to analyze the listing
    const apifyResult = await callApifyActor(listingUrl);
    console.log(`Apify processing complete for record ${recordId}`);
    
    // Ensure we have a valid response
    if (!apifyResult) {
      console.error(`Empty Apify result for record ${recordId}`);
      await updateRecordWithError(supabase, recordId, listingUrl, "Empty response from analysis service");
      return;
    }
    
    // Update the record with the successful result
    const { error: updateError } = await supabase
      .from('listing_raw')
      .update({ 
        status: 'success',
        json: apifyResult
      })
      .eq('id', recordId);
    
    if (updateError) {
      console.error(`Error updating record ${recordId} with results:`, updateError);
    } else {
      console.log(`Successfully updated record ${recordId} with analysis results`);
    }
  } catch (error) {
    console.error(`Error in background processing for record ${recordId}:`, error);
    await updateRecordWithError(supabase, recordId, listingUrl, error.message);
  }
}

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

async function callApifyActor(listingUrl) {
  try {
    console.log(`Calling Apify actor for URL: ${listingUrl}`);
    
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      throw new Error("Missing APIFY_API_KEY environment variable");
    }
    
    // Verify we have the API key now
    console.log(`APIFY_API_KEY is ${apifyApiKey ? 'set' : 'not set'}`);
    
    // Configure Apify actor
    const actorId = 'onidivo/airbnb-scraper'; // Updated to the correct Airbnb scraper actor
    console.log(`Using Apify actor ID: ${actorId}`);
    
    // Prepare the input for the Apify actor with the correct format
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
          URL: listingUrl,
          method: "GET"
        }
      ],
      timeoutMs: 600000
    };
    
    console.log("Starting Apify run with input:", JSON.stringify(input));
    
    // Start the actor run with the correct API endpoint
    const startResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error(`Apify API error (${startResponse.status}):`, errorText);
      throw new Error(`Apify API returned ${startResponse.status}: ${errorText}`);
    }
    
    const startData = await startResponse.json();
    const runId = startData.data.id;
    console.log(`Apify run started with ID: ${runId}`);
    
    // Poll for results
    let result = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 5 seconds = 2.5 minutes max wait
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
      
      console.log(`Checking run status (attempt ${attempts + 1}/${maxAttempts})...`);
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`);
      
      if (!statusResponse.ok) {
        console.warn(`Run status check failed (${statusResponse.status}): ${await statusResponse.text()}`);
        attempts++;
        continue;
      }
      
      const statusData = await statusResponse.json();
      const status = statusData.data.status;
      console.log(`Run status: ${status}`);
      
      if (status === 'SUCCEEDED') {
        // Try to get dataset items
        const resultResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyApiKey}`);
        
        if (!resultResponse.ok) {
          console.error(`Failed to fetch dataset (${resultResponse.status}): ${await resultResponse.text()}`);
          throw new Error(`Failed to fetch dataset: ${resultResponse.status}`);
        }
        
        // Parse response, handling errors carefully
        try {
          const responseText = await resultResponse.text();
          console.log(`Received dataset response (${responseText.length} bytes)`);
          
          if (responseText.trim() === '') {
            console.log("Empty response from Apify dataset");
            return { 
              warning: "No data extracted from the page",
              extracted: false
            };
          }
          
          const items = JSON.parse(responseText);
          
          if (Array.isArray(items) && items.length > 0) {
            console.log(`Found ${items.length} items in dataset`);
            return items[0]; // Get the first item (as we limited to 1 page)
          } else {
            console.log("No items in dataset");
            return { 
              warning: "Page crawled but no content extracted",
              extracted: false
            };
          }
        } catch (parseError) {
          console.error(`Failed to parse Apify response: ${parseError.message}`);
          throw new Error(`Failed to parse Apify response: ${parseError.message}`);
        }
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.error(`Apify run failed with status: ${status}`);
        throw new Error(`Apify run ${status}`);
      }
      
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error("Timed out waiting for analysis results");
    }
    
    return result;
  } catch (error) {
    console.error("Error calling Apify actor:", error);
    throw error;
  }
}
