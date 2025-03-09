
import { useNavigate } from "react-router-dom";

interface AnalysisErrorProps {
  errorMessage: string | null;
}

const AnalysisError = ({ errorMessage }: AnalysisErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-3xl w-full">
        <h2 className="text-2xl font-semibold text-red-700 mb-4">Analysis Failed</h2>
        <p className="text-red-600 mb-6">
          {errorMessage || "We couldn't analyze this Airbnb listing. Please try again later."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-zeniks-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default AnalysisError;
