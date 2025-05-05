import { RefObject } from "react";
import {
    calculateSafeHashes,
    SafeHashesOptions,
    SafeHashesResult
} from "@/safe/hashes";
import { ethers } from "ethers";
import { getABI } from "@/lib/api";
import { handleError } from "@/lib/errors";
import { FormData, OfflineFormData } from "@/types/form";
import { ZERO_ADDRESS } from "@/constants/ui";

interface TransactionProcessorProps {
    setCalculatedHashes: (result: SafeHashesResult | null) => void;
    setError: (error: string | null) => void;
    setDecodedTx: (tx: ethers.TransactionDescription | null) => void;
    setIsLoading: (loading: boolean) => void;
    resultsRef: RefObject<HTMLDivElement>;
}

export function useTransactionProcessor({
    setCalculatedHashes,
    setError,
    setDecodedTx,
    setIsLoading,
    resultsRef
}: TransactionProcessorProps) {

    const isNativeTransfer = (txData?: SafeHashesResult["transactionData"]) => {
        return txData && txData.data === "0x";
    };

    const processTransaction = async (
        data: FormData,
        formMode: "online" | "offline"
    ) => {
        console.log(`Form submitted from ${formMode} mode:`, { mode: formMode, data });

        // Reset states
        setCalculatedHashes(null);
        setError(null);
        setDecodedTx(null);
        setIsLoading(true);

        try {
            const options: SafeHashesOptions = {
                network: data.network,
                address: data.safeAddress,
                version: data.safeVersion,
                nonce: parseInt(data.nonce),
            };

            // Add transaction data for offline mode
            if (formMode === "offline") {
                const offlineData = data as OfflineFormData;
                options.transactionData = {
                    to: offlineData.to,
                    value: offlineData.value,
                    data: offlineData.data,
                    operation: parseInt(offlineData.operation),
                    safeTxGas: "0",
                    baseGas: "0",
                    gasPrice: "0",
                    gasToken: ZERO_ADDRESS,
                    refundReceiver: ZERO_ADDRESS,
                    nonce: parseInt(offlineData.nonce),
                };
            }

            const result = await calculateSafeHashes(options);
            setCalculatedHashes(result);

            // Only attempt to decode if there's transaction data and it's not a native transfer
            if (!isNativeTransfer(result.transactionData)) {
                try {
                    const abi = await getABI(data.network, result.transactionData!.to);
                    const txData = result.transactionData!.data;
                    const iface = new ethers.Interface(abi);
                    const decoded = iface.parseTransaction({ data: txData });
                    setDecodedTx(decoded);
                } catch (err) {
                    console.error("Error decoding transaction:", err);
                }
            }

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (err) {
            const safeError = handleError(err);
            setError(safeError.message);
            console.error(safeError);
        } finally {
            setIsLoading(false);
        }
    };

    return { processTransaction };
} 