-- Update the trigger function to work without vault secrets
CREATE OR REPLACE FUNCTION public.trigger_normalize_function()
RETURNS TRIGGER AS $$
DECLARE
  service_key text;
BEGIN
  -- Get the service role key from vault
  SELECT decrypted_secret INTO service_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
  
  -- Call the normalize edge function asynchronously with error handling
  BEGIN
    PERFORM net.http_post(
      url := 'https://mubmcqhraztyetyvfvaj.supabase.co/functions/v1/normalize',
      headers := ('{"Content-Type": "application/json", "Authorization": "Bearer ' || service_key || '"}')::jsonb,
      body := json_build_object('result_id', NEW.id)::jsonb
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the insert
      RAISE WARNING 'Failed to trigger normalize function for result_id %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;