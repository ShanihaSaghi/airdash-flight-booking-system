import {
  HelpCircle,
  Plane,
  Ticket,
  Armchair,
  CreditCard,
  XCircle,
  MessageCircle,
} from "lucide-react";

function Help() {
  const helpItems = [
    {
      icon: Plane,
      title: "How to book a flight",
      description:
        "Choose a flight, select your passengers and seats, then confirm your booking.",
    },
    {
      icon: Armchair,
      title: "Seat selection",
      description:
        "Select a passenger first, then choose a seat. You can click the selected seat again to unselect it or choose another seat to change it.",
    },
    {
      icon: Ticket,
      title: "My bookings",
      description:
        "View your confirmed and cancelled bookings from the My Bookings section.",
    },
    {
      icon: XCircle,
      title: "Cancel a booking",
      description:
        "Open My Bookings and cancel an active booking. The cancelled seat becomes available again.",
    },
    {
      icon: CreditCard,
      title: "Ticket price",
      description:
        "The displayed fare is calculated per passenger. For multiple passengers, the total fare is calculated automatically.",
    },
    {
      icon: MessageCircle,
      title: "Need more help?",
      description:
        "If you encounter a problem while booking, contact the AIRDASH support team.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-6xl px-6 py-12">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
            <HelpCircle className="h-8 w-8 text-sky-600" />
          </div>

          <h1 className="mt-6 text-4xl font-bold text-slate-950">
            Help Center
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Everything you need to know about booking flights,
            selecting seats and managing your bookings.
          </p>

        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {helpItems.map((item, index) => {

            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
                  <Icon className="h-6 w-6 text-sky-600" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

              </div>
            );
          })}

        </div>

      </main>

    </div>
  );
}

export default Help;