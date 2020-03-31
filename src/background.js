chrome.runtime.onInstalled.addListener(details=>{
  analytics.track("Install", {reason: details.reason});
});

chrome.runtime.onStartup.addListener(()=>{
  analytics.track("Startup", {test: "test"});
});

chrome.browserAction.onClicked.addListener(()=>chrome.tabs.create({}));
