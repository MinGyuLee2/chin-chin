import sharp from "sharp";
import type { ProfilePhoto } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = { storage: any };

export interface UploadedPhotoInput {
  storagePath: string;
  blurEnabled: boolean;
}

/**
 * 클라이언트에서 스토리지에 직접 업로드한 사진들에 대해 블러 처리를 합니다.
 * blurEnabled가 true인 사진은 스토리지에서 다운로드 → sharp 블러 → 재업로드합니다.
 */
export async function processBlurForUploadedPhotos(
  supabase: AnySupabaseClient,
  uploadedPhotos: UploadedPhotoInput[]
): Promise<{ photos: ProfilePhoto[]; photoUrl: string; originalPhotoUrl: string }> {
  const results: ProfilePhoto[] = [];

  for (const photo of uploadedPhotos) {
    const { data: originalUrl } = supabase.storage
      .from("profiles")
      .getPublicUrl(photo.storagePath);

    let displayUrl = originalUrl.publicUrl;

    if (photo.blurEnabled) {
      // 스토리지에서 원본 다운로드
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("profiles")
        .download(photo.storagePath);

      if (downloadError || !fileData) {
        console.error("Download error:", downloadError);
        throw new Error("사진 처리에 실패했어요");
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const blurredPath = photo.storagePath.replace(/_original\.\w+$/, "_blurred.jpeg");

      const blurredBuffer = await sharp(buffer)
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

      const { data: blurredUrl } = supabase.storage
        .from("profiles")
        .getPublicUrl(blurredPath);

      displayUrl = blurredUrl.publicUrl;
    }

    results.push({
      url: displayUrl,
      originalUrl: originalUrl.publicUrl,
      blurEnabled: photo.blurEnabled,
    });
  }

  // 하위 호환: 첫 번째 사진의 URL 반환
  const first = results[0];
  return {
    photos: results,
    photoUrl: first.url,
    originalPhotoUrl: first.originalUrl,
  };
}
