//SET VARIABLE
var isExtensionOn = false;

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('toggle').addEventListener('click', function() {
		chrome.tabs.executeScript({code: "console.log('toggled...')"});
		chrome.extension.sendMessage({ cmd: "getOnOffState" }, function(currentState){
			var newState = !currentState;
			// toggle to the new state in background
			chrome.extension.sendMessage({ cmd: "setOnOffState", data: { value: newState } }, function(){
				// after toggling, do stuff based on new state
				chrome.tabs.executeScript({code: "console.log( " + newState + ");"});
				if (newState) {
					chrome.browserAction.setIcon({path: "./icons/icon_on.png"});
					chrome.tabs.executeScript({file:"openTooltipMenu.js"});
				}
				else {
					chrome.browserAction.setIcon({path: "./icons/icon_off.png"});
					chrome.tabs.executeScript({code: "$('body').off();"});
				}	
			});
		});
	})
});

	