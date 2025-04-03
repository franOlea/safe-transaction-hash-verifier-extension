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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  data: z.string().min(1, {
    message: "Data is required for offline calculation",
  }),
  network: z.string().min(1, {
    message: "Network is required",
  }),
  safeVersion: z.string().min(1, {
    message: "Safe version is required",
  }),
  to: z.string().min(1, {
    message: "To is required",
  }),
  value: z.string().min(1, {
    message: "Value is required",
  }),
  operation: z.string().min(1, {
    message: "Operation is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface OfflineCalculatorFormProps {
  onSubmitData?: (data: FormValues, mode: "offline") => void;
  extractedSafeAddress?: string | null;
  extractedNetwork?: string | null;
  onAddressSet?: () => void;
  onNetworkSet?: () => void;
  isLoading?: boolean;
  onClear?: () => void;
}

export function OfflineCalculatorForm({
  onSubmitData,
  extractedSafeAddress,
  extractedNetwork,
  onAddressSet,
  onNetworkSet,
  isLoading,
  onClear,
}: OfflineCalculatorFormProps) {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      network: extractedNetwork || "ethereum",
      safeAddress: extractedSafeAddress || "",
      safeVersion: "1.3.0",
      nonce: "",
      data: "",
      to: "",
      value: "",
      operation: "",
    },
  });

  // Set Safe address when extracted from URL
  useEffect(() => {
    if (extractedSafeAddress && form.getValues("safeAddress") === "") {
      form.setValue("safeAddress", extractedSafeAddress);
      if (onAddressSet) onAddressSet();
    }
  }, [extractedSafeAddress, form, onAddressSet]);

  // Set Network when extracted from page
  useEffect(() => {
    if (extractedNetwork && !form.getValues("network")) {
      form.setValue("network", extractedNetwork);
      if (onNetworkSet) onNetworkSet();
    }
  }, [extractedNetwork, form, onNetworkSet]);

  function onSubmit(values: FormValues) {
    console.log("Offline form submitted:", values);
    // Propagate the submission data to the parent component
    if (onSubmitData) {
      onSubmitData(values, "offline");
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
                  <Input type="text" placeholder="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Textarea placeholder="0x..." rows={5} {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input placeholder="0" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operation</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Call (0)</SelectItem>
                      <SelectItem value="1">DelegateCall (1)</SelectItem>
                    </SelectContent>
                  </Select>
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
