
"use client";

import { useState, useEffect } from "react";
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
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import type {
  CheckInHistoryItem,
  ExerciseType,
  PhysicalCheckInRequest,
} from "@/types/physical-health";
import ServerAddress from "@/constent/ServerAddress";

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
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              {label}
            </h4>
            <span className="text-sm font-semibold text-foreground">
              {value}
              <span className="text-xs text-muted-foreground">
                /{max}
              </span>
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
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
        className="w-full accent-primary"
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{minLabel ? `${min} · ${minLabel}` : min}</span>
        <span>{maxLabel ? `${maxLabel} · ${max}` : max}</span>
      </div>
    </div>
  );
}

export default function CheckInTab() {
  const [score, setScore] = useState<{ last_checkin_date: string | null } | null>(null);
  const [history, setHistory] = useState<{ checkins: CheckInHistoryItem[] }>({ checkins: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const alreadyCheckedInToday = !!(
    score?.last_checkin_date && isSameLocalDay(score.last_checkin_date, today)
  );
  const todaysCheckin: CheckInHistoryItem | null = alreadyCheckedInToday
    ? history.checkins.find((c) => isSameLocalDay(c.created_at, today)) ?? null
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

  // Fetch score and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Fetch score
        const scoreResponse = await axios.get(`${ServerAddress}/physical-health/score`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        setScore(scoreResponse.data);

        // Fetch check-ins history
        const historyResponse = await axios.get(`${ServerAddress}/physical-health/check-ins`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        setHistory({ checkins: historyResponse.data.checkins || [] });
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(`${ServerAddress}/physical-health/check-in`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.data.success) {
        setNudge(response.data.nudge ?? null);
        
        toast({
          title: "Check-in saved",
          description: "Your daily check-in has been recorded.",
        });
        
        resetForm();
        
        // Refresh data after successful check-in
        const scoreResponse = await axios.get(`${ServerAddress}/physical-health/score`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        setScore(scoreResponse.data);

        const historyResponse = await axios.get(`${ServerAddress}/physical-health/check-ins`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        setHistory({ checkins: historyResponse.data.checkins || [] });
      } else {
        throw new Error("Check-in failed");
      }
      
    } catch (err) {
      console.error('Error submitting check-in:', err);
      toast({
        title: "Check-in failed",
        description: err instanceof Error ? err.message : "Could not submit check-in.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (alreadyCheckedInToday) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-success/30 bg-success/10 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-success/20">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                You&apos;ve already checked in today
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Come back tomorrow to log your next check-in. One check-in per
                day keeps your score accurate.
              </p>
            </div>
          </div>
        </div>

        {todaysCheckin && (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Today&apos;s check-in
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-foreground/80">
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
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-foreground">
                Check-in saved
              </h4>
              <p className="text-xs leading-relaxed text-foreground/80">
                {nudge}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SliderField
          label="Energy level"
          description="How energetic do you feel today?"
          icon={Zap}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          value={energy}
          onChange={setEnergy}
        />
        <SliderField
          label="Sleep quality"
          description="How well did you sleep last night?"
          icon={Moon}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={sleepQuality}
          onChange={setSleepQuality}
        />
        <SliderField
          label="Nutrition quality"
          description="How balanced was your eating today?"
          icon={Utensils}
          iconBg="bg-success/10"
          iconColor="text-success"
          value={nutrition}
          onChange={setNutrition}
        />
        <SliderField
          label="Hydration"
          description="How well hydrated are you?"
          icon={Droplets}
          iconBg="bg-info/10"
          iconColor="text-info"
          value={hydration}
          onChange={setHydration}
        />
        <SliderField
          label="Pain level"
          description="Higher means less pain — 10 is pain-free."
          icon={Heart}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          value={pain}
          onChange={setPain}
          minLabel="Severe pain"
          maxLabel="No pain"
        />

        {/* Sleep hours */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/10">
              <Moon className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                Sleep hours
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
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
              className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">
              hours
            </span>
          </div>
        </div>
      </div>

      {/* Exercise block */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-warning/10">
            <Dumbbell className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-foreground">
              Exercise
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Did you exercise today?
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={exerciseDone}
              onChange={(e) => setExerciseDone(e.target.checked)}
              className="peer sr-only"
            />
            <div className="relative h-6 w-11 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {exerciseDone && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Minutes
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Type
              </label>
              <select
                value={exerciseType}
                onChange={(e) =>
                  setExerciseType(e.target.value as ExerciseType)
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-foreground">
              Notes
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Anything else worth capturing about today?
            </p>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional — felt stressed in the afternoon, slept with window open, etc."
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Flame className="h-5 w-5" />
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
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
