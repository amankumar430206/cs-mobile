export interface DocumentTypeOption {
  value: string;
  label: string;
}

// Same lists and labels as cs-web's KYC panels (cs-api kyc.validators.js DOCUMENT_TYPES_BY_ROLE).
export const ADVERTISER_DOCUMENT_TYPES: DocumentTypeOption[] = [
  { value: "BUSINESS_REGISTRATION_CERTIFICATE", label: "Business registration certificate" },
  { value: "GST_CERTIFICATE", label: "GST certificate" },
  { value: "CIN_CERTIFICATE", label: "CIN certificate" },
  { value: "BRAND_LOGO", label: "Brand logo" },
  { value: "AUTHORIZATION_LETTER", label: "Authorization letter" },
];

export const SCREEN_PARTNER_DOCUMENT_TYPES: DocumentTypeOption[] = [
  { value: "SELF_PHOTOGRAPH", label: "Self photograph" },
  { value: "ADDRESS_PROOF", label: "Address proof" },
  { value: "CANCELLED_CHEQUE", label: "Cancelled cheque" },
  { value: "BANK_PASSBOOK", label: "Bank passbook" },
  { value: "GST_CERTIFICATE", label: "GST certificate" },
  { value: "UDYAM_CERTIFICATE", label: "UDYAM certificate" },
  { value: "SHOP_LICENSE", label: "Shop license" },
  { value: "PLAYER_INSTALLATION_SCREENSHOT", label: "CASTADI Player installation screenshot" },
];
