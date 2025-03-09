
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    document.title = "Analyzing Your Listing | Zeniks";
    
    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Cap at 90% until we get actual results
        return prev + 5;
      });
    }, 5000);

    // Check status of the analysis
    const checkAnalysisStatus = async () => {
      if (!id) {
        toast.error("No analysis ID provided");
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('airbnb_analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast.error("Analysis not found");
          navigate("/");
          return;
        }

        setAnalysis(data);
        
        // If still pending, check again after delay
        if (data.status === 'pending') {
          setTimeout(checkAnalysisStatus, 5000);
        } else {
          clearInterval(progressInterval);
          setProgress(100);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Failed to retrieve analysis results");
        clearInterval(progressInterval);
        setLoading(false);
      }
    };

    checkAnalysisStatus();
    
    return () => clearInterval(progressInterval);
  }, [id, navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader className="h-16 w-16 text-zeniks-purple animate-spin mb-6" />
          <h2 className="text-2xl font-semibold text-center mb-4">
            Zeniks is analyzing your listing
          </h2>
          <p className="text-zeniks-gray-dark text-center mb-8">
            This might take a couple of minutes. Please don't close this page.
          </p>
          <Progress value={progress} className="w-full max-w-md h-2" />
          <p className="mt-2 text-sm text-zeniks-gray-dark">{progress}% complete</p>
        </div>
      );
    }

    if (analysis?.status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-3xl w-full">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">Analysis Failed</h2>
            <p className="text-red-600 mb-6">
              {analysis.error_message || "We couldn't analyze this Airbnb listing. Please try again later."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-zeniks-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Success case
    if (analysis?.status === 'success' && analysis?.response_data) {
      const listingData = Array.isArray(analysis.response_data) ? analysis.response_data[0] : analysis.response_data;
      
      return (
        <div className="py-10 px-4">
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Airbnb Listing Analysis</CardTitle>
              <CardDescription>
                Analysis results for: <a href={analysis.listing_url} target="_blank" rel="noopener noreferrer" className="text-zeniks-purple hover:underline">{analysis.listing_url}</a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {listingData.name && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">{listingData.name}</h3>
                    {listingData.images?.picture_url && (
                      <img 
                        src={listingData.images.picture_url} 
                        alt={listingData.name} 
                        className="w-full h-64 object-cover rounded-lg my-4"
                      />
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-medium text-lg mb-2">Listing Information</h4>
                    <ul className="space-y-2">
                      <li><span className="font-medium">Price:</span> {listingData.price?.rate ? `$${listingData.price.rate}` : 'N/A'}</li>
                      <li><span className="font-medium">Type:</span> {listingData.room_type || 'N/A'}</li>
                      <li><span className="font-medium">Bedrooms:</span> {listingData.bedrooms || 'N/A'}</li>
                      <li><span className="font-medium">Bathrooms:</span> {listingData.bathrooms || 'N/A'}</li>
                      <li><span className="font-medium">Location:</span> {listingData.address?.suburb || listingData.city || 'N/A'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg mb-2">Host &amp; Reviews</h4>
                    <ul className="space-y-2">
                      <li><span className="font-medium">Host:</span> {listingData.host?.host_name || 'N/A'}</li>
                      <li><span className="font-medium">Rating:</span> {listingData.rating || 'N/A'}</li>
                      <li><span className="font-medium">Number of Reviews:</span> {listingData.number_of_reviews || 'N/A'}</li>
                      <li><span className="font-medium">Review Scores:</span> {listingData.review_scores_rating || 'N/A'}</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-2">Raw Response Data</h4>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                    <pre className="text-xs">{JSON.stringify(listingData, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p>No data available.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-zeniks-purple text-white px-6 py-2 rounded-lg mt-4 hover:bg-opacity-90 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zeniks-gray-light flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
