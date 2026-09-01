"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Image as ImageIcon, Video, AlertCircle, Clock, Trash2, CheckCircle2, Upload } from "lucide-react";

export default function CashbackAdsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [adType, setAdType] = useState<'video' | 'image'>('video');
  const [duration, setDuration] = useState<number>(20);

  const [existingUrls, setExistingUrls] = useState<string[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const videoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'url'>('url');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/cashback-ads');
      const data = await res.json();
      if (data) {
        setAdType(data.ad_type || 'video');
        setDuration(data.duration || 20);
        let urls = [];
        try {
          urls = typeof data.media_urls === 'string' ? JSON.parse(data.media_urls) : data.media_urls;
        } catch(e) {}
        setExistingUrls(urls || []);
        if (urls && urls.length > 0 && typeof urls[0] === 'string' && urls[0].startsWith('http')) {
          setVideoUrlInput(urls[0]);
          setVideoSourceType('url');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Vercel serverless request body limit is 4.5MB
      if (file.size > 4.5 * 1024 * 1024) {
        setMessage({ 
          type: 'error', 
          text: `⚠️ File size (${(file.size / 1024 / 1024).toFixed(1)}MB) Vercel 4.5MB limit se badi hai! Badi video ke liye neeche 'Direct Video Link (URL)' option use karein ya chhoti video upload karein.` 
        });
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 6) {
        setMessage({ type: 'error', text: 'Maximum 6 images allowed' });
        return;
      }
      // Check total size under 4MB
      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      if (totalSize > 4 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Images ka total size 4MB se kam hona chahiye.' });
        return;
      }
      setImageFiles(files);
      const autoDuration = Math.ceil(files.length / 3) * 10;
      setDuration(autoDuration);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    if (newFiles.length > 0) {
      setDuration(Math.ceil(newFiles.length / 3) * 10);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('ad_type', adType);
      formData.append('duration', duration.toString());

      if (adType === 'video') {
        if (videoSourceType === 'url') {
          if (!videoUrlInput.trim()) {
            setMessage({ type: 'error', text: 'Kripya direct Video URL dalein (e.g. YouTube, Cloudinary, S3, MP4 link).' });
            setSaving(false);
            return;
          }
          formData.append('video_url', videoUrlInput.trim());
        } else {
          if (videoFile) {
            formData.append('video', videoFile);
          } else {
            formData.append('existing_media', JSON.stringify(existingUrls));
          }
        }
      } else {
        if (imageFiles.length > 0) {
          imageFiles.forEach(file => formData.append('images', file));
        } else {
          formData.append('existing_media', JSON.stringify(existingUrls));
        }
      }

      // XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/cashback-ads');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              setMessage({ type: 'success', text: '✅ Video save ho gayi! Cashback ad ready hai.' });
              setVideoFile(null);
              setVideoPreview('');
              setImageFiles([]);
              fetchConfig();
              resolve();
            } else {
              setMessage({ type: 'error', text: data.error || 'Save karne mein error aaya' });
              reject();
            }
          } else {
            setMessage({ type: 'error', text: 'Server error — dobara try karein' });
            reject();
          }
        };

        xhr.onerror = () => {
          setMessage({ type: 'error', text: 'Network error — internet check karein' });
          reject();
        };

        xhr.send(formData);
      });

    } catch (e: any) {
      // already handled above
    }
    setSaving(false);
    setUploadProgress(0);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cashback Ads Management</h1>
        <p className="text-gray-500">Video ya images upload karo jo user cashback lene pe dekhega.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Type Selection */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <label className="block text-sm font-bold text-gray-700 mb-4">Advertisement Type</label>
          <div className="flex gap-4">
            <label className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${adType === 'video' ? 'border-[#6069c9] bg-indigo-50/50 text-[#6069c9]' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
              <input type="radio" name="ad_type" value="video" checked={adType === 'video'} onChange={() => setAdType('video')} className="sr-only" />
              <Video className={`w-8 h-8 mb-2 ${adType === 'video' ? 'animate-pulse' : ''}`} />
              <span className="font-bold">Video Ad</span>
              <span className="text-xs mt-1 opacity-70">MP4 · Max 50MB</span>
            </label>

            <label className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${adType === 'image' ? 'border-[#6069c9] bg-indigo-50/50 text-[#6069c9]' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
              <input type="radio" name="ad_type" value="image" checked={adType === 'image'} onChange={() => setAdType('image')} className="sr-only" />
              <ImageIcon className={`w-8 h-8 mb-2 ${adType === 'image' ? 'animate-pulse' : ''}`} />
              <span className="font-bold">Image Slideshow</span>
              <span className="text-xs mt-1 opacity-70">Max 6 images</span>
            </label>
          </div>
        </div>

        <div className="p-6 space-y-8">

          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Ad Duration (Seconds)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="5" max="120"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 20)}
                className="w-32 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#6069c9] focus:border-transparent outline-none font-medium"
              />
              <span className="text-xs text-gray-400">seconds (user ko itne seconds baad cashback milega)</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4">
              {adType === 'video' ? '📹 Video Upload karo' : '🖼️ Images Upload karo'}
            </label>

            {adType === 'video' ? (
              <div className="space-y-5">
                
                {/* Video Source Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-sm">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('url')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${videoSourceType === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    🔗 Direct Video URL (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('upload')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${videoSourceType === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    📁 Upload File (&lt;4MB)
                  </button>
                </div>

                {videoSourceType === 'url' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-600">Video Link / URL (MP4, YouTube, S3, Cloudinary)</label>
                    <input 
                      type="url"
                      placeholder="https://example.com/ad-video.mp4 ya https://youtube.com/watch?v=..."
                      value={videoUrlInput}
                      onChange={(e) => {
                        setVideoUrlInput(e.target.value);
                        setVideoPreview(e.target.value);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#6069c9] focus:border-transparent outline-none text-sm font-medium"
                    />
                    <p className="text-[11px] text-emerald-600 font-medium">
                      💡 Vercel par file upload ki 4.5MB limit hoti hai, isliye video ka direct link daalna 100% fast aur bina error ke chalta hai.
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      ref={videoRef}
                      onChange={handleVideoChange}
                      className="hidden"
                    />

                    {/* Drop Zone */}
                    <button
                      type="button"
                      onClick={() => videoRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#6069c9] hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#6069c9] transition-colors" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 group-hover:text-[#6069c9] transition-colors">
                        {videoFile ? `✅ ${videoFile.name}` : 'Click karo — Video File Select karo'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {videoFile
                          ? `Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB`
                          : 'MP4 / WebM • Max 4.5MB for Vercel'}
                      </span>
                    </button>
                  </>
                )}

                {/* Upload Progress Bar */}
                {saving && adType === 'video' && videoFile && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>Upload ho raha hai...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6069c9] to-indigo-400 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      {uploadProgress < 100 ? 'File server pe ja rahi hai... wait karo 🙏' : '✅ Upload complete! Save ho raha hai...'}
                    </p>
                  </div>
                )}

                {/* Preview — new file */}
                {videoPreview && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preview (Sirf pehle 20 sec dikhenge user ko):</p>
                    <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-sm">
                      <video src={videoPreview} controls className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

                {/* Preview — existing saved video */}
                {!videoFile && existingUrls.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Currently Saved Video:</p>
                    <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-sm">
                      <video src={existingUrls[0]} controls className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ad Images</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Recommended: 800 × 400 px (2:1) or 600 × 450 px (4:3)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  ref={imageRef}
                  onChange={handleImagesChange}
                  className="hidden"
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {imageFiles.length > 0 ? (
                    imageFiles.map((file, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : existingUrls.length > 0 && !existingUrls[0].endsWith('.mp4') ? (
                    existingUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={url} alt="Saved" className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : null}

                  {imageFiles.length < 6 && (
                    <button
                      onClick={() => imageRef.current?.click()}
                      className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-[#6069c9] transition flex flex-col items-center justify-center text-gray-400 group"
                    >
                      <ImageIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform group-hover:text-[#6069c9]" />
                      <span className="text-sm font-medium group-hover:text-[#6069c9]">Add Image</span>
                      <span className="text-[10px]">({imageFiles.length || (existingUrls[0]?.endsWith('.mp4') ? 0 : existingUrls.length)} / 6)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {adType === 'video' ? '⚡ Video badi hogi toh upload mein time lagega — wait karo' : ''}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#6069c9] hover:bg-[#525ab5] text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? `Uploading... ${uploadProgress}%` : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
