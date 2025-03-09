
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAnalysis } from "@/hooks/use-analysis";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";
import AnalysisError from "@/components/analysis/AnalysisError";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import AnalysisEmpty from "@/components/analysis/AnalysisEmpty";

const Analysis = () => {
  const { id } = useParams();
  const { analysis, loading, progress } = useAnalysis(id);

  console.log("Analysis page rendering with state:", { 
    id, 
    loading, 
    progress, 
    analysisStatus: analysis?.status,
    hasResponseData: !!analysis?.response_data,
    hasRawResponse: !!analysis?.raw_response
  });

  const renderContent = () => {
    if (loading) {
      console.log("Rendering loading state");
      return <AnalysisLoading progress={progress} />;
    }

    if (analysis?.status === 'failed') {
      console.log("Rendering error state with message:", analysis.error_message);
      return <AnalysisError errorMessage={analysis.error_message} />;
    }

    // Success case
    if (analysis?.status === 'success' && (analysis?.response_data || analysis?.raw_response)) {
      console.log("Rendering success state with response_data or raw_response");
      return <AnalysisResult 
        listingData={analysis.response_data} 
        listingUrl={analysis.listing_url} 
        rawResponse={analysis.raw_response}
      />;
    }

    console.log("Rendering empty state (no data available)");
    return <AnalysisEmpty />;
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
