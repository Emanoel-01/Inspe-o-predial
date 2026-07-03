import { Component, ChangeDetectionStrategy, input, output, signal, ViewChild, ElementRef, inject } from '@angular/core';
import { GeminiService, registroValido, generateStandardFooter } from '../../services/gemini.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { Type } from '@google/genai';

const SCHEMA_DIAGNOSTICO = {
  type: Type.OBJECT,
  properties: {
    patologias:           { type: Type.ARRAY, items: { type: Type.STRING } },
    causas_provaveis:     { type: Type.ARRAY, items: { type: Type.STRING } },
    grau_risco:           { type: Type.STRING, enum: ['Crítico', 'Regular', 'Mínimo'] },
    classe_acao:          { type: Type.STRING, enum: ['Imediata', 'Necessária', 'Preventiva'] },
    ensaios_recomendados: { type: Type.ARRAY, items: { type: Type.STRING } },
    acoes_imediatas:      { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['patologias', 'grau_risco', 'classe_acao'],
};

interface ImageInfo {
  preview: string;
  base64: string;
  mimeType: string;
}

@Component({
  selector: 'app-image-diagnosis-modal',
  templateUrl: './image-diagnosis-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ImageDiagnosisModalComponent {
  isOpen = input.required<boolean>();
  closeModal = output<void>();

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement> | undefined;

  images = signal<ImageInfo[]>([]);
  diagnosisResult = signal<string | null>(null);
  isSuccess = signal(false);
  componentType = signal('');
  componentTypes = ['Viga', 'Pilar', 'Laje', 'Fachada', 'Telhado', 'Parede Interna', 'Piso', 'Fundação', 'Esquadria', 'Outro'];

  isCameraOpen = signal(false);
  cameraError = signal<string | null>(null);
  private stream: MediaStream | null = null;
  private toastService = inject(ToastService);

  constructor(public geminiService: GeminiService) {}

  onClose() {
    this.closeModal.emit();
    this.reset();
  }
  
  onFileSelected(event: Event): void {
    this.isSuccess.set(false);
    this.cameraError.set(null);
    this.isCameraOpen.set(false);
    
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      if (this.images().length + files.length > 3) {
        this.toastService.show('Você pode enviar no máximo 3 imagens.', 'error');
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          this.images.update(current => [
            ...current,
            {
              preview: result,
              base64: result.split(',')[1],
              mimeType: file.type
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(indexToRemove: number): void {
    this.images.update(current => current.filter((_, index) => index !== indexToRemove));
    this.isSuccess.set(false);
    this.diagnosisResult.set(null);
  }

  private renderLaudoHtml(d: any): string {
    if (!d || !d.grau_risco || !d.classe_acao) {
      throw new Error('Falha na classificação normativa do diagnóstico pela IA. Grau de Risco ou Classe de Ação ausente.');
    }
    const esc = (s: string) => (s ?? '').replace(/[&<>"']/g, (c: string) =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[c]);
    const li = (arr: string[] = []) => arr.map(x => `<li>${esc(x)}</li>`).join('');
    return `
      <h4>Identificação das Patologias</h4><ul>${li(d.patologias)}</ul>
      <h4>Causas Prováveis</h4><ul>${li(d.causas_provaveis)}</ul>
      <h4>Grau de Risco (NBR 16747)</h4><p><strong>${esc(d.grau_risco)}</strong></p>
      <h4>Classe de Ação / Prazo (NBR 5674)</h4><p><strong>${esc(d.classe_acao)}</strong></p>
      <h4>Ações Recomendadas</h4><ul>${li(d.acoes_imediatas)}</ul>`;
  }

  async runDiagnosis() {
    const currentImages = this.images();
    const compType = this.componentType();
    
    if (!compType) {
      this.toastService.show('Por favor, selecione o tipo de componente.', 'error');
      return;
    }
    
    if (currentImages.length > 0) {
      this.isSuccess.set(false);
      this.diagnosisResult.set(null);
      const prompt = `Analise as imagens a seguir de um(a) ${compType}. Identifique possíveis patologias, possíveis causas, o grau de risco (deve ser exatamente 'Mínimo', 'Regular' ou 'Crítico' conforme NBR 16747), a classe de ação (deve ser exatamente 'Imediata', 'Necessária' ou 'Preventiva' conforme NBR 5674), ensaios recomendados e ações imediatas.`;
      try {
        const textPart = { text: prompt };
        const imageParts = currentImages.map(img => ({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType,
          },
        }));
        const contents = { parts: [textPart, ...imageParts] };
        
        const data = await this.geminiService.generateStructured<any>(contents, SCHEMA_DIAGNOSTICO);
        const htmlResult = this.renderLaudoHtml(data);
        
        this.diagnosisResult.set(htmlResult);
        this.isSuccess.set(true);
        this.toastService.show('Diagnóstico gerado com sucesso!', 'success');
      } catch (err: any) {
        this.toastService.show(err.message || 'Erro ao gerar diagnóstico por imagem.', 'error');
      }
    }
  }

  reset(): void {
    this.closeCamera();
    this.images.set([]);
    this.diagnosisResult.set(null);
    this.cameraError.set(null);
    this.isSuccess.set(false);
    this.componentType.set('');
  }

  async openCamera() {
    this.closeCamera(); // Ensure any previous stream is closed
    this.isSuccess.set(false);
    this.diagnosisResult.set(null);
    this.cameraError.set(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError.set('A câmera não é suportada por este navegador.');
      return;
    }

    try {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch (e) {
        console.warn("Could not find environment camera, falling back to any available video device", e);
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      this.isCameraOpen.set(true);
      setTimeout(() => {
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
        }
      }, 0);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        this.cameraError.set('Permissão para acessar a câmera foi negada.');
      } else if (err instanceof Error && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')) {
        this.cameraError.set('Nenhum dispositivo de câmera foi encontrado neste aparelho.');
      } else {
        this.cameraError.set('Não foi possível acessar a câmera. Verifique se ela não está sendo usada por outro aplicativo.');
      }
    }
  }

  captureImage() {
    if (!this.videoElement || this.images().length >= 3) {
      if(this.images().length >= 3) {
        this.toastService.show('Limite de 3 imagens atingido.', 'info');
      }
      return;
    };

    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      this.images.update(current => [
        ...current,
        {
          preview: dataUrl,
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg'
        }
      ]);
    }

    this.closeCamera();
  }

  closeCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.isCameraOpen.set(false);
    this.stream = null;
  }

  generatePDF(): void {
    const saved = localStorage.getItem('user_profile');
    const profile = saved ? JSON.parse(saved) : null;
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }

    const diagnosis = this.diagnosisResult();
    const currentImages = this.images();
    if (!diagnosis || currentImages.length === 0) return;

    const imageElements = currentImages.map(img => 
      `<img src="${img.preview}" style="max-width: 30%; margin: 5px; border-radius: 8px; border: 1px solid #ddd;" />`
    ).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="utf-8">
          <title>Relatório de Diagnóstico por Imagem</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0c4a6e; padding-bottom: 20px; }
              .header h1 { color: #0c4a6e; margin: 0; }
              h2 { color: #0c4a6e; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
              .image-gallery { display: flex; flex-wrap: wrap; justify-content: center; background-color: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
              .prose { max-width: 100%; }
              .prose h4 { color: #0f766e; }
              .prose ul { padding-left: 20px; }
              .prose li { margin-bottom: 8px; }
              .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
              @media print { body { margin: 20px; } }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Relatório de Diagnóstico por Imagem</h1>
          </div>
          <h2>Informações da Análise</h2>
          <p><strong>Componente Analisado:</strong> ${this.componentType()}</p>
          <p><strong>Data da Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2>Imagens Analisadas</h2>
          <div class="image-gallery">${imageElements}</div>
          
          <h2>Resultado da Análise da IA</h2>
          <div class="prose">${diagnosis}</div>
          
          <div class="disclaimer">
              <p><strong>Aviso de Validação Técnica de IA:</strong> Este documento contém sugestões geradas por sistemas de inteligência artificial aplicadas à engenharia diagnóstica predial. Todas as avaliações, cronogramas e dados de manutenção devem ser obrigatoriamente submetidos ao crivo técnico, verificação presencial e responsabilidade de um profissional habilitado.</p>
          </div>
          
          ${generateStandardFooter(profile)}
      </body>
      </html>
    `;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      setTimeout(() => newWindow.print(), 500);
    }
  }
}
