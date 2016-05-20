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
        // if is a search result page...
        if (searchPage !== undefined) {
          // if search page has 'no results found', return that in callback
          var noResultsFound = getMatchToRegExp(text,'NO_RESULTS_FOUND','');
          if (noResultsFound != undefined) callback(noResultsFound,undefined);
          // otherwise, get the text between first <li ...>...</li> after movie list start
          else {
            // get the first link text
            var firstLinkText = getFirstLinkText(text);
            // get the index of the t meter score in the links so that  
            var ratingValue = getMatchToRegExp(firstLinkText,'T_METER_SCORE','');
            if (ratingValue === undefined) ratingValue = 'no rating yet'; // check whether movie page has no ratingValue
            var movieUrl = makeResultString(getMatchToRegExp(firstLinkText,'MOVIE_URL_SEARCH_PAGE',''));
            var title = getMatchToRegExp(firstLinkText,'TITLE_SEARCH_PAGE','');
            var year = getMatchToRegExp(firstLinkText,'YEAR_SEARCH_PAGE','');
            var dispTitle = title + ' (' + year + ')';
            callback(ratingValue,movieUrl,dispTitle);
          }
        }
        // if is a movie result page...
        else {
          // get the url and rating for the movie
          var ratingValue = getMatchToRegExp(text,'RATING_VALUE','');
          if (ratingValue === undefined) ratingValue = 'no rating yet'; // check whether movie page has no ratingValue
          var movieUrl = getMatchToRegExp(text,'MOVIE_URL_RESULT_PAGE','');
          var titleAndYear = getMatchToRegExp(text,'TITLE_AND_YEAR_RESULT_PAGE','');
          var dispTitle = titleAndYear.replace('&nbsp;',' ');
          callback(ratingValue,movieUrl,dispTitle);
        }
    },
    error: function(res) {
      callback(res.statusText,undefined)
    }
 });
}

// get the html text associated with the first link
function getFirstLinkText(text) {
  // find index where movies list starts
  var movieListStartIndex = text.indexOf('<h2 class="bottom_divider">Movies</h2>');
  // get all text after that
  var textAfterMovieListStart = text.substring(movieListStartIndex);
  // get indices of text between first <li ...>...</li> after movie list start
  var firstLiOpenAfterListStart = textAfterMovieListStart.indexOf('<li');
  var firstLiCloseAfterListStart = textAfterMovieListStart.indexOf('</li>');
  var startTextInd = movieListStartIndex + firstLiOpenAfterListStart;
  var endTextInd = movieListStartIndex + firstLiCloseAfterListStart;
  var firstLinkText = text.substring(startTextInd,endTextInd);
  return firstLinkText;
}

// gets the match to the regular expression specified by type
// if type is empty, use optionalRe instead
function getMatchToRegExp(text,type,optionalRe) {
  var re;
  switch (type) {
    case 'SEARCH_PAGE':
      re = /(Search Results - Rotten Tomatoes)/;
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
    case 'MOVIE_URL_RESULT_PAGE':
      re = /<link href="(http:\/\/www.*)" rel="canonical"/;
      break;
    case 'MOVIE_URL_SEARCH_PAGE':
      re = /href="([^<]*)">[^<]*<\/a> <span class="movie_year"> \(\d*\)/;
      break;
    case 'TITLE_AND_YEAR_RESULT_PAGE':
      re = /<title>(.*) - Rotten Tomatoes<\/title>/;
      break;
    case 'TITLE_SEARCH_PAGE':
      re = /href="[^<]*">([^<]*)<\/a> <span class="movie_year"> \(\d*\)/;
      break;
    case 'YEAR_SEARCH_PAGE':
      re = /href="[^<]*">[^<]*<\/a> <span class="movie_year"> \((\d*)\)/;
      break;
    default:
      re = optionalRe;
  }
  //console.log(re);
  //console.log(text);
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

function renderTooltipMenuLink(movieUrl,title) {
    if (movieUrl === undefined) return
    // if cannot find title, render link with 'Link' string instead
    if (title === undefined) {
      $('#tooltipMenu').append('<a href=' + movieUrl + ' target=_blank>Link</a>');
    }
    else {
      var dispTitle = title.replace('&nbsp;',' ');
      $('#tooltipMenu').append('<a href=' + movieUrl + ' target=_blank>' + dispTitle + '</a>');
    }
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
   getSource(makeSearchString(highlightedText), function(rating,movieUrl,title) {
      if (rating === 'no results found') {
        renderTooltipMenuText(rating);
      }
      else if (rating === 'no rating yet') {
        renderTooltipMenuText(rating);
        renderTooltipMenuLink(movieUrl);
      }
      else {
        renderTooltipMenuText('Rating: ' + rating + '%');
        renderTooltipMenuLink(movieUrl,title);
      }
   }, function(errorMessage) {
     renderTooltipMenuText('Cannot find rating: ' + errorMessage);
   });
  });
  }
});

