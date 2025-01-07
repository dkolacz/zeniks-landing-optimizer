import { useEffect } from "react";
import RequestForm from "@/components/analysis-request/RequestForm";
import BenefitsList from "@/components/analysis-request/BenefitsList";

const RequestAnalysis = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Benefits */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-zeniks-purple mb-8">
                  Listing Analysis Report
                </h1>
                <div className="mb-8">
                  <div className="text-3xl font-bold text-zeniks-gray-dark mb-2">$49.00</div>
                  <p className="text-zeniks-gray-dark">
                    Personalized analysis of your rental property listing
                  </p>
                </div>
                <BenefitsList />
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="p-8 md:p-12 bg-white rounded-r-2xl">
              <div className="max-w-md mx-auto">
                <RequestForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAnalysis;