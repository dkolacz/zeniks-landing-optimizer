
const HowItWorks = () => {
  const steps = [
    {
      emoji: "🔗",
      title: "Submit Your Listing URL",
      description:
        "Paste the link to your rental listing on Airbnb, VRBO, Booking.com, or your own website.",
    },
    {
      emoji: "🧠",
      title: "AI-Powered Analysis",
      description:
        "Zeniks AI model analyzes your listing content, photos, reviews, location and other key factors.",
    },
    {
      emoji: "📋",
      title: "Get Your Actionable Report",
      description:
        "Receive a detailed, easy-to-understand report with specific recommendations to enhance your listing performance.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-zeniks-gray-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zeniks-purple mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-zeniks-purple rounded-full flex items-center justify-center text-2xl">
                  {step.emoji}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-zeniks-purple mb-4 text-center">
                {step.title}
              </h3>
              <p className="text-zeniks-gray-dark text-center">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
