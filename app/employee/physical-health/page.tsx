"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import HealthScoreTab from "@/components/physical-health/HealthScoreTab";
import CheckInTab from "@/components/physical-health/CheckInTab";
import TrendsTab from "@/components/physical-health/TrendsTab";
import MedicalDocsTab from "@/components/physical-health/MedicalDocsTab";
import ReportsTab from "@/components/physical-health/ReportsTab";
import ChatPopup from "@/components/physical-health/ChatPopup";

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "health-score", label: "Health Score" },
  { id: "check-in", label: "Daily Check-in" },
  { id: "trends", label: "Trends" },
  { id: "medical-docs", label: "Medical Docs" },
  { id: "reports", label: "Health Reports" },
] as const;

export type PhysicalHealthTabId = (typeof TABS)[number]["id"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhysicalHealthPage() {
  const { loading: userLoading } = useAuth();
  const [activeTab, setActiveTab] =
    useState<PhysicalHealthTabId>("health-score");

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "health-score":
        return <HealthScoreTab onNavigate={setActiveTab} />;
      case "check-in":
        return <CheckInTab />;
      case "trends":
        return <TrendsTab />;
      case "medical-docs":
        return <MedicalDocsTab />;
      case "reports":
        return <ReportsTab />;
    }
  };

  return (
    // <div className="container mx-auto space-y-4 sm:space-y-6 px-3 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-5">

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Physical Health
        </h1>
        <p className="text-sm text-muted-foreground">
          Track metrics, access medical reports, and manage your overall well-being.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-hidden rounded-t-lg border-b border-border bg-background shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-0.5 sm:px-1 pt-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-24 sm:pb-20">{renderTab()}</div>

      {/* Chat popup — bottom right corner */}
      <ChatPopup />
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useAuth } from "@/contexts/auth-context";
// import { Loader2 } from "lucide-react";
// import NutritionTab from "@/components/physical-health/NutritionTab";
// import SleepTab from "@/components/physical-health/SleepTab";
// import ExerciseTab from "@/components/physical-health/ExerciseTab";
// import HealthScoreTab from "@/components/physical-health/HealthScoreTab";
// import CheckInTab from "@/components/physical-health/CheckInTab";
// import TrendsTab from "@/components/physical-health/TrendsTab";
// import MedicalDocsTab from "@/components/physical-health/MedicalDocsTab";
// import ReportsTab from "@/components/physical-health/ReportsTab";
// import ChatPopup from "@/components/physical-health/ChatPopup";

// // ─── Tab config ──────────────────────────────────────────────────────────────

// const TABS = [
//   { id: "health-score", label: "Health Score" },
//   { id: "check-in", label: "Daily Check-in" },
//   { id: "trends", label: "Trends" },
//   { id: "nutrition", label: "Nutrition" },
//   { id: "sleep", label: "Sleep" },
//   { id: "exercise", label: "Exercise" },
//   { id: "medical-docs", label: "Medical Docs" },
//   { id: "reports", label: "Health Reports" },
// ] as const;

// export type PhysicalHealthTabId = (typeof TABS)[number]["id"];

// // ─── Component ───────────────────────────────────────────────────────────────

// export default function PhysicalHealthPage() {
//   const { loading: userLoading } = useAuth();
//   const [activeTab, setActiveTab] =
//     useState<PhysicalHealthTabId>("health-score");

//   if (userLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   const renderTab = () => {
//     switch (activeTab) {
//       case "health-score":
//         return <HealthScoreTab onNavigate={setActiveTab} />;
//       case "check-in":
//         return <CheckInTab />;
//       case "trends":
//         return <TrendsTab />;
//       case "nutrition":
//         return <NutritionTab />;
//       case "sleep":
//         return <SleepTab />;
//       case "exercise":
//         return <ExerciseTab />;
//       case "medical-docs":
//         return <MedicalDocsTab />;
//       case "reports":
//         return <ReportsTab />;
//     }
//   };

//   return (
//     <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-5">
//       {/* Page header */}
//       <div>
//         <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
//           Physical Health Dashboard
//         </h1>
//         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           Track your daily check-ins, sleep, exercise, nutrition, medical
//           reports and overall health score.
//         </p>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5 shadow-sm">
//         <div className="flex gap-1 overflow-x-auto">
//           {TABS.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
//                 activeTab === tab.id
//                   ? "bg-blue-500 text-white shadow-sm"
//                   : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Tab content */}
//       <div className="pb-20">{renderTab()}</div>

//       {/* Chat popup — bottom right corner */}
//       <ChatPopup />
//     </div>
//   );
// }
