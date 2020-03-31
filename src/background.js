chrome.runtime.onInstalled.addListener(function(details) {
   	analytics.track("Install", {reason: details.reason});
});

chrome.runtime.onStartup.addListener(function() {
	analytics.track("Startup", {test: "test"});
});