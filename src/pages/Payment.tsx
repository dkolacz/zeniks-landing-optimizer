import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const status = searchParams.get("status");

  useEffect(() => {
    const data = localStorage.getItem("analysisRequest");
    if (!data && !sessionId) {
      toast({
        title: "Error",
        description: "Please fill out the analysis request form first.",
        variant: "destructive",
      });
      navigate("/request-analysis");
      return;
    }
    if (data) {
      setFormData(JSON.parse(data));
    }
  }, [navigate, toast]);

  useEffect(() => {
    const handlePaymentStatus = async () => {
      if (sessionId) {
        try {
          const { data, error } = await supabase.functions.invoke('update-payment-status', {
            body: { session_id: sessionId },
          });

          if (error) throw error;

          if (data.status === 'paid') {
            // Redirect to success page with session ID and clear localStorage
            localStorage.removeItem("analysisRequest");
            navigate(`/success?session_id=${sessionId}`, { replace: true });
          } else {
            toast({
              title: "Payment Failed",
              description: "There was an issue processing your payment. Please try again.",
              variant: "destructive",
            });
            navigate("/request-analysis");
          }
        } catch (error) {
          console.error('Error updating payment status:', error);
          toast({
            title: "Error",
            description: "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          });
          navigate("/request-analysis");
        }
      } else if (status === 'cancelled') {
        toast({
          title: "Payment Cancelled",
          description: "You've cancelled the payment. You can try again when you're ready.",
        });
        navigate("/request-analysis");
      }
    };

    handlePaymentStatus();
  }, [sessionId, status, navigate, toast]);

  const handlePayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: formData,
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "There was an issue initiating the payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Only show payment form if we have form data and no session ID
  if (!sessionId && formData) {
    return (
      <div className="min-h-screen bg-zeniks-gray-light py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Progress indicator */}
            <div className="mb-8 flex justify-center">
              <div className="flex items-center gap-2 text-sm font-medium text-zeniks-purple">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zeniks-gray-blue text-zeniks-purple">
                  1
                </span>
                <span className="text-zeniks-gray-dark">Request Form</span>
                <span className="mx-2">→</span>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zeniks-purple text-white">
                  2
                </span>
                <span>Payment</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple text-center mb-4">
              Complete Your Payment
            </h1>
            <p className="text-zeniks-gray-dark text-center mb-8 max-w-2xl mx-auto">
              Your analysis report will be sent to {formData.email} after payment is
              processed.
            </p>

            <div className="max-w-xl mx-auto">
              <div className="bg-zeniks-gray-blue rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-zeniks-purple mb-4">
                  Order Summary
                </h2>
                <div className="flex justify-between items-center text-zeniks-gray-dark mb-2">
                  <span>Listing Analysis</span>
                  <span className="font-semibold">$49.00</span>
                </div>
                <div className="border-t border-zeniks-silver pt-2 mt-2">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-zeniks-purple">$49.00</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <Button
                  onClick={handlePayment}
                  className="w-full bg-zeniks-purple hover:bg-opacity-90 text-white"
                >
                  Pay Securely
                  <Lock className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center text-sm text-zeniks-gray-dark">
                  <Lock className="h-4 w-4 mr-2" />
                  Secure payment powered by Stripe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking payment status
  return null;
};

export default Payment;