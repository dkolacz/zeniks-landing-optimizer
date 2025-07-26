-- Create report_requests table to store user report requests
CREATE TABLE public.report_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  airbnb_url TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (though this will be public data)
ALTER TABLE public.report_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (since this is a public form)
CREATE POLICY "Anyone can submit report requests" 
ON public.report_requests 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading own requests (if we need this later)
CREATE POLICY "Anyone can view report requests" 
ON public.report_requests 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_report_requests_updated_at
BEFORE UPDATE ON public.report_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();