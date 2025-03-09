
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!airbnbUrl) {
      toast.error("Please enter an Airbnb listing URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
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
        throw dbError;
      }
      
      console.log("Created analysis record:", analysisRecord);
      
      // Redirect to the analysis page
      navigate(`/analysis/${analysisRecord.id}`);
      
      // Call the Apify API (this will now run in the background after redirect)
      console.log("Calling Apify API with URL:", airbnbUrl);
      const apifyUrl = "https://api.apify.com/v2/acts/onidivo~airbnb-scraper/run-sync?token=apify_api_f9jP7gJSAGmtxpmpSmfEsMUTo9wLtu26VBXn";
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
      
      const response = await fetch(apifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Apify API response status:", response.status);
      console.log("Apify API response statusText:", response.statusText);
      console.log("Apify API response headers:", Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}: ${response.statusText}`);
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      // Get the response as text first for debugging
      const responseText = await response.text();
      console.log("Apify API raw response length:", responseText.length);
      
      if (responseText.length > 0) {
        console.log("Apify API raw response first 100 chars:", responseText.substring(0, 100));
        console.log("Apify API raw response last 100 chars:", responseText.substring(responseText.length - 100));
      } else {
        console.error("Received empty response text from Apify API");
      }
      
      // Check if the response is actually empty
      if (!responseText || responseText.trim() === '') {
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
      
      // Try to parse as JSON to validate it's proper JSON
      try {
        JSON.parse(responseText);
        console.log("Successfully parsed response as JSON");
      } catch (parseError) {
        console.error("Response is not valid JSON:", parseError);
        console.log("Non-JSON response received, storing as raw text");
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
      console.error("Error analyzing Airbnb listing:", error);
      
      // Update the database record with failed status and error message
      if (error instanceof Error) {
        await supabase
          .from('airbnb_analyses')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('listing_url', airbnbUrl)
          .order('created_at', { ascending: false })
          .limit(1);
      }
      
      toast.error("Failed to analyze listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zeniks-purple mb-6">
            AI-Powered Analysis for 
            <br />
            Your Airbnb Listing
          </h1>
          <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-8">
            Get a personalized report with actionable steps to improve your performance.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="Paste your Airbnb listing URL here"
                className="flex-1 py-6 text-base"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                disabled={isLoading}
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-zeniks-purple text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Analyzing..." : "Analyze"}
                <Search className={`h-5 w-5 ${isLoading ? "" : "group-hover:scale-110 transition-transform"}`} />
              </button>
            </div>
            {isLoading && (
              <p className="mt-3 text-zeniks-gray-dark">
                This may take up to 2 minutes. Please don't close this page...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
