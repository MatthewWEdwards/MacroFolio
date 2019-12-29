import { updateLinks, num } from './ip.js'
import { links }from './links.js'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
        var page_links = links(request.doc)
        updateLinks(sender.tabid, page_links)
})


function badge_num(){
    return num
}
