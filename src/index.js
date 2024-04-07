// Your code here

document.addEventListener('DOMContentLoaded', () => {
  const baseURL = 'http://localhost:3000';
  const filmsURL = `${baseURL}/films`;
  const ticketsURL = `${baseURL}/tickets`;
  const filmsList = document.getElementById('films');
  const filmDetails = document.getElementById('film-details');
  const buyTicketButton = document.getElementById('buy-ticket');

  // Fetch and display details of the first movie on load
  fetch(`${filmsURL}/1`)
    .then(response => response.json())
    .then(film => displayFilmDetails(film));

  // Fetch and display list of all movies on load
  fetch(filmsURL)
    .then(response => response.json())
    .then(films => {
      films.forEach(film => addFilmToList(film));
    });

  function displayFilmDetails(film) {
    // Calculate available tickets
    const availableTickets = film.capacity - film.tickets_sold;
    
    // Display film details
    filmDetails.innerHTML = `
      <img src="${film.poster}" alt="${film.title} poster">
      <h3>${film.title}</h3>
      <p><strong>Runtime:</strong> ${film.runtime} minutes</p>
      <p><strong>Showtime:</strong> ${film.showtime}</p>
      <p><strong>Available Tickets:</strong> <span id="ticket-count">${availableTickets}</span></p>
      <button id="buy-ticket" ${availableTickets === 0 ? 'disabled' : ''}>${availableTickets === 0 ? 'Sold Out' : 'Buy Ticket'}</button>
    `;

    // Setup event listener for buying a ticket
    document.getElementById('buy-ticket').addEventListener('click', () => buyTicket(film));
  }

  function buyTicket(film) {
    const newTicketsSold = film.tickets_sold + 1;
    const newAvailableTickets = film.capacity - newTicketsSold;

    // Persist updated number of tickets sold
    fetch(`${filmsURL}/${film.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tickets_sold: newTicketsSold })
    });

    // Update available tickets in the DOM
    document.getElementById('ticket-count').textContent = newAvailableTickets;

    // POST the new ticket to the server
    fetch(ticketsURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        film_id: film.id,
        number_of_tickets: 1
      })
    });

    if (newAvailableTickets === 0) {
      // Update button text and disable it
      const buyButton = document.getElementById('buy-ticket');
      buyButton.textContent = 'Sold Out';
      buyButton.disabled = true;

      // Add sold-out class to the film in the list
      const filmListItem = document.querySelector(`li[data-film-id="${film.id}"]`);
      filmListItem.classList.add('sold-out');
    }
  }

  function addFilmToList(film) {
    const li = document.createElement('li');
    li.textContent = film.title;
    li.classList.add('film', 'item');
    li.dataset.filmId = film.id;

    // Add delete button for the film
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteFilm(film, li));
    li.appendChild(deleteBtn);

    filmsList.appendChild(li);
  }

  function deleteFilm(film, filmListItem) {
    // Delete film from the server
    fetch(`${filmsURL}/${film.id}`, {
      method: 'DELETE'
    })
    .then(() => {
      // Remove film from the list in the DOM
      filmsList.removeChild(filmListItem);
    });
  }
});