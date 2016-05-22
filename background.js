// turn content script on by default
var toggle = true;
chrome.tabs.executeScript(null, {file:"openTooltipMenu.js"}); 

// toggle event listener each time extension icon clicked
chrome.browserAction.onClicked.addListener(function(tab) {
  toggle = !toggle;
  if(toggle){
    //chrome.browserAction.setIcon({path: "on.png", tabId:tab.id});
    chrome.tabs.executeScript(null, {file:"openTooltipMenu.js"});
  }
  else{
    //chrome.browserAction.setIcon({path: "off.png", tabId:tab.id});
    chrome.tabs.executeScript(tab.id, {code: "$('body').off();"});
  }
});