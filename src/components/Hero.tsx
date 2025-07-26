
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (airbnbUrl && email) {
      setIsLoading(true);
      try {
        // Store data in Supabase
        const { data, error } = await supabase
          .from('report_requests')
          .insert([
            {
              airbnb_url: airbnbUrl,
              email: email
            }
          ])
          .select();

        if (error) {
          console.error('Error storing data:', error);
          toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Call the webhook
        const response = await fetch('https://zeniks.app.n8n.cloud/webhook-test/6c2e1660-debd-490b-ac21-7167d1f0573e', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: airbnbUrl, email: email }),
        });

        if (!response.ok) {
          console.error('Error calling webhook:', response.statusText);
        }

        // Show success toast
        toast({
          title: "🎉 Thanks!",
          description: "Your Airbnb listing is being analyzed. You'll get your personalized AI report by email within 24 hours.",
        });

        // Reset form
        setAirbnbUrl("");
        setEmail("");
        
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zeniks-purple mb-6">
            Supercharge Your Airbnb Listing with AI
          </h1>
          <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-8">
            Get a free, personalized AI-powered audit to increase bookings and improve your listing's visibility. Just paste your URL.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
              <Input
                type="url"
                placeholder="Your Airbnb Listing URL"
                className="w-full py-6 text-base"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Your Email Address"
                className="w-full py-6 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                disabled={!airbnbUrl || !email || isLoading}
                className="bg-zeniks-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Get My Free Report →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
