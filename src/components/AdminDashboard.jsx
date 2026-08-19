import { useEffect, useState } from "react";
import {
  CalendarDays,
  LogOut,
  Plane,
  Plus,
  Ticket,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  API_BASE_URL,
  authFetch,
  getCurrentUser,
} from "./api.js";

import Navbar from "./Navbar";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [flightResponse, passengerResponse, bookingResponse] =
        await Promise.all([
          authFetch(`${API_BASE_URL}/api/flights`),
          authFetch(`${API_BASE_URL}/api/passengers`),
          authFetch(`${API_BASE_URL}/api/bookings`),
        ]);

      if (!flightResponse.ok) {
        throw new Error("Unable to load flights.");
      }

      if (!passengerResponse.ok) {
        throw new Error("Unable to load passengers.");
      }

      if (!bookingResponse.ok) {
        throw new Error("Unable to load bookings.");
      }

      const flightData = await flightResponse.json();
      const passengerData = await passengerResponse.json();
      const bookingData = await bookingResponse.json();

      setFlights(flightData);
      setPassengers(passengerData);
      setBookings(bookingData);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const totalFlights = flights.length;

  const totalPassengers = passengers.length;

  const totalBookings = bookings.length;

  const availableSeats = flights.reduce(
    (total, flight) =>
      total + Number(flight.availableSeats || 0),
    0
  );

  const totalSeats = flights.reduce(
    (total, flight) =>
      total + Number(flight.totalSeats || 0),
    0
  );

  const bookedSeats = Math.max(
    0,
    totalSeats - availableSeats
  );

  const occupancyRate =
    totalSeats > 0
      ? Math.round(
          (bookedSeats / totalSeats) * 100
        )
      : 0;

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED"
  );

  const flightBookingCounts = flights
    .map((flight) => {

      const count =
        confirmedBookings.filter(
          (booking) =>
            booking.flight?.id === flight.id
        ).length;

      return {
        ...flight,
        bookingCount: count,
      };
    })
    .sort(
      (a, b) =>
        b.bookingCount - a.bookingCount
    );

  const popularFlights =
    flightBookingCounts.slice(0, 5);

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.bookingDate) -
        new Date(a.bookingDate)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex min-h-[calc(100vh-73px)]">

        {/* SIDEBAR */}
        <aside className="hidden w-64 flex-col bg-slate-950 text-white lg:flex">

          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500">
              <Plane className="h-5 w-5" />
            </div>

            <div className="ml-3">
              <p className="text-lg font-bold">
                AIR<span className="text-sky-400">DASH</span>
              </p>

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Administration
              </p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Overview
            </p>

            <SidebarButton
              icon={
                <Plane className="h-4 w-4" />
              }
              label="Dashboard"
              active
              onClick={() => navigate("/admin")}
            />

            <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Management
            </p>

            <SidebarButton
              icon={
                <Plane className="h-4 w-4" />
              }
              label="Flights"
              onClick={() =>
                navigate("/admin/flights")
              }
            />

            <SidebarButton
              icon={
                <Users className="h-4 w-4" />
              }
              label="Passengers"
              onClick={() =>
                navigate("/admin/passengers")
              }
            />

            <SidebarButton
              icon={
                <Ticket className="h-4 w-4" />
              }
              label="Bookings"
              onClick={() =>
                navigate("/admin/bookings")
              }
            />
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-bold">
                A
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  Administrator
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.username || "Admin"}
                </p>
              </div>

              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 p-6 lg:p-10">

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user?.username || "Admin"}.
              Here's what's happening with AIRDASH.
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<Plane className="h-5 w-5" />}
              label="Total Flights"
              value={loading ? "—" : totalFlights}
            />

            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Passengers"
              value={loading ? "—" : totalPassengers}
            />

            <StatCard
              icon={<Ticket className="h-5 w-5" />}
              label="Bookings"
              value={loading ? "—" : totalBookings}
            />

            <StatCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Seat Occupancy"
              value={
                loading
                  ? "—"
                  : `${occupancyRate}%`
              }
            />

          </div>

          {/* ANALYTICS */}
          <section className="mt-8 grid gap-6 xl:grid-cols-2">

            {/* OVERALL OCCUPANCY */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-950">
                    Seat occupancy
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Overall flight capacity usage.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-950">
                    {loading
                      ? "—"
                      : `${occupancyRate}%`}
                  </p>

                  <p className="text-xs text-slate-400">
                    occupied
                  </p>
                </div>

              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-700"
                  style={{
                    width: `${occupancyRate}%`,
                  }}
                />

              </div>

              <div className="mt-4 flex justify-between text-xs text-slate-400">

                <span>
                  {bookedSeats} booked
                </span>

                <span>
                  {availableSeats} available
                </span>

              </div>

            </div>


            {/* POPULAR FLIGHTS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6">

              <div>
                <h2 className="font-bold text-slate-950">
                  Popular flights
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Flights with the most confirmed bookings.
                </p>
              </div>

              <div className="mt-5 space-y-4">

                {loading ? (

                  <p className="text-sm text-slate-400">
                    Loading analytics...
                  </p>

                ) : popularFlights.length === 0 ? (

                  <p className="text-sm text-slate-400">
                    No booking data yet.
                  </p>

                ) : (

                  popularFlights.map((flight) => {

                    const percentage =
                      flight.totalSeats > 0
                        ? Math.round(
                            ((flight.totalSeats -
                              flight.availableSeats) /
                              flight.totalSeats) *
                              100
                          )
                        : 0;

                    return (
                      <div key={flight.id}>

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="font-semibold text-slate-800">
                              {flight.flightNumber}
                            </p>

                            <p className="text-xs text-slate-400">
                              {flight.origin}
                              {" → "}
                              {flight.destination}
                            </p>

                          </div>

                          <p className="text-sm font-bold text-slate-700">
                            {flight.bookingCount} bookings
                          </p>

                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-sky-400"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  })

                )}

              </div>

            </div>

          </section>

          {/* QUICK ACTIONS */}
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-950">
                  Quick actions
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your airline operations.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              <QuickAction
                icon={<Plus className="h-5 w-5" />}
                title="Add Flight"
                description="Create a new flight"
                onClick={() =>
                  navigate("/admin/flights")
                }
              />

              <QuickAction
                icon={<Users className="h-5 w-5" />}
                title="Passengers"
                description="View passengers"
                onClick={() =>
                  navigate("/admin/passengers")
                }
              />

              <QuickAction
                icon={<Ticket className="h-5 w-5" />}
                title="Bookings"
                description="View all bookings"
                onClick={() =>
                  navigate("/admin/bookings")
                }
              />

            </div>
          </section>

          {/* RECENT BOOKINGS */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="font-bold text-slate-950">
                  Recent bookings
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Latest booking activity.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/admin/bookings")
                }
                className="text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                View all
              </button>

            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Loading dashboard...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No bookings yet.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Passenger
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Flight
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Seat
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-slate-100 last:border-0"
                      >

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-700">
                            {booking.passenger?.name || "—"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {booking.passenger?.email || ""}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {booking.flight?.flightNumber || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {booking.seatNumber || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              booking.status === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        {description}
      </p>

    </button>
  );
}

function SidebarButton({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-sky-500 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default AdminDashboard;