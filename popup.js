function getHighlightedText(callback) {
  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(selection) {
    callback(selection.toString());
  });
}

 function getSource(theUrl,callback,errorCallback)
{

  // could be made faster by just extracting fields of interest
  // (with yahoo query api for example, or maybe some parameters in ajax call)
  $.ajax({
    url: theUrl,
    type: 'GET',
    success: function(res) {
        var re = /<span itemprop="ratingValue">\d\d/g;
        var text = res.toString();
        var matches = text.match(re);
        // if no matches are made, not on a landing page
        // ie as far as I know, on a full search page
        // so, grab the first link and search again
        if (matches === null) {
          var re = /<a href="\/m\/([^<]*)\/">/g;  
          var text = res.toString();
          var matches = text.match(re);
          var firstMatch = matches[0];
          var ext = firstMatch.substring(9,firstMatch.length-2);
          var nextUrl = 'http://www.rottentomatoes.com' + ext;
          getSource(nextUrl,callback,errorCallback); // recursive call
        }
        else {
        var firstMatch = matches[0];
        var rating = firstMatch.substr(firstMatch.length-2);
        callback(rating);
        }
    },
    error: function(res) {
      callback(res.statusText)
    }

 });
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function makeSearchString(highlightedText) {
  // replace spaces with underscores in url
  var query = highlightedText.split(' ').join('+');
  return 'http://www.rottentomatoes.com/search/?search=' + query;
  //return 'http://www.rottentomatoes.com/m/1079908-12_angry_men/';
  //return 'http://www.rottentomatoes.com/search/?search=12+angry+men';
  //return 'http://www.rottentomatoes.com/m/zootopia/';
}

document.addEventListener('DOMContentLoaded', function() {

  getHighlightedText(function(highlightedText) {
   renderStatus('Searching for: ' + highlightedText + '...');
   getSource(makeSearchString(highlightedText), function(rating) {
      renderStatus('Rating: ' + rating);
   }, function(errorMessage) {
     renderStatus('Cannot find rating: ' + errorMessage);
   });
  });

});
