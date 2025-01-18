import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FormFields } from "./FormFields";
import { TermsCheckbox } from "./TermsCheckbox";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  listingUrl: z.string().url("Please enter a valid URL"),
  platform: z.string({
    required_error: "Please select a platform",
  }),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Conditions",
  }),
});

const RequestForm = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingUrl: "",
      platform: "",
      fullName: "",
      email: "",
      terms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First, store the request in the database with status "requested"
      const { data: insertData, error: insertError } = await supabase
        .from('listing_analysis_requests')
        .insert({
          listing_url: values.listingUrl,
          platform: values.platform,
          full_name: values.fullName,
          email: values.email,
          status: 'requested',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insertion error:', insertError);
        throw new Error(insertError.message);
      }

      // Store form data in localStorage for the payment page
      localStorage.setItem("analysisRequest", JSON.stringify(values));
      
      // Create checkout session using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          ...values,
          requestId: insertData.id // Pass the request ID to the checkout function
        }
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
        description: "Failed to process request. Please try again.",
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
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Pay $49 Now
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