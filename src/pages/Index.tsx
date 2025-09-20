import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Make Your Airbnb Stand Out with AI | Zeniks";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Get a free, personalized AI-powered report to improve your Airbnb listing's visibility and bookings.");
    
    // Handle section scrolling when navigating from other pages
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get("section");
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

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