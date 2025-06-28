
import { useState } from "react";
import { ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");

  const handleAnalyze = async () => {
    if (airbnbUrl) {
      try {
        const response = await fetch('https://zeniks.app.n8n.cloud/webhook-test/6c2e1660-debd-490b-ac21-7167d1f0573e', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: airbnbUrl }),
        });

        if (!response.ok) {
          console.error('Error calling webhook:', response.statusText);
        }

        console.log('Webhook called successfully');
      } catch (error) {
        console.error('Error calling webhook:', error);
      }
    }
  };

  return (
    <div className="relative">
      {/* Main Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Optimize Your Rental Listing with{" "}
            <span className="text-blue-600">AI-Powered Insights</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized recommendations to increase your bookings, improve guest satisfaction, and maximize your rental income.
          </p>

          {/* URL Input Section */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <Input
                type="url"
                placeholder="Enter your listing URL (Airbnb, VRBO, etc.)"
                className="flex-1 border-0 bg-white shadow-sm text-base py-3"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group"
              >
                Get Analysis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              ✓ Free analysis • ✓ Instant results • ✓ No signup required
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Analysis</h3>
              <p className="text-gray-600 text-sm">
                AI-powered insights backed by thousands of successful listings
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Results</h3>
              <p className="text-gray-600 text-sm">
                Get your personalized report within 24-48 hours
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600 text-sm">
                Hosts see up to 40% increase in booking rates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Submit Your URL
              </h3>
              <p className="text-gray-600">
                Paste your vacation rental listing URL from any platform
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your listing content, photos, and market position
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Get Recommendations
              </h3>
              <p className="text-gray-600">
                Receive actionable insights to optimize your listing performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 mb-4">
              <Shield className="h-4 w-4" />
              Trusted by 500+ Property Owners
            </div>
            <blockquote className="text-lg text-gray-700 italic mb-4">
              "Zeniks helped me identify key improvements that increased my booking rate by 35% within the first month."
            </blockquote>
            <cite className="text-gray-600 font-medium">
              - Sarah M., Airbnb Superhost
            </cite>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
