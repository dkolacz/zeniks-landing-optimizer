import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import ReactJson from "react-json-view";

const Product = () => {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listing_id");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided");
      setIsLoading(false);
      return;
    }

    const pollForResults = async () => {
      try {
        console.log("Polling for results with listing_id:", listingId);
        
        const { data: results, error: queryError } = await supabase
          .from("results")
          .select("data, original_url")
          .eq("listing_id", listingId)
          .maybeSingle();

        console.log("Query results:", { results, queryError });

        if (queryError) {
          console.error("Query error:", queryError);
          toast({
            title: "Database Error",
            description: queryError.message,
            variant: "destructive",
          });
          setError("Failed to fetch results");
          setIsLoading(false);
          return;
        }

        if (results && results.data) {
          console.log("Data found:", results);
          setData(results);
          setIsLoading(false);
        } else {
          console.log("No data yet, continuing to poll...");
          // Continue polling after 3 seconds
          setTimeout(pollForResults, 3000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    };

    pollForResults();
  }, [listingId, toast]);

  if (!listingId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zeniks-purple mb-4">Invalid Request</h1>
            <p className="text-zeniks-gray-dark">No listing ID provided in the URL.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zeniks-purple mb-4">Error</h1>
            <p className="text-zeniks-gray-dark">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zeniks-purple mb-4">
              Analysis Results
            </h1>
            <p className="text-zeniks-gray-dark">
              Listing ID: <span className="font-mono bg-zeniks-gray-light px-2 py-1 rounded">{listingId}</span>
            </p>
            {data?.original_url && (
              <p className="text-sm text-zeniks-gray-dark mt-2">
                Original URL: <span className="font-mono text-xs break-all">{data.original_url}</span>
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-zeniks-purple mb-4" />
              <h2 className="text-xl font-semibold text-zeniks-purple mb-2">
                Analyzing your listing...
              </h2>
              <p className="text-zeniks-gray-dark text-center max-w-md">
                Our AI is processing your Airbnb listing. This usually takes a few minutes. 
                The page will automatically update when results are ready.
              </p>
              <div className="mt-6 text-sm text-zeniks-gray-dark">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-zeniks-purple rounded-full animate-pulse"></div>
                  <span>Polling for results every 3 seconds...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-zeniks-purple mb-4">
                Analysis Data
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <ReactJson
                  src={data.data}
                  theme="rjv-default"
                  collapsed={false}
                  indentWidth={2}
                  displayDataTypes={false}
                  enableClipboard={true}
                  displayObjectSize={true}
                  name="results"
                  style={{
                    backgroundColor: "transparent",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;