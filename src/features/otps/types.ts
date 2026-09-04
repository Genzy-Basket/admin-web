export type OtpPurpose = "login" | "register" | "change-phone";

export interface PartnerOtp {
  phone: string;
  otp: string | null;
  purpose: OtpPurpose;
  attempts: number;
  sentAt: string;
  expiresAt: string;
  expiresInSeconds: number;
  partner: { id: string; name: string } | null;
}

export interface PartnerOtpList {
  items: PartnerOtp[];
  total: number;
}
