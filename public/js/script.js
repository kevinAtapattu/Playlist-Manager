// function to search songs
function searchSongs() {
  let title = document.getElementById('song-title').value.trim();
  if (title === '') {
    alert('Please enter a song title');
    return;
  }

  // updating heading to display search results matching title searched
  let searchHeading = document.getElementById('search-heading');
  if (searchHeading) {
    searchHeading.textContent = `Songs Matching: ${title}`;
  }

  // clearing other prev search result
  let searchResultsTable = document.getElementById('search-results-table');
  if (searchResultsTable) {
    // clearing all rows except the header row.
    searchResultsTable.innerHTML = searchResultsTable.rows[0].outerHTML;
  }

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let response = JSON.parse(xhr.responseText);

        // checking if results exist, adding them if so
        if (response.results && response.results.length > 0) {
          response.results.forEach((song, index) => {
            let newRow = `
              <tr class="search-result-row">
                <td><button class="add-song">+</button></td>
                <td>${song.trackName}</td>
                <td>${song.artistName}</td>
                <td><img src="${song.artworkUrl60}" alt="${song.trackName} Artwork"></td>
              </tr>
            `;
            // adding new row 
            searchResultsTable.insertAdjacentHTML('beforeend', newRow);
          });

          let addButtons = document.getElementsByClassName('add-song');
            for (let btn of addButtons) {
              btn.addEventListener('click', function() {
                let songRow = this.parentNode.parentNode; // The <tr> element for the song
                let trackName = songRow.querySelector('td:nth-child(2)').textContent;
                let artistName = songRow.querySelector('td:nth-child(3)').textContent;
                let artworkUrl = songRow.querySelector('td:nth-child(4) img').src;

                addToPlaylist(trackName, artistName, artworkUrl);
              });
            }
        } else {
          let noResultsRow = `<tr><td colspan="4">No songs found. Try another search.</td></tr>`;
          searchResultsTable.insertAdjacentHTML('beforeend', noResultsRow);
        }
      } else {
        console.error('There was a problem with the request:', xhr.status);
      }
    }
  };
  xhr.open('GET', `/searchSongs?title=${encodeURIComponent(title)}`, true);
  xhr.send();
}

function addToPlaylist(trackName, artistName, artworkUrl) {
  let playlistTable = document.getElementById('playlist-table');

  // creating new row to playlist with song info
  let newRow = document.createElement('tr');
  newRow.className = 'playlist-row';
  newRow.innerHTML = `
    <td>
      <button class="remove-song">−</button>
      <button class="move-up">🔼</button>
      <button class="move-down">🔽</button>
    </td>
    <td>${trackName}</td>
    <td>${artistName}</td>
    <td><img src="${artworkUrl}" alt="${trackName} Artwork" style="width: 50px; height: 50px;"></td>
  `;

  // add button
  playlistTable.appendChild(newRow);

  // remove button
  let removeButton = newRow.querySelector('.remove-song');
  removeButton.addEventListener('click', function() {
    newRow.remove();
    savePlaylist();
  });

  // move up button
  let moveUpButton = newRow.querySelector('.move-up');
  moveUpButton.addEventListener('click', function() {
    let previousRow = newRow.previousElementSibling;
    if (previousRow && previousRow.tagName === 'TR') {
      playlistTable.insertBefore(newRow, previousRow);
    }
    savePlaylist();
  });

  // move down button
  let moveDownButton = newRow.querySelector('.move-down');
  moveDownButton.addEventListener('click', function() {
    let nextRow = newRow.nextElementSibling;
    if (nextRow) {
      // moving row down
      playlistTable.insertBefore(nextRow, newRow);
    }
    savePlaylist();
  });

  savePlaylist(); // saving current playlist so it can be accessed again
}

function savePlaylist() {
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('No user is currently logged in.');
    return;
  }

  // Get the existing playlists object, or initialize a new one
  let playlists = JSON.parse(localStorage.getItem('playlists')) || {};
  let playlist = [];

  // Get all the songs from the current user's playlist and save them
  document.querySelectorAll('#playlist-table .playlist-row').forEach(row => {
    const trackName = row.cells[1].textContent;
    const artistName = row.cells[2].textContent;
    const artworkUrl = row.cells[3].querySelector('img').src;
    playlist.push({ trackName, artistName, artworkUrl });
  });

  // Save the current user's playlist inside the playlists object
  playlists[username] = playlist;
  localStorage.setItem('playlists', JSON.stringify(playlists));
}

function loadPlaylist() {
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('No user is currently logged in.');
    return;
  }

  // Get the existing playlists object
  let playlists = JSON.parse(localStorage.getItem('playlists')) || {};
  
  // Load the current user's playlist if it exists
  if (playlists[username]) {
    playlists[username].forEach(song => {
      addToPlaylist(song.trackName, song.artistName, song.artworkUrl);
    });
  }
}

const ENTER=13

function handleKeyUp(event) {
event.preventDefault()
   if (event.keyCode === ENTER) {
      document.getElementById("submit_button").click()
  }
}


// updating event listeners
document.addEventListener('DOMContentLoaded', function() {
  loadPlaylist();
  document.getElementById('submit_button').addEventListener('click', searchSongs);
  document.addEventListener('keyup', handleKeyUp);
});
