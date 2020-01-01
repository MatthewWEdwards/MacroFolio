var el = document.getElementById('num')
el.innerHTML = chrome.storage.sync.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})


