"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import {
  ALLOWED_MEDICAL_EXTENSIONS,
  MAX_MEDICAL_FILE_BYTES,
  deleteMedicalDocument,
  getMedicalDocument,
  getMedicalDocumentStatus,
  listMedicalDocuments,
  uploadMedicalReport,
} from "@/lib/physical-health-service";
import { toast } from "@/hooks/use-toast";
import type {
  MedicalDocumentDetail,
  MedicalReportType,
  UrgencyLevel,
} from "@/types/physical-health";

const REPORT_TYPES: { value: MedicalReportType; label: string }[] = [
  { value: "lab_work", label: "Lab work" },
  { value: "blood_test", label: "Blood test" },
  { value: "xray_mri", label: "X-ray / MRI" },
  { value: "prescription", label: "Prescription" },
  { value: "general_checkup", label: "General checkup" },
  { value: "specialist", label: "Specialist" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, string> = {
  uploaded:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/40",
  processing:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40",
  analyzed:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800/40",
  failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/40",
};

const URGENCY_STYLES: Record<string, string> = {
  routine:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  follow_up:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  urgent:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  emergency:
    "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
};

const FLAG_STATUS_STYLES: Record<string, string> = {
  normal:
    "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
  borderline:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  low: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  high: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MedicalDocsTab() {
  const [docs, setDocs] = useState<MedicalDocumentDetail[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<MedicalReportType>("lab_work");
  const [reportDate, setReportDate] = useState("");
  const [facility, setFacility] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<
    Record<string, MedicalDocumentDetail>
  >({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pollersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await listMedicalDocuments({ page: 1, limit: 50 });
      setDocs(res.documents);
    } catch (e) {
      toast({
        title: "Could not load documents",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const stopPoller = (docId: string) => {
    const h = pollersRef.current[docId];
    if (h) {
      clearInterval(h);
      delete pollersRef.current[docId];
    }
  };

  const startPoller = useCallback((docId: string) => {
    if (pollersRef.current[docId]) return;
    let elapsed = 0;
    const handle = setInterval(async () => {
      elapsed += 3000;
      try {
        const status = await getMedicalDocumentStatus(docId);
        if (status.status === "analyzed" || status.status === "failed") {
          stopPoller(docId);
          try {
            const detail = await getMedicalDocument(docId);
            setDocs((prev) =>
              prev.map((d) => (d.doc_id === docId ? detail : d)),
            );
            setDetailCache((prev) => ({ ...prev, [docId]: detail }));
          } catch {
            // fall back to status-only update
            setDocs((prev) =>
              prev.map((d) =>
                d.doc_id === docId ? { ...d, status: status.status } : d,
              ),
            );
          }
        } else {
          setDocs((prev) =>
            prev.map((d) =>
              d.doc_id === docId ? { ...d, status: status.status } : d,
            ),
          );
        }
      } catch {
        // ignore transient errors
      }
      if (elapsed >= 90_000) stopPoller(docId);
    }, 3000);
    pollersRef.current[docId] = handle;
  }, []);

  useEffect(() => {
    return () => {
      Object.values(pollersRef.current).forEach(clearInterval);
      pollersRef.current = {};
    };
  }, []);

  useEffect(() => {
    docs.forEach((d) => {
      if (
        (d.status === "processing" || d.status === "uploaded") &&
        !pollersRef.current[d.doc_id]
      ) {
        startPoller(d.doc_id);
      }
    });
  }, [docs, startPoller]);

  const onFileChange = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_MEDICAL_FILE_BYTES) {
      toast({
        title: "File too large",
        description: `Maximum size is ${formatBytes(MAX_MEDICAL_FILE_BYTES)}.`,
        variant: "destructive",
      });
      return;
    }
    const lower = f.name.toLowerCase();
    if (!ALLOWED_MEDICAL_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Choose a PDF or Word document first.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const res = await uploadMedicalReport(file, {
        report_type: reportType,
        report_date: reportDate || undefined,
        issuing_facility: facility.trim() || undefined,
      });
      toast({
        title: "Upload started",
        description: res.message || "Processing your document…",
      });
      setFile(null);
      setReportDate("");
      setFacility("");
      await loadList();
      startPoller(res.doc_id);
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleExpand = async (docId: string) => {
    if (expandedId === docId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(docId);
    if (!detailCache[docId]) {
      try {
        const detail = await getMedicalDocument(docId);
        setDetailCache((prev) => ({ ...prev, [docId]: detail }));
      } catch (e) {
        toast({
          title: "Could not load details",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const onDelete = async (docId: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeletingId(docId);
    try {
      await deleteMedicalDocument(docId);
      stopPoller(docId);
      setDocs((prev) => prev.filter((d) => d.doc_id !== docId));
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      if (expandedId === docId) setExpandedId(null);
      toast({
        title: "Document deleted",
      });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload panel */}
      <form
        onSubmit={onUpload}
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center flex-shrink-0">
            <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Upload medical report
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              PDF or Word document, up to{" "}
              {formatBytes(MAX_MEDICAL_FILE_BYTES)}. AI analysis starts
              automatically.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors">
          <Upload className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
            {file
              ? `${file.name} (${formatBytes(file.size)})`
              : "Choose a file…"}
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Report type
            </label>
            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value as MedicalReportType)
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Report date
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Issuing facility
            </label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              placeholder="e.g. Apollo Hospital"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !file}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Your medical documents
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {docs.length} document{docs.length === 1 ? "" : "s"}
          </span>
        </div>

        {loadingList ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : docs.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              No documents yet. Upload your first medical report above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {docs.map((d) => {
              const detail = detailCache[d.doc_id] ?? d;
              const isOpen = expandedId === d.doc_id;
              const statusClass =
                STATUS_STYLES[d.status] ?? STATUS_STYLES.uploaded;
              return (
                <li key={d.doc_id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                          {d.filename}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${statusClass}`}
                        >
                          {d.status}
                        </span>
                        {d.urgency_level && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              URGENCY_STYLES[d.urgency_level as UrgencyLevel] ??
                              URGENCY_STYLES.routine
                            }`}
                          >
                            {d.urgency_level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{d.report_type}</span>
                        <span>•</span>
                        <span>Uploaded {formatDate(d.uploaded_at)}</span>
                        {d.issuing_facility && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {d.issuing_facility}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(d.doc_id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d.doc_id)}
                      disabled={deletingId === d.doc_id}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors disabled:opacity-60"
                      aria-label="Delete"
                    >
                      {deletingId === d.doc_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 ml-12 space-y-3">
                      {detail.status === "processing" ||
                      detail.status === "uploaded" ? (
                        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/30">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analysis in progress — this usually takes less than a
                          minute.
                        </div>
                      ) : detail.status === "failed" ? (
                        <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-200 dark:border-red-800/30">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          Analysis failed. Try deleting and re-uploading the
                          document.
                        </div>
                      ) : (
                        <>
                          {detail.summary && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Summary
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                {detail.summary}
                              </p>
                            </div>
                          )}
                          {detail.key_findings &&
                            detail.key_findings.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  Key findings
                                </h4>
                                <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                                  {detail.key_findings.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {detail.flagged_values &&
                            detail.flagged_values.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  Flagged values
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-left text-gray-500 dark:text-gray-400">
                                        <th className="py-1 pr-3 font-medium">
                                          Marker
                                        </th>
                                        <th className="py-1 pr-3 font-medium">
                                          Value
                                        </th>
                                        <th className="py-1 pr-3 font-medium">
                                          Normal range
                                        </th>
                                        <th className="py-1 pr-3 font-medium">
                                          Status
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.flagged_values.map((fv, i) => (
                                        <tr
                                          key={i}
                                          className="border-t border-gray-100 dark:border-gray-800"
                                        >
                                          <td className="py-1.5 pr-3 text-gray-700 dark:text-gray-300">
                                            {fv.name}
                                          </td>
                                          <td className="py-1.5 pr-3 text-gray-700 dark:text-gray-300">
                                            {fv.value}
                                          </td>
                                          <td className="py-1.5 pr-3 text-gray-500 dark:text-gray-400">
                                            {fv.normal_range}
                                          </td>
                                          <td className="py-1.5 pr-3">
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                FLAG_STATUS_STYLES[fv.status] ??
                                                FLAG_STATUS_STYLES.normal
                                              }`}
                                            >
                                              {fv.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <ul className="mt-2 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                                  {detail.flagged_values.map((fv, i) => (
                                    <li key={i}>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {fv.name}:
                                      </span>{" "}
                                      {fv.plain_explanation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {detail.recommendations &&
                            detail.recommendations.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  Recommendations
                                </h4>
                                <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                                  {detail.recommendations.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {detail.follow_up_needed && (
                            <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800/30">
                              Follow-up recommended — consider booking a
                              consultation.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
