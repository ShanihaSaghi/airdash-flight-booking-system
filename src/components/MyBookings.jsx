import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plane,
  Ticket,
  XCircle,
} from "lucide-react";
import Navbar from "./Navbar";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const BOOKINGS_PER_PAGE = 5;

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/bookings/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(booking) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel this booking?\n\n` +
      `PNR: ${booking.pnr || "Not available"}\n` +
      `Flight: ${booking.flight?.flightNumber || "—"}\n` +
      `Seat: ${booking.seatNumber || "—"}\n\n` +
      `The seat will become available again.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/bookings/${booking.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to cancel booking");
      }

      const cancelledBooking = await response.json();

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === cancelledBooking.id
            ? cancelledBooking
            : booking
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to cancel booking.");
    }
  }

  function formatDate(dateTime) {
    if (!dateTime) return "—";

    return new Date(dateTime).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(dateTime) {
    if (!dateTime) return "—";

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDuration(departureTime, arrivalTime) {
    if (!departureTime || !arrivalTime) {
      return "—";
    }

    const difference =
      new Date(arrivalTime).getTime() -
      new Date(departureTime).getTime();

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

  function getStatusClass(status) {
    if (status === "CONFIRMED") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "CANCELLED") {
      return "bg-red-50 text-red-600";
    }

    return "bg-slate-100 text-slate-600";
  }

  function groupBookingsByPnr(bookings) {
    return Object.values(
      bookings.reduce((groups, booking) => {
        const key =
          booking.pnr || `booking-${booking.id}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(booking);

        return groups;
      }, {})
    );
  }

  const groupedBookings = groupBookingsByPnr(bookings);

  const filteredBookings = groupedBookings.filter((group) => {
    const booking = group[0];
    const flight = booking.flight;

    const search = searchTerm.toLowerCase().trim();

    const allConfirmed = group.every(
      (item) => item.status === "CONFIRMED"
    );

    const allCancelled = group.every(
      (item) => item.status === "CANCELLED"
    );

    const groupStatus = allConfirmed
      ? "CONFIRMED"
      : allCancelled
        ? "CANCELLED"
        : "PARTIALLY CANCELLED";

    const matchesSearch =
      !search ||
      booking.pnr?.toLowerCase().includes(search) ||
      flight?.flightNumber?.toLowerCase().includes(search) ||
      flight?.origin?.toLowerCase().includes(search) ||
      flight?.destination?.toLowerCase().includes(search) ||
      group.some((item) =>
        item.status?.toLowerCase().includes(search)
      );

    const matchesStatus =
      statusFilter === "ALL" ||
      groupStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(
    filteredBookings.length / BOOKINGS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * BOOKINGS_PER_PAGE;

  const paginatedBookings =
    filteredBookings.slice(
      startIndex,
      startIndex + BOOKINGS_PER_PAGE
    );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

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
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>

        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-12">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Your trips
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            My bookings
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            View and manage your AirDash reservations.
          </p>

        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PNR, flight, origin, destination or status..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
          />

          <div className="mt-4 flex flex-wrap gap-2">

            {[
              "ALL",
              "CONFIRMED",
              "PARTIALLY CANCELLED",
              "CANCELLED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "All" : status}
              </button>
            ))}

          </div>

        </div>

        {loading && (
          <div className="py-20 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

            <p className="mt-5 text-sm text-slate-500">
              Loading your bookings...
            </p>

          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center">

            <XCircle className="mx-auto h-10 w-10 text-red-400" />

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={loadBookings}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Try again
            </button>

          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <Ticket className="h-7 w-7 text-sky-500" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-950">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't booked a flight yet. Find a destination and
              start your journey.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Search flights
            </button>

          </div>
        )}

        {!loading &&
        !error &&
        bookings.length > 0 &&
        filteredBookings.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <h2 className="text-xl font-bold text-slate-950">
              No matching bookings
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with a different PNR, flight number,
              route or status.
            </p>

          </div>
        )}

                {!loading &&
          !error &&
          filteredBookings.length > 0 && (
            <div className="space-y-5">

              {paginatedBookings.map((bookingGroup) => {

                const firstBooking = bookingGroup[0];
                const flight = firstBooking.flight;

                const totalFare =
                  Number(flight?.price || 0) * bookingGroup.length;

                const allConfirmed = bookingGroup.every(
                  (booking) => booking.status === "CONFIRMED"
                );

                const allCancelled = bookingGroup.every(
                  (booking) => booking.status === "CANCELLED"
                );

                return (
                  <article
                    key={firstBooking.pnr || firstBooking.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* BOOKING HEADER */}
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Booking reference / PNR
                        </p>

                        <p className="mt-1 font-bold tracking-widest text-slate-950">
                          {firstBooking.pnr ||
                            `AD-${String(firstBooking.id).padStart(6, "0")}`}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                          allConfirmed
                            ? "CONFIRMED"
                            : allCancelled
                              ? "CANCELLED"
                              : "PARTIALLY CANCELLED"
                        )}`}
                      >
                        {allConfirmed
                          ? "CONFIRMED"
                          : allCancelled
                            ? "CANCELLED"
                            : "PARTIALLY CANCELLED"}
                      </span>

                    </div>

                    {/* FLIGHT */}
                    <div className="p-6">

                      <div className="flex flex-col gap-7 lg:flex-row lg:items-center">

                        <div className="flex-1">

                          <div className="mb-2 flex items-center gap-2">
                            <Plane className="h-4 w-4 text-sky-500" />

                            <span className="text-sm font-bold text-slate-950">
                              {flight?.flightNumber}
                            </span>
                          </div>

                          <p className="mb-5 text-xs text-slate-400">
                            {formatDuration(
                              flight?.departureTime,
                              flight?.arrivalTime
                            )}{" "}
                            • Non-stop
                          </p>

                          <div className="flex items-center gap-5">

                            <div>
                              <p className="text-2xl font-bold text-slate-950">
                                {formatTime(flight?.departureTime)}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {flight?.origin}
                              </p>
                            </div>

                            <div className="flex flex-1 items-center gap-2">
                              <div className="h-px flex-1 bg-slate-200" />

                              <Plane className="h-4 w-4 rotate-90 text-sky-500" />

                              <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-950">
                                {formatTime(flight?.arrivalTime)}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {flight?.destination}
                              </p>
                            </div>

                          </div>

                        </div>

                        {/* BOOKING INFO */}
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 lg:w-96 lg:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">

                          <div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <CalendarDays className="h-4 w-4" />
                              <span className="text-xs">
                                Departure
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-950">
                              {formatDate(flight?.departureTime)}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Ticket className="h-4 w-4" />
                              <span className="text-xs">
                                Passengers
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-950">
                              {bookingGroup.length}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-xs">
                                Total fare
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-950">
                              {flight?.price != null
                                ? `₹${totalFare.toLocaleString("en-IN")}`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock3 className="h-4 w-4" />

                              <span className="text-xs">
                                Booked
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-950">
                              {formatDate(firstBooking.bookingDate)}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <CheckCircle2 className="h-4 w-4" />

                              <span className="text-xs">
                                Status
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-950">
                              {allConfirmed
                                ? "CONFIRMED"
                                : allCancelled
                                  ? "CANCELLED"
                                  : "PARTIALLY CANCELLED"}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* PASSENGERS */}
                      <div className="mt-7 border-t border-slate-100 pt-6">

                        <h3 className="text-sm font-bold text-slate-950">
                          Passengers
                        </h3>

                        <div className="mt-4 space-y-3">

                          {bookingGroup.map((booking) => (

                            <div
                              key={booking.id}
                              className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                            >

                              <div>
                                <p className="font-semibold text-slate-950">
                                  {booking.passenger?.name || "Passenger"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {booking.passenger?.email || "—"}
                                </p>
                              </div>

                              <div className="text-right">

                                <p className="text-xs text-slate-400">
                                  Seat
                                </p>

                                <p className="mt-1 font-bold text-sky-600">
                                  {booking.seatNumber}
                                </p>

                                <p
                                  className={`mt-1 text-xs font-semibold ${
                                    booking.status === "CONFIRMED"
                                      ? "text-emerald-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {booking.status}
                                </p>

                              </div>

                            </div>

                          ))}

                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

                        <button
                          onClick={() =>
                            navigate("/confirmation", {
                              state: {
                                bookings: bookingGroup,
                              },
                            })
                          }
                          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                        >
                          View Ticket
                        </button>

                        {bookingGroup
                          .filter(
                            (booking) =>
                              booking.status === "CONFIRMED"
                          )
                          .map((booking) => (

                            <button
                              key={booking.id}
                              onClick={() =>
                                cancelBooking(booking)
                              }
                              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Cancel{" "}
                              {booking.passenger?.name ||
                                "Passenger"}
                            </button>

                          ))}

                      </div>

                    </div>

                  </article>
                );
              })}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-medium text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>
              )}

            </div>
          )}

      </main>
    </div>
  );
}

export default MyBookings;