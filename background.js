var toggle = true;
chrome.browserAction.onClicked.addListener(function(tab) {
  toggle = !toggle;
  console.log(toggle);
  if(toggle){
    //chrome.browserAction.setIcon({path: "on.png", tabId:tab.id});
    chrome.tabs.executeScript(null, {file:"openTooltipMenu.js"});
  }
  else{
    //chrome.browserAction.setIcon({path: "off.png", tabId:tab.id});
    chrome.tabs.executeScript(tab.id, {code: "$('body').off();"});
  }
});