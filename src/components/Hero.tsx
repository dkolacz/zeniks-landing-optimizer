
import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
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
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-white via-zeniks-gray-light to-zeniks-blue/10">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-zeniks-purple/10 text-zeniks-purple px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            Trusted by 500+ Airbnb Hosts
          </div>
          
          {/* Main Headlines */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-zeniks-purple mb-6 leading-tight">
            Turn Your Airbnb Into a 
            <br />
            <span className="bg-gradient-to-r from-zeniks-purple to-zeniks-blue bg-clip-text text-transparent">
              Booking Magnet
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-4 leading-relaxed">
            Get instant, AI-powered insights to boost your visibility, 
            increase bookings, and maximize your revenue.
          </p>
          
          <p className="text-lg text-zeniks-gray-dark/80 max-w-2xl mx-auto mb-12">
            Join thousands of hosts who've increased their bookings by up to 40% with our data-driven recommendations.
          </p>
          
          {/* CTA Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-zeniks-gray-light/50">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="Paste your Airbnb listing URL here..."
                  className="flex-1 py-4 px-6 text-lg border-2 border-zeniks-gray-light focus:border-zeniks-purple rounded-xl"
                  value={airbnbUrl}
                  onChange={(e) => setAirbnbUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <button
                  onClick={handleAnalyze}
                  className="bg-zeniks-purple text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-zeniks-purple/90 transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl min-w-[200px]"
                >
                  Boost My Bookings
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-sm text-zeniks-gray-dark/60 mt-4 text-center">
                ✨ Free analysis • 📊 Instant results • 🚀 Actionable insights
              </p>
            </div>
          </div>
          
          {/* Key Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-zeniks-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="font-semibold text-zeniks-purple mb-2">More Visibility</h3>
              <p className="text-zeniks-gray-dark/80">Optimize for Airbnb's algorithm</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zeniks-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold text-zeniks-purple mb-2">Better Reviews</h3>
              <p className="text-zeniks-gray-dark/80">Improve guest satisfaction</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zeniks-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-zeniks-purple mb-2">Higher Occupancy</h3>
              <p className="text-zeniks-gray-dark/80">Fill more nights, earn more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
