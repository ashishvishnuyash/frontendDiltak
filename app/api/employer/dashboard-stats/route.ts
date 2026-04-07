import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const UMA_API_URL = process.env.UMA_API_URL || 'http://127.0.0.1:8000';

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

    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    };

    // Parallel fetch from all endpoints
    const [
      companyStatsRes,
      wellnessIndexRes,
      burnoutTrendRes,
      engagementSignalsRes,
      earlyWarningsRes,
      deptComparisonRes,
    ] = await Promise.all([
      fetch(`${UMA_API_URL}/api/employer/company/stats`, { headers }),
      fetch(`${UMA_API_URL}/api/employer/wellness-index?company_id=${companyId}`, { headers }),
      fetch(`${UMA_API_URL}/api/employer/burnout-trend?company_id=${companyId}&weeks=8`, { headers }),
      fetch(`${UMA_API_URL}/api/employer/engagement-signals?company_id=${companyId}&period_days=30`, { headers }),
      fetch(`${UMA_API_URL}/api/employer/early-warnings?company_id=${companyId}&period_days=14`, { headers }),
      fetch(`${UMA_API_URL}/api/employer/org/department-comparison?company_id=${companyId}&period_days=30`, { headers }),
    ]);

    // Handle responses properly so one failure doesn't crash everything if it's gracefully degradable,
    // though for our dashboard, we mostly want all.
    const rawData = await Promise.all([
      companyStatsRes.ok ? companyStatsRes.json() : null,
      wellnessIndexRes.ok ? wellnessIndexRes.json() : null,
      burnoutTrendRes.ok ? burnoutTrendRes.json() : null,
      engagementSignalsRes.ok ? engagementSignalsRes.json() : null,
      earlyWarningsRes.ok ? earlyWarningsRes.json() : null,
      deptComparisonRes.ok ? deptComparisonRes.json() : null,
    ]);

    const [
      companyStats,
      wellnessIndex,
      burnoutTrend,
      engagementSignals,
      earlyWarnings,
      deptComparison,
    ] = rawData;

    // Compile into unified stats object
    return NextResponse.json({
      company_stats: companyStats,
      wellness_index: wellnessIndex,
      burnout_trend: burnoutTrend,
      engagement_signals: engagementSignals,
      early_warnings: earlyWarnings,
      department_comparison: deptComparison,
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats from external API:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
