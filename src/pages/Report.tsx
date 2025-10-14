import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Report = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setIsVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        // Call the update-payment-status function to verify and process the payment
        const { data, error } = await supabase.functions.invoke('update-payment-status', {
          body: { session_id: sessionId }
        });

        if (error) {
          console.error('Error verifying payment:', error);
          toast({
            title: "Verification Error",
            description: "Failed to verify payment. Please contact support.",
            variant: "destructive",
          });
          setIsVerifying(false);
          return;
        }

        if (data?.status === 'paid') {
          setPaymentVerified(true);
          toast({
            title: "Payment Successful!",
            description: "Your AI report will be delivered to your email shortly.",
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
      <Navbar />
      <div className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 text-center">
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zeniks-purple mx-auto mb-6"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-zeniks-purple mb-4">
                  Verifying Your Payment...
                </h1>
                <p className="text-zeniks-gray-dark">
                  Please wait while we confirm your payment.
                </p>
              </>
            ) : paymentVerified ? (
              <>
                <div className="text-6xl mb-6">✅</div>
                <h1 className="text-2xl md:text-3xl font-bold text-zeniks-purple mb-4">
                  Payment Successful!
                </h1>
                <p className="text-zeniks-gray-dark mb-6">
                  Thank you for your purchase. Our AI agent is now processing your listing.
                </p>
                <div className="bg-gradient-to-r from-zeniks-purple/10 to-zeniks-blue/10 rounded-lg p-6 border border-zeniks-purple/20">
                  <p className="text-zeniks-purple font-medium">
                    📧 Your comprehensive optimization report will be delivered to your email within the next few minutes.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl md:text-3xl font-bold text-zeniks-purple mb-4">
                  Payment Verification Failed
                </h1>
                <p className="text-zeniks-gray-dark mb-6">
                  We couldn't verify your payment. Please contact our support team if you've been charged.
                </p>
                <a 
                  href="/"
                  className="inline-block bg-zeniks-purple hover:bg-zeniks-purple/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Return Home
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Report;
