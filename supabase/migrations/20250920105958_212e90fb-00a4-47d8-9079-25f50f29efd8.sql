-- Set the service role key so triggers can authenticate with edge functions
SELECT vault.create_secret(
  'app.settings.service_role_key',
  (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'),
  'Service role key for internal API calls'
);

-- Create the trigger that calls the normalize function
CREATE TRIGGER trigger_normalize_on_insert
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_normalize_function();