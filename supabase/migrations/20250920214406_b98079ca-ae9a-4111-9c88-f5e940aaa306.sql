-- Add columns to store fetched data and timestamp
ALTER TABLE public.requests 
ADD COLUMN data jsonb,
ADD COLUMN fetched_at timestamp with time zone;