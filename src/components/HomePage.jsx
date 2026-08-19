import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function HomePage() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const [tripType, setTripType] = useState("round");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  function searchFlights(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);

    navigate(`/flights?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">

      {/* NAVBAR */}
      <header className="absolute left-0 right-0 top-0 z-30">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

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

            <span className="text-xl font-bold tracking-tight text-white">
              AIR<span className="text-sky-300">DASH</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => navigate("/flights")}
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              Flights
            </button>

            <button
              onClick={() => navigate("/bookings")}
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              My bookings
            </button>

            <button
              onClick={() => navigate("/help")}
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              Help
            </button>
          </div>

          {localStorage.getItem("token") ? (
            <button
              onClick={logout}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-sky-50"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-sky-50"
            >
              Sign in
            </button>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.35),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.20),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-32">

            {/* HERO CONTENT */}
            <div className="max-w-3xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium text-white/80">
                Your journey starts here
                </span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Fly further.
                <br />
                <span className="text-sky-400">
                Experience more.
                </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Discover seamless flight booking with AirDash.
                Search destinations, choose your seat and manage
                your journey from one place.
            </p>

            </div>

            {/* SEARCH CARD */}
            <div className="relative z-10 mt-16 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">

            <div className="mb-5 flex gap-6 border-b border-slate-100 pb-4">

                <button
                onClick={() => setTripType("round")}
                className={`text-sm font-semibold ${
                    tripType === "round"
                    ? "text-sky-600"
                    : "text-slate-400"
                }`}
                >
                Round trip
                </button>

                <button
                onClick={() => setTripType("oneway")}
                className={`text-sm font-semibold ${
                    tripType === "oneway"
                    ? "text-sky-600"
                    : "text-slate-400"
                }`}
                >
                One way
                </button>

            </div>

            <form
                onSubmit={searchFlights}
                className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_auto]"
            >

                <SearchField
                icon={<MapPin className="h-4 w-4" />}
                label="From"
                placeholder="Chennai"
                value={from}
                onChange={setFrom}
                />

                <SearchField
                icon={<MapPin className="h-4 w-4" />}
                label="To"
                placeholder="Mumbai"
                value={to}
                onChange={setTo}
                />

                <SearchField
                icon={<CalendarDays className="h-4 w-4" />}
                label="Departure"
                type="date"
                value={date}
                onChange={setDate}
                />

                <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                <Search className="h-4 w-4" />
                Search flights
                </button>

            </form>

            </div>

        </div>
        </section>

      {/* WHY AIR DASH */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            Why AirDash
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for a smoother journey.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            From finding the right flight to managing your
            reservation, AirDash keeps your travel experience
            simple.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          <Feature
            icon={<Search className="h-5 w-5" />}
            title="Easy flight search"
            description="Find available flights quickly using your route and travel date."
          />

          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure booking"
            description="Your reservations are protected with secure authentication."
          />

          <Feature
            icon={<Ticket className="h-5 w-5" />}
            title="Manage your trip"
            description="View your bookings, seat information and reservation status."
          />

        </div>
      </section>

      {/* QUICK STATS */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-3">

          <Stat
            icon={<Plane className="h-5 w-5" />}
            value="100+"
            label="Flight options"
          />

          <Stat
            icon={<Users className="h-5 w-5" />}
            value="24/7"
            label="Booking access"
          />

          <Stat
            icon={<Clock3 className="h-5 w-5" />}
            value="Fast"
            label="Reservation process"
          />

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-lg font-bold text-white">
              AIR<span className="text-sky-400">DASH</span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Smarter journeys. Better experiences.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 AirDash. All rights reserved.
          </p>

        </div>
      </footer>
    </div>
  );
}

function SearchField({
  icon,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}) {
  return (
    <label className="rounded-2xl border border-slate-200 px-4 py-3 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
      />
    </label>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <ArrowRight className="mt-5 h-4 w-4 text-slate-300" />
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-xl font-bold text-slate-950">
          {value}
        </p>

        <p className="text-sm text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export default HomePage;