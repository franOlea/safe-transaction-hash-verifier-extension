import { SafeHashesResult } from "@/safe/hashes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { LOADING_MESSAGE } from "@/constants/ui";
import { HashResults } from "@/components/safe-hash/HashResults";

interface CalculationProps {
  calculatedResult: SafeHashesResult | null;
  displayedResult: SafeHashesResult | null;
  isLoading: boolean;
  error: string | null;
  decodedTx: ethers.TransactionDescription | null;
  resultsRef: React.RefObject<HTMLDivElement>;
}

export function Calculation({
  calculatedResult,
  displayedResult,
  isLoading,
  error,
  decodedTx,
  resultsRef,
}: CalculationProps) {
  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{LOADING_MESSAGE}</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {calculatedResult && displayedResult && !isLoading && (
        <HashResults
          calculatedResult={calculatedResult}
          displayedResult={displayedResult}
          decodedTx={decodedTx}
          resultsRef={resultsRef}
        />
      )}
    </div>
  );
}
