// TODO: Send HTML again on page change
window.onload = function() { 
    let doc = document.documentElement.outerHTML
    chrome.runtime.sendMessage({"op": "html", "doc": doc})
}

