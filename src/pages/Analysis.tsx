
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingData, setListingData] = useState<any>(null);
  const [status, setStatus] = useState<string>("pending");
  
  useEffect(() => {
    if (!id) {
      setError("No listing ID provided");
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        // Convert id from string to number
        const numericId = parseInt(id, 10);
        
        if (isNaN(numericId)) {
          setError("Invalid listing ID");
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from("listing_raw")
          .select("*")
          .eq("id", numericId)
          .single();

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data) {
          setStatus(data.status);

          if (data.status === "success") {
            setListingData(data.json);
            setLoading(false);
          } else if (data.status === "error") {
            setError(data.error_message || "An error occurred during analysis");
            setLoading(false);
          } else {
            // If still processing, set a timeout to check again
            setTimeout(() => {
              setLoading(true);
            }, 5000); // Check again after 5 seconds
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, loading]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Airbnb Listing Analysis</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-lg border border-gray-200 bg-gray-50">
          <Loader className="w-12 h-12 animate-spin text-zeniks-purple mb-4" />
          <p className="text-lg font-medium text-zeniks-gray-dark mb-2">
            Analyzing your Airbnb listing...
          </p>
          <p className="text-sm text-zeniks-gray-dark opacity-70 max-w-md text-center">
            This may take a few minutes as we gather details about your property, amenities, 
            pricing, and reviews to provide you with a comprehensive analysis.
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-lg border border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Analysis Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[600px] text-sm">
            {JSON.stringify(listingData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Analysis;
