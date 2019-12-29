import { hostToIP, tabToHost } from './ip.js'
import { links }from './links.js'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
        console.log(links(request.doc))
})
