import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const UMA_API_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Normalizes the burnout distribution which often comes as a list of single-key objects
 * e.g. [{"2024-W14": {low, med, high}}] -> [{week: "2024-W14", low, med, high}]
 */
function normalizeBurnoutDistribution(dist: any[]): any[] {
  if (!Array.isArray(dist)) return [];
  return dist.map(item => {
    const keys = Object.keys(item);
    if (keys.length === 0) return item;
    const week = keys[0];
    const data = item[week];
    return {
      week,
      low: data.low || 0,
      medium: data.medium || 0,
      high: data.high || 0
    };
  });
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

    // Parallel fetch from all endpoints using axios
    const [
      wellnessIndexRes,
      burnoutTrendRes,
      engagementSignalsRes,
      workloadFrictionRes,
      productivityProxyRes,
      earlyWarningsRes,
      suggestedActionsRes,
    ] = await axios.all([
      axios.get(`${UMA_API_URL}/api/employer/wellness-index?company_id=${companyId}`, config).catch(e => e.response || null),
      axios.get(`${UMA_API_URL}/api/employer/burnout-trend?company_id=${companyId}&weeks=12`, config).catch(e => e.response || null),
      axios.get(`${UMA_API_URL}/api/employer/engagement-signals?company_id=${companyId}&period_days=30`, config).catch(e => e.response || null),
      axios.get(`${UMA_API_URL}/api/employer/workload-friction?company_id=${companyId}&period_days=30`, config).catch(e => e.response || null),
      axios.get(`${UMA_API_URL}/api/employer/productivity-proxy?company_id=${companyId}&period_days=30`, config).catch(e => e.response || null),
      axios.get(`${UMA_API_URL}/api/employer/early-warnings?company_id=${companyId}&period_days=14`, config).catch(e => e.response || null),
      axios.get(`${UMA_API_URL}/api/employer/suggested-actions?company_id=${companyId}`, config).catch(e => e.response || null),
    ]);

    const wellnessIndex = wellnessIndexRes?.status === 200 ? wellnessIndexRes.data : null;
    const burnoutTrend = burnoutTrendRes?.status === 200 ? burnoutTrendRes.data : null;
    const engagementSignals = engagementSignalsRes?.status === 200 ? engagementSignalsRes.data : null;
    const workloadFriction = workloadFrictionRes?.status === 200 ? workloadFrictionRes.data : null;
    const productivityProxy = productivityProxyRes?.status === 200 ? productivityProxyRes.data : null;
    const earlyWarnings = earlyWarningsRes?.status === 200 ? earlyWarningsRes.data : null;
    const suggestedActions = suggestedActionsRes?.status === 200 ? suggestedActionsRes.data : null;

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
      last_updated: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats from external API:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
