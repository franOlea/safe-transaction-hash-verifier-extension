import { SafeHashesResult } from "@/safe/hashes";
import { ethers } from "ethers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefObject } from "react";
import { TransactionHashes } from "./TransactionHashes";
import { NativeTransfer } from "./NativeTransfer";
import { DecodedTransaction } from "./DecodedTransaction";

interface HashResultsProps {
  calculatedResult: SafeHashesResult;
  displayedResult: SafeHashesResult;
  decodedTx: ethers.TransactionDescription | null;
  resultsRef: RefObject<HTMLDivElement>;
}

export function HashResults({
  calculatedResult,
  displayedResult,
  decodedTx,
  resultsRef,
}: HashResultsProps) {
  const isNativeTransfer = (txData?: SafeHashesResult["transactionData"]) => {
    return txData && txData.data === "0x";
  };

  return (
    <div className="space-y-4" ref={resultsRef}>
      <h2 className="text-xl font-semibold">Results</h2>

      {/* Show warnings if any */}
      {calculatedResult.warnings.length > 0 && (
        <Alert>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {calculatedResult.warnings.map((warning, index) => (
                <li key={index} className="text-amber-500">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Display transaction hashes */}
      <TransactionHashes
        calculatedResult={calculatedResult}
        displayedResult={displayedResult}
      />

      {/* Display transaction details */}
      {isNativeTransfer(calculatedResult.transactionData) && (
        <NativeTransfer transactionData={calculatedResult.transactionData} />
      )}

      {/* Display decoded transaction if available */}
      {decodedTx && <DecodedTransaction decodedTx={decodedTx} />}
    </div>
  );
}
