import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "Optimize Your Vacation Rental Listing | Zeniks";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Zeniks provides AI-driven analysis for your vacation rental listing (Airbnb, VRBO and more.). Get a personalized report with recommendations to enhance your listing, attract more guests, and increase bookings.");
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;