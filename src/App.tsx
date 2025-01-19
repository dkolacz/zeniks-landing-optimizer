import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import OptimizeRentalListing from "@/pages/OptimizeRentalListing";
import LeverageGuestReviews from "@/pages/LeverageGuestReviews";
import RequestAnalysis from "@/pages/RequestAnalysis";
import Success from "@/pages/Success";
import Payment from "@/pages/Payment";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/optimize-rental-listing" element={<OptimizeRentalListing />} />
        <Route path="/blog/leverage-guest-reviews" element={<LeverageGuestReviews />} />
        <Route path="/request-analysis" element={<RequestAnalysis />} />
        <Route path="/success" element={<Success />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;