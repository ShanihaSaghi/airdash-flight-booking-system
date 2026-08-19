import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  Phone,
  Plane,
  Plus,
  Trash2,
  User,
} from "lucide-react";

import {
  authFetch,
} from "./api";
import { API_BASE_URL } from "./api";

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  const [passengers, setPassengers] = useState([
    {
      name: "",
      email: "",
      phoneNumber: "",
      seatNumber: "",
    },
  ]);
  const [activePassenger, setActivePassenger] = useState(0);

  const [loadingFlight, setLoadingFlight] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Load flight
  // -----------------------------
  useEffect(() => {
    async function loadFlight() {
      try {
        setLoadingFlight(true);

        const response = await fetch(
          `${API_BASE_URL}/api/flights/${id}`
        );

        if (!response.ok) {
          throw new Error("Unable to load flight.");
        }

        const data = await response.json();
        setFlight(data);
      } catch (err) {
        console.error("Flight loading error:", err);
        setError(
          err.message || "Unable to load flight."
        );
      } finally {
        setLoadingFlight(false);
      }
    }

    if (id) {
      loadFlight();
    }
  }, [id]);

  // -----------------------------
  // Load booked seats
  // -----------------------------
  useEffect(() => {
    async function loadBookedSeats() {
      try {
        setLoadingSeats(true);
        setError("");

        const response = await authFetch(
          `${API_BASE_URL}/api/bookings/flight/${id}/seats`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load seat availability."
          );
        }

        const data = await response.json();
        setBookedSeats(data);
      } catch (err) {
        console.error("Seat loading error:", err);

        setError(
          err.message ||
            "Unable to load seat availability."
        );
      } finally {
        setLoadingSeats(false);
      }
    }

    if (id) {
      loadBookedSeats();
    }
  }, [id]);

  // -----------------------------
  // Passenger helpers
  // -----------------------------
  function addPassenger() {
    if (passengers.length >= Number(flight?.availableSeats || 0)) {
      setError(
        "There are not enough available seats for another passenger."
      );
      return;
    }

    setPassengers((current) => [
      ...current,
      {
        name: "",
        email: "",
        phoneNumber: "",
        seatNumber: "",
      },
    ]);

    setError("");
  }

  function removePassenger(index) {
    if (passengers.length === 1) {
      return;
    }

    setPassengers((current) =>
      current.filter((_, passengerIndex) => passengerIndex !== index)
    );

    setError("");
  }

  function updatePassenger(index, field, value) {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger
      )
    );

    setError("");
  }

  // -----------------------------
  // Seat selection
  // -----------------------------
  function selectSeat(passengerIndex, seat) {
    if (bookedSeats.includes(seat)) {
      setError(`Seat ${seat} is already booked.`);
      return;
    }

    const selectedByAnotherPassenger = passengers.some(
      (passenger, index) =>
        index !== passengerIndex &&
        passenger.seatNumber === seat
    );

    if (selectedByAnotherPassenger) {
      setError(
        `Seat ${seat} is already selected by another passenger.`
      );
      return;
    }

    updatePassenger(
      passengerIndex,
      "seatNumber",
      seat
    );

    setError("");
  }

  function getRecommendedSeat() {

    const availableSeats =
      seats.filter(
        (seat) => !bookedSeats.includes(seat)
      );

    if (availableSeats.length === 0) {
      return null;
    }

    // Prefer window seats
    const windowSeats =
      availableSeats.filter(
        (seat) =>
          seat.endsWith("A") ||
          seat.endsWith("F")
      );

    if (windowSeats.length > 0) {
      return windowSeats[0];
    }

    return availableSeats[0];
  }

  // -----------------------------
  // Submit booking
  // -----------------------------
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before making a booking.");
      return;
    }

    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];

      if (!passenger.name.trim()) {
        setError(
          `Please enter the name for Passenger ${i + 1}.`
        );
        return;
      }

      if (!passenger.email.trim()) {
        setError(
          `Please enter the email for Passenger ${i + 1}.`
        );
        return;
      }

      if (!passenger.phoneNumber.trim()) {
        setError(
          `Please enter the phone number for Passenger ${i + 1}.`
        );
        return;
      }

      if (!passenger.seatNumber) {
        setError(
          `Please select a seat for Passenger ${i + 1}.`
        );
        return;
      }
    }

    // Check duplicate seats
    const selectedSeats = passengers.map(
      (passenger) => passenger.seatNumber
    );

    const uniqueSeats = new Set(selectedSeats);

    if (uniqueSeats.size !== selectedSeats.length) {
      setError(
        "Each passenger must have a different seat."
      );
      return;
    }

    // Check seats already booked
    const unavailableSeat = selectedSeats.find(
      (seat) => bookedSeats.includes(seat)
    );

    if (unavailableSeat) {
      setError(
        `Seat ${unavailableSeat} is already booked. Please choose another seat.`
      );
      return;
    }

    try {
      setSubmitting(true);

      // IMPORTANT:
      // Do NOT create the booking yet.
      // Go to payment first.

      navigate("/payment", {
        state: {
          flight,
          passengers,
        },
      });

    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err.message ||
        "Unable to continue to payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------
  // Seat layout
  // -----------------------------
  const totalSeats = Number(
    flight?.totalSeats || 0
  );

  const seatLetters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
  ];

  const seats = Array.from(
    { length: totalSeats },
    (_, index) => {
      const row = Math.floor(index / 6) + 1;
      const column = index % 6;

      return `${row}${seatLetters[column]}`;
    }
  );

  const recommendedSeat = getRecommendedSeat();

  // -----------------------------
  // Loading
  // -----------------------------
  if (loadingFlight) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-500" />
          <p className="mt-3 text-sm text-slate-500">
            Loading flight...
          </p>
        </div>
      </div>
    );
  }

  const ticketPrice = Number(flight?.price || 0);

  const passengerCount = passengers.length;

  const totalPrice =
    ticketPrice * passengerCount;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() =>
              navigate(`/flights/${id}`)
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <img
                src="/airdash-icon.png"
                alt="AIRDash"
                className="h-10 w-10 object-contain"
              />
            </div>

            <span className="text-xl font-bold text-slate-950">
              AIR
              <span className="text-sky-500">
                DASH
              </span>
            </span>
          </button>

          <button
            onClick={() =>
              navigate(`/flights/${id}`)
            }
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to flight
          </button>

        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Passenger details
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Who's travelling?
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Add all passengers travelling on this booking
            and choose a seat for each passenger.
          </p>

        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-6 py-10">

        <form onSubmit={handleSubmit}>

          {/* FLIGHT SUMMARY */}
          {flight && (
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
                Your flight
              </p>

              <div className="mt-4 flex items-center gap-4">

                <div>
                  <p className="text-2xl font-bold text-slate-950">
                    {flight.origin}
                  </p>
                </div>

                <Plane className="h-5 w-5 text-sky-500" />

                <div>
                  <p className="text-2xl font-bold text-slate-950">
                    {flight.destination}
                  </p>
                </div>

              </div>

              <p className="mt-3 text-sm text-slate-500">
                Flight {flight.flightNumber}
              </p>

              <div className="mt-4 flex gap-3">

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {passengers.length}{" "}
                  {passengers.length === 1
                    ? "Passenger"
                    : "Passengers"}
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                  {flight.availableSeats} seats available
                </span>

              </div>

            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* LEFT SIDE */}
            <div className="space-y-6">

              {/* PASSENGERS */}
              {passengers.map(
                (passenger, index) => (
                  <div
                    key={index}
                    onClick={() => setActivePassenger(index)}
                    className={`rounded-3xl border p-6 shadow-sm cursor-pointer transition ${
                      activePassenger === index
                        ? "border-sky-500 bg-sky-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
                          Passenger {index + 1}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-950">
                          Passenger information
                        </h2>
                      </div>

                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePassenger(index);

                            if (activePassenger >= passengers.length - 1) {
                              setActivePassenger(
                                Math.max(0, passengers.length - 2)
                              );
                            }
                          }}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      )}

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter the details exactly as they
                      appear on the passenger's ID.
                    </p>

                    {/* NAME */}
                    <div className="mt-7">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full name
                      </label>

                      <div className="relative">

                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Enter passenger name"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}
                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email address
                      </label>

                      <div className="relative">

                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />

                      </div>

                    </div>

                    {/* PHONE */}
                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone number
                      </label>

                      <div className="relative">

                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="tel"
                          value={passenger.phoneNumber}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              "phoneNumber",
                              e.target.value
                            )
                          }
                          placeholder="Enter phone number"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />

                      </div>

                    </div>

                    {/* SELECTED SEAT */}
                    <div className="mt-5 rounded-xl bg-sky-50 p-4">

                      <p className="text-xs font-medium text-sky-600">
                        Selected seat
                      </p>

                      <p className="mt-1 text-lg font-bold text-sky-700">
                        {passenger.seatNumber ||
                          "No seat selected"}
                      </p>

                    </div>

                  </div>
                )
              )}

              {/* ADD PASSENGER */}
              <button
                type="button"
                onClick={addPassenger}
                disabled={
                  passengers.length >=
                  Number(flight?.availableSeats || 0)
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-600 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add another passenger
              </button>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}

            </div>

            {/* RIGHT SIDE */}
            <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">

              <h2 className="text-xl font-bold text-slate-950">
                Choose seats
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select one different seat for each passenger.
              </p>

              {/* PASSENGER SEAT STATUS */}
              <div className="mt-5 space-y-2">

                {passengers.map(
                  (passenger, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >

                      <span className="text-sm font-semibold text-slate-700">
                        Passenger {index + 1}
                      </span>

                      <span className="text-sm font-bold text-sky-600">
                        {passenger.seatNumber ||
                          "Select seat"}
                      </span>

                    </div>
                  )
                )}

              </div>

              {/* LEGEND */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">

                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-300 bg-white" />
                  Available
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-slate-950" />
                  Selected
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-400" />
                  Booked
                </div>

              </div>

              {/* SMART SEAT RECOMMENDATION */}
              {recommendedSeat && (
                <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
                        ✨ Airdash recommendation
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-950">
                        Seat {recommendedSeat}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Recommended available window seat.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        selectSeat(
                          activePassenger,
                          recommendedSeat
                        );
                      }}
                      className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                    >
                      Choose {recommendedSeat}
                    </button>

                  </div>

                </div>
              )}

              {/* SEAT MAP */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                <div className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <Plane className="h-4 w-4" />
                  Front of aircraft
                </div>

                {loadingSeats ? (
                  <div className="flex flex-col items-center justify-center py-10">

                    <Loader2 className="h-6 w-6 animate-spin text-sky-500" />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading seats...
                    </p>

                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2">

                    {seats.map((seat) => {

                      const isBooked =
                        bookedSeats.includes(
                          seat
                        );

                      const selectedBy =
                        passengers.findIndex(
                          (passenger) =>
                            passenger.seatNumber ===
                            seat
                        );

                      const isSelected =
                        selectedBy !== -1;

                      return (
                        <button
                          type="button"
                          key={seat}
                          disabled={isBooked}
                          onClick={() => {
                            if (isBooked) {
                              return;
                            }

                            // If this seat belongs to the active passenger,
                            // clicking it again removes the selection.
                            if (
                              isSelected &&
                              selectedBy === activePassenger
                            ) {
                              updatePassenger(
                                activePassenger,
                                "seatNumber",
                                ""
                              );

                              setError("");
                              return;
                            }

                            // If another passenger already has this seat,
                            // don't allow it.
                            if (
                              isSelected &&
                              selectedBy !== activePassenger
                            ) {
                              setError(
                                `Seat ${seat} is already selected by another passenger.`
                              );
                              return;
                            }

                            // Select/change the active passenger's seat.
                            updatePassenger(
                              activePassenger,
                              "seatNumber",
                              seat
                            );

                            setError("");
                          }}
                          className={`relative rounded-lg border py-2.5 text-xs font-semibold transition ${
                            isBooked
                              ? "cursor-not-allowed border-red-200 bg-red-400 text-white"
                              : isSelected
                                ? "border-slate-950 bg-slate-950 text-white shadow-md"
                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600"
                          }`}
                          title={
                            isBooked
                              ? `${seat} is already booked`
                              : isSelected
                                ? `${seat} is selected`
                                : `Select seat ${seat}`
                          }
                        >
                          {isBooked ? (
                            "Booked"
                          ) : isSelected ? (
                            <span className="flex items-center justify-center gap-1">
                              <Check className="h-3.5 w-3.5" />
                              {seat}
                            </span>
                          ) : (
                            seat
                          )}
                        </button>
                      );
                    })}

                  </div>
                )}

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Seat selection
                  </p>

                  <div className="mt-3 space-y-2">
                    {passengers.map((passenger, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-600">
                          Passenger {index + 1}
                        </span>

                        <span className="font-bold text-sky-600">
                          {passenger.seatNumber || "Not selected"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="my-4 border-t border-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Ticket price
                  </span>

                  <span className="font-semibold text-slate-900">
                    ₹{ticketPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Passengers
                  </span>

                  <span className="font-semibold text-slate-900">
                    × {passengerCount}
                  </span>
                </div>

                <div className="my-4 border-t border-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-950">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-sky-600">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* CONFIRM */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingSeats
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming booking...
                  </>
                ) : (
                  <>
                    Confirm booking
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
}

export default BookingForm;