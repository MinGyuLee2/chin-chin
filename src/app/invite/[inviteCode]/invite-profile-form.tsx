"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PhotoStep } from "@/components/profile/photo-step";
import { BasicInfoStep } from "@/components/profile/basic-info-step";
import { PreferencesStep } from "@/components/profile/preferences-step";
import { Button } from "@/components/ui/button";
import { submitInviteProfile } from "./actions";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import type { ProfileFormData } from "@/lib/validations/profile";

interface Props {
  inviteCode: string;
  matchmakerNickname: string;
  matchmakerMessage: string | null;
}

const steps = [
  { id: 1, title: "사진 업로드", description: "본인 사진을 올려주세요" },
  { id: 2, title: "기본 정보", description: "본인에 대해 알려주세요" },
  { id: 3, title: "취향 선택", description: "취향을 선택해주세요" },
];

export function InviteProfileForm({
  inviteCode,
  matchmakerNickname,
  matchmakerMessage,
}: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-3 = form steps
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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
      const result = await submitInviteProfile(inviteCode, completeData);

      if (result.error) {
        toast({
          title: "오류",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setIsCompleted(true);
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

  // Completed state
  if (isCompleted) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-light to-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <Check className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <h1 className="mb-2 text-2xl font-bold">프로필 작성 완료!</h1>
            <p className="mb-4 text-muted-foreground">
              {matchmakerNickname}님이 프로필을 공유하면 매칭이 시작돼요.
            </p>
            <p className="text-sm text-muted-foreground">
              알림으로 진행 상황을 알려드릴게요.
            </p>
          </motion.div>
        </main>
      </>
    );
  }

  // Intro state (step 0)
  if (currentStep === 0) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg text-center"
          >
            <h1 className="mb-2 text-2xl font-bold">
              {matchmakerNickname}님이
              <br />
              당신을 소개하고 싶어해요!
            </h1>

            {matchmakerMessage && (
              <div className="mx-auto mb-6 mt-4 max-w-sm rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-700">&ldquo;{matchmakerMessage}&rdquo;</p>
              </div>
            )}

            <p className="mb-8 text-muted-foreground">
              프로필을 작성하면 {matchmakerNickname}님이 인스타에 공유해줄 거예요.
              <br />
              블라인드 처리되니 안심하세요!
            </p>

            {authLoading ? (
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : user ? (
              <Button size="lg" onClick={() => setCurrentStep(1)}>
                프로필 작성하기
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => {
                  window.location.href = `/login?redirect=/invite/${inviteCode}`;
                }}
              >
                카카오로 로그인하고 시작하기
              </Button>
            )}
          </motion.div>
        </main>
      </>
    );
  }

  // Form steps (1-3)
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
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              {steps[currentStep - 1].title}
            </h2>
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
