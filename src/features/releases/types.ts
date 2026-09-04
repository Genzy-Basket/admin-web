export type AppKind = "partner" | "user";
export type AppPlatform = "android" | "ios";

export interface AppRelease {
  id: string;
  app: AppKind;
  platform: AppPlatform;
  versionCode: number;
  versionName: string;
  fileSizeBytes: number;
  sha256: string;
  releaseNotes: string | null;
  minSupported: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
