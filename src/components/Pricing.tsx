
import { ArrowRight } from "lucide-react";

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-zeniks-gray-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-6">
            Expert Listing Analysis for Property Managers
          </h2>
          <p className="text-xl text-zeniks-gray-dark mb-8 max-w-2xl mx-auto">
            Get comprehensive, AI-powered analysis of your listings and
            personalized reports with actionable recommendations.
          </p>
          <a 
            href="#contact"
            className="bg-zeniks-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center gap-2 group"
          >
            Contact Us For Pricing
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
