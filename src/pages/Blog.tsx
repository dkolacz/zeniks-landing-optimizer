import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Ultimate Guide to Optimizing Your Short-Term Rental Listing (Besides Price)",
      description: "Learn how to optimize your short-term rental listing for Airbnb, Booking.com, Vrbo, or your own website. This guide covers content, photos, reviews, location, and host profile to maximize bookings with the help of AI.",
      image: "/lovable-uploads/1ccc17b7-8c1c-4daf-a373-6cfae9bd19f9.png",
      slug: "optimize-rental-listing",
      date: "March 21, 2024",
      readTime: "10 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-zeniks-purple mb-8 text-center">
            Zeniks Blog
          </h1>
          <p className="text-lg text-zeniks-gray-dark mb-12 text-center max-w-3xl mx-auto">
            Discover insights and tips to optimize your vacation rental listings and maximize your bookings
          </p>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-zeniks-gray-dark mb-2">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-zeniks-purple mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-zeniks-gray-dark line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-zeniks-purple hover:underline">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;