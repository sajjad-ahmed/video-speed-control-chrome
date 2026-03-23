chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab.url) {
    chrome.tabs.sendMessage(tabId, { action: 'applySpeed' }).catch(() => {});
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  chrome.tabs.sendMessage(details.tabId, { action: 'applySpeed' }).catch(() => {});
});
