import { useState, useEffect } from 'react';
import { authFetch } from '../api';
import { API_BASE_URL } from "./api";

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [newBooking, setNewBooking] = useState({
    flightId: '',
    passengerId: '',
    seatNumber: '',
  });

  useEffect(() => {
    fetchBookings();
    fetchFlights();
    fetchPassengers();
  }, []);

  function fetchBookings() {
    authFetch('${API_BASE_URL}/api/bookings')
        .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return response.json();
        })
        .then((data) => setBookings(data))
        .catch((err) => console.error(err));
  }

  function fetchFlights() {
    authFetch('${API_BASE_URL}/api/flights')
        .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch flights');
        return response.json();
        })
        .then((data) => setFlights(data))
        .catch((err) => console.error(err));
  }

  function fetchPassengers() {
    authFetch('${API_BASE_URL}/api/passengers')
        .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch passengers');
        return response.json();
        })
        .then((data) => setPassengers(data))
        .catch((err) => console.error(err));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setNewBooking((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const url = `${API_BASE_URL}/api/bookings?flightId=${newBooking.flightId}&passengerId=${newBooking.passengerId}&seatNumber=${newBooking.seatNumber}`;

    authFetch(url, { method: 'POST' })
        .then((response) => {
        if (!response.ok) throw new Error('Failed to create booking');
        return response.json();
        })
        .then(() => {
        fetchBookings();
        fetchFlights();
        setNewBooking({ flightId: '', passengerId: '', seatNumber: '' });
        })
        .catch((err) => console.error(err));
  }

    function handleCancel(id) {
        authFetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, { method: 'PUT' })
            .then((response) => {
            if (!response.ok) throw new Error('Failed to cancel booking');
            return response.json();
            })
            .then(() => {
            fetchBookings();
            fetchFlights();
            })
            .catch((err) => console.error(err));
    }

  return (
    <div className="section">
        <h2>Bookings</h2>
        <ul className="item-list">
        {bookings.map((booking) => (
            <li key={booking.id} className="item-row">
            <div className="item-details">
                <span className="primary">
                {booking.flight.flightNumber} — {booking.passenger.name}
                </span>
                <span className="secondary">Seat {booking.seatNumber}</span>
            </div>
            <div className="item-actions">
                <span className={`status-badge ${booking.status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled'}`}>
                {booking.status}
                </span>
                {booking.status === 'CONFIRMED' && (
                <button className="btn-danger" onClick={() => handleCancel(booking.id)}>Cancel</button>
                )}
            </div>
            </li>
        ))}
        </ul>

        <form className="add-form" onSubmit={handleSubmit}>
        <select name="flightId" value={newBooking.flightId} onChange={handleChange} required>
            <option value="">Select Flight</option>
            {flights.map((flight) => (
            <option key={flight.id} value={flight.id}>
                {flight.flightNumber} — {flight.origin} to {flight.destination} ({flight.availableSeats} seats left)
            </option>
            ))}
        </select>
        <select name="passengerId" value={newBooking.passengerId} onChange={handleChange} required>
            <option value="">Select Passenger</option>
            {passengers.map((passenger) => (
            <option key={passenger.id} value={passenger.id}>{passenger.name}</option>
            ))}
        </select>
        <input name="seatNumber" placeholder="Seat Number" value={newBooking.seatNumber} onChange={handleChange} />
        <button type="submit">Create Booking</button>
        </form>
    </div>
    );
}

export default BookingList;