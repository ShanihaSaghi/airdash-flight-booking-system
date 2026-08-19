import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authFetch } from "./api.js";

function AdminPassengers() {
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    loadPassengers();
  }, []);

  async function loadPassengers() {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        `${API_BASE_URL}/api/passengers`
      );

      if (!response.ok) {
        throw new Error("Unable to load passengers.");
      }

      const data = await response.json();
      setPassengers(data);
    } catch (err) {
      setError(err.message || "Unable to load passengers.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phoneNumber: "",
    });

    setEditingPassenger(null);
    setShowForm(false);
  }

  function startEditing(passenger) {
    setEditingPassenger(passenger);

    setForm({
      name: passenger.name || "",
      email: passenger.email || "",
      phoneNumber: passenger.phoneNumber || "",
    });

    setShowForm(true);
  }

  async function savePassenger(event) {
    event.preventDefault();

    try {
      setError("");

      const url = editingPassenger
        ? `${API_BASE_URL}/api/passengers/${editingPassenger.id}`
        : `${API_BASE_URL}/api/passengers`;

      const response = await authFetch(url, {
        method: editingPassenger ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "Unable to save passenger."
        );
      }

      resetForm();
      await loadPassengers();
    } catch (err) {
      setError(err.message || "Unable to save passenger.");
    }
  }

  async function deletePassenger(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this passenger?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await authFetch(
        `${API_BASE_URL}/api/passengers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "Unable to delete passenger."
        );
      }

      await loadPassengers();
    } catch (err) {
      setError(
        err.message || "Unable to delete passenger."
      );
    }
  }

  const filteredPassengers = passengers.filter((passenger) => {
    const value = search.toLowerCase();

    return (
      passenger.name?.toLowerCase().includes(value) ||
      passenger.email?.toLowerCase().includes(value) ||
      passenger.phoneNumber?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Administration
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-950">
              Passenger Management
            </h1>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-slate-400">
              {passengers.length} registered passenger
              {passengers.length !== 1 ? "s" : ""}
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-950">
              Passengers
            </h2>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            Add passenger
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">
              {editingPassenger
                ? "Edit passenger"
                : "Add passenger"}
            </h3>

            <form
              onSubmit={savePassenger}
              className="mt-6 grid gap-5 md:grid-cols-3"
            >
              <Input
                label="Full name"
                value={form.name}
                placeholder="John Doe"
                onChange={(value) =>
                  setForm({ ...form, name: value })
                }
                required
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                placeholder="john@example.com"
                onChange={(value) =>
                  setForm({ ...form, email: value })
                }
                required
              />

              <Input
                label="Phone number"
                value={form.phoneNumber}
                placeholder="+91 9876543210"
                onChange={(value) =>
                  setForm({
                    ...form,
                    phoneNumber: value,
                  })
                }
                required
              />

              <div className="flex gap-3 md:col-span-3">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  {editingPassenger
                    ? "Save changes"
                    : "Create passenger"}
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

        <div className="border-b border-slate-100 p-5">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
          />
        </div>

        {/* Table */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading passengers...
              </p>
            </div>
          ) : passengers.length === 0 ? (
            <div className="p-12 text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 font-semibold text-slate-700">
                No passengers found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Passenger
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPassengers.map((passenger) => (
                    <tr
                      key={passenger.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50">
                            <UserRound className="h-5 w-5 text-sky-500" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {passenger.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              Passenger #{passenger.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {passenger.email}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" />
                          {passenger.phoneNumber}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              startEditing(passenger)
                            }
                            className="rounded-xl p-2.5 text-sky-500 hover:bg-sky-50"
                            title="Edit passenger"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              deletePassenger(passenger.id)
                            }
                            className="rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            title="Delete passenger"
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
  );
}

function Input({
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  required,
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
      />
    </label>
  );
}

export default AdminPassengers;