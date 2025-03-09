
import { useNavigate } from "react-router-dom";

const AnalysisEmpty = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <p>No data available.</p>
      <button
        onClick={() => navigate("/")}
        className="bg-zeniks-purple text-white px-6 py-2 rounded-lg mt-4 hover:bg-opacity-90 transition-all"
      >
        Go Back
      </button>
    </div>
  );
};

export default AnalysisEmpty;
