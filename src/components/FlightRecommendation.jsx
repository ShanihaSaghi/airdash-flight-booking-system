import { Sparkles, ArrowRight } from "lucide-react";

function FlightRecommendation({ flights, onSelect }) {
  if (!flights || flights.length === 0) {
    return null;
  }

  const recommendedFlight = [...flights].sort(
    (a, b) =>
      Number(b.availableSeats || 0) -
      Number(a.availableSeats || 0)
  )[0];

  return (
    <div className="mb-8 rounded-3xl border border-sky-200 bg-sky-50 p-6">

      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-sky-600" />

        <p className="text-sm font-bold uppercase tracking-widest text-sky-700">
          Airdash Smart Pick
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>
          <h3 className="text-xl font-bold text-slate-950">
            {recommendedFlight.flightNumber}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {recommendedFlight.origin}
            {" → "}
            {recommendedFlight.destination}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            {recommendedFlight.availableSeats} seats currently available
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(recommendedFlight)}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Select flight
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>

    </div>
  );
}

export default FlightRecommendation;