import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  // Function to check record status
  const checkRecordStatus = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('listing_raw')
        .select('json')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching record ${id}:`, error);
        setRecordError(`Database error: ${error.message}`);
        return false;
      }
      
      if (!data) {
        console.error(`No data found for record ${id}`);
        setRecordError(`No data found for analysis ID: ${id}`);
        return false;
      }

      console.log(`Record ${id} data:`, data.json);
      
      // Safely check the status property
      const jsonData = data.json as Record<string, any>;
      
      if (!jsonData) {
        setRecordError("No analysis data available yet");
        return false;
      }
      
      const status = jsonData.status;
      console.log(`Record ${id} status:`, status);
      
      if (status === 'failed' || status === 'error') {
        const errorMsg = jsonData.error || 'Unknown error';
        const statusCode = jsonData.statusCode || '';
        setRecordError(`Analysis failed: ${errorMsg} ${statusCode ? `(Status: ${statusCode})` : ''}`);
        return false;
      }
      
      return status === 'success';
    } catch (err) {
      console.error(`Unexpected error checking record ${id}:`, err);
      setRecordError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  // Function to check record details using our edge function
  const checkRecordDetails = async (id: number) => {
    try {
      console.log(`Checking details for record ID: ${id}`);
      const { data, error } = await supabase.functions.invoke("check-record", {
        body: { recordId: id },
      });
      
      // Check if the function call itself was successful
      if (error) {
        console.error("Edge function error:", error);
        setRecordError(`Edge Function error: ${error.message || String(error)}`);
        return false;
      }
      
      // Check the data returned by the function
      console.log("Record details:", data);
      
      if (!data || data.error) {
        setRecordError(`Check record failed: ${data?.error || 'Unknown error'}`);
        return false;
      }
      
      if (data.success && data.data) {
        const jsonData = data.data.json || {};
        console.log("Record JSON structure:", data.recordStructure);
        
        // If we received a success status from Apify but it's not correctly stored
        if (jsonData && data.recordStructure?.json?.hasStatus) {
          console.log("Record status:", jsonData.status);
          if (jsonData.status === 'success') {
            toast.success("Listing analyzed successfully!");
            return true;
          } else if (jsonData.status === 'processing') {
            toast.info("Analysis in progress. Please check back in a moment.");
            return false;
          } else if (jsonData.status === 'failed' || jsonData.status === 'error') {
            setRecordError(`Analysis failed: ${jsonData.error || 'Unknown error'}`);
            return false;
          }
        }
      }
      
      return false;
    } catch (err) {
      console.error("Error invoking check-record function:", err);
      setRecordError(`Error checking record: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!airbnbUrl) {
      toast.error("Please enter an Airbnb listing URL");
      return;
    }

    if (!airbnbUrl.includes("airbnb.com")) {
      toast.error("Please enter a valid Airbnb listing URL");
      return;
    }

    try {
      setIsAnalyzing(true);
      setRecordError(null); // Clear any previous error
      const toastId = toast.loading("Analyzing your Airbnb listing. This may take a minute...");

      console.log("Invoking scrape-airbnb function with URL:", airbnbUrl);
      
      const response = await supabase.functions.invoke("scrape-airbnb", {
        body: { listingUrl: airbnbUrl },
      });
      
      console.log("Function response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        toast.dismiss(toastId);
        toast.error(`Failed to analyze your listing: ${response.error}`);
        return;
      }

      const data = response.data;
      
      // Store the record ID for future reference
      if (data && data.recordId) {
        setRecordId(data.recordId);
        
        // Wait a moment to allow background processing to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check the record status directly to handle edge cases
        const isSuccess = await checkRecordStatus(data.recordId);
        
        // If standard check didn't work, try our detailed check
        if (!isSuccess) {
          await checkRecordDetails(data.recordId);
        }
        
        toast.dismiss(toastId);
        
        if (isSuccess) {
          toast.success("Listing analyzed successfully!");
          // Optional: Scroll to contact section as a next step
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        } else if (recordError) {
          toast.error(recordError);
        } else {
          toast.info("Analysis started, we'll update you when it's complete.");
        }
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to get analysis ID. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.dismiss();
      toast.error(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Check existing recordId status on component mount and every 10 seconds
  useEffect(() => {
    if (recordId) {
      const checkStatus = async () => {
        const isSuccess = await checkRecordStatus(recordId);
        if (!isSuccess && recordError) {
          toast.error(recordError);
        }
      };
      
      // Check immediately
      checkStatus();
      
      // Then check periodically if the status is not yet success
      const intervalId = setInterval(async () => {
        const result = await checkRecordStatus(recordId);
        if (result) {
          // If we got a success, stop checking
          clearInterval(intervalId);
          toast.success("Listing analysis complete!");
        }
      }, 10000); // Check every 10 seconds
      
      // Clean up interval
      return () => clearInterval(intervalId);
    }
  }, [recordId]);

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
                onKeyDown={(e) => e.key === "Enter" && !isAnalyzing && handleAnalyze()}
                disabled={isAnalyzing}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-zeniks-purple text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {recordId && (
              <div className="mt-4 text-sm text-zeniks-gray-dark">
                Analysis ID: {recordId}
                {recordError && (
                  <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md text-left">
                    <strong>Error:</strong> {recordError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
