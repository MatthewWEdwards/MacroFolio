// SRC: https://stackoverflow.com/questions/11484910/resolve-host-to-ip-address-and-display-it-in-a-popup-using-a-chrome-extension/11487578#11487578

export var hostToIP = {};
export var tabToLinks = {};

const ip_regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;

export function processUrl(tabId, url) {
    // Get the host part of the URL. 
    var host = url; 
    var req = 'https://dns.google.com/resolve?name=' + url

    if(hostToIP[host] !== undefined)
        return

    // Get IP from a host-to-IP web service
    var x = new XMLHttpRequest();
    x.open('GET', req);
    x.onload = function() {
        var result = JSON.parse(x.responseText);
        console.log(`${url}`)
        console.log(result.Answer)

        if (result && result.Answer){
            // Lookup successful, save address
            for(var i = 0; i < result.Answer.length; i++){
                if(!ip_regex.test(result.Answer[i].data))
                    continue
                hostToIP[host] = result.Answer[i].data
                return
            }
         }
     }
     x.onerror = function(){
        console.log(`TIMEOUT: ${url}`)
     }
     x.send();
    return
}

export function setPopupInfo(tabId) { // Notify all popups
    chrome.extension.getViews({type:'popup'}).forEach(function(global) {
        global.notify(tabId);
    });
}

export function updateLinks(tabId, links){
    tabToLinks[tabId] = links
    links.forEach((item, index, tabId)=>{processUrl(tabId, item)})
    var num = tabToLinks[tabId].length
    chrome.browserAction.setBadgeText({text: num.toString(), tabId: tabId})
    chrome.storage.sync.set({'num': num})
}

// Add entries: Using method 1 ( `onUpdated` )
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading' && changeInfo.url) {
        processUrl(tabId, tab.url); // or changeInfo.url, does not matter
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
