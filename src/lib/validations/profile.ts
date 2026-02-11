import { z } from "zod";
import {
  INTEREST_TAGS,
  OCCUPATION_CATEGORIES,
  MBTI_TYPES,
  MUSIC_GENRES,
} from "@/lib/constants";

export const MAX_PHOTOS = 5;

const singlePhotoSchema = z.object({
  file: z
    .instanceof(File, { message: "사진을 업로드해주세요" })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "10MB 이하의 사진만 업로드 가능해요",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "JPG, PNG, WebP 형식만 가능해요" }
    ),
  blurEnabled: z.boolean(),
});

// Step 1: Photo upload (다중 사진)
export const photoSchema = z.object({
  photos: z
    .array(singlePhotoSchema)
    .min(1, "사진을 최소 1장 업로드해주세요")
    .max(MAX_PHOTOS, `사진은 최대 ${MAX_PHOTOS}장까지 업로드 가능해요`),
});

// Step 2: Basic info
export const basicInfoSchema = z.object({
  age: z
    .number({ required_error: "나이를 입력해주세요" })
    .min(18, "18세 이상만 이용 가능해요")
    .max(99, "올바른 나이를 입력해주세요"),
  gender: z.enum(["male", "female"], {
    required_error: "성별을 선택해주세요",
  }),
  occupationCategory: z
    .string({ required_error: "직업을 선택해주세요" })
    .refine((val) => OCCUPATION_CATEGORIES.includes(val as any), {
      message: "올바른 직업을 선택해주세요",
    }),
  bio: z
    .string({ required_error: "한 줄 소개를 입력해주세요" })
    .min(10, "10자 이상 입력해주세요")
    .max(50, "50자 이하로 입력해주세요"),
});

// Step 3: Preferences
export const preferencesSchema = z.object({
  interestTags: z
    .array(z.string())
    .length(3, "취향 키워드를 정확히 3개 선택해주세요")
    .refine(
      (tags) => tags.every((tag) => INTEREST_TAGS.includes(tag as any)),
      { message: "올바른 키워드를 선택해주세요" }
    ),
  mbti: z
    .string()
    .optional()
    .refine((val) => !val || MBTI_TYPES.includes(val as any), {
      message: "올바른 MBTI를 선택해주세요",
    }),
  musicGenre: z
    .string()
    .optional()
    .refine((val) => !val || MUSIC_GENRES.includes(val as any), {
      message: "올바른 장르를 선택해주세요",
    }),
  instagramId: z
    .string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9_.]{1,30}$/.test(val), {
      message: "올바른 인스타그램 아이디를 입력해주세요",
    }),
});

// Combined schema for full profile
export const profileSchema = z.object({
  ...photoSchema.shape,
  ...basicInfoSchema.shape,
  ...preferencesSchema.shape,
});

export type PhotoItem = z.infer<typeof singlePhotoSchema>;
export type PhotoFormData = z.infer<typeof photoSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

// Server-side validation (File은 FormData에서 직접 검증)
export const serverProfileDataSchema = basicInfoSchema.merge(preferencesSchema);
export type ServerProfileData = z.infer<typeof serverProfileDataSchema>;
