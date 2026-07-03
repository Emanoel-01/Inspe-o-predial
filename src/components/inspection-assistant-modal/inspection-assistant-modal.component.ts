import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { GeminiService, registroValido, generateStandardFooter } from '../../services/gemini.service';
import { UserProfile } from '../../models/user-profile.model';
import { ToastService } from '../../services/toast.service';

interface FormData {
  buildingName: string;
  address: string;
}

@Component({
  selector: 'app-inspection-assistant-modal',
  templateUrl: './inspection-assistant-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class InspectionAssistantModalComponent {
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
  checklistResult = signal('');
  loading = signal(false);
  isSuccess = signal(false);

  systemOptions = computed(() => {
    const data = this.dataService.getData();
    return Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        label: value.title,
        systems: Object.entries(value.systems).map(([sysKey, sysValue]: [string, any]) => ({
            id: sysKey,
            label: sysValue.title,
            typologies: sysValue.tipologias.map((t: any) => ({ id: t.title, label: t.title }))
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
  
  updateFormData(field: keyof FormData, value: string) {
    this.isSuccess.set(false);
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  resetModal() {
    this.formData.set({
      buildingName: '',
      address: '',
    });
    this.selectedSystems.set({});
    this.checklistResult.set('');
    this.loading.set(false);
    this.isSuccess.set(false);
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

  async generateChecklist() {
    const profile = this.userProfile();
    if (!this.isFormValid() || !profile) {
      this.toastService.show('Por favor, preencha todos os dados do edifício, do profissional e selecione ao menos uma tipologia.', 'error');
      return;
    }
    
    this.loading.set(true);
    this.isSuccess.set(false);
    this.checklistResult.set('');

    const selectionSummary = Object.entries(this.selectedSystems()).map(([sysKey, typologies]) => {
        const systemData = this.systemOptions().flatMap(cat => cat.systems).find(s => s.id === sysKey);
        const selectedTypologies = Object.keys(typologies);
        return `- Sistema de ${systemData?.label}: ${selectedTypologies.join(', ')}`;
    }).join('\n');

    const form = this.formData();
    const prompt = `Como um engenheiro especialista em inspeção predial, crie um checklist de vistoria em formato de tabela HTML para um relatório técnico.

**DADOS DA INSPEÇÃO:**
- **Edifício:** ${form.buildingName}
- **Endereço:** ${form.address}
- **Responsável Técnico:** ${profile.fullName} (${profile.professionalTitle} - ${profile.professionalId || 'N/A'})

**SISTEMAS E TIPOLOGIAS PARA INSPEÇÃO:**
${selectionSummary}

**INSTRUÇÕES PARA O CHECKLIST:**
1.  **Formato de Saída:** A resposta deve ser exclusivamente o código HTML de uma única tabela (\`<table>\`), sem tags \`<html>\`, \`<body>\`, markdown ou qualquer texto fora da tabela.
2.  **Cabeçalho da Tabela:** Use \`<thead>\` para as colunas: 'Item a Verificar', 'Status (OK / NC / NA)', e 'Observações'.
3.  **Títulos de Seção:** Para cada sistema principal (ex: "Sistemas Estruturais"), crie uma linha de cabeçalho mesclada no corpo da tabela (\`<tr><th colspan="3">\`...\`</th></tr>\`) para servir como um título de seção.
4.  **Conteúdo das Linhas:**
    *   Os itens de verificação devem ser práticos e focados em patologias comuns para cada tipologia.
    *   A coluna 'Status' deve conter caixas para preenchimento manual, como por exemplo: \`[  ] OK [  ] NC [  ] NA\`.
    *   A coluna 'Observações' deve ser deixada em branco.

O resultado deve ser um código HTML limpo e bem estruturado.`;

    try {
      const response = await this.geminiService.generateText(prompt);
      if (response) {
        this.checklistResult.set(this.geminiService.sanitizeAiText(response));
        this.isSuccess.set(true);
        this.toastService.show('Checklist gerado com sucesso!', 'success');
      } else {
        this.toastService.show('Resposta inválida da IA. Tente novamente.', 'error');
      }
    } catch (err: any) {
      console.error("Erro ao gerar checklist:", err);
      this.toastService.show(err.message || 'Erro ao gerar checklist. Verifique sua conexão e tente novamente.', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  generatePDF(): void {
    const checklist = this.checklistResult();
    const profile = this.userProfile();
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }
    if (!checklist) return;

    const form = this.formData();
    const checklistTableHtml = checklist.replace(/<table/g, '<table class="checklist-table"');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="utf-8">
          <title>Relatório de Vistoria - ${form.buildingName}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; font-size: 10pt; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0c4a6e; padding-bottom: 20px; }
              .header h1 { color: #0c4a6e; margin: 0 0 10px 0; font-size: 2em; letter-spacing: 0.05em; font-weight: bold; }
              .header p { color: #555; margin: 5px 0; font-size: 11pt; }
              .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .info-table td { border: 1px solid #ddd; padding: 10px 12px; }
              .info-table td:first-child { font-weight: bold; background-color: #f8fafc; width: 30%; color: #475569; }
              h2 { color: #0c4a6e; margin-top: 30px; border-bottom: 2px solid #0c4a6e; padding-bottom: 10px; font-weight: bold; }
              .checklist-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em; page-break-inside: auto; }
              .checklist-table tr { page-break-inside: avoid; page-break-after: auto; }
              .checklist-table thead { display: table-header-group; }
              .checklist-table th, .checklist-table td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
              .checklist-table thead th { background-color: #0c4a6e; color: white; font-weight: bold; }
              .checklist-table tbody th[colspan="3"] { background-color: #e2e8f0; color: #1e293b; text-align: left; font-size: 1.1em; }
              .checklist-table tbody tr:nth-child(even) { background-color: #f8fafc; }
              .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 40px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
              @media print { body { margin: 25px; font-size: 9pt; } }
          </style>
      </head>
      <body>
          <div class="header">
            <h1>Relatório de Vistoria de Inspeção Predial</h1>
            <p>Guia de Campo Personalizado</p>
          </div>
          <h2>Informações Gerais</h2>
          <table class="info-table">
            <tr><td>Edifício:</td><td style="font-weight: 600; color: #0f172a;">&nbsp;${form.buildingName}</td></tr>
            <tr><td>Endereço:</td><td>&nbsp;${form.address}</td></tr>
            <tr><td>Responsável Técnico:</td><td>&nbsp;${profile.fullName}</td></tr>
            <tr><td>Título Profissional:</td><td>&nbsp;${profile.professionalTitle}</td></tr>
            <tr><td>Registro Profissional:</td><td>&nbsp;${profile.professionalId || ''}</td></tr>
            <tr><td>Data da Emissão:</td><td>&nbsp;${new Date().toLocaleDateString('pt-BR')}</td></tr>
          </table>
          <h2>Checklist de Vistoria</h2>
          <div>${checklistTableHtml}</div>
          
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
