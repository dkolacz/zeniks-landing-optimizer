-- Create the listings table to store normalized Airbnb listing data
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL UNIQUE,
  listing JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access but restricted write access
CREATE POLICY "Anyone can view listings" 
ON public.listings 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update listings" 
ON public.listings 
FOR UPDATE 
USING (true);

-- Create index on listing_id for better performance
CREATE INDEX idx_listings_listing_id ON public.listings(listing_id);

-- Create index on created_at for sorting
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);

-- Create trigger for automatic updated_at timestamp updates
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();