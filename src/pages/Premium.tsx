import { Link } from "react-router-dom";
import { plans } from "../data/plans";
import { useUserProfile } from "../hooks/useUserProfile";

const Premium = () => {
  const { profile } = useUserProfile();
  const activePlan = profile?.activePlan || profile?.activePlanName || "None";
  const city = profile?.city || "Your city";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Premium Plans</h1>
          <p className="mt-2 text-slate-600">
            Compare plans and choose protection for {city}.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Active Plan: <span className="font-bold">{activePlan}</span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-2xl font-extrabold text-cyan-700">
                {plan.price}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  {plan.period}
                </span>
              </p>

              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {activePlan === plan.name ? "Manage Premium" : "Buy Premium"}
              </button>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <Link
            to="/calculator"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Back to Calculator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Premium;
