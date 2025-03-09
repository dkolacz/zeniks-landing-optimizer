
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
        toast.error("No analysis ID provided");
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('airbnb_analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast.error("Analysis not found");
          navigate("/");
          return;
        }

        setAnalysis(data);
        
        // If still pending, check again after delay
        if (data.status === 'pending') {
          setTimeout(checkAnalysisStatus, 5000);
        } else {
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
