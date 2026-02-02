"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { photoSchema, type PhotoFormData, type ProfileFormData } from "@/lib/validations/profile";

interface PhotoStepProps {
  defaultValues?: Partial<ProfileFormData>;
  onNext: (data: PhotoFormData) => void;
}

export function PhotoStep({ defaultValues, onNext }: PhotoStepProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [blurredPreview, setBlurredPreview] = useState<string | null>(null);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PhotoFormData>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      photo: defaultValues?.photo,
    },
  });

  const processImage = useCallback((file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      // Create blurred preview using canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Apply blur filter
        ctx.filter = "blur(20px)";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        setBlurredPreview(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue("photo", file, { shouldValidate: true });
        processImage(file);
      }
    },
    [setValue, processImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const clearPhoto = () => {
    setPreview(null);
    setBlurredPreview(null);
    setValue("photo", undefined as any);
  };

  const onSubmit = (data: PhotoFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-4">
          {!preview ? (
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                isDragActive
                  ? "border-primary bg-primary-light"
                  : "border-muted-foreground/30 hover:border-primary hover:bg-primary-light/50",
                errors.photo && "border-destructive"
              )}
            >
              <input {...getInputProps()} />
              <ImagePlus className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">
                {isDragActive ? "여기에 놓아주세요" : "사진을 업로드해주세요"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, WebP · 최대 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Original preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    원본
                  </p>
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    <img
                      src={preview}
                      alt="Original"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Blurred preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    공개될 모습
                  </p>
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    {blurredPreview ? (
                      <img
                        src={blurredPreview}
                        alt="Blurred"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full animate-pulse bg-muted" />
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearPhoto}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                다른 사진 선택
              </Button>
            </div>
          )}

          {errors.photo && (
            <p className="mt-2 text-sm text-destructive">
              {errors.photo.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl bg-primary-light p-4">
        <p className="text-sm text-primary">
          <strong>블라인드 처리</strong>가 적용되어 프로필 공개 전까지 얼굴이
          보이지 않아요. 프로필 공개에 동의하면 원본 사진이 공개됩니다.
        </p>
      </div>

      <Button type="submit" fullWidth disabled={!preview}>
        다음
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}
