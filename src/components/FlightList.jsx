import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Plane,
  Search,
  Users,
} from "lucide-react";
import { authFetch, getFlights } from "./api";
import Navbar from "./Navbar";
import FlightRecommendation from "./FlightRecommendation";

function FlightList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    loadFlights();
  }, [from, to, date, sortBy]);

  async function loadFlights() {
    try {
      setLoading(true);
      setError("");

      const data = await getFlights();

      let filteredFlights = data;

      // Filter by origin
      if (from.trim()) {
        filteredFlights = filteredFlights.filter(
          (flight) =>
            flight.origin?.toLowerCase() ===
            from.trim().toLowerCase()
        );
      }

      // Filter by destination
      if (to.trim()) {
        filteredFlights = filteredFlights.filter(
          (flight) =>
            flight.destination?.toLowerCase() ===
            to.trim().toLowerCase()
        );
      }

      // Filter by departure date
      if (date) {
        filteredFlights = filteredFlights.filter((flight) => {
          if (!flight.departureTime) {
            return false;
          }

          return flight.departureTime.startsWith(date);
        });
      }

      if (sortBy === "price-low") {
        filteredFlights.sort(
          (a, b) => Number(a.price || 0) - Number(b.price || 0)
        );
      }

      if (sortBy === "price-high") {
        filteredFlights.sort(
          (a, b) => Number(b.price || 0) - Number(a.price || 0)
        );
      }

      if (sortBy === "departure") {
        filteredFlights.sort(
          (a, b) =>
            new Date(a.departureTime) -
            new Date(b.departureTime)
        );
      }

      if (sortBy === "seats") {
        filteredFlights.sort(
          (a, b) =>
            Number(b.availableSeats || 0) -
            Number(a.availableSeats || 0)
        );
      }

      setFlights(filteredFlights);
    } catch (err) {
      console.error(err);
      setError("Unable to load flights. Please try again.");
    } finally {
      setLoading(false);
    }
  } 

  function formatTime(dateTime) {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(dateTime) {
    if (!dateTime) {
      return "Date unavailable";
    }

    return new Date(dateTime).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function calculateDuration(departure, arrival) {
    if (!departure || !arrival) {
      return "Duration unavailable";
    }

    const start = new Date(departure);
    const end = new Date(arrival);

    const difference = end - start;

    if (difference <= 0) {
      return "Duration unavailable";
    }

    const totalMinutes = Math.floor(difference / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  }

  function handleSelectFlight(flight) {
    navigate(`/flights/${flight.id}`);
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

            <span className="text-xl font-bold tracking-tight text-slate-950">
              AIR<span className="text-sky-500">DASH</span>
            </span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </button>

        </div>
      </header>

      {/* HERO / SEARCH SUMMARY */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Available flights
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">

            {from || "All origins"}

            <span className="mx-3 text-sky-400">
              →
            </span>

            {to || "All destinations"}

          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">

            {date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />

                {new Date(`${date}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </div>
            )}

            <span>
              {flights.length} flight
              {flights.length !== 1 ? "s" : ""} available
            </span>

          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {flights.length} flight{flights.length !== 1 ? "s" : ""} found
          </p>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
          >
            <option value="default">
              Sort by
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="departure">
              Earliest Departure
            </option>

            <option value="seats">
              Most Seats Available
            </option>
          </select>
        </div>

        <FlightRecommendation
          flights={flights}
          onSelect={(flight) => {
            navigate(`/flights/${flight.id}`);
          }}
        />

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              onClick={loadFlights}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

            <p className="mt-5 text-sm font-medium text-slate-500">
              Finding available flights...
            </p>

          </div>
        )}

        {/* NO RESULTS */}
        {!loading && !error && flights.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <Search className="h-7 w-7 text-sky-500" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-950">
              No flights found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find a flight matching your search.
              Try another route or travel date.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Search again
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* FLIGHT RESULTS */}
        {!loading && !error && flights.length > 0 && (
          <div className="space-y-5">

            {flights.map((flight) => {

              const availableSeats = Number(
                flight.availableSeats || 0
              );

              const flightSoldOut = availableSeats <= 0;

              return(
                <article
                  key={flight.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
                >

                  {/* TOP */}
                  <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">

                    {/* AIRLINE */}
                    <div className="flex items-center gap-3 lg:w-44">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950">
                        <Plane className="h-5 w-5 text-white" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-950">
                          {flight.airlineName || "Airline unavailable"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {flight.flightNumber}
                        </p>
                      </div>

                    </div>

                    {/* TIMES */}
                    <div className="flex flex-1 items-center gap-4">

                      {/* DEPARTURE */}
                      <div className="min-w-[90px]">
                        <p className="text-2xl font-bold text-slate-950">
                          {formatTime(flight.departureTime)}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {flight.origin}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(flight.departureTime)}
                        </p>
                      </div>

                      {/* LINE */}
                      <div className="flex flex-1 flex-col items-center">

                        <div className="flex w-full items-center gap-2">

                          <div className="h-px flex-1 bg-slate-200" />

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50">
                            <Plane className="h-4 w-4 rotate-90 text-sky-500" />
                          </div>

                          <div className="h-px flex-1 bg-slate-200" />

                        </div>

                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <Clock3 className="h-3 w-3" />

                          {calculateDuration(
                            flight.departureTime,
                            flight.arrivalTime
                          )}
                        </div>

                      </div>

                      {/* ARRIVAL */}
                      <div className="min-w-[90px]">
                        <p className="text-2xl font-bold text-slate-950">
                          {formatTime(flight.arrivalTime)}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {flight.destination}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(flight.arrivalTime)}
                        </p>
                      </div>

                    </div>

                    {/* SELECT */}
                    <div className="lg:w-36">

                      <div className="mb-3 text-right">

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Fare
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {flight.price != null
                            ? `₹${Number(flight.price).toLocaleString("en-IN")}`
                            : "—"}
                        </p>

                        <p className="text-xs text-slate-400">
                          per passenger
                        </p>

                      </div>

                      <button
                        disabled={flightSoldOut}
                        onClick={() => handleSelectFlight(flight)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {flightSoldOut ? "Sold out" : "Select"}

                        {!flightSoldOut && (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* BOTTOM INFO */}
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users className="h-4 w-4 text-slate-400" />

                      {availableSeats} seats available
                    </div>

                    <div className="text-xs text-slate-400">
                      Non-stop
                    </div>

                    <div className="text-xs text-slate-400">
                      Flight {flight.flightNumber}
                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
}

export default FlightList;