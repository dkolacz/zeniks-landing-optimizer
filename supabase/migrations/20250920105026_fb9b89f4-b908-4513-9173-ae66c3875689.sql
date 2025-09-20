-- Temporarily disable the normalize trigger to fix the immediate issue
DROP TRIGGER IF EXISTS trigger_normalize_on_insert ON public.results;

-- We'll re-enable it after fixing the underlying issue