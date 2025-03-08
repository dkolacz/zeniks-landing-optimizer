
const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zeniks-purple mb-6">
            Unlock Your Rental's
            <br />
            Full Potential
          </h1>
          <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-8">
            Get an AI-powered analysis of your Airbnb, Vrbo, Booking.com or direct
            website listing
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" 
              className="bg-zeniks-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 group">
              Contact Us
            </a>
            <span className="text-zeniks-gray-dark text-lg font-medium">
              Custom pricing for property managers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
