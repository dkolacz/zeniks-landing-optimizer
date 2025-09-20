-- Add UPDATE policy for requests table
CREATE POLICY "Anyone can update requests" 
ON public.requests 
FOR UPDATE 
USING (true);