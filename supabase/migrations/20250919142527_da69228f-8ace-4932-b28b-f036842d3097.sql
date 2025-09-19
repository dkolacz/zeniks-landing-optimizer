-- Make email column nullable in report_requests table
ALTER TABLE public.report_requests 
ALTER COLUMN email DROP NOT NULL;