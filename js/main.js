function search(type, query) {
  var searchUrl = 'https://api.spotify.com/v1/search?q=' + query + '&type=' + type;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: searchUrl,
    crossDomain : true,
    xhrFields: {
        withCredentials: false
    }
  })
  .done(function(data) {
    $('#search-query').text(query);
    if(type == 'artist') {
      appendToPage(data.artists.items,'artist');
    } else {
      appendToPage(data.tracks.items, 'track');
    }
  })
  .fail( function(xhr, textStatus, errorThrown) {
    alert(xhr.responseText);
    alert(textStatus);
  });
}

//Clear previous data & append new data
function appendToPage(data, type) {
  $('#search-results').html(' ');
  if(data.length !== 0) {
    for(var result in data) {
      if(type == 'artist') {
        /*jshint multistr: true */
        $('#search-results').append(
          '<div class="result"> \
            <p class="item-name" id="' + data[result].id + '" onclick="getArtistTracks(this.id)">' + data[result].name +'</p> \
          </div>'
      );
      } else {
        $('#search-results').append(
          '<div class="result"> \
            <p class="item-name">' + data[result].name +'</p> \
            <button id="' + data[result].id + '" onclick="addToPlaylist(this.id)"> \
          </div>'
        );
      }
    }
  } else {
    $('#search-results').append('<p id="sorry">Sorry we couldn\'t find that.</p>');
  }
}

function getArtistTracks(artistURL) {
  var searchUrl = 'https://api.spotify.com/v1/artists/' + artistURL + '/top-tracks?country=US';
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: searchUrl,
    crossDomain : true,
    xhrFields: {
        withCredentials: false
    }
  })
  .done(function(data) {
    // $('#search-query').text(artistName + '\'s Top Songs');
    appendToPage(data.tracks, 'track');
  })
  .fail( function(xhr, textStatus, errorThrown) {
    alert(xhr.responseText);
    alert(textStatus);
  });
}

function addToPlaylist(id) {
  console.log(id);
}

function checkUser() {
  var regex   = new RegExp("[\\?&]code=([^&#]*)"),
      results = regex.exec(location.search);
  if(results) {
    return true;
  } else {
    return false;
  }
}

$(document).ready(function () {
  var playlist = {};
  console.log(checkUser());
  search('artist', 'chance');
  $('input').keyup(function (e) {
    if (e.keyCode == 13 && $('input').val() !== '') {
      search($('select').val(),$('input').val());
    }
  });
});
