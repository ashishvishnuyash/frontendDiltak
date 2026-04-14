"use client";

// ─── Static mock data ────────────────────────────────────────────────────────

const MED_STATS = [
  { label: "Medications tracked", value: "3", sub: "active" },
  {
    label: "Adherence this week",
    value: "89",
    sub: "%",
    statusColor: "text-green-600 dark:text-green-400",
    status: "Strong",
  },
  { label: "Next reminder", value: "9:00", sub: "PM" },
];

const MEDICATIONS = [
  {
    name: "Metformin 500 mg",
    schedule: "Take with meals · 9:00 AM and 9:00 PM daily",
    purpose: "Blood sugar management",
    status: "Taken today",
    statusColor:
      "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400",
    color: "border-l-green-500",
  },
  {
    name: "Vitamin D3 60,000 IU",
    schedule: "Once weekly · Sunday morning with breakfast",
    purpose: "Bone health & immunity",
    status: "Sunday",
    statusColor:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    color: "border-l-blue-500",
  },
  {
    name: "Omega-3 Fish Oil 1000 mg",
    schedule: "Once daily with dinner",
    purpose: "Heart health & inflammation reduction",
    status: "Due 8 PM",
    statusColor:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    color: "border-l-amber-500",
  },
];

const ADHERENCE = [
  { name: "Metformin", percent: 93, color: "bg-green-500" },
  { name: "Vitamin D3", percent: 100, color: "bg-blue-500" },
  { name: "Omega-3", percent: 71, color: "bg-amber-500" },
];

const INTERACTIONS = [
  {
    title: "Metformin + food",
    description:
      "Always take with food to minimise stomach discomfort. If you miss a mealtime dose, take it with the next meal — never double dose.",
    icon: "💊",
  },
  {
    title: "Vitamin D + fat",
    description:
      "Vitamin D is fat soluble. Taking it with a meal containing healthy fats (eggs, avocado, nuts) increases absorption by up to 32%.",
    icon: "☀️",
  },
  {
    title: "Omega-3 + blood thinners",
    description:
      "If you are prescribed anticoagulants, inform your doctor before continuing Omega-3 supplementation as it may enhance the effect.",
    icon: "⚠️",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function MedicationTab() {
  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {MED_STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {s.label}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {s.value}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {s.sub}
              </span>
            </div>
            {s.status && (
              <span className={`text-xs ${s.statusColor}`}>{s.status}</span>
            )}
          </div>
        ))}
      </div>

      {/* Active medication schedule */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Active Medication Schedule
        </h3>
        <div className="space-y-3">
          {MEDICATIONS.map((med) => (
            <div
              key={med.name}
              className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border-l-2 ${med.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {med.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {med.schedule}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {med.purpose}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${med.statusColor}`}
                >
                  {med.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Adherence chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Adherence by Medication (7 days)
          </h3>
          <div className="space-y-3">
            {ADHERENCE.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                  {a.name}
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.color}`}
                    style={{ width: `${a.percent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                  {a.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction notes */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Medication Interaction Notes
          </h3>
          <div className="space-y-3">
            {INTERACTIONS.map((n) => (
              <div key={n.title} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{n.icon}</span>
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {n.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            You missed Omega-3 two evenings this week. Try linking it to a
            consistent evening habit — such as immediately before brushing teeth —
            to improve adherence.
          </p>
        </div>
      </div>
    </div>
  );
}
