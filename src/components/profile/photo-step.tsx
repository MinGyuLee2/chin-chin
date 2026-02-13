"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  photoSchema,
  MAX_PHOTOS,
  type PhotoFormData,
  type PhotoItem,
  type ProfileFormData,
} from "@/lib/validations/profile";

interface PhotoStepProps {
  defaultValues?: Partial<ProfileFormData>;
  onNext: (data: PhotoFormData) => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
  blurEnabled: boolean;
}

export function PhotoStep({ defaultValues, onNext }: PhotoStepProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>(() => {
    if (defaultValues?.photos) {
      return defaultValues.photos.map((p: PhotoItem) => ({
        file: p.file,
        preview: URL.createObjectURL(p.file),
        blurEnabled: p.blurEnabled,
      }));
    }
    return [];
  });

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PhotoFormData>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      photos: defaultValues?.photos || [],
    },
  });

  const syncFormValue = useCallback(
    (updated: PhotoPreview[]) => {
      const formPhotos = updated.map((p) => ({
        file: p.file,
        blurEnabled: p.blurEnabled,
      }));
      setValue("photos", formPhotos, { shouldValidate: true });
    },
    [setValue]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = MAX_PHOTOS - photos.length;
      const filesToAdd = acceptedFiles.slice(0, remaining);

      const newPhotos: PhotoPreview[] = filesToAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        blurEnabled: true,
      }));

      const updated = [...photos, ...newPhotos];
      setPhotos(updated);
      syncFormValue(updated);
    },
    [photos, syncFormValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: photos.length >= MAX_PHOTOS,
  });

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].preview);
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    syncFormValue(updated);
  };

  const toggleBlur = (index: number) => {
    const updated = photos.map((p, i) =>
      i === index ? { ...p, blurEnabled: !p.blurEnabled } : p
    );
    setPhotos(updated);
    syncFormValue(updated);
  };

  const onSubmit = (data: PhotoFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-4">
          {/* 사진 그리드 */}
          {photos.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt={`사진 ${index + 1}`}
                    className={cn(
                      "h-full w-full object-cover",
                      photo.blurEnabled && "blur-xl scale-110"
                    )}
                  />
                  {/* 블러 토글 */}
                  <button
                    type="button"
                    onClick={() => toggleBlur(index)}
                    className={cn(
                      "absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium backdrop-blur-sm transition-colors",
                      photo.blurEnabled
                        ? "bg-black/50 text-white"
                        : "bg-white/80 text-foreground"
                    )}
                  >
                    {photo.blurEnabled ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        블러
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        공개
                      </>
                    )}
                  </button>
                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {/* 메인 사진 표시 */}
                  {index === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                      대표
                    </span>
                  )}
                </div>
              ))}

              {/* 추가 버튼 */}
              {photos.length < MAX_PHOTOS && (
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                    isDragActive
                      ? "border-primary bg-primary-light"
                      : "border-muted-foreground/30 hover:border-primary hover:bg-primary-light/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <ImagePlus className="mb-1 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {photos.length}/{MAX_PHOTOS}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 빈 상태: 첫 업로드 */}
          {photos.length === 0 && (
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                isDragActive
                  ? "border-primary bg-primary-light"
                  : "border-muted-foreground/30 hover:border-primary hover:bg-primary-light/50",
                errors.photos && "border-destructive"
              )}
            >
              <input {...getInputProps()} />
              <ImagePlus className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">
                {isDragActive ? "여기에 놓아주세요" : "사진을 업로드해주세요"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, WebP · 최대 10MB · {MAX_PHOTOS}장까지
              </p>
            </div>
          )}

          {errors.photos && (
            <p className="mt-2 text-sm text-destructive">
              {typeof errors.photos.message === "string"
                ? errors.photos.message
                : "사진을 확인해주세요"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2 rounded-xl bg-primary-light p-4">
        <p className="text-sm text-primary">
          <strong>블러 ON</strong> — 프로필 공개 동의 전까지 사진이 블러 처리돼요.
        </p>
        <p className="text-sm text-primary">
          <strong>블러 OFF (공개)</strong> — 사진이 즉시 원본으로 공개돼요.
        </p>
      </div>

      <Button type="submit" fullWidth disabled={photos.length === 0}>
        다음
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}
