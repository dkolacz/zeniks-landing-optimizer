import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Success = () => {
  const [searchParams] = useSearchParams();
  const [listingDetails, setListingDetails] = useState<{
    listing_url?: string;
    email?: string;
    platform?: string;
  }>({});
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("listing_analysis_requests")
        .select("listing_url, email, platform")
        .eq("stripe_session_id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching listing details:", error);
        return;
      }

      if (data) {
        setListingDetails(data);
      }
    };

    fetchDetails();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-zeniks-gray-light py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-4">
              Success! Your Listing Analysis is Underway!
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-zeniks-gray-dark text-lg">
              Thank you for your purchase! We've received your payment of $49 for your Zeniks listing analysis. 
              We're now analyzing your listing and will deliver your personalized report to your email within 24-48 hours. 
              We're excited to help you improve your listing's performance!
            </p>

            <div className="bg-zeniks-gray-blue rounded-lg p-6">
              <h2 className="text-xl font-semibold text-zeniks-purple mb-4">
                Here's What to Expect
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zeniks-purple text-white rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  <p>
                    <strong>Check Your Inbox:</strong> Keep an eye on your inbox (including your spam/junk folder) 
                    for an email from Zeniks with the subject line 'Your Zenik Listing Analysis is Ready!'
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zeniks-purple text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  <p>
                    <strong>Review Your Report:</strong> Your personalized report will contain detailed insights 
                    and actionable recommendations to optimize your listing.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zeniks-purple text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  <p>
                    <strong>Implement the Suggestions:</strong> Make the suggested changes to your listing 
                    on {listingDetails.platform} to improve its visibility and attract more guests.
                  </p>
                </li>
              </ol>
            </div>

            <div className="text-zeniks-gray-dark text-sm mt-6">
              <p>
                If you do not receive the report in your email inbox within 48 hours, please check your spam folder. 
                If you still cannot locate the report, please contact us at{" "}
                <a href="mailto:contact@zeniks.co" className="text-zeniks-purple hover:underline">
                  contact@zeniks.co
                </a>{" "}
                for further assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;