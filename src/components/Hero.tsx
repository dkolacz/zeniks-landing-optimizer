
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!airbnbUrl) {
      toast.error("Please enter an Airbnb listing URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First create a record in the database with status 'pending'
      const { data: analysisRecord, error: dbError } = await supabase
        .from('airbnb_analyses')
        .insert({
          listing_url: airbnbUrl,
          status: 'pending'
        })
        .select()
        .single();
        
      if (dbError) throw dbError;
      
      // Call the Apify API
      const response = await fetch(
        "https://api.apify.com/v2/acts/onidivo~airbnb-scraper/run-sync?token=apify_api_f9jP7gJSAGmtxpmpSmfEsMUTo9wLtu26VBXn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
                url: airbnbUrl,
                method: "GET"
              }
            ],
            timeoutMs: 600000
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Apify API Response:", data);
      
      // Update the database record with successful status and response data
      const { error: updateError } = await supabase
        .from('airbnb_analyses')
        .update({ 
          status: 'success',
          response_data: data
        })
        .eq('id', analysisRecord.id);
        
      if (updateError) throw updateError;
      
      // Show success message
      toast.success("Analysis complete!", {
        description: "Successfully analyzed the Airbnb listing."
      });
      
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
      
      toast.error("Failed to analyze Airbnb listing", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
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
