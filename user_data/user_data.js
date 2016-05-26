chrome.storage.sync.get("savedMovies", function(obj) {
  var savedMoviesArray = obj["savedMovies"];
  $('#movieTable').append('<tr><td>Movie</td><td>Rating</td><td>Link</td></tr>');
  for (var i=0;i<savedMoviesArray.length;i++) {
    var movie = savedMoviesArray[i];
    $('#movieTable').append('<tr>' +
    '<td>' + movie.dispTitle + '</td>' +
    '<td>' + movie.rating + '</td>' +
    '<td>' + movie.movieUrl + '</td>' +
    '</tr>')
    console.log(savedMoviesArray[i]);
  }
});