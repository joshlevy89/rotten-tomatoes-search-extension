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
				if (newState) turnOn();
				else turnOff();
				// run the content script in all tabs
				executeScriptsInExistingTabs();
			});
		});
	})
	// add event listener to view saved movies
	var savedMovies = document.getElementById('savedMovies')
	savedMovies.addEventListener('click', function() {
		chrome.tabs.executeScript({code: "console.log('hit saved...')"});
		chrome.tabs.create({'url': chrome.extension.getURL('./user_data/user_data.html')}, function(tab) {
  			// Tab opened.
		});
	})
});

function turnOn() {
	chrome.browserAction.setIcon({path: "../icons/icon_on.png"});
	$('#toggle').text('disable');
}

function turnOff() {
	chrome.browserAction.setIcon({path: "../icons/icon_off.png"});
	$('#toggle').text('enable');
}

function executeScriptsInExistingTabs(){
    chrome.windows.getAll(null, function(wins) {
      for (var j = 0; j < wins.length; ++j) {
        chrome.tabs.getAllInWindow(wins[j].id, function(tabs) {
          for (var i = 0; i < tabs.length; ++i) {
            if (tabs[i].url.indexOf("chrome://") != 0) {
              chrome.tabs.executeScript(tabs[i].id, { file: './content_scripts/content_scripts.js' });
            }
          }
        });
      }
    });
}

	