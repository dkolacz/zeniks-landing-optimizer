-- Remove the database trigger and function since we're using edge functions
DROP TRIGGER IF EXISTS trigger_call_scraper_api ON public.requests;
DROP FUNCTION IF EXISTS public.call_scraper_api();