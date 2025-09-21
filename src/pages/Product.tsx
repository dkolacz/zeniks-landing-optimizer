import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ListingData {
  title: string | null;
  first_photo: string | null;
}

const Product = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchListingData = async () => {
      if (!listingId) return;
      
      try {
        const { data, error } = await supabase
          .from('results')
          .select('data')
          .eq('listing_id', listingId)
          .order('inserted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching listing data:', error);
          setError('Failed to load listing data');
          return;
        }

        if (!data || !data.data) {
          setError('No data found for this listing');
          return;
        }

        // Extract title and first photo from the JSON data
        const jsonData = data.data as any;
        const title = jsonData.title || null;
        const firstPhoto = jsonData.photos && jsonData.photos.length > 0 ? jsonData.photos[0].url : null;

        setListingData({
          title,
          first_photo: firstPhoto
        });
      } catch (error) {
        console.error('Error:', error);
        setError('An error occurred while loading the data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingData();
  }, [listingId]);

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
      <div className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {isLoading && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 text-center min-h-[200px] flex flex-col justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zeniks-purple mx-auto mb-4"></div>
              <p className="text-zeniks-purple font-medium">Loading listing data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && listingData && (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Listing Preview */}
              <div className="space-y-6">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zeniks-purple leading-tight">
                  {listingData.title || 'Your Airbnb Listing'}
                </h1>
                
                {/* Main Image */}
                {listingData.first_photo && (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={listingData.first_photo} 
                      alt="Listing main photo"
                      className="w-full h-64 md:h-80 object-cover"
                    />
                  </div>
                )}
                
                {/* Highlight Text */}
                <div className="bg-gradient-to-r from-zeniks-purple/10 to-zeniks-blue/10 rounded-lg p-6 border border-zeniks-purple/20">
                  <p className="text-lg text-zeniks-purple font-medium">
                    ✨ Your listing has strong potential for optimization. Unlock detailed insights now.
                  </p>
                </div>
              </div>
              
              {/* Right Column - Email Capture Card */}
              <div className="lg:sticky lg:top-8 lg:h-fit">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-zeniks-purple">
                      Get Your Full Optimization Report
                    </h2>
                    <p className="text-zeniks-gray-dark text-lg">
                      Receive an instant PDF report delivered straight to your email.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zeniks-gray-dark mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                    
                    <button className="w-full bg-zeniks-purple hover:bg-zeniks-purple/90 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors shadow-lg hover:shadow-xl">
                      Request Report – $19.90
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Product;
