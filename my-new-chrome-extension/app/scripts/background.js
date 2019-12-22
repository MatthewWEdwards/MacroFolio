'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
      console.log(details)
  },
 
  {tabId: 1, urls: ["<all_urls>"]}
);
