#Spotlist

A webapp for creating Spotify Playlists

##Deployment Notes

run `grunt` to concat and minify everything.

##Dependencies

* jQuery
* Bootstrap

##Webapp Flow
1. Check if the user is logged in & getAccessToken
  * If not: ask to login
2. Get the user's userID
3. User search by artist or track
  * By artist
    1. Get the artist's uri from spotify and get their top tracks
  * By Track
    1. Return the results from Spotify's search
4. User clicks on a track
  * Add that track the playlist and store in a dictionary
5. User adds multiple tracks
6. User names & creates the playlist
7. User has created spotify playlist
