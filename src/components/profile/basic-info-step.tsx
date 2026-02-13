"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { OCCUPATION_CATEGORIES } from "@/lib/constants";
import {
  basicInfoSchema,
  type BasicInfoFormData,
  type ProfileFormData,
} from "@/lib/validations/profile";

interface BasicInfoStepProps {
  defaultValues?: Partial<ProfileFormData>;
  onNext: (data: BasicInfoFormData) => void;
  onBack: () => void;
}

export function BasicInfoStep({
  defaultValues,
  onNext,
  onBack,
}: BasicInfoStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      age: defaultValues?.age,
      gender: defaultValues?.gender,
      occupationCategory: defaultValues?.occupationCategory,
      bio: defaultValues?.bio,
    },
  });

  const selectedGender = useWatch({ control, name: "gender" });
  const bioLength = useWatch({ control, name: "bio" })?.length || 0;

  const onSubmit = (data: BasicInfoFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-4">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">나이</Label>
            <Input
              id="age"
              type="number"
              placeholder="26"
              min={18}
              max={99}
              error={!!errors.age}
              {...register("age", { valueAsNumber: true })}
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>성별</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("gender", "male", { shouldValidate: true })}
                className={`flex h-12 items-center justify-center rounded-xl border-2 font-medium transition-all ${
                  selectedGender === "male"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-input hover:border-primary/50"
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setValue("gender", "female", { shouldValidate: true })}
                className={`flex h-12 items-center justify-center rounded-xl border-2 font-medium transition-all ${
                  selectedGender === "female"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-input hover:border-primary/50"
                }`}
              >
                여성
              </button>
            </div>
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender.message}</p>
            )}
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation">직업</Label>
            <Select
              onValueChange={(value) =>
                setValue("occupationCategory", value, { shouldValidate: true })
              }
              defaultValue={defaultValues?.occupationCategory}
            >
              <SelectTrigger error={!!errors.occupationCategory}>
                <SelectValue placeholder="직업을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {OCCUPATION_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.occupationCategory && (
              <p className="text-sm text-destructive">
                {errors.occupationCategory.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">한 줄 소개</Label>
              <span
                className={`text-xs ${
                  bioLength > 50 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {bioLength}/50
              </span>
            </div>
            <Textarea
              id="bio"
              placeholder="친구의 매력을 한 줄로 소개해주세요"
              maxLength={50}
              error={!!errors.bio}
              className="min-h-[80px]"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          이전
        </Button>
        <Button type="submit" fullWidth>
          다음
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
