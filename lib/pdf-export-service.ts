import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { MentalHealthReport, User } from '@/types';

// Extend jsPDF type to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface PDFExportConfig {
  title: string;
  subtitle?: string;
  includeCharts: boolean;
  includeRawData: boolean;
  includeAnalytics: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    departments?: string[];
    riskLevels?: string[];
    employeeIds?: string[];
  };
}

export interface ReportData {
  reports: MentalHealthReport[];
  employees: User[];
  analytics: {
    totalReports: number;
    avgWellness: number;
    riskDistribution: { [key: string]: number };
    departmentStats: { [key: string]: any };
    trendData: any[];
  };
}

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    
    // Ensure autoTable is available
    if (typeof autoTable === 'function') {
      console.log('autoTable imported successfully');
    } else {
      console.error('autoTable import failed');
    }
    
    // Check if autoTable method exists on doc
    console.log('autoTable on doc?', typeof (this.doc as any).autoTable);
  }

  async generateReportPDF(
    config: PDFExportConfig,
    data: ReportData,
    chartElements?: HTMLElement[]
  ): Promise<Blob> {
    try {
      // Add header
      this.addHeader(config.title, config.subtitle);
      
      // Add date range and filters
      this.addReportInfo(config);
      
      // Add executive summary
      this.addExecutiveSummary(data.analytics);
      
      // Add charts if requested
      if (config.includeCharts && chartElements) {
        await this.addCharts(chartElements);
      }
      
      // Add analytics section
      if (config.includeAnalytics) {
        this.addAnalyticsSection(data.analytics);
      }
      
      // Add raw data if requested
      if (config.includeRawData) {
        this.addRawDataTable(data.reports, data.employees);
      }
      
      // Add physical health metrics section
      this.addPhysicalHealthMetrics(data.reports, data.employees);
      
      // Add footer
      this.addFooter();
      
      return this.doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  private addHeader(title: string, subtitle?: string) {
    // Modern gradient-style header background
    this.doc.setFillColor(59, 130, 246); // Primary blue
    this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Add subtle shadow effect
    this.doc.setFillColor(45, 100, 200); // Darker blue for shadow
    this.doc.rect(this.margin + 1, this.margin + 1, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Main header background
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Company logo area (enhanced)
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(this.margin + 10, this.margin + 10, 6, 'F');
    this.doc.setTextColor(59, 130, 246);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('D', this.margin + 7, this.margin + 13);
    
    // Title with better typography
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 25, this.margin + 12);
    
    // Subtitle with improved styling
    if (subtitle) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(240, 248, 255); // Light blue
      this.doc.text(subtitle, this.margin + 25, this.margin + 17);
    }
    
    // Add decorative line
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin + 5, this.margin + 22, this.pageWidth - this.margin - 5, this.margin + 22);
    
    this.currentY = this.margin + 35;
  }

  private addReportInfo(config: PDFExportConfig) {
    // Info box with subtle background
    this.doc.setFillColor(248, 250, 252); // Light gray background
    this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Border for info box
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 20);
    
    this.doc.setTextColor(51, 65, 85); // Dark gray
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dateRange = `${new Date(config.dateRange.start).toLocaleDateString()} to ${new Date(config.dateRange.end).toLocaleDateString()}`;
    
    this.doc.text(`Report Generated: ${reportDate}`, this.margin + 5, this.currentY + 2);
    this.doc.text(`Analysis Period: ${dateRange}`, this.margin + 5, this.currentY + 7);
    
    if (config.filters) {
      let filterText = 'Applied Filters: ';
      if (config.filters.departments?.length) {
        filterText += `Departments (${config.filters.departments.join(', ')})`;
      }
      if (config.filters.riskLevels?.length) {
        filterText += ` | Risk Levels (${config.filters.riskLevels.join(', ')})`;
      }
      this.doc.text(filterText, this.margin + 5, this.currentY + 12);
      this.currentY += 25;
    } else {
      this.currentY += 20;
    }
    
    // Add elegant separator
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  private addExecutiveSummary(analytics: any) {
    // Section header with icon and styling
    this.doc.setFillColor(34, 197, 94); // Green background
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin + 3, this.currentY + 3);
    this.currentY += 12;
    
    // Summary cards layout
    const cardWidth = (this.pageWidth - 2 * this.margin - 10) / 2;
    const cardHeight = 25;
    
    // Left card - Key Metrics
    this.doc.setFillColor(240, 253, 244); // Light green
    this.doc.rect(this.margin, this.currentY, cardWidth, cardHeight, 'F');
    this.doc.setDrawColor(34, 197, 94);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, cardWidth, cardHeight);
    
    this.doc.setTextColor(22, 101, 52); // Dark green
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Metrics', this.margin + 3, this.currentY + 5);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Total Reports: ${analytics.totalReports}`, this.margin + 3, this.currentY + 10);
    this.doc.text(`Avg Wellness: ${analytics.avgWellness.toFixed(1)}/10`, this.margin + 3, this.currentY + 15);
    
    // Wellness status indicator
    const statusText = analytics.avgWellness >= 7 ? 'Excellent' : analytics.avgWellness >= 5 ? 'Good' : 'Needs Attention';
    this.doc.text(`Status: ${statusText}`, this.margin + 3, this.currentY + 20);
    
    // Right card - Risk Distribution
    this.doc.setFillColor(254, 242, 242); // Light red
    this.doc.rect(this.margin + cardWidth + 5, this.currentY, cardWidth, cardHeight, 'F');
    this.doc.setDrawColor(239, 68, 68);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin + cardWidth + 5, this.currentY, cardWidth, cardHeight);
    
    this.doc.setTextColor(153, 27, 27); // Dark red
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Risk Distribution', this.margin + cardWidth + 8, this.currentY + 5);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`High Risk: ${analytics.riskDistribution.high || 0}`, this.margin + cardWidth + 8, this.currentY + 10);
    this.doc.text(`Medium Risk: ${analytics.riskDistribution.medium || 0}`, this.margin + cardWidth + 8, this.currentY + 15);
    this.doc.text(`Low Risk: ${analytics.riskDistribution.low || 0}`, this.margin + cardWidth + 8, this.currentY + 20);
    
    this.currentY += cardHeight + 15;
  }

  private async addCharts(chartElements: HTMLElement[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Analytics & Visualizations', this.margin, this.currentY);
    this.currentY += 8;
    
    for (let i = 0; i < chartElements.length; i++) {
      const chartElement = chartElements[i];
      
      try {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 80) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        
        // Convert chart to canvas
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        // Calculate dimensions
        const imgWidth = this.pageWidth - 2 * this.margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add chart title if available
        const chartTitle = chartElement.getAttribute('data-chart-title') || `Chart ${i + 1}`;
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(chartTitle, this.margin, this.currentY);
        this.currentY += 5;
        
        // Add the chart image
        const imgData = canvas.toDataURL('image/png');
        this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
        
        this.currentY += imgHeight + 10;
        
      } catch (error) {
        console.error(`Error processing chart ${i + 1}:`, error);
        // Add placeholder text if chart fails
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(`Chart ${i + 1} could not be rendered`, this.margin, this.currentY);
        this.currentY += 10;
      }
    }
  }

  private addAnalyticsSection(analytics: any) {
    // Section header
    this.doc.setFillColor(147, 51, 234); // Purple background
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Analytics', this.margin + 3, this.currentY + 3);
    this.currentY += 15;
    
    // Risk Distribution with visual bars
    this.doc.setTextColor(51, 65, 85);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Risk Level Distribution', this.margin, this.currentY);
    this.currentY += 8;
    
    const totalReports = Object.values(analytics.riskDistribution).reduce((sum: number, count: any) => sum + count, 0);
    const barWidth = this.pageWidth - 2 * this.margin - 60;
    
    Object.entries(analytics.riskDistribution).forEach(([level, count]: [string, any]) => {
      const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
      const barLength = (percentage / 100) * barWidth;
      
      // Risk level colors
      const colors = {
        high: [239, 68, 68],
        medium: [245, 158, 11],
        low: [34, 197, 94]
      };
      const color = colors[level as keyof typeof colors] || [156, 163, 175];
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${level.charAt(0).toUpperCase() + level.slice(1)}:`, this.margin + 5, this.currentY);
      
      // Progress bar background
      this.doc.setFillColor(243, 244, 246);
      this.doc.rect(this.margin + 35, this.currentY - 3, barWidth, 6, 'F');
      
      // Progress bar fill
      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.rect(this.margin + 35, this.currentY - 3, barLength, 6, 'F');
      
      // Percentage and count
      this.doc.text(`${count} (${percentage.toFixed(1)}%)`, this.margin + 35 + barWidth + 5, this.currentY);
      
      this.currentY += 8;
    });
    
    this.currentY += 10;
    
    // Department Statistics with enhanced layout
    if (analytics.departmentStats && Object.keys(analytics.departmentStats).length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Department Performance', this.margin, this.currentY);
      this.currentY += 8;
      
      // Table-like layout for departments
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 6, 'F');
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(71, 85, 105);
      this.doc.text('Department', this.margin + 3, this.currentY + 2);
      this.doc.text('Employees', this.margin + 60, this.currentY + 2);
      this.doc.text('Avg Wellness', this.margin + 100, this.currentY + 2);
      this.doc.text('Reports', this.margin + 140, this.currentY + 2);
      
      this.currentY += 8;
      
      Object.entries(analytics.departmentStats).forEach(([dept, stats]: [string, any], index) => {
        // Alternating row colors
        if (index % 2 === 0) {
          this.doc.setFillColor(249, 250, 251);
          this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 6, 'F');
        }
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(51, 65, 85);
        
        this.doc.text(dept, this.margin + 3, this.currentY + 2);
        this.doc.text(stats.count.toString(), this.margin + 60, this.currentY + 2);
        this.doc.text(stats.avgWellness?.toFixed(1) || 'N/A', this.margin + 100, this.currentY + 2);
        this.doc.text(stats.reports.toString(), this.margin + 140, this.currentY + 2);
        
        this.currentY += 6;
      });
    }
    
    this.currentY += 15;
  }

  private addRawDataTable(reports: MentalHealthReport[], employees: User[]) {
    // Check if there are any reports to display
    if (!reports || reports.length === 0) {
      console.log('No reports to display in raw data table');
      
      // Add a message indicating no data
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      this.doc.setFillColor(99, 102, 241);
      this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Recent Reports - Raw Data', this.margin + 3, this.currentY + 3);
      this.currentY += 15;
      
      this.doc.setTextColor(107, 114, 128);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text('No report data available for the selected period.', this.margin, this.currentY);
      this.currentY += 20;
      return;
    }
    
    console.log(`Processing ${reports.length} reports for raw data table`);
    
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    // Create employee lookup map
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    
    // Prepare comprehensive table data with all fields
    const tableData = reports.map((report, index) => {
      const employee = employeeMap.get(report.employee_id);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
      const reportDate = new Date(report.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      // Helper function to format values
      const formatValue = (val: number | undefined) => val !== undefined ? val.toFixed(1) : 'N/A';
      
      return [
        reportDate,
        employeeName,
        formatValue(report.mood_rating),
        formatValue(report.stress_level),
        formatValue(report.energy_level),
        formatValue(report.anxiety_level),
        formatValue(report.work_satisfaction),
        formatValue(report.work_life_balance),
        formatValue(report.confidence_level),
        formatValue(report.sleep_quality),
        formatValue(report.overall_wellness),
        report.risk_level.toUpperCase(),
        formatValue(report.metrics?.emotional_tone),
        formatValue(report.metrics?.stress_anxiety),
        formatValue(report.metrics?.motivation_engagement),
        formatValue(report.metrics?.social_connectedness),
        formatValue(report.metrics?.self_esteem),
        formatValue(report.metrics?.assertiveness),
        formatValue(report.metrics?.work_life_balance_metric),
        formatValue(report.metrics?.cognitive_functioning),
        formatValue(report.metrics?.emotional_regulation),
        formatValue(report.metrics?.substance_use)
      ];
    });
    
    // Define all column headers with shorter abbreviations
    const headers = [
      'Date',
      'Employee',
      'Mood',
      'Stress',
      'Energy',
      'Anxiety',
      'Work Sat',
      'W-L Bal',
      'Confid.',
      'Sleep',
      'Wellnes',
      'Risk',
      'Emo Ton',
      'Str&Anx',
      'Motivat',
      'Social',
      'SelfEst',
      'Assert',
      'WL-AI',
      'Cognit',
      'EmoReg',
      'Subst'
    ];
    
    console.log('Preparing to render table with autoTable...');
    
    // Add landscape page for better table display
    this.doc.addPage('l'); // landscape orientation
    this.currentY = this.margin;
    
    // Update page dimensions for landscape
    const landscapeWidth = this.doc.internal.pageSize.getWidth();
    const landscapeHeight = this.doc.internal.pageSize.getHeight();
    
    console.log(`Landscape dimensions: ${landscapeWidth} x ${landscapeHeight}`);
    
    // Add section header on landscape page
    this.doc.setFillColor(99, 102, 241);
    this.doc.rect(this.margin, this.currentY - 2, landscapeWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Reports - Complete Raw Data', this.margin + 3, this.currentY + 3);
    this.currentY += 12;
    
    console.log(`Rendering table with ${tableData.length} rows and ${headers.length} columns`);
    
    try {
      // Use jspdf-autotable v5 API with highly optimized column widths
      autoTable(this.doc, {
        head: [headers],
        body: tableData,
        startY: this.currentY,
        theme: 'striped',
        styles: { 
          fontSize: 5,
          cellPadding: 0.0,
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          minCellHeight: 4
        },
        headStyles: { 
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 5,
          halign: 'center',
          cellPadding: 0.0
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'left' },    // Date
          1: { cellWidth: 18, halign: 'left' },    // Employee
          2: { cellWidth: 9, halign: 'center' },   // Mood
          3: { cellWidth: 9, halign: 'center' },   // Stress
          4: { cellWidth: 9, halign: 'center' },   // Energy
          5: { cellWidth: 9, halign: 'center' },   // Anxiety
          6: { cellWidth: 10, halign: 'center' },  // Work Sat
          7: { cellWidth: 10, halign: 'center' },  // W-L Balance
          8: { cellWidth: 10, halign: 'center' },  // Confidence
          9: { cellWidth: 9, halign: 'center' },   // Sleep
          10: { cellWidth: 10, halign: 'center' }, // Wellness
          11: { cellWidth: 9, halign: 'center' },  // Risk
          12: { cellWidth: 9, halign: 'center' },  // Emo Tone
          13: { cellWidth: 10, halign: 'center' }, // Stress & Anx
          14: { cellWidth: 10, halign: 'center' }, // Motivation
          15: { cellWidth: 9, halign: 'center' },  // Social Conn
          16: { cellWidth: 9, halign: 'center' },  // Self-Esteem
          17: { cellWidth: 9, halign: 'center' },  // Assertive
          18: { cellWidth: 9, halign: 'center' },  // W-L Bal AI
          19: { cellWidth: 9, halign: 'center' },  // Cognitive
          20: { cellWidth: 9, halign: 'center' },  // Emo Reg
          21: { cellWidth: 9, halign: 'center' }   // Substance
        },
        margin: { left: 0, right: 0 },
        pageBreak: 'auto',
        showHead: 'everyPage',
        tableWidth: 'auto'
      });
      
      console.log('Table rendered successfully');
      
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
      
      // Add data legend/notes
      if (this.currentY > landscapeHeight - 30) {
        this.doc.addPage('l');
        this.currentY = this.margin;
      }
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(`Total reports shown: ${reports.length}`, this.margin, this.currentY);
      this.doc.text('Note: All ratings are on a scale of 0-10. N/A indicates data not available.', this.margin, this.currentY + 5);
      
      this.currentY += 15;
      
      console.log('Raw data table section complete');
      
      // Add a final portrait page for clean ending
      this.doc.addPage('p');
      this.currentY = this.margin;
      
      // Update page dimensions back to portrait
      this.pageWidth = this.doc.internal.pageSize.getWidth();
      this.pageHeight = this.doc.internal.pageSize.getHeight();
      
      console.log('Returned to portrait mode');
      
    } catch (error) {
      console.error('Error rendering autoTable:', error);
      
      // Add error message
      this.doc.setTextColor(239, 68, 68);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Error rendering raw data table. Please check console for details.', this.margin, this.currentY);
      this.currentY += 20;
      
      // Still need to reset dimensions
      this.pageWidth = 210;
      this.pageHeight = 297;
    }
  }

  private addPhysicalHealthMetrics(reports: MentalHealthReport[], employees: User[]) {
    // Filter reports that have physical health metrics
    const reportsWithPhysicalHealth = reports.filter(r => r.physical_health_metrics);
    
    if (reportsWithPhysicalHealth.length === 0) {
      return; // Skip if no physical health data
    }
    
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    
    // Section header
    this.doc.setFillColor(34, 197, 94); // Green background
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Physical Health Metrics', this.margin + 3, this.currentY + 3);
    this.currentY += 15;
    
    // Create employee lookup map
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    
    // Add physical health data for each report
    reportsWithPhysicalHealth.slice(0, 10).forEach((report, index) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 80) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      const employee = employeeMap.get(report.employee_id);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
      const reportDate = new Date(report.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      const phm = report.physical_health_metrics!;
      
      // Report header
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(51, 65, 85);
      this.doc.text(`${employeeName} - ${reportDate}`, this.margin, this.currentY);
      this.currentY += 8;
      
      // Physical Activity
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Physical Activity:', this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(`  Exercise: ${phm.physical_activity.exercise_frequency}x/week (${phm.physical_activity.exercise_type})`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Sitting: ${phm.physical_activity.daily_sitting_hours} hrs/day`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Stretch breaks: ${phm.physical_activity.stretch_breaks ? 'Yes' : 'No'}`, this.margin + 5, this.currentY);
      this.currentY += 6;
      
      // Nutrition & Hydration
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Nutrition & Hydration:', this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(`  Meals: ${phm.nutrition_hydration.meals_per_day}/day`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Water: ${phm.nutrition_hydration.water_intake_liters}L/day`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Fruits/Vegetables: ${phm.nutrition_hydration.fruit_veg_intake}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Skips meals: ${phm.nutrition_hydration.skips_meals ? 'Yes' : 'No'}`, this.margin + 5, this.currentY);
      this.currentY += 6;
      
      // Pain & Discomfort
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Pain & Discomfort:', this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(`  Back pain: ${phm.pain_discomfort.back_pain}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Neck/Shoulder: ${phm.pain_discomfort.neck_shoulder_pain}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Wrist/Hand: ${phm.pain_discomfort.wrist_hand_pain}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Eye strain: ${phm.pain_discomfort.eye_strain}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Headaches: ${phm.pain_discomfort.headaches_frequency}`, this.margin + 5, this.currentY);
      this.currentY += 6;
      
      // Lifestyle & Ergonomics
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Lifestyle & Ergonomics:', this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(`  Smoking: ${phm.lifestyle_risks.smoking_status}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Alcohol: ${phm.lifestyle_risks.alcohol_frequency}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Caffeine dependence: ${phm.lifestyle_risks.caffeine_dependence ? 'Yes' : 'No'}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Chair comfort: ${phm.ergonomics.chair_comfort}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Work mode: ${phm.ergonomics.work_mode}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Work breaks: ${phm.ergonomics.work_break_frequency}`, this.margin + 5, this.currentY);
      this.currentY += 6;
      
      // Absenteeism
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Absenteeism:', this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(`  Sick days (last 3 months): ${phm.absenteeism.sick_days_last_3_months}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`  Health affects productivity: ${phm.absenteeism.health_affects_productivity ? 'Yes' : 'No'}`, this.margin + 5, this.currentY);
      this.currentY += 10;
      
      // Add separator line between reports
      if (index < reportsWithPhysicalHealth.length - 1) {
        this.doc.setDrawColor(226, 232, 240);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 5;
      }
    });
    
    if (reportsWithPhysicalHealth.length > 10) {
      this.currentY += 5;
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(`... and ${reportsWithPhysicalHealth.length - 10} more reports with physical health data`, this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  private addFooter() {
    const footerY = this.pageHeight - 20;
    
    // Footer background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, footerY - 5, this.pageWidth, 25, 'F');
    
    // Footer border
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.line(0, footerY - 5, this.pageWidth, footerY - 5);
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    
    // Company branding
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Diltak.ai Wellness Platform', this.margin, footerY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Confidential & Secure Mental Health Analytics', this.margin, footerY + 4);
    
    // Page number with better styling
    const pageNum = (this.doc as any).internal.getCurrentPageInfo()?.pageNumber || 1;
    const totalPages = (this.doc as any).internal.getNumberOfPages() || 1;
    this.doc.text(`Page ${pageNum} of ${totalPages}`, this.pageWidth - this.margin - 25, footerY);
    
    // Generated timestamp
    this.doc.text(`Generated: ${new Date().toLocaleString()}`, this.pageWidth - this.margin - 60, footerY + 4);
    
    // Privacy notice
    this.doc.setTextColor(156, 163, 175);
    this.doc.text('This report contains confidential information. Handle with care.', this.pageWidth / 2, footerY + 8, { align: 'center' });
  }
}

// Utility function to extract chart elements from DOM
export function extractChartElements(containerId: string): HTMLElement[] {
  const container = document.getElementById(containerId);
  if (!container) return [];
  
  // Find all chart containers (Recharts components)
  const chartElements = container.querySelectorAll('.recharts-wrapper, [data-chart]');
  return Array.from(chartElements) as HTMLElement[];
}

// Utility function to generate analytics data
export function generateAnalyticsFromReports(reports: MentalHealthReport[], employees: User[]) {
  const totalReports = reports.length;
  const avgWellness = totalReports > 0 
    ? reports.reduce((sum, r) => sum + r.overall_wellness, 0) / totalReports 
    : 0;
  
  const riskDistribution = reports.reduce((acc, report) => {
    acc[report.risk_level] = (acc[report.risk_level] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const departmentStats: { [key: string]: any } = {};
  employees.forEach(employee => {
    const dept = employee.department || 'Unassigned';
    const employeeReports = reports.filter(r => r.employee_id === employee.id);
    
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, avgWellness: 0, reports: 0 };
    }
    
    departmentStats[dept].count++;
    departmentStats[dept].reports += employeeReports.length;
    
    if (employeeReports.length > 0) {
      const deptAvgWellness = employeeReports.reduce((sum, r) => sum + r.overall_wellness, 0) / employeeReports.length;
      departmentStats[dept].avgWellness = deptAvgWellness;
    }
  });
  
  // Generate trend data based on actual report dates
  const trendData = [];
  
  if (reports.length > 0) {
    // Get the date range from actual reports
    const reportDates = reports.map(r => new Date(r.created_at).toISOString().split('T')[0]);
    const minDate = new Date(Math.min(...reportDates.map(d => new Date(d).getTime())));
    const maxDate = new Date(Math.max(...reportDates.map(d => new Date(d).getTime())));
    
    // Generate data for each day in the range
    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayReports = reports.filter(r => {
        const reportDate = new Date(r.created_at).toISOString().split('T')[0];
        return reportDate === dateStr;
      });
      
      const avgMood = dayReports.length > 0 
        ? dayReports.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / dayReports.length 
        : 0;
      const avgStress = dayReports.length > 0 
        ? dayReports.reduce((sum, r) => sum + (r.stress_level || 0), 0) / dayReports.length 
        : 0;
      const avgEnergy = dayReports.length > 0 
        ? dayReports.reduce((sum, r) => sum + (r.energy_level || 0), 0) / dayReports.length 
        : 0;
      
      trendData.push({
        date: dateStr,
        mood: Math.round(avgMood * 10) / 10,
        stress: Math.round(avgStress * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
        reports: dayReports.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return {
    totalReports,
    avgWellness,
    riskDistribution,
    departmentStats,
    trendData
  };
}