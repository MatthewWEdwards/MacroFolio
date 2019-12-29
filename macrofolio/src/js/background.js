import { hostToIP, tabToHost } from './ip.js'

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
        console.log(request.doc)
})
