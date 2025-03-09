
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const APIFY_API_TOKEN = 'apify_api_f9jP7gJSAGmtxpmpSmfEsMUTo9wLtu26VBXn'
const APIFY_ACTOR_ID = 'onidivo~airbnb-scraper'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Function invoked with request method:", req.method);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase Service Key available:", !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the listing URL from the request
    const requestData = await req.json();
    const { listingUrl } = requestData;
    
    console.log("Received listing URL:", listingUrl);
    
    if (!listingUrl) {
      console.error("No listing URL provided");
      return new Response(
        JSON.stringify({ error: 'Listing URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Scraping Airbnb listing: ${listingUrl}`)

    // Create an initial record with status pending
    const { data: initialRecord, error: initialError } = await supabase
      .from('listing_raw')
      .insert({ 
        json: { 
          status: 'pending',
          url: listingUrl,
          created: new Date().toISOString()
        }
      })
      .select('id')
      .single()

    if (initialError) {
      console.error(`Error creating initial record: ${initialError.message}`, initialError);
      return new Response(
        JSON.stringify({ error: `Failed to initialize scraping process: ${initialError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const recordId = initialRecord.id
    console.log(`Created initial record with ID: ${recordId}`);

    // Call the Apify API to run the actor synchronously
    try {
      const apifyUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync?token=${APIFY_API_TOKEN}`;
      console.log(`Calling Apify API at: ${apifyUrl}`);
      
      const requestBody = {
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
      
      console.log("Apify request body:", JSON.stringify(requestBody));
      
      const apifyResponse = await fetch(apifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const responseStatus = apifyResponse.status
      console.log(`Apify API response status: ${responseStatus}`);
      
      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text()
        console.error(`Apify API error (${responseStatus}): ${errorText}`);
        
        // Update the record with failure status
        await supabase
          .from('listing_raw')
          .update({ 
            json: { 
              status: 'failed',
              statusCode: responseStatus,
              error: errorText,
              url: listingUrl,
              updated: new Date().toISOString()
            }
          })
          .eq('id', recordId)
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to scrape listing', 
            status: responseStatus,
            details: errorText,
            recordId
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const apifyData = await apifyResponse.json()
      console.log(`Successfully scraped listing. Data type: ${typeof apifyData}, Data size: ${JSON.stringify(apifyData).length} bytes`);
      
      if (!apifyData || (Array.isArray(apifyData) && apifyData.length === 0)) {
        console.error("Apify returned empty data");
        
        // Update the record with empty data status
        await supabase
          .from('listing_raw')
          .update({ 
            json: { 
              status: 'empty',
              statusCode: responseStatus,
              url: listingUrl,
              updated: new Date().toISOString()
            }
          })
          .eq('id', recordId)
        
        return new Response(
          JSON.stringify({ 
            error: 'No data found for this listing', 
            status: responseStatus,
            recordId
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Update the record with the scraped data and success status
      const { error: updateError } = await supabase
        .from('listing_raw')
        .update({ 
          json: {
            ...apifyData,
            status: 'success',
            statusCode: responseStatus,
            url: listingUrl,
            updated: new Date().toISOString()
          } 
        })
        .eq('id', recordId)

      if (updateError) {
        console.error(`Database update error: ${updateError.message}`, updateError);
        return new Response(
          JSON.stringify({ error: `Failed to store listing data: ${updateError.message}`, recordId }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Listing data scraped and stored successfully', 
          recordId,
          status: responseStatus 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (apiError) {
      console.error(`API error: ${apiError.message}`, apiError);
      
      // Update the record with exception error
      await supabase
        .from('listing_raw')
        .update({ 
          json: { 
            status: 'error',
            error: apiError.message,
            url: listingUrl,
            updated: new Date().toISOString()
          }
        })
        .eq('id', recordId)
      
      return new Response(
        JSON.stringify({ error: `Error calling Apify API: ${apiError.message}`, recordId }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
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
