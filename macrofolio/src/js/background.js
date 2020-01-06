import { count_ips, updateLinks } from './ip.js'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if(request.op == "html"){
        updateLinks(sender.tab.id, request.doc)
      }
  }
)

// Get active tab
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request == "is_selected") {
        chrome.tabs.getSelected(null, function(tab){
            if(tab.id == sender.tab.id) {
                sendResponse(true);
            } else {
                sendResponse(false);
            }
        });
    }
});

function set_badge(tab){
    chrome.tabs.query({active: true}, (tab)=>{
        let tabId = tab[0].id
        let num = count_ips(tabId)
        chrome.browserAction.setBadgeText({text: num.toString(), tabId: tabId})
        chrome.storage.sync.set({'num': num})
    });
}

setInterval(set_badge, 1000);
