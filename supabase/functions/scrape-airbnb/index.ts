
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
    
    // Ensure we have a valid response
    if (!apifyResult) {
      console.error(`Empty Apify result for record ${recordId}`);
      await updateRecordWithError(supabase, recordId, "Empty response from analysis service");
      return;
    }
    
    // Prepare the final result with proper structure
    const finalResult = {
      status: 'success',
      url: listingUrl,
      data: apifyResult,
      updatedAt: new Date().toISOString()
    };
    
    // Log the structure before saving to help with debugging
    console.log(`Saving result structure:`, {
      status: finalResult.status,
      url: finalResult.url,
      dataType: typeof finalResult.data,
      dataIsNull: finalResult.data === null,
      dataKeys: finalResult.data ? Object.keys(finalResult.data) : [],
      updatedAt: finalResult.updatedAt
    });
    
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
    console.log(`Updated record ${recordId} with error status: ${errorMessage}`);
  } catch (err) {
    console.error(`Failed to update error status for record ${recordId}:`, err);
  }
}

async function callApifyActor(listingUrl) {
  try {
    console.log(`Calling Apify actor for URL: ${listingUrl}`);
    
    // For now, return a mock successful response that's properly structured
    // This will help us test the data flow without actual Apify integration
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
    
    /* 
    // When you're ready to integrate with the actual Apify API:
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    const actorId = 'apify/website-content-crawler'; // Replace with your actual actor ID
    
    // Start the actor run
    const startResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [{ url: listingUrl }],
        maxCrawlPages: 1
      }),
    });
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      throw new Error(`Apify API returned ${startResponse.status}: ${errorText}`);
    }
    
    const startData = await startResponse.json();
    const runId = startData.data.id;
    console.log(`Apify run started with ID: ${runId}`);
    
    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const resultResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyApiKey}`);
      
      if (!resultResponse.ok) {
        console.warn(`Attempt ${attempts + 1}/${maxAttempts}: Apify result fetch returned status ${resultResponse.status}`);
        attempts++;
        continue;
      }
      
      // Safely parse the JSON response
      let items;
      try {
        const responseText = await resultResponse.text();
        console.log(`Raw Apify response (first 200 chars): ${responseText.substring(0, 200)}...`);
        items = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Failed to parse Apify response: ${parseError.message}`);
        throw new Error(`Failed to parse Apify response: ${parseError.message}`);
      }
      
      if (items && items.length > 0) {
        result = items[0];
        console.log(`Found results after ${attempts + 1} attempts`);
        break;
      }
      
      console.log(`Attempt ${attempts + 1}/${maxAttempts}: No results yet`);
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
