'use strict';

const apiKey = '52c6dff4ea5e83aba69fe752999caa2c';
const lastFmSearchUrl = 'http://ws.audioscrobbler.com/2.0/';
const lyricsSearchUrl = 'https://api.lyrics.ovh/v1/';

function formatQueryParams(params) {
  // format the query parameters to make API call
  console.log(`formatQueryParams is running`);

  const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

  return queryItems.join('&');
}

function displaySearchResults(responseJson) {
  // displays the results of the search with links to the artist or song
  // displays "No results found, Please try another search" if no results are found
  console.log('`displaySearchResults` is running');
  console.log(responseJson);

  $('#results-list').empty();

  if (responseJson.results.trackmatches.track.length === 0) {
    $('#js-error-message').show();

    $('#results').hide();

    $('#js-error-message').text('No results found. Please try another search.');
  } else {
    responseJson.results.trackmatches.track.forEach(function(track) {
      console.log('track', track);

      $('#js-error-message').hide();

      $('#results-list').append(
        `<li><a href='javascript:console.log("${track.name}")'>${track.name}</a> - ${track.artist}</li>`
      );
    });

    $('#results').show();
  }
}

function getArtistOrSongs(query) {
  // uses API to get the name of the artist or song
  console.log(`getArtistOrSong is running`);

  const params = {
    method: 'track.search',
    track: query,
    api_key: apiKey,
    format: 'json'
  };
  const queryString = formatQueryParams(params);
  const url = lastFmSearchUrl + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displaySearchResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  console.log(`watchForm is running`);

  $('form').submit(event => {
    event.preventDefault();

    const searchTerm = $('#js-search-term').val();

    getArtistOrSongs(searchTerm);
  });
}

$(watchForm);
