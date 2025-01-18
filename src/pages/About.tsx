import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us - Zeniks";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Learn how Zeniks AI-powered listing analysis helps vacation rental hosts boost bookings and save time. Discover our story and commitment to your success."
    );
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple text-center mb-8">
              Zeniks: Your AI-Powered Partner for Vacation Rental Success
            </h1>

            <div className="space-y-6 text-zeniks-gray-dark">
              <p>
                Hi, I'm Brian, the founder of Zeniks and a fellow vacation rental
                host here in California. I created Zeniks out of my own experiences
                in the short-term rental market – both the successes and the
                struggles.
              </p>

              <p>
                Like many of you, I've spent countless hours managing my properties
                and trying to figure out the best ways to optimize my listings.
                I've experimented with different titles, descriptions, photos, and
                pricing strategies. I've learned firsthand just how challenging it
                can be to stand out in a crowded market and attract the right
                guests. I was spending too much time trying different approaches,
                with mixed results, and not enough time enjoying the rewards of
                being a host.
              </p>

              <p>
                I knew there had to be a better way – a smarter way – to get my
                listings performing at their peak. That's why I built Zeniks. I
                envisioned a tool that could leverage the power of Artificial
                Intelligence to analyze listings, identify areas for improvement,
                and provide clear, actionable recommendations.
              </p>

              <p>
                My goal with Zeniks is simple: to empower hosts like you with
                data-driven insights that were previously only available to large
                hotel chains. I wanted to create a tool that is different from
                complicated and expensive property management systems. That is why I
                decided to focus on doing one thing exceptionally well: optimizing
                your listing through the power of Artificial Intelligence.
              </p>

              <div className="bg-zeniks-gray-blue p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-zeniks-purple mb-4">
                  Here's how Zeniks can help you:
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Automated Analysis:</strong> I've designed Zeniks AI
                    algorithms to do the heavy lifting, analyzing your listing's
                    content, photos, reviews, and other key factors.
                  </li>
                  <li>
                    <strong>Actionable Insights:</strong> You won't just get raw
                    data. Zeniks provides you with clear, easy-to-understand
                    recommendations that you can implement immediately.
                  </li>
                  <li>
                    <strong>Personalized Recommendations:</strong> Every listing is
                    unique. That is why Zeniks analysis is tailored specifically to
                    your property, ensuring you receive the most relevant and
                    impactful advice.
                  </li>
                  <li>
                    <strong>More Bookings, Less Work:</strong> My ultimate aim is
                    to help you attract more guests, increase your revenue, and
                    free up your time.
                  </li>
                </ul>
              </div>

              <p>
                I'm truly passionate about helping other hosts succeed. At Zeniks,
                we're a small, dedicated team, and we're committed to providing
                exceptional support and constantly improving our AI to give you the
                most accurate insights. We're in this journey together.
              </p>

              <div className="bg-zeniks-purple/10 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-zeniks-purple mb-2">
                  Zeniks Vision
                </h2>
                <p className="italic">
                  To revolutionize the short-term rental industry by providing
                  AI-powered tools that empower every host to maximize their
                  success while reclaiming their time.
                </p>
              </div>

              <div className="flex flex-col items-center mt-12">
                <img
                  src="/lovable-uploads/a3ae28fc-f765-406c-b402-c19cb8153f7d.png"
                  alt="Brian, Founder of Zeniks"
                  className="w-48 h-48 rounded-full object-cover mb-4"
                />
                <p className="text-zeniks-purple font-script text-2xl">Brian C.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;