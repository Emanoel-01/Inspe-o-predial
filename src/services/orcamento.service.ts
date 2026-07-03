import { Injectable } from '@angular/core';

export type MetodologiaPrecificacao = 'TCU_BDI' | 'JI_FATOR_K';
export type FonteInsumo = 'SINAPI' | 'ORSE' | 'SBC' | 'SIURB' | 'Próprio/Composição' | 'Cotação';
export type StatusComposicao = 'VALIDADO' | 'PENDENTE_VALIDACAO';

export interface InsumoComposicao {
  tipo: 'Material' | 'Mão de Obra' | 'Equipamento';
  codigo: string;
  descricao: string;
  unidade: string;
  coeficiente: number;
  precoUnitario: number;
  fonte: FonteInsumo;
}

export interface Composicao {
  id: string;
  descricao: string;
  unidade: string;
  insumos: InsumoComposicao[];
  metodologia: MetodologiaPrecificacao;
  bdiPercent?: number;   // usado quando metodologia === 'TCU_BDI'
  fatorK?: number;       // usado quando metodologia === 'JI_FATOR_K'
  baseLegal?: string;
  status: StatusComposicao;
}

export interface ComposicaoCalculada extends Composicao {
  subtotalMaterial: number;
  subtotalMaoDeObra: number;
  subtotalEquipamento: number;
  custoDireto: number;
  valorAplicado: number; // valor de BDI (TCU_BDI) ou incremento do Fator K (JI_FATOR_K)
  totalGeral: number;
}

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  // Banco de composições — inicia VAZIO de propósito. Populado em bloco futuro,
  // após auditoria da planilha mestra da JI Construtora. NÃO adicionar dados de
  // exemplo, fictícios ou estimados aqui.
  private composicoes: Composicao[] = [];

  listarComposicoes(): Composicao[] {
    return this.composicoes;
  }

  getComposicao(id: string): Composicao | undefined {
    return this.composicoes.find(c => c.id === id);
  }

  calcularComposicao(composicao: Composicao): ComposicaoCalculada {
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const porTipo = (tipo: InsumoComposicao['tipo']) =>
      r2(composicao.insumos
        .filter(i => i.tipo === tipo)
        .reduce((acc, i) => acc + i.coeficiente * i.precoUnitario, 0));

    const subtotalMaterial = porTipo('Material');
    const subtotalMaoDeObra = porTipo('Mão de Obra');
    const subtotalEquipamento = porTipo('Equipamento');
    const custoDireto = r2(subtotalMaterial + subtotalMaoDeObra + subtotalEquipamento);

    let valorAplicado = 0;
    let totalGeral = custoDireto;
    if (composicao.metodologia === 'TCU_BDI') {
      valorAplicado = r2(custoDireto * ((composicao.bdiPercent ?? 0) / 100));
      totalGeral = r2(custoDireto + valorAplicado);
    } else if (composicao.metodologia === 'JI_FATOR_K') {
      totalGeral = r2(custoDireto * (composicao.fatorK ?? 1));
      valorAplicado = r2(totalGeral - custoDireto);
    }

    return {
      ...composicao,
      subtotalMaterial, subtotalMaoDeObra, subtotalEquipamento,
      custoDireto, valorAplicado, totalGeral,
    };
  }
}
