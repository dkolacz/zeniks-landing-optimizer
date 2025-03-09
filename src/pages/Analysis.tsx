
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

  const renderContent = () => {
    if (loading) {
      return <AnalysisLoading progress={progress} />;
    }

    if (analysis?.status === 'failed') {
      return <AnalysisError errorMessage={analysis.error_message} />;
    }

    // Success case
    if (analysis?.status === 'success' && analysis?.response_data) {
      // Get the listing data
      let listingData = analysis.response_data;
      
      // If it's an array, get the first item
      if (Array.isArray(listingData)) {
        listingData = listingData[0];
      }
      
      return <AnalysisResult listingData={listingData} listingUrl={analysis.listing_url} />;
    }

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
