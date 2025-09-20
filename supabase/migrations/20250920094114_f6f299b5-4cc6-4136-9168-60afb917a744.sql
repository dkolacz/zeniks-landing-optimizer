-- Enable the pg_net extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update function to use the correct extension
CREATE OR REPLACE FUNCTION public.call_scraper_api()
RETURNS TRIGGER AS $$
BEGIN
  -- Make async HTTP request to the scraper API using pg_net
  PERFORM
    extensions.http_post(
      url := 'https://zeniks.onrender.com/scrape',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('listing_id', NEW.listing_id)::jsonb
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;