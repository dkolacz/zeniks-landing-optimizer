import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Product = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    "🔍 Reading your listing data…",
    "🏡 Checking the property details…",
    "🖼️ Fetching photos…",
    "⭐ Collecting guest reviews…",
    "📊 Analyzing opportunities for improvement…",
    "🚀 Finalizing your results…"
  ];

  // Function to check if API call is complete
  const checkAPIStatus = async () => {
    if (!listingId) return false;
    
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking API status:', error);
        return false;
      }

      if (data && data.length > 0) {
        const request = data[0];
        if (request.status === 'done' && request.data) {
          setResultData(request.data);
          return true;
        } else if (request.status === 'failed') {
          setResultData({ error: 'API call failed' });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking API status:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!listingId) return;

    // Start the step sequence
    const stepInterval = setInterval(async () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // We're at the last step, check if API is complete
        const isComplete = await checkAPIStatus();
        if (isComplete) {
          clearInterval(stepInterval);
          setIsLoading(false);
          setShowResults(true);
        }
        // If not complete, keep showing the last message
      }
    }, 2000);

    // Also check API status immediately and then every 3 seconds
    const statusInterval = setInterval(async () => {
      if (currentStep === steps.length - 1) {
        const isComplete = await checkAPIStatus();
        if (isComplete) {
          clearInterval(stepInterval);
          clearInterval(statusInterval);
          setIsLoading(false);
          setShowResults(true);
        }
      }
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(statusInterval);
    };
  }, [listingId, currentStep, steps.length]);

  if (!listingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
        <Navbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-zeniks-purple mb-4">
              Error: No listing ID provided
            </h1>
            <p className="text-zeniks-gray-dark">
              Please go back and enter a valid Airbnb listing URL.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
      <Navbar />
      <div className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-160px)] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-4">
              Analyzing Your Listing
            </h1>
            <p className="text-lg text-zeniks-gray-dark">
              Listing ID: {listingId}
            </p>
          </div>

          {isLoading && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 text-center min-h-[200px] flex flex-col justify-center">
              <div className="relative h-16 overflow-hidden mb-6">
                <div
                  key={currentStep}
                  className="absolute inset-0 flex items-center justify-center animate-fade-in"
                >
                  <p className="text-2xl font-medium text-zeniks-purple">
                    {steps[currentStep]}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zeniks-purple mx-auto"></div>
              </div>
            </div>
          )}

          {showResults && resultData && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40">
              <h2 className="text-2xl font-bold text-zeniks-purple mb-6 text-center">
                🎉 Your Results Are Ready!
              </h2>
              
              {resultData.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium">Error:</p>
                  <p className="text-red-600">{resultData.error}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(resultData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Product;
