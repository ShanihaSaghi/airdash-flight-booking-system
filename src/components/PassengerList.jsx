import { useState, useEffect } from 'react';
import { authFetch } from '../api';

function PassengerList() {
  const [passengers, setPassengers] = useState([]);
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editPassenger, setEditPassenger] = useState({});

  useEffect(() => {
    fetchPassengers();
  }, []);

  function fetchPassengers() {
    authFetch('http://localhost:8080/api/passengers')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch passengers');
        return response.json();
      })
      .then((data) => setPassengers(data))
      .catch((err) => console.error(err));
  }
  
  function handleChange(event) {
    const { name, value } = event.target;
    setNewPassenger((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    authFetch('http://localhost:8080/api/passengers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPassenger),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to create passenger');
        return response.json();
      })
      .then(() => {
        fetchPassengers();
        setNewPassenger({ name: '', email: '', phoneNumber: '' });
      })
      .catch((err) => console.error(err));
  }

  function handleDelete(id) {
    authFetch(`http://localhost:8080/api/passengers/${id}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to delete passenger');
        fetchPassengers();
      })
      .catch((err) => console.error(err));
  }

  function startEdit(passenger) {
    setEditingId(passenger.id);
    setEditPassenger(passenger);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditPassenger((prev) => ({ ...prev, [name]: value }));
  }

  function handleUpdate(id) {
    authFetch(`http://localhost:8080/api/passengers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPassenger),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to update passenger');
        return response.json();
      })
      .then(() => {
        fetchPassengers();
        setEditingId(null);
      })
      .catch((err) => console.error(err));
  }

  return (
    <div className="section">
      <h2>Passengers</h2>
      <ul className="item-list">
        {passengers.map((passenger) =>
          editingId === passenger.id ? (
            <li key={passenger.id} className="item-row">
              <input name="name" value={editPassenger.name} onChange={handleEditChange} />
              <input name="email" value={editPassenger.email} onChange={handleEditChange} />
              <input name="phoneNumber" value={editPassenger.phoneNumber} onChange={handleEditChange} />
              <div className="item-actions">
                <button onClick={() => handleUpdate(passenger.id)}>Save</button>
                <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </li>
          ) : (
            <li key={passenger.id} className="item-row">
              <div className="item-details">
                <span className="primary">{passenger.name}</span>
                <span className="secondary">{passenger.email} · {passenger.phoneNumber}</span>
              </div>
              <div className="item-actions">
                <button className="btn-secondary" onClick={() => startEdit(passenger)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(passenger.id)}>Delete</button>
              </div>
            </li>
          )
        )}
      </ul>

      <form className="add-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={newPassenger.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={newPassenger.email} onChange={handleChange} />
        <input name="phoneNumber" placeholder="Phone Number" value={newPassenger.phoneNumber} onChange={handleChange} />
        <button type="submit">Add Passenger</button>
      </form>
    </div>
  );
}

export default PassengerList;