import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FormFields } from "./FormFields";
import { TermsCheckbox } from "./TermsCheckbox";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  listingUrl: z.string().url("Please enter a valid URL"),
  platform: z.string(),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Conditions",
  }),
});

const determinePlatform = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('airbnb')) return 'airbnb';
  if (lowerUrl.includes('vrbo')) return 'vrbo';
  if (lowerUrl.includes('www.booking')) return 'booking';
  return 'own';
};

const RequestForm = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingUrl: "",
      platform: "own",
      fullName: "",
      email: "",
      terms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Determine platform from URL
      const platform = determinePlatform(values.listingUrl);
      const formData = { ...values, platform };

      // Store form data in localStorage for the payment page
      localStorage.setItem("analysisRequest", JSON.stringify(formData));
      
      // Create checkout session using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: formData
      });

      if (error || !data?.url) {
        console.error('Checkout error:', error);
        throw new Error(error?.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
        <FormFields control={form.control} />
        <TermsCheckbox control={form.control} />

        <Button
          type="submit"
          className="w-full bg-zeniks-purple hover:bg-opacity-90 text-white"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Payment - $49'
          )}
        </Button>

        <p className="text-sm text-zeniks-gray-dark text-center mt-4">
          We respect your privacy and will only use your information to
          process your analysis request and send you your report.
        </p>
      </form>
    </Form>
  );
};

export default RequestForm;