import { useEffect, useRef, useState } from "react";
import {
  Plane,
  Plus,
  RefreshCw,
  Trash2,
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  API_BASE_URL,
  authFetch,
  getCurrentUser,
} from "./api.js";

import Navbar from "./Navbar";

function AdminFlights() {
  const navigate = useNavigate();
  const flightFormRef = useRef(null);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingFlight, setEditingFlight] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    flightNumber: "",
    airlineName: "",
    origin: "",
    destination: "",
    totalSeats: "",
    price: "",
    departureTime: "",
    arrivalTime: "",
  });

  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    loadFlights();
  }, []);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        flightFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [showForm]);

  async function loadFlights() {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        `${API_BASE_URL}/api/flights`
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "Unable to load flights."
        );
      }

      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError(err.message || "Unable to load flights.");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      flightNumber: "",
      airlineName: "",
      origin: "",
      destination: "",
      totalSeats: "",
      price: "",
      departureTime: "",
      arrivalTime: "",
    });

    setEditingFlight(null);
    setShowForm(false);
  }

  function startAddingFlight() {
    setEditingFlight(null);

    setForm({
      flightNumber: "",
      airlineName: "",
      origin: "",
      destination: "",
      totalSeats: "",
      price: "",
      departureTime: "",
      arrivalTime: "",
    });

    setShowForm(true);
  }

  function startEditing(flight) {
    setEditingFlight(flight);

    setForm({
      flightNumber: flight.flightNumber || "",
      airlineName: flight.airlineName || "",
      origin: flight.origin || "",
      destination: flight.destination || "",
      totalSeats: flight.totalSeats || "",
      price: flight.price || "",
      departureTime: flight.departureTime
        ? flight.departureTime.slice(0, 16)
        : "",
      arrivalTime: flight.arrivalTime
        ? flight.arrivalTime.slice(0, 16)
        : "",
    });

    setShowForm(true);
  }

  async function saveFlight(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const url = editingFlight
        ? `${API_BASE_URL}/api/flights/${editingFlight.id}`
        : `${API_BASE_URL}/api/flights`;

      const response = await authFetch(url, {
        method: editingFlight ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightNumber: form.flightNumber.trim(),
          airlineName: form.airlineName.trim(),
          origin: form.origin.trim(),
          destination: form.destination.trim(),
          totalSeats: Number(form.totalSeats),
          price: Number(form.price),
          departureTime: form.departureTime || null,
          arrivalTime: form.arrivalTime || null,
        }),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Unable to ${
              editingFlight ? "update" : "create"
            } flight.`
        );
      }

      resetForm();
      await loadFlights();
    } catch (err) {
      setError(
        err.message || "Unable to save flight."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteFlight(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flight?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await authFetch(
        `${API_BASE_URL}/api/flights/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Unable to delete flight. Server returned ${response.status}.`
        );
      }

      await loadFlights();

    } catch (err) {
      console.error("Delete flight error:", err);

      setError(
        err.message ||
          "Unable to delete flight."
      );
    }
  }

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
                <LayoutDashboard className="h-4 w-4" />
              }
              label="Dashboard"
              onClick={() => navigate("/admin")}
            />

            <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Management
            </p>

            <SidebarButton
              icon={<Plane className="h-4 w-4" />}
              label="Flights"
              active
              onClick={() =>
                navigate("/admin/flights")
              }
            />

            <SidebarButton
              icon={<Users className="h-4 w-4" />}
              label="Passengers"
              onClick={() =>
                navigate("/admin/passengers")
              }
            />

            <SidebarButton
              icon={<Ticket className="h-4 w-4" />}
              label="Bookings"
              onClick={() =>
                navigate("/admin/bookings")
              }
            />

            <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              System
            </p>

            <SidebarButton
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              onClick={() => {}}
            />

          </nav>

          {/* PROFILE */}
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

        {/* MAIN */}
        <main className="min-w-0 flex-1 p-6 lg:p-10">

          {/* HEADER */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                Flight Management
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Add, edit and manage your airline flights.
              </p>
            </div>

            <button
              onClick={startAddingFlight}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              <Plus className="h-4 w-4" />
              Add flight
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ADD / EDIT FORM */}
          {showForm && (
            <section
              ref={flightFormRef}
              className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >

              <div className="mb-6 flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
                    Flight management
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {editingFlight
                      ? "Edit flight"
                      : "Add new flight"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-semibold text-slate-400 hover:text-slate-700"
                >
                  Close
                </button>

              </div>

              <form
                onSubmit={saveFlight}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >

                <Field
                  label="Airline name"
                  placeholder="IndiGo"
                  value={form.airlineName}
                  onChange={(value) =>
                    updateForm("airlineName", value)
                  }
                  required
                />

                <Field
                  label="Flight number"
                  placeholder="AI202"
                  value={form.flightNumber}
                  onChange={(value) =>
                    updateForm("flightNumber", value)
                  }
                  required
                />

                <Field
                  label="Origin"
                  placeholder="Chennai"
                  value={form.origin}
                  onChange={(value) =>
                    updateForm("origin", value)
                  }
                  required
                />

                <Field
                  label="Destination"
                  placeholder="Mumbai"
                  value={form.destination}
                  onChange={(value) =>
                    updateForm("destination", value)
                  }
                  required
                />

                <Field
                  label="Total seats"
                  type="number"
                  min="1"
                  placeholder="180"
                  value={form.totalSeats}
                  onChange={(value) =>
                    updateForm("totalSeats", value)
                  }
                  required
                />

                <Field
                  label="Ticket price (₹)"
                  type="number"
                  min="1"
                  placeholder="5499"
                  value={form.price}
                  onChange={(value) =>
                    updateForm("price", value)
                  }
                  required
                />

                <Field
                  label="Departure"
                  type="datetime-local"
                  value={form.departureTime}
                  onChange={(value) =>
                    updateForm("departureTime", value)
                  }
                />

                <Field
                  label="Arrival"
                  type="datetime-local"
                  value={form.arrivalTime}
                  onChange={(value) =>
                    updateForm("arrivalTime", value)
                  }
                />

                <div className="flex gap-3 xl:col-span-3">

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingFlight
                        ? "Save changes"
                        : "Create flight"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </section>
          )}

          {/* FLIGHTS TABLE */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="font-bold text-slate-950">
                  Flight schedule
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your current flight operations.
                </p>
              </div>

              <button
                onClick={loadFlights}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-slate-950"
                title="Refresh flights"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

            </div>

            {loading ? (
              <div className="p-12 text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading flights...
                </p>

              </div>
            ) : flights.length === 0 ? (
              <div className="p-12 text-center">

                <Plane className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-700">
                  No flights yet
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Add your first flight to get started.
                </p>

                <button
                  onClick={startAddingFlight}
                  className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  + Add first flight
                </button>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Flight
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Route
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Departure
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Seats
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Price
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {flights.map((flight) => (
                      <tr
                        key={flight.id}
                        className="border-b border-slate-100 last:border-0"
                      >

                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-950">
                            {flight.airlineName || "Airline unavailable"}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-600">
                            {flight.flightNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID #{flight.id}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-700">
                            {flight.origin}
                          </p>

                          <p className="text-xs text-slate-400">
                            → {flight.destination}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-700">
                            {flight.departureTime
                              ? new Date(
                                  flight.departureTime
                                ).toLocaleString()
                              : "Not scheduled"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-700">
                            {flight.availableSeats}

                            <span className="font-normal text-slate-400">
                              {" "}
                              / {flight.totalSeats}
                            </span>
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-700">
                            {flight.price != null
                              ? `₹${Number(flight.price).toLocaleString("en-IN")}`
                              : "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                startEditing(flight)
                              }
                              className="rounded-xl px-3 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteFlight(flight.id)
                              }
                              className="rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                              title="Delete flight"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

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

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  min,
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
      />

    </label>
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

export default AdminFlights;