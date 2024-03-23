function searchSongs() {
  let title = document.getElementById('song-title').value.trim();
  if (title === '') {
    alert('Please enter a song title');
    return;
  }

  // Clear the previous search results.
  let searchResultsTable = document.getElementById('search-results-table');
  if (searchResultsTable) {
    // Clear all rows except the header row.
    searchResultsTable.innerHTML = searchResultsTable.rows[0].outerHTML;
  }

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let response = JSON.parse(xhr.responseText);

        // Update the search heading with the current song title being searched.
        let searchHeading = document.getElementById('search-heading');
        if (searchHeading) {
          searchHeading.textContent = `Search Results: ${title}`;
        }

        // Check if there are results and append them to the table.
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
            // Add the new row to the table's HTML.
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

  // Create a new row with the song information
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

  // Add the new row to the playlist table
  playlistTable.appendChild(newRow);

  // Add functionality for the remove button
  let removeButton = newRow.querySelector('.remove-song');
  removeButton.addEventListener('click', function() {
    newRow.remove();
  });

  // Add functionality for the move up button
  let moveUpButton = newRow.querySelector('.move-up');
  moveUpButton.addEventListener('click', function() {
    let previousRow = newRow.previousElementSibling;
    if (previousRow && previousRow.tagName === 'TR') {
      playlistTable.insertBefore(newRow, previousRow);
    }
  });

  // Add functionality for the move down button
  let moveDownButton = newRow.querySelector('.move-down');
  moveDownButton.addEventListener('click', function() {
    let nextRow = newRow.nextElementSibling;
    if (nextRow) {
      // The corrected logic for moving down
      playlistTable.insertBefore(nextRow, newRow);
    }
  });
}

const ENTER=13

function handleKeyUp(event) {
event.preventDefault()
   if (event.keyCode === ENTER) {
      document.getElementById("submit_button").click()
  }
}


// Update event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('submit_button').addEventListener('click', searchSongs);
  document.addEventListener('keyup', handleKeyUp);
});
