import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Mail, FileText, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState<any>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchRequestData = async () => {
      if (!sessionId) {
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("listing_analysis_requests")
          .select("*")
          .eq("stripe_session_id", sessionId)
          .single();

        if (error) throw error;
        setRequestData(data);
      } catch (error) {
        console.error("Error fetching request data:", error);
        navigate("/");
      }
    };

    fetchRequestData();
  }, [sessionId, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!requestData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zeniks-gray-light py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-4">
              Success! Your Listing Analysis is Underway!
            </h1>
            <p className="text-zeniks-gray-dark mb-6">
              Thank you for your purchase! We've received your payment of $49 for your Zenik listing analysis. 
              We're now analyzing your listing at {requestData.listing_url} and will deliver your personalized 
              report to {requestData.email} within 24-48 hours. We're excited to help you improve your listing's performance!
            </p>
          </div>

          <div className="bg-zeniks-gray-blue rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-zeniks-purple mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Here's What to Expect
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 mt-1 text-zeniks-purple" />
                <p className="text-zeniks-gray-dark">
                  <span className="font-semibold">Check Your Inbox:</span> Keep an eye on your inbox 
                  (including your spam/junk folder) for an email from Zeniks with the subject line 
                  'Your Zenik Listing Analysis is Ready!'
                </p>
              </div>
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-3 mt-1 text-zeniks-purple" />
                <p className="text-zeniks-gray-dark">
                  <span className="font-semibold">Review Your Report:</span> Your personalized report 
                  will contain detailed insights and actionable recommendations to optimize your listing.
                </p>
              </div>
              <div className="flex items-start">
                <Settings className="h-5 w-5 mr-3 mt-1 text-zeniks-purple" />
                <p className="text-zeniks-gray-dark">
                  <span className="font-semibold">Implement the Suggestions:</span> Make the suggested 
                  changes to your listing to improve its visibility and attract more guests.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-zeniks-gray-dark text-center">
            If you do not receive the report in your email inbox within 48 hours, please check your spam folder. 
            If you still cannot locate the report, please contact us at contact@zeniks.co for further assistance.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;