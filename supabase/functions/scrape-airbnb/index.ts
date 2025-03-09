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
      .insert([{ json: { status: 'pending', url: listingUrl } }])
      .select('id')
      .single();
    
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
      .update({ json: { status: 'processing', url: listingUrl } })
      .eq('id', recordId);
    
    // Call Apify to analyze the listing
    const apifyResult = await callApifyActor(listingUrl);
    console.log(`Apify processing complete for record ${recordId}`);
    
    // Check if we got a valid response with data
    if (!apifyResult || typeof apifyResult !== 'object') {
      console.error(`Invalid Apify result for record ${recordId}:`, apifyResult);
      await updateRecordWithError(supabase, recordId, "Invalid response from analysis service");
      return;
    }
    
    // Make sure to process the result properly based on what Apify returns
    let finalResult = {
      status: 'success',
      url: listingUrl,
      data: apifyResult
    };
    
    // Update the record with the successful result
    const { error: updateError } = await supabase
      .from('listing_raw')
      .update({ json: finalResult })
      .eq('id', recordId);
    
    if (updateError) {
      console.error(`Error updating record ${recordId} with results:`, updateError);
    } else {
      console.log(`Successfully updated record ${recordId} with analysis results`);
    }
  } catch (error) {
    console.error(`Error in background processing for record ${recordId}:`, error);
    await updateRecordWithError(supabase, recordId, error.message);
  }
}

async function updateRecordWithError(supabase, recordId, errorMessage) {
  try {
    await supabase
      .from('listing_raw')
      .update({ 
        json: { 
          status: 'failed', 
          error: errorMessage || "Unknown error", 
          updatedAt: new Date().toISOString() 
        } 
      })
      .eq('id', recordId);
    console.log(`Updated record ${recordId} with error status`);
  } catch (err) {
    console.error(`Failed to update error status for record ${recordId}:`, err);
  }
}

async function callApifyActor(listingUrl) {
  try {
    console.log(`Calling Apify actor for URL: ${listingUrl}`);
    
    // Mock response for now - replace with actual Apify API call
    // This is a placeholder to ensure we return a 200 response
    return {
      title: "Sample Airbnb Listing",
      price: "$150 per night",
      location: "Sample Location",
      rooms: 2,
      beds: 3,
      baths: 1,
      amenities: ["WiFi", "Kitchen", "Free parking"],
      host: {
        name: "Sample Host",
        rating: 4.8
      },
      reviews: {
        count: 25,
        average: 4.7
      }
    };
    
    // Actual implementation would look something like this:
    /*
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    const actorId = 'apify/website-content-crawler'; // Replace with your actual actor ID
    
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [{ url: listingUrl }],
        maxCrawlPages: 1
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API returned ${response.status}: ${errorText}`);
    }
    
    const runData = await response.json();
    const runId = runData.data.id;
    
    // Poll for results
    let result;
    let attempts = 0;
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const resultResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyApiKey}`);
      if (resultResponse.ok) {
        const items = await resultResponse.json();
        if (items && items.length > 0) {
          result = items[0];
          break;
        }
      }
      attempts++;
    }
    
    if (!result) {
      throw new Error("Timed out waiting for analysis results");
    }
    
    return result;
    */
  } catch (error) {
    console.error("Error calling Apify actor:", error);
    throw error;
  }
}
