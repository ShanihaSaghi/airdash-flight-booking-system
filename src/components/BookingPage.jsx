import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Plane,
  Users,
} from "lucide-react";
import { getFlightById } from "./api";
import Navbar from "./Navbar";

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFlight();
  }, [id]);

  async function loadFlight() {
    try {
      setLoading(true);
      setError("");

      const data = await getFlightById(id);
      setFlight(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load flight details.");
    } finally {
      setLoading(false);
    }
  }

  function formatTime(dateTime) {
    if (!dateTime) return "—";

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(dateTime) {
    if (!dateTime) return "Date unavailable";

    return new Date(dateTime).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDuration(departureTime, arrivalTime) {
    if (!departureTime || !arrivalTime) {
      return "—";
    }

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    const difference =
      arrival.getTime() - departure.getTime();

    if (difference <= 0) {
      return "—";
    }

    const totalMinutes =
      Math.floor(difference / (1000 * 60));

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  function handleContinue() {
    navigate(`/booking/${flight.id}/passenger`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading flight details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Unable to continue
          </h2>

          <p className="mt-2 text-sm text-red-500">
            {error || "Flight not found."}
          </p>

          <button
            onClick={() => navigate("/flights")}
            className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Back to flights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => navigate("/")}
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
              AIR<span className="text-sky-500">DASH</span>
            </span>
          </button>

          <button
            onClick={() => navigate("/flights")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to flights
          </button>

        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Review your flight
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            {flight.origin}
            <span className="mx-3 text-sky-400">
              →
            </span>
            {flight.destination}
          </h1>

          <p className="mt-3 text-sm font-bold text-slate-950">
            {flight.airlineName || "Airline unavailable"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Flight {flight.flightNumber}
          </p>

        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* FLIGHT DETAILS */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
                  <Plane className="h-5 w-5 text-white" />
                </div>

                <div>
                  <p className="font-bold text-slate-950">
                    {flight.airlineName || "Airline unavailable"}
                  </p>

                  <p className="text-sm text-slate-400">
                    {flight.flightNumber}
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">

              {/* ROUTE */}
              <div className="flex items-center gap-5">

                <div>
                  <p className="text-3xl font-bold text-slate-950">
                    {formatTime(flight.departureTime)}
                  </p>

                  <p className="mt-1 font-semibold text-slate-700">
                    {flight.origin}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatDate(flight.departureTime)}
                  </p>
                </div>

                <div className="flex flex-1 flex-col items-center">

                  <div className="flex w-full items-center gap-2">

                    <div className="h-px flex-1 bg-slate-200" />

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
                      <Plane className="h-5 w-5 text-white" />
                    </div>

                    <div className="h-px flex-1 bg-slate-200" />

                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock3 className="h-3 w-3" />

                    <span>
                      {formatDuration(
                        flight.departureTime,
                        flight.arrivalTime
                      )}
                    </span>

                    <span>•</span>

                    <span>Non-stop</span>
                  </div>

                </div>

                <div>
                  <p className="text-3xl font-bold text-slate-950">
                    {formatTime(flight.arrivalTime)}
                  </p>

                  <p className="mt-1 font-semibold text-slate-700">
                    {flight.destination}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatDate(flight.arrivalTime)}
                  </p>
                </div>

              </div>

              {/* INFORMATION */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <CalendarDays className="h-5 w-5 text-sky-500" />

                  <p className="mt-3 text-xs text-slate-400">
                    Departure
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatDate(flight.departureTime)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <Users className="h-5 w-5 text-sky-500" />

                  <p className="mt-3 text-xs text-slate-400">
                    Available seats
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {flight.availableSeats}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <Plane className="h-5 w-5 text-sky-500" />

                  <p className="mt-3 text-xs text-slate-400">
                    Total seats
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {flight.totalSeats}
                  </p>
                </div>

                 <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Fare
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {flight.price != null
                        ? `₹${Number(flight.price).toLocaleString("en-IN")}`
                        : "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      per passenger
                    </p>
                </div>

              </div>

            </div>
          </div>

          {/* CONTINUE CARD */}
          <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ready to book?
            </p>

            <h2 className="mt-3 text-xl font-bold text-slate-950">
              Continue your booking
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter passenger information and choose your preferred seat.
            </p>

            <div
              className={`mt-6 rounded-2xl p-4 ${
                flight.availableSeats > 0
                  ? "bg-emerald-50"
                  : "bg-red-50"
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  flight.availableSeats > 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                Availability
              </p>

              <p
                className={`mt-1 text-lg font-bold ${
                  flight.availableSeats > 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {flight.availableSeats > 0
                  ? `${flight.availableSeats} seats available`
                  : "Flight sold out"}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-sky-50 p-4">
              <div>
                <p className="text-xs font-medium text-sky-600">
                  Ticket fare
                </p>

                <p className="mt-1 text-xl font-bold text-slate-950">
                  {flight.price != null
                    ? `₹${Number(flight.price).toLocaleString("en-IN")}`
                    : "—"}
                </p>
              </div>

              <p className="text-xs text-slate-400">
                per passenger
              </p>
            </div>

            <button
              disabled={flight.availableSeats <= 0}
              onClick={handleContinue}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {flight.availableSeats > 0
                ? "Continue"
                : "Sold out"}

              {flight.availableSeats > 0 && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}

export default BookingPage;