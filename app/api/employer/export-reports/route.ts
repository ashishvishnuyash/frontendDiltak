import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { MentalHealthReport } from '@/types/index';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const { company_id, time_range } = await request.json();

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const daysBack = time_range === '7d' ? 7 : time_range === '30d' ? 30 : 90;
    const token = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    const response = await axios.get(`${SERVER}/api/reports`, {
      params: { company_id, days: daysBack },
      headers,
    });

    const reports: MentalHealthReport[] = (response.data?.reports ?? response.data ?? [])
      .sort((a: MentalHealthReport, b: MentalHealthReport) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const csvHeaders = [
      'Report ID', 'Employee ID', 'Date', 'Session Type',
      'Mood Rating', 'Stress Level', 'Energy Level', 'Work Satisfaction',
      'Work Life Balance', 'Anxiety Level', 'Confidence Level', 'Sleep Quality',
      'Overall Wellness', 'Risk Level', 'Session Duration (min)', 'AI Analysis Summary',
    ];

    const csvRows = reports.map(report => [
      report.id,
      report.employee_id.slice(-8),
      new Date(report.created_at).toLocaleDateString(),
      report.session_type,
      report.mood_rating,
      report.stress_level,
      report.energy_level,
      report.work_satisfaction,
      report.work_life_balance,
      report.anxiety_level,
      report.confidence_level,
      report.sleep_quality,
      report.overall_wellness,
      report.risk_level,
      report.session_duration ? Math.round(report.session_duration / 60) : 'N/A',
      report.ai_analysis ? `"${report.ai_analysis.replace(/"/g, '""')}"` : 'N/A',
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="wellness-reports-${time_range}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export reports error:', error);
    return NextResponse.json({ error: 'Failed to export reports' }, { status: 500 });
  }
}
