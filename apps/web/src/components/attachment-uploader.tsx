'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface AttachmentData {
  url: string;
  name: string;
  type: 'IMAGE' | 'PDF';
  size?: number;
}

interface AttachmentUploaderProps {
  label?: string;
  required?: boolean;
  value?: AttachmentData | null;
  onChange: (attachment: AttachmentData | null) => void;
  className?: string;
}

export function AttachmentUploader({
  label = 'Lampirkan Surat Tugas / Surat Sakit',
  required = false,
  value,
  onChange,
  className = '',
}: AttachmentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validation: Type
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
    const isPdf = ext === 'pdf';

    if (!isImage && !isPdf) {
      setErrorMsg('Format file tidak didukung. Harap pilih Gambar (JPG, PNG) atau Dokumen PDF.');
      return;
    }

    // Validation: Size (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Read as Base64 for guaranteed upload compatibility
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await apiClient.post<any>('/api/v1/storage/upload-base64', {
            fileBase64: base64Data,
            fileName: file.name,
            mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          });

          if (res.success && res.data?.fileUrl) {
            onChange({
              url: res.data.fileUrl,
              name: file.name,
              type: isPdf ? 'PDF' : 'IMAGE',
              size: file.size,
            });
          } else {
            // Local fallback data URI if API endpoint is unreachable
            onChange({
              url: base64Data,
              name: file.name,
              type: isPdf ? 'PDF' : 'IMAGE',
              size: file.size,
            });
          }
        } catch {
          // Local fallback in browser
          onChange({
            url: reader.result as string,
            name: file.name,
            type: isPdf ? 'PDF' : 'IMAGE',
            size: file.size,
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('Gagal membaca file dari perangkat.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch {
      setErrorMsg('Terjadi kesalahan saat memproses file.');
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*Wajib</span>}
          </label>
          <span className="text-[10px] text-slate-400">JPG, PNG, PDF (Maks 10MB)</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
      />

      {/* File Upload Box or Preview Card */}
      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-3.5 text-center cursor-pointer transition-all bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 group"
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Mengunggah file lampiran...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-400 py-1">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 group-hover:text-emerald-600 shadow-xs transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Pilih atau Tarik File Surat Lampiran
              </div>
              <div className="text-[11px] text-slate-400">
                Wajib melampirkan surat tugas atau surat dokter resmi
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
              {value.type === 'PDF' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                {value.name}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[9px] font-bold">
                  {value.type}
                </span>
                {value.size && <span>• {formatFileSize(value.size)}</span>}
                <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Terlampir
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              title="Lihat Pratinjau Surat"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              title="Hapus / Ganti File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Modal Preview */}
      {previewModalOpen && value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-3 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  Pratinjau: {value.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {value.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto min-h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
              {value.type === 'IMAGE' ? (
                <img
                  src={value.url}
                  alt={value.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center space-y-3 p-6">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Dokumen Lampiran PDF
                  </div>
                  <a
                    href={value.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                  >
                    <span>Buka / Unduh Dokumen PDF</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
