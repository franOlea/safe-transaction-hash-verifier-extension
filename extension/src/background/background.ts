chrome.runtime.onInstalled.addListener(() => {
    console.log('Safe Verifier Extension installed 6');
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

// Relay messages from content script to sidepanel
chrome.runtime.onMessage.addListener((message) => {
    console.log("Background received message:", message);

    // Forward to all extension pages including the side panel
    chrome.runtime.sendMessage(message).catch((error) => {
        // This error is expected if no listeners are available yet
        console.log("Forwarding error (normal if sidepanel not open):", error);
    });

    // When the sidepanel is opened, trigger a check for transaction data
    if (message.type === "SIDEPANEL_OPENED") {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const currentTab = tabs[0];
            if (currentTab?.id && currentTab?.url?.startsWith("https://app.safe.global")) {
                try {
                    // First check if content script is already injected
                    await chrome.tabs.sendMessage(currentTab.id!, {
                        type: "CHECK_FOR_TRANSACTION_DATA"
                    });
                } catch {
                    // If content script is not injected, inject it and then check again
                    await chrome.scripting.executeScript({
                        target: { tabId: currentTab.id },
                        files: ['content/content.js']
                    });

                    // Wait a brief moment for the content script to initialize
                    setTimeout(async () => {
                        try {
                            await chrome.tabs.sendMessage(currentTab.id!, {
                                type: "CHECK_FOR_TRANSACTION_DATA"
                            });
                        } catch {
                            console.log("Error after content script injection:");
                        }
                    }, 100);
                }
            }
        });
    }

    return true; // Indicate async response
});

// Listen for tab changes to trigger transaction data checks
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url?.startsWith("https://app.safe.global")) {
            // Wait a short while for any page transitions to complete
            setTimeout(() => {
                chrome.tabs.sendMessage(activeInfo.tabId, {
                    type: "CHECK_FOR_TRANSACTION_DATA"
                }).catch(error => {
                    // This error may happen if content script isn't ready yet
                    console.log("Error in onActivated message to content script:", error);
                });
            }, 500);
        }
    });
});

// Listen for URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url?.startsWith("https://app.safe.global")) {
        // Wait for the page to load before checking
        setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
                type: "CHECK_FOR_TRANSACTION_DATA"
            }).catch(error => {
                console.log("Error in onUpdated message to content script:", error);
            });
        }, 1000);
    }
});
