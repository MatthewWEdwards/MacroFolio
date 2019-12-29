// SRC: https://stackoverflow.com/questions/11484910/resolve-host-to-ip-address-and-display-it-in-a-popup-using-a-chrome-extension/11487578#11487578

export var tabToHost = {};
export var hostToIP = {};

export function processUrl(tabId, url) {
    // Get the host part of the URL. 
    var host = url; 
    var req = 'https://dns.google.com/resolve?name=' + url

    // Map tabId to host
    tabToHost[tabId] = host ? host=host[1] : '';

    if (host && !hostToIP[host]) { // Known host, unknown IP
        hostToIP[host] = 'N/A';    // Set N/A, to prevent multiple requests
        // Get IP from a host-to-IP web service
        var x = new XMLHttpRequest();
        x.open('GET', req);
        x.onload = function() {
            var result = JSON.parse(x.responseText);
            console.log(result)
            if (result && result.Answer){
                // Lookup successful, save address
                hostToIP[host] = result.Answer[0].data
                console.log(result.Answer[0])
                return
             }
         };
         x.send();
    }
    return
}

export function setPopupInfo(tabId) { // Notify all popups
    chrome.extension.getViews({type:'popup'}).forEach(function(global) {
        global.notify(tabId);
    });
}

// Remove entry from tabToIp when the tab is closed.
chrome.tabs.onRemoved.addListener(function(tabId) {
    delete tabToHost[tabId];
});

// Add entries: Using method 1 ( `onUpdated` )
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading' && changeInfo.url) {
        console.log(processUrl(tabId, tab.url)); // or changeInfo.url, does not matter
    }
});

// Init: Get all windows and tabs, to fetch info for current hosts
chrome.windows.getAll({populate: true}, function(windows) {
    windows.forEach(function(win) {
        if (win.type == 'normal' && win.tabs) {
            for (var i=0; i<win.tabs.length; i++) {
                processUrl(win.tabs[i].id, win.tabs[i].url);
            }
        }
    });
});
