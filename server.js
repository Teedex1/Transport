const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Dummy data for available rides and bus locations
let rides = [
  { id: 1, from: 'Lagos', to: 'Abuja', date: '2024-05-30', time: '09:00', seats: 80 },
  { id: 2, from: 'Osogbo', to: 'Kano', date: '2024-06-01', time: '10:00', seats: 80 },
  { id: 3, from: 'Ibadan', to: 'Port Harcourt', date: '2024-06-02', time: '11:00', seats: 80 },
  { id: 4, from: 'Anambra', to: 'Lagos', date: '2024-06-03', time: '12:00', seats: 80 },
  { id: 5, from: 'Kano', to: 'Abuja', date: '2024-06-04', time: '13:00', seats: 80 },
  { id: 6, from: 'Port Harcourt', to: 'Osogbo', date: '2024-06-05', time: '14:00', seats: 80 }
];

let busLocations = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get available rides
app.get('/rides', (req, res) => {
  res.json(rides);
});

// Endpoint to book a ride
app.post('/book', (req, res) => {
  const { rideId, seats } = req.body;
  const ride = rides.find(r => r.id === parseInt(rideId));
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  if (ride.seats < seats) {
    return res.status(400).json({ error: 'Not enough seats available' });
  }
  ride.seats -= seats;
  res.json({ message: 'Booking successful', ride });
});

// Endpoint to get bus locations
app.get('/bus-locations', (req, res) => {
  res.json(busLocations);
});

// Update bus locations randomly for demo purposes
setInterval(() => {
  for (const ride of rides) {
    const busId = ride.id;
    const latitude = 6.5244 + (Math.random() - 0.5) * 0.1;
    const longitude = 3.3792 + (Math.random() - 0.5) * 0.1;
    busLocations[busId] = { latitude, longitude };
    io.emit('locationUpdate', { busId, latitude, longitude });
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
