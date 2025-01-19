import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogPost = () => {
  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <Navbar />
      <article className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-zeniks-purple mb-4">
              The Ultimate Guide to Optimizing Your Short-Term Rental Listing (Besides Price)
            </h1>
            <div className="flex items-center text-zeniks-gray-dark mb-8">
              <span>March 21, 2024</span>
              <span className="mx-2">•</span>
              <span>15 min read</span>
            </div>
            <img
              src="/lovable-uploads/1ccc17b7-8c1c-4daf-a373-6cfae9bd19f9.png"
              alt="Luxury vacation rental"
              className="w-full h-[400px] object-cover rounded-lg mb-8"
            />
          </header>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-zeniks-gray-dark mb-8">
              In the competitive world of short-term rentals, having a great listing is crucial for attracting guests and maximizing bookings. While pricing is undoubtedly important, it's not the only factor that influences a traveler's decision.
            </p>

            <img
              src="/lovable-uploads/7504540f-a389-4443-bc28-f3abd0048b6c.png"
              alt="Rental optimization report"
              className="w-full rounded-lg mb-8"
            />

            <h2 className="text-2xl font-bold text-zeniks-purple mt-12 mb-6">Content is King (and Queen)</h2>
            
            <h3 className="text-xl font-semibold text-zeniks-purple mt-8 mb-4">Craft a Compelling Title & Description</h3>
            <ul className="list-disc pl-6 mb-6 text-zeniks-gray-dark">
              <li className="mb-2">Start with a captivating title that entices travelers to click on your listing.</li>
              <li className="mb-2">Craft a detailed description that paints a vivid picture of your rental.</li>
            </ul>

            <h3 className="text-xl font-semibold text-zeniks-purple mt-8 mb-4">Highlight the Local Experience</h3>
            <ul className="list-disc pl-6 mb-6 text-zeniks-gray-dark">
              <li className="mb-2">Go beyond your rental and delve into the surrounding area.</li>
              <li className="mb-2">Tailor your description to the target audience.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zeniks-purple mt-12 mb-6">Showstopping Photos</h2>
            <ul className="list-disc pl-6 mb-6 text-zeniks-gray-dark">
              <li className="mb-2">Invest in high-resolution photos that showcase your rental in the best light.</li>
              <li className="mb-2">Take advantage of natural light whenever possible.</li>
              <li className="mb-2">Capture all the rooms and common areas.</li>
            </ul>

            {/* ... Continue with the rest of the content sections */}

            <div className="bg-zeniks-gray-blue p-8 rounded-lg mt-12">
              <h2 className="text-2xl font-bold text-zeniks-purple mb-4">Ready to optimize your listing?</h2>
              <p className="text-lg text-zeniks-gray-dark mb-6">
                Let Zeniks help you create a compelling listing that attracts more guests and maximizes your bookings.
              </p>
              <a
                href="/request-analysis"
                className="inline-block bg-zeniks-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;