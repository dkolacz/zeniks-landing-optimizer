import { useEffect } from "react";
import RequestForm from "@/components/analysis-request/RequestForm";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RequestAnalysis = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Get Your Personalized Listing Report | Zeniks";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Ready to optimize your listing? Request your AI-powered Zeniks analysis today. Simply enter your listing details and get ready to improve your performance.");
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple text-center mb-4">
              Get Your Personalized Listing Report
            </h1>
            <p className="text-zeniks-gray-dark text-center mb-8 max-w-2xl mx-auto">
              Submit the form, and we'll send you a detailed report of your listing.
            </p>

            <RequestForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RequestAnalysis;