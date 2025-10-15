import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Product = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [listingData, setListingData] = useState<{ title: string; first_image_url: string } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const steps = [
    "🔍 Reading your listing data…",
    "🏡 Checking the property details…",
    "🖼️ Fetching photos…",
    "⭐ Collecting guest reviews…",
    "📊 Analyzing opportunities for improvement…",
    "🚀 Finalizing your results…"
  ];

  // Function to check if API call is complete and fetch listing data
  const checkAPIStatus = async () => {
    if (!listingId) return false;
    
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('id, data, status')
        .eq('listing_id', listingId)
        .order('fetched_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking API status:', error);
        return false;
      }

      if (data && data.length > 0) {
        const request = data[0];
        
        // Store request ID for payment
        if (request.id) {
          setRequestId(request.id);
        }
        
        if (request.status === 'done' && request.data) {
          // Extract title and first image URL from nested data structure
          const requestData = request.data as any;
          const title = requestData?.data?.details?.title;
          const firstImageUrl = requestData?.data?.details?.images?.[0]?.url;
          
          if (title && firstImageUrl) {
            setListingData({
              title,
              first_image_url: firstImageUrl
            });
            return true;
          }
        } else if (request.status === 'failed') {
          setError('API call failed');
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

  const handleRequestReport = async () => {
    if (!email || !requestId) {
      toast({
        title: "Missing Information",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      console.log('Creating checkout session for request:', requestId);
      
      // Call the create-checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { requestId, email }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('Redirecting to Stripe checkout:', data.url);
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

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
          {!showResults && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-4">
                Analyzing Your Listing
              </h1>
              <p className="text-lg text-zeniks-gray-dark">
                Listing ID: {listingId}
              </p>
            </div>
          )}

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

          {showResults && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium">Error:</p>
                  <p className="text-red-600">{error}</p>
                </div>
              ) : listingData ? (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Listing Details */}
                  <div className="space-y-6">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple leading-tight">
                      {listingData.title}
                    </h1>
                    
                    {/* Main Image */}
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={listingData.first_image_url} 
                        alt="Listing main photo"
                        className="w-full h-64 md:h-80 object-cover"
                      />
                    </div>
                    
                    {/* Highlight Text */}
                    <div className="bg-gradient-to-r from-zeniks-purple/10 to-zeniks-blue/10 rounded-lg p-6 border border-zeniks-purple/20">
                      <p className="text-lg text-zeniks-purple font-medium">
                        ✨ Your listing has strong potential for optimization. Unlock detailed insights now.
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Column - CTA Card */}
                  <div className="lg:sticky lg:top-8 lg:h-fit">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 space-y-6">
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-zeniks-purple">
                          Get Your Full Optimization Report
                        </h2>
                        <p className="text-zeniks-gray-dark">
                          Receive an instant PDF report delivered straight to your email.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-zeniks-gray-dark mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isProcessingPayment}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zeniks-purple focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        
                        <button 
                          onClick={handleRequestReport}
                          disabled={!email || !requestId || isProcessingPayment}
                          className="w-full bg-zeniks-purple hover:bg-zeniks-purple/90 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessingPayment ? "Redirecting to payment..." : "Request Report – $19.90"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Product;
