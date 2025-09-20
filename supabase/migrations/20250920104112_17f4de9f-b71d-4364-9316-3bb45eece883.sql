-- Fix security issue: Set proper search_path for trigger function
CREATE OR REPLACE FUNCTION public.trigger_normalize_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the normalize edge function asynchronously
  PERFORM net.http_post(
    url := 'https://mubmcqhraztyetyvfvaj.supabase.co/functions/v1/normalize',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := json_build_object('result_id', NEW.id)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;