
import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisLoadingProps {
  progress: number;
}

const AnalysisLoading = ({ progress }: AnalysisLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader className="h-16 w-16 text-zeniks-purple animate-spin mb-6" />
      <h2 className="text-2xl font-semibold text-center mb-4">
        Zeniks is analyzing your listing
      </h2>
      <p className="text-zeniks-gray-dark text-center mb-8">
        This might take a couple of minutes. Please don't close this page.
      </p>
      <Progress value={progress} className="w-full max-w-md h-2" />
      <p className="mt-2 text-sm text-zeniks-gray-dark">{progress}% complete</p>
    </div>
  );
};

export default AnalysisLoading;
