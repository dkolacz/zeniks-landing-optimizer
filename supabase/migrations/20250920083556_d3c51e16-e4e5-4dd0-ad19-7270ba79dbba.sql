-- Create status enum
CREATE TYPE request_status AS ENUM ('pending', 'processing', 'done', 'failed');

-- Create requests table
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status request_status NOT NULL DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented)
CREATE POLICY "Anyone can insert requests" 
ON public.requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view requests" 
ON public.requests 
FOR SELECT 
USING (true);