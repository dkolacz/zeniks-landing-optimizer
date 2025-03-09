
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Json | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Your Airbnb Listing Analysis | Zeniks";

    // Get the record ID from the URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("id");

    if (!id) {
      toast.error("No analysis ID provided");
      navigate("/");
      return;
    }

    setRecordId(parseInt(id, 10));

    // Set up polling to check the record status
    const checkRecordStatus = async () => {
      try {
        const { data: record, error: recordError } = await supabase
          .from('listing_raw')
          .select('json, status, error_message')
          .eq('id', id)
          .maybeSingle();
        
        if (recordError) {
          console.error("Error fetching record:", recordError);
          setError(`Database error: ${recordError.message}`);
          setIsLoading(false);
          return;
        }

        if (!record) {
          setError(`No data found for analysis ID: ${id}`);
          setIsLoading(false);
          return;
        }

        console.log("Record status:", record.status);
        
        if (record.status === 'success' && record.json) {
          setData(record.json);
          setIsLoading(false);
          toast.success("Analysis completed successfully!");
        } else if (record.status === 'error' || record.status === 'failed') {
          setError(record.error_message || "Analysis failed");
          setIsLoading(false);
          toast.error("Analysis failed");
        } else {
          // Still processing, continue polling
          console.log("Still processing, waiting...");
        }
      } catch (err) {
        console.error("Error checking record status:", err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Check immediately and then every 5 seconds
    checkRecordStatus();
    const intervalId = setInterval(checkRecordStatus, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-zeniks-gray-light flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-16 mt-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-zeniks-purple mb-6">
            Airbnb Listing Analysis
          </h1>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zeniks-purple mx-auto mb-8"></div>
              <h2 className="text-2xl font-semibold text-zeniks-gray-dark mb-3">
                Analyzing your Airbnb listing
              </h2>
              <p className="text-zeniks-gray mb-4 max-w-lg mx-auto">
                We're gathering data and generating insights about your listing.
                This process may take up to 2 minutes to complete.
              </p>
              <p className="text-sm text-zeniks-gray-dark">
                Analysis ID: {recordId}
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-red-700 mb-3">
                Analysis Failed
              </h2>
              <p className="text-red-600 mb-4">
                {error}
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-zeniks-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 font-semibold">
                  Analysis completed successfully!
                </p>
              </div>
              
              <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg">
                <pre className="p-4 text-sm whitespace-pre-wrap break-words">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="bg-zeniks-gray-dark text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all mr-4"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Analysis;
