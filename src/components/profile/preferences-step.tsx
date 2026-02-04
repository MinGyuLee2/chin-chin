"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "@/components/common/tag";
import { INTEREST_TAGS, MBTI_TYPES, MUSIC_GENRES } from "@/lib/constants";
import {
  preferencesSchema,
  type PreferencesFormData,
  type ProfileFormData,
} from "@/lib/validations/profile";

interface PreferencesStepProps {
  defaultValues?: Partial<ProfileFormData>;
  onSubmit: (data: PreferencesFormData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function PreferencesStep({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
}: PreferencesStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      interestTags: defaultValues?.interestTags || [],
      mbti: defaultValues?.mbti,
      musicGenre: defaultValues?.musicGenre,
      instagramId: defaultValues?.instagramId,
    },
  });

  const selectedTags = watch("interestTags") || [];

  const toggleTag = (tag: string) => {
    const current = selectedTags;
    const isSelected = current.includes(tag);

    if (isSelected) {
      setValue(
        "interestTags",
        current.filter((t) => t !== tag),
        { shouldValidate: true }
      );
    } else if (current.length < 3) {
      setValue("interestTags", [...current, tag], { shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: PreferencesFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Interest Tags */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>취향 키워드</Label>
              <span
                className={`text-xs ${
                  selectedTags.length !== 3
                    ? "text-muted-foreground"
                    : "text-primary font-medium"
                }`}
              >
                {selectedTags.length}/3 선택
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const isDisabled = !isSelected && selectedTags.length >= 3;

                return (
                  <Tag
                    key={tag}
                    variant={isSelected ? "primary" : "muted"}
                    onClick={() => !isDisabled && toggleTag(tag)}
                    selected={isSelected}
                    className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {tag}
                  </Tag>
                );
              })}
            </div>
            {errors.interestTags && (
              <p className="text-sm text-destructive">
                {errors.interestTags.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional fields */}
      <Card>
        <CardContent className="space-y-5 p-4">
          <p className="text-sm text-muted-foreground">
            선택 사항 (입력하면 매칭 확률이 높아져요)
          </p>

          {/* MBTI */}
          <div className="space-y-2">
            <Label htmlFor="mbti">MBTI</Label>
            <Select
              onValueChange={(value) => setValue("mbti", value)}
              defaultValue={defaultValues?.mbti}
            >
              <SelectTrigger>
                <SelectValue placeholder="MBTI를 선택해주세요 (선택)" />
              </SelectTrigger>
              <SelectContent>
                {MBTI_TYPES.map((mbti) => (
                  <SelectItem key={mbti} value={mbti}>
                    {mbti}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Music Genre */}
          <div className="space-y-2">
            <Label htmlFor="musicGenre">좋아하는 음악</Label>
            <Select
              onValueChange={(value) => setValue("musicGenre", value)}
              defaultValue={defaultValues?.musicGenre}
            >
              <SelectTrigger>
                <SelectValue placeholder="음악 장르를 선택해주세요 (선택)" />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instagram ID */}
          <div className="space-y-2">
            <Label htmlFor="instagramId">인스타그램 ID</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="instagramId"
                placeholder="instagram_id"
                className="pl-8"
                error={!!errors.instagramId}
                {...register("instagramId")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              프로필 공개 시 상대방에게 보여져요
            </p>
            {errors.instagramId && (
              <p className="text-sm text-destructive">
                {errors.instagramId.message}
              </p>
            )}
          </div>

        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          이전
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          <Sparkles className="mr-2 h-5 w-5" />
          링크 생성하기
        </Button>
      </div>
    </form>
  );
}
