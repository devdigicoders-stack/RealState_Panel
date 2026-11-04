import React, { useRef, useState } from 'react';
import { 
  HiOutlinePhotograph, 
  HiOutlineDocumentText, 
  HiOutlineUpload, 
  HiOutlineLink, 
  HiOutlineCheckCircle, 
  HiOutlineX,
  HiOutlineDocument
} from 'react-icons/hi';
import { toast } from 'react-toastify';

/**
 * Universal File & Media Picker Component
 * Supports:
 *  1. Direct file upload via file picker (images, PDFs, documents)
 *  2. Direct Web URL input (CDN link, external photo link, etc.)
 *  3. Auto folder categorization on Backend: /uploads/{role}/{category}/{filename}
 */
export const FilePicker = ({
  value = '',
  onChange,
  role = 'superadmin',
  category = 'images', // 'images' | 'documents' | 'files'
  label = 'Upload File or Provide URL',
  accept = 'image/*,.pdf,.doc,.docx',
  placeholder = 'https://... or choose a file',
  helperText = 'Supports Images (JPG, PNG, WebP) and Documents (PDF, DOC)'
}) => {
  const [mode, setMode] = useState('both'); // 'both' | 'file' | 'link'
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size cannot exceed 25MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    formData.append('category', category);

    const token = localStorage.getItem('realestate_auth_token');

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const res = await response.json();
      if (res.success && res.data) {
        const fileUrl = res.data.url;
        setPreviewUrl(fileUrl);
        if (onChange) onChange(fileUrl);
        toast.success(`File saved to backend uploads/${role}/${category}/!`);
      } else {
        toast.error(res.message || 'File upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setPreviewUrl(val);
    if (onChange) onChange(val);
  };

  const isImage = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif') || lower.startsWith('data:image') || url.includes('/images/');
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf') || url.includes('/documents/');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-gray-700">
          {label}
        </label>
      )}

      {/* Dual Input Area: URL link + File Picker button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <HiOutlineLink className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F766E] bg-white font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrl('');
                if (onChange) onChange('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3.5 py-2 bg-gray-100 hover:bg-[#0F766E]/10 hover:text-[#0F766E] text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <HiOutlineUpload className={`w-4 h-4 ${isUploading ? 'animate-bounce text-[#0F766E]' : ''}`} />
          <span>{isUploading ? 'Uploading...' : 'Browse File'}</span>
        </button>
      </div>

      {helperText && (
        <p className="text-[10px] text-gray-400">{helperText}</p>
      )}

      {/* Visual Live Preview Box */}
      {previewUrl && (
        <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isImage(previewUrl) ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : isPdf(previewUrl) ? (
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <HiOutlineDocumentText className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <HiOutlineDocument className="w-5 h-5" />
              </div>
            )}
            <div className="overflow-hidden">
              <span className="font-bold text-gray-800 text-xs block truncate max-w-xs font-mono">
                {previewUrl.split('/').pop()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-0.5">
                <HiOutlineCheckCircle className="w-3 h-3" /> Ready & Linked
              </span>
            </div>
          </div>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:text-[#0F766E] shrink-0"
          >
            Open File
          </a>
        </div>
      )}
    </div>
  );
};

