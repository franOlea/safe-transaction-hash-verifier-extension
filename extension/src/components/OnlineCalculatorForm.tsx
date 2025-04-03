import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import NetworkInput from "./NetworkInput";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Define form schema with Zod
const formSchema = z.object({
  safeAddress: z.string().min(42, {
    message: "Safe address should be a valid Ethereum address",
  }),
  nonce: z.string().min(1, {
    message: "Nonce is required",
  }),
  safeVersion: z.string().min(1, {
    message: "Safe version is required",
  }),
  network: z.string().min(1, {
    message: "Network is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface OnlineCalculatorFormProps {
  onSubmitData?: (data: FormValues, mode: "online") => void;
  extractedSafeAddress?: string | null;
  extractedNetwork?: string | null;
  onAddressSet?: () => void;
  onNetworkSet?: () => void;
  isLoading?: boolean;
  onClear?: () => void;
}

export function OnlineCalculatorForm({
  onSubmitData,
  extractedSafeAddress,
  extractedNetwork,
  onAddressSet,
  onNetworkSet,
  isLoading,
  onClear,
}: OnlineCalculatorFormProps) {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      safeAddress: extractedSafeAddress || "",
      nonce: "",
      safeVersion: "1.3.0",
      network: extractedNetwork || "ethereum",
    },
  });

  // Set Safe address when extracted from URL
  useEffect(() => {
    if (extractedSafeAddress && form.getValues("safeAddress") === "") {
      form.setValue("safeAddress", extractedSafeAddress);
      if (onAddressSet) onAddressSet();
    }
  }, [extractedSafeAddress, form, onAddressSet]);

  // Set Network when extracted from page - keeping this for cases where extractedNetwork changes after mount
  useEffect(() => {
    if (extractedNetwork && form.getValues("network") !== extractedNetwork) {
      form.setValue("network", extractedNetwork);
      if (onNetworkSet) onNetworkSet();
    }
  }, [extractedNetwork, form, onNetworkSet]);

  function onSubmit(values: FormValues) {
    console.log("Online form submitted:", values);
    // Propagate the submission data to the parent component
    if (onSubmitData) {
      onSubmitData(values, "online");
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network</FormLabel>
                <FormControl>
                  <NetworkInput
                    selectedNetwork={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="safeAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Safe Address</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="safeVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Safe Version</FormLabel>
                <FormControl>
                  <Input placeholder="1.3.0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nonce"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nonce</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate"
              )}
            </Button>
            {onClear && (
              <Button type="button" variant="outline" onClick={onClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}
