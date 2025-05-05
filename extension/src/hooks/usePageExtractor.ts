import { useState, useEffect, useRef, useCallback } from "react";
import { extractEthereumAddressFromSafeUrl } from "@/safe/crawler";

export function usePageExtractor() {
    const [extractedSafeAddress, setExtractedSafeAddress] = useState<string | null>(null);
    const [extractedNetwork, setExtractedNetwork] = useState<string | null>(null);
    const addressAlreadySet = useRef(false);
    const networkAlreadySet = useRef(false);

    const extractNetworkFromPage = () => {
        try {
            console.log("Extracting network from page");
            const networkElement = document.querySelector(
                "#__next > div.MuiDrawer-root.MuiDrawer-docked.styles_smDrawerHidden__k5ACE.mui-style-krl5w5 > div > aside > div > div > span > div > span"
            );

            if (networkElement && networkElement.textContent) {
                return networkElement.textContent.trim().toLowerCase();
            }
        } catch (error) {
            console.error("Error extracting network from page:", error);
        }
        return null;
    };

    const extractPageInfo = useCallback(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];

            if (currentTab?.url) {
                const address = extractEthereumAddressFromSafeUrl(currentTab.url);
                if (address && !addressAlreadySet.current) {
                    setExtractedSafeAddress(address);
                }
            }

            if (currentTab.id) {
                chrome.scripting
                    .executeScript({
                        target: { tabId: currentTab.id },
                        func: extractNetworkFromPage,
                    })
                    .then((results) => {
                        if (results && results[0] && results[0].result) {
                            setExtractedNetwork(results[0].result);
                        }
                    })
                    .catch((error) => {
                        console.error("Error extracting network:", error);
                    });
            }
        });
    }, []);

    useEffect(() => {
        // Extract on initial load
        extractPageInfo();

        // Notify the background script that the sidepanel is open
        chrome.runtime.sendMessage({
            type: "SIDEPANEL_OPENED",
            from: "sidepanel"
        });

        // Listen for tab changes
        const handleTabChange = () => {
            extractPageInfo();
        };

        // Re-check page info when we get a content script initialization message
        const handleMessage = (message: {
            type: string;
        }) => {
            if (message.type === "CONTENT_SCRIPT_INITIALIZED") {
                extractPageInfo();
            }
        };

        chrome.tabs.onActivated.addListener(handleTabChange);
        chrome.tabs.onUpdated.addListener(handleTabChange);
        chrome.runtime.onMessage.addListener(handleMessage);

        return () => {
            chrome.tabs.onActivated.removeListener(handleTabChange);
            chrome.tabs.onUpdated.removeListener(handleTabChange);
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, [extractPageInfo]);

    const setAddressFound = () => {
        addressAlreadySet.current = true;
    };

    const setNetworkFound = () => {
        networkAlreadySet.current = true;
    };

    return {
        extractedSafeAddress,
        extractedNetwork,
        setAddressFound,
        setNetworkFound,
        refreshPageInfo: extractPageInfo
    };
} 