import {
  ArrowRight,
  ArrowRightLeft,
  CalendarDays,
  ChevronDown,
  Globe2,
  Luggage,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Navigate, Route, Routes } from "react-router-dom";
import FlightList from "./components/FlightList";
import BookingPage from "./components/BookingPage";
import Login from "./components/Login";
import FlightSearch from "./components/FlightSearch";
import ConfirmationPage from "./components/ConfirmationPage";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/AdminDashboard";
import AdminPassengers from "./components/AdminPassengers";
import AdminBookings from "./components/AdminBookings";
import HomePage from "./components/HomePage";
import BookingForm from "./components/BookingForm";
import Register from "./components/Register";
import AdminRoute from "./components/AdminRoute";
import AdminFlights from "./components/AdminFlights";
import Help from "./components/Help";
import PaymentPage from "./components/PaymentPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/flights" element={<FlightList />} />
      <Route path="/flights/:id" element={<BookingPage />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/:id/passenger"
        element={
          <ProtectedRoute>
            <BookingForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/confirmation"
        element={
          <ProtectedRoute>
            <ConfirmationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route element={<AdminRoute />}>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/flights"
          element={<AdminFlights />}
        />

        <Route
          path="/admin/passengers"
          element={<AdminPassengers />}
        />

        <Route
          path="/admin/bookings"
          element={<AdminBookings />}
        />

      </Route>

    </Routes>
  );
}

function Stat({ number, label }) {
  return (
    <div className="px-4 text-center first:pl-0 last:pr-0">
      <p className="text-2xl font-bold tracking-tight text-slate-950">
        {number}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-950">{title}</h3>

      <p className="mt-3 leading-7 text-slate-500">{description}</p>

      <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-900">
        Learn more
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function DestinationCard({ code, city, description }) {
  return (
    <div className="group relative min-h-64 overflow-hidden rounded-3xl bg-slate-900 p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.35),transparent_35%),linear-gradient(135deg,#0f172a,#1e293b)] transition duration-500 group-hover:scale-105" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200">
            {code}
          </span>

          <Plane className="h-5 w-5 rotate-45 text-white/50" />
        </div>

        <div>
          <h3 className="text-3xl font-bold text-white">{city}</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
            {description}
          </p>

          <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-white">
            View flights
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;