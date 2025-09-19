-- Add original_url column to results table
ALTER TABLE public.results 
ADD COLUMN original_url TEXT;