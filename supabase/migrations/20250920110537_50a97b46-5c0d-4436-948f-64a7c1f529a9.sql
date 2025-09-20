-- Simplify trigger to avoid auth header (function is public)
CREATE OR REPLACE FUNCTION public.trigger_normalize_function()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://mubmcqhraztyetyvfvaj.supabase.co/functions/v1/normalize',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('result_id', NEW.id)::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger normalize function for result_id %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure we can safely upsert by listing_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_listings_listing_id_unique'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX idx_listings_listing_id_unique ON public.listings (listing_id);
    EXCEPTION WHEN OTHERS THEN
      -- If it already exists under a different name, ignore
      RAISE NOTICE 'Unique index on listings.listing_id may already exist: %', SQLERRM;
    END;
  END IF;
END$$;