-- Add new status values to request_status enum if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'request_status' AND e.enumlabel = 'awaiting_payment') THEN
    ALTER TYPE request_status ADD VALUE 'awaiting_payment';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'request_status' AND e.enumlabel = 'paid') THEN
    ALTER TYPE request_status ADD VALUE 'paid';
  END IF;
END $$;

-- Add stripe_session_id and customer_email columns to requests table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'requests' AND column_name = 'stripe_session_id') THEN
    ALTER TABLE public.requests ADD COLUMN stripe_session_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'requests' AND column_name = 'customer_email') THEN
    ALTER TABLE public.requests ADD COLUMN customer_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'requests' AND column_name = 'stripe_payment_intent') THEN
    ALTER TABLE public.requests ADD COLUMN stripe_payment_intent TEXT;
  END IF;
END $$;

-- Create audit_jobs table for AI agent processing queue
CREATE TABLE IF NOT EXISTS public.audit_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS on audit_jobs
ALTER TABLE public.audit_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_jobs
CREATE POLICY "Public can view audit jobs" ON public.audit_jobs
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage audit jobs" ON public.audit_jobs
  FOR ALL USING (true);

-- Create index on request_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_jobs_request_id ON public.audit_jobs(request_id);

-- Create index on status for queue processing
CREATE INDEX IF NOT EXISTS idx_audit_jobs_status ON public.audit_jobs(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_audit_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_jobs_updated_at_trigger
  BEFORE UPDATE ON public.audit_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_audit_jobs_updated_at();