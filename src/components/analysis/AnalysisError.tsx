
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisErrorProps {
  errorMessage: string | null;
  listingUrl?: string;
  rawResponse?: string;
}

const AnalysisError = ({ errorMessage, listingUrl, rawResponse }: AnalysisErrorProps) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-3xl w-full">
        <h2 className="text-2xl font-semibold text-red-700 mb-4">Analysis Failed</h2>
        
        {listingUrl && (
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Listing URL:</span>{" "}
            <a 
              href={listingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zeniks-purple hover:underline"
            >
              {listingUrl}
            </a>
          </p>
        )}
        
        <p className="text-red-600 mb-6">
          {errorMessage || "We couldn't analyze this Airbnb listing. Please try again later."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="default"
            className="bg-zeniks-purple hover:bg-opacity-90"
          >
            Try Again
          </Button>
          
          {rawResponse && (
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="border-zeniks-purple text-zeniks-purple"
            >
              {showDetails ? "Hide Technical Details" : "Show Technical Details"}
            </Button>
          )}
        </div>
        
        {showDetails && rawResponse && (
          <div className="mt-4">
            <Tabs defaultValue="raw" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="raw">Raw Response</TabsTrigger>
                <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="raw">
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  <h4 className="font-medium text-lg mb-2">Raw API Response</h4>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto">{rawResponse}</pre>
                </div>
              </TabsContent>
              
              <TabsContent value="parsed">
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  <h4 className="font-medium text-lg mb-2">Parsed Response (Attempted)</h4>
                  {rawResponse ? (
                    <div>
                      <p className="mb-2">Attempting to parse API response:</p>
                      <pre className="text-xs whitespace-pre-wrap overflow-auto">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(rawResponse), null, 2);
                          } catch (e) {
                            return `Failed to parse: ${e instanceof Error ? e.message : 'Unknown error'}`;
                          }
                        })()}
                      </pre>
                    </div>
                  ) : (
                    <p>No raw response data available to parse</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <p className="text-gray-500 text-sm mt-4">
          Note: Some Airbnb listings may have restrictions that prevent our system from analyzing them.
          Try using a different listing or check that the URL is correct.
        </p>
      </div>
    </div>
  );
};

export default AnalysisError;
