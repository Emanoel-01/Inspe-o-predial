export interface UserProfile {
  fullName: string;
  professionalTitle: string;
  professionalId?: string;
  companyName?: string;
  position?: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyLogoBase64?: string;  // data URL da logo da empresa (JPEG comprimido)
}
