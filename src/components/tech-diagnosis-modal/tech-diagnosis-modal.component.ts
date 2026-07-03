import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService, registroValido, generateStandardFooter } from '../../services/gemini.service';
import { UserProfile } from '../../models/user-profile.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tech-diagnosis-modal',
  templateUrl: './tech-diagnosis-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class TechDiagnosisModalComponent {
  isOpen = input.required<boolean>();
  closeModal = output<void>();
  userProfile = input<UserProfile | null>(null);

  symptomDescription = signal('');
  diagnosticSuggestions = signal('');
  correctionPlan = signal('');
  loadingSuggestions = signal(false);
  loadingCorrection = signal(false);
  suggestionsSuccess = signal(false);
  correctionSuccess = signal(false);
  
  private geminiService = inject(GeminiService);
  private toastService = inject(ToastService);

  onClose(): void {
    this.resetModal();
    this.closeModal.emit();
  }

  resetModal() {
    this.symptomDescription.set('');
    this.diagnosticSuggestions.set('');
    this.correctionPlan.set('');
    this.loadingSuggestions.set(false);
    this.loadingCorrection.set(false);
    this.suggestionsSuccess.set(false);
    this.correctionSuccess.set(false);
  }

  onSymptomChange(value: string) {
    this.symptomDescription.set(value);
    this.diagnosticSuggestions.set('');
    this.correctionPlan.set('');
    this.suggestionsSuccess.set(false);
    this.correctionSuccess.set(false);
  }

  async getDiagnosticSuggestions() {
    if (!this.symptomDescription().trim()) {
      this.toastService.show('Por favor, descreva os sintomas observados.', 'error');
      return;
    }
    
    this.loadingSuggestions.set(true);
    this.diagnosticSuggestions.set('');
    this.correctionPlan.set('');
    this.suggestionsSuccess.set(false);
    this.correctionSuccess.set(false);

    const prompt = `Como um engenheiro especialista em patologias prediais, analise os seguintes sintomas:

"${this.symptomDescription()}"

Forneça uma análise técnica com:

1. HIPÓTESES DE PATOLOGIAS:
Liste as 2-3 patologias mais prováveis que podem causar esses sintomas.

2. PLANO DE DIAGNÓSTICO:
Para cada hipótese, explique como confirmar ou descartar a patologia usando tecnologias modernas (termografia, drone, endoscopia, etc.).

Seja claro e objetivo e formate a resposta em HTML.`;

    try {
      const response = await this.geminiService.generateText(prompt);
      if (response) {
        const sanitized = this.geminiService.sanitizeAiText(response);
        this.diagnosticSuggestions.set(this.formatResponseToHtml(sanitized));
        this.suggestionsSuccess.set(true);
        this.toastService.show('Análise de diagnóstico gerada com sucesso.', 'success');
      } else {
        this.toastService.show('Resposta inválida da IA. Tente novamente.', 'error');
      }
    } catch (err: any) {
      console.error("Erro ao obter sugestões:", err);
      this.toastService.show(err.message || 'Erro ao processar análise. Verifique sua conexão e tente novamente.', 'error');
    } finally {
      this.loadingSuggestions.set(false);
    }
  }

  async getCorrectionPlan() {
    if (!this.diagnosticSuggestions()) {
      this.toastService.show('É necessário primeiro gerar a análise de diagnóstico.', 'error');
      return;
    }

    this.loadingCorrection.set(true);
    this.correctionPlan.set('');
    this.correctionSuccess.set(false);

    const prompt = `Com base nos sintomas "${this.symptomDescription()}" e na análise anterior, elabore um PLANO DE CORREÇÃO detalhado:

1. ETAPAS DE REPARO: Guia passo a passo
2. MATERIAIS E EQUIPAMENTOS: Lista dos insumos necessários
3. MÃO DE OBRA: Tipo de profissional necessário
4. SEGURANÇA: Cuidados e EPIs necessários

Seja prático e objetivo e formate a resposta em HTML.`;

    try {
      const response = await this.geminiService.generateText(prompt);
      if (response) {
        const sanitized = this.geminiService.sanitizeAiText(response);
        this.correctionPlan.set(this.formatResponseToHtml(sanitized));
        this.correctionSuccess.set(true);
        this.toastService.show('Plano de correção gerado com sucesso.', 'success');
      } else {
        this.toastService.show('Resposta inválida da IA. Tente novamente.', 'error');
      }
    } catch (err: any) {
      console.error("Erro ao obter plano de correção:", err);
      this.toastService.show(err.message || 'Erro ao gerar plano de correção. Tente novamente.', 'error');
    } finally {
      this.loadingCorrection.set(false);
    }
  }
  
  private formatResponseToHtml(text: string | null): string {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^### (.*$)/gim, '<h3 style="color: #0f766e; margin: 1em 0 0.5em 0;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="color: #0c4a6e; margin: 1.5em 0 0.75em 0; border-bottom: 1px solid #ccc; padding-bottom: 4px;">$1</h2>')
        .replace(/^\* (.*$)/gim, '• $1')
        .replace(/\n/g, '<br>');
  }

  generatePDF() {
    const profile = this.userProfile();
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="utf-8">
          <title>Relatório de Diagnóstico e Correção</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0c4a6e; padding-bottom: 20px; }
              .header h1 { color: #0c4a6e; margin: 0; font-size: 2em; }
              h2 { color: #0c4a6e; margin-top: 30px; border-bottom: 2px solid #0c4a6e; padding-bottom: 10px; }
              .content-section { background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 40px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
          </style>
      </head>
      <body>
          <div class="header">
            <h1>Relatório de Diagnóstico e Correção</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="content-section">
            <h2>1. Sintomas Descritos</h2>
            <p>${this.symptomDescription()}</p>
          </div>
          
          <div class="content-section">
            <h2>2. Análise e Plano de Diagnóstico</h2>
            ${this.diagnosticSuggestions()}
          </div>

          ${this.correctionPlan() ? `
          <div class="content-section">
            <h2>3. Plano de Correção Sugerido</h2>
            ${this.correctionPlan()}
          </div>
          ` : ''}
          
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
