"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { nanoid } from "nanoid";
import { Header } from "@/components/layout/header";
import { PhotoStep } from "@/components/profile/photo-step";
import { BasicInfoStep } from "@/components/profile/basic-info-step";
import { PreferencesStep } from "@/components/profile/preferences-step";
import { createSelfProfile } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toaster";
import type { ProfileFormData } from "@/lib/validations/profile";

const steps = [
  { id: 1, title: "사진 업로드", description: "본인 사진을 올려주세요" },
  { id: 2, title: "기본 정보", description: "본인에 대해 알려주세요" },
  { id: 3, title: "취향 선택", description: "취향을 선택해주세요" },
];

export default function CreateSelfProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});

  const handleStepComplete = (stepData: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (finalData: Partial<ProfileFormData>) => {
    const completeData = { ...formData, ...finalData } as ProfileFormData;

    setIsSubmitting(true);

    try {
      // 클라이언트에서 Supabase Storage에 직접 업로드 (서버 액션 페이로드 제한 우회)
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({ title: "오류", description: "로그인이 필요해요", variant: "destructive" });
        return;
      }

      const uploadId = nanoid(8);
      const uploadedPhotos: { storagePath: string; blurEnabled: boolean }[] = [];

      for (let i = 0; i < completeData.photos.length; i++) {
        const p = completeData.photos[i];
        const ext = p.file.type.split("/")[1];
        const storagePath = `${user.id}/${uploadId}/photo_${i}_original.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(storagePath, p.file, {
            contentType: p.file.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          toast({ title: "오류", description: "사진 업로드에 실패했어요", variant: "destructive" });
          return;
        }

        uploadedPhotos.push({ storagePath, blurEnabled: p.blurEnabled });
      }

      // 서버 액션에는 경로만 전달 (파일 없음)
      const { photos: _photos, ...profileData } = completeData;
      const result = await createSelfProfile(uploadedPhotos, profileData);

      if (result.error) {
        toast({
          title: "오류",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "성공",
        description: "프로필이 생성되었어요!",
        variant: "success",
      });

      router.push(`/create/self/complete?id=${result.profileId}`);
    } catch {
      toast({
        title: "오류",
        description: "프로필 생성에 실패했어요. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white pb-8">
        {/* Linear progress bar */}
        <div className="sticky top-14 z-30 bg-white">
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="mx-auto max-w-lg px-5 pb-2 pt-6">
            <div className="flex items-center justify-between">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-50"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
              )}
              <span className="text-sm text-gray-500">
                {currentStep} / {steps.length}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">{steps[currentStep - 1].title}</h2>
            <p className="mt-1 text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form steps */}
        <div className="mx-auto max-w-lg px-5 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <PhotoStep
                  defaultValues={formData}
                  onNext={handleStepComplete}
                />
              )}
              {currentStep === 2 && (
                <BasicInfoStep
                  defaultValues={formData}
                  onNext={handleStepComplete}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <PreferencesStep
                  defaultValues={formData}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
