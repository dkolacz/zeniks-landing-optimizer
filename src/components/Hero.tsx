
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
    console.log('Handle analyze called');
    
    if (!airbnbUrl || !email) {
      console.log('Missing required fields:', { airbnbUrl, email });
      toast({
        title: "Missing Information",
        description: "Please fill in both the Airbnb URL and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Form submission started with:', { airbnbUrl, email });
    
    try {
      // Store data in Supabase
      console.log('About to call Supabase...');
      
      const insertData = {
        airbnb_url: airbnbUrl.trim(),
        email: email.trim()
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('report_requests')
        .insert([insertData])
        .select();

      console.log('Supabase response received:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Database Error",
          description: error.message || "Failed to save your request. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Data saved successfully:', data);

      console.log('About to show success toast...');
      // Show success toast
      toast({
        title: "🎉 Thanks!",
        description: "Your Airbnb listing is being analyzed. You'll get your personalized AI report by email within 24 hours.",
      });
      console.log('Success toast called');

      // Reset form
      setAirbnbUrl("");
      setEmail("");
      console.log('Form reset successfully');
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('Loading state reset');
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
