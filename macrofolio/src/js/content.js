async function send_html(){
    chrome.extension.sendRequest("is_selected", function(isSelected) {
        if(isSelected){
            let doc = document.documentElement.outerHTML
            chrome.runtime.sendMessage({"op": "html", "doc": doc})
        } 
    });
}

window.onload = function() { 
    setInterval(send_html, 1000)
}
