import { SafeHashForm } from "@/components/SafeHashForm";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/LoadingState";
import { WaitingState } from "./components/WaitingState";
import { Calculation } from "@/components/Calculation";
import { useTransactionProcessor } from "@/hooks/useTransactionProcessor";
import { usePageExtractor } from "@/hooks/usePageExtractor";
import { SafeHashesResult } from "@/safe/hashes";
import { ethers } from "ethers";
import { OnlineFormData } from "@/types/form";

// Custom AccordionTrigger without the arrow icon
const CustomAccordionTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};

type AutoModeState = "idle" | "listening" | "loading" | "result";

// Type for pending transaction data
interface PendingTransactionData {
  safeAddress?: string;
  network?: string;
  nonce?: string;
}

function App() {
  document.documentElement.classList.add("dark");
  const [openItem, setOpenItem] = useState<string | undefined>();
  const [autoModeState, setAutoModeState] = useState<AutoModeState>("idle");
  const [calculatedHashes, setCalculatedHashes] =
    useState<SafeHashesResult | null>(null);
  const [displayedHashes, setDisplayedHashes] =
    useState<SafeHashesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decodedTx, setDecodedTx] =
    useState<ethers.TransactionDescription | null>(null);
  const resultsRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Buffer to store pending transaction data
  const [pendingTxData, setPendingTxData] = useState<PendingTransactionData>(
    {}
  );

  // Extract safe address and network from the page
  const {
    extractedSafeAddress,
    extractedNetwork,
    setAddressFound,
    setNetworkFound,
  } = usePageExtractor();

  const { processTransaction } = useTransactionProcessor({
    setCalculatedHashes,
    setError,
    setDecodedTx,
    setIsLoading,
    resultsRef,
  });

  // Update pending transaction data when safe address is extracted
  useEffect(() => {
    if (extractedSafeAddress) {
      setPendingTxData((prev) => ({
        ...prev,
        safeAddress: extractedSafeAddress,
      }));
    }
  }, [extractedSafeAddress]);

  // Update pending transaction data when network is extracted
  useEffect(() => {
    if (extractedNetwork) {
      setPendingTxData((prev) => ({
        ...prev,
        network: extractedNetwork,
      }));
    }
  }, [extractedNetwork]);

  // Process transaction when all required data is available
  const tryProcessTransaction = useCallback(() => {
    const { safeAddress, network, nonce } = pendingTxData;

    if (safeAddress && network && nonce) {
      console.log(
        "All required data available, processing transaction",
        pendingTxData
      );
      setAutoModeState("loading");

      // Mark that we've found and used the address and network
      setAddressFound();
      setNetworkFound();

      // Process transaction with collected data
      processTransaction(
        {
          safeAddress,
          network,
          safeVersion: "1.3.0", // Default version
          nonce,
        } as OnlineFormData,
        "online"
      )
        .then(() => {
          setAutoModeState("result");
          // Clear pending data after successful processing
          setPendingTxData({});
        })
        .catch((error) => {
          console.error("Error processing transaction:", error);
          setError(error.message || "Unknown error occurred");
          setAutoModeState("idle");
        });
    }
  }, [pendingTxData, processTransaction, setAddressFound, setNetworkFound]);

  // Check if we can process transaction whenever pendingTxData changes
  useEffect(() => {
    tryProcessTransaction();
  }, [pendingTxData, tryProcessTransaction]);

  useEffect(() => {
    const checkSafePage = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const isSafePage = tab.url?.startsWith("https://app.safe.global");

        if (isSafePage && autoModeState === "idle") {
          setAutoModeState("listening");
        } else if (!isSafePage && autoModeState === "listening") {
          setAutoModeState("idle");
        }
      } catch (error) {
        console.error("Error checking Safe page:", error);
      }
    };

    // Only check when component mounts
    checkSafePage();

    // Add more targeted listeners
    const handleActivated = () => {
      checkSafePage();
    };

    const handleUpdated = (
      _: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      // Only process URL changes for the active tab
      if (changeInfo.url && tab.active) {
        checkSafePage();
      }
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
    };
  }, [autoModeState]);

  // Listen for messages from content script
  useEffect(() => {
    const handleMessage = (message: {
      type: string;
      from: string;
      data: {
        domainHash?: string;
        messageHash?: string;
        safeTxHash?: string;
        nonce: string;
      };
    }) => {
      if (
        message.type === "SAFE_TRANSACTION_DATA_FOUND" &&
        message.from === "content_script" &&
        message.data.nonce // Make sure nonce exists
      ) {
        console.log(
          "Received transaction data from content script",
          message.data
        );

        setDisplayedHashes({
          domainHash: message.data.domainHash || "error",
          messageHash: message.data.messageHash || "error",
          safeTransactionHash: message.data.safeTxHash || "error",
          warnings: [],
        });

        // Store nonce in pending transaction data
        setPendingTxData((prev) => ({
          ...prev,
          nonce: message.data.nonce,
        }));

        // The tryProcessTransaction effect will attempt to process if all data is available
      } else if (message.type === "SAFE_TRANSACTION_DATA_FOUND") {
        // Log what's missing so it's easier to debug
        console.warn(
          "Received transaction data but missing some required fields:",
          {
            hasNonce: !!message.data.nonce,
            pendingData: pendingTxData,
            messageData: message.data,
          }
        );
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [pendingTxData]);

  const renderAutoModeContent = () => {
    switch (autoModeState) {
      case "listening":
        return <WaitingState />;
      case "loading":
        return <LoadingState />;
      case "result":
        return (
          <Calculation
            calculatedResult={calculatedHashes}
            displayedResult={displayedHashes}
            isLoading={isLoading}
            error={error}
            decodedTx={decodedTx}
            resultsRef={resultsRef}
          />
        );
      case "idle":
      default:
        return null;
    }
  };

  return (
    <Card className="min-h-screen">
      <Accordion
        type="single"
        collapsible
        value={openItem}
        onValueChange={setOpenItem}
      >
        <AccordionItem value="calculator" className="border-b-0">
          <CardHeader className="flex flex-col items-center space-y-2">
            <CustomAccordionTrigger className="flex flex-col items-center hover:no-underline cursor-pointer">
              <img
                src="/logo.svg"
                alt="Safe Hash Calculator Logo"
                className="w-40 h-40"
              />
              <CardTitle>
                <h1 className="text-2xl font-bold">Safe Hash Verifier</h1>
              </CardTitle>
            </CustomAccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent>
              <SafeHashForm />
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Display auto mode content when accordion is closed */}
      {!openItem && (
        <CardContent className="flex flex-col items-center mt-4 text-center">
          {renderAutoModeContent()}
        </CardContent>
      )}
    </Card>
  );
}

export default App;
