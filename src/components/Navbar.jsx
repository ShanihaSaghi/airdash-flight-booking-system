import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Ticket,
  Search,
  HelpCircle,
  Plane,
  Users,
} from "lucide-react";

import { getCurrentUser } from "./api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function isActive(path) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  const baseClass =
    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition";

  const activeClass =
    "bg-sky-50 text-sky-600 shadow-sm";

  const inactiveClass =
    "text-slate-700 hover:bg-slate-100 hover:text-slate-950";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO */}
        <button
          onClick={() => navigate(isAdmin ? "/admin" : "/")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center">
            <img
              src="/airdash-icon.png"
              alt="AIRDash"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="text-xl font-bold tracking-tight text-slate-950">
            AIR<span className="text-sky-500">DASH</span>
          </div>

          {isAdmin && (
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
              ADMIN
            </span>
          )}
        </button>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-2">

          {isAdmin ? (
            <>
              <button
                onClick={() => navigate("/admin")}
                className={`${baseClass} ${
                  isActive("/admin")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>

              <button
                onClick={() => navigate("/admin/flights")}
                className={`${baseClass} ${
                  isActive("/admin/flights")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <Plane className="h-4 w-4" />
                Flights
              </button>

              <button
                onClick={() => navigate("/admin/passengers")}
                className={`${baseClass} ${
                  isActive("/admin/passengers")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <Users className="h-4 w-4" />
                Passengers
              </button>

              <button
                onClick={() => navigate("/admin/bookings")}
                className={`${baseClass} ${
                  isActive("/admin/bookings")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <Ticket className="h-4 w-4" />
                Bookings
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/")}
                className={`${baseClass} ${
                  isActive("/")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                Home
              </button>

              <button
                onClick={() => navigate("/flights")}
                className={`${baseClass} ${
                  isActive("/flights")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <Search className="h-4 w-4" />
                Flights
              </button>

              <button
                onClick={() => navigate("/bookings")}
                className={`${baseClass} ${
                  isActive("/bookings")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <Ticket className="h-4 w-4" />
                My Bookings
              </button>

              <button
                onClick={() => navigate("/help")}
                className={`${baseClass} ${
                  isActive("/help")
                    ? activeClass
                    : inactiveClass
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </button>
            </>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

        </nav>
      </div>
    </header>
  );
}

export default Navbar;