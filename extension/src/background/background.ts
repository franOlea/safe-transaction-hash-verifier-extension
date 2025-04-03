
chrome.runtime.onInstalled.addListener(() => {
    console.log('Safe Verifier Extension installed 6');
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
