import { SafeHashesResult } from "@/safe/hashes";
import { CheckCircle, XCircle } from "lucide-react";

interface TransactionHashesProps {
  calculatedResult: SafeHashesResult;
  displayedResult: SafeHashesResult;
}

export function TransactionHashes({
  calculatedResult,
  displayedResult,
}: TransactionHashesProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="p-3 bg-secondary rounded-md">
        <h3 className="text-md font-semibold">Domain Hash</h3>
        <div className="flex flex-col items-center gap-2">
          <p
            className={`font-mono text-xs break-all ${
              calculatedResult.domainHash === displayedResult.domainHash
                ? "text-emerald-600"
                : ""
            }`}
          >
            {calculatedResult.domainHash}
          </p>
          {calculatedResult.domainHash === displayedResult.domainHash ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
      <div className="p-3 bg-secondary rounded-md">
        <h3 className="text-md font-semibold">Message Hash</h3>
        <div className="flex flex-col items-center gap-2">
          <p
            className={`font-mono text-xs break-all ${
              calculatedResult.messageHash === displayedResult.messageHash
                ? "text-emerald-600"
                : ""
            }`}
          >
            {calculatedResult.messageHash}
          </p>
          {calculatedResult.messageHash === displayedResult.messageHash ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
      <div className="p-3 bg-secondary rounded-md">
        <h3 className="text-md font-semibold">Safe Transaction Hash</h3>
        <div className="flex flex-col items-center gap-2">
          <p
            className={`font-mono text-xs break-all ${
              calculatedResult.safeTransactionHash ===
              displayedResult.safeTransactionHash
                ? "text-emerald-600"
                : ""
            }`}
          >
            {calculatedResult.safeTransactionHash}
          </p>
          {calculatedResult.safeTransactionHash ===
          displayedResult.safeTransactionHash ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}
