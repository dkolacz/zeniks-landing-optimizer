import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import sampleReport from "@/assets/sample-report.jpg";
import ReportPreview from "@/components/ReportPreview";

// Edge function direct-call fallback config
const SUPABASE_URL = "https://mubmcqhraztyetyvfvaj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Ym1jcWhyYXp0eWV0eXZmdmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMDc3MjMsImV4cCI6MjA1MTY4MzcyM30.FHSundftU9Zg-DznN44IOPlfw_NRJZG5gTPGDw14ePk";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  
  const [showSampleModal, setShowSampleModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  // Validation functions
  const validateUrl = (url: string) => {
    const value = url.trim().toLowerCase();
    if (!value) {
      return "Airbnb URL is required";
    }
    if (!value.includes("airbnb")) {
      return "Please enter an Airbnb listing URL";
    }
    return "";
  };

  const handleUrlChange = (value: string) => {
    setAirbnbUrl(value);
    if (urlError) {
      setUrlError(validateUrl(value));
    }
  };

  const handleUrlBlur = () => {
    setUrlError(validateUrl(airbnbUrl));
  };

  // Function to extract listing_id from Airbnb URL
  const extractListingId = (url: string) => {
    const match = url.match(/\/rooms\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleAnalyze = async () => {
    console.log('Handle analyze called');
    
    // Validate inputs first
    const urlValidationError = validateUrl(airbnbUrl);
    
    setUrlError(urlValidationError);
    
    if (urlValidationError) {
      console.log('Validation failed:', { urlValidationError });
      return;
    }

    // Extract listing_id from URL
    const listingId = extractListingId(airbnbUrl);
    if (!listingId) {
      setUrlError("Please enter a valid Airbnb listing URL with a room ID");
      return;
    }

    setIsLoading(true);
    console.log('Form submission started with:', { airbnbUrl, listingId });
    
    try {
      // Store data in Supabase requests table
      console.log('About to call Supabase...');
      
      const insertData = {
        listing_id: listingId,
        url: airbnbUrl.trim(),
        status: 'pending' as const
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('requests')
        .insert([insertData])
        .select();

      console.log('Supabase response received:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Database Error",
          description: error.message || "Failed to save your request. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Data saved successfully:', data);
      
      // Redirect to product page immediately with listing_id
      navigate(`/product/${listingId}`);
      
      // Trigger scraper in background (no await, fire and forget)
      triggerScraperInBackground(listingId, data[0].id);
      
      
      // Reset form and clear errors
      setAirbnbUrl("");
      setUrlError("");
      console.log('Form reset successfully');
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('Loading state reset');
    }
  };

  // Background scraper function (fire and forget)
  const triggerScraperInBackground = async (listingId: string, requestId: string) => {
    try {
      console.log('=== BACKGROUND SCRAPER START ===');

      const invokePromise = supabase.functions.invoke('trigger-scraper', {
        body: { listing_id: listingId, request_id: requestId },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Edge invoke timeout')), 60000)
      );

      const invokeResult: any = await Promise.race([invokePromise, timeoutPromise]);

      // If we got here with a normal result
      if (invokeResult && 'data' in invokeResult) {
        const { data: fnData, error: fnError } = invokeResult;
        console.log('Background edge function response:', { fnData, fnError });

        if (fnError) throw fnError;
        if (!fnData?.success) throw new Error(typeof fnData?.error === 'string' ? fnData.error : 'Scraper failed');

        const scraperData = fnData.data;
        console.log('Background scraper data received from edge:', scraperData);
        
        // DB update handled in edge function with service role (bypasses RLS)
        console.log('Background scrape succeeded; request will be updated server-side.');
      } else {
        // Fallback to direct fetch
        console.warn('Background edge invoke timed out, falling back to direct fetch');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/trigger-scraper`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'apikey': SUPABASE_ANON,
          },
          body: JSON.stringify({ listing_id: listingId, request_id: requestId }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Edge HTTP ${resp.status}: ${txt}`);
        }
        const fnData = await resp.json();
        if (!fnData?.success) throw new Error(typeof fnData?.error === 'string' ? fnData.error : 'Scraper failed');
        const scraperData = fnData.data;
        console.log('Background scraper data received from fallback:', scraperData);
        
        // DB update handled in edge function with service role (bypasses RLS)
        console.log('Background scrape succeeded via fallback; request will be updated server-side.');
      }
    } catch (scraperError: any) {
      console.error('=== BACKGROUND SCRAPER ERROR ===', scraperError);
      // Edge function will mark the request as failed server-side
    }
  };

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      {/* Abstract pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-zeniks-purple/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-zeniks-blue/20 to-transparent rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zeniks-purple mb-6">
            The AI Agent for Airbnb Listing Optimization
          </h1>
          <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-8">
            Zeniks audits your Airbnb listing with AI, applies official best practices, and delivers an instant optimization report for just $19.90
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
              <div>
                <Input
                  type="url"
                  placeholder="Your Airbnb Listing URL"
                  className={`w-full py-6 text-base ${urlError ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={airbnbUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={handleUrlBlur}
                />
                {urlError && (
                  <p className="text-red-500 text-sm mt-2 text-left">{urlError}</p>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!airbnbUrl || isLoading || !!urlError}
                className="bg-zeniks-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zeniks-purple/90 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : (
                  <>
                    Get My AI Report
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </button>
              
               {/* Sample Report Preview */}
               <div className="mt-6 flex flex-col items-center">
                 <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
                   <DialogTrigger asChild>
                     <div className="cursor-pointer group">
                       <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/40">
                         <div className="text-center mb-3">
                           <p className="text-sm font-medium text-zeniks-purple group-hover:text-zeniks-purple/80 transition-colors">
                             Preview a Real Report
                           </p>
                         </div>
                         <img 
                           src={sampleReport} 
                           alt="Sample Zeniks AI report preview" 
                           className="w-24 h-16 object-cover rounded-lg border border-zeniks-gray-light shadow-sm mx-auto transform group-hover:scale-105 transition-all duration-300"
                         />
                         <p className="text-xs text-zeniks-gray-dark mt-2 text-center opacity-80 group-hover:opacity-100 transition-opacity">
                           Click to view full sample
                         </p>
                       </div>
                     </div>
                   </DialogTrigger>
                   <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
                     <DialogHeader className="p-6 pb-0">
                       <DialogTitle className="text-zeniks-purple text-xl font-bold">
                         Sample Zeniks AI Report
                       </DialogTitle>
                     </DialogHeader>
                     <ReportPreview />
                   </DialogContent>
                 </Dialog>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
