import { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  MapPin,
  Truck,
  IndianRupee,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { partners } from "../data/partners";
import { cities } from "../mockData";
import LocationSearchSelect from "../components/LocationSearchSelect";

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  platform: string;
  avgDailyIncome: string;
  avgDailyDeliveries: string;
};

const makeInitialForm = (
  fullName: string,
  email: string,
  phone: string,
  city: string,
  platform: string,
  avgDailyIncome: string,
  avgDailyDeliveries: string,
): ProfileFormState => ({
  fullName,
  email,
  phone,
  city,
  platform,
  avgDailyIncome,
  avgDailyDeliveries,
});

const Profile = () => {
  const { user } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileFormState>(() =>
    makeInitialForm("", "", "", "", "", "", ""),
  );

  useEffect(() => {
    setForm(
      makeInitialForm(
        profile?.fullName ?? user?.displayName ?? "",
        profile?.email ?? user?.email ?? "",
        profile?.phone ?? "",
        profile?.city ?? "",
        profile?.platform ?? "",
        profile?.avgDailyIncome ? String(profile.avgDailyIncome) : "",
        profile?.avgDailyDeliveries ? String(profile.avgDailyDeliveries) : "",
      ),
    );
  }, [
    profile?.avgDailyDeliveries,
    profile?.avgDailyIncome,
    profile?.city,
    profile?.email,
    profile?.fullName,
    profile?.phone,
    profile?.platform,
    user?.displayName,
    user?.email,
  ]);

  const userInitial = useMemo(() => {
    const source = form.fullName || form.email || "User";
    return source.charAt(0).toUpperCase();
  }, [form.fullName, form.email]);

  const handleChange =
    (field: keyof ProfileFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setSaveMessage(null);
      setErrorMessage(null);
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.uid) {
      setErrorMessage("You need to log in before saving your profile.");
      return;
    }

    const cleanedName = form.fullName.trim();
    const cleanedPhone = form.phone.trim();

    if (!cleanedName) {
      setErrorMessage("Name is required.");
      return;
    }

    if (cleanedPhone && !/^\+?[0-9]{10,13}$/.test(cleanedPhone)) {
      setErrorMessage("Phone number must be 10 to 13 digits.");
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        uid: user.uid,
        email: form.email,
        fullName: cleanedName,
        phone: cleanedPhone,
        city: form.city,
        platform: form.platform,
        avgDailyIncome: form.avgDailyIncome
          ? Number(form.avgDailyIncome)
          : null,
        avgDailyDeliveries: form.avgDailyDeliveries
          ? Number(form.avgDailyDeliveries)
          : null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), payload, { merge: true });

      localStorage.setItem(
        "dbUser",
        JSON.stringify({
          ...profile,
          ...payload,
          updatedAt: new Date().toISOString(),
        }),
      );

      setSaveMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-36 -left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <aside className="lg:col-span-2 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start gap-4">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                Account Identity
              </span>

              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-cyan-500/20">
                {userInitial}
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Your Profile
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Keep your details updated so pricing, alerts, and payout flows
                  stay accurate.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100 break-all">
                  {form.email || "No email found"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Delivery Partner
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {form.platform || "Not selected"}
                </p>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3 bg-white/90 dark:bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Personal Details
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Email is locked for security. Everything else below can be
                    updated.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving || loadingProfile}
                  className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {saveMessage && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  {saveMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Full Name
                  </span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (Read-only)
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    State / UT
                  </span>
                  <LocationSearchSelect
                    value={form.city}
                    onChange={(city) => {
                      setSaveMessage(null);
                      setErrorMessage(null);
                      setForm((prev) => ({ ...prev, city }));
                    }}
                    options={cities}
                    placeholder="Search and select your state/UT"
                    className="w-full"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery Partner
                  </span>
                  <select
                    value={form.platform}
                    onChange={handleChange("platform")}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select partner</option>
                    {partners.map((partner) => (
                      <option key={partner} value={partner}>
                        {partner}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Avg Daily Income
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.avgDailyIncome}
                    onChange={handleChange("avgDailyIncome")}
                    placeholder="1200"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Avg Deliveries Per Day
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.avgDailyDeliveries}
                    onChange={handleChange("avgDailyDeliveries")}
                    placeholder="25"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4 text-sm text-slate-600 dark:text-slate-300 flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-0.5 text-cyan-600 dark:text-cyan-400" />
                <p>
                  Keeping your delivery partner, city, and work stats updated
                  helps the premium calculator and disruption alerts stay
                  relevant.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving || loadingProfile}
                className="sm:hidden w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
