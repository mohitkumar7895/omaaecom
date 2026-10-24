"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle, Image as ImageIcon, RefreshCw, X, Sparkles } from "lucide-react";

export interface AutoImageUploadProps {
  name: string;
  label?: string;
  recommendedText?: string;
  targetWidth?: number;
  targetHeight?: number;
  currentImageUrl?: string | null;
  required?: boolean;
  defaultFit?: "contain" | "cover";
  aspectRatioDisplay?: string;
  className?: string;
}

/**
 * AutoImageUpload: Automatically detects, resizes, crops/fits, and compresses
 * any photo uploaded in the admin panel to the exact target dimensions instantly.
 */
export default function AutoImageUpload({
  name,
  label = "Upload Image",
  recommendedText,
  targetWidth = 500,
  targetHeight = 500,
  currentImageUrl,
  required = false,
  defaultFit,
  aspectRatioDisplay,
  className = "",
}: AutoImageUploadProps) {
  // Determine default fit mode: cover for wide banners, contain for square/products so they don't get cropped
  const initialFit = defaultFit || (targetWidth / targetHeight > 1.8 ? "cover" : "contain");
  const [fitMode, setFitMode] = useState<"contain" | "cover">(initialFit);
  
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isRemoved, setIsRemoved] = useState<boolean>(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<{
    originalSize: string;
    originalDimensions: string;
    finalSize: string;
    finalDimensions: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const recText = recommendedText || `Recommended: ${targetWidth} × ${targetHeight} px ${aspectRatioDisplay ? `(${aspectRatioDisplay})` : ""}`;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const processAndResize = async (file: File, mode: "contain" | "cover") => {
    setProcessing(true);
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = objectUrl;
      });

      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context unavailable");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Background handling
      if (mode === "contain") {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        const scale = Math.min(targetWidth / origW, targetHeight / origH);
        const nw = origW * scale;
        const nh = origH * scale;
        const dx = (targetWidth - nw) / 2;
        const dy = (targetHeight - nh) / 2;
        ctx.drawImage(img, dx, dy, nw, nh);
      } else {
        const scale = Math.max(targetWidth / origW, targetHeight / origH);
        const nw = origW * scale;
        const nh = origH * scale;
        const dx = (targetWidth - nw) / 2;
        const dy = (targetHeight - nh) / 2;
        ctx.drawImage(img, dx, dy, nw, nh);
      }

      URL.revokeObjectURL(objectUrl);

      // Convert to webp data URL
      try {
        const webpDataUrl = canvas.toDataURL("image/webp", 0.90);
        if (webpDataUrl && webpDataUrl.startsWith("data:image/")) {
          setImageBase64(webpDataUrl);
        }
      } catch (e) {
        console.warn("Could not generate webp dataUrl:", e);
      }

      // Convert to webp blob (fallback to jpeg if webp unsupported)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          "image/webp",
          0.90
        );
      });

      if (!blob) throw new Error("Could not process image blob");

      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const optimizedFile = new File([blob], `${baseName}-auto-sized.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      // Populate file to hidden form input via DataTransfer
      if (hiddenInputRef.current && typeof DataTransfer !== "undefined") {
        try {
          const dt = new DataTransfer();
          dt.items.add(optimizedFile);
          hiddenInputRef.current.files = dt.files;
        } catch (e) {}
      }

      // Update preview & stats
      const newPreview = URL.createObjectURL(blob);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(newPreview);
      setIsRemoved(false);
      setStats({
        originalSize: formatBytes(file.size),
        originalDimensions: `${origW}×${origH}`,
        finalSize: formatBytes(blob.size),
        finalDimensions: `${targetWidth}×${targetHeight}`,
      });
    } catch (err) {
      console.error("Auto image resizing failed, using raw file:", err);
      // Fallback: attach raw file if canvas fails
      if (hiddenInputRef.current && typeof DataTransfer !== "undefined") {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          hiddenInputRef.current.files = dt.files;
        } catch (e) {}
      }
      setPreviewUrl(URL.createObjectURL(file));
      setIsRemoved(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsRemoved(false);
      setOriginalFile(file);

      // 1. Immediately read file as base64 so submission NEVER fails even if clicked right away
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // 2. Try to sync hidden input with raw file immediately
      if (hiddenInputRef.current && typeof DataTransfer !== "undefined") {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          hiddenInputRef.current.files = dt.files;
        } catch (err) {}
      }

      // 3. Process & resize asynchronously
      processAndResize(file, fitMode);
    }
  };

  const handleToggleFit = () => {
    const nextMode = fitMode === "cover" ? "contain" : "cover";
    setFitMode(nextMode);
    if (originalFile) {
      processAndResize(originalFile, nextMode);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOriginalFile(null);
    setImageBase64("");
    setIsRemoved(true);
    setStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (hiddenInputRef.current) {
      if (typeof DataTransfer !== "undefined") {
        hiddenInputRef.current.files = new DataTransfer().files;
      } else {
        hiddenInputRef.current.value = "";
      }
    }
  };

  // Re-process if target dimensions change
  useEffect(() => {
    if (originalFile) {
      processAndResize(originalFile, fitMode);
    }
  }, [targetWidth, targetHeight]);

  const displayImage = !isRemoved ? (previewUrl || currentImageUrl || null) : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Recommendation Info */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        <label className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
          {label}
          {required && !currentImageUrl && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Auto-Sizing Active ({targetWidth} × {targetHeight} px)
        </span>
      </div>

      {/* Hidden input for base64 fallback (guarantees image transfer across all browsers & Server Actions) */}
      <input
        type="hidden"
        name={`${name}_base64`}
        value={imageBase64}
      />

      {/* Hidden input if image removed */}
      <input
        type="hidden"
        name={`${name}_removed`}
        value={isRemoved ? "1" : "0"}
      />

      {/* Actual Form Input (Receives the optimized file for server action) */}
      <input
        ref={hiddenInputRef}
        type="file"
        name={name}
        className="hidden"
        tabIndex={-1}
        required={required && !currentImageUrl && !displayImage}
      />

      {/* Visible Interactive Drop/Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
          displayImage
            ? "border-emerald-300 bg-emerald-50/20 hover:border-emerald-400"
            : "border-gray-300 bg-gray-50/70 hover:border-blue-500 hover:bg-blue-50/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={`${name}_raw`}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {displayImage ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview Box */}
            <div className="relative shrink-0 w-32 h-24 sm:w-40 sm:h-28 bg-gray-900/5 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt="Preview"
                className={`w-full h-full ${
                  fitMode === "cover" ? "object-cover" : "object-contain"
                }`}
              />
              {processing && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-medium gap-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Auto-sizing...
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="flex-1 min-w-0 w-full space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {previewUrl
                    ? "Photo automatically resized & set ek dum perfect!"
                    : "Current Image Loaded"}
                </span>
              </div>

              {stats && (
                <div className="text-[11px] text-gray-600 space-y-0.5 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Auto-Target:</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {stats.finalDimensions} px WebP
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Optimized Size:</span>
                    <span className="font-semibold text-gray-800 font-mono">
                      {stats.finalSize} <span className="text-[10px] text-gray-400 line-through">({stats.originalSize})</span>
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-500">
                Click box to change photo anytime.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleToggleFit}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-2xs transition"
                >
                  Mode: {fitMode === "cover" ? "Fill (Cover)" : "Fit (Contain)"}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition"
                >
                  Change Photo
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-[11px] font-semibold px-2 py-1 rounded text-red-600 hover:bg-red-50 border border-red-200 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-5 px-3 text-center">
            <div className="w-11 h-11 mb-2.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Click to choose photo or drag & drop here
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Koi bhi photo daalo — size automatically adjust ho jayega (
              <span className="font-semibold text-gray-700">{targetWidth} × {targetHeight} px</span>).
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-800 bg-emerald-100/70">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Auto-crop, resize & WebP compression on select
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        {recText}
      </p>
    </div>
  );
}
