'use client';

import { useEffect, useState } from 'react';
import {
  User as UserIcon, Mail, Phone, Briefcase, Building2,
  Shield, CheckCircle2, XCircle, RefreshCw, Edit2,
} from 'lucide-react';
import { withAuth } from '@/components/auth/with-auth';
import { BrandLoader } from '@/components/loader';
import { apiGet } from '@/lib/api-client';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FullProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  companyName: string;
  industry: string | null;
  companySize: string | null;
  jobTitle: string | null;
  phone: string | null;
  isActive: boolean;
  permissions: {
    can_view_team_reports: boolean;
    can_manage_employees: boolean;
    can_approve_leaves: boolean;
    can_view_analytics: boolean;
    can_create_programs: boolean;
    skip_level_access: boolean;
  };
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function roleBadge(role: string) {
  const map: Record<string, string> = {
    employee: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    manager:  'bg-blue-50  text-blue-600  dark:bg-blue-900/20  dark:text-blue-400',
    hr:       'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    employer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  };
  return map[role] ?? map.employee;
}

function PermRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {granted
        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
        : <XCircle      className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {value || <span className="text-gray-300 dark:text-gray-600 italic">Not set</span>}
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function EmployeeProfilePage() {
  const [profile, setProfile]   = useState<FullProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await apiGet<FullProfile>('/auth/profile');
      setProfile(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return <BrandLoader color="bg-emerald-400" />;
  if (!profile) return null;

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown';

  const perms = profile.permissions ?? {};

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1000px] mx-auto space-y-5">

      {/* ── Header card ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/30 flex-shrink-0">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${roleBadge(profile.role)}`}>
                  {profile.role}
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  profile.isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${profile.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            aria-label="Refresh profile"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Joined */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pl-20">
          Member since <span className="font-semibold text-gray-600 dark:text-gray-300">{joinedDate}</span>
        </p>
      </div>

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Personal Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Personal Information</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Your account details from our records</p>
          <InfoRow icon={UserIcon}   label="First Name"   value={profile.firstName} />
          <InfoRow icon={UserIcon}   label="Last Name"    value={profile.lastName} />
          <InfoRow icon={Mail}       label="Email"        value={profile.email} />
          <InfoRow icon={Phone}      label="Phone"        value={profile.phone} />
          <InfoRow icon={Briefcase}  label="Job Title"    value={profile.jobTitle} />
        </div>

        {/* Company Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Company</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Your organisation details</p>
          <InfoRow icon={Building2}  label="Company Name"  value={profile.companyName} />
          <InfoRow icon={Briefcase}  label="Industry"      value={profile.industry} />
          <InfoRow icon={UserIcon}   label="Company Size"  value={profile.companySize} />
          <InfoRow icon={Shield}     label="Company ID"    value={profile.companyId} />
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Access Permissions</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">What you are allowed to do in the platform</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <PermRow label="View Team Reports"  granted={!!perms.can_view_team_reports} />
              <PermRow label="Manage Employees"   granted={!!perms.can_manage_employees} />
              <PermRow label="Approve Leaves"     granted={!!perms.can_approve_leaves} />
            </div>
            <div>
              <PermRow label="View Analytics"     granted={!!perms.can_view_analytics} />
              <PermRow label="Create Programs"    granted={!!perms.can_create_programs} />
              <PermRow label="Skip-Level Access"  granted={!!perms.skip_level_access} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default withAuth(EmployeeProfilePage, ['employee', 'manager', 'hr', 'employer']);
