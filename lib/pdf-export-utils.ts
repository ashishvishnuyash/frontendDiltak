// Utility functions for PDF export functionality

export interface ChartExportOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
}

export const DEFAULT_CHART_OPTIONS: ChartExportOptions = {
  width: 800,
  height: 400,
  backgroundColor: '#ffffff',
  scale: 2,
  useCORS: true,
  allowTaint: true
};

export function formatDateForExport(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTimeForExport(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getRiskLevelColor(riskLevel: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: '#10B981', // green
    medium: '#F59E0B', // yellow
    high: '#EF4444' // red
  };
  return colors[riskLevel];
}

export function getRiskLevelDescription(riskLevel: 'low' | 'medium' | 'high'): string {
  const descriptions = {
    low: 'Low risk - Employee is doing well',
    medium: 'Medium risk - Some concerns identified',
    high: 'High risk - Immediate attention recommended'
  };
  return descriptions[riskLevel];
}

export function calculateWellnessTrend(reports: any[]): 'improving' | 'stable' | 'declining' {
  if (reports.length < 2) return 'stable';
  
  const sortedReports = reports.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const firstHalf = sortedReports.slice(0, Math.floor(sortedReports.length / 2));
  const secondHalf = sortedReports.slice(Math.floor(sortedReports.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, r) => sum + r.overall_wellness, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.overall_wellness, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

export function generateReportSummary(analytics: any): string {
  const { totalReports, avgWellness, riskDistribution } = analytics;
  
  let summary = `This report covers ${totalReports} wellness reports with an average wellness score of ${avgWellness.toFixed(1)}/10. `;
  
  const highRisk = riskDistribution.high || 0;
  const mediumRisk = riskDistribution.medium || 0;
  const lowRisk = riskDistribution.low || 0;
  
  if (highRisk > 0) {
    summary += `${highRisk} reports indicate high risk requiring immediate attention. `;
  }
  
  if (mediumRisk > 0) {
    summary += `${mediumRisk} reports show medium risk levels. `;
  }
  
  if (lowRisk > 0) {
    summary += `${lowRisk} reports show low risk levels. `;
  }
  
  return summary;
}

export function validateExportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.reports || !Array.isArray(data.reports)) {
    errors.push('Reports data is missing or invalid');
  }
  
  if (!data.employees || !Array.isArray(data.employees)) {
    errors.push('Employees data is missing or invalid');
  }
  
  if (!data.analytics) {
    errors.push('Analytics data is missing');
  }
  
  if (data.reports && data.reports.length === 0) {
    errors.push('No reports found for the selected criteria');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getExportFileName(config: any): string {
  const date = new Date().toISOString().split('T')[0];
  const type = config.title.toLowerCase().replace(/\s+/g, '-');
  return `${type}-report-${date}.pdf`;
}

export function sanitizeTextForPDF(text: string): string {
  // Remove or replace characters that might cause issues in PDF generation
  return text
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}





