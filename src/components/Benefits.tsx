
const Benefits = () => {
  const benefits = [
    {
      emoji: "🔍",
      title: "Boost Search Ranking",
      description:
        "Help your listing appear higher in Airbnb search results, so more potential guests find your property.",
    },
    {
      emoji: "📸",
      title: "Make Your Listing Irresistible",
      description:
        "Upgrade your photos and descriptions to attract clicks, views, and bookings from the right travelers.",
    },
    {
      emoji: "🤖",
      title: "Unlock AI-Backed Insights",
      description:
        "Get a custom analysis that highlights what's working, what's not, and what you should fix first.",
    },
    {
      emoji: "💬",
      title: "Think Like Your Guests",
      description:
        "Understand exactly what your guests are looking for — and shape your listing around their needs and expectations.",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zeniks-purple mb-4">
          Improve Your Listing, Get More Bookings
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-zeniks-gray-light hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="text-3xl">
                  {benefit.emoji}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-zeniks-purple mb-3 text-center">
                {benefit.title}
              </h3>
              <p className="text-zeniks-gray-dark text-center">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
