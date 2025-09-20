-- Add schema_version column to listings table
ALTER TABLE public.listings 
ADD COLUMN schema_version TEXT DEFAULT 'v2';

-- Create normalization_errors table for error logging
CREATE TABLE public.normalization_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id BIGINT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on normalization_errors
ALTER TABLE public.normalization_errors ENABLE ROW LEVEL SECURITY;

-- Create policy for system access to normalization_errors
CREATE POLICY "System can insert errors" 
ON public.normalization_errors 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can view errors" 
ON public.normalization_errors 
FOR SELECT 
USING (true);

-- Create function to trigger normalize edge function
CREATE OR REPLACE FUNCTION public.trigger_normalize_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the normalize edge function asynchronously
  PERFORM net.http_post(
    url := 'https://mubmcqhraztyetyvfvaj.supabase.co/functions/v1/normalize',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := json_build_object('result_id', NEW.id)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on results table
CREATE TRIGGER trigger_normalize_on_insert
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_normalize_function();

-- Create index on normalization_errors for better performance
CREATE INDEX idx_normalization_errors_result_id ON public.normalization_errors(result_id);
CREATE INDEX idx_normalization_errors_created_at ON public.normalization_errors(created_at DESC);