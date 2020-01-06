import { hostToIP, updateLinks } from './ip.js'
import { links } from './links.js'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if(request.op == "html"){
        var page_links = links(request.doc)
        updateLinks(sender.tabid, page_links)
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
