'use strict';

const apiKey = '52c6dff4ea5e83aba69fe752999caa2c';
const lastFmSearchUrl = 'http://ws.audioscrobbler.com/2.0/';
const lyricsSearchUrl = 'https://api.lyrics.ovh/v1/';
let page = 1;

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

  return queryItems.join('&');
}

function displayLyrics(responseJson) {
  console.log(responseJson);

  $('#js-results-list').empty();

  if (responseJson.error === 'No lyrics found') {
    $('#js-error-message').show();

    $('#js-results').hide();

    $('#js-more-results').hide();

    $('#js-error-message').text('No results found. Please try another search.');
  } else {
    $('#js-more-results').hide();

    $('#js-results-list').append(`<p class="lyrics">${responseJson.lyrics}</p><a id="back-to-results" href="">Back to results</a>`);
  }
}

function getLyrics(artist, title) {
  const url = lyricsSearchUrl + encodeURIComponent(artist) + '/' + encodeURIComponent(title);

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayLyrics(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayResults(responseJson) {
  console.log(responseJson);

  if (responseJson.results['opensearch:totalResults'] === '0') {
    $('#js-error-message').show();

    $('#js-results').hide();

    $('#js-more-results').hide();

    $('#js-error-message').text('No results found. Please try another search.');
  } else {
    responseJson.results.trackmatches.track.forEach(track => {
      $('#js-error-message').hide();

      $('#js-results-list').append(
        `<li><a href="javascript:getLyrics('${track.artist}', '${track.name}')">${track.name}</a> - ${track.artist}</li>`
      );
    });

    $('#js-results').show();

    if (responseJson.results['opensearch:totalResults'] < 30) {
      $('#js-more-results').hide();
    } else {
      $('#js-more-results').show();
    }
  }
}

function getResults(query, page) {
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
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function handleLoadMore() {
  $('#js-more-results').on('click', event => {
    const query = $('#js-search-term').val();

    getResults(query, ++page);
  });
}

function handleSearch() {
  $('form').submit(event => {
    event.preventDefault();

    $('#js-results-list').empty();

    const searchTerm = $('#js-search-term').val();
    page = 1;

    getResults(searchTerm, page);
  });
}

$(function() {
  handleSearch();
  handleLoadMore();
});
