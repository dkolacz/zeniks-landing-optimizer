import { useEffect } from "react";
import RequestForm from "@/components/analysis-request/RequestForm";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Building } from "lucide-react";

const RequestAnalysis = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Get Your Personalized Listing Report | Zeniks";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Ready to optimize your listing? Request your AI-powered Zeniks analysis today. Simply enter your listing details and get ready to improve your performance.");
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      {/* Header */}
      <div className="bg-white border-b border-zeniks-gray-blue py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4">
            <Building className="h-8 w-8 text-zeniks-purple" />
            <h1 className="text-3xl font-bold text-zeniks-purple">
              Zeniks Listing Analysis
            </h1>
          </div>
          <p className="mt-4 text-center text-zeniks-gray-dark max-w-2xl mx-auto">
            Get detailed insights and recommendations to optimize your property listing and maximize your earnings.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex justify-center mb-6">
              <div className="w-32">
                <AspectRatio ratio={3/1}>
                  <img
                    src="/lovable-uploads/bed86774-1164-422a-bd44-7697b6139ab8.png"
                    alt="Zeniks Logo"
                    className="object-contain w-full h-full"
                  />
                </AspectRatio>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-zeniks-purple text-center mb-4">
              Request Your Listing Report
            </h2>
            <p className="text-zeniks-gray-dark text-center mb-8 max-w-2xl mx-auto">
              We'll analyze your listing and send your detailed report to the email address you provide.
            </p>

            <RequestForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAnalysis;