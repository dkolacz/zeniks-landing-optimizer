import { useEffect } from "react";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | Zeniks";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Read Zeniks Privacy Policy to understand how we collect, use, and protect your personal information. Your privacy is our priority.");
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-zeniks-purple" />
          <h1 className="text-3xl font-bold text-zeniks-purple">Privacy Policy</h1>
        </div>
        
        <div className="space-y-8 text-zeniks-gray-dark">
          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">1. Introduction</h2>
            <p>Welcome to Zeniks! Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service to purchase AI-based rental listing analyses. By using Zeniks, you consent to the data practices described in this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information:</h3>
                <ul className="list-disc pl-6">
                  <li>Full Name</li>
                  <li>Email Address</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Listing Information:</h3>
                <ul className="list-disc pl-6">
                  <li>URL of the rental listing on supported platforms (e.g., Airbnb, Vrbo, Booking.com, custom websites)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Payment Information:</h3>
                <ul className="list-disc pl-6">
                  <li>Payment details are collected and processed securely by our third-party payment processor. Zeniks does not store credit card details on its servers.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Information:</h3>
                <ul className="list-disc pl-6">
                  <li>IP address, browser type, and other technical data may be collected automatically for security and analytics purposes.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>Process your payment and confirm your purchase</li>
              <li>Analyze the rental listing you provide and generate a personalized report</li>
              <li>Deliver the completed analysis report to your email address within 24-48 hours</li>
              <li>Respond to customer support inquiries</li>
              <li>Improve our services and website functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">4. Sharing Your Information</h2>
            <p className="mb-4">We do not sell or rent your personal information. We may share your information with third parties only in the following circumstances:</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Providers:</h3>
                <ul className="list-disc pl-6">
                  <li>To payment processors for secure transactions</li>
                  <li>To cloud service providers for data storage and processing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal Compliance:</h3>
                <ul className="list-disc pl-6">
                  <li>If required by law, such as in response to a court order or subpoena</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Business Transfers:</h3>
                <ul className="list-disc pl-6">
                  <li>In the event of a merger, acquisition, or sale of our business, your information may be transferred as part of that transaction</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">5. Data Security</h2>
            <p>We take reasonable measures to protect your information from unauthorized access, loss, misuse, or alteration. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">6. Your Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access and review the personal information we hold about you</li>
              <li>Request corrections to your personal information</li>
              <li>Request deletion of your data, subject to legal and business obligations</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us at contact@zeniks.co</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">7. Data Retention</h2>
            <p>We retain personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">8. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. Please review their privacy policies before submitting any personal data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">9. International Data Transfers</h2>
            <p>If you are accessing Zeniks from outside the United States, please note that your information may be transferred to, stored, and processed in the United States or other countries where our service providers are located. By using Zeniks, you consent to these transfers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">10. Updates to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on our website with the "Effective Date" updated accordingly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4">11. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
            <p className="mt-2">Email: contact@zeniks.co</p>
          </section>

          <p className="mt-8 text-sm">By using Zeniks, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</p>
          <p className="text-sm">Effective Date: 2025-01-01</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
