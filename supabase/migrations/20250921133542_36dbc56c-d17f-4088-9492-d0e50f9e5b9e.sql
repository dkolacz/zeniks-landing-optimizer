-- Fix the SELECT policy to allow public read access
-- The issue is that users can insert data anonymously but can't read it back

DROP POLICY IF EXISTS "Authenticated users can view requests" ON public.requests;

-- Create a public SELECT policy so anonymous users can view the results
CREATE POLICY "Public can view requests" 
ON public.requests 
FOR SELECT 
TO public
USING (true);