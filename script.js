'use strict';

const apiKey = '52c6dff4ea5e83aba69fe752999caa2c';
const lastFmSearchUrl = 'http://ws.audioscrobbler.com/2.0/';
const lyricsSearchUrl = 'https://api.lyrics.ovh/v1/';
let page = 1;

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

  return queryItems.join('&');
}

function handleBackToResults() {
  $('#back-to-results').click(event => {
    $('#js-lyrics').hide();

    $('#js-results').show();
  });
}

function displayLyrics(responseJson, index) {
  console.log(responseJson);

  $('#js-results').hide();

  $('#js-lyrics').show();

  $('#js-lyrics').empty();

  if (responseJson.error === 'No lyrics found') {
    $('#js-error-message').show();

    $('#js-error-message').text('No lyrics found.');
  } else {
    $('#js-lyrics').append(
      `<h3>${STORE.tracks[index].name} - ${STORE.tracks[index].artist}</h3><p class="lyrics">${responseJson.lyrics.replace(/\n/g, '<br>')}</p>`
    );
  }
  $('#js-lyrics').append('<button id="back-to-results">Back to results</button>');

  handleBackToResults();
}

function getLyrics(index) {
  const url = lyricsSearchUrl + fixedEncodeURIComponent(STORE.tracks[index].artist) + '/' + fixedEncodeURIComponent(STORE.tracks[index].name);

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayLyrics(responseJson, index))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str.replace(/[!'\/()*]/g, ''));
}

function displayResults() {
  console.log(STORE);

  if (STORE.tracks.length) {
    STORE.tracks.forEach((track, index) => {
      $('#js-error-message').hide();

      $('#js-results-list').append(`<li><a href="javascript:getLyrics(${index})">${track.name}</a> - ${track.artist}</li>`);
    });

    $('#js-results').show();
  } else {
    $('#js-error-message').show();

    $('#js-results').hide();

    $('#js-error-message').text('No results found. Please try another search.');
  }

  if (STORE.tracks.length < 30) {
    $('#js-more-results').hide();
  } else {
    $('#js-more-results').show();
  }
}

async function storeResults(responseJson) {
  return await responseJson.results.trackmatches.track.forEach(track => {
    STORE.tracks.push({
      name: track.name,
      artist: track.artist
    });
  });
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
    .then(responseJson => storeResults(responseJson))
    .then(() => displayResults())
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

    STORE.tracks.length = 0;
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
