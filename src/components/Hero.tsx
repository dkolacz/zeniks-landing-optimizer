import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* Hero Image Container */}
      <div className="absolute inset-0">
        <img
          src="/lovable-uploads/6aa104f1-5b0f-4194-9684-9009742b1ead.png"
          alt="Luxury vacation rental with infinity pool"
          className="w-full h-full object-cover rounded-b-[40px]"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-b-[40px]"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Unlock Your Rental's
            <br />
            Full Potential
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Get an AI-powered analysis of your Airbnb, Vrbo, Booking.com or direct
            website listing
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/request-analysis")}
              className="bg-zeniks-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 group"
            >
              Analyze My Listing
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-white text-lg font-medium">
              Just $49 per analysis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;