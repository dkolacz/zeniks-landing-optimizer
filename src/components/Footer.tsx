import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="bg-zeniks-gray-blue py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/bed86774-1164-422a-bd44-7697b6139ab8.png" 
                alt="Zeniks Logo" 
                className="h-8 w-auto"
              />
              <h3 className="text-2xl font-bold text-zeniks-purple">Zeniks</h3>
            </div>
            <p className="text-zeniks-gray-dark">
              Empowering hosts to maximize their rental potential through AI-driven
              insights.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zeniks-purple mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#how-it-works"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#benefits"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  Benefits
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zeniks-purple mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zeniks-purple mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@zeniks.com"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  contact@zeniks.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-zeniks-silver">
          <p className="text-center text-zeniks-gray-dark">
            © 2025 Zeniks. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
