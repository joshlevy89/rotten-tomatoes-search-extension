chrome.storage.sync.get("savedMovies", function(obj) {
  var savedMoviesObj = obj["savedMovies"];
  console.log(savedMoviesObj);
  $('#movieTable').append('<tr><td>Movie</td><td>Rating</td><td>Link</td><td>Delete</td><td>Watched</td></tr>');
  for (key in savedMoviesObj) {
    var movie = savedMoviesObj[key];
    $('#movieTable').append('<tr id="' + key + '">' +
    '<td>' + movie.dispTitle + '</td>' +
    '<td>' + movie.rating + '</td>' +
    '<td><a href = "' + movie.movieUrl + '" target="_blank">' + movie.movieUrl + '</a></td>' +
    '<td><button id="deleteButton">delete</button></td>' +
    '<td><input type="checkbox" id="watchedButton" ' + (movie.watched ? 'checked':'') + '></input></td>' +
    '</tr>');
    // if watched, fade out the row
    if (movie.watched === false) $("#" + key).css('background-color','#AEA');
    else $("#" + key).css('background-color','#CCC');
  }

  // add listener that allows users to delete movies
  $('#movieTable').on('click', '#deleteButton', function(){
    var key = $(this).closest('tr').attr('id');
    $(this).closest('tr').remove();
    chrome.storage.sync.get("savedMovies", function(obj) {
        var savedMoviesObj = obj["savedMovies"];
        delete savedMoviesObj[key];
        chrome.storage.sync.set({"savedMovies":savedMoviesObj});
    });
  });

    $('#movieTable').on('click', '#watchedButton', function(){
    var key = $(this).closest('tr').attr('id');
    chrome.storage.sync.get("savedMovies", function(obj) {
       var savedMoviesObj = obj["savedMovies"];
       savedMoviesObj[key].watched = !(savedMoviesObj[key].watched);
       // update color so refresh not required
       if (savedMoviesObj[key].watched === false) $("#" + key).css('background-color','#AEA');
       else $("#" + key).css('background-color','#CCC');
       chrome.storage.sync.set({"savedMovies":savedMoviesObj});
    });
  });
});
