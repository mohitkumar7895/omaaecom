import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nyonmwpxzzwkhwylxkcs.supabase.co";
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "omaa-images";

// Singleton admin client for storage uploads (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

let bucketEnsured = false;

/**
 * Ensures that the target storage bucket exists and is public.
 */
export async function ensureBucket(): Promise<void> {
  if (bucketEnsured) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === bucketName);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
    }
    bucketEnsured = true;
  } catch (err) {
    console.warn("Bucket ensure check warning:", err);
  }
}

/**
 * Uploads an image buffer directly to Supabase Storage and returns its public URL.
 * Never stores files on local disk / Vercel ephemeral filesystem.
 */
export async function uploadImageToSupabase(
  buffer: Buffer,
  fileName: string,
  folder: string = "categories",
  contentType: string = "image/webp"
): Promise<string> {
  await ensureBucket();

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${folder}/${cleanFileName}`;

  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Supabase Storage Upload Error:", error);
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(storagePath);
  return data.publicUrl;
}
