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
           // + 'width: 100px; '
           // + 'height: 30px; '
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
        var ratingValue = getMatchToRegExp(text,'RATING_VALUE','');

        // if no matches are made, it's because search results page has been returned
        if (ratingValue === undefined) {
          // if search page has 'no results found', return that in callback
          var noResultsFound = getMatchToRegExp(text,'NO_RESULTS_FOUND','');
          if (noResultsFound != undefined) callback(noResultsFound);
          // otherwise, check for matches to <span class="tMeterScore">\d\d:
          else {
            var tMeterScore = getMatchToRegExp(text,'T_METER_SCORE','');
            //  if matches null (ie links but none rated), return 'no rating yet'
            if (tMeterScore === undefined) callback('no rating yet');
            // if matches not null, return first score match
            else callback(tMeterScore);
          }
        }
        else {
        // get the url for the movie
        var movieUrl = getMatchToRegExp(text,'MOVIE_URL','');
        callback(ratingValue,movieUrl);
        }
    },
    error: function(res) {
      callback(res.statusText)
    }
 });
}

// gets the match to the regular expression specified by type
// if type is empty, use optionalRe instead
function getMatchToRegExp(text,type,optionalRe) {
  var re;
  switch (type) {
    case 'MOVIE_URL':
      re = /<link href="(http:\/\/www.*)" rel="canonical"/;
      break;
    case 'NO_RESULTS_FOUND':
      re = /(no results found)/;
      break;
    case 'RATING_VALUE':
      re = /<span itemprop="ratingValue">(\d*)/g;
      break;
    case 'T_METER_SCORE':
      re = /<span class="tMeterScore">(\d*)/g;
      break;
    default:
      re = optionalRe;
  }
  var match = re.exec(text);
  //console.log(re);
  //console.log(match[1]);
  if (match === null) return undefined
  return match[1];
}

function renderTooltipMenuText(str) {
    //$('#tooltipMenu').text(str);
    $('#tooltipMenu').append('<div>' + str + '</div>');
}

function renderTooltipMenuLink(movieUrl) {
    $('#tooltipMenu').append('<a href=' + movieUrl + ' target=_blank>Link</a>');
}

function makeSearchString(highlightedText) {
  // replace spaces with underscores in url
  var query = highlightedText.split(' ').join('+');
  return 'https://www.rottentomatoes.com/search/?search=' + query;
  //return 'http://www.rottentomatoes.com/search/?search=12+angry+men';
}


// destroy any existing tooltipMenuDivs
$('body').on('mousedown', function(event) {
  // check if event originated from outside tooltipMenu
  if (!$(event.target).closest('#tooltipMenu').length) {
      $( "#tooltipMenu" ).remove();
  }
});

$('body').on('mouseup', function(event) {
  // if event originated from outside tooltipMenu, run search
   if (!$(event.target).closest('#tooltipMenu').length) {
   getHighlightedObject(function(selection) {
   var highlightedText = selection.toString();
   if (highlightedText.trim()==="") { 
      return;
   }
   createTooltipMenu(selection);
   renderTooltipMenuText('searching for: ' + highlightedText.substring(0,12)+'...');
   getSource(makeSearchString(highlightedText), function(rating,movieUrl) {
      renderTooltipMenuText('rating is: ' + rating);
      renderTooltipMenuLink(movieUrl);
   }, function(errorMessage) {
     renderTooltipMenuText('cannot find rating: ' + errorMessage);
   });
  });
  }
});

