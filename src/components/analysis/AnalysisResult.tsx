
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResultProps {
  listingData: any;
  listingUrl: string;
}

const AnalysisResult = ({ listingData, listingUrl }: AnalysisResultProps) => {
  console.log("AnalysisResult - Rendering with raw listingData type:", typeof listingData);
  
  // Check if the data is empty
  if (!listingData) {
    console.error("AnalysisResult - listingData is empty or null");
    return (
      <div className="py-10 px-4">
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Airbnb Listing Analysis</CardTitle>
            <CardDescription>
              Analysis results for: <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="text-zeniks-purple hover:underline">{listingUrl}</a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-amber-600">No Data Available</h3>
              <p>We received a successful response from the API but no listing data was found.</p>
              <p>The API may have encountered an issue while scraping this particular listing. Please try again or try with a different Airbnb listing URL.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle string data
  let processedData = listingData;
  if (typeof listingData === 'string') {
    console.log("AnalysisResult - listingData is a string, attempting to parse");
    try {
      // Check if the string is actually empty or whitespace
      if (!listingData.trim()) {
        console.error("AnalysisResult - listingData string is empty or whitespace");
        return (
          <div className="py-10 px-4">
            <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Airbnb Listing Analysis</CardTitle>
                <CardDescription>
                  Analysis results for: <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="text-zeniks-purple hover:underline">{listingUrl}</a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold text-red-600">Empty Response</h3>
                  <p>We received an empty string from the API.</p>
                  <p>The API may have encountered an issue while scraping this particular listing. Please try again or try with a different Airbnb listing URL.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      // Log the raw string data for debugging
      console.log("AnalysisResult - Raw string data (first 100 chars):", listingData.substring(0, 100));
      console.log("AnalysisResult - Raw string data (last 100 chars):", listingData.substring(listingData.length - 100));
      
      processedData = JSON.parse(listingData);
      console.log("AnalysisResult - Successfully parsed string data to JSON");
    } catch (error) {
      console.error("AnalysisResult - Failed to parse string data:", error);
      
      // Show error state if we can't parse the data
      return (
        <div className="py-10 px-4">
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Airbnb Listing Analysis</CardTitle>
              <CardDescription>
                Analysis results for: <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="text-zeniks-purple hover:underline">{listingUrl}</a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-red-600">Error Processing Data</h3>
                <p>We received a response from the API but couldn't process it correctly.</p>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 mt-4">
                  <h4 className="font-medium text-lg mb-2">Raw Response</h4>
                  <pre className="text-xs">{typeof listingData === 'string' ? listingData : 'Non-string data received'}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }
  
  // If the processed data is an array, get the first item
  if (Array.isArray(processedData)) {
    console.log("AnalysisResult - Data is an array with length:", processedData.length);
    if (processedData.length > 0) {
      processedData = processedData[0];
      console.log("AnalysisResult - Using first item from array");
    } else {
      console.log("AnalysisResult - Array is empty");
      processedData = {};
    }
  }

  // Main return for valid data
  console.log("AnalysisResult - Final processed data object keys:", Object.keys(processedData));
  
  return (
    <div className="py-10 px-4">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Airbnb Listing Analysis</CardTitle>
          <CardDescription>
            Analysis results for: <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="text-zeniks-purple hover:underline">{listingUrl}</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {processedData.name && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{processedData.name}</h3>
                {processedData.images?.picture_url && (
                  <img 
                    src={processedData.images.picture_url} 
                    alt={processedData.name} 
                    className="w-full h-64 object-cover rounded-lg my-4"
                  />
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-medium text-lg mb-2">Listing Information</h4>
                <ul className="space-y-2">
                  <li><span className="font-medium">Price:</span> {processedData.price?.rate ? `$${processedData.price.rate}` : 'N/A'}</li>
                  <li><span className="font-medium">Type:</span> {processedData.room_type || 'N/A'}</li>
                  <li><span className="font-medium">Bedrooms:</span> {processedData.bedrooms || 'N/A'}</li>
                  <li><span className="font-medium">Bathrooms:</span> {processedData.bathrooms || 'N/A'}</li>
                  <li><span className="font-medium">Location:</span> {processedData.address?.suburb || processedData.city || 'N/A'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-2">Host &amp; Reviews</h4>
                <ul className="space-y-2">
                  <li><span className="font-medium">Host:</span> {processedData.host?.host_name || 'N/A'}</li>
                  <li><span className="font-medium">Rating:</span> {processedData.rating || 'N/A'}</li>
                  <li><span className="font-medium">Number of Reviews:</span> {processedData.number_of_reviews || 'N/A'}</li>
                  <li><span className="font-medium">Review Scores:</span> {processedData.review_scores_rating || 'N/A'}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-2">Raw Response Data</h4>
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(processedData, null, 2)}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;
