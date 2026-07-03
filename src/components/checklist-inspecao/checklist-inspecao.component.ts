import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
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
  severity?: 'Mínimo' | 'Regular' | 'Crítico';
  notes: string;
  id_evidencias?: string[];        // chaves das fotos no store 'evidencias'
  diagnostico_ia?: string;         // texto do diagnóstico gerado pela IA
  quantitativo?: string;           // medição/quantitativo verificado em campo pelo RT
  memorialDescritivo?: string;      // plano de ação + memorial descritivo gerado pela IA (Seção 9)
  correlacaoFotoPatologia?: 'CONFIRMADA' | 'DIVERGENTE' | 'INCONCLUSIVA';
  observacaoDivergencia?: string;
  composicoesAplicadas?: string[];  // ids de Composicao (OrcamentoService) vinculadas a este item — Seção 8
}

export interface ChecklistItem {
  id: string;
  systemTitle: string;
  typologyTitle: string;
  title: string;
  description: string;
  status: 'PENDENTE' | 'PASS' | 'FAIL' | 'NA' | 'CONFORME' | 'NAO_CONFORME' | 'NAO_APLICAVEL';
  fichaDano?: FichaDano;
}

export interface FotoGeral {
  dataUrl: string;
  timestamp: string;
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
  codigoPatrimonial?: string;
  situacaoOperacional?: string;     // Em Uso / Desativado / Em Reforma / Crítico em Manutenção / Interditado
  tipoAmbiente?: string;            // Urbano / Rural / Industrial
  fotosGerais?: FotoGeral[];        // fotos situacionais da edificação (max 4, JPEG comprimidas)
  tipoUso?: string;                 // tipologia/uso da edificação (Residencial, Comercial, etc.)
  contrato?: string;                // número ou identificação do contrato
  contratanteCnpj?: string;         // CNPJ do contratante
  contratanteRazaoSocial?: string;  // razão social do contratante
  numeroOs?: string;                // número da Ordem de Serviço
  dataOs?: string;                  // data de emissão da OS
  nomeFiscal?: string;              // nome do fiscal do contrato
  matriculaFiscal?: string;         // número de matrícula do fiscal
  dateCreated: string;
  dateUpdated: string;
  progress: number;
  items: ChecklistItem[];
}

const SCHEMA_ANALISE_EVIDENCIA = {
  type: Type.OBJECT,
  properties: {
    texto: { type: Type.STRING },
    severitySugerida: { type: Type.STRING, enum: ['Mínimo', 'Regular', 'Crítico'] },
    correlacaoFotoPatologia: { type: Type.STRING, enum: ['CONFIRMADA', 'DIVERGENTE', 'INCONCLUSIVA'] },
    observacaoDivergencia: { type: Type.STRING },
  },
  required: ['texto', 'severitySugerida', 'correlacaoFotoPatologia'],
};

@Component({
  selector: 'app-checklist-inspecao',
  templateUrl: './checklist-inspecao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ChecklistInspecaoComponent implements OnInit {
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

    const ids = item.fichaDano?.id_evidencias ?? [];
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
  novoCodigoPatrimonial = signal('');
  novoSituacaoOperacional = signal('');
  novoTipoAmbiente = signal('');
  novoFotosGerais = signal<FotoGeral[]>([]);
  novoTipoUso = signal('');
  novoContrato = signal('');
  novoContratanteCnpj = signal('');
  novoContratanteRazaoSocial = signal('');
  novoNumeroOs = signal('');
  novoDataOs = signal('');
  novoNomeFiscal = signal('');
  novoMatriculaFiscal = signal('');
  novoLat = signal<number | null>(null);
  novoLng = signal<number | null>(null);
  novoGpsAccuracy = signal<number | null>(null);
  selecaoSistemas = signal<{ [key: string]: boolean }>({}); // chave: "systemKey-typologyTitle"

  // Filtros de visualização
  filtroStatus = signal<'TODOS' | 'PENDENTE' | 'PASS' | 'FAIL' | 'NA'>('TODOS');
  filtroSistema = signal<string>('TODOS');

  // Modo de visualização: 'LISTA' (gerenciar vistorias) ou 'EXECUCAO' (inspecionando no local) ou 'CRIACAO' (configurando nova)
  modoExibicao = signal<'LISTA' | 'CRIACAO' | 'EXECUCAO' | 'EDICAO'>('LISTA');
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
      // Mapear dados antigos para a Ficha de Dano (on-the-fly) e padronizar severidades
      lista.forEach(v => {
        if (v.items) {
          v.items.forEach(item => {
            if (!item.fichaDano) {
              const itemAny = item as any;
              item.fichaDano = {
                notes: itemAny.notes || '',
                severity: itemAny.severity,
                id_evidencias: itemAny.id_evidencias,
                diagnostico_ia: itemAny.diagnostico_ia,
                quantitativo: itemAny.quantitativo,
                memorialDescritivo: itemAny.memorialDescritivo,
                correlacaoFotoPatologia: itemAny.correlacaoFotoPatologia,
                observacaoDivergencia: itemAny.observacaoDivergencia,
                composicoesAplicadas: itemAny.composicoesAplicadas
              };
            }
            if (item.fichaDano.severity) {
              const s = String(item.fichaDano.severity).toUpperCase();
              if (s === 'MÍNIMA' || s === 'MINIMA') item.fichaDano.severity = 'Mínimo';
              else if (s === 'MÉDIA' || s === 'MEDIA') item.fichaDano.severity = 'Regular';
              else if (s === 'GRAVE') item.fichaDano.severity = 'Crítico';
            }
          });
        }
      });
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
    this.novoCodigoPatrimonial.set('');
    this.novoSituacaoOperacional.set('');
    this.novoTipoAmbiente.set('');
    this.novoFotosGerais.set([]);
    this.novoTipoUso.set('');
    this.novoContrato.set('');
    this.novoContratanteCnpj.set('');
    this.novoContratanteRazaoSocial.set('');
    this.novoNumeroOs.set('');
    this.novoDataOs.set('');
    this.novoNomeFiscal.set('');
    this.novoMatriculaFiscal.set('');
    this.novoLat.set(null);
    this.novoLng.set(null);
    this.novoGpsAccuracy.set(null);
    this.selecaoSistemas.set({});
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
    this.novoCodigoPatrimonial.set(vistoria.codigoPatrimonial ?? '');
    this.novoSituacaoOperacional.set(vistoria.situacaoOperacional ?? '');
    this.novoTipoAmbiente.set(vistoria.tipoAmbiente ?? '');
    this.novaMapaImagemBase64.set(vistoria.mapaImagemBase64 ?? null);
    this.novoFotosGerais.set(vistoria.fotosGerais ? [...vistoria.fotosGerais] : []);
    this.novoTipoUso.set(vistoria.tipoUso ?? '');
    this.novoContrato.set(vistoria.contrato ?? '');
    this.novoContratanteCnpj.set(vistoria.contratanteCnpj ?? '');
    this.novoContratanteRazaoSocial.set(vistoria.contratanteRazaoSocial ?? '');
    this.novoNumeroOs.set(vistoria.numeroOs ?? '');
    this.novoDataOs.set(vistoria.dataOs ?? '');
    this.novoNomeFiscal.set(vistoria.nomeFiscal ?? '');
    this.novoMatriculaFiscal.set(vistoria.matriculaFiscal ?? '');
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
      codigoPatrimonial: this.novoCodigoPatrimonial().trim() || undefined,
      situacaoOperacional: this.novoSituacaoOperacional() || undefined,
      tipoAmbiente: this.novoTipoAmbiente() || undefined,
      mapaImagemBase64: this.novaMapaImagemBase64() ?? undefined,
      fotosGerais: this.novoFotosGerais().length > 0 ? [...this.novoFotosGerais()] : undefined,
      tipoUso: this.novoTipoUso() || undefined,
      contrato: this.novoContrato().trim() || undefined,
      contratanteCnpj: this.novoContratanteCnpj().trim() || undefined,
      contratanteRazaoSocial: this.novoContratanteRazaoSocial().trim() || undefined,
      numeroOs: this.novoNumeroOs().trim() || undefined,
      dataOs: this.novoDataOs().trim() || undefined,
      nomeFiscal: this.novoNomeFiscal().trim() || undefined,
      matriculaFiscal: this.novoMatriculaFiscal().trim() || undefined,
      dateUpdated: new Date().toISOString(),
    };
    const lista = this.vistorias().map(v => v.id === atualizada.id ? atualizada : v);
    await this.salvarVistorias(lista);
    this.vistorias.set(lista);
    this.vistoriaEmEdicao.set(null);
    this.modoExibicao.set('LISTA');
    this.toastService.show('Dados do imóvel atualizados com sucesso.', 'success');
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
              fichaDano: { notes: '' }
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
                fichaDano: { notes: '' }
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
      codigoPatrimonial: this.novoCodigoPatrimonial().trim() || undefined,
      situacaoOperacional: this.novoSituacaoOperacional() || undefined,
      tipoAmbiente: this.novoTipoAmbiente() || undefined,
      fotosGerais: this.novoFotosGerais().length > 0 ? this.novoFotosGerais() : undefined,
      tipoUso: this.novoTipoUso() || undefined,
      contrato: this.novoContrato().trim() || undefined,
      contratanteCnpj: this.novoContratanteCnpj().trim() || undefined,
      contratanteRazaoSocial: this.novoContratanteRazaoSocial().trim() || undefined,
      numeroOs: this.novoNumeroOs().trim() || undefined,
      dataOs: this.novoDataOs().trim() || undefined,
      nomeFiscal: this.novoNomeFiscal().trim() || undefined,
      matriculaFiscal: this.novoMatriculaFiscal().trim() || undefined,
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

  alterarStatusItem(itemId: string, novoStatus: 'PASS' | 'FAIL' | 'NA'): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId) {
        const itemAtualizado = { ...item, status: novoStatus };
        // Resetar gravidade se mudou de falha (FAIL) para outra coisa
        if (novoStatus !== 'FAIL') {
          if (itemAtualizado.fichaDano) {
            delete itemAtualizado.fichaDano.severity;
          }
        } else {
          if (!itemAtualizado.fichaDano) {
            itemAtualizado.fichaDano = { notes: '' };
          }
          if (!itemAtualizado.fichaDano.severity) {
            // Valor padrão para não conforme
            itemAtualizado.fichaDano.severity = 'Regular';
          }
        }
        return itemAtualizado;
      }
      return item;
    });

    this.atualizarItensVistoriaAtiva(novosItens);
    this.sinalizarSalvo(itemId);
  }

  alterarGravidadeItem(itemId: string, novaGravidade: 'Mínimo' | 'Regular' | 'Crítico'): void {
    const ativa = this.vistoriaAtiva();
    if (!ativa) return;

    const novosItens = ativa.items.map(item => {
      if (item.id === itemId && (item.status === 'FAIL' || item.status === 'NAO_CONFORME')) {
        const f = item.fichaDano ?? { notes: '' };
        return { ...item, fichaDano: { ...f, severity: novaGravidade } };
      }
      return item;
    });

    this.atualizarItensVistoriaAtiva(novosItens);
    this.sinalizarSalvo(itemId);
  }

  toggleComposicaoItem(itemId: string, composicaoId: string): void {
    this.aplicarMudancaNoItem(itemId, it => {
      const f = it.fichaDano ?? { notes: '' };
      const atuais = f.composicoesAplicadas ?? [];
      const jaAplicada = atuais.includes(composicaoId);
      const novas = jaAplicada
        ? atuais.filter(id => id !== composicaoId)
        : [...atuais, composicaoId];
      return { ...it, fichaDano: { ...f, composicoesAplicadas: novas } };
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

      const f = item.fichaDano ?? { notes: '' };
      const novas = [...(f.id_evidencias ?? []), idEvidencia];
      this.aplicarMudancaNoItem(item.id, it => {
        const fIt = it.fichaDano ?? { notes: '' };
        return { ...it, fichaDano: { ...fIt, id_evidencias: novas } };
      });

      this.capturando.set(false);
      this.analisandoIa.set(true);

      const base64 = await this.blobParaBase64(blob);
      const diag = await this.analisarComGemini(item, base64);

      if (diag?.texto) {
        this.aplicarMudancaNoItem(item.id, it => {
          const fIt = it.fichaDano ?? { notes: '' };
          return {
            ...it,
            fichaDano: {
              ...fIt,
              diagnostico_ia: diag.texto,
              correlacaoFotoPatologia: diag.correlacaoFotoPatologia,
              observacaoDivergencia: diag.observacaoDivergencia,
            }
          };
        });
      }

      const itemAtualizado = this.vistoriaAtiva()?.items.find(it => it.id === item.id);
      if (diag?.severitySugerida && diag.correlacaoFotoPatologia === 'CONFIRMADA' && (!itemAtualizado || !itemAtualizado.fichaDano?.severity)) {
        this.alterarGravidadeItem(item.id, diag.severitySugerida);
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

    const f = item.fichaDano ?? { notes: '' };
    const fotoNaoConfiavel = f.correlacaoFotoPatologia === 'DIVERGENTE' || f.correlacaoFotoPatologia === 'INCONCLUSIVA';

    const blocoDiagnosticoCampo = fotoNaoConfiavel
      ? `AVISO: a evidência fotográfica deste item foi classificada como ${f.correlacaoFotoPatologia} em relação à patologia descrita (${f.observacaoDivergencia?.trim() || 'sem observação adicional registrada'}). IGNORE totalmente esta análise de imagem — ela não corresponde à patologia do item. Baseie o diagnóstico técnico EXCLUSIVAMENTE na anotação do Responsável Técnico abaixo.`
      : (f.diagnostico_ia?.trim() || 'Diagnóstico não gerado para este item.');

    const prompt = `Você é um engenheiro civil perito em manutenção e patologia predial, especialista em inspeção conforme ABNT NBR 16747 e ABNT NBR 5674.

INSTRUÇÃO CRÍTICA: Responda APENAS com os 6 blocos estruturados abaixo. NÃO inclua introdução, preâmbulo, saudação nem qualquer texto antes do Bloco 1. Comece diretamente com "**1. DIAGNÓSTICO TÉCNICO**".

Com base nas evidências coletadas em campo para o item abaixo, redija o Memorial Descritivo de Intervenção em português técnico do Brasil.

===== DADOS DO ITEM DE INSPEÇÃO =====
Edificação: ${ativa.buildingName}
Sistema Construtivo: ${item.systemTitle}
Tipologia: ${item.typologyTitle}
Item de Inspeção: ${item.title}
Grau de Risco (NBR 16747): ${f.severity ?? 'Não classificado'}
Quantitativo Verificado em Campo: ${f.quantitativo?.trim() || 'Não informado — use estimativa técnica proporcional'}

===== DIAGNÓSTICO TÉCNICO DE CAMPO =====
${blocoDiagnosticoCampo}

===== ANOTAÇÃO DO RESPONSÁVEL TÉCNICO =====
${f.notes?.trim() || 'Sem anotação de campo.'}

===== ESTRUTURA OBRIGATÓRIA DO MEMORIAL =====

Redija exatamente os 6 blocos abaixo. Use Markdown: títulos com ** e listas com -.

**1. DIAGNÓSTICO TÉCNICO**
Descreva a causa raiz confirmada e seu mecanismo de degradação baseando-se nas evidências de campo. Esta é uma CONFIRMAÇÃO — não oriente investigação.

**2. AÇÕES CORRETIVAS**
Procedimento de reparo passo a passo. Indicar Classe de Ação conforme NBR 5674: "Imediata", "Necessária" ou "Preventiva". Dimensione os serviços usando o quantitativo informado.

**3. ESPECIFICAÇÕES TÉCNICAS — CADERNO DE ENCARGOS**
Materiais, equipamentos e normas técnicas aplicadas ao reparo. Detalhar tolerâncias de execução e critérios de aceitação.

**4. MEDIDAS PREVENTIVAS**
Manutenção periódica recomendada para evitar reincidência.

**5. SEGURANÇA NA EXECUÇÃO**
EPIs, sinalização e condicionantes ambientais específicos.

**6. NORMAS TÉCNICAS RELACIONADAS**
Liste em tabela Markdown as normas diretamente citadas nos blocos 1 a 5. Não inclua o ano da norma. Formato de tabela obrigatório:

| Norma | Título e Aplicação |
|---|---|
| ABNT NBR XXXXX | Título da norma — aplicação específica no contexto desta intervenção |

Mínimo 2, máximo 8 normas.`;

    try {
      const resposta = await this.geminiService.generateText(prompt);
      const memorial = this.geminiService.sanitizeAiText(resposta);
      this.aplicarMudancaNoItem(item.id, it => {
        const fIt = it.fichaDano ?? { notes: '' };
        return { ...it, fichaDano: { ...fIt, memorialDescritivo: memorial } };
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
            observacaoDivergencia?: string } | null> {
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
  na descrição do item, sinalizando a limitação no texto.`;

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
      }>(contents, SCHEMA_ANALISE_EVIDENCIA);

      return {
        texto: result.texto,
        severitySugerida: result.severitySugerida,
        correlacaoFotoPatologia: result.correlacaoFotoPatologia,
        observacaoDivergencia: result.observacaoDivergencia,
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

      const f = item.fichaDano ?? { notes: '' };
      const novas = [...(f.id_evidencias ?? []), idEvidencia];
      this.aplicarMudancaNoItem(item.id, it => {
        const fIt = it.fichaDano ?? { notes: '' };
        return { ...it, fichaDano: { ...fIt, id_evidencias: novas } };
      });

      this.capturando.set(false);
      this.analisandoIa.set(true);

      const base64 = await this.blobParaBase64(blob);
      const diag = await this.analisarComGemini(item, base64);

      if (diag?.texto) {
        this.aplicarMudancaNoItem(item.id, it => {
          const fIt = it.fichaDano ?? { notes: '' };
          return {
            ...it,
            fichaDano: {
              ...fIt,
              diagnostico_ia: diag.texto,
              correlacaoFotoPatologia: diag.correlacaoFotoPatologia,
              observacaoDivergencia: diag.observacaoDivergencia,
            }
          };
        });
      }

      const itemAtualizado = this.vistoriaAtiva()?.items.find(it => it.id === item.id);
      if (diag?.severitySugerida && diag.correlacaoFotoPatologia === 'CONFIRMADA' && (!itemAtualizado || !itemAtualizado.fichaDano?.severity)) {
        this.alterarGravidadeItem(item.id, diag.severitySugerida);
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
        const f = item.fichaDano ?? { notes: '' };
        return { ...item, fichaDano: { ...f, notes: valor } };
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
        const f = item.fichaDano ?? { notes: '' };
        return { ...item, fichaDano: { ...f, quantitativo: valor } };
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
      if (item.fichaDano?.id_evidencias?.length) {
        for (const evId of item.fichaDano.id_evidencias) {
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
          badgeText = `NÃO CONFORME · ${item.fichaDano?.severity ? item.fichaDano.severity.toUpperCase() : 'PENDENTE'}`;
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

            // Campos de contrato (somente se preenchidos)
            if (ativa.contrato || ativa.numeroOs) {
              rows += `<tr><td style="${tdL1}">Contrato</td><td style="${tdV1}">${ativa.contrato || '—'}</td><td style="${tdL1}">N° OS</td><td style="${tdV1}">${ativa.numeroOs || '—'}</td></tr>`;
            }
            if (ativa.dataOs || ativa.contratanteRazaoSocial) {
              rows += `<tr><td style="${tdL1}">Contratante</td><td style="${tdV1}">${ativa.contratanteRazaoSocial || '—'}${ativa.contratanteCnpj ? `<br><span style="font-size:7.5pt;color:#4A5A66;">CNPJ: ${this.normalizarCnpjExibicao(ativa.contratanteCnpj)}</span>` : ''}</td><td style="${tdL1}">Data da OS</td><td style="${tdV1}">${ativa.dataOs || '—'}</td></tr>`;
            }
            if (ativa.nomeFiscal || ativa.matriculaFiscal) {
              rows += `<tr><td style="${tdL1}">Fiscal do Contrato</td><td style="${tdV1}">${ativa.nomeFiscal || '—'}</td><td style="${tdL1}">Matrícula</td><td style="${tdV1}">${ativa.matriculaFiscal || '—'}</td></tr>`;
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
    if (ativa.codigoPatrimonial) campos.push({ l: 'Cód. Patrimonial', v: ativa.codigoPatrimonial });
    if (ativa.areaConstruida) campos.push({ l: 'Área Construída', v: ativa.areaConstruida });
    if (ativa.idadeEdificacao) campos.push({ l: 'Idade da Edificação', v: ativa.idadeEdificacao });
    if (ativa.artRrtNumero) campos.push({ l: 'ART / RRT', v: ativa.artRrtNumero });
    if (ativa.situacaoOperacional) campos.push({ l: 'Situação Operacional', v: ativa.situacaoOperacional });
    if (ativa.tipoAmbiente) campos.push({ l: 'Tipo de Ambiente', v: ativa.tipoAmbiente });
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
      item => (item.status === 'NAO_CONFORME' || item.status === 'FAIL') && item.fichaDano?.composicoesAplicadas?.length
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

      const composicoesCalc = (item.fichaDano?.composicoesAplicadas ?? [])
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
    const itensComMemorial = itens.filter(
      item => (item.status === 'NAO_CONFORME' || item.status === 'FAIL') && item.fichaDano?.memorialDescritivo?.trim()
    );

    if (itensComMemorial.length === 0) {
      return `
        <h2 class="sec-h"><span class="sn">9.</span> Plano de Ação e Memorial Descritivo</h2>
        <p style="font-size:9pt;color:#6B7280;font-style:italic;margin-bottom:6mm;">
          Nenhum memorial descritivo gerado para esta vistoria. Para gerar, acesse cada item Não Conforme na Vistoria RTIPA e clique em "Gerar Memorial Descritivo".
        </p>`;
    }

    let html = `<h2 class="sec-h"><span class="sn">9.</span> Plano de Ação e Memorial Descritivo</h2>`;

    for (const item of itensComMemorial) {
      const idx = itens.findIndex(i => i.id === item.id);
      const seqStr = String(idx + 1).padStart(2, '0');

      let sevClass = '';
      let sevLabel = '';
      const sev = item.fichaDano?.severity;
      if (sev === 'Mínimo') { sevClass = 's9-sev-min'; sevLabel = 'Risco Mínimo'; }
      else if (sev === 'Regular') { sevClass = 's9-sev-reg'; sevLabel = 'Risco Regular'; }
      else if (sev === 'Crítico') { sevClass = 's9-sev-cri'; sevLabel = 'Risco Crítico'; }
      else { sevClass = 's9-sev-pend'; sevLabel = 'Classificação Pendente'; }

      const quantDisplay = item.fichaDano?.quantitativo?.trim()
        ? `<div class="s9-quant"><strong>Quantitativo de campo:</strong> ${item.fichaDano.quantitativo.trim()}</div>`
        : '';

      const memorialHtml = this.markdownParaHtmlPdf(item.fichaDano?.memorialDescritivo ?? '');

      html += `
        <div class="s9-card no-break">
          <div class="s9-header">
            <span class="s9-id">${seqStr}</span>
            <div class="s9-chips">
              <span class="s9-chip">${item.systemTitle ?? ''}</span>
              <span class="s9-chip">${item.typologyTitle ?? ''}</span>
            </div>
            ${sevLabel ? `<span class="s9-severity ${sevClass}">${sevLabel}</span>` : ''}
          </div>
          <div class="s9-title">${item.title ?? ''}</div>
          <div class="s9-body">${memorialHtml}</div>
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

      const f = item.fichaDano ?? { notes: '' };

      // Determinar badge e classe de status
      const isNC = item.status === 'NAO_CONFORME' || item.status === 'FAIL';
      const isOK = item.status === 'CONFORME' || item.status === 'PASS';
      const isNA = item.status === 'NAO_APLICAVEL' || item.status === 'NA';

      let statusBadge = '';
      if (isNC) statusBadge = `<span class="nc-status-badge nc">NÃO CONFORME · ${f.severity ? f.severity.toUpperCase() : 'PENDENTE'}</span>`;
      else if (isOK) statusBadge = `<span class="nc-status-badge ok">CONFORME</span>`;
      else if (isNA) statusBadge = `<span class="nc-status-badge na">N/A</span>`;
      else statusBadge = `<span class="nc-status-badge na">PENDENTE</span>`;

      // Separar evidências por tipo (até 2: contexto + detalhe)
      const ids = f.id_evidencias ?? [];
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
      if (isNC && f.diagnostico_ia) {
        const diag = f.diagnostico_ia.length > 600
          ? f.diagnostico_ia.slice(0, 597) + '…'
          : f.diagnostico_ia;

        let correlTag = '';
        let diagClass = 'nc-diag-full';
        if (f.correlacaoFotoPatologia === 'CONFIRMADA') {
          correlTag = `<span class="correl-tag ok">✓ Correlação confirmada</span>`;
        } else if (f.correlacaoFotoPatologia === 'DIVERGENTE') {
          correlTag = `<span class="correl-tag div">⚠ Foto divergente da patologia</span>`;
          diagClass = 'nc-diag-full divergente';
        } else if (f.correlacaoFotoPatologia === 'INCONCLUSIVA') {
          correlTag = `<span class="correl-tag inc">? Inconclusiva</span>`;
        }

        const obsHtml = (f.correlacaoFotoPatologia === 'DIVERGENTE' && f.observacaoDivergencia)
          ? `<p style="font-style:italic;margin-top:2mm;">${f.observacaoDivergencia}</p>`
          : '';

        diagHtml = `
          <div class="${diagClass}">
            <div class="sec-lbl">Diagnóstico assistido por IA <span class="badge badge-maquina">MÁQUINA</span> ${correlTag}</div>
            ${diag}
            ${obsHtml}
          </div>`;
      }

      // Anotação do RT — teto 500 chars
      const notesTexto = f.notes?.trim();
      const notesDisplay = notesTexto
        ? (notesTexto.length > 500 ? notesTexto.slice(0, 497) + '…' : notesTexto)
        : '<em style="color:#8A949C">Nenhuma anotação registrada.</em>';

      // Quantitativo
      const quantDisplay = f.quantitativo?.trim()
        ? `<span class="qv">${f.quantitativo.trim()}</span>`
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
}
