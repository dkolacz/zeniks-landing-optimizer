import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;