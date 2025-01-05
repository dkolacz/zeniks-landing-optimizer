import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("analysisRequest");
    if (!data) {
      toast({
        title: "Error",
        description: "Please fill out the analysis request form first.",
        variant: "destructive",
      });
      navigate("/request-analysis");
      return;
    }
    setFormData(JSON.parse(data));
  }, [navigate, toast]);

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
            Your analysis report will be sent to {formData?.email} after payment is
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
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description:
                      "Payment processing will be implemented with Stripe.",
                  });
                }}
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
};

export default Payment;