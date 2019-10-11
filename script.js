'use strict';

const apiKey = '52c6dff4ea5e83aba69fe752999caa2c';
const lastFmSearchUrl = 'http://ws.audioscrobbler.com/2.0/';
const lyricsSearchUrl = 'https://api.lyrics.ovh/v1/';

function formatQueryParams {
  // format the query parameters to make API call

}

function displaySearchResults {
  // displays the results of the search with links to the artist or song
  // displays "No results found, Please try another search" if no results are found

}

function getArtistOrSongs {
  // uses API to get the name of the artist or song 

}

function watchForm {
  $('form').submit(event => {
    event.preventDefault();

    const searchTerm = $('#js-search-term').val();

    getArtistOrSongs(searchTerm);
  });
}

$(watchForm);