import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Control } from "react-hook-form";
import { Link } from "react-router-dom";

interface TermsCheckboxProps {
  control: Control<any>;
}

export const TermsCheckbox = ({ control }: TermsCheckboxProps) => {
  return (
    <FormField
      control={control}
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
              <Link
                to="/terms"
                target="_blank"
                className="text-zeniks-purple hover:underline"
              >
                Terms and Conditions
              </Link>
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};