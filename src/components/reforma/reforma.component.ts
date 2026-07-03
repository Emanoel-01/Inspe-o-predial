import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VistoriaDbService } from '../../services/vistoria-db.service';
import { GeminiService, registroValido } from '../../services/gemini.service';
import { ToastService } from '../../services/toast.service';
import { UserProfile } from '../../models/user-profile.model';

export type TipoReforma = 'COM_PROJETO' | 'SEM_PROJETO';
export type CategoriaAnexo = 'PROJETO_BASICO' | 'ORCAMENTO' | 'CRONOGRAMA' | 'OUTRO';
export type StatusReforma = 'EM_ELABORACAO' | 'MDR_EMITIDO';

export interface MensagemChat {
  autor: 'usuario' | 'ia';
  texto: string;
  timestamp: string;
}

export interface Reforma {
  id: string;
  tipo: TipoReforma;
  buildingName: string;
  contrato?: string;
  autorProjeto?: string;
  descricaoEscopo: string;
  quantitativoEstimado?: string;
  status: StatusReforma;
  chatOrientador?: MensagemChat[];
  numeroMdr?: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface AnexoReforma {
  id: string;
  reformaId: string;
  nomeArquivo: string;
  mimeType: string;
  blob: Blob;
  categoria: CategoriaAnexo;
  timestamp: string;
}

const CATEGORIAS_OBRIGATORIAS: CategoriaAnexo[] = ['PROJETO_BASICO', 'ORCAMENTO', 'CRONOGRAMA'];

const LABEL_CATEGORIA: Record<CategoriaAnexo, string> = {
  PROJETO_BASICO: 'Projeto Básico',
  ORCAMENTO: 'Orçamento',
  CRONOGRAMA: 'Cronograma Físico-Financeiro',
  OUTRO: 'Outro',
};

@Component({
  selector: 'app-reforma',
  templateUrl: './reforma.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class ReformaComponent implements OnInit {
  private dbService = inject(VistoriaDbService);
  private geminiService = inject(GeminiService);
  private toastService = inject(ToastService);

  readonly LABEL_CATEGORIA = LABEL_CATEGORIA;
  readonly CATEGORIAS_TODAS: CategoriaAnexo[] = ['PROJETO_BASICO', 'ORCAMENTO', 'CRONOGRAMA', 'OUTRO'];

  userProfile = signal<UserProfile | null>(null);
  carregando = signal(true);
  reformas = signal<Reforma[]>([]);
  anexos = signal<AnexoReforma[]>([]);
  modoExibicao = signal<'LISTA' | 'ESCOLHA_PORTA' | 'ABERTURA' | 'DETALHE'>('LISTA');
  reformaAtiva = signal<Reforma | null>(null);
  tipoSelecionado = signal<TipoReforma>('COM_PROJETO');
  anexando = signal(false);
  categoriaSelecionadaUpload = signal<CategoriaAnexo>('PROJETO_BASICO');

  novoBuildingName = signal('');
  novoContrato = signal('');
  novoAutorProjeto = signal('');
  novoDescricaoEscopo = signal('');
  novoQuantitativoEstimado = signal('');

  chatMensagens = signal<MensagemChat[]>([]);
  chatInput = signal('');
  chatCarregando = signal(false);

  anexosDaReformaAtiva = computed(() => {
    const ativa = this.reformaAtiva();
    if (!ativa) return [];
    return this.anexos().filter(a => a.reformaId === ativa.id);
  });

  categoriasStatus = computed(() => {
    const presentes = new Set(this.anexosDaReformaAtiva().map(a => a.categoria));
    return CATEGORIAS_OBRIGATORIAS.map(cat => ({
      categoria: cat,
      label: LABEL_CATEGORIA[cat],
      presente: presentes.has(cat),
    }));
  });

  edificacoesConhecidas = computed(() => Array.from(new Set(this.reformas().map(r => r.buildingName))).sort());
  contratosConhecidos = computed(() => Array.from(new Set(this.reformas().map(r => r.contrato).filter((c): c is string => !!c))).sort());

  async ngOnInit(): Promise<void> {
    this.carregarPerfilDoLocalStorage();
    await this.carregarDados();
  }

  carregarPerfilDoLocalStorage(): void {
    try {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        this.userProfile.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao carregar perfil do localStorage', e);
    }
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    try {
      const [reformas, anexos] = await Promise.all([
        this.dbService.getAllReformas(),
        this.dbService.getAllAnexosReforma(),
      ]);
      reformas.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
      this.reformas.set(reformas);
      this.anexos.set(anexos);
    } catch (e) {
      console.error('Falha ao carregar reformas', e);
      this.toastService.show('Falha ao carregar reformas.', 'error');
    } finally {
      this.carregando.set(false);
    }
  }

  iniciarNovaReforma(): void {
    this.modoExibicao.set('ESCOLHA_PORTA');
  }

  escolherPorta(tipo: TipoReforma): void {
    this.tipoSelecionado.set(tipo);
    this.novoBuildingName.set('');
    this.novoContrato.set('');
    this.novoAutorProjeto.set('');
    this.novoDescricaoEscopo.set('');
    this.novoQuantitativoEstimado.set('');
    this.chatMensagens.set([]);
    this.chatInput.set('');
    this.modoExibicao.set('ABERTURA');
  }

  async enviarMensagemChat(): Promise<void> {
    const texto = this.chatInput().trim();
    if (!texto) return;

    const novaMsg: MensagemChat = { autor: 'usuario', texto, timestamp: new Date().toISOString() };
    this.chatMensagens.update(msgs => [...msgs, novaMsg]);
    this.chatInput.set('');
    this.chatCarregando.set(true);

    try {
      const transcricao = this.chatMensagens().map(m => `${m.autor === 'usuario' ? 'Solicitante' : 'Assistente'}: ${m.texto}`).join('\n');
      const prompt = `Você é um assistente técnico da JI Construtora, ajudando um servidor/gestor público a entender que elementos são necessários para submeter uma solicitação de reforma sem projeto técnico pronto.

REGRAS FIXAS — NUNCA VIOLAR:
- NÃO diagnostique patologias.
- NÃO crie nem esboce o projeto técnico.
- NÃO calcule nem estime orçamento.
- Seu único papel é orientar: fazer perguntas objetivas para entender o escopo da necessidade (o que precisa mudar, em qual ambiente, motivo), e ao final, listar claramente quais documentos/elementos a pessoa ainda precisa providenciar antes de um Responsável Técnico avançar.
- Seja objetivo, conciso, no máximo 4 frases por resposta.

Histórico da conversa até agora:
${transcricao}

Responda à última mensagem do Solicitante, continuando a orientação.`;

      const resposta = await this.geminiService.generateText(prompt);
      this.chatMensagens.update(msgs => [...msgs, { autor: 'ia', texto: resposta, timestamp: new Date().toISOString() }]);
    } catch (e) {
      console.error('Falha no chat orientador', e);
      this.toastService.show('Falha ao consultar o assistente. Tente novamente.', 'error');
    } finally {
      this.chatCarregando.set(false);
    }
  }

  async salvarAbertura(): Promise<void> {
    if (!this.novoBuildingName().trim() || !this.novoDescricaoEscopo().trim()) {
      this.toastService.show('Preencha edificação e descrição do escopo antes de salvar.', 'error');
      return;
    }

    const nova: Reforma = {
      id: crypto.randomUUID(),
      tipo: this.tipoSelecionado(),
      buildingName: this.novoBuildingName().trim(),
      contrato: this.novoContrato().trim() || undefined,
      autorProjeto: this.novoAutorProjeto().trim() || undefined,
      descricaoEscopo: this.novoDescricaoEscopo().trim(),
      quantitativoEstimado: this.novoQuantitativoEstimado().trim() || undefined,
      status: 'EM_ELABORACAO',
      chatOrientador: this.tipoSelecionado() === 'SEM_PROJETO' ? this.chatMensagens() : undefined,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };

    await this.dbService.saveReforma(nova);
    this.reformas.set([nova, ...this.reformas()]);
    this.abrirDetalhe(nova);
    this.toastService.show('Reforma registrada.', 'success');
  }

  abrirDetalhe(reforma: Reforma): void {
    this.reformaAtiva.set(reforma);
    this.categoriaSelecionadaUpload.set('PROJETO_BASICO');
    this.modoExibicao.set('DETALHE');
  }

  voltarParaLista(): void {
    this.reformaAtiva.set(null);
    this.modoExibicao.set('LISTA');
    void this.carregarDados();
  }

  async anexarArquivo(event: Event): Promise<void> {
    const ativa = this.reformaAtiva();
    if (!ativa) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.anexando.set(true);
    try {
      const anexo: AnexoReforma = {
        id: crypto.randomUUID(),
        reformaId: ativa.id,
        nomeArquivo: file.name,
        mimeType: file.type || 'application/octet-stream',
        blob: file,
        categoria: this.categoriaSelecionadaUpload(),
        timestamp: new Date().toISOString(),
      };
      await this.dbService.saveAnexoReforma(anexo);
      this.anexos.set([...this.anexos(), anexo]);
      this.toastService.show('Arquivo anexado.', 'success');
    } catch (e) {
      console.error('Falha ao anexar arquivo', e);
      this.toastService.show('Falha ao anexar arquivo.', 'error');
    } finally {
      this.anexando.set(false);
      input.value = '';
    }
  }

  private async gerarNumeroMdr(): Promise<string> {
    const ano = new Date().getFullYear();
    const doAno = this.reformas().filter(r => r.numeroMdr?.includes(`-${ano}-`)).length;
    const seq = String(doAno + 1).padStart(4, '0');
    return `P4-MDR-${ano}-${seq}`;
  }

  async exportarMDR(): Promise<void> {
    const ativa = this.reformaAtiva();
    const profile = this.userProfile();
    if (!profile || !registroValido(profile.professionalId ?? '')) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }
    if (!ativa) return;

    let reformaParaExportar = ativa;
    if (!ativa.numeroMdr) {
      const numero = await this.gerarNumeroMdr();
      reformaParaExportar = { ...ativa, numeroMdr: numero, status: 'MDR_EMITIDO', dateUpdated: new Date().toISOString() };
      await this.dbService.saveReforma(reformaParaExportar);
      this.reformaAtiva.set(reformaParaExportar);
      this.reformas.set(this.reformas().map(r => r.id === reformaParaExportar.id ? reformaParaExportar : r));
    }

    const novaJanela = window.open('', '_blank');
    if (!novaJanela) {
      this.toastService.show('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.', 'error');
      return;
    }

    const anexosLista = this.anexosDaReformaAtiva();
    const linhasAnexos = this.CATEGORIAS_TODAS.map(cat => {
      const doTipo = anexosLista.filter(a => a.categoria === cat);
      if (doTipo.length === 0) {
        const obrigatoria = (CATEGORIAS_OBRIGATORIAS as string[]).includes(cat);
        return `<tr><td><strong>${LABEL_CATEGORIA[cat]}</strong></td><td>${obrigatoria ? '<span class="pendente">PENDENTE — nenhum arquivo anexado</span>' : '—'}</td></tr>`;
      }
      return `<tr><td><strong>${LABEL_CATEGORIA[cat]}</strong></td><td>${doTipo.map(a => a.nomeArquivo).join('<br>')}</td></tr>`;
    }).join('');

    const chatHtml = (reformaParaExportar.chatOrientador && reformaParaExportar.chatOrientador.length > 0)
      ? `<h3>Registro do Levantamento (Assistente Orientador)</h3>
         ${reformaParaExportar.chatOrientador.map(m => `<p><strong>${m.autor === 'usuario' ? 'Solicitante' : 'Assistente'}:</strong> ${m.texto}</p>`).join('')}`
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>MDR — ${reformaParaExportar.numeroMdr}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; color: #1A2A38; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin: 3mm 0; }
          thead, tfoot { display: table-header-group; }
          .header, .footer { font-size: 8pt; color: #4A5A66; padding: 4mm 0; border-bottom: 1px solid #D8D0C6; }
          .footer { border-top: 1px solid #D8D0C6; border-bottom: none; }
          h1 { font-size: 14pt; color: #132A41; }
          td, th { padding: 2mm 3mm; border: 1px solid #D8D0C6; text-align:left; font-size:9pt; vertical-align: top; }
          .pendente { color: #B77D1A; font-weight: 700; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr><td><div class="header">AmorimTech · Memorial Descritivo de Reforma — ${reformaParaExportar.numeroMdr}</div></td></tr></thead>
          <tfoot><tr><td><div class="footer">Responsável Técnico: ${profile.fullName} — ${profile.professionalId}</div></td></tr></tfoot>
          <tbody><tr><td>

            <h1>Memorial Descritivo de Reforma</h1>
            <p><strong>${reformaParaExportar.numeroMdr}</strong> · ${reformaParaExportar.tipo === 'COM_PROJETO' ? 'Com Projeto' : 'Sem Projeto'}</p>

            <table>
              <tr><td><strong>Edificação</strong></td><td>${reformaParaExportar.buildingName}</td>
                  <td><strong>Contrato</strong></td><td>${reformaParaExportar.contrato || '—'}</td></tr>
              <tr><td><strong>Autor do Projeto</strong></td><td>${reformaParaExportar.autorProjeto || '—'}</td>
                  <td><strong>Quantitativo Estimado</strong></td><td>${reformaParaExportar.quantitativoEstimado || '—'}</td></tr>
            </table>

            <h3>Escopo Descrito</h3>
            <p>${reformaParaExportar.descricaoEscopo}</p>

            <h3>Documentação Anexada</h3>
            <table>${linhasAnexos}</table>

            ${chatHtml}

            <p style="margin-top:8mm;"><strong>Responsável Técnico:</strong> ${profile.fullName} — ${profile.professionalId}</p>

          </td></tr></tbody>
        </table>
      </body>
      </html>`;

    novaJanela.document.write(htmlContent);
    novaJanela.document.close();
    novaJanela.onload = () => { novaJanela.focus(); novaJanela.print(); };
  }
}
