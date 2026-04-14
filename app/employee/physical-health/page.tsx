"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import VitalsTab from "@/components/physical-health/VitalsTab";
import NutritionTab from "@/components/physical-health/NutritionTab";
import SleepTab from "@/components/physical-health/SleepTab";
import ExerciseTab from "@/components/physical-health/ExerciseTab";
import MedicationTab from "@/components/physical-health/MedicationTab";
import HealthScoreTab from "@/components/physical-health/HealthScoreTab";
import ChatPopup from "@/components/physical-health/ChatPopup";

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "vitals", label: "Vitals" },
  { id: "nutrition", label: "Nutrition" },
  { id: "sleep", label: "Sleep" },
  { id: "exercise", label: "Exercise" },
  { id: "medication", label: "Medication" },
  { id: "health-score", label: "Health Score" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhysicalHealthPage() {
  const { loading: userLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("vitals");

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "vitals":
        return <VitalsTab />;
      case "nutrition":
        return <NutritionTab />;
      case "sleep":
        return <SleepTab />;
      case "exercise":
        return <ExerciseTab />;
      case "medication":
        return <MedicationTab />;
      case "health-score":
        return <HealthScoreTab />;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Physical Health Dashboard
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Track your vitals, nutrition, sleep, exercise, medication and overall
          health score
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5 shadow-sm">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-20">{renderTab()}</div>

      {/* Chat popup — bottom right corner */}
      <ChatPopup />
    </div>
  );
}
