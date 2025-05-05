interface TransactionData {
    domainHash: string;
    messageHash: string;
    safeTxHash: string;
    nonce: string;
}

interface ExtensionMessage {
    type: string;
    data?: TransactionData;
    from?: string;
    tabId?: string;
}

function sendMessageToExtension(message: ExtensionMessage) {
    try {
        chrome.runtime.sendMessage(message, () => {
            if (chrome.runtime.lastError) {
                console.log('Extension context invalidated or error:', chrome.runtime.lastError);
                return;
            }
        });
    } catch (error) {
        console.log('Failed to send message to extension:', error);
    }
}

function extractElementText() {
    const hashesSelector = 'body > div.MuiDialog-root.styles_dialog__GH0VA.MuiModal-root.mui-style-1egf66k > div.MuiDialog-container.MuiDialog-scrollBody.mui-style-1wzk9ty > div > div > div > div > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-7.mui-style-1ak9ift > div.styles_step__io0n9 > div:nth-child(1) > div > div.MuiStack-root.mui-style-1ov46kg > div > div > div > div > div > div > div > div.MuiStack-root.mui-style-14bc8oo > div.MuiStack-root.mui-style-1821gv5';
    const nonceSelector = 'body > div.MuiDialog-root.styles_dialog__GH0VA.MuiModal-root.mui-style-1egf66k > div.MuiDialog-container.MuiDialog-scrollBody.mui-style-1wzk9ty > div > div > div > div > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-7.mui-style-1ak9ift > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.styles_header__BYVn_.mui-style-9ko7pr > div.styles_headerInner__cl4mF.MuiBox-root.mui-style-0 > div.MuiBox-root.mui-style-axw7ok'

    const hashesElement = document.querySelector(hashesSelector);
    const nonceElement = document.querySelector(nonceSelector);

    if (hashesElement && nonceElement) {
        const hashesText = hashesElement.textContent || '';
        const nonceText = nonceElement.textContent || '';

        // Extract hashes using regex
        const domainHashMatch = hashesText.match(/Domain hash:(0x[a-fA-F0-9]+)/);
        const messageHashMatch = hashesText.match(/Message hash:(0x[a-fA-F0-9]+)/);
        const safeTxHashMatch = hashesText.match(/safeTxHash:(0x[a-fA-F0-9]+)/);

        // Extract nonce number
        const nonceMatch = nonceText.match(/Nonce #(\d+)/);

        const transactionData = {
            domainHash: domainHashMatch ? domainHashMatch[1] : '',
            messageHash: messageHashMatch ? messageHashMatch[1] : '',
            safeTxHash: safeTxHashMatch ? safeTxHashMatch[1] : '',
            nonce: nonceMatch ? nonceMatch[1] : ''
        };

        try {
            sendMessageToExtension({
                type: "SAFE_TRANSACTION_DATA_FOUND",
                data: transactionData,
                from: "content_script",
                tabId: window.location.href
            });

            console.log("Safe transaction data found and sent to extension:", transactionData);
            return true;
        } catch (error) {
            console.log('Failed to process transaction data:', error);
            return false;
        }
    }

    return false;
}

// Enhance the message listener to be more robust
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    try {
        if (message.type === "CHECK_FOR_TRANSACTION_DATA") {
            console.log("Check for transaction data request received");
            const found = extractElementText();

            if (!found) {
                console.log("No data found, retrying...");
                let attempts = 0;
                const maxAttempts = 3;
                const checkInterval = setInterval(() => {
                    try {
                        console.log("Attempting to extract data again...");
                        attempts++;
                        const found = extractElementText();

                        if (found || attempts >= maxAttempts) {
                            console.log("Data extraction complete");
                            clearInterval(checkInterval);
                            sendResponse({ found });
                        }
                    } catch (error) {
                        console.log('Error during retry attempt:', error);
                        clearInterval(checkInterval);
                        sendResponse({ found: false });
                    }
                }, 500);

                return true;
            }

            sendResponse({ found });
        }
    } catch (error) {
        console.log('Error handling message:', error);
        sendResponse({ found: false });
    }
    return true;
});

// Initialize content script
const init = () => {
    try {
        // Send initial ping
        console.log("Sending initial ping");
        sendMessageToExtension({
            type: "CONTENT_SCRIPT_INITIALIZED",
            from: "content_script",
            tabId: window.location.href
        });

        // Do initial check
        console.log("Doing initial check");
        extractElementText();

        // Set up observer
        console.log("Setting up observer");
        const observer = new MutationObserver(() => {
            try {
                console.log("Mutation detected, extracting data");
                extractElementText();
            } catch (error) {
                console.log('Error in mutation observer:', error);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) {
        console.log('Error during initialization:', error);
    }
};

// Run initialization with error handling
console.log("Initializing content script");
init();