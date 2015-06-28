var playlist    = {},
    accessToken = '',
    userID      = '';

function search(type, query) {
  if(query !== '') {
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
      if(type == 'artist') {
        appendToPage(data.artists.items,'artist');
      } else {
        appendToPage(data.tracks.items, 'track');
      }
    })
    .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
  } else {
    warn('Sorry there weren\'t any search parameters.');
  }
}

//Display a message to the user
function warn(message) {
  $('#search-results').html(message);
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
            <p id="' + data[result].id + '" onclick="getArtistTracks(this.id)">' + data[result].name +'</p> \
          </div>'
      );
      } else {
        //ID = artistName-songName-songID
        $('#search-results').append(
          '<div class="query-result"> \
            <p> \
              <span class="glyphicon glyphicon-plus add-button" id="' +
              data[result].artists[0].name + '{-]' + data[result].name + '{-]' + data[result].id +
              '" onclick="addToPlaylist(this.id)"></span>' +
              data[result].artists[0].name + '- ' + data[result].name +
            '</p> \
          </div>'
        );
      }
    }
  } else {
    warn('Sorry we couldn\'t find that.');
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
    appendToPage(data.tracks, 'track');
  })
  .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
}

//Add into dictionary. Use dictionary so there won't be duplicates.
//ID Form = artistName-songName-songID
function addToPlaylist(id) {
  id = id.split('{-]');
  if(playlist[id[2]] === undefined) {
    playlist[id[2]] = 1;
    /*jshint multistr: true */
    $('#playlist-list').append(
      '<p id="' + id[2] +'" class="song"> \
        <span class="glyphicon glyphicon-remove remove-button" id="' + id[2] +'" \
        onclick="removeFromPlaylist(this.id)"></span> \
      ' + id[0] + '- ' + id[1] +'</p>'
    );
  }
}

function removeFromPlaylist(id) {
  $('#' + id).remove();
  delete playlist[id];
}

function savePlaylist() {
  if(accessToken !== null) {
    var playlistData = { "uris": [] };
    for(var song in playlist) {
      playlistData.uris.push("spotify:track:" + song);
    }
    console.log($('#playlist-input').val());
    console.log(playlistData);
    console.log(accessToken);
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
        name: $('#playlist-input').val()
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
    .fail( function(xhr, textStatus, errorThrown) {
      console.log(xhr);
      console.log(textStatus);
      console.log(errorThrown);
     });
  } else {
    warn('Please Log-In to save the playlist.');
  }
}

function logout() {
  $('#login-status').html('<a href="https://accounts.spotify.com/authorize?client_id=66dbe5ac0dc04f3ca53b78f802c07153&redirect_uri=http://localhost:8000&scope=playlist-modify%20playlist-modify-public%20&response_type=token&state=123"><p>Log-In</p>');
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
    userID = data.id;
    //TODO - change to functioning url
    $('#login-status').html('<a href="http://localhost:8000"><p>Log-Out</p>');
  })
  .fail( function(xhr, textStatus, errorThrown) { alert(xhr.responseText); });
}

//Check if they are logged in.
function checkUser() {
  accessToken = getHashValue('access_token');
  if(accessToken) {
    getUserID();
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
  //TODO - remove
  search('artist', 'childish gambino');
  //Excute different operations based on which input is focused
  $('input').keyup(function (e) {
    if(e.keyCode == 13) {
      if($('input:focus').context.activeElement.id == 'search-input') {
        search($('select').val(),$('#search-input').val());
      } else if($('input:focus').context.activeElement.id == 'playlist-input') {
        savePlaylist();
      }
    }
  });
});
