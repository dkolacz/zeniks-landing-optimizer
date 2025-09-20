-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create function to call the scraper API
CREATE OR REPLACE FUNCTION public.call_scraper_api()
RETURNS TRIGGER AS $$
BEGIN
  -- Make async HTTP request to the scraper API
  PERFORM
    net.http_post(
      url := 'https://zeniks.onrender.com/scrape',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('listing_id', NEW.listing_id)::jsonb
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new request is inserted
CREATE TRIGGER trigger_call_scraper_api
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.call_scraper_api();