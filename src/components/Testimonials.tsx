import { Star } from "lucide-react";
import sarahAvatar from "@/assets/sarah-avatar.jpg";

const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zeniks-purple mb-16">
          Loved by Airbnb Hosts Like You
        </h2>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <img 
                src={sarahAvatar} 
                alt="Sarah J. - Airbnb Superhost" 
                className="w-16 h-16 rounded-full object-cover shadow-md"
              />
            </div>
            
            {/* Testimonial Quote */}
            <blockquote className="text-xl text-zeniks-gray-dark mb-8 text-center leading-relaxed">
              "Zeniks report provided valuable insights I hadn't considered. Implementing their suggestions has made a noticeable difference in my listing's performance and helped me <strong className="text-zeniks-purple font-semibold">boost my bookings</strong> significantly."
            </blockquote>
            
            {/* 5-star rating */}
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="w-5 h-5 text-yellow-400 fill-current" 
                />
              ))}
            </div>
            
            {/* Author info */}
            <div className="text-center">
              <p className="font-semibold text-zeniks-purple text-lg">
                Sarah J.
              </p>
              <p className="text-zeniks-gray-dark">
                Superhost in Austin, TX
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;