
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResultProps {
  listingData: any;
  listingUrl: string;
}

const AnalysisResult = ({ listingData, listingUrl }: AnalysisResultProps) => {
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
            {listingData.name && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{listingData.name}</h3>
                {listingData.images?.picture_url && (
                  <img 
                    src={listingData.images.picture_url} 
                    alt={listingData.name} 
                    className="w-full h-64 object-cover rounded-lg my-4"
                  />
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-medium text-lg mb-2">Listing Information</h4>
                <ul className="space-y-2">
                  <li><span className="font-medium">Price:</span> {listingData.price?.rate ? `$${listingData.price.rate}` : 'N/A'}</li>
                  <li><span className="font-medium">Type:</span> {listingData.room_type || 'N/A'}</li>
                  <li><span className="font-medium">Bedrooms:</span> {listingData.bedrooms || 'N/A'}</li>
                  <li><span className="font-medium">Bathrooms:</span> {listingData.bathrooms || 'N/A'}</li>
                  <li><span className="font-medium">Location:</span> {listingData.address?.suburb || listingData.city || 'N/A'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-2">Host &amp; Reviews</h4>
                <ul className="space-y-2">
                  <li><span className="font-medium">Host:</span> {listingData.host?.host_name || 'N/A'}</li>
                  <li><span className="font-medium">Rating:</span> {listingData.rating || 'N/A'}</li>
                  <li><span className="font-medium">Number of Reviews:</span> {listingData.number_of_reviews || 'N/A'}</li>
                  <li><span className="font-medium">Review Scores:</span> {listingData.review_scores_rating || 'N/A'}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-2">Raw Response Data</h4>
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(listingData, null, 2)}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;
