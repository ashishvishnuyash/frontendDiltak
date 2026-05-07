/**
 * hierarchy-service.ts
 * Firebase has been removed. Hierarchy data now comes from the custom REST API.
 * These stubs keep existing imports from breaking.
 */

import type { User, HierarchyNode, TeamStats, ManagerPermissions, HierarchyAnalytics } from '@/types/index';

export async function getDirectReports(_managerId: string): Promise<User[]> {
  return [];
}

export async function getTeamHierarchy(_managerId: string, _maxDepth = 3): Promise<HierarchyNode[]> {
  return [];
}

export async function getAllSubordinates(_managerId: string): Promise<User[]> {
  return [];
}

export async function canAccessEmployeeData(_viewerId: string, _targetEmployeeId: string): Promise<boolean> {
  return false;
}

export async function getTeamStats(_managerId: string): Promise<TeamStats> {
  return {
    team_size: 0,
    direct_reports: 0,
    total_subordinates: 0,
    avg_team_wellness: 0,
    high_risk_team_members: 0,
    team_departments: [],
    recent_reports_count: 0,
  };
}

export function getManagerPermissions(user: User): ManagerPermissions {
  const isManager = ['manager', 'hr', 'admin', 'employer'].includes(user.role);
  return {
    can_view_direct_reports: isManager,
    can_view_team_reports: user.can_view_team_reports || false,
    can_view_subordinate_teams: user.skip_level_access || false,
    can_approve_leaves: user.can_approve_leaves || false,
    can_manage_team_members: user.can_manage_employees || false,
    can_access_analytics: (user.hierarchy_level ?? 999) <= 3 || user.role === 'hr',
    hierarchy_access_level: user.skip_level_access ? 2 : 1,
  };
}

export async function updateReportingChain(_employeeId: string, _newManagerId?: string): Promise<void> {
  // No-op — handled by backend API
}

export async function getHierarchyAnalytics(_companyId: string): Promise<HierarchyAnalytics> {
  return {
    team_wellness_comparison: [],
    department_performance: [],
    hierarchy_health: [],
  };
}

export async function getHierarchyFilteredReports(_userId: string, _companyId: string, _days = 7): Promise<any[]> {
  return [];
}
