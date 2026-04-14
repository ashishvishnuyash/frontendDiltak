"use client";

import {
  Flame,
  Beef,
  Droplets,
  Wheat,
  Coffee,
  UtensilsCrossed,
  Apple,
  Salad,
} from "lucide-react";

// ─── Static mock data ────────────────────────────────────────────────────────

const NUTRITION_STATS = [
  {
    label: "Calories today",
    value: "1,620",
    target: "/2,300",
    sub: "680 remaining",
    progress: 70,
    statusColor: "text-green-600 dark:text-green-400",
    barColor: "bg-green-500",
    icon: Flame,
  },
  {
    label: "Protein",
    value: "68",
    target: "g/90g",
    sub: "On track",
    progress: 76,
    statusColor: "text-green-600 dark:text-green-400",
    barColor: "bg-blue-500",
    icon: Beef,
  },
  {
    label: "Water intake",
    value: "1.8",
    target: "L/3L",
    sub: "Low",
    progress: 60,
    statusColor: "text-yellow-600 dark:text-yellow-400",
    barColor: "bg-cyan-500",
    icon: Droplets,
  },
  {
    label: "Fibre",
    value: "18",
    target: "g/25g",
    sub: "Low",
    progress: 72,
    statusColor: "text-yellow-600 dark:text-yellow-400",
    barColor: "bg-amber-500",
    icon: Wheat,
  },
];

const MEALS = [
  {
    time: "7:30 AM",
    name: "Breakfast",
    desc: "Oats with banana + 2 boiled eggs · 480 kcal",
    icon: Coffee,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  },
  {
    time: "12:30 PM",
    name: "Lunch",
    desc: "Dal rice + cucumber salad + curd · 620 kcal",
    icon: UtensilsCrossed,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  {
    time: "4:00 PM",
    name: "Snack",
    desc: "Mixed nuts + green tea · 180 kcal",
    icon: Apple,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    time: "8:00 PM",
    name: "Dinner",
    desc: "Planned: 2 chapati + sabzi + salad · 340 kcal",
    icon: Salad,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
];

const MACROS = [
  { name: "Carbohydrates", percent: 58, color: "bg-blue-500" },
  { name: "Protein", percent: 22, color: "bg-green-500" },
  { name: "Healthy fats", percent: 20, color: "bg-yellow-500" },
];

const PRIORITISE = [
  { name: "Lentils", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800/30" },
  { name: "Leafy greens", color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800/30" },
  { name: "Whole grains", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/30" },
  { name: "Nuts", color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800/30" },
];

const LIMIT = [
  { name: "Fried snacks", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30" },
  { name: "Sugary drinks", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30" },
  { name: "Refined flour", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30" },
];

const TIPS = [
  {
    icon: "🌈",
    title: "Eat the rainbow",
    description:
      "Include 5 different coloured vegetables weekly. Each colour delivers unique phytonutrients that processed foods cannot replicate.",
  },
  {
    icon: "⏰",
    title: "Meal timing matters",
    description:
      "Eating the largest meal before 2 PM and lighter meals after improves metabolic rate and reduces blood sugar spikes by up to 18%.",
  },
  {
    icon: "🍽️",
    title: "Plate method",
    description:
      "Fill your plate with vegetables, a quarter with protein, and a quarter with complex carbs. Simple, effective, no counting required.",
  },
  {
    icon: "💧",
    title: "Drink before meals",
    description:
      "500 ml of water 30 minutes before eating reduces meal calorie intake by an average of 13% and supports digestion.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function NutritionTab() {
  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {NUTRITION_STATS.map((s) => (
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
                {s.target}
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.barColor}`}
                style={{ width: `${s.progress}%` }}
              />
            </div>
            <span className={`text-xs mt-1 ${s.statusColor}`}>{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Meals */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Today&apos;s Meals
          </h3>
          <div className="space-y-3">
            {MEALS.map((m) => (
              <div key={m.name} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {m.time}
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {m.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macronutrient + Foods */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Macronutrient Balance
            </h3>
            <div className="space-y-2.5">
              {MACROS.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24">
                    {m.name}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color}`}
                      style={{ width: `${m.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-10 text-right">
                    {m.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Foods to Prioritise Today
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRIORITISE.map((f) => (
                <span
                  key={f.name}
                  className={`px-2.5 py-1 rounded-full text-xs border ${f.color}`}
                >
                  {f.name}
                </span>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Foods to Limit
            </h3>
            <div className="flex flex-wrap gap-2">
              {LIMIT.map((f) => (
                <span
                  key={f.name}
                  className={`px-2.5 py-1 rounded-full text-xs border ${f.color}`}
                >
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advisory */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/30">
          <p className="text-xs text-green-700 dark:text-green-300">
            Good meal balance today. Add a handful of leafy greens at dinner to
            boost your fibre by 4-5g.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Personalised Nutrition Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{tip.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
