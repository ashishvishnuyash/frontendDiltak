# PDF Export Functionality

This document describes the comprehensive PDF export functionality implemented for the Provoto wellness reporting system.

## Overview

The PDF export system allows users to generate comprehensive wellness reports with charts, analytics, and raw data in PDF format. Users can export reports from different perspectives (company-wide, team, or individual employee reports).

## Features

### 🎯 Core Functionality
- **Multi-format Export**: PDF with embedded charts, analytics, and raw data
- **Role-based Access**: Different export options for employees, managers, and employers
- **Interactive Charts**: Recharts visualizations converted to high-quality images
- **Comprehensive Analytics**: Executive summary, risk distribution, department statistics
- **Print-friendly**: Optimized layouts for both screen and print

### 📊 Chart Types Supported
- **Line Charts**: Wellness trends over time
- **Pie Charts**: Risk level distribution
- **Bar Charts**: Department comparisons
- **Area Charts**: Report volume trends

### 🎨 Export Options
- **Include Charts**: Toggle chart inclusion in PDF
- **Include Raw Data**: Toggle detailed data tables
- **Include Analytics**: Toggle analytics sections
- **Date Range Filtering**: 7 days, 30 days, 90 days
- **Risk Level Filtering**: Low, medium, high risk reports
- **Department Filtering**: Filter by specific departments

## File Structure

```
lib/
├── pdf-export-service.ts     # Main PDF generation service
├── pdf-export-utils.ts       # Utility functions
app/
├── export/
│   └── report/
│       └── page.tsx          # Export page with full report view
├── api/
│   └── export/
│       └── pdf/
│           └── route.ts      # API endpoint for PDF generation
```

## Usage

### 1. From Report Pages

#### Employer Reports (`/employer/reports`)
- Click "Export Data" button
- Redirects to export page with company-wide data
- Includes all employees and reports

#### Employee Reports (`/employee/reports`)
- Click "Export My Reports" button
- Redirects to export page with personal data only
- Shows only current user's reports

#### Manager Team Reports (`/manager/team-reports`)
- Click "Export Data" button
- Redirects to export page with team data
- Includes direct reports and their data

### 2. Direct Access

Navigate to `/export/report` with query parameters:

```typescript
// Company-wide report
/export/report?type=company&range=30d&department=all&risk=all

// Employee personal report
/export/report?type=employee&range=30d&risk=all

// Team report
/export/report?type=team&range=30d&risk=medium&employee=all
```

### 3. API Endpoint

```typescript
POST /api/export/pdf
{
  "companyId": "company-123",
  "userId": "user-456",
  "reportType": "company",
  "dateRange": "30d",
  "department": "engineering",
  "riskLevel": "high",
  "includeCharts": true,
  "includeRawData": true,
  "includeAnalytics": true
}
```

## PDF Structure

### 1. Header
- Company logo placeholder
- Report title and subtitle
- Generation date and time

### 2. Report Information
- Date range
- Applied filters
- Report parameters

### 3. Executive Summary
- Total reports count
- Average wellness score
- Risk level distribution
- Key metrics

### 4. Charts Section
- Wellness trends over time
- Risk level distribution pie chart
- Department statistics bar chart
- Report volume area chart

### 5. Detailed Analytics
- Risk level breakdown with percentages
- Department performance metrics
- Trend analysis

### 6. Raw Data Table
- Recent reports (limited to 20 for readability)
- Employee information
- All wellness metrics
- Risk levels

### 7. Footer
- Page numbers
- Generation timestamp

## Technical Implementation

### Dependencies
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "@types/jspdf": "^2.3.0"
}
```

### Key Classes

#### PDFExportService
Main service class for PDF generation:
- `generateReportPDF()`: Main method to create PDF
- `addHeader()`: Adds report header
- `addCharts()`: Converts HTML charts to images
- `addAnalyticsSection()`: Adds detailed analytics
- `addRawDataTable()`: Adds data table

#### Utility Functions
- `extractChartElements()`: Finds chart elements in DOM
- `generateAnalyticsFromReports()`: Calculates analytics from raw data
- `formatDateForExport()`: Formats dates for PDF
- `validateExportData()`: Validates data before export

### Chart Conversion Process

1. **Element Detection**: Find chart containers using CSS selectors
2. **Canvas Generation**: Use html2canvas to convert charts to images
3. **Image Processing**: Scale and optimize images for PDF
4. **PDF Integration**: Embed images in PDF with proper sizing

## Configuration Options

### PDF Settings
```typescript
interface PDFExportConfig {
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
```

### Chart Options
```typescript
interface ChartExportOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
}
```

## Error Handling

The system includes comprehensive error handling:

1. **Data Validation**: Validates all input data before processing
2. **Chart Conversion**: Graceful fallback if chart conversion fails
3. **PDF Generation**: Error messages for PDF creation issues
4. **User Feedback**: Toast notifications for success/error states

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Charts are only converted when needed
- **Image Scaling**: Charts are scaled appropriately for PDF
- **Data Limiting**: Raw data tables limited to prevent oversized PDFs
- **Memory Management**: Proper cleanup of canvas elements

### Limitations
- **Chart Count**: Recommended maximum of 10 charts per PDF
- **Data Size**: Large datasets may result in large PDF files
- **Browser Compatibility**: Requires modern browsers with canvas support

## Security Considerations

- **Data Access**: Users can only export data they have permission to view
- **Authentication**: All export endpoints require valid authentication
- **Data Sanitization**: All text content is sanitized before PDF generation
- **File Naming**: Generated files use safe naming conventions

## Future Enhancements

### Planned Features
1. **Custom Templates**: User-defined PDF templates
2. **Scheduled Exports**: Automated report generation
3. **Email Integration**: Send PDFs via email
4. **Cloud Storage**: Save PDFs to cloud storage
5. **Advanced Filtering**: More granular filter options
6. **Multi-language Support**: Internationalization
7. **Brand Customization**: Company branding in PDFs

### Technical Improvements
1. **Web Workers**: Background PDF generation
2. **Streaming**: Large file streaming support
3. **Caching**: Chart image caching
4. **Compression**: PDF compression optimization
5. **Batch Processing**: Multiple report generation

## Troubleshooting

### Common Issues

#### Charts Not Appearing
- Ensure charts are fully rendered before export
- Check for CORS issues with external resources
- Verify chart container elements exist

#### Large PDF Files
- Reduce number of charts included
- Limit raw data table size
- Use lower image quality settings

#### Export Fails
- Check user permissions
- Verify data availability
- Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('pdf-export-debug', 'true');
```

## Support

For issues or questions regarding the PDF export functionality:

1. Check the browser console for error messages
2. Verify user permissions and data access
3. Test with different browsers and devices
4. Contact the development team with specific error details

---

*Last updated: December 2024*





