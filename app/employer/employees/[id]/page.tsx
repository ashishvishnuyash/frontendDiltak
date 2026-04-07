'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, Calendar, User as UserIcon,
  Briefcase, Building2, Shield, CheckCircle2, XCircle,
  Activity, BarChart2, RefreshCw, Power, UserMinus,
} from 'lucide-react';
import { withAuth } from '@/components/auth/with-auth';
import { BrandLoader } from '@/components/loader';
import { apiGet, apiPost, API_BASE } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EmployeeProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string | null;
  position: string | null;
  phone: string | null;
  companyId: string;
  managerId: string | null;
  hierarchyLevel: number;
  isActive: boolean;
  permissions: Record<string, boolean>;
  createdAt: string | null;
  createdBy: string | null;
}

interface ActivitySummary {
  uid: string;
  companyId: string;
  totalCheckIns: number;
  totalSessions: number;
  lastActiveAt: string | null;
  avgMoodScore: number | null;
  avgStressLevel: number | null;
  riskLevel: 'low' | 'medium' | 'high' | null;
  sessionModalities: Record<string, number>;
  computedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function roleBadge(role: string) {
  const map: Record<string, string> = {
    employee: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    manager:  'bg-blue-50  text-blue-600  dark:bg-blue-900/20  dark:text-blue-400',
    hr:       'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };
  return map[role] ?? map.employee;
}

function riskColor(r: string | null) {
  if (r === 'high')   return 'text-red-600    bg-red-50    dark:bg-red-900/20    border-red-200   dark:border-red-800';
  if (r === 'medium') return 'text-amber-600  bg-amber-50  dark:bg-amber-900/20  border-amber-200 dark:border-amber-800';
  return                     'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value || <span className="text-gray-300 dark:text-gray-600 italic">Not set</span>}</p>
      </div>
    </div>
  );
}

function PermRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {granted
        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
        : <XCircle      className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl gap-1">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-xl font-black text-gray-800 dark:text-gray-100">{value}</p>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">{label}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function EmployeeDetailPage() {
  const params     = useParams();
  const router     = useRouter();
  const uid        = params.id as string;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [loading, setLoading]   = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const loadEmployee = async () => {
    setLoading(true);
    try {
      const [emp, act] = await Promise.all([
        apiGet<EmployeeProfile>(`/employees/${uid}`),
        apiGet<ActivitySummary>(`/employees/${uid}/activity`).catch(() => null),
      ]);
      setEmployee(emp);
      setActivity(act);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load employee';
      toast.error(msg);
      router.push('/employer/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (uid) loadEmployee(); }, [uid]);

  const handleToggleActive = async () => {
    if (!employee) return;
    const endpoint = employee.isActive
      ? `/employees/${uid}/deactivate`
      : `/employees/${uid}/reactivate`;
    setActionBusy(true);
    try {
      await apiPost(endpoint, {});
      await loadEmployee();
      toast.success(`Employee ${employee.isActive ? 'deactivated' : 'reactivated'} successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast.error(msg);
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) return <BrandLoader color="bg-emerald-400" />;
  if (!employee) return null;

  const initials = `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase();
  const joinedDate = employee.createdAt
    ? new Date(employee.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown';
  const lastActive = activity?.lastActiveAt
    ? new Date(activity.lastActiveAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1100px] mx-auto space-y-5">

      {/* Back */}
      <Link href="/employer/employees"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Employees
      </Link>

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/30 flex-shrink-0">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{employee.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${roleBadge(employee.role)}`}>
                  {employee.role}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  employee.isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${employee.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
                {activity?.riskLevel && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${riskColor(activity.riskLevel)}`}>
                    {activity.riskLevel} risk
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => loadEmployee()}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleToggleActive}
              disabled={actionBusy}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 ${
                employee.isActive
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {employee.isActive
                ? <><UserMinus className="h-3.5 w-3.5" /> Deactivate</>
                : <><Power className="h-3.5 w-3.5" /> Reactivate</>}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pl-20">
          Member since <span className="font-semibold text-gray-600 dark:text-gray-300">{joinedDate}</span>
          {lastActive && <> · Last active <span className="font-semibold text-gray-600 dark:text-gray-300">{lastActive}</span></>}
        </p>
      </div>

      {/* ── Activity Stats ── */}
      {activity && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Activity Summary</h2>
            <span className="text-[10px] text-gray-400 ml-auto">Aggregated · No personal content shared</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={BarChart2}   label="Check-Ins"      value={activity.totalCheckIns}  color="bg-blue-50 text-blue-500 dark:bg-blue-900/20" />
            <StatCard icon={Activity}    label="Sessions"        value={activity.totalSessions}  color="bg-purple-50 text-purple-500 dark:bg-purple-900/20" />
            <StatCard icon={UserIcon}    label="Avg Mood (1–10)" value={activity.avgMoodScore?.toFixed(1) ?? '—'}  color="bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20" />
            <StatCard icon={Shield}      label="Avg Stress (1–10)" value={activity.avgStressLevel?.toFixed(1) ?? '—'} color="bg-amber-50 text-amber-500 dark:bg-amber-900/20" />
          </div>
          {Object.keys(activity.sessionModalities ?? {}).length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Sessions: {Object.entries(activity.sessionModalities).map(([k,v]) => `${k}: ${v}`).join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* ── Two‑column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Personal Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Profile Details</h2>
          <InfoRow icon={Mail}       label="Email"            value={employee.email} />
          <InfoRow icon={Phone}      label="Phone"            value={employee.phone} />
          <InfoRow icon={Briefcase}  label="Department"       value={employee.department} />
          <InfoRow icon={Briefcase}  label="Position"         value={employee.position} />
          <InfoRow icon={Building2}  label="Hierarchy Level"  value={`Level ${employee.hierarchyLevel}`} />
          <InfoRow icon={UserIcon}   label="Manager ID"       value={employee.managerId} />
          <InfoRow icon={UserIcon}   label="UID"              value={employee.uid} />
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Access Permissions</h2>
          <PermRow label="View Team Reports"  granted={!!employee.permissions?.can_view_team_reports} />
          <PermRow label="Manage Employees"   granted={!!employee.permissions?.can_manage_employees} />
          <PermRow label="Approve Leaves"     granted={!!employee.permissions?.can_approve_leaves} />
          <PermRow label="View Analytics"     granted={!!employee.permissions?.can_view_analytics} />
          <PermRow label="Create Programs"    granted={!!employee.permissions?.can_create_programs} />
          <PermRow label="Skip-Level Access"  granted={!!employee.permissions?.skip_level_access} />
        </div>
      </div>
    </div>
  );
}

export default withAuth(EmployeeDetailPage, ['employer', 'hr']);