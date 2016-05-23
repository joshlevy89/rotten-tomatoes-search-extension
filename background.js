// turn content script on by default
var toggle = true;
chrome.tabs.executeScript({file:"openTooltipMenu.js"}); 
console.log('hello');

// toggle event listener each time extension icon clicked
chrome.browserAction.onClicked.addListener(function(tab) {
  toggle = !toggle;
  if(toggle){
    chrome.browserAction.setIcon({path: "./icons/icon_on.png"});
    chrome.tabs.executeScript({file:"openTooltipMenu.js"});
  }
  else{
    chrome.browserAction.setIcon({path: "./icons/icon_off.png"});
    chrome.tabs.executeScript({code: "$('body').off();"});
  }
});