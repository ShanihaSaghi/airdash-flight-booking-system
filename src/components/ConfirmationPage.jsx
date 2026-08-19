import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Plane,
  ArrowRight,
  CalendarDays,
  Clock3,
  Printer,
} from "lucide-react";

function ConfirmationPage() {

  const location = useLocation();
  const navigate = useNavigate();
  function handlePrintTicket() {
    window.print();
  }

  const bookings =
    location.state?.bookings ||
    (location.state?.booking
      ? [location.state.booking]
      : []);

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            No booking found
          </h1>

          <button
            onClick={() => navigate("/flights")}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Browse flights
          </button>
        </div>
      </div>
    );
  }

  const ticketPrice =
    Number(bookings[0]?.flight?.price || 0);

  const totalPrice =
    ticketPrice * bookings.length;

  const firstBooking = bookings[0];
  const flight = firstBooking.flight;
  const pnr = firstBooking.pnr;

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">

          <div className="flex h-10 w-10 items-center justify-center">
            <img
              src="/airdash-icon.png"
              alt="AIRDash"
              className="h-10 w-10 object-contain"
            />
          </div>

          <span className="text-xl font-bold">
            AIR<span className="text-sky-500">DASH</span>
          </span>

        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">

        <div className="text-center">

          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />

          <h1 className="mt-5 text-3xl font-bold text-slate-950">
            Booking Confirmed
          </h1>

          <p className="mt-2 text-slate-500">
            Your flight has been successfully booked.
          </p>

          {pnr && (
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
                Booking Reference / PNR
              </p>

              <p className="mt-2 text-2xl font-bold tracking-widest text-slate-950">
                {pnr}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Keep this reference for your booking.
              </p>
            </div>
          )}

        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
            Flight
          </p>

          <div className="mt-4 flex items-center gap-5">

            <div>
              <p className="text-2xl font-bold">
                {flight.origin}
              </p>
            </div>

            <ArrowRight className="text-sky-500" />

            <div>
              <p className="text-2xl font-bold">
                {flight.destination}
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-4">
              <CalendarDays className="h-5 w-5 text-sky-500" />

              <p className="mt-2 text-xs text-slate-400">
                Departure date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {flight.departureTime
                  ? new Date(
                      flight.departureTime
                    ).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Date unavailable"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <Clock3 className="h-5 w-5 text-sky-500" />

              <p className="mt-2 text-xs text-slate-400">
                Departure
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {flight.departureTime
                  ? new Date(
                      flight.departureTime
                    ).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <Clock3 className="h-5 w-5 text-sky-500" />

              <p className="mt-2 text-xs text-slate-400">
                Arrival
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {flight.arrivalTime
                  ? new Date(
                      flight.arrivalTime
                    ).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "—"}
              </p>
            </div>

          </div>

        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-xl font-bold">
            Passengers
          </h2>

          <div className="mt-5 space-y-4">

            {bookings.map((booking) => (

              <div
                key={booking.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-5"
              >

                <div>

                  <p className="font-bold text-slate-950">
                    {booking.passenger?.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {booking.passenger?.email}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Booking #{booking.id}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Seat
                  </p>

                  <p className="mt-1 text-xl font-bold text-sky-600">
                    {booking.seatNumber}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    {booking.status}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* FARE SUMMARY */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-xl font-bold text-slate-950">
            Fare Summary
          </h2>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Ticket price
              </span>

              <span className="font-semibold text-slate-900">
                ₹{ticketPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Passengers
              </span>

              <span className="font-semibold text-slate-900">
                {bookings.length}
              </span>
            </div>

          </div>

          <div className="my-5 border-t border-slate-100" />

          <div className="flex items-center justify-between">

            <span className="text-lg font-bold text-slate-950">
              Total fare
            </span>

            <span className="text-2xl font-bold text-sky-600">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-400">
            {ticketPrice > 0
              ? `₹${ticketPrice.toLocaleString("en-IN")} per passenger`
              : "Ticket price unavailable"}
          </p>

        </div>

        <div className="mt-7 flex justify-center gap-3">

          <button
            onClick={handlePrintTicket}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-100"
          >
            <Printer className="h-4 w-4" />
            Print Ticket
          </button>

          <button
            onClick={() => navigate("/bookings")}
            className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-100"
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate("/flights")}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-100"
          >
            Browse Flights
          </button>

        </div>

      </main>

      <style>
        {`
          @media print {
            header,
            button {
              display: none !important;
            }

            body {
              background: white !important;
            }

            main {
              max-width: 100% !important;
              padding: 20px !important;
            }

            .shadow-sm {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ConfirmationPage;