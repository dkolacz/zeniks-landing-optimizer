-- Fix security vulnerability: Restrict access to requests table
-- Remove overly permissive policies that expose scraping operations
DROP POLICY IF EXISTS "Anyone can view requests" ON public.requests;
DROP POLICY IF EXISTS "Anyone can update requests" ON public.requests;

-- Create secure policies that protect sensitive scraping data
-- Allow public INSERT for new requests (needed for the service to function)
-- But restrict SELECT and UPDATE to authenticated users only

CREATE POLICY "Authenticated users can view requests" 
ON public.requests 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update requests" 
ON public.requests 
FOR UPDATE 
TO authenticated
USING (true);

-- Keep public INSERT for service functionality
-- The "Anyone can insert requests" policy remains as-is