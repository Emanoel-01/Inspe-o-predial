import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VistoriaDbService, Evidencia } from '../../services/vistoria-db.service';
import { CameraService } from '../../services/camera.service';
import { ToastService } from '../../services/toast.service';

export type PrioridadeOcorrencia = 'Emergência' | 'Urgência' | 'Rotina/Preventiva';
export type StatusOcorrencia = 'ABERTA' | 'EM_ATENDIMENTO' | 'RESOLVIDA' | 'CANCELADA';

export interface Ocorrencia {
  id: string;
  buildingName: string;
  contrato?: string;
  dataOcorrido: string;
  dataRegistro: string;
  relator: string;
  contatoRelator?: string;
  sistemaAfetado: string;
  descricao: string;
  prioridade: PrioridadeOcorrencia;
  lat?: number;
  lng?: number;
  gpsAccuracy?: number;
  id_evidencias?: string[];
  id_evidenciasPosAtendimento?: string[];
  status: StatusOcorrencia;
  acaoTomada?: string;
  responsavelAtendimento?: string;
  dataInicioAtendimento?: string;
  dataResolucao?: string;
  candidataRTIPA?: boolean;
  numeroBoletim?: string;
  dateCreated: string;
  dateUpdated: string;
}

interface SlaPrioridade {
  prazoRespostaHoras: number | null;
  prazoRespostaLabel: string;
  prazoConclusaoHoras: number | null;
  prazoConclusaoLabel: string;
}

export const SLA_POR_PRIORIDADE: Record<PrioridadeOcorrencia, SlaPrioridade> = {
  'Emergência': {
    prazoRespostaHoras: 2, prazoRespostaLabel: 'Até 2h corridas',
    prazoConclusaoHoras: 24, prazoConclusaoLabel: 'Até 24h corridas',
  },
  'Urgência': {
    prazoRespostaHoras: 12, prazoRespostaLabel: 'Até 12h corridas',
    prazoConclusaoHoras: 48, prazoConclusaoLabel: 'Até 48h corridas',
  },
  'Rotina/Preventiva': {
    prazoRespostaHoras: null, prazoRespostaLabel: 'Até 5 dias úteis',
    prazoConclusaoHoras: null, prazoConclusaoLabel: 'Conforme cronograma da OS',
  },
};

@Component({
  selector: 'app-ocorrencia',
  templateUrl: './ocorrencia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class OcorrenciaComponent implements OnInit {
  private dbService = inject(VistoriaDbService);
  public camera = inject(CameraService);
  private toastService = inject(ToastService);

  SLA_POR_PRIORIDADE = SLA_POR_PRIORIDADE;

  carregando = signal(true);
  ocorrencias = signal<Ocorrencia[]>([]);
  modoExibicao = signal<'LISTA' | 'NOVA' | 'DETALHE'>('LISTA');
  ocorrenciaAtiva = signal<Ocorrencia | null>(null);
  capturando = signal(false);
  streamCameraOcorrencia = signal<MediaStream | null>(null);
  tipoEvidenciaCapturando = signal<'antes' | 'depois' | null>(null);

  // Object URLs mapping ID -> objectURL string
  evidenciasUrls = signal<Record<string, string>>({});

  novoBuildingName = signal('');
  novoContrato = signal('');
  novoDataOcorrido = signal('');
  novoRelator = signal('');
  novoContatoRelator = signal('');
  novoSistemaAfetado = signal('');
  novoDescricao = signal('');
  novoPrioridade = signal<PrioridadeOcorrencia>('Urgência');

  campoAcaoTomada = signal('');
  campoResponsavelAtendimento = signal('');
  campoCandidataRTIPA = signal(false);

  edificacoesConhecidas = computed(() => {
    const nomes = this.ocorrencias().map(o => o.buildingName);
    return Array.from(new Set(nomes)).sort();
  });

  contratosConhecidos = computed(() => {
    const nomes = this.ocorrencias().map(o => o.contrato).filter((c): c is string => !!c);
    return Array.from(new Set(nomes)).sort();
  });

  async ngOnInit(): Promise<void> {
    await this.carregarOcorrencias();
  }

  async carregarOcorrencias(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.dbService.getAllOcorrencias();
      lista.sort((a, b) => b.dataRegistro.localeCompare(a.dataRegistro));
      this.ocorrencias.set(lista);
    } catch (e) {
      console.error('Falha ao carregar ocorrências', e);
      this.toastService.show('Falha ao carregar ocorrências.', 'error');
    } finally {
      this.carregando.set(false);
    }
  }

  criarNovaOcorrencia(): void {
    this.novoBuildingName.set('');
    this.novoContrato.set('');
    this.novoDataOcorrido.set(new Date().toISOString().slice(0, 16));
    this.novoRelator.set('');
    this.novoContatoRelator.set('');
    this.novoSistemaAfetado.set('');
    this.novoDescricao.set('');
    this.novoPrioridade.set('Urgência');
    this.modoExibicao.set('NOVA');
  }

  async salvarNovaOcorrencia(): Promise<void> {
    if (!this.novoBuildingName().trim() || !this.novoRelator().trim() || !this.novoDescricao().trim()) {
      this.toastService.show('Preencha edificação, relator e descrição antes de salvar.', 'error');
      return;
    }

    const geo = await this.camera.obterLocalizacao().catch(() => null);

    const nova: Ocorrencia = {
      id: crypto.randomUUID(),
      buildingName: this.novoBuildingName().trim(),
      contrato: this.novoContrato().trim() || undefined,
      dataOcorrido: this.novoDataOcorrido() || new Date().toISOString(),
      dataRegistro: new Date().toISOString(),
      relator: this.novoRelator().trim(),
      contatoRelator: this.novoContatoRelator().trim() || undefined,
      sistemaAfetado: this.novoSistemaAfetado().trim(),
      descricao: this.novoDescricao().trim(),
      prioridade: this.novoPrioridade(),
      lat: geo?.lat,
      lng: geo?.lng,
      gpsAccuracy: geo?.accuracy,
      id_evidencias: [],
      id_evidenciasPosAtendimento: [],
      status: 'ABERTA',
      candidataRTIPA: false,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };

    await this.dbService.saveOcorrencia(nova);
    this.ocorrencias.set([nova, ...this.ocorrencias()]);
    await this.abrirDetalhe(nova);
    this.toastService.show('Ocorrência registrada.', 'success');
  }

  async abrirDetalhe(oc: Ocorrencia): Promise<void> {
    this.ocorrenciaAtiva.set(oc);
    this.campoAcaoTomada.set(oc.acaoTomada ?? '');
    this.campoResponsavelAtendimento.set(oc.responsavelAtendimento ?? '');
    this.campoCandidataRTIPA.set(oc.candidataRTIPA ?? false);
    
    // Revoke previous object URLs to avoid memory leaks
    Object.values(this.evidenciasUrls()).forEach(url => URL.revokeObjectURL(url));
    this.evidenciasUrls.set({});
    
    await this.carregarEvidenciasOcorrencia(oc);
    this.modoExibicao.set('DETALHE');
  }

  async carregarEvidenciasOcorrencia(oc: Ocorrencia): Promise<void> {
    const urls: Record<string, string> = {};
    const ids = [...(oc.id_evidencias ?? []), ...(oc.id_evidenciasPosAtendimento ?? [])];
    for (const id of ids) {
      const ev = await this.dbService.getEvidencia(id);
      if (ev) {
        urls[id] = URL.createObjectURL(ev.blob);
      }
    }
    this.evidenciasUrls.set(urls);
  }

  voltarParaLista(): void {
    // Revoke URLs
    Object.values(this.evidenciasUrls()).forEach(url => URL.revokeObjectURL(url));
    this.evidenciasUrls.set({});
    this.ocorrenciaAtiva.set(null);
    this.modoExibicao.set('LISTA');
    void this.carregarOcorrencias();
  }

  private async persistirOcorrencia(oc: Ocorrencia): Promise<void> {
    const atualizada: Ocorrencia = { ...oc, dateUpdated: new Date().toISOString() };
    await this.dbService.saveOcorrencia(atualizada);
    this.ocorrenciaAtiva.set(atualizada);
    this.ocorrencias.set(this.ocorrencias().map(o => o.id === atualizada.id ? atualizada : o));
  }

  async iniciarAtendimento(): Promise<void> {
    const ativa = this.ocorrenciaAtiva();
    if (!ativa) return;
    await this.persistirOcorrencia({
      ...ativa,
      status: 'EM_ATENDIMENTO',
      dataInicioAtendimento: new Date().toISOString(),
    });
    this.toastService.show('Atendimento iniciado.', 'success');
  }

  async resolverOcorrencia(): Promise<void> {
    const ativa = this.ocorrenciaAtiva();
    if (!ativa) return;
    if (!this.campoAcaoTomada().trim() || !this.campoResponsavelAtendimento().trim()) {
      this.toastService.show('Preencha a ação tomada e o responsável antes de resolver.', 'error');
      return;
    }
    await this.persistirOcorrencia({
      ...ativa,
      status: 'RESOLVIDA',
      acaoTomada: this.campoAcaoTomada().trim(),
      responsavelAtendimento: this.campoResponsavelAtendimento().trim(),
      candidataRTIPA: this.campoCandidataRTIPA(),
      dataResolucao: new Date().toISOString(),
    });
    this.toastService.show('Ocorrência marcada como resolvida.', 'success');
  }

  async cancelarOcorrencia(): Promise<void> {
    const ativa = this.ocorrenciaAtiva();
    if (!ativa) return;
    await this.persistirOcorrencia({ ...ativa, status: 'CANCELADA' });
    this.toastService.show('Ocorrência cancelada.', 'info');
  }

  async abrirCapturaEvidencia(tipo: 'antes' | 'depois'): Promise<void> {
    this.tipoEvidenciaCapturando.set(tipo);
    try {
      const stream = await this.camera.iniciar();
      this.streamCameraOcorrencia.set(stream);
    } catch (e) {
      console.error('Erro ao abrir câmera', e);
      this.toastService.show('Câmera indisponível.', 'error');
      this.tipoEvidenciaCapturando.set(null);
    }
  }

  fecharCapturaEvidencia(): void {
    this.camera.parar();
    this.streamCameraOcorrencia.set(null);
    this.tipoEvidenciaCapturando.set(null);
  }

  async confirmarCapturaEvidencia(): Promise<void> {
    const ativa = this.ocorrenciaAtiva();
    const tipo = this.tipoEvidenciaCapturando();
    if (!ativa || !tipo) return;

    this.capturando.set(true);
    try {
      const blob = await this.camera.capturarBlob();
      const geo = await this.camera.obterLocalizacao();
      const idEvidencia = crypto.randomUUID();

      const ev: Evidencia = {
        id: idEvidencia,
        blob,
        mimeType: 'image/jpeg',
        tipo: 'contexto',
        geo,
        timestamp: new Date().toISOString(),
        id_item: ativa.id,
      };

      await this.dbService.saveEvidencia(ev);

      const objectUrl = URL.createObjectURL(blob);
      this.evidenciasUrls.update(urls => ({ ...urls, [idEvidencia]: objectUrl }));

      if (tipo === 'antes') {
        const novas = [...(ativa.id_evidencias ?? []), idEvidencia];
        await this.persistirOcorrencia({ ...ativa, id_evidencias: novas });
      } else {
        const novas = [...(ativa.id_evidenciasPosAtendimento ?? []), idEvidencia];
        await this.persistirOcorrencia({ ...ativa, id_evidenciasPosAtendimento: novas });
      }
    } catch (e) {
      console.error('Falha ao capturar evidência da ocorrência', e);
      this.toastService.show('Falha ao capturar evidência.', 'error');
    } finally {
      this.capturando.set(false);
      this.fecharCapturaEvidencia();
    }
  }

  calcularSlaStatus(oc: Ocorrencia): { respostaDentroPrazo: boolean | null; conclusaoDentroPrazo: boolean | null } {
    const sla = SLA_POR_PRIORIDADE[oc.prioridade];
    const inicioMs = new Date(oc.dataRegistro).getTime();

    let respostaDentroPrazo: boolean | null = null;
    if (sla.prazoRespostaHoras != null && oc.dataInicioAtendimento) {
      const horasAteResposta = (new Date(oc.dataInicioAtendimento).getTime() - inicioMs) / 3_600_000;
      respostaDentroPrazo = horasAteResposta <= sla.prazoRespostaHoras;
    }

    let conclusaoDentroPrazo: boolean | null = null;
    if (sla.prazoConclusaoHoras != null && oc.dataResolucao) {
      const horasAteConclusao = (new Date(oc.dataResolucao).getTime() - inicioMs) / 3_600_000;
      conclusaoDentroPrazo = horasAteConclusao <= sla.prazoConclusaoHoras;
    }

    return { respostaDentroPrazo, conclusaoDentroPrazo };
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

  private async gerarNumeroBoletim(): Promise<string> {
    const ano = new Date().getFullYear();
    const doAno = this.ocorrencias().filter(o => o.numeroBoletim?.includes(`-${ano}-`)).length;
    const seq = String(doAno + 1).padStart(4, '0');
    return `P4-BOS-${ano}-${seq}`;
  }

  async exportarBOS(oc: Ocorrencia): Promise<void> {
    let ocorrenciaParaExportar = oc;
    if (!oc.numeroBoletim) {
      const numero = await this.gerarNumeroBoletim();
      ocorrenciaParaExportar = { ...oc, numeroBoletim: numero };
      await this.persistirOcorrencia(ocorrenciaParaExportar);
    }

    const novaJanela = window.open('', '_blank');
    if (!novaJanela) {
      this.toastService.show('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.', 'error');
      return;
    }

    const sla = SLA_POR_PRIORIDADE[ocorrenciaParaExportar.prioridade];
    const slaStatus = this.calcularSlaStatus(ocorrenciaParaExportar);

    const fotosAntes = await Promise.all(
      (ocorrenciaParaExportar.id_evidencias ?? []).map(async id => {
        const ev = await this.dbService.getEvidencia(id);
        if (!ev) return '';
        const base64 = await this.blobParaBase64(ev.blob);
        return `<img src="data:${ev.mimeType};base64,${base64}" style="width:100%;border-radius:4px;" />`;
      })
    );
    const fotosDepois = await Promise.all(
      (ocorrenciaParaExportar.id_evidenciasPosAtendimento ?? []).map(async id => {
        const ev = await this.dbService.getEvidencia(id);
        if (!ev) return '';
        const base64 = await this.blobParaBase64(ev.blob);
        return `<img src="data:${ev.mimeType};base64,${base64}" style="width:100%;border-radius:4px;" />`;
      })
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>BOS — ${ocorrenciaParaExportar.numeroBoletim}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; color: #1A2A38; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; }
          thead, tfoot { display: table-header-group; }
          .header, .footer { font-size: 8pt; color: #4A5A66; padding: 4mm 0; border-bottom: 1px solid #D8D0C6; }
          .footer { border-top: 1px solid #D8D0C6; border-bottom: none; }
          h1 { font-size: 14pt; color: #132A41; }
          .badge { display:inline-block; padding: 1mm 3mm; border-radius: 3px; font-weight:700; font-size:8pt; }
          .badge-emergencia { background:#FDECEA; color:#C75D45; }
          .badge-urgencia { background:#FFF8EB; color:#B77D1A; }
          .badge-rotina { background:#E8F5EE; color:#2E7D5B; }
          .sla-ok { color:#2E7D5B; font-weight:700; }
          .sla-estourado { color:#C75D45; font-weight:700; }
          .foto-grid { display:flex; gap:4mm; margin: 3mm 0; }
          .foto-grid > div { flex:1; }
          td, th { padding: 2mm 3mm; border: 1px solid #D8D0C6; text-align:left; font-size:9pt; vertical-align: top; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr><td><div class="header">
            AmorimTech · Boletim de Ocorrência de Serviço — ${ocorrenciaParaExportar.numeroBoletim}
          </div></td></tr></thead>
          <tfoot><tr><td><div class="footer">
            Documento operacional — não substitui o RTIPA. Emitido por Predial 4.0.
          </div></td></tr></tfoot>
          <tbody><tr><td>

            <h1>Boletim de Ocorrência de Serviço</h1>
            <p><strong>${ocorrenciaParaExportar.numeroBoletim}</strong></p>

            <table>
              <tr><td><strong>Edificação</strong></td><td>${ocorrenciaParaExportar.buildingName}</td>
                  <td><strong>Contrato</strong></td><td>${ocorrenciaParaExportar.contrato || '—'}</td></tr>
              <tr><td><strong>Prioridade</strong></td>
                  <td><span class="badge ${ocorrenciaParaExportar.prioridade === 'Emergência' ? 'badge-emergencia' : ocorrenciaParaExportar.prioridade === 'Urgência' ? 'badge-urgencia' : 'badge-rotina'}">${ocorrenciaParaExportar.prioridade}</span></td>
                  <td><strong>Status</strong></td><td>${ocorrenciaParaExportar.status}</td></tr>
              <tr><td><strong>Sistema afetado</strong></td><td>${ocorrenciaParaExportar.sistemaAfetado || '—'}</td>
                  <td><strong>Data do ocorrido</strong></td><td>${new Date(ocorrenciaParaExportar.dataOcorrido).toLocaleString('pt-BR')}</td></tr>
              <tr><td><strong>Relator</strong></td><td>${ocorrenciaParaExportar.relator}</td>
                  <td><strong>Contato</strong></td><td>${ocorrenciaParaExportar.contatoRelator || '—'}</td></tr>
            </table>

            <h3>Descrição do ocorrido</h3>
            <p>${ocorrenciaParaExportar.descricao}</p>

            <h3>Prazos (SLA contratual)</h3>
            <table>
              <tr><td><strong>Prazo de resposta</strong></td><td>${sla.prazoRespostaLabel}</td>
                  <td>${slaStatus.respostaDentroPrazo === null ? '—' : slaStatus.respostaDentroPrazo ? '<span class="sla-ok">Dentro do prazo</span>' : '<span class="sla-estourado">Prazo estourado</span>'}</td></tr>
              <tr><td><strong>Prazo de conclusão</strong></td><td>${sla.prazoConclusaoLabel}</td>
                  <td>${slaStatus.conclusaoDentroPrazo === null ? '—' : slaStatus.conclusaoDentroPrazo ? '<span class="sla-ok">Dentro do prazo</span>' : '<span class="sla-estourado">Prazo estourado</span>'}</td></tr>
            </table>

            ${fotosAntes.length ? `<h3>Evidência — antes do atendimento</h3><div class="foto-grid">${fotosAntes.map(f => `<div>${f}</div>`).join('')}</div>` : ''}

            <h3>Atendimento</h3>
            <table>
              <tr><td><strong>Responsável</strong></td><td>${ocorrenciaParaExportar.responsavelAtendimento || '—'}</td>
                  <td><strong>Início do atendimento</strong></td><td>${ocorrenciaParaExportar.dataInicioAtendimento ? new Date(ocorrenciaParaExportar.dataInicioAtendimento).toLocaleString('pt-BR') : '—'}</td></tr>
              <tr><td><strong>Resolução</strong></td><td colspan="3">${ocorrenciaParaExportar.dataResolucao ? new Date(ocorrenciaParaExportar.dataResolucao).toLocaleString('pt-BR') : '—'}</td></tr>
            </table>
            <p><strong>Ação tomada:</strong> ${ocorrenciaParaExportar.acaoTomada || 'Ainda não resolvida.'}</p>

            ${fotosDepois.length ? `<h3>Evidência — após o atendimento</h3><div class="foto-grid">${fotosDepois.map(f => `<div>${f}</div>`).join('')}</div>` : ''}

            ${ocorrenciaParaExportar.candidataRTIPA ? '<p><em>⚠ Esta ocorrência foi sinalizada para revisão na próxima vistoria RTIPA.</em></p>' : ''}

          </td></tr></tbody>
        </table>
      </body>
      </html>`;

    novaJanela.document.write(htmlContent);
    novaJanela.document.close();
    novaJanela.onload = () => { novaJanela.focus(); novaJanela.print(); };
  }
}
