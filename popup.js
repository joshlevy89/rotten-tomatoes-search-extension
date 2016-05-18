function getHighlightedText(callback) {
  chrome.tabs.executeScript({
    code: "window.getSelection().toString()"
  }, function(selection) {
    callback(selection.toString());
  });

    // var code = [
    //        'var selection = window.getSelection();',
    //         'oRange = selection.getRangeAt(0);', //get the text range
    //         'oRect = oRange.getBoundingClientRect();',
    //         //'alert(oRect.left);',
    //         'var d = document.createElement("div");',
    //         'd.setAttribute("style", "'
    //             + 'background-color: orange; '
    //             + 'width: 100px; '
    //             + 'height: 100px; '
    //             + 'position: fixed; '
    //             + 'top: 150px; '
    //             + 'left: 30px; '
    //             + 'z-index: 9999; '
    //             + '");',
    //         'document.body.appendChild(d);',
    //         'selection.toString()'
    //         //'selection.toString()'
    // ].join("\n");

    var code = [
      'var selection = window.getSelection();',
      'var ele = document.createElement("div");',
      'var r = selection.getRangeAt(0).getBoundingClientRect();', //get the text range
      'var relative=document.body.parentNode.getBoundingClientRect();',
      'ele.setAttribute("style", "'
            + 'background-color: orange; '
            + 'width: 100px; '
            + 'height: 100px; '
            + 'position: absolute; '
            + 'z-index: 9999; '
            + '");',
      'ele.style.top =(r.bottom -relative.top)+"px";',//this will place ele below the selection
      'ele.style.right=-(r.right-relative.right)+"px";',//this will align the right edges together
      'document.body.appendChild(ele);',
      'alert(ele.style.top)',
      'selection.toString()'
      //'selection.toString()'
    ].join("\n");

  console.log(code);
  chrome.tabs.executeScript({
    code: code
  }, function(selection) {
    console.log(selection)
    callback(selection[0]);
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
        var text = res.toString();
        var re = /<span itemprop="ratingValue">\d\d/g;
        var ratingValueMatches = text.match(re);

        // if no matches are made, it's because search results have been returned
        if (ratingValueMatches === null) {
          var re = /no results found/g;
          var noResultsFoundMatches = text.match(re);
          // if search page has 'no results found', return that in callback
          if (noResultsFoundMatches != null) {
            callback(noResultsFoundMatches[0]);
          }
          // otherwise, check for matches to <span class="tMeterScore">\d\d:
          else {
            var re = /<span class="tMeterScore">\d\d/g;
            var tMeterScoreMatches = text.match(re);
            //  if matches null (ie links but none rated), return 'no rating yet'
            if (tMeterScoreMatches === null) {
              callback('no rating yet');
            }
            // if matches not null, return first score match
            else {
              var firstMatch = tMeterScoreMatches[0];
              var rating = firstMatch.substr(firstMatch.length-2);
              callback(rating);
            }
          }
        }
        else {
        var firstMatch = ratingValueMatches[0];
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
  //return 'http://www.rottentomatoes.com/search/?search=12+angry+men';
}

document.addEventListener('DOMContentLoaded', function() {

  getHighlightedText(function(highlightedText) {
   if (highlightedText.trim()==="") { 
      renderStatus('No text selected');
      return;
   }
   renderStatus('Searching for: ' + highlightedText + '...');
   getSource(makeSearchString(highlightedText), function(rating) {
      renderStatus('Rating: ' + rating);
   }, function(errorMessage) {
     renderStatus('Cannot find rating: ' + errorMessage);
   });
  });

});
