import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { OnlineCalculatorForm } from "@/components/OnlineCalculatorForm";
import { OfflineCalculatorForm } from "@/components/OfflineCalculatorForm";
import { FormData, FormValues } from "@/types/form";
import { UseFormReturn } from "react-hook-form";

interface FormTabsProps {
  mode: string;
  form: UseFormReturn<FormValues>;
  onSubmitData: (data: FormData, mode: "online" | "offline") => Promise<void>;
  extractedSafeAddress: string | null;
  extractedNetwork: string | null;
  onAddressSet: () => void;
  onNetworkSet: () => void;
  isLoading: boolean;
  onClear?: () => void;
}

export function FormTabs({
  mode,
  form,
  onSubmitData,
  extractedSafeAddress,
  extractedNetwork,
  onAddressSet,
  onNetworkSet,
  isLoading,
  onClear,
}: FormTabsProps) {
  return (
    <Tabs
      defaultValue={mode}
      onValueChange={(value) =>
        form.setValue("mode", value as "online" | "offline")
      }
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="online">Online</TabsTrigger>
        <TabsTrigger value="offline">Offline</TabsTrigger>
      </TabsList>
      <TabsContent value="online">
        <Card>
          <CardContent>
            <OnlineCalculatorForm
              onSubmitData={onSubmitData}
              extractedSafeAddress={extractedSafeAddress}
              extractedNetwork={extractedNetwork}
              onAddressSet={onAddressSet}
              onNetworkSet={onNetworkSet}
              isLoading={isLoading}
              onClear={onClear}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="offline">
        <Card>
          <CardContent>
            <OfflineCalculatorForm
              onSubmitData={onSubmitData}
              extractedSafeAddress={extractedSafeAddress}
              extractedNetwork={extractedNetwork}
              onAddressSet={onAddressSet}
              onNetworkSet={onNetworkSet}
              isLoading={isLoading}
              onClear={onClear}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
