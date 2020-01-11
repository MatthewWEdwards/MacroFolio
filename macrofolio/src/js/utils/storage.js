export const getStorageData = key => 
  new Promise((resolve, reject) =>
    chrome.storage.local.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

