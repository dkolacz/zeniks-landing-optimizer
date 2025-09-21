-- Fix the INSERT policy to allow anonymous users to create requests
-- The issue is that the current policy has no explicit WITH CHECK condition

DROP POLICY IF EXISTS "Anyone can insert requests" ON public.requests;

-- Create a proper INSERT policy that allows public access
CREATE POLICY "Public can insert requests" 
ON public.requests 
FOR INSERT 
TO public
WITH CHECK (true);