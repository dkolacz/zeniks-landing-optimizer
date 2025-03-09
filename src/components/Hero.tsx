
import HeroBackground from "@/components/hero/HeroBackground";
import HeroHeading from "@/components/hero/HeroHeading";
import AirbnbAnalysisForm from "@/components/hero/AirbnbAnalysisForm";

const Hero = () => {
  return (
    <HeroBackground>
      <HeroHeading 
        title="AI-Powered Analysis for Your Airbnb Listing" 
        subtitle="Get a personalized report with actionable steps to improve your performance."
      />
      <AirbnbAnalysisForm />
    </HeroBackground>
  );
};

export default Hero;
