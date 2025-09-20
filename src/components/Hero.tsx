
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import sampleReport from "@/assets/sample-report.jpg";
import ReportPreview from "@/components/ReportPreview";
import { CheckCircle2, Clock } from "lucide-react";

const Hero = () => {
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [reportCount, setReportCount] = useState(27); // Start with 27 as baseline
  const [showSampleModal, setShowSampleModal] = useState(false);
  const { toast } = useToast();

  const autoCloseTimerRef = useRef<number | null>(null);
  const cancelAutoClose = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (showSuccessDialog) {
      autoCloseTimerRef.current = window.setTimeout(() => {
        setShowSuccessDialog(false);
      }, 7000);
    }
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [showSuccessDialog]);
  // Fetch current report count on component mount
  useEffect(() => {
    const fetchReportCount = async () => {
      try {
        const { count, error } = await supabase
          .from('report_requests')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          // Use the database count, but ensure it's at least 27 for urgency
          setReportCount(Math.max(count, 27));
        }
      } catch (error) {
        console.error('Error fetching report count:', error);
      }
    };

    fetchReportCount();
  }, []);

  // Validation functions
  const validateUrl = (url: string) => {
    const value = url.trim().toLowerCase();
    if (!value) {
      return "Airbnb URL is required";
    }
    if (!value.includes("airbnb")) {
      return "Please enter an Airbnb listing URL";
    }
    return "";
  };

  const handleUrlChange = (value: string) => {
    setAirbnbUrl(value);
    if (urlError) {
      setUrlError(validateUrl(value));
    }
  };

  const handleUrlBlur = () => {
    setUrlError(validateUrl(airbnbUrl));
  };

  const handleAnalyze = async () => {
    console.log('Handle analyze called');
    
    // Validate inputs first
    const urlValidationError = validateUrl(airbnbUrl);
    
    setUrlError(urlValidationError);
    
    if (urlValidationError) {
      console.log('Validation failed:', { urlValidationError });
      return;
    }

    setIsLoading(true);
    console.log('Form submission started with:', { airbnbUrl });
    
    try {
      // Store data in Supabase
      console.log('About to call Supabase...');
      
      const insertData = {
        airbnb_url: airbnbUrl.trim(),
        email: null
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

      console.log('About to show success dialog...');
      
      // Refresh report counter from database to get the updated count
      const { count: updatedCount } = await supabase
        .from('report_requests')
        .select('*', { count: 'exact', head: true });
      
      if (updatedCount !== null) {
        setReportCount(Math.max(updatedCount, 27));
      }
      
      // Show success dialog
      setShowSuccessDialog(true);
      console.log('Success dialog opened');

      // Reset form and clear errors
      setAirbnbUrl("");
      setUrlError("");
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
    <>
      <div className="relative min-h-screen flex items-center bg-gradient-to-br from-zeniks-gray-light via-white to-zeniks-blue/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-zeniks-purple/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-zeniks-blue/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zeniks-purple mb-6">
              Make Your Airbnb Stand Out with AI
            </h1>
            <p className="text-xl md:text-2xl text-zeniks-gray-dark max-w-3xl mx-auto mb-8">
              Get a free AI-powered audit to boost bookings and improve visibility
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col gap-4">
                <div>
                  <Input
                    type="url"
                    placeholder="Your Airbnb Listing URL"
                    className={`w-full py-6 text-base ${urlError ? 'border-red-500 focus:border-red-500' : ''}`}
                    value={airbnbUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onBlur={handleUrlBlur}
                  />
                  {urlError && (
                    <p className="text-red-500 text-sm mt-2 text-left">{urlError}</p>
                  )}
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!airbnbUrl || isLoading || !!urlError}
                  className="bg-zeniks-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zeniks-purple/90 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : (
                    <>
                      Get My Free Report 
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </>
                  )}
                </button>
                 
                 {/* Progress indicator moved below CTA */}
                 <div className="mt-4 text-center">
                   <p className="text-sm text-zeniks-gray-dark">
                     ✅ {reportCount} / 100 free AI reports claimed
                   </p>
                 </div>
                
                 {/* Sample Report Preview */}
                 <div className="mt-6 flex flex-col items-center">
                   <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
                     <DialogTrigger asChild>
                       <div className="cursor-pointer group">
                         <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/40">
                           <div className="text-center mb-3">
                             <p className="text-sm font-medium text-zeniks-purple group-hover:text-zeniks-purple/80 transition-colors">
                               Preview a Real Report
                             </p>
                           </div>
                           <img 
                             src={sampleReport} 
                             alt="Sample Zeniks AI report preview" 
                             className="w-24 h-16 object-cover rounded-lg border border-zeniks-gray-light shadow-sm mx-auto transform group-hover:scale-105 transition-all duration-300"
                           />
                           <p className="text-xs text-zeniks-gray-dark mt-2 text-center opacity-80 group-hover:opacity-100 transition-opacity">
                             Click to view full sample
                           </p>
                         </div>
                       </div>
                     </DialogTrigger>
                     <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
                       <DialogHeader className="p-6 pb-0">
                         <DialogTitle className="text-zeniks-purple text-xl font-bold">
                           Sample Zeniks AI Report
                         </DialogTitle>
                       </DialogHeader>
                       <ReportPreview />
                     </DialogContent>
                   </Dialog>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-dialog-title"
          className="max-w-[560px] text-center p-8 leading-relaxed"
          onMouseEnter={cancelAutoClose}
          onFocusCapture={cancelAutoClose}
        >
          <div className="mx-auto h-14 w-14 rounded-full bg-zeniks-purple/10 text-zeniks-purple flex items-center justify-center shadow-sm">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <DialogHeader className="space-y-4">
            <DialogTitle
              id="success-dialog-title"
              className="text-2xl sm:text-3xl font-bold text-zeniks-purple"
            >
              🎉 Thanks! Your Airbnb listing is in good hands.
            </DialogTitle>
            <DialogDescription className="text-base sm:text-lg text-zeniks-gray-dark">
              We’re analyzing your listing now. You’ll receive an email from <strong>Zeniks</strong> in a few minutes with next steps, and your personalized AI report within <strong>24 hours</strong>.
            </DialogDescription>
            <p className="text-sm sm:text-base text-zeniks-gray-dark">
              📬 Please check your inbox — and spam/junk just in case — for our confirmation email.
            </p>
          </DialogHeader>

          <ul className="mt-4 text-left space-y-3" role="list">
            <li className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zeniks-purple/10 text-zeniks-purple">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm sm:text-base">Full AI report delivered within 24 hours</span>
            </li>
          </ul>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => setShowSuccessDialog(false)}
              className="bg-zeniks-purple hover:bg-zeniks-purple/90 text-white"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Hero;
