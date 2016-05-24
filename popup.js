document.addEventListener('DOMContentLoaded', function() {
	// show different text depending on on/off state (for icon, handled by having default icon)
	 chrome.extension.sendMessage({ cmd: "getOnOffState" }, function(currentState){
	 	if (currentState) $('#toggle').text('disable');
	 	else $('#toggle').text('enable');
	 });
	// allow user to toggle state of extension
	var toggle = document.getElementById('toggle')
	toggle.addEventListener('click', function() {
		//chrome.tabs.executeScript({code: "console.log('toggled...')"});
		chrome.extension.sendMessage({ cmd: "getOnOffState" }, function(currentState){
			var newState = !currentState;
			// toggle to the new state in background
			chrome.extension.sendMessage({ cmd: "setOnOffState", data: { value: newState } }, function(){
				// after toggling, do stuff based on new state
				if (newState) {
					chrome.browserAction.setIcon({path: "./icons/icon_on.png"});
					chrome.tabs.executeScript({file:"openTooltipMenu.js"});
					$('#toggle').text('disable');
				}
				else {
					chrome.browserAction.setIcon({path: "./icons/icon_off.png"});
					chrome.tabs.executeScript({code: "$('body').off();"});
					$('#toggle').text('enable');
				}	
			});
		});
	})
});

	