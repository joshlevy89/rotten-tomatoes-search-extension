function turnTooltipOn() {
var base_url = 'https://www.rottentomatoes.com';

function getHighlightedObject(callback) {
  var selection = window.getSelection();
  // invoke the callback
  callback(selection);
}

function createTooltipMenu(selection) {
  var ele = document.createElement("div");
  var r = selection.getRangeAt(0).getBoundingClientRect(); //get the text range
  var relative=document.body.parentNode.getBoundingClientRect();
  ele.style.position = 'fixed';
  ele.style.backgroundColor= '#f8eded';
  ele.style.top = '25px';
  ele.style.right = '25px';
  ele.style.zIndex = '9999';
  ele.style.border = 'solid';
  //ele.style.top =(r.bottom -relative.top)+"px";//this will place ele below the selection
  //ele.style.right=-(r.right-relative.right)+"px"; //this will align the right edges together
  ele.setAttribute("id","tooltipMenu");
  document.body.appendChild(ele);
  $('#tooltipMenu').append('<div id="tooltipHeading">WhatToWatch</div>');
  $('#tooltipHeading').css('text-decoration','underline');
  $('#tooltipHeading').css('margin-top','5px');
  $('#tooltipMenu').css('padding','10px');
  $('#tooltipMenu').css('text-align','center');
}

 function getSource(theUrl,callback,errorCallback)
{
  // could be made faster by just extracting fields of interest
  // (with yahoo query api for example, or maybe some parameters in ajax call)
  $.ajax({
    url: theUrl,
    type: 'GET',
    dataType: "text",
    success: function(res) {
        console.log('returned');

        var text = res;//.toString();
        //console.log(typeof res);
        // check whether the page is a search results page (or movie page)
        var searchPage = getMatchToRegExp(text,'SEARCH_PAGE','');
        // if is a search result page...
        if (searchPage !== undefined) {
          // if search page has 'no results found', return that in callback
          var noResultsFound = getMatchToRegExp(text,'NO_RESULTS_FOUND','');
          if (noResultsFound != undefined) callback(noResultsFound);
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
      callback(res.statusText)
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
  var match = re.exec(text);
  //console.log(match);
  if (match === null) return undefined
  return match[1];
}

function renderTooltipMenuSearchText(str) {
    $('#tooltipMenu').append('<div id="searchText">' + str + '</div>');
    $('#searchText').css('margin-top','10px');
}

function renderTooltipMenuRatingText(str) {
    $("#searchText").empty(); // removes any previous divs 
    if (str.length<=2) {
      str = str + '%';
    }
    $('#tooltipMenu').append('<div id="tooltipRating">' + str + '</div>');
    $('#tooltipRating').css('margin-top','10px');
    $('#tooltipRating').css('font-size','20px');
}

function renderTooltipMenuLink(movieUrl,dispTitle) {
    if (movieUrl === undefined) return
    var str = dispTitle;
    if (str === undefined) str = 'Link';// if cannot find title, render 'Link'
    $('#tooltipMenu').append('<a id="tooltipLink" href=' + movieUrl + ' target=_blank>' + str + '</a>');
    $('#tooltipLink').css('margin-top','5px');
}

function renderTooltipSaveButton(dispTitle, rating, movieUrl) {
  $('#tooltipMenu').append('<div><button id="tooltipSaveButton">Save</button></div>');
  $('#tooltipSaveButton').on('click', function(event) {
        //chrome.storage.sync.set({'savedMovies': {}}, function() {
        // get any saved results in local storage
        chrome.storage.sync.get("savedMovies", function(obj) {
        if (Object.keys(obj).length === 0) var savedMoviesObj = {};
        else var savedMoviesObj = obj["savedMovies"];
        var id =  dispTitle.replace(/["'()]/g,"").replace(/ /g,''); // removes parens and whitespace
        console.log(id);
        if (!(id in savedMoviesObj)) { // only assign new if not already a key
        savedMoviesObj[id] = {'dispTitle': dispTitle, 'rating':rating,'movieUrl':movieUrl,'watched':false};
        chrome.storage.sync.set({"savedMovies":savedMoviesObj});
        }
        })
      //})
  });
  $('#tooltipSaveButton').css('margin-top','5px');
}

function makeSearchString(highlightedText) {
  // replace spaces with underscores in url
  var query = highlightedText.split(' ').join('+');
  return base_url + '/search/?search=' + query;
  //return 'http://www.rottentomatoes.com/search/?search=12+angry+men';
}

function makeResultString(ext) {
  return base_url + ext;
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
   renderTooltipMenuSearchText('Searching for ' + highlightedText.substring(0,12)+'...');
   getSource(makeSearchString(highlightedText), function(rating,movieUrl,dispTitle) {
   renderTooltipMenuRatingText(rating);
   renderTooltipMenuLink(movieUrl,dispTitle);
   renderTooltipSaveButton(dispTitle, rating, movieUrl);
   }, function(errorMessage) {
     renderTooltipMenuText('Cannot find rating: ' + errorMessage);
   });
  });
  }
});
}

function turnTooltipOff() {
  $('body').off();
}

chrome.extension.sendMessage({ cmd: "getOnOffState" }, function(currentState){
  if (currentState) turnTooltipOn();
  else turnTooltipOff();
});

