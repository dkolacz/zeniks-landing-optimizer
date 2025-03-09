
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import OptimizeRentalListing from "@/pages/OptimizeRentalListing";
import LeverageGuestReviews from "@/pages/LeverageGuestReviews";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import Analysis from "@/pages/Analysis";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/optimize-rental-listing" element={<OptimizeRentalListing />} />
        <Route path="/blog/leverage-guest-reviews" element={<LeverageGuestReviews />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/analysis/:id" element={<Analysis />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
