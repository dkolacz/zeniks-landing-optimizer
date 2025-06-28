
const Benefits = () => {
  const benefits = [
    {
      emoji: "🔍",
      title: "Enhance Listing Visibility",
      description:
        "Improve your listing's discoverability so more potential guests can find your property.",
    },
    {
      emoji: "💝",
      title: "Craft a More Compelling Listing",
      description:
        "Optimize your listing's content and photos to create a stronger appeal for travelers.",
    },
    {
      emoji: "💡",
      title: "Gain Expert Insights",
      description:
        "Benefit from an in-depth analysis that reveals your listing's strengths and areas for improvement.",
    },
    {
      emoji: "👍",
      title: "Guest-Centric Approach",
      description:
        "Understand what guests are looking for and tailor your listing to meet their needs and expectations.",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zeniks-purple mb-4">
          Improve Your Listing, Attract More Guests
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-zeniks-gray-light hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-zeniks-purple rounded-full flex items-center justify-center mb-4 mx-auto text-xl">
                {benefit.emoji}
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
