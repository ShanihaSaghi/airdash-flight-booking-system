import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  WalletCards,
} from "lucide-react";

import { createMultipleBookings } from "./api";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [cardholderName, setCardholderName] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const [upiId, setUpiId] =
    useState("");

  const [showCvv, setShowCvv] =
    useState(false);

  const {
    flight,
    passengers = [],
  } = location.state || {};

  if (!flight || passengers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">

          <h1 className="text-2xl font-bold text-slate-950">
            Payment details unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your selected flight or passenger details are missing.
          </p>

          <button
            onClick={() => navigate("/flights")}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Browse Flights
          </button>

        </div>
      </div>
    );
  }

  const price = Number(flight.price || 0);
  const total = price * passengers.length;

  function formatCardNumber(value) {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 16);

    return digits.replace(
      /(.{4})/g,
      "$1 "
    ).trim();
  }

  function formatExpiry(value) {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function validatePayment() {
    setError("");

    if (paymentMethod === "card") {

      if (!cardholderName.trim()) {
        setError("Please enter the cardholder name.");
        return false;
      }

      const cardDigits =
        cardNumber.replace(/\D/g, "");

      if (cardDigits.length !== 16) {
        setError("Please enter a valid 16-digit card number.");
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setError("Please enter the card expiry date in MM/YY format.");
        return false;
      }

      const [month] = expiry.split("/");

      const monthNumber = Number(month);

      if (
        monthNumber < 1 ||
        monthNumber > 12
      ) {
        setError("Please enter a valid expiry month between 01 and 12.");
        return false;
      }

      if (!/^\d{3}$/.test(cvv)) {
        setError("Please enter a valid 3-digit CVV.");
        return false;
      }
    }

    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        setError("Please enter your UPI ID.");
        return false;
      }

      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID, for example name@upi.");
        return false;
      }
    }

    if (paymentMethod === "phonepe") {
      if (!upiId.trim()) {
        setError("Please enter your PhonePe UPI ID.");
        return false;
      }

      if (!upiId.includes("@")) {
        setError("Please enter a valid PhonePe UPI ID.");
        return false;
      }
    }

    return true;
  }

  async function handlePayment() {
    if (!validatePayment()) {
      return;
    }

    try {
      setPaying(true);
      setError("");

      const bookings =
        await createMultipleBookings(
          flight.id,
          passengers
        );

      if (!bookings || bookings.length === 0) {
        throw new Error(
          "Your payment was processed, but the booking confirmation was not received."
        );
      }

      navigate("/confirmation", {
        state: {
          bookings,
          booking: bookings[0],
          flight,
          passengers,
          paymentCompleted: true,
          paymentMethod,
        },
      });

    } catch (err) {
      console.error(
        "Payment/booking error:",
        err
      );

      const message =
        err?.message?.toLowerCase() || "";

      if (
        message.includes("seat") &&
        message.includes("book")
      ) {
        setError(
          "One of the selected seats is no longer available. Please return to seat selection and choose another seat."
        );
      } else if (
        message.includes("flight") &&
        message.includes("not")
      ) {
        setError(
          "This flight is no longer available. Please choose another flight."
        );
      } else if (
        message.includes("passenger")
      ) {
        setError(
          "Passenger information could not be processed. Please check the passenger details and try again."
        );
      } else if (
        message.includes("401") ||
        message.includes("403") ||
        message.includes("unauthorized") ||
        message.includes("forbidden")
      ) {
        setError(
          "Your login session has expired. Please log in again before completing the booking."
        );
      } else {
        setError(
          "We couldn't complete your booking. Please check your details and try again."
        );
      }

    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">

          <img
            src="/airdash-icon.png"
            alt="AIRDash"
            className="h-10 w-10 object-contain"
          />

          <span className="text-xl font-bold text-slate-950">
            AIR
            <span className="text-sky-500">
              DASH
            </span>
          </span>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">

        <h1 className="text-3xl font-bold text-slate-950">
          Secure Payment
        </h1>

        <p className="mt-2 text-slate-500">
          Choose your payment method and complete your booking.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* PAYMENT */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <h2 className="text-lg font-bold text-slate-950">
              Payment method
            </h2>

            {/* METHODS */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <PaymentMethod
                active={paymentMethod === "card"}
                onClick={() => {
                  setPaymentMethod("card");
                  setError("");
                }}
                icon={<CreditCard className="h-5 w-5" />}
                label="Card"
              />

              <PaymentMethod
                active={paymentMethod === "upi"}
                onClick={() => {
                  setPaymentMethod("upi");
                  setError("");
                }}
                icon={<WalletCards className="h-5 w-5" />}
                label="UPI"
              />

              <PaymentMethod
                active={paymentMethod === "phonepe"}
                onClick={() => {
                  setPaymentMethod("phonepe");
                  setError("");
                }}
                icon={<Smartphone className="h-5 w-5" />}
                label="PhonePe"
              />

              <PaymentMethod
                active={paymentMethod === "netbanking"}
                onClick={() => {
                  setPaymentMethod("netbanking");
                  setError("");
                }}
                icon={<WalletCards className="h-5 w-5" />}
                label="Net Banking"
              />

            </div>

            {/* CARD */}
            {paymentMethod === "card" && (
              <div className="mt-7 space-y-5">

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Cardholder name
                  </label>

                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) =>
                      setCardholderName(e.target.value)
                    }
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Card number
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        formatCardNumber(e.target.value)
                      )
                    }
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Expiry
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) =>
                        setExpiry(
                          formatExpiry(e.target.value)
                        )
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      CVV
                    </label>

                    <div className="relative mt-2">

                      <input
                        type={
                          showCvv
                            ? "text"
                            : "password"
                        }
                        inputMode="numeric"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 3)
                          )
                        }
                        placeholder="123"
                        maxLength={3}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCvv(
                            (current) => !current
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showCvv
                            ? "Hide CVV"
                            : "Show CVV"
                        }
                      >
                        {showCvv ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* UPI */}
            {(paymentMethod === "upi" ||
              paymentMethod === "phonepe") && (
              <div className="mt-7">

                <label className="text-sm font-semibold text-slate-700">
                  {paymentMethod === "phonepe"
                    ? "PhonePe UPI ID"
                    : "UPI ID"}
                </label>

                <input
                  type="text"
                  value={upiId}
                  onChange={(e) =>
                    setUpiId(e.target.value)
                  }
                  placeholder="yourname@upi"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Demo payment interface — no real payment will be charged.
                </p>

              </div>
            )}

            {/* NET BANKING */}
            {paymentMethod === "netbanking" && (
              <div className="mt-7">

                <label className="text-sm font-semibold text-slate-700">
                  Select your bank
                </label>

                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose your bank
                  </option>
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>

                <p className="mt-2 text-xs text-slate-400">
                  Demo payment interface — no real payment will be charged.
                </p>

              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* PAY */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={paying}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming booking...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay ₹{total.toLocaleString("en-IN")}
                </>
              )}
            </button>

          </div>

          {/* SUMMARY */}
          <div className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
              Fare Summary
            </p>

            <h2 className="mt-3 text-xl font-bold text-slate-950">
              {flight.origin} → {flight.destination}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {flight.airlineName || "Airline unavailable"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Flight {flight.flightNumber}
            </p>

            <div className="my-6 border-t border-slate-100" />

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">
                Ticket
              </span>

              <span className="font-semibold">
                ₹{price.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-sm text-slate-500">
                Passengers
              </span>

              <span className="font-semibold">
                {passengers.length}
              </span>
            </div>

            <div className="my-6 border-t border-slate-100" />

            <div className="flex justify-between">
              <span className="text-lg font-bold">
                Total
              </span>

              <span className="text-2xl font-bold text-sky-600">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

function PaymentMethod({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-xs font-semibold transition ${
        active
          ? "border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-100"
          : "border-slate-200 bg-white text-slate-500 hover:border-sky-200 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default PaymentPage;