'use strict';

const apiKey = '52c6dff4ea5e83aba69fe752999caa2c';
const lastFmSearchUrl = 'http://ws.audioscrobbler.com/2.0/';
const lyricsSearchUrl = 'https://api.lyrics.ovh/v1/';
// let startPage = 1;

function formatQueryParams(params) {
  // format the query parameters to make API call
  console.log('`formatQueryParams` is running');

  const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

  return queryItems.join('&');
}

// function displayMoreSearchResults(responseJson) {
//   console.log('`displayMoreSearchResults` is running');

//   responseJson.results.trackmatches.track.forEach(function(track) {
//     $('#results-list').append(
//       `<li><a href="javascript:console.log("${track.name}")">${track.name}</a> - ${track.artist}</li>`
//     );
//   });

//   $('#more-results').show();
// }

// function increasePageNumber() {
//   console.log('`increasePageNumber` is running');

//   startPage++;

//   return startPage;
// }

function getMoreResults(query, page) {
  $('#more-results').on('click', event => {
    console.log('`getMoreResults` is running');

    getArtistOrSongs(query, page++);
  });
}

function displaySearchResults(responseJson, query, page) {
  // displays the results of the search with links to the artist or song
  // displays "No results found, Please try another search" if no results are found
  console.log('`displaySearchResults` is running');
  console.log(responseJson);

  

  if (responseJson.results['opensearch:totalResults'] === '0') {
    $('#js-error-message').show();

    $('#results').hide();

    $('#more-results').hide();

    $('#js-error-message').text('No results found. Please try another search.');
  } else {
    responseJson.results.trackmatches.track.forEach(function(track) {
      $('#js-error-message').hide();

      $('#results-list').append(
        `<li><a href="javascript:console.log("${track.name}")">${track.name}</a> - ${track.artist}</li>`
      );
    });

    $('#results').show();

    $('#more-results').show();

    getMoreResults(query, page);
  }
}

function getArtistOrSongs(query, page) {
  // uses API to get the name of the artist or song
  console.log(`getArtistOrSong is running, page:${page}`);

  const params = {
    method: 'track.search',
    track: query,
    api_key: apiKey,
    format: 'json',
    page: page
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
    .then(responseJson => displaySearchResults(responseJson, query, page))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  console.log(`watchForm is running`);

  $('form').submit(event => {
    event.preventDefault();

    const searchTerm = $('#js-search-term').val();

    $('#results-list').empty();

    getArtistOrSongs(searchTerm, 1);
  });
}

$(watchForm);
