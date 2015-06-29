var playlist    = {},
    accessToken = '',
    userID      = '',
    audioObject = null;

function makeRequest(type, url, params, cbk) {
  reqBody = {
    'type': type,
    'url': url,
    'crossDomain': true,
    'xhrFields': {
      'withCredentials': false
    }
  };
  for(var key in params) {
    reqBody[key] = params[key];
  }
  $.ajax(reqBody)
    .done(cbk)
    .fail(function(xhr, textStatus, errorThrown) {
      alert(xhr.responseText);
      console.log(xhr);
    });
}

function search(type, query) {
  if(query === '') {
    warn('Sorry, that was an empty search.');
  } else {
    makeRequest(
      'get',
      'https://api.spotify.com/v1/search?q=' + query + '&type=' + type,
      {
        'dataType': 'json',
      },
      function(data) {
        if(type == 'artist') {
          appendToPage(data.artists.items,'artist');
        } else {
          appendToPage(data.tracks.items, 'track');
        }
      }
    );
  }
}

//Display a message to the user
function warn(message) {
  $('#search-results').html(message);
}

//Clear previous data & append new data
function appendToPage(data, type) {
  $('#search-results').html(' ');
  if(data.length === 0) {
    warn('Sorry, we couldn\'t find that.');
  } else {
    for(var result in data) {
      if(type == 'artist') {
        /*jshint multistr: true */
        $('#search-results').append(
          '<p class="result result-artist" id="' + data[result].id +
          '" onclick="getArtistsTracks(this.id)">' + data[result].name +'</p>'
        );
      } else {
        /* ID = artistName{-]songName{-]songID
         * Using {-] because it is a unique string and won't appear in a song title
         */
        $('#search-results').append(
          '<div class="result"> \
            <span class="glyphicon glyphicon-music music-button" \
              id="' + data[result].id + '" onclick="playTrack(this.id)"></span> \
            <p class="result-song" id="' + data[result].artists[0].name + '{-]' +
            data[result].name + '{-]' + data[result].id +
            '" onclick="addToPlaylist(this.id)"> \
              <span class="glyphicon glyphicon-plus add-button"></span>' +
              data[result].artists[0].name + '- ' + data[result].name +
            '</p> \
          </div>'
        );
      }
    }
  }
}

function getArtistsTracks(artistID) {
  makeRequest(
    'get',
    'https://api.spotify.com/v1/artists/' + artistID + '/top-tracks?country=US',
    {
      'dataType': 'json',
    },
    function(data) {
      appendToPage(data.tracks, 'track');
    }
  );
}

function playTrack(trackID) {
  makeRequest(
    'get',
    'https://api.spotify.com/v1/tracks/' + trackID,
    {
      'dataType': 'json',
    },
    function(data) {
      //If you clicked the song already playing: pause it.
      if($('#' + trackID).hasClass('playing')) {
        audioObject.pause();
      } else {
        //Pause a song if there is one playing.
        if(audioObject) {
          audioObject.pause();
        }
        audioObject = new Audio(data.preview_url);
        audioObject.play();
        audioObject.addEventListener('ended', function () {
          $('.playing').removeClass('playing');
        });
        audioObject.addEventListener('pause', function () {
          $('.playing').removeClass('playing');
        });
        $('#' + trackID).addClass('playing');
      }
    }
  );
}


//ID Form = artistName{-]songName{-]songID
function addToPlaylist(id) {
  id = id.split('{-]');
  /* Add songs into dictionary. Use a dictionary to prevent duplicates.
   * Make sure the song's id isn't in the dictionary and that the id isn't undefined.
   */
  if(playlist[id[2]] === undefined && id[2] !== undefined) {
    playlist[id[2]] = 1;
    /*jshint multistr: true */
    $('#playlist-list').append(
      '<p class="playlist-song" id="' + id[2] +
      '" onclick="removeFromPlaylist(this.id)"> \
        <span class="glyphicon glyphicon-remove remove-button"></span>' +
        id[0] + '- ' + id[1] +
      '</p>'
    );
  }
}

//Delete from #playlist-list and the dictionary
function removeFromPlaylist(id) {
  $('#' + id).remove();
  delete playlist[id];
}

function savePlaylist() {
  if(accessToken === null) {
    warn('Please login to save your playlist.');
  } else if($.isEmptyObject(playlist)) {
    warn('Please add a song before saving the playlist.');
  } else {
    if($('#playlist-input').val() === "") {
      warn('Please name your playlist first.');
    }
    else {
      var playlistData = { 'uris': [] };
      //Move the songs from the dictionary to the array.
      for(var song in playlist) {
        playlistData.uris.push('spotify:track:' + song);
      }
      //Create the Playlist
      makeRequest(
        'post',
        'https://api.spotify.com/v1/users/' + userID + '/playlists',
        {
          'contentType': 'json',
          'dataType': 'json',
          'headers': {
            'Authorization': 'Bearer ' + accessToken,
          },
          'data': JSON.stringify({
            'name': $('#playlist-input').val(),
            'public': false
          })
        },
        function(data) {
          /* Returns an object with the newly created playlist's url(href)
           * Now add the tracks into that playlist.
           */
          makeRequest(
            'post',
            data.href + '/tracks',
            {
              'contentType': 'json',
              'dataType': 'json',
              'headers': {
                'Authorization': 'Bearer ' + accessToken,
              },
              'data': JSON.stringify(playlistData),
            },
            function(data) {
              console.log('Successfully created playlist and added songs!');
            }
          );
        }
      );
    }
  }
}

function logout() {
  //TODO - change from localhost
  $('#login-status').html('<a href="https://accounts.spotify.com/authorize?client_id=66dbe5ac0dc04f3ca53b78f802c07153&redirect_uri=http://localhost:8000&scope=playlist-modify-public%20playlist-modify-private&response_type=token&state=123"><p>LogIn</p>');
}

function getUserID() {
  //getUserID
  makeRequest(
    'get',
    'https://api.spotify.com/v1/me',
    {
      'contentType': 'application/json',
      'dataType': 'json',
      'headers': {
        'Authorization': 'Bearer ' + accessToken,
      }
    },
    function(data) {
      userID = data.id;
      //TODO - change from localhost
      $('#login-status').html('<a href="http://localhost:8000"><p>Log-Out</p>');
    }
  );
}


/* Spotify returns the access token in th url.
 * This solution was taken from:
 * http://stackoverflow.com/questions/11920697/how-to-get-hash-value-in-a-url-in-js
 */
function checkLoginStatus() {
  matches = location.hash.match(new RegExp('access_token=([^&]*)'));
  accessToken = matches ? matches[1] : null;
  if(accessToken) {
    getUserID();
  } else {
    warn('First, login to Spotify!');
  }
}

$(document).ready(function () {
  checkLoginStatus();
  search('artist', 'childish gambino'); //TODO - remove
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
