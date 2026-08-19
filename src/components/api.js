export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

export function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}

export function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      username: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getFlights() {
  const response = await fetch(`${API_BASE_URL}/api/flights`);

  if (!response.ok) {
    throw new Error("Failed to fetch flights");
  }

  return response.json();
}

export async function getFlightById(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/flights/${id}`
  );

  if (!response.ok) {
    throw new Error("Flight not found");
  }

  return response.json();
}

export async function createPassenger(passengerData) {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  const response = await fetch(
    `${API_BASE_URL}/api/passengers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passengerData),
    }
  );

  console.log("Passenger response:", response.status);

  if (!response.ok) {
    const message = await response.text();
    console.error("Passenger API error:", message);
    throw new Error(message || "Failed to create passenger");
  }

  return response.json();
}

export async function createBooking(
  flightId,
  passengerId,
  seatNumber
) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    flightId: String(flightId),
    passengerId: String(passengerId),
    seatNumber: seatNumber,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/bookings?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create booking");
  }

  return response.json();
}

export async function createMultipleBookings(
  flightId,
  passengers
) {
  const response = await authFetch(
    `${API_BASE_URL}/api/bookings/multiple`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flightId: Number(flightId),
        passengers,
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to create bookings"
    );
  }

  return response.json();
}
