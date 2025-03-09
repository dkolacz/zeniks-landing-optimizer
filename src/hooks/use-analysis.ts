import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAnalysis = (id: string | undefined) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    document.title = "Analyzing Your Listing | Zeniks";
    
    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Cap at 90% until we get actual results
        return prev + 5;
      });
    }, 5000);

    // Check status of the analysis
    const checkAnalysisStatus = async () => {
      if (!id) {
        console.log("No analysis ID provided");
        toast.error("No analysis ID provided");
        navigate("/");
        return;
      }

      console.log(`Checking analysis status for ID: ${id}`);
      
      try {
        const { data, error } = await supabase
          .from('airbnb_analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Supabase error fetching analysis:", error);
          throw error;
        }
        
        if (!data) {
          console.log("Analysis not found in database");
          toast.error("Analysis not found");
          navigate("/");
          return;
        }

        console.log("Fetched analysis data:", data);
        
        // Process the response_data field
        if (data.response_data) {
          console.log("Raw response_data type:", typeof data.response_data);
          
          if (typeof data.response_data === 'string') {
            console.log("Response data is a string, length:", data.response_data.length);
            console.log("First 100 chars:", data.response_data.substring(0, 100));
            
            // If it's a string, try to parse it if it looks like JSON
            if (data.response_data.trim().startsWith('{') || data.response_data.trim().startsWith('[')) {
              try {
                console.log("Attempting to parse response_data string as JSON");
                data.response_data = JSON.parse(data.response_data);
                console.log("Successfully parsed response_data as JSON");
              } catch (parseError) {
                console.error("Failed to parse response_data as JSON:", parseError);
                // Keep as string if parsing fails
              }
            }
          } else {
            console.log("Response data is already an object");
          }
        } else {
          console.log("No response_data in the analysis record");
        }
        
        setAnalysis(data);
        
        // If still pending, check again after delay
        if (data.status === 'pending') {
          console.log("Analysis status is still pending, will check again");
          setTimeout(checkAnalysisStatus, 5000);
        } else {
          console.log(`Analysis status is: ${data.status}`);
          clearInterval(progressInterval);
          setProgress(100);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Failed to retrieve analysis results");
        clearInterval(progressInterval);
        setLoading(false);
      }
    };

    checkAnalysisStatus();
    
    return () => clearInterval(progressInterval);
  }, [id, navigate]);

  return { analysis, loading, progress };
};
