
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

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
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Airbnb URL is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    console.log(`Processing Airbnb URL: ${url}`)

    // Call Apify actor to scrape the Airbnb listing
    const apifyResponse = await fetch('https://api.apify.com/v2/actor-tasks/zeniks~airbnb-scraper/run-sync?token=apify_api_3v9NJOLUFKjrUCWAK5EHXL9xGmv3oK4BELNd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "startUrls": [{ "url": url }],
        "maxListings": 1,
        "proxyConfiguration": {
          "useApifyProxy": true
        },
        "maxConcurrency": 50,
        "extendOutputFunction": "($) => { return {} }",
        "minMaxPrice": false,
        "maxReviews": 5,
        "includeReviews": true,
        "maxDetailPageRetries": 3
      }),
    })

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error(`Apify API error: ${errorText}`)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch listing data' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    const apifyData = await apifyResponse.json()
    console.log('Apify response received:', JSON.stringify(apifyData).substring(0, 100) + '...')

    // Store the raw data in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('listing_raw')
      .insert([{ json: apifyData }])
      .select()

    if (error) {
      console.error('Error storing data in Supabase:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to store listing data' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    console.log(`Successfully stored listing data with ID: ${data[0]?.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Listing data retrieved and stored successfully',
        listing_id: data[0]?.id
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
