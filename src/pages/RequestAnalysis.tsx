import ProgressIndicator from "@/components/analysis-request/ProgressIndicator";
import RequestForm from "@/components/analysis-request/RequestForm";

const RequestAnalysis = () => {
  return (
    <div className="min-h-screen bg-zeniks-gray-light py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <ProgressIndicator />

          <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple text-center mb-4">
            Request Your Personalized Listing Analysis
          </h1>
          <p className="text-zeniks-gray-dark text-center mb-8 max-w-2xl mx-auto">
            To get started, please provide the URL of your rental listing and some
            basic information. We'll analyze your listing and send your detailed
            report to the email address you provide.
          </p>

          <RequestForm />
        </div>
      </div>
    </div>
  );
};

export default RequestAnalysis;