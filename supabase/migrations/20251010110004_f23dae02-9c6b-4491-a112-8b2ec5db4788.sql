-- Create the results table to store normalized data
CREATE TABLE IF NOT EXISTS public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  listing_id text NOT NULL,
  normalized_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(request_id)
);

-- Enable RLS on results table
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Public can view results" 
ON public.results 
FOR SELECT 
TO public
USING (true);

-- Create policy to allow authenticated users to insert results
CREATE POLICY "Authenticated users can insert results" 
ON public.results 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update results
CREATE POLICY "Authenticated users can update results" 
ON public.results 
FOR UPDATE 
TO authenticated
USING (true);

-- Create trigger to automatically call normalize function when data is inserted/updated
CREATE OR REPLACE TRIGGER trigger_normalize_on_data_update
AFTER INSERT OR UPDATE OF data ON public.requests
FOR EACH ROW
WHEN (NEW.data IS NOT NULL)
EXECUTE FUNCTION public.trigger_normalize_function();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_results_request_id ON public.results(request_id);
CREATE INDEX IF NOT EXISTS idx_results_listing_id ON public.results(listing_id);
