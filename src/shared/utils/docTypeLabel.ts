const DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN",
  drivingLicense: "Driving License",
  passport: "Passport",
  voterId: "Voter ID",
  sslcMarksheet: "SSLC Marksheet",
  fssaiCertificate: "FSSAI Certificate",
  policeVerification: "Police Verification",
};

export const docTypeLabel = (type: string) => DOC_TYPE_LABELS[type] ?? type;
