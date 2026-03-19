import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PDFExportService, generateAnalyticsFromReports } from '@/lib/pdf-export-service';
import type { MentalHealthReport, User } from '@/types';

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
      includeAnalytics = true
    } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch employees
    const employeesQuery = query(
      collection(db, 'users'),
      where('company_id', '==', companyId)
    );
    const employeesSnapshot = await getDocs(employeesQuery);
    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    // Fetch reports
    const reportsQuery = query(
      collection(db, 'mental_health_reports'),
      where('company_id', '==', companyId)
    );
    const reportsSnapshot = await getDocs(reportsQuery);
    const allReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MentalHealthReport[];

    // Filter reports by date range
    const filteredReports = allReports.filter(report => {
      const reportDate = new Date(report.created_at);
      return reportDate >= startDate && reportDate <= endDate;
    });

    // Apply additional filters
    let finalReports = filteredReports;
    if (department !== 'all') {
      const deptEmployees = employees.filter(emp => emp.department === department);
      const deptEmployeeIds = deptEmployees.map(emp => emp.id);
      finalReports = finalReports.filter(report => deptEmployeeIds.includes(report.employee_id));
    }
    
    if (riskLevel !== 'all') {
      finalReports = finalReports.filter(report => report.risk_level === riskLevel);
    }

    // Generate analytics
    const analytics = generateAnalyticsFromReports(finalReports, employees);

    // Create report config
    const config = {
      title: `${reportType === 'company' ? 'Company' : 'Team'} Wellness Report`,
      subtitle: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      includeCharts,
      includeRawData,
      includeAnalytics,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      filters: {
        departments: department !== 'all' ? [department] : undefined,
        riskLevels: riskLevel !== 'all' ? [riskLevel] : undefined
      }
    };

    // Generate PDF
    const pdfService = new PDFExportService();
    const pdfBlob = await pdfService.generateReportPDF(
      config,
      {
        reports: finalReports,
        employees,
        analytics
      }
    );

    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer();

    // Return PDF as response
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
    return NextResponse.json(
      { error: 'Failed to generate PDF report', details: error.message },
      { status: 500 }
    );
  }
}
