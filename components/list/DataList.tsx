
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Search, Download, ChevronLeft, ChevronRight, Loader2, Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, FileDown, RefreshCw, Mail, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataListProps<T> {
  title?: string;
  data?: T[];
  apiPath?: string;
  dataPath?: string;
  onDataLoaded?: (data: T[]) => void;
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  rowKey?: keyof T | ((row: T) => string);
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onExport?: () => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  /** Show import button */
  is_import?: boolean;
  /** API endpoint to POST imported file (returns job_id) */
  create_api?: string;
  /** API endpoint to GET import template */
  template_api?: string;
  /** Called after successful import with the parsed rows */
  onImportSuccess?: (rows: Record<string, any>[]) => void;
  /** Transform API response to extract data array */
  transformResponse?: (response: any) => T[];
  /** Column definitions for import template (fallback if no template_api) */
  template_columns?: ColumnDef<T>[];
}

// ─── Import Job Status ────────────────────────────────────────────────────────

interface ImportJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  total_rows: number;
  processed: number;
  created_count: number;
  failed_count: number;
  skipped_count: number;
  progress_pct: number;
  results_csv_url?: string;
  created_at: string;
  updated_at: string;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (direction === 'desc') return <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />;
}

// ─── Column filter dropdown ───────────────────────────────────────────────────

function ColumnFilter({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`p-0.5 rounded transition-colors ${value !== 'all' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="Filter column"
      >
        <Filter className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
            {[{ label: 'All', value: 'all' }, ...options].map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  value === opt.value
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Import Progress Modal ────────────────────────────────────────────────────

function ImportProgressModal({
  jobId,
  onClose,
  onComplete,
}: {
  jobId: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [status, setStatus] = useState<ImportJobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${ServerAddress}/employees/import/${jobId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      setStatus(response.data);
      
      // Stop polling when job is completed, failed, or partial
      if (response.data.status === 'completed' || response.data.status === 'failed' || response.data.status === 'partial') {
        setIsPolling(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
        
        if (response.data.status === 'completed') {
          toast.success(`Import completed! ${response.data.created_count} records created.`);
          onComplete();
        } else if (response.data.status === 'partial') {
          toast.warning(`Import completed with ${response.data.failed_count} failures. ${response.data.created_count} records created.`);
          onComplete();
        } else {
          toast.error('Import failed. Please check the error details.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch job status:', err);
    }
  };

  const handleResendInvites = async () => {
    setIsResending(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${ServerAddress}/employees/import/${jobId}/resend-invites`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      toast.success(`Resent ${response.data.resent} invites. Failed: ${response.data.failed}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend invites';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleDownloadResults = () => {
    if (status?.results_csv_url) {
      window.open(status.results_csv_url, '_blank');
    }
  };

  useEffect(() => {
    if (isPolling && jobId) {
      fetchJobStatus(); // Fetch immediately
      pollingRef.current = setInterval(fetchJobStatus, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isPolling, jobId]);

  if (!status) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading job status...</p>
          </div>
        </div>
      </div>
    );
  }

  const isComplete = status.status === 'completed' || status.status === 'failed' || status.status === 'partial';
  const progress = status.progress_pct || 0;
  const hasFailures = (status.failed_count || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isComplete ? undefined : onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Import Progress
            </h2>
          </div>
          {isComplete && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Job ID</span>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {status.job_id.slice(0, 8)}...
            </code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              status.status === 'completed' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : status.status === 'processing'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : status.status === 'failed'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : status.status === 'partial'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {status.status.toUpperCase()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  status.status === 'failed' 
                    ? 'bg-red-500' 
                    : status.status === 'partial'
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Rows</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{status.total_rows || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Processed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{status.processed || 0}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Created</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{status.created_count || 0}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
              <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">{status.failed_count || 0}</p>
            </div>
            {status.skipped_count > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-3 col-span-2">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Skipped</p>
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{status.skipped_count}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isComplete && (
            <div className="flex gap-2 pt-2">
              {hasFailures && (
                <button
                  onClick={handleResendInvites}
                  disabled={isResending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                >
                  {isResending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  Resend Invites
                </button>
              )}
              {status.results_csv_url && (
                <button
                  onClick={handleDownloadResults}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Results
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isComplete && (
          <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Processing in background...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

type ImportStep = 'idle' | 'uploading' | 'success' | 'error';

function ImportModal<T extends Record<string, any>>({
  open,
  onClose,
  columns,
  create_api,
  template_api,
  onImportSuccess,
}: {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef<T>[];
  create_api?: string;
  template_api?: string;
  onImportSuccess?: (rows: Record<string, any>[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<ImportStep>('idle');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('idle');
        setFileName('');
        setErrorMsg('');
        setDragOver(false);
        setJobId(null);
        setShowProgress(false);
      }, 300);
    }
  }, [open]);

  // Build format headers from non-render-only columns (fallback)
  const formatHeaders = columns.map(c => c.title).join(',');
  const formatSampleRow = columns.map(c => `Sample ${c.title}`).join(',');

  async function downloadTemplate() {
    setIsDownloadingTemplate(true);
    
    try {
      if (template_api) {
        const token = localStorage.getItem('access_token');
        
        const response = await axios.get(template_api, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          responseType: 'blob',
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'import_template.csv';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Template downloaded successfully');
      } else {
        const csv = `${formatHeaders}\n${formatSampleRow}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'import_format.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Template downloaded successfully');
      }
    } catch (err: any) {
      console.error('Error downloading template:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download template';
      toast.error(errorMessage);
    } finally {
      setIsDownloadingTemplate(false);
    }
  }

  async function processFile(file: File) {
    if (!file) return;
    setFileName(file.name);
    setStep('uploading');
    setErrorMsg('');

    try {
      if (!create_api) {
        // No API — just parse and show preview (fallback)
        const text = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target?.result as string);
          reader.onerror = () => rej(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) throw new Error('File has no data rows.');
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows: Record<string, any>[] = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
          return obj;
        });

        setStep('success');
        onImportSuccess?.(rows);
        return;
      }

      // Send as multipart/form-data for file upload
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(create_api, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      // Check if response contains job_id (async job)
      if (response.data.job_id) {
        setJobId(response.data.job_id);
        setStep('success');
        setShowProgress(true);
        toast.info('Import job started. Processing in background...');
      } else if (response.data.success || response.status === 200 || response.status === 201) {
        // Sync response
        let count = 0;
        if (response.data.count) {
          count = response.data.count;
        } else if (response.data.imported_count) {
          count = response.data.imported_count;
        } else if (response.data.total) {
          count = response.data.total;
        } else {
          count = 1;
        }
        
        setStep('success');
        const successMessage = response.data.message || `${count} records imported successfully`;
        toast.success(successMessage);
        onImportSuccess?.(response.data.rows || response.data.data || []);
        setTimeout(() => onClose(), 2000);
      } else {
        throw new Error(response.data.message || 'Import failed');
      }
    } catch (err: any) {
      let errorMessage = 'Unknown error';
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0]?.msg || JSON.stringify(err.response.data.detail);
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrorMsg(errorMessage);
      setStep('error');
      toast.error(errorMessage);
    }
  }

  const handleImportComplete = () => {
    onImportSuccess?.([]);
    onClose();
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Import Data</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Step 1 — Download Format */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                    Step 1 — Download Format
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get the CSV template with the correct column headers.
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  disabled={isDownloadingTemplate}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadingTemplate ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileDown className="h-5 w-5" />
                  )}
                  Download
                </button>
              </div>
            </div>

            {/* Step 2 — Upload File */}
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Step 2 — Upload Your File
              </p>

              {step === 'idle' || step === 'error' ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all py-8 flex flex-col items-center justify-center gap-2 ${
                    dragOver
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : step === 'error'
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {step === 'error' ? (
                    <AlertCircle className="h-7 w-7 text-red-400" />
                  ) : (
                    <Upload className={`h-7 w-7 ${dragOver ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                  )}
                  <div className="text-center">
                    <p className={`text-xs font-medium ${step === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {step === 'error' ? errorMsg : 'Drop your file here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                      {step === 'error' ? 'Click to try again' : 'Supports .csv, .xlsx, .xls'}
                    </p>
                  </div>
                </div>
              ) : step === 'uploading' ? (
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5 flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Uploading {fileName}…</p>
                    <p className="text-xs text-gray-400 mt-0.5">Starting import job...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5 flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Upload complete!
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                      {fileName} has been uploaded successfully.
                    </p>
                    {jobId && (
                      <p className="text-[10px] text-emerald-500/70 mt-2">
                        Job ID: {jobId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            {step === 'success' ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                {jobId && (
                  <button
                    onClick={() => setShowProgress(true)}
                    className="px-4 py-2 rounded-sm text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm flex items-center gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Track Progress
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={step === 'uploading'}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={step === 'uploading'}
                  className="px-4 py-2 rounded-sm text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
                >
                  {step === 'uploading' ? 'Uploading…' : 'Browse File'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      {showProgress && jobId && (
        <ImportProgressModal
          jobId={jobId}
          onClose={() => setShowProgress(false)}
          onComplete={handleImportComplete}
        />
      )}
    </>
  );
}

// ─── DataList ─────────────────────────────────────────────────────────────────

// Import ServerAddress for use in the component
import ServerAddress from '@/constent/ServerAddress';

export function DataList<T extends Record<string, any>>({
  title,
  data = [],
  apiPath,
  dataPath = 'employees',
  onDataLoaded,
  columns,
  searchPlaceholder = 'Search...',
  rowKey,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  onExport,
  toolbar,
  emptyMessage = 'No data found.',
  onRowClick,
  className = '',
  is_import = false,
  create_api,
  template_api,
  onImportSuccess,
  transformResponse,
}: DataListProps<T>) {
  const [internalData, setInternalData] = useState<T[]>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch data from API
  useEffect(() => {
    if (!apiPath) {
      setInternalData(data);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');

        const response = await axios.get(apiPath, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
console.log("response.data.data", response);
        let fetchedData: T[] = [];
        
        if (transformResponse) {
          fetchedData = transformResponse(response.data);
        } else if (dataPath && response.data[dataPath]) {
          fetchedData = response.data[dataPath];
        } else if (Array.isArray(response.data)) {
          fetchedData = response.data;
        } else if (response.data.success && response.data.data) {
          fetchedData = response.data.data;
        } else {
          const possibleArray = Object.values(response.data).find(Array.isArray);
          if (possibleArray) fetchedData = possibleArray as T[];
        }

        if (isMounted) {
          setInternalData(fetchedData);
          setTotalCount(response.data.total || fetchedData.length);
          onDataLoaded?.(fetchedData);
        }
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [apiPath, dataPath, transformResponse]);

  const [globalSort, setGlobalSort] = useState('newest');
  const [globalSortOpen, setGlobalSortOpen] = useState(false);
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('all');

  const filterableColumns = columns.filter(c => c.filterable && c.filterOptions?.length);
  const globalFilterOptions = filterableColumns[0]?.filterOptions ?? [];

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  function setColumnFilter(key: string, value: string) {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  const processed = useMemo(() => {
    let rows = [...internalData];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    if (globalFilter !== 'all' && filterableColumns[0]) {
      const key = filterableColumns[0].key;
      rows = rows.filter(row => String(row[key]) === globalFilter);
    }

    Object.entries(columnFilters).forEach(([key, val]) => {
      if (val && val !== 'all') {
        rows = rows.filter(row => String(row[key]) === val);
      }
    });

    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    } else if (globalSort === 'oldest') {
      rows.sort((a, b) => {
        const dateA = a.createdAt || a.created_at || 0;
        const dateB = b.createdAt || b.created_at || 0;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    } else {
      rows.sort((a, b) => {
        const dateA = a.createdAt || a.created_at || 0;
        const dateB = b.createdAt || b.created_at || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    }

    return rows;
  }, [internalData, search, globalFilter, columnFilters, sortKey, sortDir, globalSort, columns, filterableColumns]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  function getRowKey(row: T, i: number): string {
    if (!rowKey) return String(i);
    if (typeof rowKey === 'function') return rowKey(row);
    return String(row[rowKey]);
  }

  const handleImportSuccess = (rows: Record<string, any>[]) => {
    if (apiPath) {
      const token = localStorage.getItem('access_token');
      axios.get(apiPath, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(response => {
        let fetchedData: T[] = [];
        if (transformResponse) {
          fetchedData = transformResponse(response.data);
        } else if (dataPath && response.data[dataPath]) {
          fetchedData = response.data[dataPath];
        } else if (Array.isArray(response.data)) {
          fetchedData = response.data;
        } else if (response.data.success && response.data.data) {
          fetchedData = response.data.data;
        }
        setInternalData(fetchedData);
        onDataLoaded?.(fetchedData);
        toast.success('Data refreshed successfully');
      }).catch(err => {
        console.error('Failed to refresh data:', err);
      });
    }
    onImportSuccess?.(rows);
  };

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
          <div className="relative w-full sm:flex-1 min-w-0 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
            {globalFilterOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setGlobalFilterOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {globalFilter === 'all' ? (filterableColumns[0]?.title ?? 'Filter') : globalFilterOptions.find(o => o.value === globalFilter)?.label ?? globalFilter}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {globalFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setGlobalFilterOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
                      {[{ label: `All ${filterableColumns[0]?.title ?? ''}`, value: 'all' }, ...globalFilterOptions].map(opt => (
                        <button key={opt.value} onClick={() => { setGlobalFilter(opt.value); setGlobalFilterOpen(false); setPage(1); }}
                          className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalFilter === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setGlobalSortOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
                {globalSort === 'newest' ? 'Newest First' : 'Oldest First'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {globalSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGlobalSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
                    {[{ label: 'Newest First', value: 'newest' }, { label: 'Oldest First', value: 'oldest' }].map(opt => (
                      <button key={opt.value} onClick={() => { setGlobalSort(opt.value); setGlobalSortOpen(false); setPage(1); }}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalSort === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {onExport && (
              <button onClick={onExport}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Export">
                <Download className="h-5 w-5" />
              </button>
            )}

            {is_import && (
              <button
                onClick={() => setImportModalOpen(true)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                aria-label="Import"
              >
                <Upload className="h-5 w-5" />
              </button>
            )}

            {toolbar}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors' : ''}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        {col.title}
                      </span>
                      {col.sortable && (
                        <span className="cursor-pointer" onClick={() => handleSort(col.key)}>
                          <SortIcon direction={sortKey === col.key ? sortDir : null} />
                        </span>
                      )}
                      {col.filterable && col.filterOptions?.length && (
                        <ColumnFilter
                          options={col.filterOptions}
                          value={columnFilters[col.key] ?? 'all'}
                          onChange={v => setColumnFilter(col.key, v)}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading data...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={getRowKey(row, i)}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-1">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span className="bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-md">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {totalCount || processed.length}</span>
            <span className="text-gray-200 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1">
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-xs bg-transparent border-none outline-none cursor-pointer text-gray-500 dark:text-gray-400"
              >
                {pageSizeOptions.map(s => <option key={s} value={s}>{s} per page</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        columns={columns}
        create_api={create_api}
        template_api={template_api}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
}

export default DataList;