export type CategoriaProfissional = 'arquiteto' | 'engenheiro' | 'tecnico';

export interface UserProfile {
  fullName: string;
  professionalTitle: string;
  professionalId?: string;
  companyName?: string;
  position?: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyLogoBase64?: string;  // data URL da logo da empresa (JPEG comprimido)
  companyPhone?: string;        // NOVO — telefone institucional (com ou sem WhatsApp, texto livre)
  companyEmail?: string;        // NOVO — e-mail institucional
  companySite?: string;         // NOVO — site (aceitar com ou sem https:// — normalizar no uso, não aqui)
  socialNetworkLabel?: string;  // NOVO — rótulo da rede social, ex.: "Instagram" ou "@amorimtech"
  socialNetworkUrl?: string;    // NOVO — URL completa da rede social
  categoriaProfissional?: CategoriaProfissional;  // NOVO — define a base legal usada na Seção 2.0 do laudo
}
