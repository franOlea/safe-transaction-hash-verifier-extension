import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormValues, formSchema } from "@/types/form";
import { FormTabs } from "@/components/safe-hash/FormTabs";
import { usePageExtractor } from "@/hooks/usePageExtractor";
import { Calculation } from "@/components/Calculation";
import { useState, useRef } from "react";
import { useTransactionProcessor } from "@/hooks/useTransactionProcessor";
import { SafeHashesResult } from "@/safe/hashes";
import { ethers } from "ethers";

export function SafeHashForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "online",
    },
  });

  const [showResults, setShowResults] = useState(false);
  const [calculatedHashes, setCalculatedHashes] =
    useState<SafeHashesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decodedTx, setDecodedTx] =
    useState<ethers.TransactionDescription | null>(null);
  const resultsRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const { processTransaction } = useTransactionProcessor({
    setCalculatedHashes,
    setError,
    setDecodedTx,
    setIsLoading,
    resultsRef,
  });

  // Custom hooks
  const {
    extractedSafeAddress,
    extractedNetwork,
    setAddressFound,
    setNetworkFound,
  } = usePageExtractor();

  // Watch mode value
  const mode = form.watch("mode");

  return (
    <div className="space-y-6">
      <Form {...form}>
        <FormTabs
          mode={mode}
          form={form}
          onSubmitData={async (data, formMode) => {
            setShowResults(true);
            await processTransaction(data, formMode);
          }}
          extractedSafeAddress={extractedSafeAddress}
          extractedNetwork={extractedNetwork}
          onAddressSet={setAddressFound}
          onNetworkSet={setNetworkFound}
          isLoading={false}
          onClear={showResults ? () => setShowResults(false) : undefined}
        />
      </Form>

      {showResults && (
        <Calculation
          calculatedResult={calculatedHashes}
          displayedResult={null}
          isLoading={isLoading}
          error={error}
          decodedTx={decodedTx}
          resultsRef={resultsRef}
        />
      )}
    </div>
  );
}
