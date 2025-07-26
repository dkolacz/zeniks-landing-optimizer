
const HowItWorks = () => {
  const steps = [
    {
      emoji: "🔗",
      title: "Submit Your Airbnb Listing",
      description:
        "Paste the link to your Airbnb listing - no login required. We'll take care of the rest.",
    },
    {
      emoji: "🧠",
      title: "AI-Powered Listing Audit",
      description:
        "Zeniks' AI reviews your title, description, pricing, photos, and reviews to identify what's working - and what needs improvement.",
    },
    {
      emoji: "📋",
      title: "Get Your Personalized Report",
      description:
        "Receive a clear, actionable PDF with recommendations to boost visibility, improve conversions, and increase bookings.",
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
                <div className="text-4xl">
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
