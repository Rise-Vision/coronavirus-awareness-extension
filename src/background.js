chrome.runtime.onInstalled.addListener(function(details) {
   	analytics.track("Install", {reason: details.reason, version: chrome.app.getDetails().version});
});

chrome.runtime.onStartup.addListener(function() {
	analytics.track("Startup", {version: chrome.app.getDetails().version});
});