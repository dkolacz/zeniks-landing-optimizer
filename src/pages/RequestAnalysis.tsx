import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

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

const RequestAnalysis = () => {
  const navigate = useNavigate();
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Store form data in localStorage for the payment page
    localStorage.setItem("analysisRequest", JSON.stringify(values));
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-zeniks-gray-light py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Progress indicator */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2 text-sm font-medium text-zeniks-purple">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zeniks-purple text-white">
                1
              </span>
              <span>Request Form</span>
              <span className="mx-2">→</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zeniks-gray-blue text-zeniks-purple">
                2
              </span>
              <span className="text-zeniks-gray-dark">Payment</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-zeniks-purple text-center mb-4">
            Request Your Personalized Listing Analysis
          </h1>
          <p className="text-zeniks-gray-dark text-center mb-8 max-w-2xl mx-auto">
            To get started, please provide the URL of your rental listing and some
            basic information. We'll analyze your listing and send your detailed
            report to the email address you provide.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 max-w-xl mx-auto"
            >
              <FormField
                control={form.control}
                name="listingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the URL of your listing here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="airbnb">Airbnb</SelectItem>
                        <SelectItem value="vrbo">VRBO</SelectItem>
                        <SelectItem value="booking">Booking.com</SelectItem>
                        <SelectItem value="own">My Own Website</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your first and last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-zeniks-purple hover:underline"
                        >
                          Terms and Conditions
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-zeniks-purple hover:bg-opacity-90 text-white"
              >
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-sm text-zeniks-gray-dark text-center mt-4">
                We respect your privacy and will only use your information to
                process your analysis request and send you your report.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RequestAnalysis;