import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Part, Type } from '@google/genai';
import { environment } from '../environments/environment';

export interface UserProfile {
  fullName: string;
  professionalTitle: string;
  professionalId?: string;
  companyName?: string;
  position?: string;
  companyCnpj?: string;
  companyAddress?: string;
}

export const RE_CAU = /^A\d{6}-\d$/i;
export const RE_CREA = /^CREA-[A-Z]{2}\s?\d{4,7}(\/[A-Z])?$/i;

export function registroValido(reg: string): boolean {
  const r = (reg ?? '').trim();
  return RE_CAU.test(r) || RE_CREA.test(r);
}

export function generateStandardFooter(profile: UserProfile | null): string {
  if (!profile) return '';
  const parts = [
    `Emitido por: ${profile.fullName || 'Não informado'}`,
    profile.professionalTitle || 'Profissional',
    profile.professionalId ? `Reg: ${profile.professionalId}` : 'Reg: Não informado',
    profile.companyName ? profile.companyName : '',
    profile.companyAddress ? profile.companyAddress : ''
  ].filter(Boolean);
  
  return `
    <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 0.8em; color: #475569; text-align: center; line-height: 1.4;">
      <p style="font-weight: bold; margin-bottom: 4px;">Documento provisório. Adquire validade técnica mediante assinatura do responsável técnico.</p>
      <p>${parts.join(' — ')}</p>
    </div>
  `;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  public loading = signal(false);

  constructor() {
    // IMPORTANT: In a real application, the API key should be handled securely
    // and not hardcoded. Using process.env is the required way for this environment.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error('API_KEY environment variable not set.');
      throw new Error('API_KEY environment variable not set.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string): Promise<string> {
    this.loading.set(true);
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async generateTextWithImages(prompt: string, images: { base64: string, mimeType: string }[]): Promise<string> {
    this.loading.set(true);
    try {
      const imageParts: Part[] = images.map(image => ({
        inlineData: {
          data: image.base64,
          mimeType: image.mimeType,
        },
      }));

      const textPart: Part = {
        text: prompt
      };
      
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, ...imageParts] },
      });

      return response.text;
    } catch (error) {
      console.error('Error generating content with image:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async generateStructured<T>(contents: any, responseSchema: object): Promise<T> {
    this.loading.set(true);
    try {
      const res = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { responseMimeType: 'application/json', responseSchema },
      });
      const txt = (res.text ?? '').trim();
      try {
        return JSON.parse(txt) as T;
      } catch {
        throw new Error('Resposta do modelo não é JSON válido: ' + txt.slice(0, 200));
      }
    } catch (error) {
      console.error('Error generating structured content:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  sanitizeAiText(raw: string): string {
    return (raw ?? '')
      .replace(/```html\n?/gi, '')   // remove cerca de abertura
      .replace(/```\n?/gi, '')        // remove cerca de fechamento
      .trim();
  }

  escapeHtml(s: string): string {
    return (s ?? '').replace(/[&<>"']/g, (c: string) =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[c]);
  }
}
