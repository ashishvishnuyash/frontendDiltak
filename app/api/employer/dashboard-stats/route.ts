import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';


/**
 * Maps backend burnout distribution keys to what the chart expects.
 * Backend returns: {week, low_pct, medium_pct, high_pct}
 * Chart expects:   {week, low, medium, high}
 */
function normalizeBurnoutDistribution(dist: any[]): any[] {
  if (!Array.isArray(dist)) return [];
  return dist.map(item => ({
    week: item.week ?? '',
    low: item.low_pct ?? item.low ?? 0,
    medium: item.medium_pct ?? item.medium ?? 0,
    high: item.high_pct ?? item.high ?? 0,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');
    const authHeader = request.headers.get('Authorization');

    if (!companyId) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
    }

    const config = {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    };

    const safe = (p: Promise<any>) => p.catch(e => e.response || null);
    const ok = (res: any) => res?.status === 200 ? res.data : null;

    // Sequential calls — each call populates backend caches that the
    // next call benefits from, avoiding Firestore quota exhaustion.
    // On localhost this adds ~1-2s total but prevents 429 errors.
    const wellnessIndexRes      = await safe(axios.get(`${ServerAddress}/employer/wellness-index?company_id=${companyId}&period_days=14`, config));
    const burnoutTrendRes       = await safe(axios.get(`${ServerAddress}/employer/burnout-trend?company_id=${companyId}&weeks=4`, config));
    const engagementSignalsRes  = await safe(axios.get(`${ServerAddress}/employer/engagement-signals?company_id=${companyId}&period_days=14`, config));
    const workloadFrictionRes   = await safe(axios.get(`${ServerAddress}/employer/workload-friction?company_id=${companyId}&period_days=14`, config));
    const productivityProxyRes  = await safe(axios.get(`${ServerAddress}/employer/productivity-proxy?company_id=${companyId}&weeks=4`, config));
    const earlyWarningsRes      = await safe(axios.get(`${ServerAddress}/employer/early-warnings?company_id=${companyId}&period_days=14`, config));
    const suggestedActionsRes   = await safe(axios.get(`${ServerAddress}/employer/suggested-actions?company_id=${companyId}`, config));
    const deptComparisonRes     = await safe(axios.get(`${ServerAddress}/employer/org/department-comparison?company_id=${companyId}&period_days=14&mask_labels=false`, config));
    const orgWellnessTrendRes   = await safe(axios.get(`${ServerAddress}/employer/org/wellness-trend?company_id=${companyId}&weeks=12`, config));
    const roiImpactRes          = await safe(axios.get(`${ServerAddress}/employer/org/roi-impact?company_id=${companyId}&weeks=8`, config));
    const programEffectivenessRes = await safe(axios.get(`${ServerAddress}/employer/org/program-effectiveness?company_id=${companyId}`, config));

    const wellnessIndex = ok(wellnessIndexRes);
    const burnoutTrend = ok(burnoutTrendRes);
    const engagementSignals = ok(engagementSignalsRes);
    const workloadFriction = ok(workloadFrictionRes);
    const productivityProxy = ok(productivityProxyRes);
    const earlyWarnings = ok(earlyWarningsRes);
    const suggestedActions = ok(suggestedActionsRes);
    const departmentComparison = ok(deptComparisonRes);
    const orgWellnessTrend = ok(orgWellnessTrendRes);
    const roiImpact = ok(roiImpactRes);
    const programEffectiveness = ok(programEffectivenessRes);

    // Normalize specific data structures the UI expects
    if (burnoutTrend && burnoutTrend.weekly_distribution) {
      burnoutTrend.weekly_distribution = normalizeBurnoutDistribution(burnoutTrend.weekly_distribution);
    }

    // Compile into unified stats object matching DashboardStats interface
    return NextResponse.json({
      wellness_index: wellnessIndex,
      burnout_trend: burnoutTrend,
      engagement_signals: engagementSignals,
      workload_friction: workloadFriction,
      productivity_proxy: productivityProxy,
      early_warnings: earlyWarnings,
      suggested_actions: suggestedActions,
      department_comparison: departmentComparison,
      org_wellness_trend: orgWellnessTrend,
      roi_impact: roiImpact,
      program_effectiveness: programEffectiveness,
      last_updated: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats from external API:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
