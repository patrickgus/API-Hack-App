'use scrict';

const apiKey = '52c6dff4ea5e83aba69fe752999caa2c';
const lastFmSearchUrl = 'https://ws.audioscrobbler.com/2.0/';
const lyricsSearchUrl = 'https://api.lyrics.ovh/v1/';
let page = 1;

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

  return queryItems.join('&');
}

function displaySimilarArtists(responseJson) {
  console.log(responseJson);
  $('#js-similar-artists').show();

  responseJson.similarartists.artist.forEach(artist => {
    $('#js-similar-artists-list').append(
      `<li><a href="javascript:
      $('#js-results-list').empty();
      $('#js-search-term').val('${fixedEncodeURIComponent(artist.name)}');
      
      STORE.tracks = [];
      page=1;
      
      $('html, body').animate({
        scrollTop: $('body').offset().top
      }, 1200);
  
      getResults('${fixedEncodeURIComponent(artist.name)}', page)
        .then(responseJson => {
          const startIndex = storeResults(responseJson.results.trackmatches.track);
          displayResults(responseJson.results.trackmatches.track, startIndex);
        });">
      ${artist.name}</a></li>`
    );
  });
}

function getSimilarArtists(index) {
  const params = {
    method: 'artist.getsimilar',
    artist: STORE.tracks[index].artist,
    api_key: apiKey,
    format: 'json',
    limit: 5
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
    .then(responseJson => displaySimilarArtists(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayLyrics(responseJson, index) {
  console.log(responseJson);

  $('#js-results').hide();

  $('#js-lyrics').show();

  $('#js-lyrics').empty();

  $('#js-similar-artists-list').empty();

  $('html, body').animate({
    scrollTop: $('#js-lyrics').offset().top
  }, 800);

  if (responseJson.error === 'No lyrics found') {
    $('#js-error-message').show();

    $('#js-error-message').text('No lyrics found.');
  } else {
    $('#js-lyrics').append(
      `<h3>${STORE.tracks[index].name} - ${STORE.tracks[index].artist}</h3>
        <p class="lyrics">${responseJson.lyrics.replace(/\n/g, '<br>')}</p>`
    );
  }
  $('#back-to-results').show();

  getSimilarArtists(index);
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
      $('#js-results').hide();
      
      $('#js-error-message').show();

      $('#back-to-results').show();

      $('#js-error-message').text('No lyrics found. Please try another search.');
      
      console.log(`Something went wrong: ${err.message}`);
    });
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str.replace(/['\/*?]/g, ''));
}

function displayResults(results, startIndex) {
  console.log(STORE);
  $('#js-lyrics').empty();
  $('#js-similar-artists').hide();
  $('#back-to-results').hide();

  if (results.length) {
    results.forEach((track, index) => {
      $('#js-error-message').hide();

      $('#js-results-list').append(`<li><a href="javascript:getLyrics(${index+startIndex})">${track.name}</a> - ${track.artist}</li>`);
    });

    $('#js-results').show();
  } else {
    $('#js-error-message').show();

    $('#js-results').hide();

    $('#js-error-message').text('No results found. Please try another search.');
  }

  if (results.length < 30) {
    $('#js-more-results').hide();
  } else {
    $('#js-more-results').show();
  }
}

function storeResults(results) {
  const startIndex = STORE.tracks.length

  results.forEach(track => {
    STORE.tracks.push({
      name: track.name,
      artist: track.artist
    });
  });
  return startIndex;
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

  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .catch(err => {
      $('#js-results').hide();
      
      $('#js-error-message').show();
      
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function handleBackToResults() {
  $('#back-to-results').click(event => {
    $('#js-error-message').hide();
    
    $('#js-lyrics').hide();

    $('#back-to-results').hide();

    $('#js-similar-artists').hide();

    $('#js-results').show();

    $('html, body').animate({
      scrollTop: $('#js-more-results').offset().top
    }, 800);
  });
}

function handleLoadMore() {
  $('#js-more-results').click(event => {
    const query = $('#js-search-term').val();

    getResults(query, ++page)
      .then(responseJson => {
        const startIndex = storeResults(responseJson.results.trackmatches.track);
        displayResults(responseJson.results.trackmatches.track, startIndex);
      });     
  });
}

function handleSearch() {
  $('form').submit(event => {
    event.preventDefault();

    $('#js-results-list').empty();
    STORE.tracks = [];
    page = 1;
    const searchTerm = $('#js-search-term').val();

    getResults(searchTerm, page)
      .then(responseJson => {
        const startIndex = storeResults(responseJson.results.trackmatches.track);
        displayResults(responseJson.results.trackmatches.track, startIndex);
      }); 
  });
}

$(function() {
  handleSearch();
  handleLoadMore();
  handleBackToResults();
});
