
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
        console.log("Analysis URL:", data.listing_url);
        
        // Check if we have raw_response
        if (data.raw_response) {
          console.log("Raw response available, length:", data.raw_response.length);
          
          // Log first and last 100 chars of raw_response for debugging
          if (data.raw_response.length > 200) {
            console.log("Raw response first 100 chars:", data.raw_response.substring(0, 100));
            console.log("Raw response last 100 chars:", data.raw_response.substring(data.raw_response.length - 100));
          } else {
            console.log("Raw response (full):", data.raw_response);
          }
          
          // Try to parse the raw_response to see if it's valid JSON
          try {
            const parsedRawResponse = JSON.parse(data.raw_response);
            console.log("Raw response is valid JSON with keys:", Object.keys(parsedRawResponse));
            
            // If response_data is empty but raw_response has valid data, update response_data
            if (!data.response_data && data.status === 'success') {
              console.log("Found valid JSON in raw_response but empty response_data, updating record");
              await supabase
                .from('airbnb_analyses')
                .update({ 
                  response_data: parsedRawResponse 
                })
                .eq('id', id);
                
              // Update local data with the parsed response
              data.response_data = parsedRawResponse;
            }
          } catch (parseError) {
            console.error("Raw response is not valid JSON:", parseError);
          }
        } else {
          console.log("No raw_response found");
        }
        
        // More detailed logging of response_data
        if (data.response_data) {
          console.log("Response data type:", typeof data.response_data);
          
          if (typeof data.response_data === 'string') {
            try {
              // Perform a validation check by parsing and stringifying
              const jsonCheck = JSON.parse(data.response_data);
              console.log("Successfully validated JSON data structure with keys:", Object.keys(jsonCheck));
              console.log("Response data length:", data.response_data.length);
              
              if (data.response_data.length > 200) {
                console.log("Response data first 100 chars:", data.response_data.substring(0, 100));
                console.log("Response data last 100 chars:", data.response_data.substring(data.response_data.length - 100));
              } else {
                console.log("Response data (full):", data.response_data);
              }
            } catch (error) {
              console.error("Invalid JSON in response_data:", error);
              
              // Update analysis record to mark as failed due to invalid JSON
              if (data.status === 'success') {
                console.log("Updating analysis record to mark as failed due to invalid JSON");
                await supabase
                  .from('airbnb_analyses')
                  .update({ 
                    status: 'failed',
                    error_message: `Invalid JSON in response_data: ${error instanceof Error ? error.message : 'Unknown error'}` 
                  })
                  .eq('id', id);
                  
                // If we have raw_response, try to recover
                if (data.raw_response) {
                  console.log("Attempting to recover from raw_response");
                  try {
                    const recoveredData = JSON.parse(data.raw_response);
                    console.log("Successfully recovered data from raw_response");
                    data.response_data = recoveredData;
                    data.status = 'success'; // Override the status locally
                  } catch (recoverError) {
                    console.error("Failed to recover from raw_response:", recoverError);
                  }
                }
              }
            }
          } else if (typeof data.response_data === 'object') {
            console.log("Response data is an object with keys:", Object.keys(data.response_data));
          } else {
            console.log("Response data is neither string nor object, actual type:", typeof data.response_data);
          }
        } else {
          console.warn("No response_data in the analysis record!");
          
          // If we have raw_response but no response_data, try to parse and use it
          if (data.raw_response && data.status === 'success') {
            console.log("Attempting to use raw_response as fallback");
            try {
              const fallbackData = JSON.parse(data.raw_response);
              console.log("Successfully parsed raw_response as fallback data");
              data.response_data = fallbackData;
            } catch (fallbackError) {
              console.error("Failed to use raw_response as fallback:", fallbackError);
            }
          }
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
