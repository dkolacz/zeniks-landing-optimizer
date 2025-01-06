import { useEffect } from "react";
import { ScrollText } from "lucide-react";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zeniks-gray-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <ScrollText className="w-8 h-8 text-zeniks-purple" />
            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple text-center">
              Terms and Conditions
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zeniks-gray-dark mb-4">Effective Date: 2025-01-01</p>
            
            <p className="mb-8">
              Welcome to Zeniks! These Terms and Conditions ("Terms") govern your use of the Zeniks service (the "Service"), 
              including the purchase of AI-based rental listing analysis reports. By accessing or using Zeniks, you agree to 
              comply with and be bound by these Terms. If you do not agree, please do not use the Service.
            </p>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">1. Service Overview</h2>
            <p>
              Zeniks provides AI-driven analysis of short-term rental listings to help hosts improve their listings on platforms 
              like Airbnb, Vrbo, Booking.com, or custom websites. The Service includes content analysis, review evaluation, 
              host details, amenities, and photo assessments, delivered as a PDF report.
            </p>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">2. Use of the Service</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users must provide accurate and complete information, including the URL of their rental listing, email address, and full name.</li>
              <li>Zeniks leverages third-party AI models to propose recommendations and improvements.</li>
              <li>Reports are delivered to the email address provided during purchase within 24-48 hours of order confirmation.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">3. Responsibility and Disclaimer</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">No Guarantee of Results:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Zeniks does not guarantee that the changes proposed in the analysis report will improve the performance of the listing. Results may vary based on multiple factors outside Zeniks' control.</li>
              <li>Zeniks is not responsible if the recommendations provided in the report negatively impact the listing's performance.</li>
              <li>Users are solely responsible for deciding whether and how to apply the changes recommended in the report.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">Accuracy of Provided Data:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users are responsible for providing the correct URL and other required information in the report request form. Zeniks will analyze the information exactly as submitted.</li>
              <li>If incorrect information is submitted, a new purchase is required to receive an updated report.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">4. Payments and Refunds</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The fee for each analysis report is $49 USD.</li>
              <li>Payment must be made at the time of submitting the report request.</li>
              <li>No refunds will be issued once a report has been delivered, regardless of the outcome or effectiveness of the recommendations.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">5. Complaints</h2>
            <p>
              If you wish to submit a complaint about the Service, please contact us at contact@zeniks.co. 
              We will review your complaint and respond within a reasonable timeframe.
            </p>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">6. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The reports, content, and recommendations provided by Zeniks are proprietary and intended for personal use by the purchasing user only.</li>
              <li>Users may not reproduce, distribute, or resell the reports without prior written permission from Zeniks.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Zeniks shall not be held liable for any direct, indirect, 
              incidental, consequential, or punitive damages arising out of:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The use or inability to use the Service.</li>
              <li>The performance or non-performance of recommendations provided in the report.</li>
              <li>Errors, omissions, or inaccuracies in the analysis.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">8. Termination</h2>
            <p>
              Zeniks reserves the right to terminate or suspend access to the Service for users who violate 
              these Terms or engage in fraudulent or harmful activities.
            </p>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">9. Changes to These Terms</h2>
            <p>
              Zeniks may update these Terms from time to time. The updated version will be posted on our website 
              with the "Effective Date" revised accordingly. Continued use of the Service after updates constitutes 
              acceptance of the revised Terms.
            </p>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">10. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the United States. 
              Any disputes arising under these Terms shall be resolved in the courts of the United States.
            </p>

            <h2 className="text-2xl font-semibold text-zeniks-purple mt-8 mb-4">11. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms, please contact us:<br />
              Email: contact@zeniks.co
            </p>

            <p className="mt-8">
              By using Zeniks, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;