
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AirbnbAnalysisFormProps {
  className?: string;
}

const AirbnbAnalysisForm = ({ className }: AirbnbAnalysisFormProps) => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

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
      const toastId = toast.loading("Starting analysis of your Airbnb listing...");

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
        // Redirect to the analysis page with the record ID
        toast.dismiss(toastId);
        navigate(`/analysis?id=${data.recordId}`);
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to get analysis ID. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.dismiss();
      toast.error(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className || ""}`}>
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
    </div>
  );
};

export default AirbnbAnalysisForm;
