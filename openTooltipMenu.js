function getHighlightedObject(callback) {
      var selection = window.getSelection();
      // invoke the callback
      callback(selection);
}

function createTooltipMenu(selection) {
	var ele = document.createElement("div");
      var r = selection.getRangeAt(0).getBoundingClientRect(); //get the text range
      var relative=document.body.parentNode.getBoundingClientRect();
      ele.setAttribute('style',
              'background-color: lightGray; '
            + 'width: 100px; '
            + 'height: 30px; '
            + 'position: absolute; '
            );
      ele.style.top =(r.bottom -relative.top)+"px";//this will place ele below the selection
      ele.style.right=-(r.right-relative.right)+"px"; //this will align the right edges together
      ele.setAttribute("id","tooltipMenu");
      document.body.appendChild(ele);
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

function renderTooltipMenu(str) {
    $('#tooltipMenu').text(str);
}

function makeSearchString(highlightedText) {
  // replace spaces with underscores in url
  var query = highlightedText.split(' ').join('+');
  return 'https://www.rottentomatoes.com/search/?search=' + query;
  //return 'http://www.rottentomatoes.com/search/?search=12+angry+men';
}

// destroy any existing tooltipMenuDivs
$('body').on('mousedown', function(){
	 $( "#tooltipMenu" ).remove();
});

$('body').on('mouseup', function() {
   getHighlightedObject(function(selection) {
   var highlightedText = selection.toString();
   if (highlightedText.trim()==="") { 
      return;
   }
   createTooltipMenu(selection);
   renderTooltipMenu('searching for: ' + highlightedText.substring(0,12)+'...');
   getSource(makeSearchString(highlightedText), function(rating) {
      renderTooltipMenu('rating is: ' + rating);
   }, function(errorMessage) {
     renderTooltipMenu('cannot find rating: ' + errorMessage);
   });
  });
});

