import { ethers } from "ethers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DecodedTransactionProps {
  decodedTx: ethers.TransactionDescription;
}

export function DecodedTransaction({ decodedTx }: DecodedTransactionProps) {
  return (
    <div className="p-3 bg-secondary rounded-md">
      <h3 className="text-md font-semibold mb-3">Decoded Transaction</h3>
      <div className="space-y-3">
        <div className="grid gap-2">
          <Label>Function</Label>
          <Input value={decodedTx.name} disabled />
        </div>

        <div className="grid gap-2">
          <Label>Signature</Label>
          <Input value={decodedTx.signature} disabled />
        </div>

        <div className="space-y-3">
          <Label className="mb-2">Parameters</Label>
          {decodedTx.args.map((arg, index) => (
            <div
              key={index}
              className="mb-2 border-b border-border pb-2 last:border-0"
            >
              <Label className="block text-xs mb-1">
                {decodedTx.fragment.inputs[index].name} [
                {decodedTx.fragment.inputs[index].type}]
              </Label>
              <p className="font-mono text-xs bg-secondary/50 p-2 rounded break-all">
                {arg.toString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
