import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

interface FormFieldsProps {
  control: Control<any>;
}

export const FormFields = ({ control }: FormFieldsProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="listingUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zeniks-gray-dark">Listing URL</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter the URL of your listing here"
                className="border-gray-200"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zeniks-gray-dark">Platform</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="border-gray-200">
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
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zeniks-gray-dark">Full Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your first and last name"
                className="border-gray-200"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zeniks-gray-dark">Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Enter your email address"
                className="border-gray-200"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};