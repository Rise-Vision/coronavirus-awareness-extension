chrome.runtime.onInstalled.addListener(details=>{
  analytics.track("Install", {reason: details.reason, version: chrome.app.getDetails().version});
});

chrome.runtime.onStartup.addListener(()=>{
  analytics.track("Startup", {version: chrome.app.getDetails().version});
});