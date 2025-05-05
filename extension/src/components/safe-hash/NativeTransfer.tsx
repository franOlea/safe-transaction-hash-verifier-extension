import { SafeHashesResult } from "@/safe/hashes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";

interface NativeTransferProps {
  transactionData: SafeHashesResult["transactionData"];
}

export function NativeTransfer({ transactionData }: NativeTransferProps) {
  return (
    <div className="p-3 bg-secondary rounded-md">
      <h3 className="text-md font-semibold mb-3">Native Transfer</h3>
      <div className="space-y-3">
        <div className="grid gap-2">
          <Label>Destination</Label>
          <Input value={transactionData?.to} disabled />
        </div>

        <div className="grid gap-2">
          <Label>Amount</Label>
          <Input
            value={`${ethers.formatEther(transactionData?.value || "0")} ETH`}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
