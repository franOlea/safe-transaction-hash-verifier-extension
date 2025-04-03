import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnlineCalculatorForm } from "@/components/OnlineCalculatorForm";
import { OfflineCalculatorForm } from "@/components/OfflineCalculatorForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import {
  calculateSafeHashes,
  SafeHashesOptions,
  SafeHashesResult,
} from "@/safe/hashes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { extractEthereumAddressFromSafeUrl } from "@/safe/crawler";
import { getABI } from "@/lib/api";
import { ethers } from "ethers";
import { handleError } from "@/lib/errors";
import {
  FormData,
  OfflineFormData,
  formSchema,
  FormValues,
} from "@/types/form";
import { LOADING_MESSAGE, ZERO_ADDRESS } from "@/constants/ui";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function SafeHashForm() {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "online",
    },
  });

  // State for hash results and loading
  const [hashResult, setHashResult] = useState<SafeHashesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedSafeAddress, setExtractedSafeAddress] = useState<
    string | null
  >(null);
  const [extractedNetwork, setExtractedNetwork] = useState<string | null>(null);
  const addressAlreadySet = useRef(false);
  const networkAlreadySet = useRef(false);
  const [decodedTx, setDecodedTx] =
    useState<ethers.TransactionDescription | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Watch mode value to conditionally render the appropriate form
  const mode = form.watch("mode");

  const extractNetworkFromPage = () => {
    try {
      console.log("Extracting network from page");
      const networkElement = document.querySelector(
        "#__next > div.MuiDrawer-root.MuiDrawer-docked.styles_smDrawerHidden__k5ACE.mui-style-krl5w5 > div > aside > div > div > span > div > span"
      );

      if (networkElement && networkElement.textContent) {
        // Convert to lowercase and return
        return networkElement.textContent.trim().toLowerCase();
      }
    } catch (error) {
      console.error("Error extracting network from page:", error);
    }
    return null;
  };

  // Listen for messages from background.js
  useEffect(() => {
    // Check if we're already on a Safe page on initial load
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      if (currentTab?.url) {
        const address = extractEthereumAddressFromSafeUrl(currentTab.url);
        if (address && !addressAlreadySet.current) {
          setExtractedSafeAddress(address);
        }
      }

      if (currentTab.id) {
        console.log("Running script");
        chrome.scripting
          .executeScript({
            target: { tabId: currentTab.id },
            func: extractNetworkFromPage,
          })
          .then((results) => {
            if (results && results[0] && results[0].result) {
              console.log("Extracted network:", results[0].result);
              setExtractedNetwork(results[0].result);
            }
          })
          .catch((error) => {
            console.error("Error extracting network:", error);
          });
      }
    });
  }, []);

  // Handler for form submissions from child components
  const handleFormSubmit = async (
    data: FormData,
    formMode: "online" | "offline"
  ) => {
    console.log(`Form submitted from ${formMode} mode:`, {
      mode: formMode,
      data,
    });

    // Reset states
    setHashResult(null);
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
      setHashResult(result);

      // Only attempt to decode if there's transaction data and it's not a native transfer
      if (!isNativeTransfer(result.transactionData)) {
        try {
          const abi = await getABI(data.network, result.transactionData!.to);
          const txData = result.transactionData!.data;
          const iface = new ethers.Interface(abi);
          const decoded = iface.parseTransaction({ data: txData });
          setDecodedTx(decoded);
          console.log("Decoded transaction:", decoded);
        } catch (err) {
          console.error("Error decoding transaction:", err);
          // TODO offer manual ABI input
        }
      }

      // Add this scroll behavior after the results are set
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

  // Helper function to check if a transaction is a native transfer
  const isNativeTransfer = (txData?: SafeHashesResult["transactionData"]) => {
    return txData && txData.data === "0x";
  };

  const handleClear = () => {
    setHashResult(null);
    setError(null);
    setDecodedTx(null);
  };

  return (
    <Card className="min-h-screen">
      <CardHeader className="flex flex-col items-center space-y-2">
        <img
          src="/logo.svg"
          alt="Safe Hash Calculator Logo"
          className="w-40 h-40"
        />
        <CardTitle>
          <h1 className="text-2xl font-bold">Safe Hash Calculator</h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
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
                      onSubmitData={handleFormSubmit}
                      extractedSafeAddress={extractedSafeAddress}
                      extractedNetwork={extractedNetwork}
                      onAddressSet={() => {
                        addressAlreadySet.current = true;
                      }}
                      onNetworkSet={() => {
                        networkAlreadySet.current = true;
                      }}
                      isLoading={isLoading}
                      onClear={hashResult ? handleClear : undefined}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="offline">
                <Card>
                  <CardContent>
                    <OfflineCalculatorForm
                      onSubmitData={handleFormSubmit}
                      extractedSafeAddress={extractedSafeAddress}
                      extractedNetwork={extractedNetwork}
                      onAddressSet={() => {
                        addressAlreadySet.current = true;
                      }}
                      onNetworkSet={() => {
                        networkAlreadySet.current = true;
                      }}
                      isLoading={isLoading}
                      onClear={hashResult ? handleClear : undefined}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Display loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">{LOADING_MESSAGE}</span>
              </div>
            )}

            {/* Display error message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Display hash results */}
            {hashResult && !isLoading && (
              <div className="space-y-4" ref={resultsRef}>
                <h2 className="text-xl font-semibold">Results</h2>

                {/* Show warnings if any */}
                {hashResult.warnings.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1">
                        {hashResult.warnings.map((warning, index) => (
                          <li key={index} className="text-amber-500">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Display transaction hashes */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-3 bg-secondary rounded-md">
                    <h3 className="text-md font-semibold">Domain Hash</h3>
                    <p className="font-mono text-xs break-all">
                      {hashResult.domainHash}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary rounded-md">
                    <h3 className="text-md font-semibold">Message Hash</h3>
                    <p className="font-mono text-xs break-all">
                      {hashResult.messageHash}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary rounded-md">
                    <h3 className="text-md font-semibold">
                      Safe Transaction Hash
                    </h3>
                    <p className="font-mono text-xs break-all">
                      {hashResult.safeTransactionHash}
                    </p>
                  </div>
                </div>

                {/* Display transaction details for native transfers */}
                {isNativeTransfer(hashResult.transactionData) && (
                  <div className="p-3 bg-secondary rounded-md">
                    <h3 className="text-md font-semibold mb-3">
                      Native Transfer
                    </h3>
                    <form className="space-y-3">
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input
                            value={hashResult.transactionData?.to}
                            disabled
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            value={`${ethers.formatEther(
                              hashResult.transactionData?.value || "0"
                            )} ETH`}
                            disabled
                          />
                        </FormControl>
                      </FormItem>
                    </form>
                  </div>
                )}

                {/* Display decoded transaction if available */}
                {decodedTx && (
                  <div className="p-3 bg-secondary rounded-md">
                    <h3 className="text-md font-semibold mb-3">
                      Decoded Transaction
                    </h3>
                    <form className="space-y-3">
                      <FormItem>
                        <FormLabel>Function</FormLabel>
                        <FormControl>
                          <Input value={decodedTx.name} disabled />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Signature</FormLabel>
                        <FormControl>
                          <Input value={decodedTx.signature} disabled />
                        </FormControl>
                      </FormItem>

                      <div className="space-y-3">
                        <FormLabel className="mb-2">Parameters</FormLabel>
                        {decodedTx.args.map((arg, index) => (
                          <div
                            key={index}
                            className="mb-2 border-b border-border pb-2 last:border-0"
                          >
                            <FormLabel className="block text-xs mb-1">
                              {decodedTx.fragment.inputs[index].name} [
                              {decodedTx.fragment.inputs[index].type}]
                            </FormLabel>
                            <p className="font-mono text-xs bg-secondary/50 p-2 rounded break-all">
                              {arg.toString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
