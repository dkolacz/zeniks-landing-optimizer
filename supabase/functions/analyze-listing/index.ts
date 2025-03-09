
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
            timeoutMs: 60000  // Updated timeout to 60 seconds (60000ms)
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
          
          // Log response headers
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          console.log("Apify API response headers:", JSON.stringify(headers));
          
          if (!response.ok) {
            console.error(`API request failed with status ${response.status}: ${response.statusText}`);
            
            // Try to parse error response if any
            let errorDetails = "";
            try {
              const errorBody = await response.text();
              console.error("Error response body:", errorBody);
              errorDetails = ` | Response body: ${errorBody}`;
            } catch (parseError) {
              console.error("Failed to parse error response:", parseError);
            }
            
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: `API request failed with status ${response.status}: ${response.statusText}${errorDetails}` 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
    
          // First get the response as text to ensure we have valid data
          const responseText = await response.text();
          console.log("Apify API raw response length:", responseText.length);
          console.log("Apify API raw response first 1000 chars:", responseText.substring(0, 1000));
          console.log("Apify API raw response last 1000 chars:", responseText.substring(Math.max(0, responseText.length - 1000)));
          
          // Store the raw response before attempting to parse it
          await supabase
            .from('airbnb_analyses')
            .update({ 
              raw_response: responseText
            })
            .eq('id', analysisRecord.id);
          
          if (!responseText || responseText.trim() === '') {
            console.error("Received empty response from Apify API");
            
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: "Received empty response from Apify API" 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
          
          // Try to parse the response as JSON safely
          let responseData;
          try {
            responseData = JSON.parse(responseText);
            console.log("Successfully parsed JSON response");
          } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            console.log("Invalid JSON response first 200 chars:", responseText.substring(0, 200));
            console.log("Invalid JSON response last 200 chars:", responseText.substring(responseText.length - 200));
            
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: `Invalid JSON response: ${parseError.message}` 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
          
          // Log info about the response
          console.log("Apify API response data type:", typeof responseData);
          
          if (responseData === null || responseData === undefined) {
            console.error("Parsed response is null or undefined");
            
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: "Parsed response is null or undefined" 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
          
          if (typeof responseData === 'object') {
            console.log("Response data keys:", Object.keys(responseData));
          }
          
          if (Array.isArray(responseData) && responseData.length === 0) {
            console.error("Received empty array from Apify API");
            
            await supabase
              .from('airbnb_analyses')
              .update({ 
                status: 'failed',
                error_message: "Received empty array from Apify API" 
              })
              .eq('id', analysisRecord.id);
              
            return;
          }
          
          // Convert response to string if it's an object
          const responseString = JSON.stringify(responseData);
          console.log("Response string length:", responseString.length);
          
          // Update the database record with successful status and response data
          console.log("Updating analysis record with response data");
          const { error: updateError } = await supabase
            .from('airbnb_analyses')
            .update({ 
              status: 'success',
              response_data: responseString  // Store as string
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
