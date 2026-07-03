import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { UserProfile } from '../../models/user-profile.model';
import { GeminiService, registroValido, generateStandardFooter } from '../../services/gemini.service';
import { ToastService } from '../../services/toast.service';

interface FormData {
  buildingName: string;
  address: string;
}

@Component({
  selector: 'app-maintenance-schedule-modal',
  templateUrl: './maintenance-schedule-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class MaintenanceScheduleModalComponent {
  isOpen = input.required<boolean>();
  userProfile = input<UserProfile | null>(null);
  closeModal = output<void>();

  private dataService = inject(DataService);
  private geminiService = inject(GeminiService);
  private toastService = inject(ToastService);

  formData = signal<FormData>({
    buildingName: '',
    address: '',
  });

  selectedSystems = signal<{ [systemId: string]: { [typologyId: string]: boolean } }>({});
  scheduleResult = signal('');
  loading = signal(false);
  isSuccess = signal(false);

  systemOptions = computed(() => {
    const data = this.dataService.getData();
    return Object.entries(data).map(([categoryKey, categoryValue]: [string, any]) => ({
      id: categoryKey,
      label: categoryValue.title,
      systems: Object.entries(categoryValue.systems).map(([sysKey, sysValue]: [string, any]) => ({
        id: sysKey,
        label: sysValue.title,
        typologies: sysValue.tipologias.map((t: any) => ({ id: t.title, label: t.title })),
        categoryKey: categoryKey
      }))
    }));
  });

  isFormValid = computed(() => {
    const form = this.formData();
    return form.buildingName && form.address && Object.keys(this.selectedSystems()).length > 0;
  });

  onClose(): void {
    this.resetModal();
    this.closeModal.emit();
  }

  resetModal() {
    this.formData.set({
      buildingName: '',
      address: '',
    });
    this.selectedSystems.set({});
    this.scheduleResult.set('');
    this.loading.set(false);
    this.isSuccess.set(false);
  }

  updateFormData(field: keyof FormData, value: string) {
    this.isSuccess.set(false);
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  handleSystemChange(systemId: string, typologyId: string, isChecked: boolean) {
    this.isSuccess.set(false);
    this.selectedSystems.update(currentSelection => {
      const newSelection = { ...currentSelection };
      const systemSelections = { ...(newSelection[systemId] || {}) };

      if (isChecked) {
        systemSelections[typologyId] = true;
      } else {
        delete systemSelections[typologyId];
      }

      if (Object.keys(systemSelections).length === 0) {
        delete newSelection[systemId];
      } else {
        newSelection[systemId] = systemSelections;
      }

      return newSelection;
    });
  }

  async generateMaintenanceSchedule() {
    if (!this.isFormValid()) {
      this.toastService.show('Por favor, preencha todos os dados do edifício e selecione ao menos uma tipologia.', 'error');
      return;
    }
    this.loading.set(true);
    this.isSuccess.set(false);
    this.scheduleResult.set('');

    const allSystems = this.systemOptions().flatMap(cat => cat.systems);
    const selectionSummary = Object.entries(this.selectedSystems()).map(([sysKey, typologies]) => {
      const systemData = allSystems.find(s => s.id === sysKey);
      const selectedTypologies = Object.keys(typologies);
      return `- Sistema de ${systemData?.label}: ${selectedTypologies.join(', ')}`;
    }).join('\n');

    const prompt = `Como um engenheiro de manutenção predial sênior, crie um cronograma de manutenção detalhado em formato de tabela HTML.

**DADOS DO EDIFÍCIO:**
- **Nome:** ${this.formData().buildingName}
- **Endereço:** ${this.formData().address}

**SISTEMAS E TIPOLOGIAS SELECIONADOS PARA O PLANO:**
${selectionSummary}

**INSTRUÇÕES PARA O CRONOGRAMA:**
1.  **Formato:** Gere a resposta como um documento HTML. Para cada sistema/tipologia, crie um título \`<h3>\` e uma tabela \`<table>\`.
2.  **Tabela:** A tabela deve ter as seguintes colunas: 'Tipo', 'Atividade', 'Periodicidade', 'Recomendações', e 'Tecnologias/Diagnósticos'.
3.  **Conteúdo:** As atividades devem ser baseadas nas melhores práticas de engenharia de manutenção e normas técnicas aplicáveis para os sistemas e tipologias selecionados. Seja completo e específico.
4.  **Estilo:** Use um estilo limpo para o HTML, sem CSS inline, apenas a estrutura de títulos e tabelas.

O resultado deve ser apenas o código HTML, sem markdown ou texto adicional.`;
    
    try {
        const response = await this.geminiService.generateText(prompt);
        this.scheduleResult.set(this.geminiService.sanitizeAiText(response));
        this.isSuccess.set(true);
        this.toastService.show('Cronograma gerado com sucesso!', 'success');
    } catch (err: any) {
        console.error("Erro ao gerar cronograma:", err);
        this.toastService.show(err.message || 'Ocorreu um erro ao gerar o cronograma. Tente novamente.', 'error');
    } finally {
        this.loading.set(false);
    }
  }
  
  generatePDF() {
    const profile = this.userProfile();
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }
    if (!this.scheduleResult()) return;
    const form = this.formData();
    
    const companyInfo = profile.companyName ? `
      <tr>
        <td style="font-weight: bold; background-color: #f8fafc; width: 30%; padding: 10px 15px; color: #475569; border: 1px solid #ddd;">Empresa:</td>
        <td style="padding: 10px 15px; color: #334155; border: 1px solid #ddd;">&nbsp;${profile.companyName}</td>
      </tr>
      ${profile.position ? `
      <tr>
        <td style="font-weight: bold; background-color: #f8fafc; width: 30%; padding: 10px 15px; color: #475569; border: 1px solid #ddd;">Cargo:</td>
        <td style="padding: 10px 15px; color: #334155; border: 1px solid #ddd;">&nbsp;${profile.position}</td>
      </tr>` : ''}
      ${profile.companyCnpj ? `
      <tr>
        <td style="font-weight: bold; background-color: #f8fafc; width: 30%; padding: 10px 15px; color: #475569; border: 1px solid #ddd;">CNPJ:</td>
        <td style="padding: 10px 15px; color: #334155; border: 1px solid #ddd;">&nbsp;${profile.companyCnpj}</td>
      </tr>` : ''}
      ${profile.companyAddress ? `
      <tr>
        <td style="font-weight: bold; background-color: #f8fafc; width: 30%; padding: 10px 15px; color: #475569; border: 1px solid #ddd;">Endereço da Empresa:</td>
        <td style="padding: 10px 15px; color: #334155; border: 1px solid #ddd;">&nbsp;${profile.companyAddress}</td>
      </tr>` : ''}
    ` : '';


    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="utf-8">
          <title>Cronograma de Manutenção - ${form.buildingName}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0c4a6e; padding-bottom: 20px; }
              .header h1 { color: #0c4a6e; margin: 0 0 10px 0; font-size: 2em; letter-spacing: 0.05em; font-weight: bold; }
              .header p { color: #555; margin: 5px 0; font-size: 11pt; }
              .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .info-table td { border: 1px solid #ddd; padding: 10px 12px; }
              .info-table td:first-child { font-weight: bold; background-color: #f8fafc; width: 30%; color: #475569; }
              h2 { color: #0c4a6e; margin-top: 30px; border-bottom: 2px solid #0c4a6e; padding-bottom: 10px; font-weight: bold; }
              h3 { color: #0f766e; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; font-size: 0.9em; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #0c4a6e; color: white; font-weight: bold; }
              tbody tr:nth-child(even) { background-color: #f8fafc; }
              .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 40px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
              @media print { body { margin: 20px; } }
          </style>
      </head>
      <body>
          <div class="header">
            <h1>Cronograma de Manutenção Predial</h1>
            <p>Planejamento Personalizado de Manutenção</p>
          </div>
          <h2>Informações do Edifício</h2>
          <table class="info-table">
            <tr><td>Edifício:</td><td style="font-weight: 600; color: #0f172a;">&nbsp;${form.buildingName}</td></tr>
            <tr><td>Endereço:</td><td>&nbsp;${form.address}</td></tr>
            <tr><td>Responsável Técnico:</td><td>&nbsp;${profile.fullName}</td></tr>
            <tr><td>Título Profissional:</td><td>&nbsp;${profile.professionalTitle}</td></tr>
            <tr><td>Registro Profissional:</td><td>&nbsp;${profile.professionalId ?? ''}</td></tr>
            ${companyInfo}
            <tr><td>Data da Emissão:</td><td>&nbsp;${new Date().toLocaleDateString('pt-BR')}</td></tr>
          </table>
          <div id="schedule-content">${this.scheduleResult()}</div>
          
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
