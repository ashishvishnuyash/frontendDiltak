export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'employee' | 'hr' | 'admin' | 'employer' | 'manager';
  company_id?: string;
  department?: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Employer specific fields
  company_name?: string;
  company_size?: string;
  industry?: string;
  // Employee specific fields
  employee_id?: string;
  manager_id?: string;
  hire_date?: string;
  // Hierarchy fields
  hierarchy_level?: number; // 0=CEO, 1=VP, 2=Director, 3=Manager, 4=Employee
  reporting_chain?: string[]; // Array of manager IDs from top to direct manager
  direct_reports?: string[]; // Array of direct subordinate IDs
  is_department_head?: boolean;
  can_approve_leaves?: boolean;
  can_view_team_reports?: boolean;
  can_manage_employees?: boolean;
  skip_level_access?: boolean; // Can view reports of subordinates' subordinates
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  description?: string;
  website?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  owner_id: string; // The employer who owns this company
}

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  department: string;
  position: string;
  manager_id?: string;
  hire_date: string;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
  updated_at: string;
}

export interface MentalHealthReport {
  id: string;
  employee_id: string;
  company_id: string;
  stress_level: number;
  mood_rating: number;
  energy_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  anxiety_level: number;
  confidence_level: number;
  sleep_quality: number;
  overall_wellness: number;
  comments?: string;
  ai_analysis?: string;
  sentiment_score?: number;
  emotion_tags?: string[];
  risk_level: 'low' | 'medium' | 'high';
  session_type: 'text' | 'voice';
  session_duration?: number;
  created_at: string;
  updated_at: string;
  // Additional fields for backward compatibility
  anxious_level?: number;
  confident_level?: number;
  // AI-generated comprehensive metrics
  metrics?: {
    emotional_tone: number;
    stress_anxiety: number;
    motivation_engagement: number;
    social_connectedness: number;
    self_esteem: number;
    assertiveness: number;
    work_life_balance_metric: number;
    cognitive_functioning: number;
    emotional_regulation: number;
    substance_use: number;
  };
  metrics_explanation?: {
    emotional_tone: string;
    stress_anxiety: string;
    motivation_engagement: string;
    social_connectedness: string;
    self_esteem: string;
    assertiveness: string;
    work_life_balance_metric: string;
    cognitive_functioning: string;
    emotional_regulation: string;
    substance_use: string;
  };
  physical_health_metrics?: {
    physical_activity: {
      exercise_frequency: number;
      exercise_type: string;
      daily_sitting_hours: number;
      stretch_breaks: boolean;
    };
    nutrition_hydration: {
      meals_per_day: number;
      water_intake_liters: number;
      fruit_veg_intake: 'adequate' | 'inadequate';
      skips_meals: boolean;
    };
    pain_discomfort: {
      back_pain: 'none' | 'occasional' | 'frequent';
      neck_shoulder_pain: 'none' | 'occasional' | 'frequent';
      wrist_hand_pain: 'none' | 'occasional' | 'frequent';
      eye_strain: 'none' | 'occasional' | 'frequent';
      headaches_frequency: 'none' | 'occasional' | 'frequent';
    };
    lifestyle_risks: {
      smoking_status: 'non_smoker' | 'occasional' | 'regular';
      alcohol_frequency: 'never' | 'occasionally' | 'regularly';
      caffeine_dependence: boolean;
    };
    ergonomics: {
      chair_comfort: 'excellent' | 'good' | 'fair' | 'poor';
      screen_alignment?: boolean;
      work_break_frequency: 'frequent' | 'regular' | 'rare';
      work_mode: 'office' | 'wfh' | 'hybrid';
    };
    absenteeism: {
      sick_days_last_3_months: number;
      health_affects_productivity: boolean;
    };
  };
}

export interface ChatSession {
  id: string;
  employee_id: string;
  company_id: string;
  session_type: 'text' | 'voice';
  status: 'active' | 'completed' | 'abandoned';
  messages?: ChatMessage[];
  emotion_analysis?: EmotionAnalysis;
  report?: WellnessReport;
  duration?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  sender: 'user' | 'ai';
  emotion_detected?: string;
  sentiment_score?: number;
  timestamp: string;
  session_type?: 'text' | 'voice';
}

export interface EmotionAnalysis {
  dominant_emotion: string;
  emotion_scores: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  sentiment_score: number;
  confidence: number;
}

export interface DashboardStats {
  total_employees: number;
  total_managers: number;
  active_sessions: number;
  completed_reports: number;
  average_wellness_score: number;
  average_mood_score: number;
  average_stress_score: number;
  average_energy_score: number;
  high_risk_employees: number;
  medium_risk_employees: number;
  low_risk_employees: number;
  wellness_trend: 'improving' | 'stable' | 'declining';
  department_stats: { [key: string]: any };
  weekly_reports: number;
  participation_rate: number;
  last_updated: string;
  // Enhanced Dashboard Fields
  wellness_index?: EmployerWellnessIndex;
  burnout_trend?: EmployerBurnoutTrend;
  engagement_signals?: EmployerEngagementSignals;
  workload_friction?: EmployerWorkloadFriction;
  productivity_proxy?: EmployerProductivityProxy;
  early_warnings?: EmployerEarlyWarnings;
  suggested_actions?: EmployerSuggestedActions;
  department_comparison?: any;
}

export interface WellnessTrend {
  date: string;
  average_mood: number;
  average_stress: number;
  average_energy: number;
  total_reports: number;
}

export interface WellnessReport {
  mood: number;
  stress_score: number;
  anxious_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  energy_level: number;
  confident_level: number;
  sleep_quality: number;
  complete_report: string;
  session_type: 'text' | 'voice';
  session_duration: number;
  key_insights: string[];
  recommendations: string[];
  // New metrics (optional for backward compatibility)
  metrics?: {
    emotional_tone: number;
    stress_anxiety: number;
    motivation_engagement: number;
    social_connectedness: number;
    self_esteem: number;
    assertiveness: number;
    work_life_balance_metric: number;
    cognitive_functioning: number;
    emotional_regulation: number;
    substance_use: number;
  };
  metrics_explanation?: {
    emotional_tone: string;
    stress_anxiety: string;
    motivation_engagement: string;
    social_connectedness: string;
    self_esteem: string;
    assertiveness: string;
    work_life_balance_metric: string;
    cognitive_functioning: string;
    emotional_regulation: string;
    substance_use: string;
  };
}

// Toast types for the enhanced toast system
export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Hierarchy-specific interfaces
export interface Department {
  id: string;
  name: string;
  company_id: string;
  parent_department_id?: string;
  department_head_id?: string;
  hierarchy_path: string[]; // Array of parent department IDs
  budget_code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HierarchyNode {
  user: User;
  children: HierarchyNode[];
  level: number;
  isExpanded?: boolean;
}

export interface TeamStats {
  team_size: number;
  direct_reports: number;
  total_subordinates: number;
  avg_team_wellness: number;
  high_risk_team_members: number;
  team_departments: string[];
  recent_reports_count: number;
}

export interface ManagerPermissions {
  can_view_direct_reports: boolean;
  can_view_team_reports: boolean;
  can_view_subordinate_teams: boolean;
  can_approve_leaves: boolean;
  can_manage_team_members: boolean;
  can_access_analytics: boolean;
  hierarchy_access_level: number; // How many levels down they can access
}

export interface HierarchyAnalytics {
  team_wellness_comparison: {
    team_name: string;
    manager_name: string;
    avg_wellness: number;
    team_size: number;
    high_risk_count: number;
  }[];
  department_performance: {
    department: string;
    avg_wellness: number;
    employee_count: number;
    manager_count: number;
  }[];
  hierarchy_health: {
    level: number;
    level_name: string;
    avg_wellness: number;
    employee_count: number;
  }[];
}

/* ─── ENHANCED EMPLOYER DASHBOARD TYPES ─── */

export interface EmployerWellnessIndex {
  company_id: string;
  team_size_band: string;
  wellness_index: number;
  stress_score: number;
  engagement_score: number;
  check_in_participation_pct: number;
  period_days: number;
  trend_vs_prior_period: number;
  data_quality: 'high' | 'medium' | 'low';
  computed_at: string;
}

export interface EmployerBurnoutTrend {
  company_id: string;
  period_weeks: number;
  buckets: {
    label: string;
    percentage: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  weekly_distribution: any[]; // Changed to any[] to handle dynamic week keys like additionalProp1
  alert_level: string;
  computed_at: string;
}

export interface EmployerEngagementSignals {
  company_id: string;
  dau_pct: number;
  wau_pct: number;
  check_in_completion_pct: number;
  avg_session_depth_score: number;
  period_days: number;
  computed_at: string;
}

export interface EmployerWorkloadFriction {
  company_id: string;
  late_night_activity_pct: number;
  sentiment_shift_events: number;
  overload_pattern_score: number;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  period_days: number;
  computed_at: string;
}

export interface EmployerProductivityProxy {
  company_id: string;
  engagement_trend: number[];
  period_label: string[];
  correlation_note: string;
  data_quality: string;
  computed_at: string;
}

export interface EmployerEarlyWarnings {
  company_id: string;
  alerts: {
    signal: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
    period: string;
    attribution: 'none' | 'aggregated';
  }[];
  overall_risk: string;
  computed_at: string;
}

export interface EmployerSuggestedActions {
  company_id: string;
  actions: {
    trigger: string;
    category: string;
    action: string;
    expected_impact: string;
    playbook_steps: string[];
    priority: string;
  }[];
  generated_at: string;
}

