import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate(`/?section=${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center justify-center"
            onClick={() => navigate("/")}
          >
            <img 
              src="/lovable-uploads/e4d24c33-5eb5-4f55-bc09-2f23afc828e5.png" 
              alt="Zeniks Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
            >
              Benefits
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-zeniks-gray-dark hover:text-zeniks-purple transition-colors"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zeniks-gray-dark hover:text-zeniks-purple"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-3 py-2 text-zeniks-gray-dark hover:text-zeniks-purple"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="block w-full text-left px-3 py-2 text-zeniks-gray-dark hover:text-zeniks-purple"
              >
                Benefits
              </button>
              <button
                onClick={() => navigate("/blog")}
                className="block w-full text-left px-3 py-2 text-zeniks-gray-dark hover:text-zeniks-purple"
              >
                Blog
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left px-3 py-2 text-zeniks-gray-dark hover:text-zeniks-purple"
              >
                Contact Us
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;