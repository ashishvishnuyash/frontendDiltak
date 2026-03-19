import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ExportData {
  wellness_metrics: any[];
  gamification_metrics: any;
  conversation_metrics: any;
  user_id: string;
  company_id: string;
  export_date: string;
  user_role: string;
}

export class ComprehensiveReportExportService {
  private static getScoreStatus(score: number): string {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  }
  
  private static getRiskStatus(risk: string): string {
    switch (risk.toLowerCase()) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  }
  
  private static getStreakStatus(streak: number): string {
    if (streak >= 30) return 'Amazing';
    if (streak >= 14) return 'Great';
    if (streak >= 7) return 'Good';
    if (streak >= 3) return 'Building';
    return 'Starting';
  }
  
  private static getLevelStatus(level: number): string {
    if (level >= 10) return 'Master';
    if (level >= 7) return 'Expert';
    if (level >= 5) return 'Advanced';
    if (level >= 3) return 'Intermediate';
    return 'Beginner';
  }

  static async exportToPDF(data: ExportData, userInfo?: any): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // Modern Header with gradient effect
    doc.setFillColor(59, 130, 246); // Primary blue
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Header shadow
    doc.setFillColor(45, 100, 200);
    doc.rect(1, 1, pageWidth, 35, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Company logo
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 17.5, 8, 'F');
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('D', 21, 21);
    
    // Main title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprehensive Wellness Report', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(240, 248, 255);
    doc.text('Personal Health & Wellness Analytics', pageWidth / 2, 28, { align: 'center' });
    
    // User Info Card
    let yPosition = 50;
    if (userInfo) {
      // Info card background
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25);
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('User Information', margin + 5, yPosition);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${userInfo.first_name || userInfo.name || userInfo.email}`, margin + 5, yPosition + 7);
      doc.text(`Role: ${data.user_role.charAt(0).toUpperCase() + data.user_role.slice(1)}`, margin + 5, yPosition + 12);
      doc.text(`Export Date: ${new Date(data.export_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 5, yPosition + 17);
      
      yPosition += 35;
    }
    
    // Add decorative separator
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Wellness Metrics Summary
    if (data.wellness_metrics && data.wellness_metrics.length > 0) {
      const latestReport = data.wellness_metrics[0];
      
      // Section header with icon
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Current Wellness Metrics', margin + 5, yPosition + 3);
      yPosition += 15;
      
      // Wellness score highlight box
      const wellnessScore = latestReport.overall_wellness;
      const scoreColor = wellnessScore >= 7 ? [34, 197, 94] : wellnessScore >= 5 ? [245, 158, 11] : [239, 68, 68];
      const scoreText = wellnessScore >= 7 ? 'Excellent' : wellnessScore >= 5 ? 'Good' : 'Needs Attention';
      
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.rect(margin, yPosition, 60, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${wellnessScore}/10`, margin + 5, yPosition + 6);
      doc.setFontSize(10);
      doc.text(scoreText, margin + 5, yPosition + 11);
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Wellness Score', margin + 65, yPosition + 8);
      
      yPosition += 25;
      
      // Enhanced metrics table
      const metricsData = [
        ['Metric', 'Score', 'Status', 'Scale'],
        ['Mood Rating', `${latestReport.mood_rating}/10`, this.getScoreStatus(latestReport.mood_rating), '1-10'],
        ['Stress Level', `${latestReport.stress_level}/10`, this.getScoreStatus(11 - latestReport.stress_level), '1-10'],
        ['Anxiety Level', `${latestReport.anxiety_level}/10`, this.getScoreStatus(11 - latestReport.anxiety_level), '1-10'],
        ['Work Satisfaction', `${latestReport.work_satisfaction}/10`, this.getScoreStatus(latestReport.work_satisfaction), '1-10'],
        ['Work-Life Balance', `${latestReport.work_life_balance}/10`, this.getScoreStatus(latestReport.work_life_balance), '1-10'],
        ['Energy Level', `${latestReport.energy_level}/10`, this.getScoreStatus(latestReport.energy_level), '1-10'],
        ['Confidence Level', `${latestReport.confidence_level}/10`, this.getScoreStatus(latestReport.confidence_level), '1-10'],
        ['Sleep Quality', `${latestReport.sleep_quality}/10`, this.getScoreStatus(latestReport.sleep_quality), '1-10'],
        ['Overall Wellness', `${latestReport.overall_wellness}/10`, this.getScoreStatus(latestReport.overall_wellness), '1-10'],
        ['Risk Level', latestReport.risk_level.toUpperCase(), this.getRiskStatus(latestReport.risk_level), 'Assessment']
      ];
      
      (doc as any).autoTable({
        head: [metricsData[0]],
        body: metricsData.slice(1),
        startY: yPosition,
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Historical Trends with enhanced styling
      if (data.wellness_metrics.length > 1) {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Section header
        doc.setFillColor(147, 51, 234); // Purple
        doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Historical Trends (Last 7 Reports)', margin + 5, yPosition + 3);
        yPosition += 20;
        
        const trendData = data.wellness_metrics.slice(0, 7).map((report, index) => {
          const reportDate = new Date(report.created_at);
          return [
            `#${index + 1}`,
            `${report.mood_rating}/10`,
            `${report.stress_level}/10`,
            `${report.energy_level}/10`,
            `${report.overall_wellness}/10`,
            reportDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ];
        });
        
        (doc as any).autoTable({
          head: [['Report', 'Mood', 'Stress', 'Energy', 'Wellness', 'Date']],
          body: trendData,
          startY: yPosition,
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [226, 232, 240],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: [147, 51, 234],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 30, halign: 'center' }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
    }
    
    // Gamification Metrics with enhanced design
    if (data.gamification_metrics) {
      // Check if we need a new page
      if (yPosition > pageHeight - 120) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Section header
      doc.setFillColor(251, 191, 36); // Yellow/Gold
      doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Gamification & Engagement', margin + 5, yPosition + 3);
      yPosition += 20;
      
      // Achievement highlight
      const level = data.gamification_metrics.level || 1;
      const totalPoints = data.gamification_metrics.total_points || 0;
      
      doc.setFillColor(254, 240, 138); // Light yellow
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(1);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 20);
      
      doc.setTextColor(146, 64, 14); // Dark yellow
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Level ${level} • ${totalPoints} Points`, margin + 5, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Current Streak: ${data.gamification_metrics.current_streak || 0} days`, margin + 5, yPosition + 15);
      
      yPosition += 30;
      
      const gamificationData = [
        ['Achievement', 'Value', 'Status'],
        ['Total Points', data.gamification_metrics.total_points || 0, 'Active'],
        ['Current Streak', `${data.gamification_metrics.current_streak || 0} days`, this.getStreakStatus(data.gamification_metrics.current_streak || 0)],
        ['Longest Streak', `${data.gamification_metrics.longest_streak || 0} days`, 'Record'],
        ['Current Level', data.gamification_metrics.level || 1, this.getLevelStatus(data.gamification_metrics.level || 1)],
        ['Badges Earned', data.gamification_metrics.badges?.length || 0, 'Collected'],
        ['Challenges Done', data.gamification_metrics.challenges_completed || 0, 'Completed']
      ];
      
      (doc as any).autoTable({
        head: [gamificationData[0]],
        body: gamificationData.slice(1),
        startY: yPosition,
        styles: { 
          fontSize: 10,
          cellPadding: 4,
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [251, 191, 36],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [254, 252, 232]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Badges List
      if (data.gamification_metrics.badges.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Earned Badges:', 20, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        data.gamification_metrics.badges.forEach((badge: string, index: number) => {
          doc.text(`• ${badge}`, 25, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }
    }
    
    // Conversation Metrics
    if (data.conversation_metrics) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Conversation Analytics', 20, yPosition);
      yPosition += 20;
      
      const conversationData = [
        ['Metric', 'Value'],
        ['Total Conversations', data.conversation_metrics.total_conversations],
        ['Average Session Duration', `${Math.round(data.conversation_metrics.avg_session_duration / 60)} minutes`],
        ['Total Messages', data.conversation_metrics.total_messages],
        ['Last Conversation', new Date(data.conversation_metrics.last_conversation).toLocaleDateString()]
      ];
      
      (doc as any).autoTable({
        head: [conversationData[0]],
        body: conversationData.slice(1),
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [20, 184, 166] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // AI Analysis (if available)
    if (data.wellness_metrics && data.wellness_metrics[0]?.ai_analysis) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Analysis', 20, yPosition);
      yPosition += 20;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const analysisText = data.wellness_metrics[0].ai_analysis;
      const splitAnalysis = doc.splitTextToSize(analysisText, pageWidth - 40);
      
      splitAnalysis.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
    }
    
    // Enhanced Footer for all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      const footerY = pageHeight - 25;
      
      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, footerY, pageWidth, 25, 'F');
      
      // Footer border
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(0, footerY, pageWidth, footerY);
      
      // Company branding
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Diltak.ai Wellness Platform', margin, footerY + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Confidential Personal Health Report', margin, footerY + 13);
      
      // Page number
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, footerY + 8);
      
      // Generated timestamp
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, footerY + 13);
      
      // Privacy notice
      doc.setTextColor(156, 163, 175);
      doc.text('This report contains confidential health information. Handle with care.', pageWidth / 2, footerY + 18, { align: 'center' });
    }
    
    // Save the PDF
    const fileName = `wellness-report-${data.user_id}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
  static async exportToCSV(data: ExportData): Promise<void> {
    let csvContent = 'Comprehensive Wellness Report\n';
    csvContent += `Export Date,${new Date(data.export_date).toLocaleString()}\n`;
    csvContent += `User ID,${data.user_id}\n`;
    csvContent += `Company ID,${data.company_id}\n`;
    csvContent += `User Role,${data.user_role}\n\n`;
    
    // Wellness Metrics
    if (data.wellness_metrics && data.wellness_metrics.length > 0) {
      csvContent += 'Wellness Metrics\n';
      csvContent += 'Date,Mood Rating,Stress Level,Anxiety Level,Work Satisfaction,Work-Life Balance,Energy Level,Confidence Level,Sleep Quality,Overall Wellness,Risk Level\n';
      
      data.wellness_metrics.forEach(report => {
        csvContent += `${new Date(report.created_at).toLocaleDateString()},${report.mood_rating},${report.stress_level},${report.anxiety_level},${report.work_satisfaction},${report.work_life_balance},${report.energy_level},${report.confidence_level},${report.sleep_quality},${report.overall_wellness},${report.risk_level}\n`;
      });
      csvContent += '\n';
    }
    
    // Gamification Metrics
    if (data.gamification_metrics) {
      csvContent += 'Gamification Metrics\n';
      csvContent += `Total Points,${data.gamification_metrics.total_points}\n`;
      csvContent += `Current Streak,${data.gamification_metrics.current_streak}\n`;
      csvContent += `Longest Streak,${data.gamification_metrics.longest_streak}\n`;
      csvContent += `Level,${data.gamification_metrics.level}\n`;
      csvContent += `Badges Earned,${data.gamification_metrics.badges.length}\n`;
      csvContent += `Challenges Completed,${data.gamification_metrics.challenges_completed}\n`;
      csvContent += `Badges,${data.gamification_metrics.badges.join('; ')}\n\n`;
    }
    
    // Conversation Metrics
    if (data.conversation_metrics) {
      csvContent += 'Conversation Metrics\n';
      csvContent += `Total Conversations,${data.conversation_metrics.total_conversations}\n`;
      csvContent += `Average Session Duration (minutes),${Math.round(data.conversation_metrics.avg_session_duration / 60)}\n`;
      csvContent += `Total Messages,${data.conversation_metrics.total_messages}\n`;
      csvContent += `Last Conversation,${new Date(data.conversation_metrics.last_conversation).toLocaleDateString()}\n\n`;
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wellness-report-${data.user_id}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
