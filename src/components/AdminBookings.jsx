import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  LogOut,
  Plane,
  RefreshCw,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL, authFetch, getCurrentUser } from "./api.js";
import Navbar from "./Navbar";

function AdminBookings() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/admin`
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Unable to load bookings."
        );
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(
        err.message || "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    const query = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const flight = booking.flight;
      const passenger = booking.passenger;

      const matchesSearch =
        !query ||
        String(booking.id).includes(query) ||
        booking.seatNumber
          ?.toLowerCase()
          .includes(query) ||
        passenger?.name
          ?.toLowerCase()
          .includes(query) ||
        passenger?.email
          ?.toLowerCase()
          .includes(query) ||
        flight?.flightNumber
          ?.toLowerCase()
          .includes(query) ||
        flight?.origin
          ?.toLowerCase()
          .includes(query) ||
        flight?.destination
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "ALL" ||
        booking.status?.toUpperCase() === status;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, status]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

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
              active
              onClick={() =>
                navigate("/admin/bookings")
              }
            />

          </nav>

          {/* ADMIN PROFILE */}
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
                className="text-slate-500 transition hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 p-6 lg:p-10">

          {/* HEADER */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Booking Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor all reservations, passengers and
              flight assignments.
            </p>

            <p className="mt-3 text-sm text-slate-400">
              {bookings.length} total booking
              {bookings.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* FILTERS */}
          <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search booking, passenger, flight or route..."
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
              />

            </div>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-sky-400"
            >
              <option value="ALL">
                All statuses
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

            <button
              onClick={loadBookings}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* TABLE */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {loading ? (
              <div className="p-12 text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading bookings...
                </p>

              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center">

                <Ticket className="mx-auto h-9 w-9 text-slate-300" />

                <p className="mt-4 font-semibold text-slate-700">
                  No bookings found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Try changing your search or status
                  filter.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Booking
                      </th>

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
                        Booked
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredBookings.map((booking) => {

                      const flight = booking.flight;
                      const passenger = booking.passenger;

                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-slate-100 last:border-0"
                        >

                          {/* BOOKING */}
                          <td className="px-6 py-5">

                            <p className="font-bold text-slate-950">
                              AD-
                              {String(booking.id).padStart(
                                6,
                                "0"
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              #{booking.id}
                            </p>

                          </td>

                          {/* PASSENGER */}
                          <td className="px-6 py-5">

                            <p className="font-semibold text-slate-800">
                              {passenger?.name || "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {passenger?.email || "—"}
                            </p>

                          </td>

                          {/* FLIGHT */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2">

                              <Plane className="h-4 w-4 text-sky-500" />

                              <div>

                                <p className="font-semibold text-slate-800">
                                  {flight?.flightNumber || "—"}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {flight?.origin || "—"} →{" "}
                                  {flight?.destination || "—"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* SEAT */}
                          <td className="px-6 py-5">

                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                              {booking.seatNumber || "—"}
                            </span>

                          </td>

                          {/* DATE */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-sm text-slate-600">

                              <CalendarDays className="h-4 w-4 text-slate-400" />

                              {booking.bookingDate
                                ? new Date(
                                    booking.bookingDate
                                  ).toLocaleDateString()
                                : "—"}

                            </div>

                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-5">
                            <StatusBadge
                              status={booking.status}
                            />
                          </td>

                        </tr>
                      );
                    })}

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

function StatusBadge({ status }) {
  const normalized = status?.toUpperCase();

  if (normalized === "CANCELLED") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        Cancelled
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
      Confirmed
    </span>
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

export default AdminBookings;