import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  CalendarDays,
  ChevronDown,
  Globe2,
  Plane,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFlights } from "./api.js";

function FlightSearch() {
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlights() {
      try {
        const data = await getFlights();
        setFlights(data);
      } catch (error) {
        console.error("Failed to load flight options:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFlights();
  }, []);

  const cities = [
    ...new Set(
      flights.flatMap((flight) => [
        flight.origin,
        flight.destination,
      ])
    ),
  ].sort((a, b) => a.localeCompare(b));

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch() {
    const params = new URLSearchParams();

    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    params.set("passengers", passengers);

    navigate(`/flights?${params.toString()}`);
  }

  return (
    <div
      id="flights"
      className="mt-12 rounded-3xl border border-white/10 bg-white p-5 shadow-2xl shadow-black/20 lg:p-6"
    >
      {/* Tabs */}
      <div className="mb-5 flex items-center gap-6 border-b border-slate-200">
        <button className="border-b-2 border-slate-950 pb-3 text-sm font-semibold text-slate-950">
          Search flights
        </button>

        <button
          onClick={() => navigate("/login")}
          className="pb-3 text-sm font-medium text-slate-400 transition hover:text-slate-700"
        >
          Manage booking
        </button>
      </div>

      {/* Search fields */}
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_1fr_1fr_auto]">
        {/* From */}
        <div className="rounded-2xl border border-slate-200 p-4 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Plane className="h-3.5 w-3.5" />
            From
          </div>

          <div className="relative">
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-slate-900 outline-none"
            >
              <option value="">Select origin</option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-0 top-0.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Swap */}
        <button
          type="button"
          onClick={handleSwap}
          className="flex h-12 w-12 items-center justify-center self-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-400 hover:text-sky-500"
          title="Swap origin and destination"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        {/* To */}
        <div className="rounded-2xl border border-slate-200 p-4 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Globe2 className="h-3.5 w-3.5" />
            To
          </div>

          <div className="relative">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-slate-900 outline-none"
            >
              <option value="">Select destination</option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-0 top-0.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Date */}
        <div className="rounded-2xl border border-slate-200 p-4 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Departure
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          />
        </div>

        {/* Passengers */}
        <div className="rounded-2xl border border-slate-200 p-4 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Users className="h-3.5 w-3.5" />
            Passengers
          </div>

          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <option key={number} value={number}>
                {number} {number === 1 ? "Passenger" : "Passengers"}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}

export default FlightSearch;