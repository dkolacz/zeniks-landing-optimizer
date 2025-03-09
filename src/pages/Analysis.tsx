
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const airbnbUrl = searchParams.get("url");

  useEffect(() => {
    document.title = "Airbnb Listing Analysis | Zeniks";
    
    // If no URL was provided, redirect back to home
    if (!airbnbUrl) {
      navigate("/");
    }
  }, [airbnbUrl, navigate]);

  return (
    <div className="min-h-screen bg-zeniks-gray-light flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-zeniks-purple mb-6">Analyzing Your Airbnb Listing</h1>
          
          {airbnbUrl ? (
            <div className="space-y-6">
              <div className="p-4 bg-zeniks-gray-light rounded-lg">
                <h2 className="font-medium text-lg mb-2">Submitted URL:</h2>
                <p className="text-zeniks-gray-dark break-all">{airbnbUrl}</p>
              </div>
              
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-zeniks-purple/30 rounded-full mb-4"></div>
                  <p className="text-zeniks-purple font-medium">Analysis in progress...</p>
                </div>
              </div>
              
              <div className="bg-zeniks-gray-blue p-5 rounded-lg">
                <h3 className="font-medium mb-2">What happens next?</h3>
                <p>Our AI is analyzing your Airbnb listing and will prepare a detailed report. This process typically takes 1-2 minutes to complete.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              No Airbnb URL was provided. Please return to the home page and submit a valid URL.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
