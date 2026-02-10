import sharp from "sharp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = { storage: any };

export async function processAndUploadProfileImage(
  supabase: AnySupabaseClient,
  file: File,
  userId: string,
  shortId: string
): Promise<{ photoUrl: string; originalPhotoUrl: string }> {
  const photoBuffer = await file.arrayBuffer();
  const photoExtension = file.type.split("/")[1];
  const photoPath = `${userId}/${shortId}/original.${photoExtension}`;
  const blurredPath = `${userId}/${shortId}/blurred.jpeg`;

  // Upload original photo
  const { error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(photoPath, photoBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("사진 업로드에 실패했어요");
  }

  // Generate blurred version using Sharp
  const blurredBuffer = await sharp(Buffer.from(photoBuffer))
    .resize(400)
    .blur(30)
    .jpeg({ quality: 60 })
    .toBuffer();

  const { error: blurUploadError } = await supabase.storage
    .from("profiles")
    .upload(blurredPath, blurredBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (blurUploadError) {
    console.error("Blur upload error:", blurUploadError);
    throw new Error("사진 처리에 실패했어요");
  }

  // Get public URLs
  const { data: originalUrl } = supabase.storage
    .from("profiles")
    .getPublicUrl(photoPath);

  const { data: blurredUrl } = supabase.storage
    .from("profiles")
    .getPublicUrl(blurredPath);

  return {
    photoUrl: blurredUrl.publicUrl,
    originalPhotoUrl: originalUrl.publicUrl,
  };
}
