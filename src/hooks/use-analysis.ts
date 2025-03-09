
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

        console.log("Fetched analysis data from DB:", data);
        console.log("Analysis status:", data.status);
        
        // More detailed logging of response_data
        if (data.response_data) {
          console.log("Response data type:", typeof data.response_data);
          
          if (typeof data.response_data === 'string') {
            console.log("Response data length:", data.response_data.length);
            console.log("Response data first 100 chars:", data.response_data.substring(0, 100));
            console.log("Response data last 100 chars:", data.response_data.substring(data.response_data.length - 100));
            
            // Special check for the specific analysis ID
            if (id === "fed49745-cbe0-4417-b927-d42d521c979e") {
              console.log("FULL RESPONSE DATA FOR DEBUGGING:", data.response_data);
            }
          } else if (typeof data.response_data === 'object') {
            console.log("Response data is an object with keys:", Object.keys(data.response_data));
          } else {
            console.log("Response data is neither string nor object, actual type:", typeof data.response_data);
          }
        } else {
          console.warn("No response_data in the analysis record!");
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
