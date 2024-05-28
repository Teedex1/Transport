// Initialize the map
const map = L.map('map').setView([9.0820, 8.6753], 6); // Centered on Nigeria

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const busMarkers = {};

// Fetch available rides from the server and display them
fetch('/rides')
  .then(response => response.json())
  .then(rides => {
    const ridesList = document.getElementById('rides-list');
    rides.forEach(ride => {
      const rideElement = document.createElement('div');
      rideElement.className = `ride from-${ride.from.toLowerCase().replace(' ', '-')}`;
      rideElement.innerHTML = `
        <div class="ride-image">
          <img src="images/${ride.from.toLowerCase().replace(' ', '-')}.jpg" alt="${ride.from}">
        </div>
        <div class="ride-info">
          <p><strong>From:</strong> ${ride.from}</p>
          <p><strong>To:</strong> ${ride.to}</p>
          <p><strong>Date:</strong> ${ride.date}</p>
          <p><strong>Time:</strong> ${ride.time}</p>
          <p><strong>Seats available:</strong> ${ride.seats}</p>
        </div>
        <button class="book-btn" onclick="bookRide(${ride.id})">Book</button>
      `;
      ridesList.appendChild(rideElement);
    });
  })
  .catch(error => console.error('Error fetching rides:', error));

// Function to book a ride
function bookRide(rideId) {
  const seats = prompt('Enter the number of seats you want to book:');
  if (seats) {
    fetch('/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rideId, seats: parseInt(seats) })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      location.reload(); // Refresh the page to update the available seats
    })
    .catch(error => console.error('Error booking ride:', error));
  }
}

// Function to show the appropriate section
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// Show the home section by default
showSection('home');

// Socket.io for real-time updates
const socket = io();

socket.on('locationUpdate', ({ busId, latitude, longitude }) => {
  if (busMarkers[busId]) {
    busMarkers[busId].setLatLng([latitude, longitude]);
  } else {
    const marker = L.marker([latitude, longitude]).addTo(map)
      .bindPopup(`Bus ${busId}`);
    busMarkers[busId] = marker;
  }
});

// Initial fetch of bus locations
fetch('/bus-locations')
  .then(response => response.json())
  .then(locations => {
    for (const [busId, { latitude, longitude }] of Object.entries(locations)) {
      const marker = L.marker([latitude, longitude]).addTo(map)
        .bindPopup(`Bus ${busId}`);
      busMarkers[busId] = marker;
    }
  })
  .catch(error => console.error('Error fetching bus locations:', error));
