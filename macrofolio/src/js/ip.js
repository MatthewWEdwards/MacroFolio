import { links } from './links.js'

export var hostToIP = {};
export var tabToHosts = {};

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
     x.send();
    return
}

export function setPopupInfo(tabId) { // Notify all popups
    chrome.extension.getViews({type:'popup'}).forEach(function(global) {
        global.notify(tabId);
    });
}

export function count_ips(tabId){
    if(tabToHosts[tabId] == undefined)
        return
    var ips = new Set()
    for(var host = 0; host < tabToHosts[tabId].length; host++)
        ips.add(hostToIP[tabToHosts[tabId][host]])
    return ips.size
}

export function updateLinks(tabId, html){
    let links_arr = links(html)
    tabToHosts[tabId] = links_arr
    links_arr.forEach((item, index, tabId)=>{processUrl(tabId, item)})
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
