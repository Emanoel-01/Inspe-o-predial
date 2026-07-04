import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, NormaRef } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { UserProfile } from '../../models/user-profile.model';
import { registroValido, generateStandardFooter, GeminiService } from '../../services/gemini.service';
import { VistoriaDbService, Evidencia } from '../../services/vistoria-db.service';
import { CameraService } from '../../services/camera.service';
import { Type } from '@google/genai';
import { OrcamentoService, Composicao } from '../../services/orcamento.service';

export interface FichaDano {
  id: string;
  numeroFicha: number;                    // sequencial GLOBAL na Vistoria
  pavimento?: string;
  ambiente?: string;
  id_evidencias?: string[];               // chaves das fotos no store 'evidencias'
  diagnostico_ia?: string;
  quantitativo?: string;
  memorialDescritivo?: string;
  correlacaoFotoPatologia?: 'CONFIRMADA' | 'DIVERGENTE' | 'INCONCLUSIVA';
  observacaoDivergencia?: string;
  composicoesAplicadas?: string[];
  severity?: 'Mínimo' | 'Regular' | 'Crítico';
  notes: string;
  classificacao?: { tipo: 'ANOMALIA' | 'FALHA' | 'INDETERMINADO'; subtipo?: string };
  manifestacao?: string;
  causaProvavel?: string;
  recomendacaoTecnica?: string;
  normasAplicaveis?: NormaRef[];
  criticidade?: 'P1' | 'P2' | 'P3';
  gut?: { g: number; u: number; t: number };
  dateCreated: string;
  dateUpdated: string;
}

export interface ChecklistItem {
  id: string;
  systemTitle: string;
  typologyTitle: string;
  title: string;
  description: string;
  status: 'PENDENTE' | 'PASS' | 'FAIL' | 'NA' | 'CONFORME' | 'NAO_CONFORME' | 'NAO_APLICAVEL';
  ocorrencias: FichaDano[];
}

export interface FotoGeral {
  dataUrl: string;
  timestamp: string;
}

export interface Anexo {
  id: string;          // crypto.randomUUID()
  nome: string;        // file.name
  tipo: string;        // MIME real — file.type (ex.: 'image/png', 'application/pdf')
  tamanho: number;     // file.size (bytes)
  dataUpload: string;  // new Date().toISOString()
  legenda?: string;          // NOVO — do que se trata o anexo (caption/legenda)
  constatacaoId?: string;    // NOVO — vínculo opcional a uma Constatacao da mesma anamnese
}

export type DisponibilidadeNorteador = 'A_AVALIAR' | 'DD' | 'DND' | 'NA';
export type ConformidadeNorteador   = 'EC' | 'NC';

export interface DocumentoNorteador {
  id: string;
  grupo: string;                              // ex.: 'Administrativos e técnicos'
  descricao: string;                          // vem do seed; read-only na UI (editável só em item extra)
  seed: boolean;                              // true = item canônico do LIP; false = item extra do RT
  disponibilidade: DisponibilidadeNorteador;  // default 'A_AVALIAR'
  conformidade?: ConformidadeNorteador;       // SÓ quando disponibilidade === 'DD'
  observacao?: string;
  anexos: Anexo[];                            // metadados; blobs no store
}

export type TipoConstatacao = 'RELATO_OCUPANTE' | 'HISTORICO' | 'INTERVENCAO' | 'PATOLOGIA_RECORRENTE' | 'OUTROS';

export interface Constatacao {
  id: string;
  tipo: TipoConstatacao;
  descricao: string;          // texto principal (rótulo adapta por tipo)
  nomeOcupante?: string;      // RELATO_OCUPANTE (obrig.)
  identificacao?: string;     // RELATO_OCUPANTE (obrig.) — vínculo/unidade
  data?: string;              // HISTORICO (obrig.), INTERVENCAO (obrig.)
  fonteRelato?: string;       // PATOLOGIA_RECORRENTE (obrig.) — quem relatou / como foi verificada
  dateCreated: string;
}

export interface Anamnese {
  constatacoes: Constatacao[];
  anexos: Anexo[];
}

export interface Vistoria {
  id: string;
  buildingName: string;
  address: string;
  areaConstruida?: string;
  idadeEdificacao?: string;
  lat?: number;
  lng?: number;
  gpsAccuracy?: number;
  objetoNatureza?: string;          // mantido para compatibilidade com registros antigos
  memoriaDescritivo?: string;       // Memorial Descritivo da Edificação — aparece na Seção 4
  artRrtNumero?: string;
  mapaImagemBase64?: string;
  fotosGerais?: FotoGeral[];        // fotos situacionais da edificação (max 4, JPEG comprimidas)
  tipoUso?: string;                 // tipologia/uso da edificação (Residencial, Comercial, etc.)
  contratanteCnpj?: string;         // CNPJ do contratante
  contratanteRazaoSocial?: string;  // razão social do contratante
  solicitanteEndereco?: string;
  responsavelLegalNome?: string;
  responsavelLegalDocumento?: string;
  padraoAcabamento?: 'Alto' | 'Normal' | 'Baixo';
  numeroPavimentos?: string;
  sistemaEstruturalPredominante?: string;
  sistemaFundacao?: string;
  horarioFuncionamento?: string;
  nivelInspecao?: '1' | '2' | '3';
  nivelInspecaoMetodologia?: string;
  nivelInspecaoJustificativa?: string;
  contadorFichas: number;           // default 0
  dateCreated: string;
  dateUpdated: string;
  progress: number;
  items: ChecklistItem[];
  documentosNorteadores?: DocumentoNorteador[];
  anamnese?: Anamnese;
}

const SCHEMA_ANALISE_EVIDENCIA = {
  type: Type.OBJECT,
  properties: {
    texto: { type: Type.STRING },
    severitySugerida: { type: Type.STRING, enum: ['Mínimo', 'Regular', 'Crítico'] },
    correlacaoFotoPatologia: { type: Type.STRING, enum: ['CONFIRMADA', 'DIVERGENTE', 'INCONCLUSIVA'] },
    observacaoDivergencia: { type: Type.STRING },
    classificacaoTipo: { type: Type.STRING, enum: ['ANOMALIA', 'FALHA', 'INDETERMINADO'] },
    classificacaoSubtipo: { type: Type.STRING, enum: ['endogena','exogena','natural','funcional','planejamento','execucao','operacional','gerencial'] },
    manifestacao: { type: Type.STRING },
    causaProvavel: { type: Type.STRING },
    recomendacaoTecnica: { type: Type.STRING },
    criticidadeSugerida: { type: Type.STRING, enum: ['P1', 'P2', 'P3'] },
  },
  required: ['texto', 'severitySugerida', 'correlacaoFotoPatologia'],
};

const CONSTATACAO_META: Record<TipoConstatacao, { rotulo: string; labelPrincipal: string; placeholderPrincipal: string }> = {
  RELATO_OCUPANTE:      { rotulo: 'Relato de ocupante',              labelPrincipal: 'Relato',                    placeholderPrincipal: 'O que foi relatado…' },
  HISTORICO:            { rotulo: 'Histórico da edificação',         labelPrincipal: 'Histórico',                 placeholderPrincipal: 'Ex.: edificação construída em meados de 2008…' },
  INTERVENCAO:          { rotulo: 'Intervenção / reforma anterior',  labelPrincipal: 'Detalhes da intervenção',   placeholderPrincipal: 'O que foi feito, em qual sistema…' },
  PATOLOGIA_RECORRENTE: { rotulo: 'Patologia recorrente observada',  labelPrincipal: 'Patologia observada',       placeholderPrincipal: 'Manifestação recorrente relatada…' },
  OUTROS:               { rotulo: 'Outros',                          labelPrincipal: 'Constatação',               placeholderPrincipal: 'Descreva a constatação…' },
};

const METODOLOGIA_NIVEL: Record<'1' | '2' | '3', string> = {
  '1': 'A metodologia adotada para o Nível 1 baseia-se em inspeção predominantemente sensorial (visual), de caráter expedito, realizada a partir do solo ou de pontos de observação acessíveis, sem auxílio de equipamentos de ensaio avançados ou procedimentos destrutivos. Objetiva identificar anomalias e falhas aparentes para subsidiar as diretrizes de manutenção periódica.',
  '2': 'A metodologia adotada para o Nível 2 engloba a verificação visual detalhada e sistemática de todos os elementos acessíveis da edificação, complementada pela análise minuciosa da documentação técnica disponível (como projetos, manuais de uso e relatórios de manutenção anteriores). Utiliza-se de medições locais de campo e classificação estruturada de prioridades.',
  '3': 'A metodologia adotada para o Nível 3 consiste em auditoria técnica e diagnóstica de alta complexidade. Envolve a realização de ensaios tecnológicos in situ ou em laboratório (provas de carga, esclerometria, ultrassom, ensaio de carbonatação, termografia, etc.), análise aprofundada de projetos e acompanhamento da evolução de manifestações patológicas específicas.'
};

const JUSTIFICATIVA_NIVEL: Record<'1' | '2' | '3', string> = {
  '1': 'Justifica-se a adoção do Nível 1 pela inexistência de documentação técnica histórica do imóvel, associada a uma demanda de vistoria preliminar para identificação rápida de manifestações patológicas aparentes, sem indícios iniciais de risco estrutural generalizado ou iminente que exijam ensaios específicos.',
  '2': 'Justifica-se a adoção do Nível 2 devido à existência de acervo documental parcial ou completo da edificação, necessitando-se de uma avaliação sistemática e detalhada para organizar o planejamento de manutenção preventiva/corretiva a médio prazo.',
  '3': 'Justifica-se a adoção do Nível 3 pela constatação prévia de graves anomalias com potencial comprometimento estrutural ou de segurança, demandando-se ensaios específicos e investigação profunda para determinar causas, mechanisms de degradação e diretrizes precisas de reabilitação.'
};

const SEED_NORTEADORES_RAW: { grupo: string; descricao: string }[] = [
  { grupo: 'Administrativos e técnicos', descricao: 'Manual de uso, operação e manutenção da edificação' },
  { grupo: 'Administrativos e técnicos', descricao: 'Manuais técnicos de equipamentos instalados' },
  { grupo: 'Administrativos e técnicos', descricao: 'Auto de conclusão (Habite-se)' },
  { grupo: 'Administrativos e técnicos', descricao: 'Alvará de funcionamento' },
  { grupo: 'Administrativos e técnicos', descricao: 'Alvará de instalação de elevadores' },
  { grupo: 'Administrativos e técnicos', descricao: 'Alvará de funcionamento de elevadores' },
  { grupo: 'Administrativos e técnicos', descricao: 'AVCB — Auto de Vistoria do Corpo de Bombeiros' },
  { grupo: 'Administrativos e técnicos', descricao: 'Projetos legais aprovados (poder público, SCI, concessionárias)' },
  { grupo: 'Administrativos e técnicos', descricao: 'Projetos executivos' },
  { grupo: 'Administrativos e técnicos', descricao: 'Regimento interno' },
  { grupo: 'Administrativos e técnicos', descricao: 'Licenças ambientais' },
  { grupo: 'Administrativos e técnicos', descricao: 'TAC ambiental' },
  { grupo: 'Administrativos e técnicos', descricao: 'Outorga de poço profundo' },
  { grupo: 'Administrativos e técnicos', descricao: 'Outorga de ETE' },
  { grupo: 'Administrativos e técnicos', descricao: 'Cadastro de máquinas e equipamentos' },
  { grupo: 'Administrativos e técnicos', descricao: 'Atestado de brigada de incêndio' },
  { grupo: 'Administrativos e técnicos', descricao: 'RIA — Relatório de Inspeção Anual de elevadores' },
  { grupo: 'Administrativos e técnicos', descricao: 'Contrato de manutenção — elevadores' },
  { grupo: 'Administrativos e técnicos', descricao: 'Contrato de manutenção — geradores' },
  { grupo: 'Administrativos e técnicos', descricao: 'Contrato de manutenção — SCI (combate a incêndio)' },
  { grupo: 'Manutenção e operação', descricao: 'PMOC — Plano de Manutenção, Operação e Controle' },
  { grupo: 'Manutenção e operação', descricao: 'Atestado de desratização / desinsetização' },
  { grupo: 'Manutenção e operação', descricao: 'Atestado SPDA + medição ôhmica' }
];

@Component({
  selector: 'app-checklist-inspecao',
  templateUrl: './checklist-inspecao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ChecklistInspecaoComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private dbService = inject(VistoriaDbService);
  public camera = inject(CameraService);
  private geminiService = inject(GeminiService);
  orcamentoService = inject(OrcamentoService);

  // Controle de carregamento das vistorias
  carregandoVistorias = signal(true);

  // Perfil do profissional (pode vir local ou via input, vamos carregar do localStorage ou usar padrão)
  userProfile = signal<UserProfile | null>(null);

  // Vistorias salvas
  vistorias = signal<Vistoria[]>([]);
  vistoriaAtiva = signal<Vistoria | null>(null);
  vistoriaParaExcluir = signal<Vistoria | null>(null);

  // Estado para captura de evidência e IA
  itemCapturandoEvidencia = signal<ChecklistItem | null>(null);
  streamCamera = signal<MediaStream | null>(null);
  tipoEvidencia = signal<'contexto' | 'detalhe'>('contexto');
  capturando = signal(false);
  analisandoIa = signal(false);
  gerandoMemorialId = signal<string | null>(null);
  cameraIndisponivel = signal(false);
  dragOver = signal(false);
  itemSalvoFeedback = signal<string | null>(null);
  itemGaleriaAberta = signal<string | null>(null);
  evidenciasGaleria = signal<{ url: string; ev: Evidencia }[]>([]);
  fichaEmEdicaoId = signal<string | null>(null);
  itemDaFichaEmEdicaoId = signal<string | null>(null);
  fichaPendenteConfirmacaoExclusao = signal<string | null>(null);

  anexoUrls = signal<Record<string, string>>({});
  anexoPendenteConfirmacaoExclusao = signal<string | null>(null);
  norteadorPendenteConfirmacaoExclusao = signal<string | null>(null);

  norteadoresAgrupados = computed(() => {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return [];

    const docs = ativa.documentosNorteadores ?? [];
    
    const gruposMap = new Map<string, DocumentoNorteador[]>();
    for (const doc of docs) {
      const g = doc.grupo || 'Outros';
      if (!gruposMap.has(g)) {
        gruposMap.set(g, []);
      }
      gruposMap.get(g)!.push(doc);
    }

    const ordemSugerida = ['Administrativos e técnicos', 'Manutenção e operação', 'Itens adicionais'];
    const resultado: { nome: string; documentos: DocumentoNorteador[] }[] = [];
    
    for (const g of ordemSugerida) {
      if (gruposMap.has(g)) {
        resultado.push({ nome: g, documentos: gruposMap.get(g)! });
        gruposMap.delete(g);
      }
    }

    for (const [nome, documentos] of gruposMap.entries()) {
      resultado.push({ nome, documentos });
    }

    return resultado;
  });

  private sinalizarSalvo(itemId: string): void {
    this.itemSalvoFeedback.set(itemId);
    setTimeout(() => {
      if (this.itemSalvoFeedback() === itemId) {
        this.itemSalvoFeedback.set(null);
      }
    }, 2000);
  }

  async abrirGaleria(item: ChecklistItem): Promise<void> {
    // Toggle: se já está aberta para este item, fecha e sai.
    if (this.itemGaleriaAberta() === item.id) {
      this.fecharGaleria();
      return;
    }
    // Fecha qualquer galeria anterior (libera memória) antes de abrir a nova.
    this.fecharGaleria();

    const ids = this.obterOcorrenciaAtiva(item).id_evidencias ?? [];
    const carregadas: { url: string; ev: Evidencia }[] = [];
    for (const id of ids) {
      const ev = await this.dbService.getEvidencia(id);
      if (ev) {
        const url = URL.createObjectURL(ev.blob);
        carregadas.push({ url, ev });
      }
    }
    this.evidenciasGaleria.set(carregadas);
    this.itemGaleriaAberta.set(item.id);
  }

  fecharGaleria(): void {
    for (const e of this.evidenciasGaleria()) {
      URL.revokeObjectURL(e.url);
    }
    this.evidenciasGaleria.set([]);
    this.itemGaleriaAberta.set(null);
  }

  // Estado do formulário de criação
  novoBuildingName = signal('');
  novoAddress = signal('');
  novaAreaConstruida = signal('');
  novaIdadeEdificacao = signal('');
  novoMemoriaDescritivo = signal('');
  novoArtRrt = signal('');
  novaMapaImagemBase64 = signal<string | null>(null);
  novoFotosGerais = signal<FotoGeral[]>([]);
  novoTipoUso = signal('');
  novoContratanteCnpj = signal('');
  novoContratanteRazaoSocial = signal('');
  novoLat = signal<number | null>(null);
  novoLng = signal<number | null>(null);
  novoGpsAccuracy = signal<number | null>(null);
  selecaoSistemas = signal<{ [key: string]: boolean }>({}); // chave: "systemKey-typologyTitle"

  // Novos campos do Bloco 2a
  novoSolicitanteEndereco = signal('');
  novoResponsavelLegalNome = signal('');
  novoResponsavelLegalDocumento = signal('');
  novoPadraoAcabamento = signal<'Alto' | 'Normal' | 'Baixo'>('Normal');
  novoNumeroPavimentos = signal('');
  novoSistemaEstruturalPredominante = signal('');
  novoSistemaFundacao = signal('');
  novoHorarioFuncionamento = signal('');
  novoNivelInspecao = signal<'1' | '2' | '3'>('1');
  novoNivelInspecaoMetodologia = signal('');
  novoNivelInspecaoJustificativa = signal('');

  private resolverOcorrenciaEmEdicao(item: ChecklistItem): FichaDano | null {
    if (this.itemDaFichaEmEdicaoId() === item.id && this.fichaEmEdicaoId()) {
      return item.ocorrencias?.find(f => f.id === this.fichaEmEdicaoId()) ?? null;
    }
    return null;
  }

  obterOuCriarOcorrenciaAtiva(item: ChecklistItem): FichaDano {
    if (!item.ocorrencias) {
      item.ocorrencias = [];
    }
    const emEdicao = this.resolverOcorrenciaEmEdicao(item);
    if (emEdicao) return emEdicao;

    if (item.ocorrencias.length === 0) {
      const ativa = this.vistoriaAtiva();
      const proximoNumero = (ativa?.contadorFichas ?? 0) + 1;
      if (ativa) {
        ativa.contadorFichas = proximoNumero;
      }
      const nova: FichaDano = {
        id: 'ficha-' + crypto.randomUUID(),
        numeroFicha: proximoNumero,
        notes: '',
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString()
      };
      item.ocorrencias.push(nova);
    }
    return item.ocorrencias[0];
  }

  obterOcorrenciaAtiva(item: ChecklistItem): FichaDano {
    const emEdicao = this.resolverOcorrenciaEmEdicao(item);
    if (emEdicao) return emEdicao;
    return item.ocorrencias?.[0] ?? {
      id: '',
      numeroFicha: 0,
      notes: '',
      dateCreated: '',
      dateUpdated: ''
    } as FichaDano;
  }

  criarNovaOcorrencia(itemId: string): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id !== itemId) return item;
      const itemAtualizado = { ...item, ocorrencias: [...(item.ocorrencias ?? [])] };
      ativa.contadorFichas = (ativa.contadorFichas ?? 0) + 1;
      const nova: FichaDano = {
        id: 'ficha-' + crypto.randomUUID(),
        numeroFicha: ativa.contadorFichas,
        notes: '',
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
      };
      itemAtualizado.ocorrencias.push(nova);
      itemAtualizado.status = 'NAO_CONFORME';  // regra: 1+ ocorrência força NAO_CONFORME sempre
      this.fichaEmEdicaoId.set(nova.id);
      this.itemDaFichaEmEdicaoId.set(itemId);
      return itemAtualizado;
    });

    this.atualizarItensVistoriaAtiva(novosItens);
  }

  excluirOcorrencia(itemId: string, fichaId: string): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id !== itemId) return item;
      const ocorrenciasRestantes = (item.ocorrencias ?? []).filter(f => f.id !== fichaId);
      const itemAtualizado = { ...item, ocorrencias: ocorrenciasRestantes };
      // Se não sobrou nenhuma ocorrência, o status volta a ser decidido manualmente pelo RT (PENDENTE)
      if (ocorrenciasRestantes.length === 0) {
        itemAtualizado.status = 'PENDENTE';
      }
      return itemAtualizado;
    });

    this.atualizarItensVistoriaAtiva(novosItens);
    if (this.fichaEmEdicaoId() === fichaId) {
      this.fichaEmEdicaoId.set(null);
      this.itemDaFichaEmEdicaoId.set(null);
    }
  }

  solicitarExclusaoOcorrencia(itemId: string, fichaId: string): void {
    if (this.fichaPendenteConfirmacaoExclusao() === fichaId) {
      this.excluirOcorrencia(itemId, fichaId);
      this.fichaPendenteConfirmacaoExclusao.set(null);
    } else {
      this.fichaPendenteConfirmacaoExclusao.set(fichaId);
      setTimeout(() => {
        if (this.fichaPendenteConfirmacaoExclusao() === fichaId) {
          this.fichaPendenteConfirmacaoExclusao.set(null);
        }
      }, 3000);
    }
  }

  salvarCamposBasicosFicha(itemId: string, fichaId: string, pavimento: string, ambiente: string): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id !== itemId) return item;
      const ocorrenciasAtualizadas = (item.ocorrencias ?? []).map(f =>
        f.id === fichaId ? { ...f, pavimento, ambiente, dateUpdated: new Date().toISOString() } : f
      );
      return { ...item, ocorrencias: ocorrenciasAtualizadas };
    });

    this.atualizarItensVistoriaAtiva(novosItens);
  }

  salvarCamposDiagnosticoFicha(
    itemId: string,
    fichaId: string,
    campos: Partial<{
      classificacaoTipo: 'ANOMALIA' | 'FALHA' | 'INDETERMINADO';
      classificacaoSubtipo: string;
      manifestacao: string;
      causaProvavel: string;
      recomendacaoTecnica: string;
      criticidade: 'P1' | 'P2' | 'P3' | '';
    }>
  ): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id !== itemId) return item;
      const ocorrenciasAtualizadas = (item.ocorrencias ?? []).map(f => {
        if (f.id === fichaId) {
          const novoTipo = 'classificacaoTipo' in campos ? campos.classificacaoTipo : (f.classificacao?.tipo ?? 'INDETERMINADO');
          const novoSubtipo = 'classificacaoSubtipo' in campos ? campos.classificacaoSubtipo : f.classificacao?.subtipo;
          
          return {
            ...f,
            classificacao: { tipo: novoTipo as any, subtipo: novoSubtipo },
            manifestacao: 'manifestacao' in campos ? campos.manifestacao : f.manifestacao,
            causaProvavel: 'causaProvavel' in campos ? campos.causaProvavel : f.causaProvavel,
            recomendacaoTecnica: 'recomendacaoTecnica' in campos ? campos.recomendacaoTecnica : f.recomendacaoTecnica,
            criticidade: 'criticidade' in campos ? (campos.criticidade || undefined) as any : f.criticidade,
            dateUpdated: new Date().toISOString()
          };
        }
        return f;
      });
      return { ...item, ocorrencias: ocorrenciasAtualizadas };
    });

    this.atualizarItensVistoriaAtiva(novosItens);
  }

  onNivelInspecaoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as '1' | '2' | '3';
    this.novoNivelInspecao.set(val);
    this.novoNivelInspecaoMetodologia.set(METODOLOGIA_NIVEL[val] || '');
    this.novoNivelInspecaoJustificativa.set(JUSTIFICATIVA_NIVEL[val] || '');
  }

  // Filtros de visualização
  filtroStatus = signal<'TODOS' | 'PENDENTE' | 'PASS' | 'FAIL' | 'NA'>('TODOS');
  filtroSistema = signal<string>('TODOS');

  // Anamnese guided form signals & computed
  novaConstatacaoTipo = signal<TipoConstatacao>('RELATO_OCUPANTE');
  novaConstatacaoDescricao = signal('');
  novaConstatacaoNome = signal('');
  novaConstatacaoIdentificacao = signal('');
  novaConstatacaoData = signal('');
  novaConstatacaoFonte = signal('');
  constatacaoPendenteConfirmacaoExclusao = signal<string | null>(null);

  metaConstatacao(t: TipoConstatacao) {
    return CONSTATACAO_META[t];
  }

  constatacoesLista = computed<Constatacao[]>(() => {
    const c = this.vistoriaAtiva()?.anamnese?.constatacoes;
    return Array.isArray(c) ? c : [];
  });

  // Modo de visualização: 'LISTA' (gerenciar vistorias) ou 'EXECUCAO' (inspecionando no local) ou 'CRIACAO' (configurando nova)
  modoExibicao = signal<'LISTA' | 'CRIACAO' | 'EXECUCAO' | 'EDICAO' | 'NORTEADORES' | 'ANAMNESE'>('LISTA');
  vistoriaEmEdicao = signal<Vistoria | null>(null);

  // Carregar os sistemas organizados da base de dados estática
  sistemasDisponiveis = computed(() => {
    const data = this.dataService.getData();
    return Object.entries(data).map(([catKey, catVal]: [string, any]) => ({
      key: catKey,
      title: catVal.title,
      subSystems: Object.entries(catVal.systems).map(([sysKey, sysVal]: [string, any]) => ({
        key: sysKey,
        title: sysVal.title,
        icon: sysVal.icon || '📋',
        typologies: sysVal.tipologias.map((t: any) => {
          // Achar patologias relacionadas a essa tipologia
          const patologiasRelacionadas = (sysVal.patologias || []).filter(
            (p: any) => p.typology_link === t.title
          );
          return {
            title: t.title,
            definicao: t.definicao,
            patologiasCount: patologiasRelacionadas.length,
            patologias: patologiasRelacionadas,
          };
        }),
      })),
    }));
  });

  // Filtro de sistemas na execução do checklist
  sistemasNoChecklistAtivo = computed(() => {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return [];
    const nomes = new Set<string>();
    ativa.items.forEach(item => nomes.add(item.systemTitle));
    return Array.from(nomes);
  });

  // Itens filtrados para exibição
  itemsExibidos = computed(() => {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return [];

    const fStatus = this.filtroStatus();
    const fSistema = this.filtroSistema();

    return ativa.items.filter(item => {
      const matchSistema = fSistema === 'TODOS' || item.systemTitle === fSistema;
      
      let matchStatus = true;
      const currentStatus = item.status === 'CONFORME' ? 'PASS' : 
                            item.status === 'NAO_CONFORME' ? 'FAIL' : 
                            item.status === 'NAO_APLICAVEL' ? 'NA' : item.status;

      if (fStatus === 'PENDENTE') matchStatus = currentStatus === 'PENDENTE';
      else if (fStatus === 'PASS') matchStatus = currentStatus === 'PASS';
      else if (fStatus === 'FAIL') matchStatus = currentStatus === 'FAIL';
      else if (fStatus === 'NA') matchStatus = currentStatus === 'NA';

      return matchSistema && matchStatus;
    });
  });

  // Estatísticas de conformidade da vistoria ativa
  estatisticasAtivas = computed(() => {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return { total: 0, avaliados: 0, conformes: 0, naoConformes: 0, naoAplicaveis: 0, pendentes: 0, percentualConclusao: 0, taxaConformidade: 0 };

    const total = ativa.items.length;
    const conformes = ativa.items.filter(i => i.status === 'PASS' || i.status === 'CONFORME').length;
    const naoConformes = ativa.items.filter(i => i.status === 'FAIL' || i.status === 'NAO_CONFORME').length;
    const naoAplicaveis = ativa.items.filter(i => i.status === 'NA' || i.status === 'NAO_APLICAVEL').length;
    const pendentes = ativa.items.filter(i => i.status === 'PENDENTE').length;
    const avaliados = total - pendentes;

    const percentualConclusao = total > 0 ? Math.round((avaliados / total) * 100) : 0;
    const avaliadosComStatusReal = conformes + naoConformes;
    const taxaConformidade = avaliadosComStatusReal > 0 ? Math.round((conformes / avaliadosComStatusReal) * 100) : 0;

    return {
      total,
      avaliados,
      conformes,
      naoConformes,
      naoAplicaveis,
      pendentes,
      percentualConclusao,
      taxaConformidade
    };
  });

  ngOnInit(): void {
    void this.carregarVistorias();
    this.carregarPerfilDoLocalStorage();
  }

  ngOnDestroy(): void {
    this.limparUrlsAnexos();
  }

  carregarPerfilDoLocalStorage(): void {
    try {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        this.userProfile.set(JSON.parse(saved));
      } else {
        // Usar padrão caso não ache
        this.userProfile.set({
          fullName: 'Emanoel Amorim',
          professionalTitle: 'Arquiteto e Urbanista',
          professionalId: 'CAU-PE 123456',
          companyName: 'AmorimTech',
          position: 'Diretor de Engenharia',
          companyCnpj: '12.345.678/0001-90',
          companyAddress: 'Recife - PE, Brasil',
        });
      }
    } catch (e) {
      console.error('Erro ao carregar perfil do localStorage', e);
    }
  }

  async carregarVistorias(): Promise<void> {
    this.carregandoVistorias.set(true);
    try {
      await this.dbService.migrarDoLocalStorageSeNecessario();
      const lista = await this.dbService.getAllVistorias();
      
      let mudouQualquerCoisa = false;
      // Mapear dados antigos e severidades ao formato canônico do Bloco 2a (ocorrencias / FichaDano)
      lista.forEach(v => {
        if (v.items) {
          v.items.forEach(item => {
            // Se o item não possui ocorrencias, inicializa e migra campos legados
            if (!item.ocorrencias) {
              item.ocorrencias = [];
              mudouQualquerCoisa = true;
            }
            const legacyItem = item as any;
            if (item.ocorrencias.length === 0) {
              if (
                legacyItem.notes !== undefined ||
                legacyItem.severity !== undefined ||
                legacyItem.id_evidencias !== undefined ||
                legacyItem.diagnostico_ia !== undefined ||
                legacyItem.quantitativo !== undefined ||
                legacyItem.memorialDescritivo !== undefined ||
                legacyItem.correlacaoFotoPatologia !== undefined ||
                legacyItem.observacaoDivergencia !== undefined ||
                legacyItem.composicoesAplicadas !== undefined
              ) {
                item.ocorrencias.push({
                  id: 'ficha-' + crypto.randomUUID(),
                  numeroFicha: 1,
                  notes: legacyItem.notes ?? '',
                  severity: legacyItem.severity,
                  id_evidencias: legacyItem.id_evidencias,
                  diagnostico_ia: legacyItem.diagnostico_ia,
                  quantitativo: legacyItem.quantitativo,
                  memorialDescritivo: legacyItem.memorialDescritivo,
                  correlacaoFotoPatologia: legacyItem.correlacaoFotoPatologia,
                  observacaoDivergencia: legacyItem.observacaoDivergencia,
                  composicoesAplicadas: legacyItem.composicoesAplicadas,
                  dateCreated: v.dateCreated,
                  dateUpdated: v.dateUpdated
                });
                
                mudouQualquerCoisa = true;

                // Limpa campos antigos
                delete legacyItem.notes;
                delete legacyItem.severity;
                delete legacyItem.id_evidencias;
                delete legacyItem.diagnostico_ia;
                delete legacyItem.quantitativo;
                delete legacyItem.memorialDescritivo;
                delete legacyItem.correlacaoFotoPatologia;
                delete legacyItem.observacaoDivergencia;
                delete legacyItem.composicoesAplicadas;
              }
            }
            
            // Normalizar severidades dentro da ficha ativa
            if (item.ocorrencias.length > 0) {
              const oc = item.ocorrencias[0];
              if (oc.severity) {
                const s = String(oc.severity).toUpperCase();
                let novaSev = oc.severity;
                if (s === 'MÍNIMA' || s === 'MINIMA') novaSev = 'Mínimo';
                else if (s === 'MÉDIA' || s === 'MEDIA') novaSev = 'Regular';
                else if (s === 'GRAVE') novaSev = 'Crítico';

                if (novaSev !== oc.severity) {
                  oc.severity = novaSev;
                  mudouQualquerCoisa = true;
                }
              }
            }
          });
        }
      });

      if (mudouQualquerCoisa) {
        await this.dbService.saveAllVistorias(lista);
      }

      // Ordenar por última atualização
      lista.sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());
      this.vistorias.set(lista);
    } catch (e) {
      console.error('Erro ao carregar vistorias do IndexedDB', e);
      this.toastService.show('Não foi possível carregar as vistorias salvas.', 'error');
    } finally {
      this.carregandoVistorias.set(false);
    }
  }

  async salvarVistorias(lista: Vistoria[]): Promise<void> {
    try {
      await this.dbService.saveAllVistorias(lista);
      this.vistorias.set(lista);
    } catch (e) {
      console.error('Erro ao salvar vistorias no IndexedDB', e);
      this.toastService.show('Erro ao salvar o progresso no IndexedDB.', 'error');
    }
  }

  private notesSaveTimer: any = null;
  private persistirComDebounce(lista: Vistoria[]): void {
    if (this.notesSaveTimer) clearTimeout(this.notesSaveTimer);
    this.notesSaveTimer = setTimeout(() => { void this.salvarVistorias(lista); }, 500);
  }

  abrirCriacao(): void {
    this.novoBuildingName.set('');
    this.novoAddress.set('');
    this.novaAreaConstruida.set('');
    this.novaIdadeEdificacao.set('');
    this.novoMemoriaDescritivo.set('');
    this.novoArtRrt.set('');
    this.novaMapaImagemBase64.set(null);
    this.novoFotosGerais.set([]);
    this.novoTipoUso.set('');
    this.novoContratanteCnpj.set('');
    this.novoContratanteRazaoSocial.set('');
    this.novoLat.set(null);
    this.novoLng.set(null);
    this.novoGpsAccuracy.set(null);
    this.selecaoSistemas.set({});
    
    // Novos campos do Bloco 2a
    this.novoSolicitanteEndereco.set('');
    this.novoResponsavelLegalNome.set('');
    this.novoResponsavelLegalDocumento.set('');
    this.novoPadraoAcabamento.set('Normal');
    this.novoNumeroPavimentos.set('');
    this.novoSistemaEstruturalPredominante.set('');
    this.novoSistemaFundacao.set('');
    this.novoHorarioFuncionamento.set('');
    this.novoNivelInspecao.set('1');
    this.novoNivelInspecaoMetodologia.set(METODOLOGIA_NIVEL['1']);
    this.novoNivelInspecaoJustificativa.set(JUSTIFICATIVA_NIVEL['1']);

    this.modoExibicao.set('CRIACAO');
    // Captura GPS em background — pronto antes de o RT terminar de preencher o formulário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.novoLat.set(pos.coords.latitude);
          this.novoLng.set(pos.coords.longitude);
          this.novoGpsAccuracy.set(pos.coords.accuracy ?? null);
        },
        () => { /* GPS indisponível — campos ficam null */ },
        { timeout: 10000, maximumAge: 30000 }
      );
    }
  }

  cancelarCriacao(): void {
    this.modoExibicao.set('LISTA');
  }

  editarVistoria(event: Event, vistoria: Vistoria): void {
    event.stopPropagation();
    this.vistoriaEmEdicao.set(vistoria);
    this.novoMemoriaDescritivo.set(vistoria.memoriaDescritivo ?? vistoria.objetoNatureza ?? '');
    this.novaAreaConstruida.set(vistoria.areaConstruida ?? '');
    this.novaIdadeEdificacao.set(vistoria.idadeEdificacao ?? '');
    this.novoArtRrt.set(vistoria.artRrtNumero ?? '');
    this.novaMapaImagemBase64.set(vistoria.mapaImagemBase64 ?? null);
    this.novoFotosGerais.set(vistoria.fotosGerais ? [...vistoria.fotosGerais] : []);
    this.novoTipoUso.set(vistoria.tipoUso ?? '');
    this.novoContratanteCnpj.set(vistoria.contratanteCnpj ?? '');
    this.novoContratanteRazaoSocial.set(vistoria.contratanteRazaoSocial ?? '');

    // Novos campos do Bloco 2a
    this.novoSolicitanteEndereco.set(vistoria.solicitanteEndereco ?? '');
    this.novoResponsavelLegalNome.set(vistoria.responsavelLegalNome ?? '');
    this.novoResponsavelLegalDocumento.set(vistoria.responsavelLegalDocumento ?? '');
    this.novoPadraoAcabamento.set(vistoria.padraoAcabamento ?? 'Normal');
    this.novoNumeroPavimentos.set(vistoria.numeroPavimentos ?? '');
    this.novoSistemaEstruturalPredominante.set(vistoria.sistemaEstruturalPredominante ?? '');
    this.novoSistemaFundacao.set(vistoria.sistemaFundacao ?? '');
    this.novoHorarioFuncionamento.set(vistoria.horarioFuncionamento ?? '');
    this.novoNivelInspecao.set(vistoria.nivelInspecao ?? '1');
    this.novoNivelInspecaoMetodologia.set(vistoria.nivelInspecaoMetodologia ?? (vistoria.nivelInspecao ? METODOLOGIA_NIVEL[vistoria.nivelInspecao] : ''));
    this.novoNivelInspecaoJustificativa.set(vistoria.nivelInspecaoJustificativa ?? (vistoria.nivelInspecao ? JUSTIFICATIVA_NIVEL[vistoria.nivelInspecao] : ''));

    this.modoExibicao.set('EDICAO');
  }

  async salvarEdicaoVistoria(): Promise<void> {
    const vistoria = this.vistoriaEmEdicao();
    if (!vistoria) return;
    const atualizada: Vistoria = {
      ...vistoria,
      memoriaDescritivo: this.novoMemoriaDescritivo().trim() || undefined,
      areaConstruida: this.novaAreaConstruida().trim() || undefined,
      idadeEdificacao: this.novaIdadeEdificacao().trim() || undefined,
      artRrtNumero: this.novoArtRrt().trim() || undefined,
      mapaImagemBase64: this.novaMapaImagemBase64() ?? undefined,
      fotosGerais: this.novoFotosGerais().length > 0 ? [...this.novoFotosGerais()] : undefined,
      tipoUso: this.novoTipoUso() || undefined,
      contratanteCnpj: this.novoContratanteCnpj().trim() || undefined,
      contratanteRazaoSocial: this.novoContratanteRazaoSocial().trim() || undefined,

      // Novos campos do Bloco 2a
      solicitanteEndereco: this.novoSolicitanteEndereco().trim() || undefined,
      responsavelLegalNome: this.novoResponsavelLegalNome().trim() || undefined,
      responsavelLegalDocumento: this.novoResponsavelLegalDocumento().trim() || undefined,
      padraoAcabamento: this.novoPadraoAcabamento(),
      numeroPavimentos: this.novoNumeroPavimentos().trim() || undefined,
      sistemaEstruturalPredominante: this.novoSistemaEstruturalPredominante().trim() || undefined,
      sistemaFundacao: this.novoSistemaFundacao().trim() || undefined,
      horarioFuncionamento: this.novoHorarioFuncionamento().trim() || undefined,
      nivelInspecao: this.novoNivelInspecao(),
      nivelInspecaoMetodologia: this.novoNivelInspecaoMetodologia().trim() || undefined,
      nivelInspecaoJustificativa: this.novoNivelInspecaoJustificativa().trim() || undefined,

      dateUpdated: new Date().toISOString(),
    };
    const lista = this.vistorias().map(v => v.id === atualizada.id ? atualizada : v);
    await this.salvarVistorias(lista);
    this.vistorias.set(lista);
    this.vistoriaEmEdicao.set(null);
    this.modoExibicao.set('LISTA');
    this.toastService.show('Dados do imóvel updated com sucesso.', 'success');
  }

  cancelarEdicao(): void {
    this.vistoriaEmEdicao.set(null);
    this.modoExibicao.set('LISTA');
  }

  toggleTypologySelecao(systemKey: string, typologyTitle: string): void {
    const key = `${systemKey}-${typologyTitle}`;
    this.selecaoSistemas.update(current => {
      const next = { ...current };
      next[key] = !next[key];
      return next;
    });
  }

  selecionarTodosSistemas(): void {
    const data = this.dataService.getData();
    const nextSelection: { [key: string]: boolean } = {};
    
    Object.entries(data).forEach(([catKey, catVal]: [string, any]) => {
      Object.entries(catVal.systems).forEach(([sysKey, sysVal]: [string, any]) => {
        sysVal.tipologias.forEach((t: any) => {
          nextSelection[`${sysKey}-${t.title}`] = true;
        });
      });
    });

    this.selecaoSistemas.set(nextSelection);
    this.toastService.show('Todas as tipologias de sistemas foram selecionadas!', 'success');
  }

  limparSelecaoSistemas(): void {
    this.selecaoSistemas.set({});
    this.toastService.show('Seleção limpa com sucesso.', 'info');
  }

  criarVistoria(): void {
    const name = this.novoBuildingName().trim();
    const address = this.novoAddress().trim();

    if (!name || !address) {
      this.toastService.show('Por favor, preencha o Nome do Edifício e o Endereço.', 'error');
      return;
    }

    // Coletar tipologias selecionadas
    const selecionados = Object.entries(this.selecaoSistemas()).filter(([_, val]) => val).map(([key, _]) => key);
    if (selecionados.length === 0) {
      this.toastService.show('Por favor, selecione ao menos uma tipologia para inspecionar.', 'error');
      return;
    }

    const items: ChecklistItem[] = [];
    const data = this.dataService.getData();

    // Mapear os dados para gerar os itens técnicos estruturados
    Object.entries(data).forEach(([catKey, catVal]: [string, any]) => {
      Object.entries(catVal.systems).forEach(([sysKey, sysVal]: [string, any]) => {
        sysVal.tipologias.forEach((t: any) => {
          const selectionKey = `${sysKey}-${t.title}`;
          if (this.selecaoSistemas()[selectionKey]) {
            // 1. Criar item básico de integridade geral para essa tipologia
            items.push({
              id: `${sysKey}-${t.title.replace(/\s+/g, '_')}-geral`,
              systemTitle: sysVal.title,
              typologyTitle: t.title,
              title: `Inspeção Geral de Integridade`,
              description: `Realizar varredura visual em busca de deformações, anomalias de acabamento ou fissuras superficiais na tecnologia: ${t.title}.`,
              status: 'PENDENTE',
              ocorrencias: []
            });

            // 2. Criar itens específicos para cada patologia cadastrada nesta tipologia
            const patologiasRelacionadas = (sysVal.patologias || []).filter(
              (p: any) => p.typology_link === t.title
            );

            patologiasRelacionadas.forEach((p: any, idx: number) => {
              items.push({
                id: `${sysKey}-${t.title.replace(/\s+/g, '_')}-pat-${idx}`,
                systemTitle: sysVal.title,
                typologyTitle: t.title,
                title: `Investigar: ${p.title}`,
                description: `Avaliar se há ocorrência de ${p.title}. Sintomas de alerta: ${p.sintomas}. Causas prováveis na vistoria: ${p.causas}.`,
                status: 'PENDENTE',
                ocorrencias: []
              });
            });
          }
        });
      });
    });

    const novaVistoria: Vistoria = {
      id: 'vistoria-' + Date.now(),
      buildingName: name,
      address: address,
      areaConstruida: this.novaAreaConstruida().trim() || undefined,
      idadeEdificacao: this.novaIdadeEdificacao().trim() || undefined,
      lat: this.novoLat() ?? undefined,
      lng: this.novoLng() ?? undefined,
      gpsAccuracy: this.novoGpsAccuracy() ?? undefined,
      memoriaDescritivo: this.novoMemoriaDescritivo().trim() || undefined,
      artRrtNumero: this.novoArtRrt().trim() || undefined,
      mapaImagemBase64: this.novaMapaImagemBase64() ?? undefined,
      fotosGerais: this.novoFotosGerais().length > 0 ? this.novoFotosGerais() : undefined,
      tipoUso: this.novoTipoUso() || undefined,
      contratanteCnpj: this.novoContratanteCnpj().trim() || undefined,
      contratanteRazaoSocial: this.novoContratanteRazaoSocial().trim() || undefined,

      // Novos campos do Bloco 2a
      solicitanteEndereco: this.novoSolicitanteEndereco().trim() || undefined,
      responsavelLegalNome: this.novoResponsavelLegalNome().trim() || undefined,
      responsavelLegalDocumento: this.novoResponsavelLegalDocumento().trim() || undefined,
      padraoAcabamento: this.novoPadraoAcabamento(),
      numeroPavimentos: this.novoNumeroPavimentos().trim() || undefined,
      sistemaEstruturalPredominante: this.novoSistemaEstruturalPredominante().trim() || undefined,
      sistemaFundacao: this.novoSistemaFundacao().trim() || undefined,
      horarioFuncionamento: this.novoHorarioFuncionamento().trim() || undefined,
      nivelInspecao: this.novoNivelInspecao(),
      nivelInspecaoMetodologia: this.novoNivelInspecaoMetodologia().trim() || undefined,
      nivelInspecaoJustificativa: this.novoNivelInspecaoJustificativa().trim() || undefined,

      contadorFichas: 0,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      progress: 0,
      items: items
    };

    const atualizadas = [novaVistoria, ...this.vistorias()];
    void this.salvarVistorias(atualizadas);
    this.vistoriaAtiva.set(novaVistoria);
    this.modoExibicao.set('EXECUCAO');
    this.filtroStatus.set('TODOS');
    this.filtroSistema.set('TODOS');
    this.toastService.show('Vistoria iniciada! Prancheta de campo gerada com sucesso.', 'success');
  }

  abrirVistoria(vistoria: Vistoria): void {
    // Carregar do array para garantir dados frescos
    const encontrada = this.vistorias().find(v => v.id === vistoria.id);
    if (encontrada) {
      this.vistoriaAtiva.set(encontrada);
      this.modoExibicao.set('EXECUCAO');
      this.filtroStatus.set('TODOS');
      this.filtroSistema.set('TODOS');
      this.toastService.show(`Retomando vistoria do ${encontrada.buildingName}`, 'info');
    }
  }

  excluirVistoria(event: Event, id: string): void {
    event.stopPropagation();
    const vistoria = this.vistorias().find(v => v.id === id);
    if (vistoria) {
      this.vistoriaParaExcluir.set(vistoria);
    }
  }

  cancelarExclusao(): void {
    this.vistoriaParaExcluir.set(null);
  }

  async confirmarExclusao(): Promise<void> {
    const alvo = this.vistoriaParaExcluir();
    if (!alvo) return;
    console.log('exclusão confirmada — removendo do IndexedDB', alvo.id);
    try {
      await this.dbService.deleteVistoria(alvo.id);            // 1) DB primeiro
    } catch (e) {
      console.error('Erro ao excluir vistoria do IndexedDB', e);
      this.toastService.show('Erro ao excluir vistoria do banco de dados.', 'error');
      return;                                                   // aborta sem mexer na lista
    }
    // 2) só após o sucesso, sincroniza memória/UI
    this.vistorias.set(this.vistorias().filter(v => v.id !== alvo.id));
    if (this.vistoriaAtiva()?.id === alvo.id) {
      this.vistoriaAtiva.set(null);
      this.modoExibicao.set('LISTA');
    }
    this.vistoriaParaExcluir.set(null);
    this.toastService.show('Vistoria excluída com sucesso.', 'success');
  }

  alterarStatusItem(itemId: string, novoStatus: 'PASS' | 'NA'): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    let temOcorrencias = false;

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId) {
        if (item.ocorrencias && item.ocorrencias.length > 0) {
          temOcorrencias = true;
          return item;
        }
        const itemAtualizado = { ...item, status: novoStatus };
        const oc = this.obterOuCriarOcorrenciaAtiva(itemAtualizado);
        delete oc.severity;
        return itemAtualizado;
      }
      return item;
    });

    if (temOcorrencias) {
      this.toastService.show('Remova as ocorrências registradas para reclassificar este item.', 'info');
      return;
    }

    this.atualizarItensVistoriaAtiva(novosItens);
    this.sinalizarSalvo(itemId);
  }

  alterarGravidadeItem(itemId: string, novaGravidade: 'Mínimo' | 'Regular' | 'Crítico'): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId && (item.status === 'FAIL' || item.status === 'NAO_CONFORME')) {
        const itemAtualizado = { ...item };
        const oc = this.obterOuCriarOcorrenciaAtiva(itemAtualizado);
        oc.severity = novaGravidade;
        return itemAtualizado;
      }
      return item;
    });

    this.atualizarItensVistoriaAtiva(novosItens);
    this.sinalizarSalvo(itemId);
  }

  toggleComposicaoItem(itemId: string, composicaoId: string): void {
    this.aplicarMudancaNoItem(itemId, it => {
      const oc = this.obterOuCriarOcorrenciaAtiva(it);
      const atuais = oc.composicoesAplicadas ?? [];
      const jaAplicada = atuais.includes(composicaoId);
      const novas = jaAplicada
        ? atuais.filter(id => id !== composicaoId)
        : [...atuais, composicaoId];
      oc.composicoesAplicadas = novas;
      return it;
    });
  }

  async abrirCaptura(item: ChecklistItem, tipo: 'contexto'|'detalhe'): Promise<void> {
    this.tipoEvidencia.set(tipo);
    this.itemCapturandoEvidencia.set(item);
    this.cameraIndisponivel.set(false);
    try {
      const stream = await this.camera.iniciar(true);
      this.streamCamera.set(stream);
    } catch (e) {
      console.error('Erro ao abrir câmera', e);
      this.cameraIndisponivel.set(true);
      this.toastService.show('Câmera indisponível. Utilize a seleção de arquivos para anexar a evidência.', 'info');
    }
  }

  fecharCaptura(): void {
    this.camera.parar();
    this.streamCamera.set(null);
    this.itemCapturandoEvidencia.set(null);
    this.capturando.set(false);
    this.analisandoIa.set(false);
    this.cameraIndisponivel.set(false);
    this.dragOver.set(false);
  }

  async processarArquivoSelecionado(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.toastService.show('Por favor, selecione um arquivo de imagem válido.', 'error');
      return;
    }

    const item = this.itemCapturandoEvidencia();
    if (!item) return;

    this.capturando.set(true);

    try {
      const blob = new Blob([file], { type: file.type });
      const geo = await this.camera.obterLocalizacao();
      const idEvidencia = crypto.randomUUID();

      const ev: Evidencia = {
        id: idEvidencia,
        blob,
        mimeType: file.type,
        tipo: this.tipoEvidencia(),
        geo,
        timestamp: new Date().toISOString(),
        id_item: item.id
      };

      await this.dbService.saveEvidencia(ev);

      this.aplicarMudancaNoItem(item.id, it => {
        const oc = this.obterOuCriarOcorrenciaAtiva(it);
        oc.id_evidencias = [...(oc.id_evidencias ?? []), idEvidencia];
        return it;
      });

      this.capturando.set(false);
      this.analisandoIa.set(true);

      const base64 = await this.blobParaBase64(blob);
      const diag = await this.analisarComGemini(item, base64);

      if (diag?.texto) {
        this.aplicarMudancaNoItem(item.id, it => {
          const oc = this.obterOuCriarOcorrenciaAtiva(it);
          oc.diagnostico_ia = diag.texto;
          oc.correlacaoFotoPatologia = diag.correlacaoFotoPatologia;
          oc.observacaoDivergencia = diag.observacaoDivergencia;

          if (diag.correlacaoFotoPatologia === 'CONFIRMADA') {
            if (diag.classificacaoTipo) {
              oc.classificacao = { tipo: diag.classificacaoTipo as any, subtipo: diag.classificacaoSubtipo as any };
            }
            oc.manifestacao = diag.manifestacao || oc.manifestacao;
            oc.causaProvavel = diag.causaProvavel || oc.causaProvavel;
            oc.recomendacaoTecnica = diag.recomendacaoTecnica || oc.recomendacaoTecnica;
            oc.criticidade = (diag.criticidadeSugerida as any) || oc.criticidade;
            oc.normasAplicaveis = this.dataService.getNormasTipologia(it.systemTitle, it.typologyTitle);
          }
          return it;
        });
      }

      const itemAtualizado = this.vistoriaAtiva()?.items.find(it => it.id === item.id);
      if (itemAtualizado) {
        const ocAtivo = this.obterOcorrenciaAtiva(itemAtualizado);
        if (diag?.severitySugerida && diag.correlacaoFotoPatologia === 'CONFIRMADA' && !ocAtivo.severity) {
          this.alterarGravidadeItem(item.id, diag.severitySugerida);
        }
      }
    } catch (e) {
      console.error('Falha no processamento do arquivo/análise', e);
      this.toastService.show('Falha ao processar arquivo ou analisar evidência.', 'error');
    } finally {
      this.analisandoIa.set(false);
      this.fecharCaptura();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      void this.processarArquivoSelecionado(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      void this.processarArquivoSelecionado(event.dataTransfer.files[0]);
    }
  }

  async gerarMemorialItem(item: ChecklistItem): Promise<void> {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    this.gerandoMemorialId.set(item.id);

    const oc = this.obterOuCriarOcorrenciaAtiva(item);
    const fotoNaoConfiavel = oc.correlacaoFotoPatologia === 'DIVERGENTE' || oc.correlacaoFotoPatologia === 'INCONCLUSIVA';

    const blocoDiagnosticoCampo = fotoNaoConfiavel
      ? `AVISO: a evidência fotográfica deste item foi classificada como ${oc.correlacaoFotoPatologia} em relação à patologia descrita (${oc.observacaoDivergencia?.trim() || 'sem observação adicional registrada'}). IGNORE totalmente esta análise de imagem — ela não corresponde à patologia do item. Baseie o diagnóstico técnico EXCLUSIVAMENTE na anotação do Responsável Técnico abaixo.`
      : (oc.diagnostico_ia?.trim() || 'Diagnóstico não gerado para este item.');

    const prompt = `Você é um engenheiro civil perito em manutenção e patologia predial, especialista em inspeção conforme ABNT NBR 16747 e ABNT NBR 5674.

INSTRUÇÃO CRÍTICA: Responda APENAS com os 6 blocos estruturados abaixo. NÃO inclua introdução, preâmbulo, saudação nem qualquer texto antes do Bloco 1. Comece diretamente com "**1. DIAGNÓSTICO TÉCNICO**".

Com base nas evidências coletadas em campo para o item abaixo, redija o Memorial Descritivo de Intervenção em português técnico do Brasil.

===== DADOS DO ITEM DE INSPEÇÃO =====
Edificação: ${ativa.buildingName}
Sistema Construtivo: ${item.systemTitle}
Tipologia: ${item.typologyTitle}
Item de Inspeção: ${item.title}
Grau de Risco (NBR 16747): ${oc.severity ?? 'Não classificado'}
Quantitativo Verificado em Campo: ${oc.quantitativo?.trim() || 'Não informado — use estimativa técnica proporcional'}

===== DIAGNÓSTICO TÉCNICO DE CAMPO =====
${blocoDiagnosticoCampo}

===== ANOTAÇÃO DO RESPONSÁVEL TÉCNICO =====
${oc.notes?.trim() || 'Sem anotação de campo.'}

===== ESTRUTURA OBRIGATÓRIA DO MEMORIAL =====

Redija exatamente os 6 blocos abaixo. Use Markdown: títulos com ** e listas com -.

**1. DIAGNÓSTICO TÉCNICO**
Com base nas evidências registradas em campo (fotografias, diagnóstico assistido por IA e anotações do Responsável Técnico), descreva a causa raiz confirmada e seu mecanismo de degradação. Esta é uma CONFIRMAÇÃO — não oriente investigação, a causa já está identificada.

**2. AÇÕES CORRETIVAS**
Procedimento de reparo passo a passo. Cada bloco de procedimento deve indicar expressamente a Classe de Ação conforme ABNT NBR 5674: "Imediata", "Necessária" ou "Preventiva". Dimensione os serviços usando o quantitativo de campo informado acima.

**3. ESPECIFICAÇÕES TÉCNICAS — CADERNO DE ENCARGOS**
Materiais, equipamentos, ferramentas e mão de obra especializada necessários (com normas técnicas e especificações do fabricante quando aplicável). Detalhar tolerâncias de execução, controles de qualidade e critérios de aceitação dos serviços.

**4. MEDIDAS PREVENTIVAS**
Ações de manutenção periódica e inspeções recomendadas para evitar reincidência após o reparo.

**5. SEGURANÇA NA EXECUÇÃO**
EPIs obrigatórios, isolamento de área, condicionantes ambientais e cuidados específicos para este tipo de serviço.

**6. NORMAS TÉCNICAS RELACIONADAS**
Liste em tabela Markdown as normas diretamente citadas nos blocos 1 a 5 deste memorial. NÃO inclua o ano da norma no código. Use EXATAMENTE este formato de tabela:

| Norma | Título e Aplicação |
|---|---|
| ABNT NBR XXXXX | Título da norma — aplicação específica no contexto desta intervenção |

Inclua apenas as normas realmente referenciadas. Mínimo 2, máximo 8.`;

    try {
      const resposta = await this.geminiService.generateText(prompt);
      const memorial = this.geminiService.sanitizeAiText(resposta);
      this.aplicarMudancaNoItem(item.id, it => {
        const o = this.obterOuCriarOcorrenciaAtiva(it);
        o.memorialDescritivo = memorial;
        return it;
      });
      this.toastService.show('Memorial descritivo gerado. Revise antes de emitir o RTIPA.', 'success');
    } catch (error) {
      console.error('Erro ao gerar memorial descritivo:', error);
      this.toastService.show('Não foi possível gerar o memorial. Tente novamente.', 'error');
    } finally {
      this.gerandoMemorialId.set(null);
    }
  }

  private comprimirImagem(dataUrl: string, maxWidth = 900, quality = 0.78): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async onFotoGeralChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const atuais = this.novoFotosGerais();
    const max = 4;
    const restante = max - atuais.length;
    if (restante <= 0) {
      this.toastService.show('Máximo de 4 fotos gerais atingido.', 'info');
      return;
    }
    for (const file of files.slice(0, restante)) {
      if (!file.type.startsWith('image/')) continue;
      await new Promise<void>(res => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const compressed = await this.comprimirImagem(dataUrl, 900, 0.78);
          this.novoFotosGerais.update(arr => [
            ...arr,
            { dataUrl: compressed, timestamp: new Date().toISOString() }
          ]);
          res();
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }

  removerFotoGeral(index: number): void {
    this.novoFotosGerais.update(arr => arr.filter((_, i) => i !== index));
  }

  onMapaImagemChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.novaMapaImagemBase64.set(result); // guarda data URL completo (inclui prefixo data:image/...)
    };
    reader.readAsDataURL(file);
  }

  private aplicarMudancaNoItem(itemId: string, updater: (item: ChecklistItem) => ChecklistItem): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId) {
        return updater(item);
      }
      return item;
    });

    this.atualizarItensVistoriaAtiva(novosItens, false);
    this.sinalizarSalvo(itemId);
  }

  private async blobParaBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async analisarComGemini(
    item: ChecklistItem,
    base64: string
  ): Promise<{ texto: string; severitySugerida?: 'Mínimo' | 'Regular' | 'Crítico';
            correlacaoFotoPatologia?: 'CONFIRMADA' | 'DIVERGENTE' | 'INCONCLUSIVA';
            observacaoDivergencia?: string;
            classificacaoTipo?: string;
            classificacaoSubtipo?: string;
            manifestacao?: string;
            causaProvavel?: string;
            recomendacaoTecnica?: string;
            criticidadeSugerida?: string; } | null> {
    try {
      const prompt = `Você é um engenheiro civil perito especializado em inspeção predial de acordo com a NBR 16747.
  Uma foto de evidência foi anexada ao seguinte item de checklist marcado como não conforme:
  - Sistema: ${item.systemTitle}
  - Tipologia: ${item.typologyTitle}
  - Item: ${item.title}
  - Descrição detalhada: ${item.description}

  PRIMEIRO, avalie se a imagem de fato retrata a patologia descrita no item acima:
  - Se retrata: correlacaoFotoPatologia = 'CONFIRMADA'. Forneça o diagnóstico técnico da anomalia visível.
  - Se retrata OUTRA patologia ou outro objeto: correlacaoFotoPatologia = 'DIVERGENTE'. Em observacaoDivergencia,
    descreva objetivamente o que a imagem mostra e por que não corresponde ao item. No campo texto, NÃO invente
    diagnóstico da patologia do item — apenas registre a divergência e recomende novo registro fotográfico.
  - Se a imagem não permite conclusão (desfocada, escura, enquadramento insuficiente):
    correlacaoFotoPatologia = 'INCONCLUSIVA'.

  Forneça também o grau de risco sugerido conforme a NBR 16747 (estritamente 'Mínimo', 'Regular' ou 'Crítico'),
  baseado APENAS no que é visível e correlacionado — em caso DIVERGENTE ou INCONCLUSIVO, sugira o grau com base
  na descrição do item, sinalizando a limitação no texto.

  Se correlacaoFotoPatologia for 'CONFIRMADA', forneça também, com base estritamente no que é visível na imagem e no contexto do item:
  - classificacaoTipo: 'ANOMALIA' (perda de desempenho por projeto/execução/vida útil/fatores externos) ou 'FALHA' (perda de desempenho por uso/operação/manutenção) — use 'INDETERMINADO' se não for possível classificar com segurança.
  - classificacaoSubtipo: se ANOMALIA, um de endogena/exogena/natural/funcional; se FALHA, um de planejamento/execucao/operacional/gerencial.
  - manifestacao: descrição objetiva do que se observa na imagem.
  - causaProvavel: hipótese técnica da origem, com base no que é visível.
  - recomendacaoTecnica: ação corretiva recomendada, em linguagem técnica objetiva.
  - criticidadeSugerida: 'P1' (crítico — risco à saúde/segurança/funcionalidade), 'P2' (médio) ou 'P3' (mínimo), conforme os patamares da NBR 16747.
  Se correlacaoFotoPatologia for 'DIVERGENTE' ou 'INCONCLUSIVA', deixe esses 6 campos como string vazia — não invente classificação para uma foto que não corresponde ao item ou que não permite conclusão.`;

      const textPart = { text: prompt };
      const imagePart = {
        inlineData: {
          data: base64,
          mimeType: 'image/jpeg',
        },
      };
      const contents = { parts: [textPart, imagePart] };

      const result = await this.geminiService.generateStructured<{
        texto: string;
        severitySugerida: 'Mínimo' | 'Regular' | 'Crítico';
        correlacaoFotoPatologia: 'CONFIRMADA' | 'DIVERGENTE' | 'INCONCLUSIVA';
        observacaoDivergencia?: string;
        classificacaoTipo?: string;
        classificacaoSubtipo?: string;
        manifestacao?: string;
        causaProvavel?: string;
        recomendacaoTecnica?: string;
        criticidadeSugerida?: string;
      }>(contents, SCHEMA_ANALISE_EVIDENCIA);

      return {
        texto: result.texto,
        severitySugerida: result.severitySugerida,
        correlacaoFotoPatologia: result.correlacaoFotoPatologia,
        observacaoDivergencia: result.observacaoDivergencia,
        classificacaoTipo: result.classificacaoTipo,
        classificacaoSubtipo: result.classificacaoSubtipo,
        manifestacao: result.manifestacao,
        causaProvavel: result.causaProvavel,
        recomendacaoTecnica: result.recomendacaoTecnica,
        criticidadeSugerida: result.criticidadeSugerida,
      };
    } catch (e) {
      console.error('Erro na chamada do Gemini:', e);
      return null;
    }
  }

  async capturarEAnalisar(): Promise<void> {
    const item = this.itemCapturandoEvidencia();
    if (!item) return;
    this.capturando.set(true);

    try {
      const blob = await this.camera.capturarBlob();
      const geo = await this.camera.obterLocalizacao();
      const idEvidencia = crypto.randomUUID();

      const ev: Evidencia = {
        id: idEvidencia,
        blob,
        mimeType: 'image/jpeg',
        tipo: this.tipoEvidencia(),
        geo,
        timestamp: new Date().toISOString(),
        id_item: item.id
      };

      await this.dbService.saveEvidencia(ev);

      this.aplicarMudancaNoItem(item.id, it => {
        const oc = this.obterOuCriarOcorrenciaAtiva(it);
        oc.id_evidencias = [...(oc.id_evidencias ?? []), idEvidencia];
        return it;
      });

      this.capturando.set(false);
      this.analisandoIa.set(true);

      const base64 = await this.blobParaBase64(blob);
      const diag = await this.analisarComGemini(item, base64);

      if (diag?.texto) {
        this.aplicarMudancaNoItem(item.id, it => {
          const oc = this.obterOuCriarOcorrenciaAtiva(it);
          oc.diagnostico_ia = diag.texto;
          oc.correlacaoFotoPatologia = diag.correlacaoFotoPatologia;
          oc.observacaoDivergencia = diag.observacaoDivergencia;

          if (diag.correlacaoFotoPatologia === 'CONFIRMADA') {
            if (diag.classificacaoTipo) {
              oc.classificacao = { tipo: diag.classificacaoTipo as any, subtipo: diag.classificacaoSubtipo as any };
            }
            oc.manifestacao = diag.manifestacao || oc.manifestacao;
            oc.causaProvavel = diag.causaProvavel || oc.causaProvavel;
            oc.recomendacaoTecnica = diag.recomendacaoTecnica || oc.recomendacaoTecnica;
            oc.criticidade = (diag.criticidadeSugerida as any) || oc.criticidade;
            oc.normasAplicaveis = this.dataService.getNormasTipologia(it.systemTitle, it.typologyTitle);
          }
          return it;
        });
      }

      const itemAtualizado = this.vistoriaAtiva()?.items.find(it => it.id === item.id);
      if (itemAtualizado) {
        const ocAtivo = this.obterOcorrenciaAtiva(itemAtualizado);
        if (diag?.severitySugerida && diag.correlacaoFotoPatologia === 'CONFIRMADA' && !ocAtivo.severity) {
          this.alterarGravidadeItem(item.id, diag.severitySugerida);
        }
      }
    } catch (e) {
      console.error('Falha na captura/análise de evidência', e);
      this.toastService.show('Falha ao capturar ou analisar a evidência.', 'error');
    } finally {
      this.analisandoIa.set(false);
      this.fecharCaptura();
    }
  }

  atualizarNotasItem(itemId: string, event: Event): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const valor = ((event.target as HTMLInputElement).value || '').trim();

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item };
        const oc = this.obterOuCriarOcorrenciaAtiva(itemAtualizado);
        oc.notes = valor;
        return itemAtualizado;
      }
      return item;
    });

    this.atualizarItensVistoriaAtiva(novosItens, true);
  }

  atualizarQuantitativoItem(itemId: string, event: Event): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const valor = ((event.target as HTMLInputElement).value || '').trim();

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item };
        const oc = this.obterOuCriarOcorrenciaAtiva(itemAtualizado);
        oc.quantitativo = valor;
        return itemAtualizado;
      }
      return item;
    });

    this.atualizarItensVistoriaAtiva(novosItens, true);
  }

  private atualizarItensVistoriaAtiva(itens: ChecklistItem[], isNotes: boolean = false): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const total = itens.length;
    const avaliados = itens.filter(i => i.status !== 'PENDENTE').length;
    const progress = total > 0 ? Math.round((avaliados / total) * 100) : 0;

    const vistoriaAtualizada: Vistoria = {
      ...ativa,
      items: itens,
      progress: progress,
      dateUpdated: new Date().toISOString()
    };

    this.vistoriaAtiva.set(vistoriaAtualizada);

    // Salvar na lista completa
    const listaAtualizada = this.vistorias().map(v => {
      if (v.id === ativa.id) {
        return vistoriaAtualizada;
      }
      return v;
    });

    if (isNotes) {
      this.vistorias.set(listaAtualizada);
      this.persistirComDebounce(listaAtualizada);
    } else {
      void this.salvarVistorias(listaAtualizada);
    }
  }

  private atualizarVistoriaAtiva(patch: Partial<Vistoria>): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;
    const atualizada: Vistoria = { ...ativa, ...patch, dateUpdated: new Date().toISOString() };
    const lista = this.vistorias().map(v => v.id === atualizada.id ? atualizada : v);
    this.vistorias.set(lista);
    this.vistoriaAtiva.set(atualizada);
    void this.salvarVistorias(lista);
  }

  voltarParaLista(): void {
    this.vistoriaAtiva.set(null);
    this.modoExibicao.set('LISTA');
    void this.carregarVistorias(); // Recarregar e ordenar
  }

  private formatarLogoMarca(nome: string | undefined): string {
    if (!nome || nome === 'AmorimTech') return 'Amorim<span>Tech</span>';
    return nome;
  }

  private normalizarCnpjExibicao(valor: string | undefined): string {
    if (!valor) return '';
    // Remove qualquer prefixo "CNPJ" já digitado pelo usuário (com ou sem dois-pontos,
    // maiúsculo ou minúsculo, com espaços variáveis) antes de reaplicar o label fixo.
    return valor.replace(/^\s*cnpj\s*:?\s*/i, '').trim();
  }

  async exportarRelatorioPDF(): Promise<void> {
    const ativa = this.vistoriaAtiva();
    const profile = this.userProfile();
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }
    if (!ativa) {
      this.toastService.show('Dados insuficientes para gerar o relatório em PDF.', 'error');
      return;
    }

    const novaJanela = window.open('', '_blank');
    if (!novaJanela) {
      alert('Popup bloqueado. Permita popups para este site e tente novamente.');
      return;
    }
    novaJanela.document.write('<html><body style="font-family:sans-serif;padding:20px">Gerando relatório, aguarde…</body></html>');

    // Pré-carregar evidências como data URL base64
    const evidenciasMap = new Map<string, { dataUrl: string; geo: any; timestamp: string; tipo: string }>();

    const itens = ativa.items ?? [];

    for (const item of itens) {
      const oc = item.ocorrencias?.[0];
      const idEvidencias = oc?.id_evidencias ?? [];
      if (idEvidencias.length) {
        for (const evId of idEvidencias) {
          try {
            const ev = await this.dbService.getEvidencia(evId);
            if (ev?.blob) {
              const base64 = await this.blobParaBase64(ev.blob);
              const dataUrl = `data:${ev.mimeType || 'image/jpeg'};base64,${base64}`;
              evidenciasMap.set(evId, {
                dataUrl,
                geo: ev.geo ?? null,
                timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleString('pt-BR') : '',
                tipo: ev.tipo ?? 'contexto'
              });
            }
          } catch {
            // evidência não encontrada — ignora silenciosamente
          }
        }
      }
    }

    const estatisticas = this.estatisticasAtivas();
    const form = { buildingName: ativa.buildingName, address: ativa.address };
    
    // Organizar itens por Sistema para renderização limpa
    const itensPorSistema: { [sistema: string]: ChecklistItem[] } = {};
    ativa.items.forEach(item => {
      if (!itensPorSistema[item.systemTitle]) {
        itensPorSistema[item.systemTitle] = [];
      }
      itensPorSistema[item.systemTitle].push(item);
    });

    let itemsHtml = '';
    Object.entries(itensPorSistema).forEach(([sistema, itens]) => {
      itemsHtml += `
        <tr class="sistema-row">
          <th colspan="4">${sistema}</th>
        </tr>
      `;
      itens.forEach(item => {
        let badgeClass = 'badge-status-pend';
        let badgeText = 'PENDENTE';
        if (item.status === 'PASS' || item.status === 'CONFORME') {
          badgeClass = 'badge-status-ok'; badgeText = 'CONFORME';
        } else if (item.status === 'FAIL' || item.status === 'NAO_CONFORME') {
          badgeClass = 'badge-status-nc';
          const qtd = item.ocorrencias?.length ?? 0;
          const criticidades = (item.ocorrencias ?? []).map(f => f.criticidade).filter(Boolean);
          const maisCritica = criticidades.includes('P1') ? 'P1' : criticidades.includes('P2') ? 'P2' : criticidades.includes('P3') ? 'P3' : null;
          const rotuloCriticidade = maisCritica ? maisCritica : (item.ocorrencias?.[0]?.severity?.toUpperCase() ?? 'PENDENTE');
          badgeText = `NÃO CONFORME · ${qtd} OCORRÊNCIA${qtd === 1 ? '' : 'S'} · ${rotuloCriticidade}`;
        } else if (item.status === 'NA' || item.status === 'NAO_APLICAVEL') {
          badgeClass = 'badge-status-na'; badgeText = 'N/A';
        }

        itemsHtml += `
          <tr>
            <td style="font-size: 0.85em;"><strong>${item.typologyTitle}</strong><br><span style="color: #666;">${item.title}</span></td>
            <td style="font-size: 0.8em; color: #555;">${item.description}</td>
            <td style="text-align: center;"><span class="${badgeClass}">${badgeText}</span></td>
          </tr>
        `;
      });
    });

    let companyInfo = '';
    if (profile.companyName) {
      companyInfo += `<p>${profile.companyName}${profile.position ? ` - ${profile.position}` : ''}</p>`;
      if (profile.companyCnpj) companyInfo += `<p>CNPJ: ${profile.companyCnpj}</p>`;
      if (profile.companyAddress) companyInfo += `<p>${profile.companyAddress}</p>`;
    }

    const secao4 = this.gerarSecao4Html(ativa);
    const secao7 = this.gerarSecao7Html(itens, evidenciasMap);
    const secao8 = this.gerarSecao8Html(itens);
    const secao9 = this.gerarSecao9Html(itens);
    const anexoI = this.gerarAnexoINorteadoresHtml(ativa);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="utf-8">
          <title>Relatório de Vistoria de Campo - ${form.buildingName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
            /* === TOKENS P4 === */
            :root {
              --p4-navy:    #132A41;
              --p4-copper:  #B5642A;
              --p4-copper-l:#E8B27E;
              --p4-bg:      #FFFFFF;
              --p4-ink:     #1A2A38;
              --p4-soft:    #4A5A66;
              --p4-faint:   #8A949C;
              --p4-rule:    #D8D0C6;
              --p4-green:   #2E7D5B;
              --p4-green-l: #E8F5EE;
              --p4-red:     #C75D45;
              --p4-red-l:   #FDECEA;
              --p4-blue:    #2C5AA0;
              --p4-blue-l:  #EBF0FA;
              --p4-amber:   #E07B39;
              --p4-amber-l: #FDF0E6;
              --p4-pend-l:  #F5F2EC;
            }

            /* === BASE === */
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
              font-size: 9.5pt;
              line-height: 1.5;
              color: #1A2A38;
              background: #fff;
              padding: 20mm;
            }
            @page {
              size: A4 portrait;
              margin: 8mm 20mm 12mm 20mm;
              @bottom-right {
                content: "Pág. " counter(page) " / " counter(pages);
                font-family: 'Inter', 'Segoe UI', sans-serif;
                font-size: 7pt;
                color: #8A949C;
              }
            }
            @media print {
              body { padding: 14mm 0 8mm 0 !important; font-size: 9pt; }
              .no-break { break-inside: avoid; page-break-inside: avoid; }
              tr { page-break-inside: avoid; }
              .print-tbody-tr, .print-tbody-td { page-break-inside: auto !important; }
            }

            /* === CABEÇALHO/RODAPÉ via TABLE — repete em TODAS as páginas no Chrome === */
            .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .print-thead-td {
              height: 13mm;
              padding: 0;
              border-bottom: 2px solid #B5642A;
              background: #fff;
            }
            .print-tfoot-td {
              height: 7mm;
              padding: 0;
              border-top: 1px solid #D8D0C6;
              background: #fff;
            }
            .print-tbody-td { padding: 0; }
            .rh-wrap {
              display: flex;
              justify-content: space-between;
              align-items: center;
              height: 13mm;
              padding: 0 1mm;
            }
            .rh-left { display: flex; align-items: center; gap: 3mm; min-width: 40mm; }
            .rh-brand {
              font-family: 'Poppins', 'Inter', sans-serif;
              font-size: 13pt; font-weight: 700;
              color: #132A41; letter-spacing: -.02em; white-space: nowrap;
            }
            .rh-brand span { color: #B5642A; }
            .rh-right { text-align: right; font-size: 7.5pt; color: #4A5A66; line-height: 1.45; }
            .rh-rt { font-weight: 700; color: #132A41; display: block; }
            .rh-company { color: #6B7280; display: block; }
            .rf-wrap {
              display: flex;
              justify-content: space-between;
              align-items: center;
              height: 7mm;
              padding: 0 1mm;
              font-size: 7.5pt;
            }
            .rf-doc { font-weight: 600; color: #132A41; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 50%; }
            .rf-prov { color: #B5642A; font-size: 7pt; font-weight: 600; }
            .rf-page { display: none; }

            /* === FONTES: carregadas no início do <style> === */

            /* === CAPA === */
            .capa {
              page-break-after: always;
              padding-bottom: 10mm;
              border-bottom: 3px solid #B5642A;
              margin-bottom: 8mm;
            }
            .capa-titulo {
              padding: 4mm 0 10mm 0;
            }
            .capa-titulo h1 {
              font-family: 'Poppins', 'Inter', sans-serif;
              font-size: 22pt;
              font-weight: 700;
              color: #132A41;
              line-height: 1.15;
              letter-spacing: -.02em;
              margin-bottom: 2mm;
            }
            .capa-titulo .sub {
              font-size: 11pt;
              color: #B5642A;
              font-weight: 500;
            }
            .capa-meta {
              border-top: 1px solid #D8D0C6;
              padding-top: 5mm;
              font-size: 9pt;
              line-height: 2;
            }
            .capa-meta b { font-weight: 600; color: #1A2A38; }
            .prov-banner {
              margin-top: 8mm;
              background: #FDECEA;
              border: 1px solid #C75D45;
              border-radius: 3px;
              padding: 4mm 6mm;
              font-size: 8pt;
              color: #C75D45;
              font-weight: 600;
            }

            /* === HEADING DE SEÇÃO === */
            .sec-h {
              display: flex;
              align-items: baseline;
              gap: 5px;
              font-family: 'Poppins', 'Inter', sans-serif;
              font-size: 13pt;
              font-weight: 700;
              color: #132A41;
              border-bottom: 3px solid #B5642A;
              padding-bottom: 2mm;
              margin: 8mm 0 4mm 0;
            }
            .sec-h .sn { color: #B5642A; }

            /* === SEÇÃO 1 — Tabela de Identificação === */
            table.t-ident {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 4mm;
            }
            table.t-ident td {
              border: 1px solid #D8D0C6;
              padding: 2.5mm 4mm;
              font-size: 9pt;
              vertical-align: top;
            }
            table.t-ident td:first-child {
              width: 40mm;
              font-weight: 600;
              color: #4A5A66;
              background: #F7F5F0;
              white-space: nowrap;
            }

            /* === SEÇÃO 5 — Síntese (KPI cards) === */
            .sintese-grid {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              gap: 3mm;
              margin: 4mm 0;
            }
            .sintese-card {
              border: 1px solid #D8D0C6;
              border-radius: 2px;
              padding: 3mm;
              text-align: center;
            }
            .sintese-card .big {
              font-family: 'Poppins', 'Inter', sans-serif;
              font-size: 18pt;
              font-weight: 700;
              color: #132A41;
              line-height: 1.1;
              display: block;
            }
            .sintese-card .big.critico { color: #C75D45; }
            .sintese-card .big.ok      { color: #2E7D5B; }
            .sintese-card .lbl {
              font-size: 6.5pt;
              text-transform: uppercase;
              letter-spacing: .08em;
              color: #8A949C;
              display: block;
              margin-top: 1mm;
            }

            /* === SEÇÃO 6 — Tabela de sistemas (zebra striping) === */
            table.t-std {
              width: 100%;
              border-collapse: collapse;
              font-size: 8.5pt;
              margin: 3mm 0;
            }
            table.t-std thead tr { background: #132A41; color: #fff; }
            table.t-std thead th {
              padding: 2.5mm 3mm;
              text-align: left;
              font-size: 7.5pt;
              font-weight: 600;
              letter-spacing: .04em;
            }
            table.t-std tbody tr:nth-child(even) { background: #F7F5F0; }
            table.t-std tbody td {
              padding: 2mm 3mm;
              border-bottom: 1px solid #D8D0C6;
              vertical-align: top;
            }
            table.t-std .sistema-row th {
              background: #E8ECF2;
              font-weight: 700;
              color: #132A41;
              font-size: 9pt;
              padding: 3mm;
              text-align: left;
            }
            .badge-status-ok  { background: #E8F5EE; color: #2E7D5B; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; display: inline-block; white-space: nowrap; }
            .badge-status-nc  { background: #FDECEA; color: #C75D45; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; display: inline-block; white-space: nowrap; }
            .badge-status-na  { background: #F5F2EC; color: #4A5A66; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; display: inline-block; white-space: nowrap; }
            .badge-status-pend{ background: #FFF8EB; color: #B77D1A; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; display: inline-block; white-space: nowrap; }

            /* === RODAPÉ PROVISÓRIO === */
            .doc-footer {
              margin-top: 10mm;
              border-top: 1px solid #D8D0C6;
              padding-top: 4mm;
              font-size: 7pt;
              color: #8A949C;
              line-height: 1.6;
            }
            .doc-footer .prov-tag {
              display: inline-block;
              background: #FDECEA;
              color: #C75D45;
              font-weight: 700;
              padding: .5mm 2mm;
              border-radius: 2px;
              font-size: 6.5pt;
              margin-right: 2mm;
              text-transform: uppercase;
            }
            .chancela-at {
              margin-top: 8mm;
              padding-top: 5mm;
              border-top: 2px solid #132A41;
              font-size: 7.5pt;
            }
            .chancela-at .at-logo {
              font-family: 'Poppins', 'Inter', sans-serif;
              font-size: 14pt;
              font-weight: 700;
              color: #132A41;
              letter-spacing: -.02em;
            }
            .chancela-at .at-logo span { color: #B5642A; }
            .chancela-at .at-txt { font-size: 7.5pt; color: #4A5A66; line-height: 1.7; }

            /* === SEÇÃO 9 — Memorial Descritivo === */
            .s9-card { border:1px solid #D8D0C6; border-radius:6px; margin-bottom:6mm; page-break-inside:avoid; overflow:hidden; }
            .s9-header { background:#132A41; color:#fff; padding:3mm 4mm; display:flex; align-items:center; gap:3mm; }
            .s9-id { font-size:9pt; font-weight:700; background:rgba(255,255,255,.15); border-radius:3px; padding:1px 5px; }
            .s9-chips { display:flex; gap:2mm; flex-wrap:wrap; }
            .s9-chip { font-size:7.5pt; background:rgba(255,255,255,.12); border-radius:3px; padding:1px 5px; }
            .s9-severity { font-size:7.5pt; margin-left:auto; padding:1.5px 6px; border-radius:3px; font-weight:700; }
            .s9-sev-min { background:#FEF3C7; color:#92400E; }
            .s9-sev-reg { background:#FFEDD5; color:#9A3412; }
            .s9-sev-cri { background:#FEE2E2; color:#991B1B; }
            .s9-sev-pend { background:#FFF8EB; color:#B77D1A; }
            .s9-title { font-size:10pt; font-weight:700; color:#132A41; padding:3mm 4mm 1.5mm; }
            .s9-body { padding:2mm 4mm 4mm; font-size:8.5pt; color:#2b2b2b; text-align:justify; }
            .s9-quant { background:#F7F5F0; border-top:1px solid #D8D0C6; padding:2mm 4mm; font-size:8pt; color:#4A5A66; }
            .s9-quant strong { color:#B5642A; }

            /* === SEÇÃO 7 (mantida intacta — não alterar estas classes) === */
            .nc-card { break-inside: avoid; border: 1px solid #B0BEC5; border-radius: 3px; margin: 5mm 0; overflow: hidden; }
            .nc-header { background: #132A41; color: #fff; padding: 2.5mm 3.5mm; display: flex; align-items: center; gap: 3mm; flex-wrap: wrap; }
            .nc-id { font-size: 9.5pt; font-weight: 700; background: rgba(255,255,255,.15); border-radius: 2px; padding: .5mm 2mm; white-space: nowrap; flex-shrink: 0; }
            .nc-chips { flex: 1; display: flex; gap: 2mm; flex-wrap: wrap; }
            .nc-chips .chip { background: rgba(255,255,255,.12); color: rgba(255,255,255,.8); }
            .chip { display: inline-block; font-size: 6.5pt; font-family: monospace; font-weight: 600; padding: .5mm 2mm; border-radius: 2px; letter-spacing: .04em; }
            .nc-status-badge { flex-shrink: 0; }
            .nc-status-badge.nc { background: #FDECEA; color: #C75D45; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; }
            .nc-status-badge.ok { background: #E8F5EE; color: #2E7D5B; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; }
            .nc-status-badge.na { background: #F5F2EC; color: #4A5A66; font-size: 7.5pt; font-weight: 700; padding: 1mm 2.5mm; border-radius: 2px; }
            .nc-title-row { background: #F4F6F8; padding: 2.5mm 3.5mm; border-bottom: 1px solid #D8D0C6; font-size: 10pt; font-weight: 600; color: #132A41; }
            .nc-fotos-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #D8D0C6; }
            .nc-foto-item { padding: 3mm; border-right: 1px solid #D8D0C6; }
            .nc-foto-item:last-child { border-right: none; }
            .sec-lbl { font-size: 7pt; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #4A5A66; display: flex; align-items: center; gap: 2mm; margin-bottom: 2mm; }
            .nc-foto-slot { width: 100%; aspect-ratio: 4/3; background: #ECEFF1; border: 1px dashed #D8D0C6; border-radius: 2px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 2mm; }
            .nc-foto-slot img { width: 100%; height: 100%; object-fit: contain; background: #ECEFF1; }
            .nc-geo { font-family: monospace; font-size: 6.5pt; color: #4A5A66; line-height: 1.6; }
            .nc-diag-full { padding: 3mm; border-bottom: 1px solid #D8D0C6; font-size: 8.5pt; line-height: 1.55; text-align: justify; }
            .nc-diag-full.divergente { background: #FDF0E6; }
            .correl-tag { font-size: 6.5pt; font-weight: 700; padding: .5mm 1.5mm; border-radius: 2px; margin-left: 1mm; text-transform: uppercase; letter-spacing: .04em; }
            .correl-tag.ok { background: #E8F5EE; color: #2E7D5B; }
            .correl-tag.div { background: #FDF0E6; color: #9A4B14; }
            .correl-tag.inc { background: #F5F2EC; color: #4A5A66; }
            .nc-notes { padding: 3mm; border-bottom: 1px solid #D8D0C6; background: #FAFAFA; font-size: 8.5pt; text-align: justify; }
            .nc-quant { padding: 2.5mm 3mm; background: #F7F5F0; font-size: 8.5pt; display: flex; align-items: center; gap: 3mm; }
            .nc-quant .ql { font-size: 7pt; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #4A5A66; }
            .nc-quant .qv { font-weight: 700; color: #1A2A38; }
            .badge { display: inline-block; font-size: 6pt; font-weight: 700; padding: .5mm 1.5mm; border-radius: 2px; letter-spacing: .06em; text-transform: uppercase; vertical-align: middle; margin-left: 1mm; }
            .badge-humano  { background: #2C5AA0; color: #fff; }
            .badge-maquina { background: #2E7D5B; color: #fff; }
            .badge-sensor  { background: #E07B39; color: #fff; }
            .sem-foto-note { padding: 3mm; background: #E8F5EE; border-bottom: 1px solid #D8D0C6; font-size: 7.5pt; color: #2E7D5B; font-style: italic; }
            .na-aviso { padding: 3mm; background: #F5F2EC; border-bottom: 1px solid #D8D0C6; font-size: 7.5pt; color: #4A5A66; font-style: italic; }
            .no-break { break-inside: avoid; page-break-inside: avoid; }
          </style>
      </head>
      <body>
          <table class="print-table">
            <!-- CABEÇALHO: repete no TOPO de TODAS as páginas (comportamento nativo do <thead> no Chrome Print) -->
            <thead>
              <tr>
                <td class="print-thead-td">
                  <div class="rh-wrap">
                    <div class="rh-left">
                      ${profile.companyLogoBase64
                        ? `<img src="${profile.companyLogoBase64}" style="max-height:10mm;max-width:50mm;object-fit:contain;">`
                        : `<span class="rh-brand">${this.formatarLogoMarca(profile.companyName)}</span>`
                      }
                    </div>
                    <div class="rh-right">
                      <span class="rh-rt">${profile.fullName} — ${profile.professionalId || ''}</span>
                      <span class="rh-company">${profile.companyName || ''}${profile.companyCnpj ? ` · CNPJ: ${profile.companyCnpj}` : ''}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>
            <!-- RODAPÉ: repete no FUNDO de TODAS as páginas -->
            <tfoot>
              <tr>
                <td class="print-tfoot-td">
                  <div class="rf-wrap">
                    <span class="rf-doc">RTIPA — ${form.buildingName.length > 45 ? form.buildingName.slice(0, 42) + '…' : form.buildingName}</span>
                    <span class="rf-prov">⚠ Documento Provisório</span>
                    <span class="rf-page"></span>
                  </div>
                </td>
              </tr>
            </tfoot>
            <!-- CONTEÚDO: todo o documento dentro de uma única célula -->
            <tbody>
              <tr class="print-tbody-tr">
                <td class="print-tbody-td">

          <!-- CAPA P4 -->
          <div class="capa">
            <div class="capa-titulo">
              <h1>Relatório Técnico de Inspeção<br>Predial e Avaliação — RTIPA</h1>
              <div class="sub">${form.buildingName}</div>
            </div>
            <div class="capa-meta">
              <b>Empreendimento:</b> ${form.buildingName}<br>
              <b>Endereço:</b> ${form.address}<br>
              <b>Responsável Técnico:</b> ${profile.fullName} — ${profile.professionalId || ''}<br>
              <b>Empresa:</b> ${profile.companyName || ''} · CNPJ: ${profile.companyCnpj || ''}<br>
              <b>Data da vistoria:</b> ${new Date(ativa.dateCreated).toLocaleDateString('pt-BR')}
            </div>
            <div class="prov-banner">
              ⚠ Documento provisório — Adquire validade técnica mediante assinatura do Responsável Técnico (ART/RRT).
            </div>
          </div>

          <!-- SEÇÃO 1 — Identificação -->
          <h2 class="sec-h"><span class="sn">1.</span> Identificação</h2>
          ${(() => {
            const tdL1 = 'background:#F7F5F0;padding:1.5mm 3mm;font-size:8pt;font-weight:600;color:#4A5A66;border:1px solid #D8D0C6;width:23%;white-space:nowrap;';
            const tdV1 = 'padding:1.5mm 3mm;font-size:8.5pt;border:1px solid #D8D0C6;width:27%;';
            let rows = '';

            // Linha 1: Empreendimento (span completo)
            rows += `<tr><td style="${tdL1}">Empreendimento</td><td colspan="3" style="${tdV1}">${form.buildingName}</td></tr>`;
            // Linha 2: Endereço (span completo)
            rows += `<tr><td style="${tdL1}">Endereço</td><td colspan="3" style="${tdV1}">${form.address}</td></tr>`;
            // Linha 3: RT + Data da vistoria
            rows += `<tr><td style="${tdL1}">Responsável Técnico</td><td style="${tdV1}">${profile.fullName} — ${profile.professionalId || ''}</td><td style="${tdL1}">Data da Vistoria</td><td style="${tdV1}">${new Date(ativa.dateCreated).toLocaleDateString('pt-BR')}</td></tr>`;
            // Linha 4: Empresa + ART/RRT
            rows += `<tr><td style="${tdL1}">Empresa / CNPJ</td><td style="${tdV1}">${profile.companyName || ''} · ${profile.companyCnpj || ''}</td>${ativa.artRrtNumero ? `<td style="${tdL1}">ART / RRT</td><td style="${tdV1}">${ativa.artRrtNumero}</td>` : `<td colspan="2" style="border:1px solid #D8D0C6;background:#fafafa;"></td>`}</tr>`;

            if (ativa.contratanteRazaoSocial) {
              rows += `<tr><td style="${tdL1}">Contratante</td><td colspan="3" style="${tdV1}">${ativa.contratanteRazaoSocial}${ativa.contratanteCnpj ? ` · CNPJ: ${this.normalizarCnpjExibicao(ativa.contratanteCnpj)}` : ''}</td></tr>`;
            }

            return `<table style="width:100%;border-collapse:collapse;margin-bottom:4mm;">${rows}</table>`;
          })()}

          <!-- SEÇÃO 2 — Objeto e Natureza -->
          <h2 class="sec-h"><span class="sn">2.</span> Objeto e Natureza da Inspeção</h2>
          <p style="font-size:9pt;line-height:1.7;text-align:justify;margin-bottom:4mm;">
            O presente Relatório Técnico de Inspeção Predial e Avaliação (RTIPA) tem por objeto a edificação denominada
            <strong>${form.buildingName}</strong>, localizada em <strong>${form.address}</strong>,
            conforme identificação e caracterização constantes das seções subsequentes.
            A inspeção foi realizada por profissional habilitado (${profile.fullName} — ${profile.professionalId || 'CAU/CREA'}),
            com emissão de Registro de Responsabilidade Técnica (RRT/ART), em conformidade com a ABNT NBR 16747:2020.
          </p>

          <!-- SEÇÃO 3 — Objetivo, Metodologia e Normas -->
          <h2 class="sec-h"><span class="sn">3.</span> Objetivo, Metodologia e Normas Técnicas</h2>
          <p style="font-size:9pt;line-height:1.7;text-align:justify;margin-bottom:4mm;">
            A inspeção tem por objetivo avaliar as condições técnicas de conservação, desempenho, segurança e
            manutenção da edificação, com classificação das anomalias segundo critérios de grau de risco
            (Mínimo, Regular e Crítico), em conformidade com a ABNT NBR 16747:2020.
            A metodologia adotada compreende inspeção visual sistêmica, registro fotográfico georreferenciado,
            análise por inteligência artificial (diagnóstico assistido) e emissão de relatório técnico estruturado
            por sistemas e tipologias prediais.
          </p>
          ${(() => {
            const sistemasUsados = [...new Set(ativa.items.map((i: any) => i.systemTitle))];
            const normas = this.dataService.getNormasParaRTIPA(sistemasUsados);
            let html = '';
            // Normas transversais
            html += `<p style="font-size:8.5pt;font-weight:600;color:#132A41;margin:3mm 0 1mm;">Normas transversais (todos os sistemas):</p>`;
            html += `<table style="width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:4mm;">`;
            html += `<thead><tr style="background:#2C5AA0;color:#fff;"><th style="padding:2mm 3mm;text-align:left;width:30%">Norma</th><th style="padding:2mm 3mm;text-align:left">Título e Aplicação</th></tr></thead><tbody>`;
            normas.transversais.forEach((n: NormaRef, idx: number) => {
              const bg = idx % 2 === 0 ? '#fff' : '#F7F5F0';
              html += `<tr style="background:${bg};"><td style="padding:2mm 3mm;font-weight:600;color:#B5642A;vertical-align:top;">${n.codigo}</td><td style="padding:2mm 3mm;vertical-align:top;">${n.titulo}</td></tr>`;
            });
            html += `</tbody></table>`;
            // Normas por sistema
            if (normas.porSistema.length > 0) {
              html += `<p style="font-size:8.5pt;font-weight:600;color:#132A41;margin:3mm 0 1mm;">Normas específicas dos sistemas inspecionados:</p>`;
              html += `<table style="width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:4mm;">`;
              html += `<thead><tr style="background:#2C5AA0;color:#fff;"><th style="padding:2mm 3mm;text-align:left;width:22%">Norma</th><th style="padding:2mm 3mm;text-align:left;width:35%">Título</th><th style="padding:2mm 3mm;text-align:left">Sistema / Aplicação</th></tr></thead><tbody>`;
              normas.porSistema.forEach((s: any) => {
                s.normasSistema.forEach((n: NormaRef, idx: number) => {
                  const bg = idx % 2 === 0 ? '#fff' : '#F7F5F0';
                  html += `<tr style="background:${bg};"><td style="padding:2mm 3mm;font-weight:600;color:#B5642A;vertical-align:top;">${n.codigo}</td><td style="padding:2mm 3mm;vertical-align:top;">${n.titulo}</td><td style="padding:2mm 3mm;vertical-align:top;color:#4A5A66;">${s.titulo} — ${n.aplicacao}</td></tr>`;
                });
              });
              html += `</tbody></table>`;
            }
            return html;
          })()}

          <!-- SEÇÃO 4 — Caracterização da Edificação -->
          ${secao4}

          <!-- SEÇÃO 5 — Síntese -->
          <h2 class="sec-h"><span class="sn">5.</span> Síntese da Inspeção</h2>
          <div class="sintese-grid">
            <div class="sintese-card">
              <span class="big">${estatisticas.total}</span>
              <span class="lbl">Itens totais</span>
            </div>
            <div class="sintese-card">
              <span class="big">${estatisticas.avaliados}</span>
              <span class="lbl">Inspecionados</span>
            </div>
            <div class="sintese-card">
              <span class="big ok">${estatisticas.conformes}</span>
              <span class="lbl">Conformes</span>
            </div>
            <div class="sintese-card">
              <span class="big critico">${estatisticas.naoConformes}</span>
              <span class="lbl">Não conformes</span>
            </div>
            <div class="sintese-card">
              <span class="big">${estatisticas.percentualConclusao}%</span>
              <span class="lbl">Conclusão</span>
            </div>
            <div class="sintese-card">
              <span class="big ok">${estatisticas.taxaConformidade}%</span>
              <span class="lbl">Conformidade</span>
            </div>
          </div>

          <!-- SEÇÃO 6 — Sistemas inspecionados -->
          <h2 class="sec-h"><span class="sn">6.</span> Sistemas Inspecionados — Tabela-Resumo</h2>
          <table class="t-std">
            <thead>
              <tr>
                <th style="width:30%">Tipologia / Item</th>
                <th style="width:50%">Procedimento e Critério de Inspeção</th>
                <th style="width:20%;text-align:center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- SEÇÃO 7 — Relatório Fotográfico -->
          ${secao7}

          <!-- SEÇÃO 8 — Orçamento de Referência -->
          ${secao8}

          <!-- SEÇÃO 9 — Plano de Ação e Memorial Descritivo -->
          ${secao9}

          <!-- ANEXO I — Documentos Norteadores -->
          ${anexoI}

          <!-- RODAPÉ P4 -->
          <div class="doc-footer">
            <span class="prov-tag">PROVISÓRIO</span>
            Documento provisório. Adquire validade técnica mediante assinatura do RT (ART/RRT).
            Emitido por: ${profile.fullName} — ${profile.professionalId || ''} — ${profile.companyName || ''}
          </div>
          <div class="chancela-at">
            <div style="display:flex;align-items:flex-start;gap:6mm;flex-wrap:wrap;">
              <div style="flex:0 0 auto;">
                <div class="at-logo" style="margin-bottom:2mm;">Amorim<span>Tech</span></div>
                <div style="font-size:7pt;color:#B5642A;font-weight:600;letter-spacing:.04em;">Ecossistema 4.0</div>
              </div>
              <div class="at-txt" style="flex:1;min-width:180px;">
                <strong style="color:#1A2A38;font-size:8pt;">Predial 4.0</strong> — Plataforma de Gestão e Inteligência Predial Avançada<br>
                Rua Leonardo Bezerra Cavalcante, 672 — Recife/PE<br>
                <span style="color:#B5642A;">emanoel@emanoelamorim.com.br</span>
                &nbsp;·&nbsp; (81) 99129-8803 <span style="color:#8A949C;">(WhatsApp)</span>
                &nbsp;·&nbsp; (81) 99928-4160 <span style="color:#8A949C;">(Ligações)</span><br>
                <a href="https://emanoelamorim.base44.app" style="color:#185fa5;font-size:7pt;">emanoelamorim.base44.app</a>
                &nbsp;·&nbsp; CNPJ: 12.345.678/0001-90<br>
                <span style="font-style:italic;color:#6B7280;font-size:7pt;">"O Predial 4.0 dá a ferramenta; o profissional assina; a AmorimTech chancela."</span>
              </div>
            </div>
          </div>
                </td>
              </tr>
            </tbody>
          </table>
      </body>
      </html>
    `;

    novaJanela.document.open();
    novaJanela.document.write(htmlContent);
    novaJanela.document.close();
    setTimeout(() => novaJanela.print(), 1500);
  }

  private gerarSecao4Html(ativa: Vistoria): string {
    const tdL = 'background:#F7F5F0;padding:1.5mm 3mm;font-size:8pt;font-weight:600;color:#4A5A66;border:1px solid #D8D0C6;width:23%;white-space:nowrap;';
    const tdV = 'padding:1.5mm 3mm;font-size:8.5pt;border:1px solid #D8D0C6;width:27%;';

    // 1) MEMORIAL DESCRITIVO — aparece primeiro
    const memoriaHtml = (ativa.memoriaDescritivo || ativa.objetoNatureza) ? `
      <div style="margin:0 0 4mm;border-left:3px solid #B5642A;padding:3mm 4mm;background:#FAFAF8;border-radius:0 4px 4px 0;page-break-inside:avoid;">
        <div style="font-size:7.5pt;font-weight:700;color:#4A5A66;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2mm;">Memorial Descritivo da Edificação</div>
        <p style="font-size:8.5pt;line-height:1.65;text-align:justify;color:#2b2b2b;margin:0;">${ativa.memoriaDescritivo || ativa.objetoNatureza}</p>
      </div>
    ` : '';

    // 2) MAPA DE LOCALIZAÇÃO
    const mapaHtml = ativa.mapaImagemBase64 ? `
      <div style="margin:3mm 0;border:1px solid #D8D0C6;border-radius:4px;overflow:hidden;page-break-inside:avoid;">
        <div style="background:#F7F5F0;padding:1.5mm 3mm;font-size:7.5pt;font-weight:600;color:#4A5A66;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #D8D0C6;">Mapa de Localização</div>
        <img src="${ativa.mapaImagemBase64}" alt="Mapa de localização" style="width:100%;max-height:85mm;object-fit:contain;display:block;">
      </div>
      <p style="font-size:7.5pt;color:#6B7280;font-style:italic;margin-bottom:3mm;">Imagem do mapa de localização gerada externamente e anexada pelo Responsável Técnico.</p>
    ` : (ativa.lat && ativa.lng) ? `
      <p style="font-size:8pt;color:#6B7280;margin-bottom:3mm;">
        Georreferenciamento capturado em campo: ${ativa.lat.toFixed(6)}, ${ativa.lng.toFixed(6)}${ativa.gpsAccuracy ? ` · ±${Math.round(ativa.gpsAccuracy)} m` : ''}.
        <a href="https://www.openstreetmap.org/?mlat=${ativa.lat}&mlon=${ativa.lng}&zoom=17" style="color:#185fa5;">Ver no OpenStreetMap</a>.
      </p>
    ` : '';

    // 3) RELATÓRIO FOTOGRÁFICO SITUACIONAL
    const fotosHtml = (ativa.fotosGerais && ativa.fotosGerais.length > 0) ? `
      <div style="margin:3mm 0;page-break-inside:avoid;">
        <div style="font-size:7.5pt;font-weight:700;color:#4A5A66;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3mm;">
          Relatório Fotográfico Situacional
          <span style="font-size:6.5pt;background:#F7F5F0;border:1px solid #D8D0C6;border-radius:3px;padding:1px 5px;font-weight:600;margin-left:3mm;">${ativa.fotosGerais.length} foto(s)</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;">
          ${ativa.fotosGerais.map((f: any, i: number) => `
            <div style="border:1px solid #D8D0C6;border-radius:4px;overflow:hidden;">
              <img src="${f.dataUrl}" alt="Foto ${i+1}" style="width:100%;max-height:55mm;object-fit:cover;display:block;">
              <div style="padding:1.5mm 2mm;font-size:7pt;color:#4A5A66;background:#F7F5F0;">Foto ${String(i+1).padStart(2,'0')} — ${new Date(f.timestamp).toLocaleString('pt-BR')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // 4) TABELA DE DADOS — pares de 2 colunas, sem Denominação nem Endereço
    const campos: { l: string; v: string }[] = [];
    if (ativa.tipoUso) campos.push({ l: 'Tipo de Uso / Tipologia', v: ativa.tipoUso });
    if (ativa.areaConstruida) campos.push({ l: 'Área Construída', v: ativa.areaConstruida });
    if (ativa.idadeEdificacao) campos.push({ l: 'Idade da Edificação', v: ativa.idadeEdificacao });
    if (ativa.artRrtNumero) campos.push({ l: 'ART / RRT', v: ativa.artRrtNumero });
    
    // Novos campos do Bloco 2a
    if (ativa.solicitanteEndereco) campos.push({ l: 'Endereço Solicitante', v: ativa.solicitanteEndereco });
    if (ativa.responsavelLegalNome) campos.push({ l: 'Responsável Legal', v: ativa.responsavelLegalNome });
    if (ativa.responsavelLegalDocumento) campos.push({ l: 'Doc. Resp. Legal', v: ativa.responsavelLegalDocumento });
    if (ativa.padraoAcabamento) campos.push({ l: 'Padrão de Acabamento', v: ativa.padraoAcabamento });
    if (ativa.numeroPavimentos) campos.push({ l: 'N° de Pavimentos', v: ativa.numeroPavimentos });
    if (ativa.sistemaEstruturalPredominante) campos.push({ l: 'Sistema Estrutural', v: ativa.sistemaEstruturalPredominante });
    if (ativa.sistemaFundacao) campos.push({ l: 'Sistema de Fundação', v: ativa.sistemaFundacao });
    if (ativa.horarioFuncionamento) campos.push({ l: 'Horário de Func.', v: ativa.horarioFuncionamento });
    if (ativa.nivelInspecao) campos.push({ l: 'Nível de Inspeção', v: `Nível ${ativa.nivelInspecao}` });
    if (ativa.nivelInspecaoMetodologia) campos.push({ l: 'Metodologia Nível', v: ativa.nivelInspecaoMetodologia });
    if (ativa.nivelInspecaoJustificativa) campos.push({ l: 'Justificativa Nível', v: ativa.nivelInspecaoJustificativa });

    if (ativa.lat && ativa.lng) {
      campos.push({ l: 'Coordenadas GPS', v: `${ativa.lat.toFixed(5)}, ${ativa.lng.toFixed(5)}${ativa.gpsAccuracy ? ` · ±${Math.round(ativa.gpsAccuracy)}m` : ''}` });
    }

    let tabelaHtml = '';
    if (campos.length > 0) {
      tabelaHtml = `<table style="width:100%;border-collapse:collapse;margin-bottom:4mm;font-size:8.5pt;">`;
      for (let i = 0; i < campos.length; i += 2) {
        const c1 = campos[i];
        const c2 = campos[i + 1];
        tabelaHtml += `<tr>
          <td style="${tdL}">${c1.l}</td><td style="${tdV}">${c1.v}</td>
          ${c2
            ? `<td style="${tdL}">${c2.l}</td><td style="${tdV}">${c2.v}</td>`
            : `<td colspan="2" style="border:1px solid #D8D0C6;background:#fafafa;"></td>`
          }
        </tr>`;
      }
      tabelaHtml += `</table>`;
    }

    return `
      <h2 class="sec-h"><span class="sn">4.</span> Caracterização da Edificação</h2>
      ${memoriaHtml}
      ${mapaHtml}
      ${fotosHtml}
      ${tabelaHtml}
    `;
  }

  private gerarSecao8Html(itens: ChecklistItem[]): string {
    const itensComOrcamento = itens.filter(
      item => (item.status === 'NAO_CONFORME' || item.status === 'FAIL') && item.ocorrencias?.[0]?.composicoesAplicadas?.length
    );

    if (itensComOrcamento.length === 0) {
      return `
        <h2 class="sec-h"><span class="sn">8.</span> Orçamento de Referência</h2>
        <p style="font-size:9pt;color:#6B7280;font-style:italic;margin-bottom:6mm;">
          Nenhuma composição de custo vinculada a itens desta vistoria. O banco de composições está em construção — quando disponível, vincule composições a cada item Não Conforme para gerar esta seção.
        </p>`;
    }

    const thS = 'background:#2C5AA0;color:#fff;padding:1.5mm 3mm;font-size:7.5pt;font-weight:700;text-align:left;border:1px solid #1a3f70;';
    const tdS = 'padding:1.5mm 3mm;font-size:8pt;border:1px solid #D8D0C6;vertical-align:top;';
    const td1S = 'padding:1.5mm 3mm;font-size:8pt;border:1px solid #D8D0C6;vertical-align:top;font-weight:600;color:#B5642A;';

    let html = `<h2 class="sec-h"><span class="sn">8.</span> Orçamento de Referência</h2>`;

    for (const item of itensComOrcamento) {
      const idx = itens.findIndex(i => i.id === item.id);
      const seqStr = String(idx + 1).padStart(2, '0');
      const oc = item.ocorrencias?.[0];

      const composicoesCalc = ((oc?.composicoesAplicadas) ?? [])
        .map(id => this.orcamentoService.getComposicao(id))
        .filter((c): c is Composicao => !!c)
        .map(c => this.orcamentoService.calcularComposicao(c));

      let totalItem = 0;
      let tabelasHtml = '';
      for (const calc of composicoesCalc) {
        totalItem += calc.totalGeral;
        const linhasInsumos = calc.insumos.map(ins => `
          <tr>
            <td style="${td1S}">${ins.tipo}</td>
            <td style="${tdS}">${ins.codigo}</td>
            <td style="${tdS}">${ins.descricao}</td>
            <td style="${tdS}">${ins.unidade}</td>
            <td style="${tdS}">${ins.coeficiente}</td>
            <td style="${tdS}">R$ ${ins.precoUnitario.toFixed(2)}</td>
            <td style="${tdS}">R$ ${(ins.coeficiente * ins.precoUnitario).toFixed(2)}</td>
          </tr>`).join('');

        const rotuloAplicado = calc.metodologia === 'TCU_BDI'
          ? `BDI ${calc.bdiPercent ?? 0}%`
          : `Fator K ${calc.fatorK ?? 1}`;

        tabelasHtml += `
          <table style="width:100%;border-collapse:collapse;margin:3mm 0;font-size:8pt;page-break-inside:avoid;">
            <thead><tr>
              <th style="${thS}">Tipo</th><th style="${thS}">Código</th><th style="${thS}">Descrição</th>
              <th style="${thS}">Unid.</th><th style="${thS}">Coef.</th><th style="${thS}">Preço Unit.</th><th style="${thS}">Subtotal</th>
            </tr></thead>
            <tbody>${linhasInsumos}</tbody>
          </table>
          <p style="font-size:8pt;text-align:right;margin:1mm 0 3mm;">
            Custo direto: R$ ${calc.custoDireto.toFixed(2)} · ${rotuloAplicado}: R$ ${calc.valorAplicado.toFixed(2)} · <strong>Total: R$ ${calc.totalGeral.toFixed(2)}</strong>
            ${calc.status === 'PENDENTE_VALIDACAO' ? ' <span style="color:#B77D1A;">(composição pendente de validação)</span>' : ''}
          </p>`;
      }

      html += `
        <div class="s9-card no-break">
          <div class="s9-header">
            <span class="s9-id">${seqStr}</span>
            <div class="s9-chips">
              <span class="s9-chip">${item.systemTitle ?? ''}</span>
              <span class="s9-chip">${item.typologyTitle ?? ''}</span>
            </div>
          </div>
          <div class="s9-title">${item.title ?? ''}</div>
          <div class="s9-body">${tabelasHtml}</div>
          <div class="s9-quant"><strong>Total do item:</strong> R$ ${totalItem.toFixed(2)}</div>
        </div>`;
    }

    return html;
  }

  private gerarSecao9Html(itens: ChecklistItem[]): string {
    const todasFichas: { item: ChecklistItem; ficha: FichaDano }[] = [];
    itens.forEach(item => {
      (item.ocorrencias ?? []).forEach(ficha => {
        todasFichas.push({ item, ficha });
      });
    });
    todasFichas.sort((a, b) => (a.ficha.numeroFicha ?? 0) - (b.ficha.numeroFicha ?? 0));

    if (todasFichas.length === 0) {
      return `
        <h2 class="sec-h"><span class="sn">9.</span> Plano de Ação e Memorial Descritivo</h2>
        <p style="font-size:9pt;color:#6B7280;font-style:italic;margin-bottom:6mm;">
          Nenhuma ocorrência registrada nesta vistoria.
        </p>`;
    }

    let html = `<h2 class="sec-h"><span class="sn">9.</span> Plano de Ação e Memorial Descritivo</h2>`;

    for (const { item, ficha } of todasFichas) {
      const seqStr = String(ficha.numeroFicha ?? 0).padStart(3, '0');

      let sevClass = 's9-sev-pend';
      let sevLabel = 'Classificação Pendente';
      if (ficha.criticidade === 'P1') { sevClass = 's9-sev-cri'; sevLabel = 'Prioridade 1 — Crítico'; }
      else if (ficha.criticidade === 'P2') { sevClass = 's9-sev-reg'; sevLabel = 'Prioridade 2 — Médio'; }
      else if (ficha.criticidade === 'P3') { sevClass = 's9-sev-min'; sevLabel = 'Prioridade 3 — Mínimo'; }

      const localizacao = (ficha.pavimento || ficha.ambiente)
        ? `${ficha.pavimento ?? ''}${ficha.pavimento && ficha.ambiente ? ' · ' : ''}${ficha.ambiente ?? ''}`
        : 'Localização não informada';

      const classificacaoTexto = ficha.classificacao?.tipo && ficha.classificacao.tipo !== 'INDETERMINADO'
        ? `${ficha.classificacao.tipo === 'ANOMALIA' ? 'Anomalia' : 'Falha'}${ficha.classificacao.subtipo ? ' — ' + ficha.classificacao.subtipo : ''}`
        : 'Não classificada';

      const normasHtml = (ficha.normasAplicaveis ?? []).length
        ? `<div class="s9-normas">${ficha.normasAplicaveis.map(n => `<span class="s9-chip">${n.codigo}</span>`).join(' ')}</div>`
        : '';

      const temCamposEstruturados = ficha.manifestacao || ficha.causaProvavel || ficha.recomendacaoTecnica;
      let corpoHtml = '';
      if (temCamposEstruturados) {
        corpoHtml = `
          ${ficha.manifestacao ? `<p><strong>Manifestação:</strong> ${ficha.manifestacao}</p>` : ''}
          ${ficha.causaProvavel ? `<p><strong>Causa provável:</strong> ${ficha.causaProvavel}</p>` : ''}
          ${ficha.recomendacaoTecnica ? `<p><strong>Recomendação técnica:</strong> ${ficha.recomendacaoTecnica}</p>` : ''}
        `;
      } else if (ficha.memorialDescritivo?.trim()) {
        corpoHtml = this.markdownParaHtmlPdf(ficha.memorialDescritivo);
      } else {
        corpoHtml = `<p style="color:#6B7280;font-style:italic;">Ficha registrada sem diagnóstico preenchido.</p>`;
      }

      const quantDisplay = ficha.quantitativo?.trim()
        ? `<div class="s9-quant"><strong>Quantitativo de campo:</strong> ${ficha.quantitativo.trim()}</div>`
        : '';

      html += `
        <div class="s9-card no-break">
          <div class="s9-header">
            <span class="s9-id">FICHA Nº ${seqStr}</span>
            <div class="s9-chips">
              <span class="s9-chip">${item.systemTitle ?? ''}</span>
              <span class="s9-chip">${item.typologyTitle ?? ''}</span>
              <span class="s9-chip">${localizacao}</span>
            </div>
            <span class="s9-severity ${sevClass}">${sevLabel}</span>
          </div>
          <div class="s9-title">${item.title ?? ''} <span style="font-weight:400;color:#6B7280;">— ${classificacaoTexto}</span></div>
          <div class="s9-body">${corpoHtml}</div>
          ${normasHtml}
          ${quantDisplay}
        </div>`;
    }

    return html;
  }

  private markdownParaHtmlPdf(text: string): string {
    if (!text) return '';

    const pStyle = 'margin:1.5mm 0 2mm;line-height:1.6;text-align:justify;font-size:8.5pt;color:#2b2b2b;';
    const h3Style = 'font-size:9pt;font-weight:800;color:#132A41;padding:1mm 0 1.5mm 3mm;margin:4mm 0 2mm;border-left:3px solid #B5642A;letter-spacing:.02em;border-bottom:1px solid #D8D0C6;';
    const liStyle = 'margin-bottom:1.5mm;color:#2b2b2b;line-height:1.55;';
    const ulStyle = 'margin:1.5mm 0 2.5mm 4mm;padding-left:4mm;list-style:disc;';

    // 0) Pré-processar tabelas Markdown (| col | col |) → <table> HTML
    const processarTabelasMd = (src: string): string => {
      const linhas = src.split('\n');
      const out: string[] = [];
      let bloco: string[] = [];

      const thS = 'background:#2C5AA0;color:#fff;padding:1.5mm 3mm;font-size:7.5pt;font-weight:700;text-align:left;border:1px solid #1a3f70;';
      const tdS = 'padding:1.5mm 3mm;font-size:8pt;border:1px solid #D8D0C6;vertical-align:top;';
      const td1S = 'padding:1.5mm 3mm;font-size:8pt;border:1px solid #D8D0C6;vertical-align:top;width:22%;font-weight:600;color:#B5642A;';

      const flush = () => {
        if (!bloco.length) return;
        // remove linha separadora (|---|---|)
        const rows = bloco.filter(l => !/^\|[\s\-:|]+\|/.test(l));
        let t = `<table style="width:100%;border-collapse:collapse;margin:3mm 0 4mm;font-size:8pt;page-break-inside:avoid;">`;
        rows.forEach((row, ri) => {
          const cells = row.split('|')
            .slice(1, -1)           // remove primeiro e último vazios
            .map(c => c.trim());
          if (ri === 0) {
            t += `<thead><tr>${cells.map(c => `<th style="${thS}">${c}</th>`).join('')}</tr></thead><tbody>`;
          } else {
            const bg = ri % 2 === 0 ? '' : 'background:#F7F5F0;';
            t += `<tr style="${bg}">${cells.map((c, ci) => `<td style="${ci === 0 ? td1S : tdS}">${c}</td>`).join('')}</tr>`;
          }
        });
        t += `</tbody></table>`;
        out.push(t);
        bloco = [];
      };

      for (const linha of linhas) {
        if (linha.trim().startsWith('|')) {
          bloco.push(linha);
        } else {
          flush();
          out.push(linha);
        }
      }
      flush();
      return out.join('\n');
    };

    text = processarTabelasMd(text);

    let html = text
      // 1) Títulos de bloco: linha inteira que é **N. TEXTO** → heading de seção
      .replace(/^\*\*(\d+[\.\s]+[^\*\n]+)\*\*\s*$/gim,
        `<h3 style="${h3Style}">$1</h3>`)
      // 2) Separador markdown --- → <hr>
      .replace(/^-{3,}\s*$/gm,
        '<hr style="border:none;border-top:1px solid #D8D0C6;margin:3mm 0;">')
      // 3) Bold inline (após headings já processados)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 4) Code inline
      .replace(/`([^`]+)`/g,
        '<code style="background:#F0EDE7;padding:1px 4px;border-radius:3px;font-size:7.5pt;">$1</code>')
      // 5) Headings markdown #
      .replace(/^### (.*$)/gim,
        '<h4 style="font-size:9pt;font-weight:700;color:#132A41;margin:3mm 0 1mm;">$1</h4>')
      .replace(/^## (.*$)/gim,
        '<h3 style="font-size:10pt;font-weight:700;color:#132A41;margin:4mm 0 1.5mm;">$1</h3>')
      // 6) Itens de lista
      .replace(/^[\*\-] (.*$)/gim, `<li style="${liStyle}">$1</li>`);

    // 7) Agrupa <li> consecutivos em <ul>
    html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>(\s*<li[^>]*>[\s\S]*?<\/li>)*)/g,
      `<ul style="${ulStyle}">$1</ul>`);
    html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');

    // 8) Parágrafos: quebras duplas de linha
    html = html.replace(/\n{2,}/g, `</p><p style="${pStyle}">`);

    return `<p style="${pStyle}">${html}</p>`;
  }

  private gerarAnexoINorteadoresHtml(ativa: Vistoria): string {
    const docs = ativa.documentosNorteadores ?? [];
    if (docs.length === 0) {
      return `
        <h2 class="sec-h" style="margin-top:8mm;page-break-before:always;"><span class="sn">A-I</span> Verificação de Documentos Norteadores</h2>
        <p style="font-size:9pt;color:#6B7280;font-style:italic;margin-bottom:6mm;">Nenhum documento norteador registrado nesta vistoria.</p>
      `;
    }

    const total = docs.length;
    const naoAplica       = docs.filter(d => d.disponibilidade === 'NA').length;
    const aAvaliar        = docs.filter(d => d.disponibilidade === 'A_AVALIAR').length;
    const disponibilizados= docs.filter(d => d.disponibilidade === 'DD').length;
    const naoDisponib     = docs.filter(d => d.disponibilidade === 'DND').length;
    const conformes       = docs.filter(d => d.disponibilidade === 'DD' && d.conformidade === 'EC').length;
    const naoConformes    = docs.filter(d => d.disponibilidade === 'DD' && d.conformidade === 'NC').length;
    const aplicaveis      = total - naoAplica;

    let veredito: string;
    let vereditoCor = '#6B7280';
    if (aplicaveis === 0) {
      veredito = 'não se aplica (nenhum documento norteador aplicável à edificação)';
    } else if (disponibilizados === aplicaveis && naoConformes === 0 && aAvaliar === 0) {
      veredito = 'CONFORMIDADE';
      vereditoCor = '#1E7A46';
    } else if (disponibilizados === 0) {
      veredito = 'NÃO CONFORMIDADE';
      vereditoCor = '#B23A48';
    } else {
      veredito = 'NÃO CONFORMIDADE PARCIAL';
      vereditoCor = '#B23A48';
    }

    let naoAplicaClausula = naoAplica > 0 ? `, dos quais ${naoAplica} não se aplicam à edificação` : '';
    let naoDisponibClausula = naoDisponib > 0 ? ` e ${naoDisponib} não disponibilizados` : '';
    let aAvaliarClausula = aAvaliar > 0 ? `, com ${aAvaliar} ainda pendente(s) de avaliação` : '';

    const sintetico = `Foram inventariados ${total} documentos norteadores${naoAplicaClausula}. ` +
      `Dos ${aplicaveis} documentos aplicáveis, ${disponibilizados} foram disponibilizados pelo responsável legal${naoDisponibClausula}${aAvaliarClausula}. ` +
      `Dentre os disponibilizados, ${conformes} encontra(m)-se em conformidade e ${naoConformes} em não conformidade. ` +
      `Diante do exposto, verifica-se que a edificação encontra-se em <strong style="color:${vereditoCor};">${veredito}</strong> ` +
      `com as boas práticas de gestão documental do uso, operação e manutenção, nos termos das ABNT NBR 5674 e NBR 14037.`;

    const thS = 'background:#2C5AA0;color:#fff;padding:1.5mm 3mm;font-size:7.5pt;font-weight:700;text-align:left;border:1px solid #1a3f70;';
    const tdS = 'padding:1.5mm 3mm;font-size:8pt;border:1px solid #D8D0C6;vertical-align:top;';

    const gruposUnicos: string[] = [];
    docs.forEach(d => {
      const g = d.grupo || 'Geral';
      if (!gruposUnicos.includes(g)) {
        gruposUnicos.push(g);
      }
    });

    const labelDisp: Record<string, string> = {
      'A_AVALIAR': 'A avaliar',
      'DD': 'Disponibilizado',
      'DND': 'Não disponibilizado',
      'NA': 'Não se aplica'
    };

    const labelConf: Record<string, string> = {
      'EC': 'Em conformidade',
      'NC': 'Não conformidade'
    };

    let tabelasHtml = '';
    for (const g of gruposUnicos) {
      const itensDoGrupo = docs.filter(d => (d.grupo || 'Geral') === g);
      let linhasHtml = '';
      let isEven = false;
      for (const item of itensDoGrupo) {
        const bg = isEven ? '#F7F5F0' : '#ffffff';
        isEven = !isEven;

        let cellDispBg = '#fff';
        let cellDispFg = '#333';
        if (item.disponibilidade === 'NA') { cellDispBg = '#f1f1f1'; cellDispFg = '#777'; }
        else if (item.disponibilidade === 'A_AVALIAR') { cellDispBg = '#fdf6e2'; cellDispFg = '#b58900'; }
        else if (item.disponibilidade === 'DND') { cellDispBg = '#fdf2f2'; cellDispFg = '#c81e1e'; }
        else if (item.disponibilidade === 'DD') { cellDispBg = '#f3faf7'; cellDispFg = '#0e6251'; }

        let cellConfBg = '#fff';
        let cellConfFg = '#333';
        let confText = '—';
        if (item.disponibilidade === 'DD') {
          if (item.conformidade === 'EC') { cellConfBg = '#eafaf1'; cellConfFg = '#1e7a46'; confText = labelConf['EC']; }
          else if (item.conformidade === 'NC') { cellConfBg = '#fdf2f2'; cellConfFg = '#b23a48'; confText = labelConf['NC']; }
          else { cellConfBg = '#fdfcf0'; cellConfFg = '#b58900'; confText = 'Pendente'; }
        }

        const anexosCount = item.anexos?.length ? `${item.anexos.length} anexo(s)` : '—';

        linhasHtml += `
          <tr style="background:${bg}">
            <td style="${tdS}">
              <div style="font-weight:600;color:#1A2A38;margin-bottom:0.5mm;">${item.descricao}</div>
              ${item.observacao ? `<div style="font-size:7.5pt;color:#6B7280;line-height:1.3">${item.observacao}</div>` : ''}
            </td>
            <td style="${tdS}background:${cellDispBg};color:${cellDispFg};font-weight:600;">${labelDisp[item.disponibilidade] || item.disponibilidade}</td>
            <td style="${tdS}background:${cellConfBg};color:${cellConfFg};font-weight:600;">${confText}</td>
            <td style="${tdS}">${anexosCount}</td>
          </tr>
        `;
      }

      tabelasHtml += `
        <div style="margin-bottom:6mm;page-break-inside:avoid;">
          <h3 style="font-size:9.5pt;font-weight:700;color:#132A41;margin:4mm 0 2mm;border-bottom:1.5px solid #132A41;padding-bottom:0.5mm;">${g}</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:2mm;">
            <thead>
              <tr>
                <th style="${thS}width:45%;">Documento</th>
                <th style="${thS}width:20%;">Disponibilidade</th>
                <th style="${thS}width:20%;">Conformidade</th>
                <th style="${thS}width:15%;">Anexos</th>
              </tr>
            </thead>
            <tbody>
              ${linhasHtml}
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      <div style="page-break-before:always;margin-top:8mm;">
        <h2 class="sec-h"><span class="sn">A-I</span> Verificação de Documentos Norteadores</h2>
        <p style="font-size:9pt;line-height:1.6;text-align:justify;color:#2b2b2b;margin:2mm 0 5mm;">
          ${sintetico}
        </p>
        ${tabelasHtml}
      </div>
    `;
  }

  private gerarSecao7Html(
    itens: ChecklistItem[],
    evidenciasMap: Map<string, { dataUrl: string; geo: any; timestamp: string; tipo: string }>
  ): string {

    let html = `
      <h2 class="sec-h"><span class="sn">7.</span> Relatório Fotográfico e Itens de Auxílio à Inspeção</h2>
    `;

    for (const item of itens) {
      const idx = itens.findIndex(i => i.id === item.id);
      const seqStr = String(idx + 1).padStart(2, '0');
      const oc = item.ocorrencias?.[0];

      // Determinar badge e classe de status
      const isNC = item.status === 'NAO_CONFORME' || item.status === 'FAIL';
      const isOK = item.status === 'CONFORME' || item.status === 'PASS';
      const isNA = item.status === 'NAO_APLICAVEL' || item.status === 'NA';

      let statusBadge = '';
      if (isNC) statusBadge = `<span class="nc-status-badge nc">NÃO CONFORME · ${oc?.severity ? oc.severity.toUpperCase() : 'PENDENTE'}</span>`;
      else if (isOK) statusBadge = `<span class="nc-status-badge ok">CONFORME</span>`;
      else if (isNA) statusBadge = `<span class="nc-status-badge na">N/A</span>`;
      else statusBadge = `<span class="nc-status-badge na">PENDENTE</span>`;

      // Separar evidências por tipo (até 2: contexto + detalhe)
      const ids = oc?.id_evidencias ?? [];
      const evContexto = ids.map((id: string) => evidenciasMap.get(id)).find(e => e?.tipo === 'contexto');
      const evDetalhe  = ids.map((id: string) => evidenciasMap.get(id)).find(e => e?.tipo === 'detalhe');
      // fallback: se só há uma foto, coloca em contexto
      const primeiraEv = ids.length > 0 ? evidenciasMap.get(ids[0]) : null;
      const ev1 = evContexto ?? primeiraEv ?? null;
      const ev2 = evDetalhe ?? (ids.length > 1 ? evidenciasMap.get(ids[1]) : null);

      const temFoto = ev1 || ev2;

      // Helper: renderiza um slot de foto
      const fotoSlotHtml = (ev: any, label: string) => {
        if (!ev) {
          return `
            <div class="nc-foto-item" style="display:flex;align-items:center;justify-content:center;padding:5px;">
              <div style="font-size:7pt;color:#8A949C;text-align:center;">Foto não registrada</div>
            </div>`;
        }
        const geoHtml = ev.geo
          ? `<div class="nc-geo">${ev.geo.lat.toFixed(5)}, ${ev.geo.lng.toFixed(5)}${ev.geo.accuracy ? ` · ±${Math.round(ev.geo.accuracy)}m` : ''}<br>${ev.timestamp}</div>`
          : `<div class="nc-geo">${ev.timestamp}</div>`;
        return `
          <div class="nc-foto-item">
            <div class="sec-lbl">${label} <span class="badge badge-sensor">SENSOR</span></div>
            <div class="nc-foto-slot">
              <img src="${ev.dataUrl}" alt="Evidência ${seqStr}">
            </div>
            ${geoHtml}
          </div>`;
      };

      // Diagnóstico IA — só item NÃO CONFORME, teto 600 chars
      let diagHtml = '';
      if (isNC && oc?.diagnostico_ia) {
        const diag = oc.diagnostico_ia.length > 600
          ? oc.diagnostico_ia.slice(0, 597) + '…'
          : oc.diagnostico_ia;

        let correlTag = '';
        let diagClass = 'nc-diag-full';
        if (oc.correlacaoFotoPatologia === 'CONFIRMADA') {
          correlTag = `<span class="correl-tag ok">✓ Correlação confirmada</span>`;
        } else if (oc.correlacaoFotoPatologia === 'DIVERGENTE') {
          correlTag = `<span class="correl-tag div">⚠ Foto divergente da patologia</span>`;
          diagClass = 'nc-diag-full divergente';
        } else if (oc.correlacaoFotoPatologia === 'INCONCLUSIVA') {
          correlTag = `<span class="correl-tag inc">? Inconclusiva</span>`;
        }

        const obsHtml = (oc.correlacaoFotoPatologia === 'DIVERGENTE' && oc.observacaoDivergencia)
          ? `<p style="font-style:italic;margin-top:2mm;">${oc.observacaoDivergencia}</p>`
          : '';

        diagHtml = `
          <div class="${diagClass}">
            <div class="sec-lbl">Diagnóstico assistido por IA <span class="badge badge-maquina">MÁQUINA</span> ${correlTag}</div>
            ${diag}
            ${obsHtml}
          </div>`;
      }

      // Anotação do RT — teto 500 chars
      const notesTexto = oc?.notes?.trim();
      const notesDisplay = notesTexto
        ? (notesTexto.length > 500 ? notesTexto.slice(0, 497) + '…' : notesTexto)
        : '<em style="color:#8A949C">Nenhuma anotação registrada.</em>';

      // Quantitativo
      const quantDisplay = oc?.quantitativo?.trim()
        ? `<span class="qv">${oc.quantitativo.trim()}</span>`
        : `<span class="qv" style="color:#8A949C;font-style:italic">—</span>`;

      // Bloco de fotos (omitir grid se sem foto E item não NC)
      let fotosHtml = '';
      if (temFoto) {
        fotosHtml = `
          <div class="nc-fotos-grid">
            ${fotoSlotHtml(ev1, 'Foto 1 — Contexto')}
            ${fotoSlotHtml(ev2, 'Foto 2 — Detalhe')}
          </div>`;
      } else if (isNA) {
        fotosHtml = `<div class="na-aviso">Item não aplicável à tipologia desta edificação.</div>`;
      } else {
        fotosHtml = `<div class="sem-foto-note">Nenhuma evidência fotográfica registrada para este item.</div>`;
      }

      html += `
        <div class="nc-card no-break">
          <div class="nc-header">
            <span class="nc-id">${seqStr}</span>
            <div class="nc-chips">
              <span class="chip">${item.systemTitle ?? ''}</span>
              <span class="chip">${item.typologyTitle ?? ''}</span>
            </div>
            ${statusBadge}
          </div>
          <div class="nc-title-row">${item.title ?? ''}</div>
          ${fotosHtml}
          ${diagHtml}
          <div class="nc-notes">
            <div class="sec-lbl">Anotação técnica do responsável <span class="badge badge-humano">HUMANO</span></div>
            ${notesDisplay}
          </div>
          <div class="nc-quant">
            <span class="ql">Quantitativo (campo)</span>
            ${quantDisplay}
          </div>
        </div>`;
    }

    return html;
  }

  async carregarUrlsAnexos(): Promise<void> {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    // Libera URLs antigas
    const urlsAtuais = this.anexoUrls();
    Object.values(urlsAtuais).forEach(url => URL.revokeObjectURL(url));

    const novasUrls: Record<string, string> = {};
    const docs = ativa.documentosNorteadores ?? [];
    for (const doc of docs) {
      for (const anexo of doc.anexos) {
        if (anexo.tipo.startsWith('image/')) {
          const ab = await this.dbService.getAnexoBlob(anexo.id);
          if (ab) {
            novasUrls[anexo.id] = URL.createObjectURL(ab.blob);
          }
        }
      }
    }

    // Carrega também as imagens da Anamnese
    for (const anexo of (ativa.anamnese?.anexos ?? [])) {
      if (anexo.tipo.startsWith('image/')) {
        const ab = await this.dbService.getAnexoBlob(anexo.id);
        if (ab) {
          novasUrls[anexo.id] = URL.createObjectURL(ab.blob);
        }
      }
    }

    this.anexoUrls.set(novasUrls);
  }

  limparUrlsAnexos(): void {
    const urlsAtuais = this.anexoUrls();
    Object.values(urlsAtuais).forEach(url => URL.revokeObjectURL(url));
    this.anexoUrls.set({});
  }

  navegarParaNorteadores(): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) {
      this.toastService.show('Selecione uma vistoria ativa para acessar os Documentos Norteadores.', 'error');
      return;
    }
    // Inicializa a lista de norteadores se necessário (semeando)
    if (!ativa.documentosNorteadores || ativa.documentosNorteadores.length === 0) {
      const seedItems: DocumentoNorteador[] = SEED_NORTEADORES_RAW.map(item => ({
        id: crypto.randomUUID(),
        grupo: item.grupo,
        descricao: item.descricao,
        seed: true,
        disponibilidade: 'A_AVALIAR',
        anexos: []
      }));
      this.atualizarVistoriaAtiva({ documentosNorteadores: seedItems });
    }
    this.modoExibicao.set('NORTEADORES');
    void this.carregarUrlsAnexos();
  }

  voltarDeNorteadores(): void {
    this.limparUrlsAnexos();
    this.modoExibicao.set('EXECUCAO');
  }

  navegarParaAnamnese(): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) {
      this.toastService.show('Selecione uma vistoria ativa para acessar a Anamnese.', 'error');
      return;
    }
    console.log('navegarParaAnamnese disparado'); // prova de evento 0.4
    if (!ativa.anamnese) {
      this.atualizarVistoriaAtiva({
        anamnese: { constatacoes: [], anexos: [] }
      });
    }
    this.modoExibicao.set('ANAMNESE');
    void this.carregarUrlsAnexos();
  }

  voltarDeAnamnese(): void {
    console.log('voltarDeAnamnese disparado'); // prova de evento 0.4
    this.limparUrlsAnexos();
    this.modoExibicao.set('EXECUCAO');
  }

  async processarAnexoAnamnese(files: FileList | null): Promise<void> {
    console.log(`processarAnexoAnamnese: ${files?.length ?? 0} arquivo(s)`); // prova 0.4
    if (!files || files.length === 0) return;
    const ativa = this.vistoriaAtiva(); if (!ativa) return;
    const novos: Anexo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]; const id = crypto.randomUUID();
      await this.dbService.saveAnexoBlob({ id, blob: file, mimeType: file.type });
      novos.push({ id, nome: file.name, tipo: file.type, tamanho: file.size, dataUpload: new Date().toISOString() });
    }
    const base = ativa.anamnese ?? { constatacoes: [], anexos: [] };
    const listaAtual = Array.isArray(base.constatacoes) ? base.constatacoes : [];
    this.atualizarVistoriaAtiva({ anamnese: { ...base, constatacoes: listaAtual, anexos: [...base.anexos, ...novos] } });
    void this.carregarUrlsAnexos();
  }

  solicitarExcluirAnexoAnamnese(anexoId: string): void {
    console.log(`solicitarExcluirAnexoAnamnese: ${anexoId}`); // prova 0.4
    if (this.anexoPendenteConfirmacaoExclusao() === anexoId) {
      void this.excluirAnexoAnamnese(anexoId);
      this.anexoPendenteConfirmacaoExclusao.set(null);
    } else {
      this.anexoPendenteConfirmacaoExclusao.set(anexoId);
      this.toastService.show('Clique novamente para confirmar a exclusão deste anexo.', 'info');
      setTimeout(() => {
        if (this.anexoPendenteConfirmacaoExclusao() === anexoId) this.anexoPendenteConfirmacaoExclusao.set(null);
      }, 3000);
    }
  }

  private async excluirAnexoAnamnese(anexoId: string): Promise<void> {
    const ativa = this.vistoriaAtiva(); if (!ativa) return;
    await this.dbService.deleteAnexoBlob(anexoId);
    const base = ativa.anamnese ?? { constatacoes: [], anexos: [] };
    const listaAtual = Array.isArray(base.constatacoes) ? base.constatacoes : [];
    this.atualizarVistoriaAtiva({ anamnese: { ...base, constatacoes: listaAtual, anexos: base.anexos.filter(a => a.id !== anexoId) } });
    this.toastService.show('Anexo excluído com sucesso.', 'success');
    void this.carregarUrlsAnexos();
  }

  salvarLegendaAnexoAnamnese(anexoId: string, legenda: string): void {
    console.log(`salvarLegendaAnexoAnamnese: ${anexoId}`); // prova 0.4
    const ativa = this.vistoriaAtiva(); if (!ativa?.anamnese) return;
    const anexos = ativa.anamnese.anexos.map(a =>
      a.id === anexoId ? { ...a, legenda: legenda.trim() || undefined } : a
    );
    this.atualizarVistoriaAtiva({ anamnese: { ...ativa.anamnese, anexos } });
  }

  vincularAnexoConstatacao(anexoId: string, constatacaoId: string): void {
    console.log(`vincularAnexoConstatacao: ${anexoId} -> ${constatacaoId}`); // prova 0.4
    const ativa = this.vistoriaAtiva(); if (!ativa?.anamnese) return;
    const anexos = ativa.anamnese.anexos.map(a =>
      a.id === anexoId ? { ...a, constatacaoId: constatacaoId || undefined } : a
    );
    this.atualizarVistoriaAtiva({ anamnese: { ...ativa.anamnese, anexos } });
  }

  rotuloConstatacaoBreve(c: Constatacao): string {
    const meta = this.metaConstatacao(c.tipo);
    const prefix = meta ? meta.rotulo : c.tipo;
    const desc = c.descricao || '';
    return `${prefix}: ${desc.slice(0, 40)}${desc.length > 40 ? '…' : ''}`;
  }

  limparRascunhoConstatacao(): void {
    this.novaConstatacaoDescricao.set('');
    this.novaConstatacaoNome.set('');
    this.novaConstatacaoIdentificacao.set('');
    this.novaConstatacaoData.set('');
    this.novaConstatacaoFonte.set('');
  }

  adicionarConstatacao(): void {
    console.log('adicionarConstatacao disparado'); // prova 0.4
    const ativa = this.vistoriaAtiva(); if (!ativa) return;
    const tipo = this.novaConstatacaoTipo();
    const descricao = this.novaConstatacaoDescricao().trim();

    if (!descricao) { this.toastService.show('Preencha o campo principal da constatação.', 'error'); return; }
    if (tipo === 'RELATO_OCUPANTE') {
      if (!this.novaConstatacaoNome().trim())          { this.toastService.show('Informe o nome do ocupante.', 'error'); return; }
      if (!this.novaConstatacaoIdentificacao().trim()) { this.toastService.show('Informe a identificação / vínculo do ocupante.', 'error'); return; }
    }
    if ((tipo === 'HISTORICO' || tipo === 'INTERVENCAO') && !this.novaConstatacaoData().trim()) {
      this.toastService.show('Informe a data / período.', 'error'); return;
    }
    if (tipo === 'PATOLOGIA_RECORRENTE' && !this.novaConstatacaoFonte().trim()) {
      this.toastService.show('Informe quem relatou / como foi verificada.', 'error'); return;
    }

    const nova: Constatacao = {
      id: crypto.randomUUID(),
      tipo,
      descricao,
      nomeOcupante:   tipo === 'RELATO_OCUPANTE' ? this.novaConstatacaoNome().trim() : undefined,
      identificacao:  tipo === 'RELATO_OCUPANTE' ? this.novaConstatacaoIdentificacao().trim() : undefined,
      data:           (tipo === 'HISTORICO' || tipo === 'INTERVENCAO') ? this.novaConstatacaoData().trim() : undefined,
      fonteRelato:    tipo === 'PATOLOGIA_RECORRENTE' ? this.novaConstatacaoFonte().trim() : undefined,
      dateCreated: new Date().toISOString(),
    };

    const base = ativa.anamnese ?? { constatacoes: [], anexos: [] };
    const listaAtual = Array.isArray(base.constatacoes) ? base.constatacoes : [];
    this.atualizarVistoriaAtiva({ anamnese: { ...base, constatacoes: [...listaAtual, nova] } });
    this.limparRascunhoConstatacao();
    this.toastService.show('Constatação adicionada.', 'success');
  }

  solicitarExcluirConstatacao(id: string): void {
    console.log(`solicitarExcluirConstatacao: ${id}`); // prova 0.4
    if (this.constatacaoPendenteConfirmacaoExclusao() === id) {
      this.excluirConstatacao(id);
      this.constatacaoPendenteConfirmacaoExclusao.set(null);
    } else {
      this.constatacaoPendenteConfirmacaoExclusao.set(id);
      this.toastService.show('Clique novamente para confirmar a exclusão.', 'info');
      setTimeout(() => {
        if (this.constatacaoPendenteConfirmacaoExclusao() === id) this.constatacaoPendenteConfirmacaoExclusao.set(null);
      }, 3000);
    }
  }

  private excluirConstatacao(id: string): void {
    const ativa = this.vistoriaAtiva(); if (!ativa) return;
    const base = ativa.anamnese ?? { constatacoes: [], anexos: [] };
    const listaAtual = Array.isArray(base.constatacoes) ? base.constatacoes : [];
    this.atualizarVistoriaAtiva({ anamnese: { ...base, constatacoes: listaAtual.filter(c => c.id !== id) } });
    this.toastService.show('Constatação excluída.', 'success');
  }

  adicionarDocumentoNorteador(): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    console.log('Botão Adicionar Documento Norteador clicado.'); // Regra 0.4: prova de clique de evento

    const novoDoc: DocumentoNorteador = {
      id: crypto.randomUUID(),
      grupo: 'Itens adicionais',
      descricao: '',
      seed: false,
      disponibilidade: 'A_AVALIAR',
      anexos: []
    };

    const atualizados = [...(ativa.documentosNorteadores ?? []), novoDoc];
    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
    this.toastService.show('Novo documento norteador adicionado.', 'success');
  }

  salvarDescricaoNorteador(docId: string, descricao: string): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const atualizados = (ativa.documentosNorteadores ?? []).map(doc => {
      if (doc.id === docId) {
        return { ...doc, descricao };
      }
      return doc;
    });

    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
  }

  setDisponibilidade(docId: string, event: Event): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const select = event.target as HTMLSelectElement;
    const value = select.value as DisponibilidadeNorteador;

    console.log(`setDisponibilidade disparado para ${docId}: ${value}`); // Prova de evento 0.4

    const atualizados = (ativa.documentosNorteadores ?? []).map(doc => {
      if (doc.id === docId) {
        const updated = { ...doc, disponibilidade: value };
        if (value !== 'DD') {
          delete updated.conformidade;
        }
        return updated;
      }
      return doc;
    });

    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
  }

  setConformidade(docId: string, event: Event): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const select = event.target as HTMLSelectElement;
    const value = (select.value || undefined) as ConformidadeNorteador | undefined;

    console.log(`setConformidade disparado para ${docId}: ${value}`); // Prova de evento 0.4

    const atualizados = (ativa.documentosNorteadores ?? []).map(doc => {
      if (doc.id === docId) {
        return { ...doc, conformidade: value };
      }
      return doc;
    });

    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
  }

  solicitarExcluirNorteador(docId: string): void {
    console.log(`solicitarExcluirNorteador disparado para: ${docId}`); // Prova de evento 0.4
    if (this.norteadorPendenteConfirmacaoExclusao() === docId) {
      this.excluirNorteador(docId);
      this.norteadorPendenteConfirmacaoExclusao.set(null);
    } else {
      this.norteadorPendenteConfirmacaoExclusao.set(docId);
      this.toastService.show('Clique novamente para confirmar a exclusão do documento norteador.', 'info');
      setTimeout(() => {
        if (this.norteadorPendenteConfirmacaoExclusao() === docId) {
          this.norteadorPendenteConfirmacaoExclusao.set(null);
        }
      }, 3000);
    }
  }

  private async excluirNorteador(docId: string): Promise<void> {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const docIndex = (ativa.documentosNorteadores ?? []).findIndex(doc => doc.id === docId);
    if (docIndex === -1) return;

    const doc = (ativa.documentosNorteadores ?? [])[docIndex];
    // Excluir os anexo blobs
    for (const anexo of doc.anexos) {
      await this.dbService.deleteAnexoBlob(anexo.id);
    }

    const atualizados = (ativa.documentosNorteadores ?? []).filter(d => d.id !== docId);
    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
    this.toastService.show('Documento norteador excluído com sucesso.', 'success');
    void this.carregarUrlsAnexos();
  }

  solicitarExcluirAnexo(docId: string, anexoId: string): void {
    console.log(`solicitarExcluirAnexo disparado para anexo: ${anexoId} no doc: ${docId}`); // Prova de evento 0.4
    if (this.anexoPendenteConfirmacaoExclusao() === anexoId) {
      void this.excluirAnexo(docId, anexoId);
      this.anexoPendenteConfirmacaoExclusao.set(null);
    } else {
      this.anexoPendenteConfirmacaoExclusao.set(anexoId);
      this.toastService.show('Clique novamente para confirmar a exclusão deste anexo.', 'info');
      setTimeout(() => {
        if (this.anexoPendenteConfirmacaoExclusao() === anexoId) {
          this.anexoPendenteConfirmacaoExclusao.set(null);
        }
      }, 3000);
    }
  }

  private async excluirAnexo(docId: string, anexoId: string): Promise<void> {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    // Excluir o blob do banco
    await this.dbService.deleteAnexoBlob(anexoId);

    const atualizados = (ativa.documentosNorteadores ?? []).map(doc => {
      if (doc.id === docId) {
        const novosAnexos = doc.anexos.filter(a => a.id !== anexoId);
        return { ...doc, anexos: novosAnexos };
      }
      return doc;
    });

    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
    this.toastService.show('Anexo excluído com sucesso.', 'success');
    void this.carregarUrlsAnexos();
  }

  async processarAnexoDocumento(docId: string, files: FileList | null): Promise<void> {
    console.log(`processarAnexoDocumento disparado para o documento ${docId}. Quantidade de arquivos: ${files?.length ?? 0}`); // Prova de evento 0.4
    if (!files || files.length === 0) return;

    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosAnexosMetadados: Anexo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = crypto.randomUUID();

      // Salvar o blob
      await this.dbService.saveAnexoBlob({
        id,
        blob: file,
        mimeType: file.type
      });

      const anexo: Anexo = {
        id,
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        dataUpload: new Date().toISOString()
      };

      novosAnexosMetadados.push(anexo);
    }

    const atualizados = (ativa.documentosNorteadores ?? []).map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          anexos: [...doc.anexos, ...novosAnexosMetadados]
        };
      }
      return doc;
    });

    this.atualizarVistoriaAtiva({ documentosNorteadores: atualizados });
    this.toastService.show(`${novosAnexosMetadados.length} anexo(s) adicionado(s) com sucesso.`, 'success');
    void this.carregarUrlsAnexos();
  }

  formatarBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
