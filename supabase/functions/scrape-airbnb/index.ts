
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

    // Call the Apify API to run the actor synchronously
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

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error(`Apify API error: ${errorText}`)
      return new Response(
        JSON.stringify({ error: 'Failed to scrape listing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const apifyData = await apifyResponse.json()
    
    console.log(`Successfully scraped listing. Data size: ${JSON.stringify(apifyData).length} bytes`)

    // Store the listing data in the database
    const { error: insertError } = await supabase
      .from('listing_raw')
      .insert({ json: apifyData })

    if (insertError) {
      console.error(`Database insert error: ${insertError.message}`)
      return new Response(
        JSON.stringify({ error: 'Failed to store listing data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Listing data scraped and stored successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
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
