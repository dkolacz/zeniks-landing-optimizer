import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faEye, faStar, faLightbulb, faCheckCircle, faExclamationCircle,
  faFileAlt, faEdit, faMagicWandSparkles, faCamera, faBed, faUserCircle,
  faList, faEuroSign, faComments, faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

const ReportPreview = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const ScoreBar = ({ percentage, color = 'bg-gradient-to-r from-green-500 to-green-400' }: { percentage: number; color?: string }) => (
    <div className="w-20">
      <div className="bg-gray-200 h-2 rounded-full">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  const InsightCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-sky-500">
      {children}
    </div>
  );

  const RecommendationItem = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gray-50 p-4 rounded-lg border-l-3 border-green-500">
      {children}
    </div>
  );

  const SectionHeader = ({ icon, title, score }: { icon: any; title: string; score?: number }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={icon} className="text-blue-600 mr-2" />
        {title}
      </h3>
      {score && (
        <div className="flex items-center">
          <span className="text-lg font-bold text-gray-800 mr-2">{score}</span>
          <ScoreBar percentage={(score / 5) * 100} />
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 max-h-[80vh] overflow-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white p-8 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Airbnb Performance Report</h1>
              <p className="text-blue-200 text-lg">Luxury Apartment in Mataró</p>
            </div>
            <div className="text-right">
              <FontAwesomeIcon icon={faHome} className="text-4xl text-blue-200 mb-2" />
              <p className="text-sm text-blue-200">Performance Analysis</p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FontAwesomeIcon icon={faEye} className="text-blue-600 mr-3" />
            Preview
          </h2>

          {/* Summary */}
          <InsightCard>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">This luxury apartment in Mataró offers stunning sea views and a range of amenities, but there's room for improvement in value perception and photo presentation.</p>
          </InsightCard>

          {/* Score Overview */}
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Performance</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-800">4.5</span>
                <span className="text-sm text-gray-600">out of 5.0</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mb-4">
                <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{ width: '90%' }} />
              </div>
              <div className="flex items-center text-green-600">
                <FontAwesomeIcon icon={faStar} className="mr-2" />
                <span className="text-sm">Strong Performance</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Potential Score</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">4.9</span>
                <span className="text-sm text-gray-600">achievable</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
              <div className="flex items-center text-blue-600">
                <FontAwesomeIcon icon={faArrowUp} className="mr-2" />
                <span className="text-sm">+0.4 Point Improvement</span>
              </div>
            </div>
          </div>

          {/* Top Insights */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 mr-2" />
              Top Insights
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3 mt-1" />
                <p className="text-gray-700">Guests praise the responsiveness and helpfulness of the host.</p>
              </div>
              <div className="flex items-start">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3 mt-1" />
                <p className="text-gray-700">The sea views are a major highlight for guests.</p>
              </div>
              <div className="flex items-start">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-500 mr-3 mt-1" />
                <p className="text-gray-700">The value dimension has the lowest score, suggesting room for improvement.</p>
              </div>
            </div>
          </div>

          {/* Total Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Recommendations</h3>
                <p className="text-gray-600">Actionable improvements identified</p>
              </div>
              <div className="text-3xl font-bold text-blue-600">18</div>
            </div>
          </div>
        </div>

        {/* Full Report Section */}
        <div className="bg-gray-50 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 mr-3" />
            Full Report
          </h2>

          {/* Description Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faEdit} title="Description" score={4.7} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The listing summary is attractive but could be more detailed about the unique features and amenities.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3 mb-6">
              <RecommendationItem>
                <p className="text-gray-700">Include more emotional and unique selling points in the summary.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Highlight specific luxury features and guest-favorite amenities in the space description.</p>
              </RecommendationItem>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <FontAwesomeIcon icon={faMagicWandSparkles} className="text-green-600 mr-2" />
                Suggested Rewrite
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-green-800">Summary:</span>
                  <p className="text-green-700 mt-1">"Experience luxury with breathtaking sea views at our fully-equipped apartment in Mataró, just a 25-minute drive from Barcelona. Enjoy exclusive amenities like a community pool and private parking."</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Space:</span>
                  <p className="text-green-700 mt-1">"The apartment features three cozy bedrooms, a modern kitchen with high-end appliances, and a spacious living area with panoramic views of the sea. Perfect for both relaxation and remote work, the space is designed to cater to all your needs."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faCamera} title="Photos" score={3.8} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The photos lack captions and variety in orientation, which could enhance the listing's appeal.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3">
              <RecommendationItem>
                <p className="text-gray-700">Add engaging captions to each photo to describe the view or room features.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Include a mix of portrait and landscape photos to add visual interest.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Ensure that all major spaces are clearly shown and labeled.</p>
              </RecommendationItem>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faStar} title="Amenities" score={4.8} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The listing includes a comprehensive range of amenities, appealing to various guest needs.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3">
              <RecommendationItem>
                <p className="text-gray-700">Consider adding a dedicated workspace to attract business travelers.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Highlight unique amenities like beachfront access and a Nespresso machine in the listing description.</p>
              </RecommendationItem>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faComments} title="Reviews" score={4.8} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">Reviews are overwhelmingly positive, particularly praising the host's responsiveness and the stunning sea views.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3">
              <RecommendationItem>
                <p className="text-gray-700">Encourage the host to respond to reviews to further engage with guests.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Highlight the praised features (sea views, host responsiveness) prominently in the listing.</p>
              </RecommendationItem>
            </div>
          </div>

          {/* Spaces Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faBed} title="Spaces" score={4.6} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The space is well-configured for families or groups but could be better described in the listing.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3">
              <RecommendationItem>
                <p className="text-gray-700">Clarify the bed and room configuration in the listing to better inform potential guests.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Consider adding another double bed to accommodate more couples or reduce the number of single beds.</p>
              </RecommendationItem>
            </div>
          </div>

          {/* Host Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faUserCircle} title="Host" score={4.5} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The host is a Superhost, which is a significant trust factor, but the profile lacks personal details and language skills.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3">
              <RecommendationItem>
                <p className="text-gray-700">Update the host bio with more personal information and achievements.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">List languages spoken to attract a broader audience.</p>
              </RecommendationItem>
            </div>
          </div>

          {/* House Rules Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faList} title="House Rules" score={4.3} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The house rules are detailed but could be presented in a more guest-friendly manner.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3 mb-6">
              <RecommendationItem>
                <p className="text-gray-700">Rewrite the rules to be more concise and friendly.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Highlight the rules visually in the listing for better readability.</p>
              </RecommendationItem>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <FontAwesomeIcon icon={faMagicWandSparkles} className="text-green-600 mr-2" />
                Suggested Rewrite
              </h4>
              <p className="text-green-700 text-sm">"To ensure everyone enjoys their stay, please follow these simple pool rules: Shower before swimming, wear pool shoes, and supervise children under 14. Remember, the pool area is open from 7 AM to 10 PM. Please be considerate of others and avoid glass containers and rough play in and around the pool."</p>
            </div>
          </div>

          {/* Pricing & Availability Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <SectionHeader icon={faEuroSign} title="Pricing & Availability" score={4.4} />
            
            <InsightCard>
              <p className="text-gray-700 font-medium">The pricing and availability settings are generally good, but flexibility could be improved.</p>
            </InsightCard>

            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendations</h4>
            <div className="space-y-3">
              <RecommendationItem>
                <p className="text-gray-700">Consider reducing the minimum night stay to attract more short-term bookings.</p>
              </RecommendationItem>
              <RecommendationItem>
                <p className="text-gray-700">Adjust check-in and check-out times for greater guest convenience.</p>
              </RecommendationItem>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-6 rounded-b-lg text-center">
          <p className="text-gray-600 text-sm">This report analyzes your Airbnb listing performance and provides actionable recommendations to help you achieve your potential score of 4.9 stars.</p>
          <p className="text-gray-500 text-xs mt-2">Generated on: {currentDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;