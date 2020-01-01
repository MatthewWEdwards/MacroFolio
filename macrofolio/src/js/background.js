import { updateLinks, num } from './ip.js'
import { links } from './links.js'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if(request.op == "html"){
        var page_links = links(request.doc)
        updateLinks(sender.tabid, page_links)
        chrome.storage.sync.set({'num': num})
        console.log(CSS)
      }
  }
)

export function badge_num(){
    return num
}
