import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer id="contact" className="bg-zeniks-gray-blue py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div 
              className="cursor-pointer mb-4"
              onClick={() => navigate("/")}
            >
              <img 
                src="/lovable-uploads/e4d24c33-5eb5-4f55-bc09-2f23afc828e5.png" 
                alt="Zeniks Logo" 
                className="h-8 w-auto"
              />
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
              <li>
                <Link
                  to="/blog"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zeniks-purple mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
                >
                  About Us
                </Link>
              </li>
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