import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { GeminiService, registroValido, generateStandardFooter } from '../../services/gemini.service';
import { Pathology } from '../../models/pathology.model';
import { ToastService } from '../../services/toast.service';
import { UserProfile } from '../../models/user-profile.model';
import { Type } from '@google/genai';

const linhaSchema = {
  type: Type.OBJECT,
  properties: {
    descricao:      { type: Type.STRING },
    unidade:        { type: Type.STRING },
    quantidade:     { type: Type.NUMBER },
    preco_unitario: { type: Type.NUMBER },
  },
  required: ['descricao', 'unidade', 'quantidade', 'preco_unitario'],
};

const SCHEMA_ORCAMENTO = {
  type: Type.OBJECT,
  properties: {
    servicos:  { type: Type.ARRAY, items: linhaSchema },
    materiais: { type: Type.ARRAY, items: linhaSchema },
  },
  required: ['servicos', 'materiais'],
};

function calcularOrcamento(servicos: any[], materiais: any[], bdiPercent: number) {
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const comTotal = (l: any) => ({ ...l, total: r2((l.quantidade || 0) * (l.preco_unitario || 0)) });
  const s = (servicos ?? []).map(comTotal);
  const m = (materiais ?? []).map(comTotal);
  const subS = r2(s.reduce((a, x) => a + x.total, 0));
  const subM = r2(m.reduce((a, x) => a + x.total, 0));
  const base = r2(subS + subM);
  const valorBdi = r2(base * ((bdiPercent ?? 0) / 100));
  return { servicos: s, materiais: m, subtotalServicos: subS, subtotalMateriais: subM,
           bdiPercent: bdiPercent ?? 0, valorBdi, totalGeral: r2(base + valorBdi) };
}

@Component({
  selector: 'app-pathology-modal-content',
  templateUrl: './pathology-modal-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathologyModalContentComponent {
  pathology = input.required<Pathology>();
  userProfile = input<UserProfile | null>(null);

  actionPlan = signal<string | null>(null);
  budget = signal<string | null>(null);
  showBudgetButton = signal(false);
  
  loadingPlan = signal(false);
  loadingBudget = signal(false);

  planSuccess = signal(false);
  budgetSuccess = signal(false);
  bdiPercent = signal<number>(0);

  updateBdiPercent(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.bdiPercent.set(isNaN(value) ? 0 : value);
  }

  private geminiService = inject(GeminiService);
  private toastService = inject(ToastService);

  private renderOrcamentoHtml(calc: any): string {
    const r2Str = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const rowsHtml = (items: any[]) => items.map((x, i) => `
      <tr class="border-b border-stone-100 hover:bg-stone-50/50">
        <td class="px-4 py-2.5 text-slate-800">${i + 1}</td>
        <td class="px-4 py-2.5 text-slate-700">${this.escapeHtml(x.descricao)}</td>
        <td class="px-4 py-2.5 text-center text-slate-600">${this.escapeHtml(x.unidade)}</td>
        <td class="px-4 py-2.5 text-right text-slate-600">${x.quantidade}</td>
        <td class="px-4 py-2.5 text-right text-slate-600">R$ ${r2Str(x.preco_unitario)}</td>
        <td class="px-4 py-2.5 text-right font-medium text-slate-800">R$ ${r2Str(x.total)}</td>
      </tr>
    `).join('');

    return `
      <div class="space-y-6">
        <div>
          <h3 class="text-base font-bold text-sky-800 mb-2 uppercase tracking-wide">Serviços / Mão de Obra</h3>
          <div class="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-sm">
            <table class="min-w-full divide-y divide-stone-200">
              <thead>
                <tr class="bg-stone-50 text-stone-600 font-semibold text-xs text-left">
                  <th class="px-4 py-3">Item</th>
                  <th class="px-4 py-3">Descrição</th>
                  <th class="px-4 py-3 text-center">Unidade</th>
                  <th class="px-4 py-3 text-right">Qtde.</th>
                  <th class="px-4 py-3 text-right">Preço Unit.</th>
                  <th class="px-4 py-3 text-right">Preço Total</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-stone-100">
                ${calc.servicos.length > 0 ? rowsHtml(calc.servicos) : `<tr><td colspan="6" class="px-4 py-4 text-center text-stone-400 italic">Nenhum serviço mapeado.</td></tr>`}
              </tbody>
              <tfoot class="bg-stone-50/50 text-sm font-semibold text-slate-800">
                <tr>
                  <td colspan="5" class="px-4 py-3 text-right">Subtotal Serviços:</td>
                  <td class="px-4 py-3 text-right">R$ ${r2Str(calc.subtotalServicos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <h3 class="text-base font-bold text-sky-800 mb-2 uppercase tracking-wide">Materiais</h3>
          <div class="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-sm">
            <table class="min-w-full divide-y divide-stone-200">
              <thead>
                <tr class="bg-stone-50 text-stone-600 font-semibold text-xs text-left">
                  <th class="px-4 py-3">Item</th>
                  <th class="px-4 py-3">Descrição</th>
                  <th class="px-4 py-3 text-center">Unidade</th>
                  <th class="px-4 py-3 text-right">Qtde.</th>
                  <th class="px-4 py-3 text-right">Preço Unit.</th>
                  <th class="px-4 py-3 text-right">Preço Total</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-stone-100">
                ${calc.materiais.length > 0 ? rowsHtml(calc.materiais) : `<tr><td colspan="6" class="px-4 py-4 text-center text-stone-400 italic">Nenhum material mapeado.</td></tr>`}
              </tbody>
              <tfoot class="bg-stone-50/50 text-sm font-semibold text-slate-800">
                <tr>
                  <td colspan="5" class="px-4 py-3 text-right">Subtotal Materiais:</td>
                  <td class="px-4 py-3 text-right">R$ ${r2Str(calc.subtotalMateriais)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-right text-sm">
          <p class="text-stone-600">Soma dos Subtotais: <span class="font-medium text-slate-800">R$ ${r2Str(calc.subtotalServicos + calc.subtotalMateriais)}</span></p>
          <p class="text-stone-600">BDI Aplicado (${calc.bdiPercent}%): <span class="font-medium text-slate-800">R$ ${r2Str(calc.valorBdi)}</span></p>
          <h4 class="text-lg font-black text-emerald-800">Custo Total Estimado: R$ ${r2Str(calc.totalGeral)}</h4>
        </div>

        <p class="text-xs text-stone-500 italic mt-2">
          * Observação: Os valores acima são estimativas preliminares com base nos dados informados pelo modelo e podem variar de acordo com a localização geográfica, fornecedores e complexidade executiva da intervenção.
        </p>
      </div>
    `;
  }

  private escapeHtml(s: string): string {
    return (s ?? '').replace(/[&<>"']/g, (c: string) =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[c]);
  }

  private formatGeminiResponseToHtml(text: string | null): string {
    if (!text) return '';
    
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
    
    // Wrap list items in <ul> tags
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s?<ul>/g, '');

    return html;
  }

  generatePDF(title: string, content: string | null, type: string): void {
    if (!content) return;
    const pathology = this.pathology();
    const profile = this.userProfile();
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }

    const professionalInfo = `
      <div class="professional-info">
        <h3>Documento Elaborado para:</h3>
        <p><strong>Profissional:</strong> ${profile.fullName}</p>
        <p><strong>Título:</strong> ${profile.professionalTitle} | ${profile.professionalId || 'N/A'}</p>
        ${profile.companyName ? `
          <p style="margin-top: 10px;">
            <strong>Empresa:</strong> ${profile.companyName}${profile.position ? ` - ${profile.position}` : ''}<br>
            ${profile.companyCnpj ? `<strong>CNPJ:</strong> ${profile.companyCnpj}<br>` : ''}
            ${profile.companyAddress ? `<strong>Endereço:</strong> ${profile.companyAddress}` : ''}
          </p>
        ` : ''}
      </div>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              h1 { color: #0c4a6e; border-bottom: 2px solid #0c4a6e; padding-bottom: 10px; }
              h2, h3 { color: #0c4a6e; margin-top: 30px; }
              strong { color: #0f766e; }
              ul { padding-left: 20px; }
              li { margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              thead th { background-color: #f2f2f2; }
              tfoot { display: table-row-group; }
              tfoot td { font-weight: bold; }
              .pathology-info, .professional-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
              .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
              @media print { body { margin: 20px; } }
          </style>
      </head>
      <body>
          <h1>${title}</h1>
          <div class="pathology-info">
              <h3>Patologia: ${pathology.title}</h3>
              <p><strong>Sintomas:</strong> ${pathology.sintomas}</p>
              <p><strong>Causas Comuns:</strong> ${pathology.causas}</p>
          </div>
          ${professionalInfo}
          <div>${content}</div>
          
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

  async generateActionPlan(): Promise<void> {
    this.loadingPlan.set(true);
    this.actionPlan.set(null);
    this.budget.set(null);
    this.showBudgetButton.set(false);
    this.planSuccess.set(false);
    this.budgetSuccess.set(false);
    
    const pathology = this.pathology();
    const pathologyDetails = `Sintomas: ${pathology.sintomas}. Causas Comuns: ${pathology.causas}`;
    
    const prompt = `Como um engenheiro especialista em diagnóstico e manutenção predial, crie um plano de ação detalhado para a seguinte patologia em português do Brasil:
    - **Patologia:** ${pathology.title}
    - **Detalhes (Sintomas e Causas):** ${pathologyDetails}

    O plano de ação deve ser estruturado nos seguintes tópicos:
    1.  **Diagnóstico e Investigação:** Passos detalhados para confirmar a causa raiz do problema.
    2.  **Ações Corretivas (com indicação expressa da Classe de Ação conforme NBR 5674: 'Imediata', 'Necessária' ou 'Preventiva' para cada bloco ou procedimento de reparo):** Procedimentos de reparo passo a passo.
    3.  **Materiais e Ferramentas:** Lista dos principais materiais e equipamentos necessários.
    4.  **Medidas Preventivas Futuras:** Ações para evitar a recorrência do problema.
    5.  **Segurança e Recomendações:** Cuidados essenciais durante a execução dos serviços.
    Formate a resposta usando Markdown, com títulos em negrito e listas com marcadores.`;

    try {
      const response = await this.geminiService.generateText(prompt);
      const formattedContent = this.formatGeminiResponseToHtml(this.geminiService.sanitizeAiText(response));
      this.actionPlan.set(formattedContent);
      this.showBudgetButton.set(true);
      this.planSuccess.set(true);
      this.toastService.show('Plano de ação gerado com sucesso.', 'success');
    } catch (error) {
      console.error("Erro ao gerar plano de ação:", error);
      this.toastService.show('Não foi possível gerar o plano de ação no momento. Tente novamente.', 'error');
    } finally {
      this.loadingPlan.set(false);
    }
  }

  async generatePreliminaryBudget(): Promise<void> {
    this.toastService.show(
      'Módulo em migração para base SINAPI determinística. Geração de orçamento via IA temporariamente desativada.',
      'info'
    );
  }
}