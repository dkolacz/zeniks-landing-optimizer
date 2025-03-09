
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

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
      const toastId = toast.loading("Analyzing your Airbnb listing. This may take a minute...");

      const { data, error } = await supabase.functions.invoke("scrape-airbnb", {
        body: { listingUrl: airbnbUrl },
      });

      if (error) {
        console.error("Error analyzing listing:", error);
        toast.dismiss(toastId);
        toast.error("Failed to analyze your listing. Please try again.");
        return;
      }

      // Store the record ID for future reference
      if (data && data.recordId) {
        setRecordId(data.recordId);
      }

      toast.dismiss(toastId);
      
      if (data && data.success) {
        toast.success("Listing analyzed successfully!");
        
        // Optional: Scroll to contact section as a next step
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      } else {
        const statusMessage = data?.status ? `(Status: ${data.status})` : '';
        toast.error(`Analysis encountered an issue ${statusMessage}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.dismiss();
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsAnalyzing(false);
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
