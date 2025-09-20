-- Re-enable the normalize trigger with better error handling
CREATE OR REPLACE FUNCTION public.trigger_normalize_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the normalize edge function asynchronously with error handling
  BEGIN
    PERFORM net.http_post(
      url := 'https://mubmcqhraztyetyvfvaj.supabase.co/functions/v1/normalize',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
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

-- Re-create the trigger
CREATE TRIGGER trigger_normalize_on_insert
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_normalize_function();