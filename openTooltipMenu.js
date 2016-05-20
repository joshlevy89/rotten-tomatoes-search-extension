function getHighlightedObject(callback) {
      var selection = window.getSelection();
      // invoke the callback
      callback(selection);
}

function createTooltipMenu(selection) {
	var ele = document.createElement("div");
      var r = selection.getRangeAt(0).getBoundingClientRect(); //get the text range
      var relative=document.body.parentNode.getBoundingClientRect();
      ele.style.position = 'absolute';
      ele.style.backgroundColor= '#f8eded';
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
        // check whether the page is a search results page (or movie page)
        var searchPage = getMatchToRegExp(text,'SEARCH_PAGE','');
        if (searchPage !== undefined) {
          // if search page has 'no results found', return that in callback
          var noResultsFound = getMatchToRegExp(text,'NO_RESULTS_FOUND','');
          if (noResultsFound != undefined) callback(noResultsFound,undefined);
          // otherwise, check for matches to <span class="tMeterScore">\d\d:
          else {
            var tMeterScore = getMatchToRegExp(text,'T_METER_SCORE','');
            //  if matches null (ie links but none rated), return 'no rating yet'
            if (tMeterScore === undefined) {
              var movieUrl = makeResultString(getMatchToRegExp(text,'MOVIE_URL_NO_RATING',''));
              callback('no rating yet',movieUrl);
            }
            // if matches not null, return first score match
            else {
              var movieUrl = makeResultString(getMatchToRegExp(text,'MOVIE_URL_SEARCH_PAGE',''));
              callback(tMeterScore,movieUrl);
            }
          }
        }
        else {
        // get the url and rating for the movie
        var ratingValue = getMatchToRegExp(text,'RATING_VALUE','');
        if (ratingValue === undefined) ratingValue = 'no rating yet'; // check whether movie page has no ratingValue
        var movieUrl = getMatchToRegExp(text,'MOVIE_URL_RESULT_PAGE','');
        callback(ratingValue,movieUrl);
        }
    },
    error: function(res) {
      callback(res.statusText,undefined)
    }
 });
}

// gets the match to the regular expression specified by type
// if type is empty, use optionalRe instead
function getMatchToRegExp(text,type,optionalRe) {
  var re;
  switch (type) {
    case 'SEARCH_PAGE':
      re = /(Search Results - Rotten Tomatoes)/;
      break;
    case 'MOVIE_URL_RESULT_PAGE':
      re = /<link href="(http:\/\/www.*)" rel="canonical"/;
      break;
    case 'MOVIE_URL_SEARCH_PAGE':
      re = /<span class="tMeterScore">[^=]* <span class="movieposter"> <a href="(([^<])*)">/;
      break;
    case 'MOVIE_URL_NO_RATING':
      re = /No Score Yet[^=]* <span class="movieposter"> <a href="(([^<])*)">/;
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
  //console.log(re);
  var match = re.exec(text);
  //console.log(match);
  if (match === null) return undefined
  return match[1];
}

function renderTooltipMenuText(str) {
    $("#tooltipMenu").empty(); // removes any previous divs 
    //$('#tooltipMenu').text(str);
    $('#tooltipMenu').append('<div>' + str + '</div>');
    $('#tooltipMenu').css('padding','5px');
}

function renderTooltipMenuLink(movieUrl) {
    if (movieUrl === undefined) return
    $('#tooltipMenu').append('<a href=' + movieUrl + ' target=_blank>Link</a>');
}

function makeSearchString(highlightedText) {
  // replace spaces with underscores in url
  var query = highlightedText.split(' ').join('+');
  return 'https://www.rottentomatoes.com/search/?search=' + query;
  //return 'http://www.rottentomatoes.com/search/?search=12+angry+men';
}

function makeResultString(ext) {
  return 'https://www.rottentomatoes.com' + ext;
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
   renderTooltipMenuText('Searching for ' + highlightedText.substring(0,12)+'...');
   getSource(makeSearchString(highlightedText), function(rating,movieUrl) {
      if (rating === 'no results found') {
        renderTooltipMenuText(rating);
      }
      else if (rating === 'no rating yet') {
        renderTooltipMenuText(rating);
        renderTooltipMenuLink(movieUrl);
      }
      else {
        renderTooltipMenuText('Rating: ' + rating + '%');
        renderTooltipMenuLink(movieUrl);
      }
   }, function(errorMessage) {
     renderTooltipMenuText('Cannot find rating: ' + errorMessage);
   });
  });
  }
});

