-- Update function to fix search path security warning
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;