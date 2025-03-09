
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const apifyApiKey = Deno.env.get("APIFY_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle POST requests
  if (req.method === "POST") {
    try {
      // Parse request body
      const { airbnbUrl } = await req.json();
      console.log("Edge function received request for URL:", airbnbUrl);

      if (!airbnbUrl) {
        return new Response(
          JSON.stringify({ error: "Airbnb URL is required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // First create a record in the database with status 'pending'
      console.log("Creating database record for URL:", airbnbUrl);
      const { data: analysisRecord, error: dbError } = await supabase
        .from('airbnb_analyses')
        .insert({
          listing_url: airbnbUrl,
          status: 'pending'
        })
        .select()
        .single();
        
      if (dbError) {
        console.error("Database error creating record:", dbError);
        return new Response(
          JSON.stringify({ error: "Failed to create analysis record" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      console.log("Created analysis record:", analysisRecord);
      
      // Use EdgeRuntime.waitUntil to handle the API call in the background
      // This allows us to return a response immediately while the API call continues
      const apifyUrl = "https://api.apify.com/v2/acts/onidivo~airbnb-scraper/run-sync";
      const apifyUrlWithToken = `${apifyUrl}?token=${apifyApiKey}`;
      
      // Start background task to call Apify API
      const backgroundTask = async () => {
        try {
          console.log("Calling Apify API with URL:", airbnbUrl);
          console.log("Full Apify API URL:", apifyUrl);
          
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
                url: airbnbUrl,
                method: "GET"
              }
            ],
            timeoutMs: 600000
          };
          
          console.log("Apify request body:", JSON.stringify(requestBody));
          
          const response = await fetch(apifyUrlWithToken, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
    
          console.log("Apify API response status:", response.status);
          console.log("Apify API response statusText:", response.statusText);
          
          if (!response.ok) {
            console.error(`API request failed with status ${response.status}: ${response.statusText}`);
            
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: `API request failed with status ${response.status}: ${response.statusText}` 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
    
          // Get the response as text first for debugging
          const responseText = await response.text();
          console.log("Apify API raw response length:", responseText.length);
          
          if (responseText.length > 0) {
            console.log("Apify API raw response first 100 chars:", responseText.substring(0, 100));
            console.log("Apify API raw response last 100 chars:", responseText.substring(responseText.length - 100));
          } else {
            console.error("Received empty response from Apify API");
            
            // Update the database record with failed status
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: "Received empty response from Apify API" 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
          
          // Update the database record with successful status and raw response data
          console.log("Updating analysis record with response data");
          const { error: updateError } = await supabase
            .from('airbnb_analyses')
            .update({ 
              status: 'success',
              response_data: responseText  // Store the raw text directly
            })
            .eq('id', analysisRecord.id);
            
          if (updateError) {
            console.error("Error updating database record:", updateError);
            throw updateError;
          }
          
          console.log("Successfully updated analysis record with response data");
        } catch (error) {
          console.error("Error in background task:", error);
          
          // Update the database record with failed status
          await supabase
            .from('airbnb_analyses')
            .update({ 
              status: 'failed',
              error_message: error instanceof Error ? error.message : "Unknown error"
            })
            .eq('id', analysisRecord.id);
        }
      };
      
      // Start the background task without waiting for it to complete
      try {
        // @ts-ignore - EdgeRuntime is available in Deno Deploy
        EdgeRuntime.waitUntil(backgroundTask());
      } catch (error) {
        console.error("EdgeRuntime.waitUntil not available, falling back to regular execution");
        // If EdgeRuntime.waitUntil is not available (e.g., in development), start the task without waiting
        backgroundTask();
      }
      
      // Return the analysis record ID immediately
      return new Response(
        JSON.stringify({ id: analysisRecord.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  }

  // Handle other HTTP methods
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { 
      status: 405, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
});
