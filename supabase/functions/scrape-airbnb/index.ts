
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the listing URL from the request
    const { listingUrl } = await req.json()
    
    if (!listingUrl) {
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
      console.error(`Error creating initial record: ${initialError.message}`)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize scraping process' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const recordId = initialRecord.id

    // Call the Apify API to run the actor synchronously
    try {
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync?token=${APIFY_API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        })
      })

      const responseStatus = apifyResponse.status
      
      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text()
        console.error(`Apify API error: ${errorText}`)
        
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
          JSON.stringify({ error: 'Failed to scrape listing', status: responseStatus }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const apifyData = await apifyResponse.json()
      console.log(`Successfully scraped listing. Data size: ${JSON.stringify(apifyData).length} bytes`)

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
        console.error(`Database update error: ${updateError.message}`)
        return new Response(
          JSON.stringify({ error: 'Failed to store listing data' }),
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
      console.error(`API error: ${apiError.message}`)
      
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
        JSON.stringify({ error: 'Error calling Apify API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
