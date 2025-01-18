import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import RequestAnalysis from "@/pages/RequestAnalysis";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import About from "@/pages/About";
import Success from "@/pages/Success";
import Payment from "@/pages/Payment";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/request-analysis" element={<RequestAnalysis />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/success" element={<Success />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;