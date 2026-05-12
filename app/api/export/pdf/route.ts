import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PDFExportService, generateAnalyticsFromReports } from '@/lib/pdf-export-service';
import type { MentalHealthReport, User } from '@/types';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const {
      companyId,
      userId,
      reportType = 'company',
      dateRange = '30d',
      department = 'all',
      riskLevel = 'all',
      includeCharts = true,
      includeRawData = true,
      includeAnalytics = true,
    } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch employees and reports from backend
    const [employeesRes, reportsRes] = await Promise.allSettled([
      axios.get(`${SERVER}/api/employer/employees`, { params: { company_id: companyId }, headers }),
      axios.get(`${SERVER}/api/reports`, { params: { company_id: companyId, days: daysBack }, headers }),
    ]);

    const employees: User[] =
      employeesRes.status === 'fulfilled'
        ? (employeesRes.value.data?.employees ?? employeesRes.value.data ?? [])
        : [];

    let allReports: MentalHealthReport[] =
      reportsRes.status === 'fulfilled'
        ? (reportsRes.value.data?.reports ?? reportsRes.value.data ?? [])
        : [];

    // Apply filters
    if (department !== 'all') {
      const deptEmployeeIds = new Set(employees.filter(e => e.department === department).map(e => e.id));
      allReports = allReports.filter(r => deptEmployeeIds.has(r.employee_id));
    }
    if (riskLevel !== 'all') {
      allReports = allReports.filter(r => r.risk_level === riskLevel);
    }

    const analytics = generateAnalyticsFromReports(allReports, employees);

    const config = {
      title: `${reportType === 'company' ? 'Company' : 'Team'} Wellness Report`,
      subtitle: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      includeCharts,
      includeRawData,
      includeAnalytics,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      filters: {
        departments: department !== 'all' ? [department] : undefined,
        riskLevels: riskLevel !== 'all' ? [riskLevel] : undefined,
      },
    };

    const pdfService = new PDFExportService();
    const pdfBlob = await pdfService.generateReportPDF(config, { reports: allReports, employees, analytics });
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="wellness-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json({ error: 'Failed to generate PDF report', details: error.message }, { status: 500 });
  }
}
