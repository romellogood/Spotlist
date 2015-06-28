var playlist = {};
    // accessToken = null;

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
  .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
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
  .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
}

//Add into dictionary. Use dictionary so there won't be duplicates.
function addToPlaylist(id) {
  if(playlist[id] === undefined) {
    playlist[id] = 1;
    /*jshint multistr: true */
    $('#playlist-list').append(
      '<li id="' + id +'" class="song"> \
        <span id="' + id +'" class="remove" onclick="removeFromPlaylist(this.id)">X</span> \
      One - One</li>'
    );
  }
}

function removeFromPlaylist(id) {
  $('#' + id).remove();
  delete playlist[id];
}

function savePlaylist() {
  var playlistData = { "uris": [] };
  for(var song in playlist) {
    playlistData.uris.push("spotify:track:" + song);
  }
  console.log(playlistData);
  //Create the Playlist
  $.ajax({
    type: 'POST',
    contentType: 'application/json',
    dataType: 'jsonp',
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    url: 'https://api.spotify.com/v1/users/mellogood/playlists',
    data: {
      name: 'hello'
    },
    crossDomain : true,
    xhrFields: {
      withCredentials: false
    }
  })
  .done(function(data) {
    console.log('Created Playlist');
    console.log(data);
    //Add in the songs
    // $.ajax({
    //   type: 'POST',
    //   dataType: 'application/json',
    //   //TODO
    //   url: 'https://api.spotify.com/v1/users/mellogood/playlists/data.uri/tracks',
    //   data: playlistData,
    //   crossDomain : true,
    //   xhrFields: {
    //     withCredentials: false
    //   }
    // })
    // .done(function(data) {
    //   console.log('Success!');
    // })
    // .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
  })
  .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
}

function getUserID() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    crossDomain : true,
    xhrFields: {
      withCredentials: false
    }
  })
  .done(function(data) {
    console.log(data.id);
  })
  .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
}

//Check if they are logged in.
function checkUser() {
  accessToken = getHashValue('access_token');
  if(accessToken) {
    console.log(accessToken);
    getUserID();
  } else {
    console.log('no token');
  }
}

/* Spotify returns the access token in th url.
 * This solution was taken from:
 * http://stackoverflow.com/questions/11920697/how-to-get-hash-value-in-a-url-in-js
 */
function getHashValue(key) {
  var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

$(document).ready(function () {
  checkUser();
  // console.log(getUserID());
  search('artist', 'chance');
  //Differentiate between saving and searching
  $('input').keyup(function (e) {
    if (e.keyCode == 13 && $('#search-input').val() !== '') {
      search($('select').val(),$('#search-input').val());
    }
  });
});
