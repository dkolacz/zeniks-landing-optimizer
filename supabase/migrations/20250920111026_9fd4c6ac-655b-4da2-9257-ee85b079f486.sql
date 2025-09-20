-- Ensure normalization runs only when data is present
DROP TRIGGER IF EXISTS trigger_normalize_on_insert ON public.results;
DROP TRIGGER IF EXISTS trigger_normalize_on_update ON public.results;

-- Fire only when a row is inserted with data already populated
CREATE TRIGGER trigger_normalize_on_insert
  AFTER INSERT ON public.results
  FOR EACH ROW
  WHEN (NEW.data IS NOT NULL)
  EXECUTE FUNCTION public.trigger_normalize_function();

-- Fire when data transitions from NULL to NOT NULL (scraper finished)
CREATE TRIGGER trigger_normalize_on_update
  AFTER UPDATE OF data ON public.results
  FOR EACH ROW
  WHEN (NEW.data IS NOT NULL AND OLD.data IS NULL)
  EXECUTE FUNCTION public.trigger_normalize_function();