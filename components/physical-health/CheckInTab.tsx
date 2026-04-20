"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  Heart,
  Loader2,
  Moon,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import { usePhysicalHealth } from "@/hooks/use-physical-health";
import { toast } from "@/hooks/use-toast";
import type {
  CheckInHistoryItem,
  ExerciseType,
  PhysicalCheckInRequest,
} from "@/types/physical-health";

function isSameLocalDay(aIso: string, b: Date): boolean {
  const a = new Date(aIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "walk", label: "Walk" },
  { value: "gym", label: "Gym" },
  { value: "yoga", label: "Yoga" },
  { value: "sport", label: "Sport" },
  { value: "other", label: "Other" },
];

interface SliderFieldProps {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

function SliderField({
  label,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  value,
  onChange,
  min = 1,
  max = 10,
  minLabel,
  maxLabel,
}: SliderFieldProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {label}
            </h4>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {value}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                /{max}
              </span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
        <span>{minLabel ? `${min} · ${minLabel}` : min}</span>
        <span>{maxLabel ? `${maxLabel} · ${max}` : max}</span>
      </div>
    </div>
  );
}

export default function CheckInTab() {
  const { score, history, scoreLoading, submitCheckin, submitting } =
    usePhysicalHealth();

  const today = new Date();
  const alreadyCheckedInToday = !!(
    score?.last_checkin_date && isSameLocalDay(score.last_checkin_date, today)
  );
  const todaysCheckin: CheckInHistoryItem | null = alreadyCheckedInToday
    ? history?.checkins.find((c) => isSameLocalDay(c.created_at, today)) ?? null
    : null;

  const [energy, setEnergy] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(0);
  const [exerciseType, setExerciseType] = useState<ExerciseType>("none");
  const [nutrition, setNutrition] = useState(5);
  const [pain, setPain] = useState(10);
  const [hydration, setHydration] = useState(5);
  const [notes, setNotes] = useState("");

  const [nudge, setNudge] = useState<string | null>(null);

  const resetForm = () => {
    setEnergy(5);
    setSleepQuality(5);
    setSleepHours(7);
    setExerciseDone(false);
    setExerciseMinutes(0);
    setExerciseType("none");
    setNutrition(5);
    setPain(10);
    setHydration(5);
    setNotes("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sleepHours < 0 || sleepHours > 24) {
      toast({
        title: "Invalid sleep hours",
        description: "Please enter a value between 0 and 24.",
        variant: "destructive",
      });
      return;
    }
    if (exerciseDone && exerciseMinutes <= 0) {
      toast({
        title: "Missing exercise duration",
        description: "Enter how many minutes you exercised.",
        variant: "destructive",
      });
      return;
    }

    const payload: PhysicalCheckInRequest = {
      energy_level: energy,
      sleep_quality: sleepQuality,
      sleep_hours: sleepHours,
      exercise_done: exerciseDone,
      exercise_minutes: exerciseDone ? exerciseMinutes : 0,
      exercise_type: exerciseDone ? exerciseType : "none",
      nutrition_quality: nutrition,
      pain_level: pain,
      hydration,
      notes: notes.trim() || null,
    };

    try {
      const res = await submitCheckin(payload);
      setNudge(res.nudge ?? null);
      toast({
        title: "Check-in saved",
        description: "Your daily check-in has been recorded.",
      });
      resetForm();
    } catch (err) {
      toast({
        title: "Check-in failed",
        description:
          err instanceof Error ? err.message : "Could not submit check-in.",
        variant: "destructive",
      });
    }
  };

  if (scoreLoading && !score) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (alreadyCheckedInToday) {
    return (
      <div className="space-y-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-green-200 dark:border-green-800/40 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                You&apos;ve already checked in today
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Come back tomorrow to log your next check-in. One check-in per
                day keeps your score accurate.
              </p>
            </div>
          </div>
        </div>

        {todaysCheckin && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Today&apos;s check-in
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SummaryCell label="Energy" value={`${todaysCheckin.energy_level}/10`} />
              <SummaryCell label="Sleep quality" value={`${todaysCheckin.sleep_quality}/10`} />
              <SummaryCell label="Sleep hours" value={`${todaysCheckin.sleep_hours}h`} />
              <SummaryCell label="Nutrition" value={`${todaysCheckin.nutrition_quality}/10`} />
              <SummaryCell label="Pain relief" value={`${todaysCheckin.pain_level}/10`} />
              <SummaryCell label="Hydration" value={`${todaysCheckin.hydration}/10`} />
              <SummaryCell
                label="Exercise"
                value={
                  todaysCheckin.exercise_done
                    ? `${todaysCheckin.exercise_minutes} min · ${todaysCheckin.exercise_type}`
                    : "None"
                }
              />
            </div>
            {todaysCheckin.notes && (
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <span className="font-medium">Notes:</span> {todaysCheckin.notes}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {nudge && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-green-200 dark:border-green-800/40 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                Check-in saved
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {nudge}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SliderField
          label="Energy level"
          description="How energetic do you feel today?"
          icon={Zap}
          iconBg="bg-amber-50 dark:bg-amber-950/20"
          iconColor="text-amber-600 dark:text-amber-400"
          value={energy}
          onChange={setEnergy}
        />
        <SliderField
          label="Sleep quality"
          description="How well did you sleep last night?"
          icon={Moon}
          iconBg="bg-indigo-50 dark:bg-indigo-950/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
          value={sleepQuality}
          onChange={setSleepQuality}
        />
        <SliderField
          label="Nutrition quality"
          description="How balanced was your eating today?"
          icon={Utensils}
          iconBg="bg-green-50 dark:bg-green-950/20"
          iconColor="text-green-600 dark:text-green-400"
          value={nutrition}
          onChange={setNutrition}
        />
        <SliderField
          label="Hydration"
          description="How well hydrated are you?"
          icon={Droplets}
          iconBg="bg-blue-50 dark:bg-blue-950/20"
          iconColor="text-blue-600 dark:text-blue-400"
          value={hydration}
          onChange={setHydration}
        />
        <SliderField
          label="Pain level"
          description="Higher means less pain — 10 is pain-free."
          icon={Heart}
          iconBg="bg-red-50 dark:bg-red-950/20"
          iconColor="text-red-600 dark:text-red-400"
          value={pain}
          onChange={setPain}
          minLabel="Severe pain"
          maxLabel="No pain"
        />

        {/* Sleep hours */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center flex-shrink-0">
              <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Sleep hours
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Total hours slept last night.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              hours
            </span>
          </div>
        </div>
      </div>

      {/* Exercise block */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Exercise
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Did you exercise today?
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={exerciseDone}
              onChange={(e) => setExerciseDone(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {exerciseDone && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Minutes
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Type
              </label>
              <select
                value={exerciseType}
                onChange={(e) =>
                  setExerciseType(e.target.value as ExerciseType)
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXERCISE_TYPES.filter((t) => t.value !== "none").map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Notes
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Anything else worth capturing about today?
            </p>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional — felt stressed in the afternoon, slept with window open, etc."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Flame className="h-4 w-4" />
              Submit check-in
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
        {value}
      </p>
    </div>
  );
}
