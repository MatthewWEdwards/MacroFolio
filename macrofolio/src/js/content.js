async function send_html(){
    let doc = document.documentElement.outerHTML
    chrome.runtime.sendMessage({"op": "html", "doc": doc})
}

window.onload = function() { 
    setInterval(send_html, 1000)
}
