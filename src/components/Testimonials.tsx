import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Zeniks report provided valuable insights I hadn't considered. Implementing their suggestions has made a noticeable difference in my listing's performance.",
      author: "Sarah J.",
      title: "Airbnb Superhost",
    },
    {
      quote:
        "I was impressed by the depth of Zeniks analysis. It helped me understand how to better showcase my property and attract the right guests.",
      author: "Mark D.",
      title: "VRBO Host",
    },
    {
      quote:
        "Join hundreds of hosts who trust Zenik to provide actionable insights and help them achieve their rental goals.",
      author: "Juan C.",
      title: "Direct Website",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((currentIndex + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (currentIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zeniks-purple mb-16">
          Trusted by Hosts Worldwide
        </h2>
        <div className="relative max-w-4xl mx-auto">
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronLeft className="w-6 h-6 text-zeniks-purple" />
          </button>
          <div className="bg-zeniks-gray-light rounded-xl p-8 md:p-12">
            <Quote className="w-12 h-12 text-zeniks-purple mb-6 mx-auto" />
            <p className="text-xl text-zeniks-gray-dark mb-8 text-center">
              {testimonials[currentIndex].quote}
            </p>
            <div className="text-center">
              <p className="font-semibold text-zeniks-purple">
                {testimonials[currentIndex].author}
              </p>
              <p className="text-zeniks-gray-dark">
                {testimonials[currentIndex].title}
              </p>
            </div>
          </div>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronRight className="w-6 h-6 text-zeniks-purple" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;