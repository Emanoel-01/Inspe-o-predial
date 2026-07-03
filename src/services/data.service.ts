import { Injectable } from '@angular/core';

export interface NormaRef {
  codigo: string;
  titulo: string;
  aplicacao: string;
  status: 'CONFIRMADO' | 'PENDENTE';
}

export interface NormasSistema {
  sistema: NormaRef[];
  tipologias: { [tipologiaTitle: string]: NormaRef[] };
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private appData = {
    estrutura: {
        title: 'Estrutura & Envoltória',
        intro: 'Esta seção aborda a espinha dorsal e a pele do edifício: os sistemas que garantem sua estabilidade, forma e proteção contra os elementos. A manutenção adequada destes sistemas é vital para a segurança, estanqueidade e desempenho termoacústico.',
        systems: {
            estruturais: {
                title: 'Sistemas Estruturais',
                icon: '🏛️',
                tipologias: [
                    { title: 'Concreto armado in loco', definicao: 'Estrutura moldada no local da obra, combinando a resistência à compressão do concreto com a resistência à tração das barras de aço (armadura).', componentes: 'Vigas, pilares, lajes, fôrmas, escoramento, aço, concreto.', aplicacoes: 'Edifícios de múltiplos andares, residências, obras de arte especiais.', vantagens: 'Versatilidade, robustez, bom desempenho ao fogo.', desvantagens: 'Peso próprio elevado, geração de resíduos, processo construtivo lento.' },
                    { title: 'Concreto protendido', definicao: 'Técnica que induz tensões de compressão no concreto antes da aplicação das cargas de serviço, utilizando cabos de aço de alta resistência tracionados.', componentes: 'Cabos de protensão (cordoalhas), bainhas, ancoragens, concreto de alta resistência.', aplicacoes: 'Grandes vãos em pontes, viadutos, lajes de edifícios e pisos industriais.', vantagens: 'Permite vencer vãos maiores, reduz flechas e fissuração.', desvantagens: 'Custo mais elevado, exige mão de obra e controle tecnológico rigorosos.' },
                    { title: 'Alvenaria estrutural', definicao: 'As paredes de blocos (cerâmicos ou de concreto) atuam como estrutura, suportando e distribuindo as cargas da edificação.', componentes: 'Blocos estruturais, graute, armaduras pontuais, juntas de argamassa.', aplicacoes: 'Edifícios residenciais de até 20-25 pavimentos, casas populares.', vantagens: 'Custo reduzido, rapidez construtiva, menor geração de resíduo.', desvantagens: 'Limitações de vãos, dificuldade em alterações de layout futuras.' },
                    { title: 'Estrutura metálica', definicao: 'Esqueleto do edifício formado por perfis de aço laminado ou soldado, conectados por parafusos ou solda.', componentes: 'Perfis (I, H, W), vigas, pilares, contraventamentos, parafusos, solda.', aplicacoes: 'Galpões, shoppings, edifícios altos, mezaninos, pontes.', vantagens: 'Leveza, rapidez de montagem, precisão, permite grandes vãos.', desvantagens: 'Custo do material, necessidade de proteção contra fogo e corrosão.' },
                    { title: 'Estrutura de madeira', definicao: 'Utiliza peças de madeira serrada ou laminada colada (MLC) para formar a estrutura principal.', componentes: 'Vigas, pilares, treliças, conectores metálicos, madeira tratada.', aplicacoes: 'Residências, coberturas, estruturas rurais, edifícios de pequeno porte.', vantagens: 'Material renovável, bom isolamento térmico, estética agradável.', desvantagens: 'Suscetível a cupins e umidade se não tratada, requer manutenção periódica.' },
                    { title: 'Steel frame', definicao: 'Estrutura formada por perfis leves de aço galvanizado que compõem painéis, vigas e treliças.', componentes: 'Perfis U e C, placas de fechamento (OSB, cimentícia), isolantes (lã de vidro/rocha).', aplicacoes: 'Residências, edifícios comerciais de até 5 pavimentos, fachadas.', vantagens: 'Construção a seco, rapidez, precisão, leveza, ótimo desempenho termoacústico.', desvantagens: 'Cultura construtiva em desenvolvimento, exige projetos compatibilizados.' },
                    { title: 'Wood frame', definicao: 'Similar ao Steel Frame, mas utiliza perfis de madeira de reflorestamento tratada industrialmente.', componentes: 'Montantes de madeira (pinus), placas de fechamento, barreiras de vapor.', aplicacoes: 'Residências unifamiliares, edifícios de pequeno porte.', vantagens: 'Sustentabilidade, rapidez, excelente isolamento térmico.', desvantagens: 'Requer tratamento contra cupins e umidade, barreiras de fogo são essenciais.' },
                    { title: 'Painéis CLT (Cross Laminated Timber)', definicao: 'Painéis estruturais de madeira maciça formados por camadas de tábuas coladas em direções alternadas, criando um material de alta resistência.', componentes: 'Painéis de CLT, conectores metálicos.', aplicacoes: 'Edifícios de múltiplos andares ("arranha-céus de madeira"), paredes, lajes.', vantagens: 'Sustentabilidade, rapidez de montagem, alta resistência, bom desempenho ao fogo.', desvantagens: 'Custo elevado, logística complexa, poucas empresas produtoras no Brasil.' },
                    { title: 'Painéis SIP (Structural Insulated Panel)', definicao: 'Painel sanduíche composto por duas placas estruturais (geralmente OSB) e um núcleo de isolante térmico (EPS ou PU).', componentes: 'Placas OSB, núcleo de EPS/PU, adesivo estrutural.', aplicacoes: 'Paredes e coberturas de residências, câmaras frias.', vantagens: 'Altíssimo desempenho térmico, rapidez de montagem, leveza.', desvantagens: 'Dificuldade para passar instalações após a montagem.' },
                    { title: 'Pré-moldados de concreto', definicao: 'Elementos estruturais (pilares, vigas, lajes) fabricados em indústria e transportados para montagem no canteiro.', componentes: 'Peças pré-moldadas, consoles, ligações (soldadas ou com graute).', aplicacoes: 'Galpões, supermercados, shoppings, estacionamentos, pontes.', vantagens: 'Velocidade de construção, controle de qualidade industrial, redução de formas no canteiro.', desvantagens: 'Logística de transporte complexa, limitações arquitetônicas, juntas aparentes.' },
                    { title: 'Sistema modular pré-fabricado', definicao: 'Construção de módulos tridimensionais completos (ex: um quarto de hotel, um banheiro) em fábrica, que são transportados e "empilhados" no local.', componentes: 'Módulos 3D com estrutura, vedações e instalações.', aplicacoes: 'Hotéis, hospitais, residências estudantis, canteiros de obra.', vantagens: 'Velocidade extrema, altíssimo controle de qualidade, redução de desperdício.', desvantagens: 'Transporte caro e complexo, design limitado pela modulação.' },
                    { title: 'Sistema estrutural híbrido', definicao: 'Combinação de dois ou mais sistemas estruturais para otimizar o desempenho e custo. Ex: núcleo de concreto com vigas e pilares metálicos.', componentes: 'Varia conforme a combinação (ex: concreto, aço, madeira).', aplicacoes: 'Edifícios altos, projetos complexos que exigem diferentes soluções.', vantagens: 'Otimiza as melhores características de cada material.', desvantagens: 'Complexidade no projeto e execução das ligações entre sistemas.' }
                ],
                patologias: [
                    { title: 'Corrosão de Armaduras', sintomas: 'Manchas de ferrugem, fissuras paralelas às armaduras, destacamento do concreto (spalling).', causas: 'Carbonatação do concreto, ataque de cloretos (maresia), umidade.', typology_link: 'Concreto armado in loco' },
                    { title: 'Fissuração Excessiva', sintomas: 'Aberturas acentuadas em vigas e lajes.', causas: 'Sobrecarga, retração do concreto, recalques de fundação.', typology_link: 'Concreto armado in loco' },
                    { title: 'Segregação do Concreto ("Bicheiras")', sintomas: 'Ninhos de agregados na superfície do concreto, aspecto poroso, baixa resistência local.', causas: 'Adensamento inadequado, concreto com pouca argamassa, lançamento de grande altura.', typology_link: 'Concreto armado in loco' },
                    { title: 'Perda de Protensão', sintomas: 'Aumento de flechas e fissuras em vigas e lajes protendidas.', causas: 'Corrosão das cordoalhas, relaxação do aço, falha nas ancoragens.', typology_link: 'Concreto protendido' },
                    { title: 'Fissuras em "Escada"', sintomas: 'Fissuras que seguem as juntas de argamassa entre os blocos.', causas: 'Recalque de fundação, sobrecargas não previstas.', typology_link: 'Alvenaria estrutural' },
                    { title: 'Esmagamento de Blocos', sintomas: 'Ruptura e fragmentação de blocos, geralmente sob cargas concentradas.', causas: 'Sobrecarga, uso de blocos de baixa resistência, falta de distribuição de carga.', typology_link: 'Alvenaria estrutural' },
                    { title: 'Corrosão em Estrutura Metálica', sintomas: 'Redução da seção dos perfis, bolhas na pintura, ferrugem.', causas: 'Falha na pintura protetora, umidade, ambiente agressivo.', typology_link: 'Estrutura metálica' },
                    { title: 'Flambagem de Perfis', sintomas: 'Encurvadura lateral de perfis comprimidos (pilares, banzos de treliça).', causas: 'Subdimensionamento do perfil, falta de contraventamento adequado.', typology_link: 'Estrutura metálica' },
                    { title: 'Apodrecimento e Ataque de Cupins', sintomas: 'Perda de seção, som oco, pó de madeira.', causas: 'Falha no tratamento da madeira, umidade excessiva.', typology_link: 'Estrutura de madeira' },
                    { title: 'Corrosão de Perfis Leves', sintomas: 'Ferrugem nos perfis, principalmente na base (soleira).', causas: 'Infiltração de umidade pela base da parede.', typology_link: 'Steel frame' },
                    { title: 'Delaminação de Painéis', sintomas: 'Separação das camadas de madeira do painel.', causas: 'Falha no adesivo, exposição prolongada à umidade.', typology_link: 'Painéis CLT (Cross Laminated Timber)' },
                    { title: 'Descolamento das Placas', sintomas: 'Separação das placas de OSB do núcleo isolante.', causas: 'Falha no adesivo, umidade.', typology_link: 'Painéis SIP (Structural Insulated Panel)' },
                    { title: 'Falha nas Ligações', sintomas: 'Fissuras nas juntas entre elementos, infiltração.', causas: 'Preenchimento inadequado com graute, falha na solda.', typology_link: 'Pré-moldados de concreto' },
                    { title: 'Problemas nas Juntas dos Módulos', sintomas: 'Infiltração de água e ar entre os módulos.', causas: 'Falha no sistema de vedação das juntas.', typology_link: 'Sistema modular pré-fabricado' },
                    { title: 'Incompatibilidade de Deformação', sintomas: 'Fissuras no ponto de encontro entre differentes materiais (ex: aço e concreto).', causas: 'Diferença no comportamento e dilatação dos materiais.', typology_link: 'Sistema estrutural híbrido' },
                    { title: 'Empenamento e Trincas em Painéis', sintomas: 'Frestas nas junções das placas, descolamento de gesso, rangidos estruturais.', causas: 'Variação excessiva de umidade relativa do ar, falha na barreira de vapor ou secagem incompleta da madeira.', typology_link: 'Wood frame' }
                ],
                diagnostico: [
                    { title: 'Ensaios Não Destrutivos (END)', desc: 'Esclerometria, ultrassom, pacometria, termografia, georadar para mapeamento de armaduras e vazios.' },
                    { title: 'Ensaios Destrutivos e Semidestrutivos', desc: 'Extração de testemunhos, ensaio de arrancamento de barras de aço.' },
                    { title: 'Monitoramento Estrutural', desc: 'Instrumentação com sensores (fissurômetros, inclinômetros, acelerômetros) para acompanhar deformações e vibrações em tempo real.' }
                ],
                tecnologias: [
                    { icon: '🌐', title: 'IoT & Sensores', desc: 'Monitoramento contínuo de vibração, deformação, umidade e corrosão para detecção de anomalias.' },
                    { icon: '🧠', title: 'IA & Análise Preditiva', desc: 'Algoritmos para prever a evolução de fissuras, o risco de corrosão e a vida útil remanescente da estrutura.' },
                    { icon: '🏢', title: 'BIM & Digital Twin', desc: 'Criação de um gêmeo digital que centraliza todas as informações do ativo (projetos, relatórios, dados de sensores) para simulações e gestão do ciclo de vida.' },
                    { icon: '🛰️', title: 'Drones e Laser Scanning', desc: 'Mapeamento 3D de alta precisão para inspeções visuais detalhadas e detecção de deformações em locais de difícil acesso.'}
                ],
                maintenance_schedules: {
                    'Concreto armado in loco': [
                        { type: 'Preventiva', activity: 'Inspeção visual detalhada de fissuras, manchas e deformações', periodicity: 'Anual', recommendations: 'Focar em áreas críticas como juntas, apoios e elementos expostos à umidade.', tech_diagnostics: 'Inspeção visual, drones.' },
                        { type: 'Preditiva', activity: 'Ensaios de carbonatação e ataque de cloretos em áreas críticas', periodicity: 'A cada 3-5 anos', recommendations: 'Avaliar a agressividade do ambiente e o risco de corrosão das armaduras.', tech_diagnostics: 'Ensaios químicos.' },
                        { type: 'Preditiva', activity: 'Mapeamento de corrosão potencial', periodicity: 'A cada 5 anos', recommendations: 'Utilizar técnicas eletroquímicas para mapear áreas com corrosão ativa, mas ainda não visível.', tech_diagnostics: 'Medida de potencial de corrosão.' }
                    ],
                    'Estrutura metálica': [
                        { type: 'Preventiva', activity: 'Inspeção visual da pintura protetora e pontos de corrosão', periodicity: 'Anual', recommendations: 'Procurar por bolhas, descascamento e pontos de ferrugem, especialmente em ligações e bases de pilares.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preventiva', activity: 'Verificação de aperto de parafusos em ligações importantes', periodicity: 'A cada 2 anos', recommendations: 'Utilizar torquímetro para garantir o aperto especificado em projeto.', tech_diagnostics: 'Torquímetro.' },
                        { type: 'Preditiva', activity: 'Medição de espessura da camada de tinta', periodicity: 'A cada 3-5 anos', recommendations: 'Verificar se a proteção ainda atende aos requisitos de projeto.', tech_diagnostics: 'Medidor de espessura de camada.' }
                    ],
                    'Estrutura de madeira': [
                        { type: 'Preventiva', activity: 'Inspeção visual em busca de umidade, cupins e apodrecimento', periodicity: 'Semestral', recommendations: 'Verificar especialmente os pontos de contato da madeira com o solo ou com o concreto.', tech_diagnostics: 'Inspeção visual, medidor de umidade.' },
                        { type: 'Preventiva', activity: 'Reaplicação de verniz ou produtos de proteção', periodicity: 'A cada 2-3 anos', recommendations: 'Garantir a proteção da madeira contra sol e chuva.', tech_diagnostics: 'Inspeção visual.' }
                    ],
                    'Alvenaria estrutural': [
                        { type: 'Preventiva', activity: 'Inspeção de fissuras, especialmente em "escada"', periodicity: 'Anual', recommendations: 'Monitorar a evolução de fissuras existentes com fissurômetros.', tech_diagnostics: 'Inspeção visual, fissurômetro.' },
                        { type: 'Preventiva', activity: 'Verificação de pontos de umidade e eflorescência', periodicity: 'Anual', recommendations: 'A umidade pode indicar problemas de impermeabilização que afetam a alvenaria.', tech_diagnostics: 'Inspeção visual.' }
                    ],
                    'Concreto protendido': [{ type: 'Preventiva', activity: 'Inspeção de ancoragens e drenos', periodicity: 'Anual', recommendations: 'Verificar se há sinais de corrosão ou danos nas ancoragens.', tech_diagnostics: 'Inspeção visual.' }],
                    'Steel frame': [{ type: 'Preventiva', activity: 'Inspeção da base dos perfis (soleiras)', periodicity: 'Anual', recommendations: 'Procurar por corrosão devido a umidade ascendente.', tech_diagnostics: 'Inspeção visual.' }],
                    'Wood frame': [{ type: 'Preventiva', activity: 'Inspeção de umidade e ataque de insetos', periodicity: 'Anual', recommendations: 'Verificar a integridade das barreiras de vapor e umidade.', tech_diagnostics: 'Inspeção visual, medidor de umidade.' }],
                    'Painéis CLT (Cross Laminated Timber)': [{ type: 'Preventiva', activity: 'Inspeção das juntas e vedações', periodicity: 'Anual', recommendations: 'Garantir a estanqueidade e verificar sinais de delaminação.', tech_diagnostics: 'Inspeção visual.' }],
                    'Painéis SIP (Structural Insulated Panel)': [{ type: 'Preventiva', activity: 'Inspeção de juntas e revestimentos', periodicity: 'Anual', recommendations: 'Verificar danos por impacto e a integridade das vedações.', tech_diagnostics: 'Inspeção visual.' }],
                    'Pré-moldados de concreto': [{ type: 'Preventiva', activity: 'Inspeção das juntas e selantes', periodicity: 'Anual', recommendations: 'Reaplicar selantes conforme a necessidade para garantir a estanqueidade.', tech_diagnostics: 'Inspeção visual.' }],
                    'Sistema modular pré-fabricado': [{ type: 'Preventiva', activity: 'Inspeção das juntas entre os módulos', periodicity: 'Anual', recommendations: 'Verificar a vedação para evitar infiltração de ar e água.', tech_diagnostics: 'Inspeção visual.' }],
                    'Sistema estrutural híbrido': [{ type: 'Preventiva', activity: 'Inspeção das ligações entre diferentes materiais', periodicity: 'Anual', recommendations: 'Procurar por fissuras ou sinais de incompatibilidade de deformação.', tech_diagnostics: 'Inspeção visual.' }]
                }
            },
            fundacoes: {
                title: 'Sistemas de Fundações',
                icon: '🌱',
                tipologias: [
                    { title: 'Sapata isolada', definicao: 'Elemento de concreto de formato piramidal ou retangular que transmite a carga de um único pilar para o solo.', componentes: 'Concreto, armadura de aço.', aplicacoes: 'Fundações diretas (rasas) em solos de boa resistência.', vantagens: 'Baixo custo, execução simples.', desvantagens: 'Limitada a solos resistentes e cargas moderadas.' },
                    { title: 'Sapata corrida', definicao: 'Elemento contínuo de concreto armado que percorre o comprimento das paredes, distribuindo a carga linearmente.', componentes: 'Concreto, armadura de aço.', aplicacoes: 'Fundações de casas e edifícios de pequeno porte com paredes portantes.', vantagens: 'Boa distribuição de cargas lineares.', desvantagens: 'Não adequada para cargas concentradas de pilares.' },
                    { title: 'Viga baldrame', definicao: 'Viga de concreto armado que interliga as sapatas ou blocos de fundação, distribuindo cargas e travando a estrutura.', componentes: 'Concreto, armadura de aço.', aplicacoes: 'Estruturas com pilares e sapatas isoladas.', vantagens: 'Trava a estrutura, combate recalques diferenciais.', desvantagens: 'Requer mais escavação e fôrmas que a sapata corrida.' },
                    { title: 'Radier', definicao: 'Laje de concreto armado que abrange toda a área da construção, distribuindo a carga uniformemente sobre o solo.', componentes: 'Laje de concreto, armadura dupla, camada de brita.', aplicacoes: 'Solos de baixa capacidade de suporte, obras leves como casas térreas.', vantagens: 'Reduz recalques diferenciais, rapidez de execução.', desvantagens: 'Custo elevado para grandes áreas, dificulta manutenções hidrossanitárias.' },
                    { title: 'Estaca hélice contínua', definicao: 'Estaca de concreto moldada in loco, executada por perfuração do solo com um trado helicoidal contínuo e injeção de concreto simultânea à retirada do trado.', componentes: 'Concreto injetado, armadura em gaiola.', aplicacoes: 'Fundações profundas em diversos tipos de solo, inclusive na presença de água.', vantagens: 'Alta produtividade, ausência de vibração, monitoramento eletrônico.', desvantagens: 'Custo elevado, grande mobilização de equipamento.' },
                    { title: 'Estaca Strauss', definicao: 'Estaca de concreto moldada in loco, executada por perfuração com sonda (piteira) e posterior concretagem e apiloamento.', componentes: 'Concreto, armadura.', aplicacoes: 'Obras de pequeno e médio porte, terrenos acidentados.', vantagens: 'Baixo custo, equipamento simples.', desvantagens: 'Baixa produtividade, gera muita lama, não pode ser usada abaixo do nível d\'água.' },
                    { title: 'Estaca pré-moldada', definicao: 'Estaca de concreto (ou aço, madeira) fabricada industrialmente e cravada no terreno por percussão (bate-estacas) ou prensagem.', componentes: 'Peça pré-moldada de concreto.', aplicacoes: 'Fundações profundas em solos que permitem a cravação.', vantagens: 'Controle de qualidade da peça, alta capacidade de carga.', desvantagens: 'Gera muita vibração e ruído, pode danificar estruturas vizinhas.' },
                    { title: 'Estaca metálica', definicao: 'Perfis de aço (trilhos, perfis I ou H) cravados no terreno.', componentes: 'Perfis de aço.', aplicacoes: 'Reforços de fundação, obras com restrição de altura, solos agressivos.', vantagens: 'Facilidade de cravação e emendas, atravessa camadas resistentes.', desvantagens: 'Custo do aço, suscetível à corrosão.' },
                    { title: 'Tubulão', definicao: 'Fundação profunda de grande diâmetro, escavada manual ou mecanicamente, que pode ter sua base alargada. Geralmente exige a descida de um operário para inspeção ou alargamento.', componentes: 'Concreto, armadura.', aplicacoes: 'Obras com cargas muito elevadas, como pilares de pontes e edifícios altos.', vantagens: 'Altíssima capacidade de carga, inspeção visual da base.', desvantagens: 'Riscos trabalhistas (escavação manual), processo lento.' },
                    { title: 'Microestaca', definicao: 'Estaca de pequeno diâmetro, moldada in loco, com armadura tubular (tubo de aço) e injeção de calda de cimento sob pressão.', componentes: 'Tubo de aço, calda de cimento.', aplicacoes: 'Reforço de fundações existentes, locais de difícil acesso.', vantagens: 'Execução em locais com pé-direito baixo, mínima vibração.', desvantagens: 'Custo elevado, baixa capacidade de carga por estaca.' }
                ],
                patologias: [
                    { title: 'Recalque Diferencial', sintomas: 'Trincas inclinadas (45º) nas paredes, dificuldade para abrir portas e janelas, pisos e lajes trincados.', causas: 'Capacidade de carga do solo heterogêa, fundação mal dimensionada, vazamentos de água no solo.', typology_link: 'Sapata isolada' },
                    { title: 'Giro da Sapata', sintomas: 'Trincas verticais na base do pilar, desaprumo do pilar.', causas: 'Carga excêntrica no pilar não prevista em projeto.', typology_link: 'Sapata isolada' },
                    { title: 'Corrosão de Armaduras em Baldrames', sintomas: 'Manchas de umidade na base das paredes (rodapé), esfarelamento do reboco, estufamento da pintura.', causas: 'Falha na impermeabilização da viga baldrame.', typology_link: 'Viga baldrame' },
                    { title: 'Fissuras e Infiltrações no Radier', sintomas: 'Trincas no piso, umidade ascendendo pelas paredes.', causas: 'Má compactação do subleito, falta de impermeabilização sob o radier.', typology_link: 'Radier' },
                    { title: 'Puncionamento da Laje (Radier)', sintomas: 'Afundamento do piso ao redor de um pilar, fissuras circulares em torno do pilar.', causas: 'Carga excessiva do pilar, espessura insuficiente do radier, falta de armadura de punção.', typology_link: 'Radier' },
                    { title: 'Falha na Execução da Estaca', sintomas: 'Recalque da estrutura.', causas: 'Concretagem interrompida, contaminação do concreto com solo, posicionamento incorreto da armadura.', typology_link: 'Estaca hélice contínua' },
                    { title: 'Estrangulamento do Fuste', sintomas: 'Redução da seção da estaca em um ponto específico, levando a recalques.', causas: 'Solo muito mole que "aperta" o concreto fresco durante a retirada do trado.', typology_link: 'Estaca hélice contínua' },
                    { title: 'Rompimento da Estaca durante Cravação', sintomas: 'Perda súbita de nega (resistência à cravação), recalque da estrutura.', causas: 'Existência de matacões no subsolo, energia de cravação excessiva.', typology_link: 'Estaca pré-moldada' },
                    { title: 'Corrosão Acentuada de Perfis', sintomas: 'Redução da vida útil da fundação, recalques.', causas: 'Solo muito agressivo (quimicamente), falta de proteção catódica ou pintura especial.', typology_link: 'Estaca metálica' },
                    { title: 'Problemas de Escavação', sintomas: 'Desmoronamento do fuste durante a escavação, contaminação do concreto.', causas: 'Presença de água, solo arenoso e pouco coesivo.', typology_link: 'Tubulão' },
                    { title: 'Trincas e Fissuras Lineares na Alvenaria de Fundação', sintomas: 'Fissuras horizontais ou diagonais contínuas próximo ao rodapé das paredes.', causas: 'Recalque pontual do solo sob a sapata, sobrecarga distribuída desigual ou ausência de viga de cintamento superior.', typology_link: 'Sapata corrida' },
                    { title: 'Deficiência de Seção por Contaminação com Solo', sintomas: 'Recalque acentuado no pilar correspondente após aplicação das cargas estruturais.', causas: 'Desmoronamento das paredes do furo durante a retirada da camisa e concretagem, reduzindo a seção efetiva da estaca.', typology_link: 'Estaca Strauss' },
                    { title: 'Falha de Aderência Fuste-Solo por Pressão de Injeção Inadequada', sintomas: 'Deslocamento vertical (recalque) lento e contínuo sob cargas de serviço de reforço.', causas: 'Pressão de injeção da calda de cimento inferior à especificada ou lavagem da calda por fluxo d\'água subterrâneo ativo.', typology_link: 'Microestaca' }
                ],
                diagnostico: [
                    { title: 'Sondagem Geotécnica (SPT, CPT)', desc: 'Investigação do subsolo para determinar o tipo de solo, resistência e nível do lençol freático. Essencial antes de qualquer projeto.' },
                    { title: 'Monitoramento de Recalques', desc: 'Nivelamento topográfico de alta precisão ou uso de pinos de recalque para medir a movimentação da estrutura ao longo do tempo.' },
                    { title: 'Ensaios de Integridade de Estacas (PIT)', desc: 'Ensaio não destrutivo que avalia a integridade e o comprimento de estacas de fundação através de ondas mecânicas.' }
                ],
                tecnologias: [
                    { icon: '📡', title: 'Georadar (GPR)', desc: 'Mapeia o subsolo para identificar a posição das fundações existentes, tubulações e anomalias sem escavação.' },
                    { icon: '🌐', title: 'Sensores de Fibra Óptica', desc: 'Embutidos em estacas e blocos de fundação para monitorar tensões, deformações e temperatura em tempo real durante toda a vida útil da estrutura.' },
                    { icon: '🧠', title: 'IA para Análise Geotécnica', desc: 'Modelos que analisam dados de sondagens para prever o comportamento do solo e otimizar o projeto de fundações.' }
                ],
                 maintenance_schedules: {
                    'Sapata isolada': [{ type: 'Preditiva', activity: 'Monitoramento de recalques', periodicity: 'Anual', recommendations: 'Acompanhar a evolução de trincas e desníveis para intervir antes de danos graves.', tech_diagnostics: 'Topografia, fissurômetros.' }],
                    'Sapata corrida': [{ type: 'Preditiva', activity: 'Monitoramento de recalques', periodicity: 'Anual', recommendations: 'Inspecionar paredes portantes em busca de fissuras em escada.', tech_diagnostics: 'Topografia, fissurômetros.' }],
                    'Viga baldrame': [{ type: 'Preventiva', activity: 'Inspeção da impermeabilização', periodicity: 'Anual', recommendations: 'Verificar a base das paredes em busca de sinais de umidade ascendente.', tech_diagnostics: 'Inspeção visual, medidor de umidade.' }],
                    'Radier': [{ type: 'Preventiva', activity: 'Inspeção de fissuras no piso', periodicity: 'Anual', recommendations: 'Verificar surgimento de fissuras e umidade ascendente, especialmente em bordas.', tech_diagnostics: 'Inspeção visual.' }],
                    'Estaca hélice contínua': [{ type: 'Preditiva', activity: 'Monitoramento de recalques', periodicity: 'Anual', recommendations: 'Verificar se há movimentação nos blocos de coroamento.', tech_diagnostics: 'Topografia.' }],
                    'Estaca Strauss': [{ type: 'Preditiva', activity: 'Monitoramento de recalques', periodicity: 'Anual', recommendations: 'Verificar se há movimentação nos blocos de coroamento.', tech_diagnostics: 'Topografia.' }],
                    'Estaca pré-moldada': [{ type: 'Preditiva', activity: 'Ensaio de integridade (PIT)', periodicity: 'A cada 5-10 anos', recommendations: 'Verificar a integridade do fuste da estaca, especialmente em solos agressivos.', tech_diagnostics: 'PIT.' }],
                    'Estaca metálica': [{ type: 'Preditiva', activity: 'Inspeção de corrosão no topo', periodicity: 'A cada 2 anos', recommendations: 'Verificar a região de contato entre a estaca e o bloco de coroamento.', tech_diagnostics: 'Inspeção visual.' }],
                    'Tubulão': [{ type: 'Preditiva', activity: 'Monitoramento de recalques', periodicity: 'Anual', recommendations: 'Acompanhar a estabilidade da estrutura sobre o tubulão.', tech_diagnostics: 'Topografia.' }],
                    'Microestaca': [{ type: 'Preditiva', activity: 'Monitoramento de recalques', periodicity: 'Semestral (em reforços)', recommendations: 'Verificar se a intervenção de reforço está sendo eficaz.', tech_diagnostics: 'Topografia.' }]
                }
            },
            vedacoes: {
                title: 'Sistemas de Vedação e Revestimento Externo',
                icon: '🖼️',
                tipologias: [
                    { title: 'Alvenaria de vedação', definicao: 'Paredes de blocos ou tijolos cerâmicos/de concreto que servem para fechar os vãos da estrutura.', componentes: 'Blocos/tijolos, argamassa de assentamento.', aplicacoes: 'Fechamento externo e interno da maioria dos edifícios.', vantagens: 'Baixo custo, bom isolamento acústico.', desvantagens: 'Peso considerável, processo "molhado" e lento.' },
                    { title: 'Painéis de concreto', definicao: 'Placas de concreto (pré-moldadas ou moldadas no local) usadas como fechamento de fachada.', componentes: 'Painéis de concreto, juntas de vedação.', aplicacoes: 'Edifícios industriais, comerciais e residenciais.', vantagens: 'Rapidez de montagem, durabilidade.', desvantagens: 'Peso elevado, necessidade de equipamentos de içamento.' },
                    { title: 'Drywall externo (Sistema EIFS)', definicao: 'Sistema composto por placas cimentícias ou gesso específico para uso externo, barreira de umidade, isolante térmico (EPS) e um revestimento final (base coat e finish coat).', componentes: 'Placa cimentícia, isolante EPS, malha de fibra de vidro, base coat, finish coat.', aplicacoes: 'Fachadas de edifícios comerciais, residenciais, retrofits.', vantagens: 'Leveza, rapidez, excelente isolamento térmico.', desvantagens: 'Sensível a impactos, exige execução rigorosa para evitar infiltrações.' },
                    { title: 'Painéis leves', definicao: 'Painéis do tipo sanduíche ou de fibrocimento utilizados para fechamentos rápidos.', componentes: 'Varia conforme o tipo de painel.', aplicacoes: 'Fechamentos industriais, divisórias.', vantagens: 'Leveza e rapidez.', desvantagens: 'Baixo isolamento acústico e térmico.' },
                    { title: 'Fachada ventilada', definicao: 'Sistema de revestimento que deixa uma câmara de ar entre a placa de acabamento e a parede de vedação, melhorando o desempenho térmico.', componentes: 'Estrutura de fixação (inserts, perfis), isolante, câmara de ar, placas de revestimento.', aplicacoes: 'Edifícios de alto padrão, hospitais, retrofits.', vantagens: 'Excelente desempenho térmico, protege a estrutura, durabilidade.', desvantagens: 'Custo elevado, mão de obra especializada.' },
                    { title: 'ACM (Aluminum Composite Material)', definicao: 'Painel composto por duas lâminas de alumínio com um núcleo de polietileno. Frequentemente usado em fachadas ventiladas.', componentes: 'Painel de ACM, estrutura de fixação.', aplicacoes: 'Fachadas comerciais, comunicação visual.', vantagens: 'Leveza, planicidade, variedade de cores.', desvantagens: 'Suscetível a riscos, núcleo pode ser combustível (verificar especificação).'},
                    { title: 'Pastilhas', definicao: 'Pequenas peças cerâmicas ou de vidro assentadas com argamassa colante.', componentes: 'Argamassa colante, pastilhas, rejunte.', aplicacoes: 'Revestimento de fachadas e piscinas.', vantagens: 'Durabilidade, variedade de cores.', desvantagens: 'Risco de desplacamento, rejunte suscetível a falhas.' },
                    { title: 'Revestimento cimentício', definicao: 'Placas ou argamassas que imitam texturas como madeira, pedra ou concreto aparente.', componentes: 'Placas ou argamassa cimentícia.', aplicacoes: 'Detalhes de fachada, paredes internas.', vantagens: 'Versatilidade estética, durabilidade.', desvantagens: 'Pode manchar com o tempo, peso considerável.' },
                    { title: 'Revestimento cerâmico externo', definicao: 'Placas cerâmicas de alta resistência e baixa absorção assentadas com argamassa colante.', componentes: 'Argamassa colante AC-II ou AC-III, placas cerâmicas, rejunte.', aplicacoes: 'Fachadas de edifícios residenciais e comerciais.', vantagens: 'Alta durabilidade, baixa manutenção, estanqueidade.', desvantagens: 'Risco de desplacamento se mal executado.' },
                    { title: 'Argamassa (reboco / monocapa)', definicao: 'Revestimento à base de cimento, cal e areia (reboco) ou industrializado que realiza as funções de base e acabamento em uma só camada (monocapa).', componentes: 'Argamassa, água.', aplicacoes: 'Base para pintura ou revestimento final em fachadas.', vantagens: 'Baixo custo (reboco), rapidez (monocapa).', desvantagens: 'Suscetível a fissuras de retração.' },
                    { title: 'Pintura acrílica ou elastomérica', definicao: 'Acabamento final em forma de película. A pintura elastomérica possui alta elasticidade, capaz de acompanhar a movimentação do substrato.', componentes: 'Selador, massa niveladora, tinta.', aplicacoes: 'Acabamento sobre reboco.', vantagens: 'Custo, variedade de cores. Elastomérica previne microfissuras.', desvantagens: 'Manutenção periódica (repintura).' }
                ],
                patologias: [
                    { title: 'Fissuras na Alvenaria', sintomas: 'Trincas nas paredes.', causas: 'Movimentação da estrutura, retração da argamassa.', typology_link: 'Alvenaria de vedação' },
                    { title: 'Infiltração em Juntas de Painéis', sintomas: 'Manchas de umidade no interior.', causas: 'Falha do selante das juntas.', typology_link: 'Painéis de concreto' },
                    { title: 'Infiltração no Sistema EIFS', sintomas: 'Bolhas, manchas, descolamento do revestimento.', causas: 'Falha na vedação de janelas ou juntas, perfuração da barreira de umidade.', typology_link: 'Drywall externo (Sistema EIFS)' },
                    { title: 'Desplacamento Cerâmico / Pastilhas', sintomas: 'Som oco à percussão, queda de placas.', causas: 'Uso de argamassa inadequada, falha na aplicação, infiltração pelo rejunte.', typology_link: 'Revestimento cerâmico externo' },
                    { title: 'Eflorescência', sintomas: 'Manchas esbranquiçadas na superfície do revestimento (rejunte, tijolo, concreto).', causas: 'Sais solúveis presentes nos materiais que são transportados pela água para a superfície.', typology_link: 'Revestimento cerâmico externo' },
                    { title: 'Manchas e Desbotamento', sintomas: 'Alteração da cor original da fachada.', causas: 'Ação de raios UV, poluição, crescimento de fungos.', typology_link: 'Pintura acrílica ou elastomérica' },
                    { title: 'Saponificação', sintomas: 'Manchas escuras e pegajosas na pintura, com descascamento.', causas: 'Umidade alcalina vinda da base (reboco novo) que ataca a resina da tinta.', typology_link: 'Pintura acrílica ou elastomérica' },
                    { title: 'Fissuras e Descolamento de Reboco', sintomas: 'Trincas, som oco, queda de placas de reboco.', causas: 'Falta de aderência, espessura excessiva.', typology_link: 'Argamassa (reboco / monocapa)' },
                    { title: 'Corrosão das Ancoragens', sintomas: 'Manchas de ferrugem escorrendo das fixações, placas soltas.', causas: 'Infiltração de água na câmara de ar.', typology_link: 'Fachada ventilada' },
                    { title: 'Deformação Térmica e Frestas nas Juntas', sintomas: 'Abertura nas emendas dos painéis, infiltração de água e ar, desalinhamento visual.', causas: 'Dilatação e contração térmica diferencial acumulada, fixação mecânica insuficiente ou selante de junta rígido demais.', typology_link: 'Painéis leves' },
                    { title: 'Descolamento das Lâminas de Alumínio (Delaminação)', sintomas: 'Presença de bolhas de ar sob a lâmina externa, ondulações na superfície do painel.', causas: 'Uso de material com núcleo de polietileno de baixa qualidade, intemperismo severo ou impacto mecânico localizado.', typology_link: 'ACM (Aluminum Composite Material)' },
                    { title: 'Desplacamento de Pastilhas', sintomas: 'Som oco ao teste de percussão, queda de peças ou de placas inteiras de pastilhas.', causas: 'Falha na ancoragem da argamassa colante, falta de juntas de movimentação adequadas ou infiltração de água pelo rejunte danificado.', typology_link: 'Pastilhas' },
                    { title: 'Fissuração e Eflorescência em Placas Cimentícias', sintomas: 'Fissuras superficiais em teia de aranha, manchas esbranquiçadas e perda de brilho.', causas: 'Retração hidráulica da placa, ausência de impermeabilização ou hidrofugação adequada antes da exposição às intempéries.', typology_link: 'Revestimento cimentício' }
                ],
                diagnostico: [
                    { title: 'Inspeção Visual e Tátil', desc: 'Identificação de fissuras, manchas, bolhas e descolamentos. O teste de percussão é fundamental para revestimentos.' },
                    { title: 'Ensaios de Aderência', desc: 'Mede a resistência de aderência de revestimentos argamassados e cerâmicos.' },
                    { title: 'Termografia Infravermelha', desc: 'Detecta infiltrações de umidade ocultas por trás dos revestimentos, que são precursoras de patologias.' }
                ],
                 tecnologias: [
                    { icon: '🌡️', title: 'Termografia & IA', desc: 'Análise de imagens térmicas com IA para identificar umidade, perdas energéticas e risco de desplacamento.' },
                    { icon: '🛰️', title: 'Drones para Inspeção', desc: 'Captura de imagens de alta resolução para análise detalhada de fachadas, reduzindo custos e riscos com andaimes.' },
                    { icon: '🏢', title: 'BIM para Fachadas', desc: 'Modelagem que permite a gestão do ciclo de vida do revestimento, incluindo datas de manutenção e especificações de materiais.' }
                ],
                maintenance_schedules: {
                    'Revestimento cerâmico externo': [
                        { type: 'Preventiva', activity: 'Inspeção visual de rejuntes e peças trincadas', periodicity: 'Anual', recommendations: 'Verificar falhas no rejuntamento que podem ser pontos de infiltração.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preditiva', activity: 'Mapeamento de som oco (percussão)', periodicity: 'A cada 2 anos', recommendations: 'Identificar placas em processo de desplacamento antes da queda.', tech_diagnostics: 'Teste de percussão.' },
                        { type: 'Preventiva', activity: 'Limpeza da fachada', periodicity: 'A cada 2-3 anos', recommendations: 'Remover poluição e microrganismos que degradam o rejunte.', tech_diagnostics: 'Hidrojateamento.' },
                    ],
                    'Pastilhas': [
                        { type: 'Preventiva', activity: 'Inspeção visual de rejuntes e peças soltas', periodicity: 'Anual', recommendations: 'Verificar falhas no rejuntamento que podem ser pontos de infiltração.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preditiva', activity: 'Mapeamento de som oco (percussão)', periodicity: 'A cada 2 anos', recommendations: 'Identificar áreas com risco de desplacamento.', tech_diagnostics: 'Teste de percussão.' },
                    ],
                    'Argamassa (reboco / monocapa)': [
                        { type: 'Preventiva', activity: 'Inspeção de fissuras, trincas e bolhas', periodicity: 'Anual', recommendations: 'Tratar pequenas fissuras antes que se tornem um problema maior.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preditiva', activity: 'Ensaio de aderência', periodicity: 'A cada 5 anos', recommendations: 'Verificar a aderência do reboco em áreas críticas ou com som oco.', tech_diagnostics: 'Ensaio de aderência à percussão.' },
                    ],
                    'Pintura acrílica ou elastomérica': [
                        { type: 'Preventiva', activity: 'Limpeza da fachada', periodicity: 'Anual', recommendations: 'Remover poluição e fungos para aumentar a vida útil da pintura.', tech_diagnostics: 'Hidrojateamento.' },
                        { type: 'Corretiva Planejada', activity: 'Tratamento de fissuras e repintura geral', periodicity: 'A cada 3-5 anos', recommendations: 'Renovar a camada de proteção e a estética da edificação.', tech_diagnostics: 'Inspeção visual.' }
                    ],
                    'Fachada ventilada': [
                        { type: 'Preventiva', activity: 'Inspeção das juntas e alinhamento das placas', periodicity: 'Anual', recommendations: 'Verificar a integridade dos selantes e o alinhamento das placas.', tech_diagnostics: 'Inspeção visual, drones.' },
                        { type: 'Preventiva', activity: 'Limpeza das placas', periodicity: 'A cada 2-3 anos', recommendations: 'Manter a estética e evitar manchas permanentes.', tech_diagnostics: 'Hidrojateamento ou limpeza manual.' },
                    ],
                    'Alvenaria de vedação': [{ type: 'Preventiva', activity: 'Inspeção de fissuras e umidade', periodicity: 'Anual', recommendations: 'Geralmente coberta por outro revestimento, a inspeção é indireta.', tech_diagnostics: 'Inspeção visual.' }],
                    'Painéis de concreto': [{ type: 'Preventiva', activity: 'Inspeção e manutenção dos selantes das juntas', periodicity: 'A cada 2 anos', recommendations: 'Garantir a estanqueidade da fachada.', tech_diagnostics: 'Inspeção visual.' }],
                    'Drywall externo (Sistema EIFS)': [{ type: 'Preventiva', activity: 'Inspeção das juntas de dilatação e vedações', periodicity: 'Anual', recommendations: 'Pontos críticos para infiltração.', tech_diagnostics: 'Inspeção visual.' }],
                    'Painéis leves': [{ type: 'Preventiva', activity: 'Inspeção das fixações e vedações', periodicity: 'Anual', recommendations: 'Verificar corrosão nos parafusos e integridade das juntas.', tech_diagnostics: 'Inspeção visual.' }],
                    'ACM (Aluminum Composite Material)': [{ type: 'Preventiva', activity: 'Limpeza e inspeção das juntas', periodicity: 'Anual', recommendations: 'Manter a estética e verificar a vedação.', tech_diagnostics: 'Inspeção visual.' }],
                    'Revestimento cimentício': [{ type: 'Preventiva', activity: 'Aplicação de hidrofugante ou selante', periodicity: 'A cada 3-4 anos', recommendations: 'Proteger contra manchas e umidade.', tech_diagnostics: 'Inspeção visual.' }]
                }
            },
            coberturas: {
                title: 'Sistemas de Cobertura',
                icon: '🏠',
                tipologias: [
                    { title: 'Telhado cerâmico', definicao: 'Cobertura inclinada com telhas de argila queimada, sobrepostas em uma estrutura de suporte.', componentes: 'Estrutura de madeira ou metálica, ripas, caibros, telhas, cumeeiras, rufos.', aplicacoes: 'Residências, edifícios históricos.', vantagens: 'Bom isolamento térmico, estética tradicional, durabilidade.', desvantagens: 'Peso elevado, fragilidade das telhas, requer inclinação mínima.' },
                    { title: 'Telhado de concreto', definicao: 'Similar ao cerâmico, mas utiliza telhas de concreto, geralmente mais pesadas e com encaixes precisos.', componentes: 'Estrutura de suporte, telhas de concreto, cumeeiras.', aplicacoes: 'Residências de médio e alto padrão.', vantagens: 'Alta durabilidade, variedade de cores, encaixes precisos.', desvantagens: 'Peso muito elevado, custo superior ao cerâmico.' },
                    { title: 'Telhado metálico', definicao: 'Cobertura com telhas de aço galvanizado ou galvalume. Podem ser simples ou do tipo sanduíche com isolante termoacústico.', componentes: 'Telhas metálicas, terças, parafusos de fixação com vedação.', aplicacoes: 'Galpões industriais, centros comerciais, residências com estilo industrial.', vantagens: 'Leveza, rapidez de montagem, vence grandes vãos.', desvantagens: 'Baixo isolamento (se não for sanduíche), ruído com chuva.' },
                    { title: 'Telhado fibrocimento', definicao: 'Cobertura com telhas onduladas de cimento reforçado com fibras sintéticas (CRFS).', componentes: 'Telhas de fibrocimento, parafusos ou ganchos de fixação.', aplicacoes: 'Galpões, obras de baixo custo, coberturas provisórias.', vantagens: 'Baixo custo, leveza.', desvantagens: 'Baixo desempenho termoacústico, fragilidade, estética simples.' },
                    { title: 'Telhado verde', definicao: 'Sistema de cobertura que inclui camadas de substrato e vegetação sobre uma laje impermeabilizada.', componentes: 'Laje, impermeabilização, camada drenante, manta geotêxtil, substrato, vegetação.', aplicacoes: 'Edifícios que buscam sustentabilidade, conforto térmico e área de lazer.', vantagens: 'Excelente isolamento térmico, retém água da chuva, melhora a qualidade do ar.', desvantagens: 'Custo elevado, exige manutenção da vegetação, sobrecarga na estrutura.' },
                    { title: 'Cobertura plana (laje impermeabilizada)', definicao: 'Laje de concreto utilizada como cobertura, protegida por um sistema de impermeabilização e proteção mecânica.', componentes: 'Laje, camada de regularização, impermeabilização, proteção mecânica (contrapiso).', aplicacoes: 'Terraços, áreas de lazer, coberturas de edifícios.', vantagens: 'Aproveitamento do espaço como área útil.', desvantagens: 'Exige sistema de impermeabilização e drenagem perfeitos.' },
                    { title: 'Cobertura invertida', definicao: 'Tipo de cobertura plana onde o isolamento térmico é colocado ACIMA da impermeabilização, protegendo-a.', componentes: 'Laje, impermeabilização, isolamento térmico (XPS), camada de lastro (brita, piso).', aplicacoes: 'Coberturas com tráfego de pessoas ou veículos.', vantagens: 'Protege a impermeabilização contra danos mecânicos e choques térmicos.', desvantagens: 'Custo mais elevado, execução especializada.' },
                    { title: 'Cobertura translúcida', definicao: 'Cobertura que permite a passagem de luz natural, utilizando materiais como policarbonato ou vidro laminado.', componentes: 'Estrutura de suporte, placas de policarbonato ou vidro, sistemas de vedação.', aplicacoes: 'Claraboias, jardins de inverno, estádios, shoppings.', vantagens: 'Aproveitamento da luz natural, estética.', desvantagens: 'Pode gerar calor excessivo (efeito estufa), exige limpeza frequente.' },
                    { title: 'Cobertura tensionada', definicao: 'Estrutura leve tracionada, composta por membranas (lonas) e cabos de aço, sustentada por mastros.', componentes: 'Membrana (ex: PTFE, PVC), cabos de aço, mastros, ancoragens.', aplicacoes: 'Coberturas de grandes vãos como estádios, circos, áreas de eventos.', vantagens: 'Vence vãos imensos com leveza, formas arquitetônicas arrojadas.', desvantagens: 'Custo muito elevado, projeto e execução altamente especializados.' }
                ],
                patologias: [
                    { title: 'Quebra e Deslocamento de Telhas', sintomas: 'Goteiras, infiltração no forro.', causas: 'Trânsito de pessoas, ventos fortes, granizo, má fixação.', typology_link: 'Telhado cerâmico' },
                    { title: 'Entupimento de Calhas e Rufos', sintomas: 'Transbordamento de água pelas calhas, umidade nas paredes sob a cobertura.', causas: 'Acúmulo de folhas, poeira, detritos.', typology_link: 'Telhado cerâmico' },
                    { title: 'Corrosão de Fixadores', sintomas: 'Pontos de ferrugem nas telhas, goteiras nos pontos de fixação.', causas: 'Vedação do parafuso ressecada ou danificada, parafuso inadequado.', typology_link: 'Telhado metálico' },
                    { title: 'Dano por Sucção do Vento (Uplift)', sintomas: 'Telhas metálicas levantadas ou arrancadas após ventanias.', causas: 'Fixação insuficiente ou inadequada para a carga de vento local.', typology_link: 'Telhado metálico' },
                    { title: 'Falha na Impermeabilização da Laje', sintomas: 'Infiltração, goteiras, manchas e bolor no teto do último pavimento.', causas: 'Fim da vida útil da manta, falha na execução, perfuração acidental.', typology_link: 'Cobertura plana (laje impermeabilizada)' },
                    { title: 'Empoçamento Crônico de Água', sintomas: 'Formação de poças d\'água que não secam após 48h.', causas: 'Caimento inadequado da laje, obstrução de ralos.', typology_link: 'Cobertura plana (laje impermeabilizada)' },
                    { title: 'Obstrução do Sistema de Drenagem', sintomas: 'Morte da vegetação, empoçamento de água, sobrecarga na estrutura.', causas: 'Ralos e camada drenante entupidos com raízes ou substrato.', typology_link: 'Telhado verde' },
                    { title: 'Rasgos ou Furos na Membrana', sintomas: 'Goteiras, perda de tensão.', causas: 'Vandalismo, queda de objetos pontiagudos, abrasão.', typology_link: 'Cobertura tensionada' },
                    { title: 'Infiltração nas Juntas do Policarbonato', sintomas: 'Gotejamento, manchas nas placas.', causas: 'Ressecamento das borrachas de vedação, dilatação térmica excessiva.', typology_link: 'Cobertura translúcida' }
                ],
                diagnostico: [
                    { title: 'Inspeção Visual com Drones', desc: 'Mapeamento aéreo para identificar telhas quebradas, deslocadas, pontos de corrosão e outras anomalias sem a necessidade de acesso direto.' },
                    { title: 'Teste de Estanqueidade (Lâmina d\'água)', desc: 'Criação de uma camada de água sobre lajes impermeabilizadas para verificar a existência de pontos de vazamento após um período determinado.' },
                    { title: 'Termografia', desc: 'Identificação de pontos de infiltração em lajes e coberturas através da diferença de temperatura causada pela umidade.' }
                ],
                tecnologias: [
                    { icon: '💧', title: 'Sensores de Umidade', desc: 'Instalados sob a impermeabilização para detectar vazamentos no momento em que ocorrem, antes que causem danos visíveis.' },
                    { icon: '🧠', title: 'IA para Análise de Imagens', desc: 'Software que analisa as imagens de drones para identificar e classificar automaticamente patologias como fissuras, corrosão e deslocamento de telhas.' },
                    { icon: '🌱', title: 'Sistemas de Irrigação Inteligente', desc: 'Em telhados verdes, sensores de umidade do solo e dados meteorológicos ajustam a rega automaticamente, economizando água e garantindo a saúde das plantas.' }
                ],
                maintenance_schedules: {
                    'Telhado cerâmico': [
                        { type: 'Preventiva', activity: 'Limpeza de calhas e rufos', periodicity: 'Semestral', recommendations: 'Remover folhas e detritos para evitar transbordamento.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preventiva', activity: 'Inspeção visual de telhas quebradas ou deslocadas', periodicity: 'Anual', recommendations: 'Substituir peças danificadas para evitar goteiras.', tech_diagnostics: 'Inspeção visual, drones.' },
                    ],
                    'Telhado de concreto': [
                        { type: 'Preventiva', activity: 'Limpeza de calhas e rufos', periodicity: 'Semestral', recommendations: 'Remover folhas e detritos para evitar transbordamento.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preventiva', activity: 'Inspeção visual de telhas quebradas ou deslocadas', periodicity: 'Anual', recommendations: 'Substituir peças danificadas para evitar goteiras.', tech_diagnostics: 'Inspeção visual, drones.' },
                    ],
                    'Telhado metálico': [
                        { type: 'Preventiva', activity: 'Limpeza de calhas e rufos', periodicity: 'Semestral', recommendations: 'Essencial para evitar corrosão por acúmulo de detritos.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preventiva', activity: 'Inspeção das vedações dos parafusos de fixação', periodicity: 'Anual', recommendations: 'Verificar ressecamento das borrachas (garnets) para evitar infiltração.', tech_diagnostics: 'Inspeção visual.' },
                    ],
                    'Cobertura plana (laje impermeabilizada)': [
                        { type: 'Preventiva', activity: 'Limpeza de ralos e sistemas de drenagem', periodicity: 'Trimestral', recommendations: 'Evitar empoçamento que sobrecarrega a impermeabilização.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preditiva', activity: 'Teste de estanqueidade', periodicity: 'A cada 2-3 anos', recommendations: 'Verificar a integridade do sistema antes do fim da vida útil.', tech_diagnostics: 'Teste de lâmina d\'água.' },
                    ],
                    'Telhado verde': [
                        { type: 'Preventiva', activity: 'Limpeza de ralos e camada drenante', periodicity: 'Trimestral', recommendations: 'Evitar obstrução por raízes e substrato.', tech_diagnostics: 'Inspeção visual.' },
                        { type: 'Preventiva', activity: 'Poda, adubação e controle de pragas da vegetação', periodicity: 'Conforme necessidade', recommendations: 'Manter a saúde da vegetação.', tech_diagnostics: 'Inspeção visual.' },
                    ],
                    'Telhado fibrocimento': [{ type: 'Preventiva', activity: 'Inspeção de fixadores e trincas', periodicity: 'Anual', recommendations: 'Verificar o aperto dos parafusos e procurar por fissuras nas telhas.', tech_diagnostics: 'Inspeção visual.' }],
                    'Cobertura invertida': [{ type: 'Preventiva', activity: 'Inspeção do lastro e juntas do piso', periodicity: 'Anual', recommendations: 'Garantir que o isolamento térmico e a impermeabilização abaixo estão protegidos.', tech_diagnostics: 'Inspeção visual.' }],
                    'Cobertura translúcida': [{ type: 'Preventiva', activity: 'Limpeza das placas', periodicity: 'Anual', recommendations: 'Manter a translucidez e verificar a integridade das vedações.', tech_diagnostics: 'Inspeção visual.' }],
                    'Cobertura tensionada': [{ type: 'Preventiva', activity: 'Inspeção da membrana e cabos', periodicity: 'Anual', recommendations: 'Verificar furos, rasgos e a tensão dos cabos.', tech_diagnostics: 'Inspeção visual especializada.' }]
                }
            },
            impermeabilizacao: {
                title: 'Sistemas de Impermeabilização',
                icon: '💧',
                tipologias: [
                    { title: 'Manta asfáltica', definicao: 'Sistema pré-fabricado, composto por asfalto modificado e estruturante (poliéster ou fibra de vidro), aplicado com maçarico ou a frio.', componentes: 'Primer, manta asfáltica, proteção mecânica.', aplicacoes: 'Lajes, piscinas, áreas frias, fundações.', vantagens: 'Alta resistência, espessura controlada.', desvantagens: 'Exige mão de obra especializada, juntas são pontos críticos.' },
                    { title: 'Manta líquida (PU, acrílica)', definicao: 'Membrana flexível aplicada na forma líquida, que cura no local. O PU (poliuretano) é mais resistente e pode ficar exposto. O acrílico é mais simples de aplicar.', componentes: 'Primer, membrana líquida, tela de reforço (em pontos críticos).', aplicacoes: 'Lajes, telhados, áreas onde a manta asfáltica é inviável.', vantagens: 'Sem emendas, molda-se a qualquer superfície.', desvantagens: 'Requer controle rigoroso da espessura durante a aplicação.' },
                    { title: 'Membrana EPDM / PVC', definicao: 'Mantas sintéticas de borracha (EPDM) ou plástico (PVC), geralmente aplicadas soltas ou com fixação mecânica nas bordas.', componentes: 'Manta EPDM/PVC, adesivos, fixadores.', aplicacoes: 'Grandes lajes, telhados metálicos, reservatórios.', vantagens: 'Alta durabilidade e elasticidade, rapidez de aplicação em grandes áreas.', desvantagens: 'Custo elevado, juntas termossoldadas exigem equipamento específico.' },
                    { title: 'Cristalização capilar', definicao: 'Argamassa ou pintura cimentícia que reage com a umidade do concreto, formando cristais que bloqueiam os poros e impedem a passagem de água.', componentes: 'Produto cimentício cristalizante.', aplicacoes: 'Estruturas de concreto em contato com água (reservatórios, subsolos), pelo lado interno (pressão negativa).', vantagens: 'Resiste a altas pressões negativas, torna-se parte do concreto.', desvantagens: 'Não funciona em blocos ou alvenaria, apenas em concreto.' },
                    { title: 'Emulsão asfáltica', definicao: 'Pintura asfáltica à base de água, aplicada a frio, que forma uma membrana protetora.', componentes: 'Emulsão asfáltica.', aplicacoes: 'Fundações, muros de arrimo (lado em contato com a terra), áreas sem grande movimentação.', vantagens: 'Baixo custo, fácil aplicação.', desvantagens: 'Baixa resistência mecânica e a raios UV, não pode ficar exposta.' },
                    { title: 'Tinta impermeabilizante', definicao: 'Tinta acrílica com aditivos impermeabilizantes, que forma uma película flexível sobre a superfície.', componentes: 'Tinta acrílica impermeável.', aplicacoes: 'Paredes externas sujeitas a batida de chuva.', vantagens: 'Dupla função (acabamento e impermeabilização), fácil aplicação.', desvantagens: 'Baixa espessura, não suporta fissuras grandes.' },
                    { title: 'Aditivos hidrofugantes', definicao: 'Produtos adicionados à argamassa ou concreto que repelem a água, mas não vedam os poros (não são impermeabilizantes, mas reduzem a absorção).', componentes: 'Aditivo líquido ou em pó.', aplicacoes: 'Argamassas de reboco externo, concreto de elementos expostos.', vantagens: 'Protege a parede sem criar uma película, permitindo que "respire".', desvantagens: 'Não é eficaz contra pressão de água.' }
                ],
                patologias: [
                    { title: 'Furo ou Rasgo na Manta', sintomas: 'Infiltração pontual.', causas: 'Instalação de antenas, queda de objetos, tráfego de pessoas sem proteção adequada.', typology_link: 'Manta asfáltica' },
                    { title: 'Falha nas Emendas', sintomas: 'Infiltração linear.', causas: 'Má execução da solda da manta (superaquecimento ou falta de aquecimento).', typology_link: 'Manta asfáltica' },
                    { title: 'Formação de Bolhas (Blistering)', sintomas: 'Bolhas na superfície da manta.', causas: 'Umidade aprisionada sob a manta durante a aplicação.', typology_link: 'Manta asfáltica' },
                    { title: 'Espessura Insuficiente', sintomas: 'Infiltração difusa, desgaste prematuro.', causas: 'Aplicação de poucas demãos, economia de material.', typology_link: 'Manta líquida (PU, acrílica)' },
                    { title: 'Descolamento da Membrana', sintomas: 'Bolhas, infiltração generalizada.', causas: 'Superfície da base estava suja, úmida ou sem primer.', typology_link: 'Manta líquida (PU, acrílica)' },
                    { title: 'Furo na Membrana', sintomas: 'Vazamento em reservatórios, infiltração.', causas: 'Perfuração acidental durante a instalação ou uso.', typology_link: 'Membrana EPDM / PVC' },
                    { title: 'Falha por Fissura Ativa', sintomas: 'Infiltração mesmo com o produto aplicado.', causas: 'O sistema não suporta a movimentação da fissura no concreto. O produto só veda poros.', typology_link: 'Cristalização capilar' },
                    { title: 'Degradação por Raios UV', sintomas: 'Ressecamento e fissuração da membrana.', causas: 'Produto deixado exposto ao sol sem proteção mecânica.', typology_link: 'Emulsão asfáltica' },
                    { title: 'Descamação e Enrugamento da Película', sintomas: 'Desprendimento da tinta em forma de folhas ou placas, bolhas e perda de aderência.', causas: 'Aplicação sobre substrato úmido, pulverulento ou com alcalinidade elevada sem primer adequado.', typology_link: 'Tinta impermeabilizante' },
                    { title: 'Perda da Hidrofobicidade Superficial', sintomas: 'Absorção rápida de água pela argamassa (escurecimento imediato ao molhar), infiltração de umidade interna.', causas: 'Lixiviação natural do aditivo pela ação contínua da chuva e radiação UV ao longo do tempo.', typology_link: 'Aditivos hidrofugantes' }
                ],
                diagnostico: [
                    { title: 'Teste de Estanqueidade', desc: 'Verificação da eficácia do sistema através da aplicação de uma lâmina d\'água por um período mínimo de 72 horas.' },
                    { title: 'Termografia', desc: 'Identificação de umidade embutida sob a impermeabilização, indicando pontos de falha.' },
                    { title: 'Holiday Detector', desc: 'Equipamento elétrico que detecta furos e descontinuidades em sistemas de mantas líquidas e membranas.' }
                ],
                tecnologias: [
                    { icon: '💧', title: 'Sensores de Umidade (Sistema de Detecção de Vazamentos)', desc: 'Malha de sensores instalada entre a impermeabilização e a proteção mecânica para localizar com precisão milimétrica qualquer vazamento.' },
                    { icon: '🤖', title: 'Aplicação Robotizada', desc: 'Uso de robôs para aplicação de mantas líquidas, garantindo espessura uniforme e qualidade superior.' },
                    { icon: '🧪', title: 'Impermeabilizantes Autoregenerativos', desc: 'Produtos com microcápsulas que se rompem com o surgimento de uma fissura, liberando um agente de cura que veda o dano automaticamente.' }
                ],
                 maintenance_schedules: {
                    'Manta asfáltica': [{ type: 'Preventiva', activity: 'Inspeção visual da proteção mecânica e ralos', periodicity: 'Anual', recommendations: 'Verificar fissuras na proteção mecânica e limpar ralos.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preditiva', activity: 'Teste de estanqueidade', periodicity: 'A cada 3-5 anos', recommendations: 'Garantir a integridade do sistema.', tech_diagnostics: 'Teste de lâmina d\'água.' }],
                    'Manta líquida (PU, acrílica)': [{ type: 'Preventiva', activity: 'Inspeção visual de fissuras, bolhas ou desgaste', periodicity: 'Anual', recommendations: 'Realizar reparos pontuais para evitar infiltrações maiores.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Corretiva Planejada', activity: 'Reaplicação de camada protetora', periodicity: 'A cada 5-7 anos', recommendations: 'Renovar a camada de sacrifício e proteção UV.', tech_diagnostics: 'Inspeção visual.' }],
                    'Membrana EPDM / PVC': [{ type: 'Preventiva', activity: 'Inspeção de juntas e pontos de fixação', periodicity: 'Anual', recommendations: 'Verificar a integridade das soldas e fixações mecânicas.', tech_diagnostics: 'Inspeção visual.' }],
                    'Cristalização capilar': [{ type: 'Preventiva', activity: 'Inspeção visual de novas fissuras no concreto', periodicity: 'Anual', recommendations: 'O sistema não é flexível. Novas fissuras precisam ser tratadas.', tech_diagnostics: 'Inspeção visual.' }],
                    'Emulsão asfáltica': [{ type: 'Preventiva', activity: 'Inspeção da integridade (se acessível)', periodicity: 'A cada 2 anos', recommendations: 'Geralmente usado em áreas enterradas, a inspeção é difícil.', tech_diagnostics: 'Inspeção visual (se possível).' }],
                    'Tinta impermeabilizante': [{ type: 'Corretiva Planejada', activity: 'Repintura da fachada', periodicity: 'A cada 3-5 anos', recommendations: 'Renovar a camada de proteção e estética.', tech_diagnostics: 'Inspeção visual.' }],
                    'Aditivos hidrofugantes': [{ type: 'Preventiva', activity: 'Reaplicação de hidrofugante de superfície', periodicity: 'A cada 2-3 anos', recommendations: 'O efeito do hidrofugante diminui com o tempo e exposição.', tech_diagnostics: 'Teste de gota d\'água.' }]
                }
            }
        }
    },
    instalacoes: {
        title: 'Instalações Prediais',
        intro: 'Esta seção detalha os sistemas que fornecem os serviços essenciais do dia a dia: água, energia elétrica, gás, climatização. A manutenção desses sistemas garante conforto, segurança, saúde e eficiência operacional.',
        systems: {
            hidrossanitarios: {
                title: 'Sistemas Hidrossanitários',
                icon: '🚿',
                tipologias: [
                    { title: 'Água fria (PVC, PPR, PEX, cobre)', definicao: 'Distribuição de água potável da rede pública ou reservatório para os pontos de consumo.', componentes: 'Tubos, conexões, registros, válvulas redutoras de pressão, reservatórios.', aplicacoes: 'Toda e qualquer edificação.', vantagens: 'Variedade de materiais para diferentes necessidades de pressão e temperatura.', desvantagens: 'Pontos de vazamento são comuns se mal executado.' },
                    { title: 'Água quente (CPVC, PEX, cobre)', definicao: 'Distribuição de água aquecida para chuveiros e torneiras.', componentes: 'Tubos resistentes a altas temperaturas, aquecedores, misturadores.', aplicacoes: 'Residências, hotéis, hospitais.', vantagens: 'Conforto térmico.', desvantagens: 'Custo de instalação e consumo de energia.' },
                    { title: 'Esgoto (PVC, PEAD)', definicao: 'Coleta e transporte dos efluentes de banheiros, cozinhas e áreas de serviço para a rede pública ou estação de tratamento.', componentes: 'Tubos, caixas sifonadas, ralos, caixas de gordura, tubos de ventilação.', aplicacoes: 'Toda e qualquer edificação.', vantagens: 'Afasta os resíduos de forma segura e higiênica.', desvantagens: 'Suscetível a entupimentos e mau cheiro.' },
                    { title: 'Água pluvial', definicao: 'Coleta e transporte da água da chuva de telhados, lajes e pisos para a rede pública ou sistema de reuso.', componentes: 'Calhas, rufos, ralos, condutores verticais e horizontais.', aplicacoes: 'Toda e qualquer edificação.', vantagens: 'Previne alagamentos e infiltrações.', desvantagens: 'Requer limpeza periódica de calhas e ralos.' },
                    { title: 'Reuso de água cinza', definicao: 'Sistema que coleta a água de chuveiros e lavatórios, a trata e a reutiliza para fins não potáveis, como descargas e irrigação.', componentes: 'Sistema de coleta, tratamento (filtração, cloração), reservatório de água de reuso.', aplicacoes: 'Edifícios sustentáveis.', vantagens: 'Redução significativa no consumo de água potável.', desvantagens: 'Custo de implantação e manutenção do sistema de tratamento.' },
                    { title: 'Aproveitamento de água da chuva', definicao: 'Sistema que capta, filtra e armazena a água da chuva para uso em fins não potáveis.', componentes: 'Calhas, filtros, cisterna.', aplicacoes: 'Residências e edifícios comerciais.', vantagens: 'Reduz o consumo de água potável e a sobrecarga na rede pluvial.', desvantagens: 'Requer grande espaço para a cisterna.' },
                    { title: 'Sistema de aquecimento (solar, gás, elétrico)', definicao: 'Equipamentos que aquecem a água para consumo.', componentes: 'Coletores solares, boiler, aquecedor de passagem a gás, chuveiro elétrico.', aplicacoes: 'Diversas, dependendo do custo-benefício e da disponibilidade de energia.', vantagens: 'Solar é sustentável, a gás tem alta vazão, elétrico é barato para instalar.', desvantagens: 'Solar depende do clima, a gás exige ventilação, elétrico tem alto custo de operação.' }
                ],
                patologias: [
                    { title: 'Vazamentos em Conexões', sintomas: 'Manchas de umidade, gotejamentos, mofo, queda na pressão.', causas: 'Falha na execução da junta (pouca cola, rosca mal vedada), movimentação da tubulação.', typology_link: 'Água fria (PVC, PPR, PEX, cobre)' },
                    { title: 'Baixa Pressão nos Pontos de Consumo', sintomas: 'Fluxo de água fraco em torneiras e chuveiros.', causas: 'Subdimensionamento da tubulação, vazamentos na rede, registros parcialmente fechados, problema na VRP.', typology_link: 'Água fria (PVC, PPR, PEX, cobre)' },
                    { title: 'Ruído (Golpe de Aríete)', sintomas: 'Forte barulho na tubulação ao fechar uma torneira ou válvula.', causas: 'Fechamento rápido de válvulas, alta pressão na rede.', typology_link: 'Água quente (CPVC, PEX, cobre)' },
                    { title: 'Entupimentos e Mau Cheiro', sintomas: 'Escoamento lento, refluxo, odor de esgoto.', causas: 'Descarte inadequado de resíduos, falta de ventilação na rede de esgoto.', typology_link: 'Esgoto (PVC, PEAD)' },
                    { title: 'Retorno de Espuma pelos Ralos', sintomas: 'Espuma de sabão retorna pelo ralo do piso, especialmente em andares baixos.', causas: 'Excesso de sabão em pó na máquina de lavar, falta de ventilação adequada na prumada de esgoto.', typology_link: 'Esgoto (PVC, PEAD)' },
                    { title: 'Transbordamento de Calhas', sintomas: 'Água escorrendo pelas paredes externas.', causas: 'Obstrução por folhas e detritos, subdimensionamento.', typology_link: 'Água pluvial' },
                    { title: 'Contaminação da Água de Reuso', sintomas: 'Água com cor, odor ou turbidez.', causas: 'Falha no sistema de tratamento, falta de limpeza dos filtros.', typology_link: 'Reuso de água cinza' },
                    { title: 'Baixo Desempenho do Aquecedor Solar', sintomas: 'Água não aquece o suficiente.', causas: 'Placas coletoras sujas, sombreamento, ar na tubulação.', typology_link: 'Sistema de aquecimento (solar, gás, elétrico)' },
                    { title: 'Entupimento de Filtros e Proliferação de Vetores na Cisterna', sintomas: 'Água turva ou com odor desagradável, interrupção no fluxo de captação.', causas: 'Acúmulo de folhas, galhos e fezes de pássaros devido à falta de descarte das primeiras chuvas (first flush) ou limpeza dos filtros.', typology_link: 'Aproveitamento de água da chuva' }
                ],
                diagnostico: [
                    { title: 'Vídeo Inspeção', desc: 'Uso de microcâmeras para inspecionar o interior de tubulações de esgoto e pluviais.' },
                    { title: 'Geofone e Correlacionador de Ruídos', desc: 'Detectam vazamentos ocultos em redes pressurizadas através da análise do som da água escapando.' },
                    { title: 'Teste de Estanqueidade com Fumaça', desc: 'Injeta-se fumaça na rede de esgoto para identificar pontos de mau cheiro ou infiltração de gases.'}
                ],
                tecnologias: [
                    { icon: '🌊', title: 'IoT & Hidrômetros Inteligentes', desc: 'Monitoramento de vazão em tempo real que detecta padrões de consumo anormais indicativos de vazamento.' },
                    { icon: '🧠', title: 'IA para Detecção de Vazamentos', desc: 'Algoritmos que analisam dados de pressão e ruído da rede para identificar e localizar vazamentos com alta precisão.' },
                    { icon: '🏢', title: 'BIM para Instalações (MEP)', desc: 'Modelagem 3D que previne conflitos na instalação (clash detection) e facilita a manutenção futura, mostrando a localização exata de cada tubo.' }
                ],
                maintenance_schedules: {
                    'Água fria (PVC, PPR, PEX, cobre)': [{ type: 'Preventiva', activity: 'Limpeza de reservatórios de água', periodicity: 'Semestral', recommendations: 'Garantir a potabilidade da água.', tech_diagnostics: 'Análise de potabilidade.' }, { type: 'Preditiva', activity: 'Monitoramento de consumo', periodicity: 'Mensal', recommendations: 'Analisar contas de água para detectar grandes vazamentos.', tech_diagnostics: 'Análise de contas.' }],
                    'Água quente (CPVC, PEX, cobre)': [{ type: 'Preventiva', activity: 'Verificação de válvulas e misturadores', periodicity: 'Anual', recommendations: 'Garantir o bom funcionamento e evitar vazamentos.', tech_diagnostics: 'Inspeção visual.' }],
                    'Esgoto (PVC, PEAD)': [{ type: 'Preventiva', activity: 'Limpeza de caixas de gordura e sifonadas', periodicity: 'Semestral', recommendations: 'Evitar entupimentos e mau cheiro.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Hidrojateamento preventivo da rede', periodicity: 'A cada 2-3 anos', recommendations: 'Remover incrustações que diminuem a vazão.', tech_diagnostics: 'Vídeo inspeção (opcional).' }],
                    'Água pluvial': [{ type: 'Preventiva', activity: 'Limpeza de calhas e ralos', periodicity: 'Semestral', recommendations: 'Especialmente antes e depois da estação chuvosa.', tech_diagnostics: 'Inspeção visual.' }],
                    'Reuso de água cinza': [{ type: 'Preventiva', activity: 'Limpeza de filtros e manutenção do sistema de tratamento', periodicity: 'Trimestral', recommendations: 'Garantir a qualidade da água de reuso.', tech_diagnostics: 'Análise de qualidade da água.' }],
                    'Aproveitamento de água da chuva': [{ type: 'Preventiva', activity: 'Limpeza de filtros e da cisterna', periodicity: 'Anual', recommendations: 'Remover detritos e lodo acumulado.', tech_diagnostics: 'Inspeção visual.' }],
                    'Sistema de aquecimento (solar, gás, elétrico)': [{ type: 'Preventiva', activity: 'Limpeza dos coletores solares', periodicity: 'Anual', recommendations: 'Manter a eficiência do sistema.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Manutenção do aquecedor a gás', periodicity: 'Anual', recommendations: 'Limpeza e verificação de segurança por técnico qualificado.', tech_diagnostics: 'Análise de combustão.' }]
                }
            },
            gasCombustivel: {
                title: 'Sistema de Gás Combustível',
                icon: '🔥',
                tipologias: [
                    { title: 'GLP - Gás Liquefeito de Petróleo', definicao: 'Sistema que utiliza gás armazenado em estado líquido sob pressão em cilindros ou centrais estacionárias. É mais denso que o ar.', componentes: 'Central de gás (cilindros/tanques), reguladores de pressão, medidores, tubulação, válvulas de bloqueio.', aplicacoes: 'Condomínios residenciais, comércios e indústrias em locais sem rede de gás natural.', vantagens: 'Disponibilidade em praticamente qualquer localidade.', desvantagens: 'Risco maior em caso de vazamento (gás acumula-se em locais baixos), necessidade de reabastecimento periódico.' },
                    { title: 'GN - Gás Natural', definicao: 'Sistema abastecido continuamente por uma rede de distribuição urbana. O gás é mais leve que o ar.', componentes: 'Ponto de entrega da concessionária, reguladores de pressão, medidores, tubulação, válvulas de bloqueio.', aplicacoes: 'Regiões metropolitanas com infraestrutura de distribuição de gás natural.', vantagens: 'Abastecimento contínuo, mais seguro em caso de vazamento (dissipa-se na atmosfera).', desvantagens: 'Disponibilidade geográfica limitada, custo de infraestrutura inicial.' },
                    { title: 'Tubulação de Aço-Carbono', definicao: 'Tubulação robusta, geralmente pintada de amarelo, utilizada em redes externas e prumadas.', componentes: 'Tubos de aço-carbono (com ou sem costura), conexões soldáveis ou rosqueáveis, pintura anticorrosiva.', aplicacoes: 'Redes primárias e secundárias, prumadas de edifícios.', vantagens: 'Alta resistência mecânica.', desvantagens: 'Suscetível à corrosão externa e interna, exige tratamento superficial (pintura).' },
                    { title: 'Tubulação de Cobre', definicao: 'Tubulação de alta durabilidade e resistência à corrosão, utilizada em redes internas e pontos de consumo.', componentes: 'Tubos de cobre rígido ou flexível, conexões soldadas (brasagem) ou prensadas.', aplicacoes: 'Redes internas, ligações de equipamentos (fogões, aquecedores).', vantagens: 'Excelente resistência à corrosão, longa vida útil.', desvantagens: 'Custo do material mais elevado, exige mão de obra especializada para solda.' },
                    { title: 'Tubulação PEX Multicamadas', definicao: 'Tubo flexível composto por camadas de polietileno, alumínio e polietileno. É uma solução moderna e segura.', componentes: 'Tubo multicamadas, conexões prensadas (press-fitting) ou roscadas.', aplicacoes: 'Redes internas, substituindo o cobre em muitas aplicações modernas.', vantagens: 'Flexibilidade (menos conexões), rapidez de instalação, resistência à corrosão.', desvantagens: 'Requer ferramentas específicas para prensagem das conexões.' }
                ],
                patologias: [
                    { title: 'Vazamento em Conexões Roscadas', sintomas: 'Cheiro de gás, teste de estanqueidade reprovado, conta de gás elevada.', causas: 'Vedação insuficiente ou ressecada (fita veda-rosca), aperto excessivo ou insuficiente da conexão.', typology_link: 'Tubulação de Aço-Carbono' },
                    { title: 'Corrosão Externa da Tubulação', sintomas: 'Pontos de ferrugem, bolhas na pintura, redução da espessura da parede do tubo.', causas: 'Falha ou ausência de pintura de proteção, contato com umidade ou outros materiais.', typology_link: 'Tubulação de Aço-Carbono' },
                    { title: 'Corrosão Galvânica', sintomas: 'Corrosão acelerada na junção de tubos de aço com conexões de outros metais (ex: latão).', causas: 'Contato direto entre metais diferentes em ambiente úmido, criando uma pilha galvânica.', typology_link: 'Tubulação de Aço-Carbono' },
                    { title: 'Falha na Solda (Brasagem)', sintomas: 'Vazamento na junta soldada, visível com teste de espuma (bolhas).', causas: 'Execução inadequada da solda, superaquecimento ou falta de aquecimento, contaminação da superfície.', typology_link: 'Tubulação de Cobre' },
                    { title: 'Amassamento ou Deformação do Tubo', sintomas: 'Redução do fluxo de gás, ponto de fragilidade na tubulação.', causas: 'Impacto acidental durante a obra ou uso, curvatura com raio inadequado.', typology_link: 'Tubulação de Cobre' },
                    { title: 'Prensagem Incorreta da Conexão', sintomas: 'Vazamento na junta, anel de vedação (o-ring) danificado.', causas: 'Uso de ferramenta inadequada, posicionamento incorreto da ferramenta, falta de limpeza na ponta do tubo.', typology_link: 'Tubulação PEX Multicamadas' },
                    { title: 'Dano por Raios UV', sintomas: 'Ressecamento e fragilização da camada externa de polietileno do tubo.', causas: 'Exposição direta e prolongada ao sol sem proteção adequada (calhas, eletrodutos).', typology_link: 'Tubulação PEX Multicamadas' },
                    { title: 'Regulador de Pressão Descalibrado ou Travado', sintomas: 'Chama do fogão muito alta ou muito baixa, aquecedor não liga ou desliga sozinho.', causas: 'Fim da vida útil, entrada de impurezas, desgaste de componentes internos (diafragma).', typology_link: 'GLP - Gás Liquefeito de Petróleo' },
                    { title: 'Válvula de Bloqueio Emperrada', sintomas: 'Impossibilidade de abrir ou fechar a válvula de gás.', causas: 'Falta de uso, corrosão interna, acúmulo de sujeira.', typology_link: 'GLP - Gás Liquefeito de Petróleo' },
                    { title: 'Medidor de Gás Inoperante ou Impreciso', sintomas: 'Consumo registrado não condiz com a realidade (muito alto ou zerado).', causas: 'Desgaste mecânico, obstrução por impurezas, fraude.', typology_link: 'GN - Gás Natural' },
                    { title: 'Obstrução de Bicos de Equipamentos', sintomas: 'Chama amarelada e fuliginosa, equipamento não funciona corretamente.', causas: 'Impurezas na rede de gás que obstruem os injetores dos equipamentos.', typology_link: 'GN - Gás Natural' },
                    { title: 'Ventilação da Central de Gás Obstruída', sintomas: 'Acúmulo de gás em caso de vazamento, risco elevado de explosão.', causas: 'Armazenamento de objetos, fechamento das aberturas de ventilação.', typology_link: 'GLP - Gás Liquefeito de Petróleo' },
                    { title: 'Mangueira de Ligação Vencida ou Danificada', sintomas: 'Cheiro de gás próximo ao equipamento, ressecamento ou trincas na mangueira.', causas: 'Fim da vida útil (validade impressa na mangueira), contato com produtos de limpeza, dobra excessiva.', typology_link: 'GN - Gás Natural' }
                ],
                diagnostico: [
                    { title: 'Teste de Estanqueidade com Manômetro', desc: 'Procedimento normativo que pressuriza a tubulação com ar ou gás inerte e mede a queda de pressão em um manômetro para verificar a existência de vazamentos.' },
                    { title: 'Detector de Gás (Explosímetro)', desc: 'Equipamento eletrônico portátil que detecta a presença de gás combustível no ambiente e em pontos específicos da tubulação, indicando a concentração.' },
                    { title: 'Aplicação de Espuma (Água e Sabão)', desc: 'Método visual simples para localizar vazamentos em conexões e juntas. A formação de bolhas indica o ponto exato da fuga de gás.' },
                    { title: 'Ultrassom para Detecção de Vazamentos', desc: 'Tecnologia que capta o som de alta frequência gerado por um vazamento de gás pressurizado, permitindo a localização precisa mesmo em ambientes ruidosos.' }
                ],
                tecnologias: [
                    { icon: '🌐', title: 'Sensores de Gás Inteligentes (IoT)', desc: 'Dispositivos que monitoram o ambiente 24/7 e, em caso de vazamento, enviam alertas para o celular do usuário e podem acionar uma válvula solenoide para bloquear o gás automaticamente.' },
                    { icon: '📟', title: 'Medidores com Telemetria', desc: 'Medidores de gás que enviam os dados de consumo remotamente para a concessionária e para o usuário, permitindo o acompanhamento em tempo real e a detecção de consumos anormais (vazamentos).' },
                    { icon: '🏢', title: 'BIM & Digital Twin', desc: 'Modelagem 3D e criação de um gêmeo digital da rede de gás, facilitando a identificação de tubulações, a simulação de intervenções e o planejamento da manutenção.' }
                ],
                maintenance_schedules: {
                    'GLP - Gás Liquefeito de Petróleo': [{ type: 'Preventiva', activity: 'Inspeção da central de gás (cilindros, válvulas, ventilação)', periodicity: 'Mensal', recommendations: 'Verificar data de validade dos cilindros e a desobstrução da ventilação.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Legal', activity: 'Teste de estanqueidade da rede', periodicity: 'Anual', recommendations: 'Obrigatório por norma, com emissão de laudo e ART.', tech_diagnostics: 'Manômetro.' }],
                    'GN - Gás Natural': [{ type: 'Preventiva', activity: 'Inspeção no abrigo do medidor e regulador', periodicity: 'Semestral', recommendations: 'Verificar sinais de corrosão, vazamentos e danos.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Legal', activity: 'Teste de estanqueidade da rede', periodicity: 'Anual', recommendations: 'Obrigatório por norma, com emissão de laudo e ART.', tech_diagnostics: 'Manômetro.' }],
                    'Tubulação de Aço-Carbono': [{ type: 'Preventiva', activity: 'Inspeção da pintura e pontos de corrosão', periodicity: 'Anual', recommendations: 'Realizar reparos na pintura para evitar corrosão.', tech_diagnostics: 'Inspeção visual.' }],
                    'Tubulação de Cobre': [{ type: 'Preventiva', activity: 'Inspeção visual das juntas soldadas e conexões', periodicity: 'Anual', recommendations: 'Procurar por sinais de oxidação (zinabre) ou vazamentos.', tech_diagnostics: 'Inspeção visual, detector de gás.' }],
                    'Tubulação PEX Multicamadas': [{ type: 'Preventiva', activity: 'Inspeção visual das conexões prensadas', periodicity: 'Anual', recommendations: 'Verificar se não há danos mecânicos ou vazamentos nas conexões.', tech_diagnostics: 'Inspeção visual.' }]
                }
            },
            eletricos: {
                title: 'Sistemas Elétricos',
                icon: '⚡',
                tipologias: [
                    { title: 'Quadros elétricos', definicao: 'Centro de distribuição de energia de uma edificação, onde ficam os disjuntores e outros dispositivos de proteção.', componentes: 'Disjuntores, dispositivo DR, DPS, barramentos.', aplicacoes: 'Toda edificação.', vantagens: 'Organiza e protege toda a instalação elétrica.', desvantagens: 'Ponto crítico que pode desligar todo o sistema.' },
                    { title: 'Fios e cabos (cobre, alumínio)', definicao: 'Condutores que levam a energia elétrica dos quadros aos pontos de uso.', componentes: 'Condutor metálico, isolação plástica.', aplicacoes: 'Toda instalação elétrica.', vantagens: 'Meio eficiente para transportar energia.', desvantagens: 'Suscetível a sobreaquecimento se mal dimensionado.' },
                    { title: 'Barramento blindado (Busway)', definicao: 'Sistema de distribuição de energia com barras de cobre ou alumínio isoladas dentro de um invólucro metálico, substituindo cabos de grande bitola.', componentes: 'Barras condutoras, invólucro, juntas de conexão.', aplicacoes: 'Prumadas de edifícios altos, indústrias, data centers.', vantagens: 'Ocupa menos espaço, instalação rápida, baixa queda de tensão.', desvantagens: 'Custo inicial elevado, pouca flexibilidade.' },
                    { title: 'Iluminação LED', definicao: 'Sistema de iluminação que utiliza diodos emissores de luz (LED) como fonte luminosa.', componentes: 'Lâmpadas, luminárias, drivers.', aplicacoes: 'Iluminação geral, de destaque, interna e externa.', vantagens: 'Alta eficiência energética, longa vida útil, não emite calor.', desvantagens: 'Custo inicial mais alto que tecnologias antigas.' },
                    { title: 'DALI / KNX / IoT (Automação)', definicao: 'Protocolos de comunicação que permitem o controle inteligente e integrado de sistemas como iluminação, persianas e climatização.', componentes: 'Controladores, sensores, atuadores, gateways.', aplicacoes: 'Edifícios comerciais, residências de alto padrão.', vantagens: 'Eficiência energética, conforto, cenários personalizados.', desvantagens: 'Custo de implantação, exige programação e mão de obra especializada.' },
                    { title: 'Energia fotovoltaica', definicao: 'Sistema que converte a luz do sol diretamente em energia elétrica através de painéis fotovoltaicos.', componentes: 'Painéis solares, inversor, estrutura de fixação, string box.', aplicacoes: 'Residências, comércios, indústrias, usinas solares.', vantagens: 'Energia limpa e renovável, redução na conta de luz.', desvantagens: 'Geração intermitente (depende do sol), custo de investimento inicial.' },
                    { title: 'Grupo gerador', definicao: 'Equipamento composto por um motor a combustão (geralmente diesel) acoplado a um gerador elétrico, para fornecer energia em caso de falha da rede.', componentes: 'Motor diesel, alternador, tanque de combustível, painel de controle.', aplicacoes: 'Hospitais, shoppings, indústrias, condomínios (sistemas essenciais).', vantagens: 'Autonomia e confiabilidade no fornecimento de energia.', desvantagens: 'Ruído, emissão de poluentes, manutenção constante.' }
                ],
                patologias: [
                    { title: 'Sobreaquecimento de Disjuntores', sintomas: 'Cheiro de queimado, disjuntor quente ao toque, desarme sem motivo aparente.', causas: 'Conexão frouxa (mau contato), disjuntor subdimensionado para a carga.', typology_link: 'Quadros elétricos' },
                    { title: 'Oxidação de Barramentos', sintomas: 'Formação de camada esverdeada (zinabre) ou esbranquiçada nos barramentos do quadro.', causas: 'Umidade no ambiente, presença de agentes corrosivos.', typology_link: 'Quadros elétricos' },
                    { title: 'Fuga de Corrente (Choque)', sintomas: 'Desarme do dispositivo DR, pequenos choques ao tocar em equipamentos.', causas: 'Isolação de fios ou equipamentos danificada.', typology_link: 'Fios e cabos (cobre, alumínio)' },
                    { title: 'Ressecamento da Isolação', sintomas: 'Isolação plástica dos cabos torna-se quebradiça e trinca com facilidade.', causas: 'Envelhecimento natural do material, exposição a altas temperaturas.', typology_link: 'Fios e cabos (cobre, alumínio)' },
                    { title: 'Sobreaquecimento nas Juntas', sintomas: 'Ponto quente detectado por termografia no barramento.', causas: 'Parafusos de conexão frouxos, oxidação das superfícies de contato.', typology_link: 'Barramento blindado (Busway)' },
                    { title: 'Flicker (Cintilação) de Lâmpadas', sintomas: 'Variação rápida e perceptível no brilho das lâmpadas.', causas: 'Driver de má qualidade, flutuação de tensão na rede.', typology_link: 'Iluminação LED' },
                    { title: 'Perda de Comunicação de Dispositivos', sintomas: 'Comandos de automação não funcionam, dispositivos offline.', causas: 'Falha no barramento de comunicação, endereço de dispositivo incorreto.', typology_link: 'DALI / KNX / IoT (Automação)' },
                    { title: 'Hotspots em Painéis Fotovoltaicos', sintomas: 'Ponto específico do painel muito mais quente que o resto (visível em termografia).', causas: 'Célula defeituosa, sombreamento parcial, sujeira.', typology_link: 'Energia fotovoltaica' },
                    { title: 'Falha na Partida do Gerador', sintomas: 'Gerador não liga durante uma queda de energia.', causas: 'Bateria descarregada, falta de combustível, obstrução de filtros.', typology_link: 'Grupo gerador' }
                ],
                diagnostico: [
                    { title: 'Termografia em Quadros e Conexões', desc: 'Identificação de pontos de sobreaquecimento causados por mau contato ou sobrecarga, antes que causem um incêndio.' },
                    { title: 'Analisador de Qualidade de Energia', desc: 'Mede parâmetros como tensão, corrente, harmônicos e fator de potência para diagnosticar problemas na rede que afetam equipamentos.' },
                    { title: 'Megômetro (Teste de Isolação)', desc: 'Mede a resistência da isolação de cabos e motores para detectar fugas de corrente e risco de curto-circuito.' }
                ],
                tecnologias: [
                    { icon: '🔋', title: 'Monitoramento Remoto de Energia (IoT)', desc: 'Sensores que medem o consumo, tensão e status de disjuntores em tempo real e enviam alertas para um software central.' },
                    { icon: '🧠', title: 'IA para Gestão de Energia', desc: 'Algoritmos que analisam o padrão de consumo para otimizar o uso, prever falhas em equipamentos e gerenciar a demanda de energia.' },
                    { icon: '☀️', title: 'Otimizadores para Sistemas Fotovoltaicos', desc: 'Dispositivos que maximizam a geração de cada painel individualmente, reduzindo perdas por sombreamento ou sujeira.' }
                ],
                maintenance_schedules: {
                    'Quadros elétricos': [{ type: 'Preditiva', activity: 'Inspeção termográfica', periodicity: 'Anual', recommendations: 'Identificar pontos quentes antes que se tornem falhas críticas.', tech_diagnostics: 'Câmera termográfica.' }, { type: 'Preventiva', activity: 'Reaperto de conexões', periodicity: 'Anual', recommendations: 'Evitar mau contato, principal causa de incêndios elétricos.', tech_diagnostics: 'Torquímetro.' }],
                    'Fios e cabos (cobre, alumínio)': [{ type: 'Preditiva', activity: 'Teste de isolação (megômetro)', periodicity: 'A cada 3-5 anos', recommendations: 'Verificar a degradação da isolação dos cabos em circuitos críticos.', tech_diagnostics: 'Megômetro.' }],
                    'Barramento blindado (Busway)': [{ type: 'Preditiva', activity: 'Inspeção termográfica das juntas', periodicity: 'Anual', recommendations: 'Verificar sobreaquecimento nos pontos de conexão do barramento.', tech_diagnostics: 'Câmera termográfica.' }],
                    'Iluminação LED': [{ type: 'Preventiva', activity: 'Limpeza de luminárias e verificação visual', periodicity: 'Anual', recommendations: 'Manter a eficiência luminosa e verificar drivers com defeito.', tech_diagnostics: 'Inspeção visual.' }],
                    'DALI / KNX / IoT (Automação)': [{ type: 'Preventiva', activity: 'Backup de configurações e verificação de logs', periodicity: 'Anual', recommendations: 'Garantir a recuperação do sistema em caso de falha e procurar por erros.', tech_diagnostics: 'Software de gerenciamento.' }],
                    'Energia fotovoltaica': [{ type: 'Preventiva', activity: 'Limpeza dos painéis solares', periodicity: 'Semestral/Anual', recommendations: 'A sujeira pode reduzir a eficiência em mais de 20%.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Inspeção do inversor e string box', periodicity: 'Anual', recommendations: 'Verificar conexões e limpeza dos componentes.', tech_diagnostics: 'Inspeção visual, termografia.' }],
                    'Grupo gerador': [{ type: 'Preventiva', activity: 'Teste de funcionamento em carga', periodicity: 'Mensal', recommendations: 'Garantir o funcionamento em uma emergência e exercitar o motor.', tech_diagnostics: 'Medidor de carga.' }, { type: 'Preventiva', activity: 'Troca de óleo e filtros', periodicity: 'Anual ou por horímetro', recommendations: 'Seguir as especificações do fabricante.', tech_diagnostics: 'Análise de óleo (preditiva).' }]
                }
            },
            climatizacao: {
                title: 'Climatização e Exaustão',
                icon: '💨',
                tipologias: [
                    { title: 'Ar-condicionado Split', definicao: 'Sistema com uma unidade interna (evaporadora) e uma externa (condensadora), conectado por tubulação de cobre.', componentes: 'Evaporadora, condensadora, controle remoto, tubulação.', aplicacoes: 'Climatização de um único ambiente, como quartos e salas.', vantagens: 'Baixo custo de instalação, operação silenciosa (unidade interna).', desvantagens: 'Uma unidade externa para cada interna, impacto estético na fachada.' },
                    { title: 'Multi Split', definicao: 'Sistema similar ao Split, mas uma única unidade externa pode ser conectada a múltiplas unidades internas.', componentes: 'Condensadora, evaporadoras, caixas de distribuição.', aplicacoes: 'Apartamentos, pequenos escritórios.', vantagens: 'Economiza espaço na fachada.', desvantagens: 'Se a unidade externa falhar, todo o sistema para.' },
                    { title: 'VRF/VRV (Fluxo de Refrigerante Variável)', definicao: 'Sistema de expansão direta de alta eficiência, onde uma única condensadora externa pode climatizar dezenas de ambientes com controle individual.', componentes: 'Condensadora modular, evaporadoras de diversos tipos (cassete, duto, hi-wall).', aplicacoes: 'Edifícios comerciais, hotéis, hospitais, residências de alto padrão.', vantagens: 'Alta eficiência energética, controle individual, longas distâncias de tubulação.', desvantagens: 'Alto custo de instalação, exige mão de obra especializada.' },
                    { title: 'Chiller (Água Gelada)', definicao: 'Sistema de expansão indireta que resfria água em uma central (Chiller) e a bombeia para climatizar os ambientes através de fan-coils.', componentes: 'Chiller, bombas, fancoils, torre de resfriamento (se condensação a água).', aplicacoes: 'Grandes edifícios comerciais, shoppings, aeroportos, indústrias.', vantagens: 'Capacidade para grandes cargas térmicas, alta eficiência em grande escala.', desvantagens: 'Custo e complexidade de instalação e operação muito elevados.' },
                    { title: 'Ventilação mecânica', definicao: 'Sistema que utiliza ventiladores para insuflar ar externo ou exaurir ar interno, garantindo a renovação do ar.', componentes: 'Ventiladores, dutos, filtros, grelhas.', aplicacoes: 'Ambientes sem janelas, garagens, áreas de grande concentração de pessoas.', vantagens: 'Garante a qualidade do ar interior.', desvantagens: 'Consumo de energia, pode gerar ruído.' },
                    { title: 'Pressurização de escadas', definicao: 'Sistema de segurança que insufla ar nas escadas de emergência, criando uma pressão positiva que impede a entrada de fumaça em caso de incêndio.', componentes: 'Ventilador de alta vazão, dutos, grelhas, sensores de pressão.', aplicacoes: 'Edifícios verticais, como exigência do Corpo de Bombeiros.', vantagens: 'Mantém a rota de fuga livre de fumaça.', desvantagens: 'Requer testes periódicos rigorosos.' },
                    { title: 'Exaustores em garagem e cozinha', definicao: 'Sistemas que removem gases tóxicos (CO em garagens) ou ar quente e gorduroso (cozinhas).', componentes: 'Exaustores, dutos, coifas, filtros.', aplicacoes: 'Garagens subterrâneas, cozinhas industriais e residenciais.', vantagens: 'Melhora a qualidade e segurança do ar.', desvantagens: 'Requer limpeza constante de filtros e dutos.' }
                ],
                patologias: [
                    { title: 'Congelamento da Evaporadora', sintomas: 'Formação de gelo na unidade interna, gotejamento de água.', causas: 'Filtros de ar sujos, baixa carga de fluido refrigerante, problema no ventilador.', typology_link: 'Ar-condicionado Split' },
                    { title: 'Dreno da Condensadora Entupido', sintomas: 'Vazamento de água pela unidade interna (evaporadora).', causas: 'Acúmulo de sujeira, lodo e fungos na bandeja e na mangueira de dreno.', typology_link: 'Ar-condicionado Split' },
                    { title: 'Vazamento de Fluido Refrigerante', sintomas: 'Equipamento não gela, compressor funciona sem parar.', causas: 'Trincas na tubulação, conexões mal apertadas (flanges).', typology_link: 'Multi Split' },
                    { title: 'Falha de Comunicação', sintomas: 'Erro no controle central, unidades internas não respondem.', causas: 'Problema no cabo de comunicação entre as unidades, endereçamento incorreto.', typology_link: 'VRF/VRV (Fluxo de Refrigerante Variável)' },
                    { title: 'Baixo Desempenho do Chiller', sintomas: 'Água não atinge a temperatura desejada, alto consumo de energia.', causas: 'Trocadores de calor sujos (incrustação), vazamento de fluido refrigerante.', typology_link: 'Chiller (Água Gelada)' },
                    { title: 'Contaminação na Torre de Resfriamento', sintomas: 'Presença de algas, lodo e risco de proliferação de bactérias (Legionella).', causas: 'Falta de tratamento químico adequado da água.', typology_link: 'Chiller (Água Gelada)' },
                    { title: 'Ruído e Vibração Excessiva', sintomas: 'Barulho anormal nos ventiladores.', causas: 'Falta de lubrificação, pás sujas ou desbalanceadas, desgaste de rolamentos.', typology_link: 'Ventilação mecânica' },
                    { title: 'Falha no Acionamento da Pressurização', sintomas: 'Sistema não liga quando o alarme de incêndio é acionado.', causas: 'Falha na interligação com a central de alarme, problema no motor.', typology_link: 'Pressurização de escadas' },
                    { title: 'Acúmulo de Gordura em Dutos', sintomas: 'Alto risco de incêndio, mau cheiro, baixa eficiência da exaustão.', causas: 'Falta de limpeza periódica dos filtros e do interior dos dutos.', typology_link: 'Exaustores em garagem e cozinha' }
                ],
                diagnostico: [
                    { title: 'Análise da Qualidade do Ar Interior (QAI)', desc: 'Medição de níveis de CO2, material particulado, compostos orgânicos voláteis (VOCs) e contaminantes biológicos para garantir um ambiente saudável.' },
                    { title: 'Análise de Vibração de Motores', desc: 'Técnica preditiva que identifica desgastes em rolamentos e desalinhamentos em motores e ventiladores antes da falha.' },
                    { title: 'Medição de Vazão e Pressão', desc: 'Verifica o balanceamento e a eficiência dos sistemas de ventilação e exaustão com anemômetros e manômetros.' }
                ],
                tecnologias: [
                    { icon: '🌡️', title: 'Sensores de QAI (IoT)', desc: 'Monitoramento em tempo real da qualidade do ar, permitindo que o sistema de ventilação opere sob demanda, economizando energia.' },
                    { icon: '🧠', title: 'IA para Otimização de HVAC', desc: 'Algoritmos que aprendem o padrão de uso do edifício e ajustam a climatização automaticamente para máxima eficiência, prevendo falhas em compressores.' },
                    { icon: '🏢', title: 'BIM e Simulação de Fluidos (CFD)', desc: 'Uso de modelos 3D para simular o fluxo de ar e a distribuição de temperatura nos ambientes, otimizando o projeto antes da construção.' }
                ],
                maintenance_schedules: {
                    'Ar-condicionado Split': [{ type: 'Preventiva', activity: 'Limpeza de filtros de ar', periodicity: 'Mensal', recommendations: 'O próprio usuário pode fazer. Essencial para a qualidade do ar e eficiência.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Limpeza completa e verificação de gás', periodicity: 'Anual', recommendations: 'Realizada por técnico, inclui limpeza de serpentinas e bandeja.', tech_diagnostics: 'Manifold.' }],
                    'Multi Split': [{ type: 'Preventiva', activity: 'Limpeza de filtros de ar (unidades internas)', periodicity: 'Mensal', recommendations: 'Essencial para a qualidade do ar e eficiência.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Limpeza da unidade externa e verificação geral', periodicity: 'Anual', recommendations: 'Realizada por técnico, inclui verificação de carga de gás e conexões.', tech_diagnostics: 'Manifold.' }],
                    'VRF/VRV': [{ type: 'Preventiva', activity: 'Limpeza de filtros e inspeção das unidades internas', periodicity: 'Trimestral', recommendations: 'Garantir fluxo de ar e drenagem.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preditiva', activity: 'Análise de logs e parâmetros de operação', periodicity: 'Semestral', recommendations: 'Técnico verifica pressões, temperaturas e erros no sistema.', tech_diagnostics: 'Software do fabricante.' }],
                    'Chiller (Água Gelada)': [{ type: 'Preventiva', activity: 'Tratamento químico da água da torre de resfriamento', periodicity: 'Mensal', recommendations: 'Evitar corrosão, incrustação e contaminação biológica.', tech_diagnostics: 'Kit de análise de água.' }, { type: 'Preditiva', activity: 'Análise de vibração e de óleo dos compressores', periodicity: 'Anual', recommendations: 'Antecipar falhas nos componentes mais caros do sistema.', tech_diagnostics: 'Analisador de vibração, análise laboratorial.' }],
                    'Ventilação mecânica': [{ type: 'Preventiva', activity: 'Troca ou limpeza dos filtros de ar', periodicity: 'Trimestral', recommendations: 'Garantir a qualidade do ar insuflado.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Lubrificação e verificação de correias de ventiladores', periodicity: 'Semestral', recommendations: 'Evitar ruído e falha do motor.', tech_diagnostics: 'Inspeção visual e tátil.' }],
                    'Pressurização de escadas': [{ type: 'Preventiva', activity: 'Teste funcional do sistema', periodicity: 'Mensal', recommendations: 'Simular acionamento via central de alarme para garantir a partida do ventilador.', tech_diagnostics: 'Teste funcional.' }],
                    'Exaustores em garagem e cozinha': [{ type: 'Preventiva', activity: 'Limpeza de coifas e filtros metálicos (cozinhas)', periodicity: 'Quinzenal/Mensal', recommendations: 'Remover gordura para evitar risco de incêndio.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Limpeza dos dutos de exaustão de gordura', periodicity: 'Anual', recommendations: 'Serviço especializado para remover gordura incrustada.', tech_diagnostics: 'Inspeção visual/robótica.' }]
                }
            }
        }
    },
    seguranca: {
        title: 'Segurança & Transporte',
        intro: 'Esta área cobre os sistemas vitais para a proteção de vidas e do patrimônio, além da mobilidade vertical. A manutenção rigorosa destes sistemas é uma exigência normativa e essencial para a tranquilidade dos ocupantes.',
        systems: {
            incendio: {
                title: 'Sistemas de Incêndio e SPDA',
                icon: '🔥',
                tipologias: [
                    { title: 'Hidrantes e mangotinhos', definicao: 'Pontos de tomada de água para uso do Corpo de Bombeiros ou da brigada de incêndio.', componentes: 'Reservatório de incêndio, bombas, tubulação, abrigo com mangueiras e esguichos.', aplicacoes: 'Edifícios comerciais e residenciais.', vantagens: 'Grande poder de combate ao fogo.', desvantagens: 'Requer pessoal treinado para operar.' },
                    { title: 'Sprinklers (chuveiros automáticos)', definicao: 'Sistema de acionamento automático que libera água sobre um foco de incêndio através de bicos (sprinklers) sensíveis ao calor.', componentes: 'Bicos de sprinkler, tubulação, válvula de governo e alarme (VGA).', aplicacoes: 'Áreas comerciais, garagens, depósitos.', vantagens: 'Combate o incêndio em seu estágio inicial, de forma automática.', desvantagens: 'Alto custo de instalação, pode causar danos por água.' },
                    { title: 'Extintores', definicao: 'Equipamentos portáteis para o primeiro combate a princípios de incêndio.', componentes: 'Cilindro, agente extintor (água, pó químico, CO2), válvula.', aplicacoes: 'Obrigatório em todas as edificações.', vantagens: 'Versatilidade, baixo custo, fácil operação.', desvantagens: 'Capacidade limitada.' },
                    { title: 'Detectores e alarmes', definicao: 'Sistema que detecta a presença de fumaça ou calor e aciona um alarme sonoro e visual para alertar os ocupantes.', componentes: 'Detectores (fumaça, calor), acionadores manuais, sirenes, central de alarme.', aplicacoes: 'Obrigatório na maioria das edificações comerciais e áreas comuns de edifícios residenciais.', vantagens: 'Alerta precoce, essencial para a evacuação segura.', desvantagens: 'Suscetível a alarmes falsos se não for bem mantido.' },
                    { title: 'Central de alarme (SACI)', definicao: 'O cérebro do sistema, que recebe as informações dos detectores, aciona os alarmes e pode comandar outros sistemas (elevadores, pressurização).', componentes: 'Painel central com display e teclado.', aplicacoes: 'Sistemas de detecção e alarme.', vantagens: 'Gerenciamento centralizado dos eventos de incêndio.', desvantagens: 'Uma falha na central pode comprometer todo o sistema.' },
                    { title: 'Barreiras corta-fogo (Firestopping)', definicao: 'Sistemas para vedar a passagem entre lajes e paredes (shafts) por onde passam instalações, impedindo a propagação de fogo e fumaça.', componentes: 'Argamassas, selantes intumescentes, colares corta-fogo.', aplicacoes: 'Passagens de cabos e tubos entre compartimentos.', vantagens: 'Essencial para a compartimentação e segurança da edificação.', desvantagens: 'Muitas vezes negligenciado ou executado incorretamente.' },
                    { title: 'SPDA (Sistema de Proteção contra Descargas Atmosféricas)', definicao: 'Sistema que protege a edificação e seus ocupantes dos efeitos de um raio, fornecendo um caminho seguro para a descarga elétrica até o solo.', componentes: 'Captores (tipo Franklin ou gaiola de Faraday), condutores de descida, malha de aterramento.', aplicacoes: 'Obrigatório em edifícios com certas características de altura e localização.', vantagens: 'Protege a estrutura, equipamentos e vidas.', desvantagens: 'Requer inspeção periódica e medição da resistência de aterramento.' }
                ],
                patologias: [
                    { title: 'Baixa Pressão na Rede', sintomas: 'Jato de água fraco, não atinge a distância necessária.', causas: 'Falha na bomba de incêndio, registros fechados, vazamentos na tubulação.', typology_link: 'Hidrantes e mangotinhos' },
                    { title: 'Mangueira Ressecada ou Furada', sintomas: 'Vazamento de água pela mangueira durante o uso, aspecto quebradiço.', causas: 'Fim da vida útil, armazenamento inadequado.', typology_link: 'Hidrantes e mangotinhos' },
                    { title: 'Obstrução de Bicos de Sprinkler', sintomas: 'Bico entupido com tinta, poeira ou objetos, impedindo a saída de água.', causas: 'Pintura da tubulação sem proteção dos bicos, armazenamento de materiais próximo ao teto.', typology_link: 'Sprinklers (chuveiros automáticos)' },
                    { title: 'Extintor Despressurizado ou Vencido', sintomas: 'Manômetro na faixa vermelha, selo de inspeção vencido.', causas: 'Falta de recarga periódica, pequeno vazamento na válvula.', typology_link: 'Extintores' },
                    { title: 'Alarmes Falsos', sintomas: 'Sirene dispara sem haver incêndio.', causas: 'Poeira nos detectores, vapor de água (em banheiros), detector inadequado para o ambiente.', typology_link: 'Detectores e alarmes' },
                    { title: 'Detector Obstruído', sintomas: 'Detector não aciona na presença de fumaça/calor.', causas: 'Acúmulo de poeira, teias de aranha ou pintura sobre o detector.', typology_link: 'Detectores e alarmes' },
                    { title: 'Falha na Vedação Corta-Fogo', sintomas: 'Aberturas visíveis em shafts.', causas: 'Passagem de novas instalações sem a recomposição do firestopping.', typology_link: 'Barreiras corta-fogo (Firestopping)' },
                    { title: 'Aterramento Ineficiente do SPDA', sintomas: 'Não visível, mas perigoso. Medição da resistência de aterramento acima do especificado em norma.', causas: 'Corrosão das hastes de aterramento, conexões frouxas, solo seco.', typology_link: 'SPDA (Sistema de Proteção contra Descargas Atmosféricas)' },
                    { title: 'Falha de Comunicação com os Laços de Detecção', sintomas: 'Indicação de \'Falha de Comunicação\' ou \'Circuito Aberto\' no display da central, inoperância parcial de zonas.', causas: 'Oxidação dos contatos da fiação nos módulos de isolamento, danos físicos na fiação interna por roedores ou reformas.', typology_link: 'Central de alarme (SACI)' }
                ],
                diagnostico: [
                    { title: 'Teste de Funcionamento de Bombas', desc: 'Teste semanal em vazio e periódico em carga para verificar a partida automática e o desempenho da bomba de incêndio.' },
                    { title: 'Teste de Detectores', desc: 'Uso de spray de fumaça sintética ou fonte de calor para verificar a ativação de cada detector e o acionamento da central.' },
                    { title: 'Medição de Resistência de Aterramento', desc: 'Uso de um terrômetro para medir a resistência da malha de aterramento do SPDA, garantindo sua eficiência.' }
                ],
                tecnologias: [
                    { icon: '🚨', title: 'Detectores Endereçáveis', desc: 'Tecnologia que permite à central de alarme saber exatamente qual detector foi acionado, agilizando a resposta da brigada.' },
                    { icon: '🧠', title: 'Detectores por Aspiração (HSSD)', desc: 'Sistemas de altíssima sensibilidade que aspiram o ar do ambiente continuamente, detectando partículas de fumaça invisíveis a olho nu. Usado em data centers e museus.' },
                    { icon: '🌐', title: 'Monitoramento Remoto de Alarmes', desc: 'Sistemas que enviam os eventos da central de incêndio via internet para uma central de monitoramento ou para o celular do gestor predial.' }
                ],
                maintenance_schedules: {
                    'Hidrantes e mangotinhos': [{ type: 'Preventiva', activity: 'Teste de funcionamento da bomba em vazio', periodicity: 'Semanal', recommendations: 'Garantir que a bomba parte automaticamente.', tech_diagnostics: 'Inspeção visual/sonora.' }, { type: 'Preventiva', activity: 'Teste de pressão e vazão com a bomba em carga', periodicity: 'Anual', recommendations: 'Verificar se o sistema atinge os parâmetros de projeto.', tech_diagnostics: 'Manômetro, medidor de vazão.' }],
                    'Sprinklers (chuveiros automáticos)': [{ type: 'Preventiva', activity: 'Inspeção visual dos bicos', periodicity: 'Trimestral', recommendations: 'Verificar se não há obstruções, danos ou pintura nos bicos.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Teste da válvula de governo e alarme (VGA)', periodicity: 'Semestral', recommendations: 'Verificar o acionamento do alarme de fluxo.', tech_diagnostics: 'Teste funcional.' }],
                    'Extintores': [{ type: 'Preventiva', activity: 'Inspeção do lacre, manômetro e validade', periodicity: 'Mensal', recommendations: 'Garantir que os extintores estão aptos para uso.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Legal', activity: 'Recarga e teste hidrostático', periodicity: 'Anual (recarga) / A cada 5 anos (teste)', recommendations: 'Serviço obrigatório realizado por empresa certificada.', tech_diagnostics: 'Selo INMETRO.' }],
                    'Detectores e alarmes': [{ type: 'Preventiva', activity: 'Teste funcional dos acionadores manuais', periodicity: 'Mensal', recommendations: 'Verificar se o acionamento manual dispara o alarme.', tech_diagnostics: 'Teste funcional.' }, { type: 'Preventiva', activity: 'Teste dos detectores com gás de teste', periodicity: 'Anual', recommendations: 'Garantir que cada detector está funcionando.', tech_diagnostics: 'Gás de teste/fonte de calor.' }],
                    'Central de alarme (SACI)': [{ type: 'Preventiva', activity: 'Verificação de status e baterias', periodicity: 'Mensal', recommendations: 'Garantir que a central está operacional e sem falhas.', tech_diagnostics: 'Inspeção visual do painel.' }],
                    'Barreiras corta-fogo (Firestopping)': [{ type: 'Preventiva', activity: 'Inspeção visual dos selos corta-fogo', periodicity: 'Anual', recommendations: 'Verificar se não houve novas passagens de cabos/tubos sem a devida vedação.', tech_diagnostics: 'Inspeção visual.' }],
                    'SPDA (Sistema de Proteção contra Descargas Atmosféricas)': [{ type: 'Legal', activity: 'Inspeção visual e medição de continuidade e aterramento', periodicity: 'Anual', recommendations: 'Emitir laudo técnico conforme NBR 5419.', tech_diagnostics: 'Terrômetro, microhmímetro.' }]
                }
            },
            transporte: {
                title: 'Transporte Vertical',
                icon: '🛗',
                tipologias: [
                    { title: 'Elevadores elétricos', definicao: 'Sistema mais comum, utiliza um motor elétrico, cabos de aço e um contrapeso para mover a cabina.', componentes: 'Máquina de tração, cabina, contrapeso, cabos de aço, freio de segurança, painel de comando.', aplicacoes: 'Edifícios de média e grande altura.', vantagens: 'Velocidade, eficiência energética em edifícios altos.', desvantagens: 'Requer uma casa de máquinas (tradicional) ou poço mais robusto.' },
                    { title: 'Elevadores hidráulicos', definicao: 'Utiliza um pistão hidráulico para empurrar a cabina para cima. A descida ocorre pela ação da gravidade.', componentes: 'Pistão, bomba hidráulica, tanque de óleo, painel de comando.', aplicacoes: 'Edifícios de poucas paradas (até 5-6 andares), cargas elevadas.', vantagens: 'Operação suave, não requer casa de máquinas superior.', desvantagens: 'Mais lento, maior consumo de energia, risco de vazamento de óleo.' },
                    { title: 'Plataformas de acessibilidade', definicao: 'Equipamento para vencer pequenos desníveis, garantindo o acesso a pessoas com mobilidade reduzida.', componentes: 'Plataforma, sistema de acionamento (fuso, hidráulico), guarda-corpo.', aplicacoes: 'Entradas de bancos, edifícios públicos, residências.', vantagens: 'Solução de acessibilidade mais simples e barata que um elevador.', desvantagens: 'Velocidade muito baixa, percurso limitado.' },
                    { title: 'Escadas rolantes', definicao: 'Esteira rolante com degraus para transportar um grande fluxo de pessoas entre pavimentos.', componentes: 'Degraus, corrimão, máquina de tração, treliça.', aplicacoes: 'Shoppings, aeroportos, estações de metrô.', vantagens: 'Alta capacidade de transporte de pessoas.', desvantagens: 'Alto custo, grande espaço físico, manutenção complexa.' },
                    { title: 'Monta-cargas', definicao: 'Elevador projetado exclusivamente para o transporte de cargas, com acabamento robusto e sem os mesmos dispositivos de segurança de um elevador de passageiros.', componentes: 'Cabina reforçada, sistema de tração robusto.', aplicacoes: 'Indústrias, restaurantes, comércios.', vantagens: 'Adequado para cargas pesadas e ambientes agressivos.', desvantagens: 'Transporte de pessoas é proibido.' }
                ],
                patologias: [
                    { title: 'Desgaste de Cabos de Tração', sintomas: 'Vibração na cabina, ruídos, inspeção visual detecta fios rompidos.', causas: 'Fim da vida útil natural, polias desalinhadas ou desgastadas.', typology_link: 'Elevadores elétricos' },
                    { title: 'Desnivelamento da Cabina', sintomas: 'Elevador para com um degrau entre a cabina e o pavimento.', causas: 'Desgaste do sistema de freio, falha no sistema de controle de nivelamento.', typology_link: 'Elevadores elétricos' },
                    { title: 'Falha nos Contatos de Porta', sintomas: 'Elevador não parte, portas abrem e fecham repetidamente.', causas: 'Poeira ou desgaste nos contatos elétricos que informam que a porta está fechada.', typology_link: 'Elevadores elétricos' },
                    { title: 'Vazamento de Óleo no Pistão', sintomas: 'Manchas de óleo no fundo do poço, operação lenta ou com solavancos.', causas: 'Desgaste dos selos e gaxetas do pistão hidráulico.', typology_link: 'Elevadores hidráulicos' },
                    { title: 'Falha no Corrimão', sintomas: 'Corrimão se move em velocidade diferente dos degraus, ou para completamente.', causas: 'Desgaste da correia de acionamento do corrimão.', typology_link: 'Escadas rolantes' },
                    { title: 'Quebra de Dentes dos Degraus', sintomas: 'Degraus com pentes de alumínio quebrados nas extremidades.', causas: 'Uso inadequado (carrinhos de carga), objetos presos entre os degraus.', typology_link: 'Escadas rolantes' },
                    { title: 'Parada Brusca por Atuador de Segurança', sintomas: 'Escada para subitamente.', causas: 'Objeto preso nos degraus ou laterais, acionamento do botão de emergência.', typology_link: 'Escadas rolantes' },
                    { title: 'Desalinhamento Mecânico das Guias ou Cremalheira', sintomas: 'Movimento com trancos, trepidação excessiva, ruídos metálicos ou travamento no meio do percurso.', causas: 'Falta de lubrificação, fixações mecânicas afrouxadas por vibração ou desalinhamento estrutural da parede de suporte.', typology_link: 'Plataformas de acessibilidade' },
                    { title: 'Falha de Nivelamento por Desgaste do Freio', sintomas: 'Diferença de nível entre o piso da cabina e o pavimento ao parar, trancos ao carregar.', causas: 'Sobrecarga frequente além da capacidade nominal, desgaste natural das sapatas ou lona de freio.', typology_link: 'Monta-cargas' }
                ],
                diagnostico: [
                    { title: 'Análise de Vibração', desc: 'Identifica desgastes em rolamentos da máquina de tração e desalinhamentos antes que causem falhas maiores.' },
                    { title: 'Leitura de Códigos de Erro', desc: 'Análise dos registros no painel de controle para um diagnóstico rápido e preciso das falhas eletrônicas.' },
                    { title: 'Inspeção de Cabos de Aço', desc: 'Inspeção visual e dimensional para verificar o número de fios rompidos e o diâmetro dos cabos, determinando a necessidade de substituição.' }
                ],
                tecnologias: [
                    { icon: '⚙️', title: 'Manutenção Preditiva com IoT', desc: 'Sensores na máquina de tração e nas portas monitoram vibração, temperatura e ciclos de uso, enviando dados para uma IA que prevê falhas antes que ocorram.' },
                    { icon: '🧠', title: 'IA para Otimização de Tráfego', desc: 'Sistemas que aprendem o padrão de fluxo de pessoas do edifício e ajustam a lógica de atendimento dos elevadores para reduzir o tempo de espera.' },
                    { icon: '🎦', title: 'Resgate Remoto com Câmera', desc: 'Tecnologia que permite que um técnico, a partir de uma central, visualize o interior da cabina e converse com o passageiro preso, realizando alguns procedimentos de resgate remotamente.' }
                ],
                maintenance_schedules: {
                    'Elevadores elétricos': [{ type: 'Preventiva', activity: 'Inspeção, limpeza e lubrificação geral', periodicity: 'Mensal', recommendations: 'Obrigatório por lei. Realizado pela empresa de manutenção.', tech_diagnostics: 'Inspeção visual e tátil.' }, { type: 'Preditiva', activity: 'Análise de vibração do motor e polias', periodicity: 'Anual', recommendations: 'Detectar desgaste de rolamentos.', tech_diagnostics: 'Analisador de vibração.' }],
                    'Elevadores hidráulicos': [{ type: 'Preventiva', activity: 'Inspeção, limpeza e lubrificação geral', periodicity: 'Mensal', recommendations: 'Verificar nível e qualidade do óleo, e procurar por vazamentos.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preditiva', activity: 'Análise do óleo hidráulico', periodicity: 'Anual', recommendations: 'Verificar contaminação e degradação do óleo.', tech_diagnostics: 'Análise laboratorial.' }],
                    'Plataformas de acessibilidade': [{ type: 'Preventiva', activity: 'Inspeção e teste de todos os dispositivos de segurança', periodicity: 'Mensal', recommendations: 'Garantir a segurança do usuário.', tech_diagnostics: 'Teste funcional.' }],
                    'Escadas rolantes': [{ type: 'Preventiva', activity: 'Limpeza dos degraus, pentes e poço', periodicity: 'Diária/Semanal', recommendations: 'Remover detritos que podem causar travamento.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Verificação da tensão das correntes e do corrimão', periodicity: 'Mensal', recommendations: 'Garantir o sincronismo e a segurança.', tech_diagnostics: 'Inspeção visual e tátil.' }],
                    'Monta-cargas': [{ type: 'Preventiva', activity: 'Inspeção de cabos, freios e limites de curso', periodicity: 'Mensal', recommendations: 'Similar a elevadores elétricos, mas focado na robustez e carga.', tech_diagnostics: 'Inspeção visual.' }]
                }
            },
            comunicacao: {
                title: 'Comunicação e Segurança Interna',
                icon: '📡',
                tipologias: [
                    { title: 'Interfonia', definicao: 'Sistema de comunicação por áudio (e às vezes vídeo) entre os apartamentos e a portaria.', componentes: 'Central de portaria, terminais nos apartamentos, fiação.', aplicacoes: 'Condomínios residenciais e comerciais.', vantagens: 'Controle de acesso básico e comunicação.', desvantagens: 'Suscetível a problemas de fiação e ruído.' },
                    { title: 'CFTV (Circuito Fechado de TV)', definicao: 'Sistema de vigilância por vídeo, com câmeras posicionadas em pontos estratégicos e gravação das imagens.', componentes: 'Câmeras, gravador de vídeo (DVR/NVR), HD para armazenamento, monitores.', aplicacoes: 'Monitoramento de segurança em todas as áreas de um edifício.', vantagens: 'Inibe ações criminosas, permite a verificação de eventos.', desvantagens: 'Requer manutenção para garantir a qualidade das imagens.' },
                    { title: 'Controle de acesso', definicao: 'Sistemas que gerenciam a entrada e saída de pessoas e veículos.', componentes: 'Leitores (biometria, cartão, tag), fechaduras eletromagnéticas, catracas, cancelas, software de gerenciamento.', aplicacoes: 'Portarias, garagens, áreas restritas.', vantagens: 'Aumenta a segurança e permite o registro de todos os acessos.', desvantagens: 'Pode gerar filas em horários de pico se mal dimensionado.' },
                    { title: 'Sistema de alarme de intrusão', definicao: 'Detecta a entrada não autorizada em uma área protegida e dispara um alarme.', componentes: 'Sensores de presença (infravermelho), sensores magnéticos (portas/janelas), sirene, central de alarme.', aplicacoes: 'Proteção perimetral e de áreas internas fora do horário de expediente.', vantagens: 'Efeito surpresa e de inibição.', desvantagens: 'Suscetível a alarmes falsos.' },
                    { title: 'Portaria remota', definicao: 'Serviço onde o controle de acesso do condomínio é feito à distância por uma central de monitoramento, substituindo o porteiro físico.', componentes: 'Interfonia IP, câmeras, controle de acesso, link de internet dedicado.', aplicacoes: 'Condomínios que buscam reduzir custos com mão de obra.', vantagens: 'Redução de custos, maior segurança (sem rendição do porteiro).', desvantagens: 'Dependência total de internet e energia, pode ser impessoal.' },
                    { title: 'Cabeamento estruturado', definicao: 'Infraestrutura padronizada de cabos (geralmente UTP Cat. 6) que suporta múltiplas aplicações de dados, voz e vídeo.', componentes: 'Cabos UTP, patch panels, racks, tomadas RJ45.', aplicacoes: 'Rede de computadores, telefonia IP, câmeras IP.', vantagens: 'Flexibilidade, facilidade de manutenção e expansão da rede.', desvantagens: 'Custo de implantação mais alto que redes não padronizadas.' },
                    { title: 'Antenas coletivas / TV', definicao: 'Sistema que capta os sinais de TV (aberta ou por assinatura) e os distribui para todos os apartamentos.', componentes: 'Antenas, amplificadores de sinal, divisores (splitters), prumada de cabos.', aplicacoes: 'Edifícios residenciais.', vantagens: 'Evita a instalação de múltiplas antenas individuais na fachada.', desvantagens: 'Perda de sinal se não for bem dimensionado e mantido.' }
                ],
                patologias: [
                    { title: 'Ruído ou Falha na Comunicação', sintomas: 'Chiado na linha, comunicação cortada ou inexistente.', causas: 'Oxidação nas conexões, fiação antiga ou danificada, problema na central.', typology_link: 'Interfonia' },
                    { title: 'Imagem de Baixa Qualidade ou Inexistente', sintomas: 'Imagem escura, com chuvisco, sem cor ou sem sinal.', causas: 'Câmera suja ou danificada, problema no cabo ou conectores, HD do gravador cheio ou com defeito.', typology_link: 'CFTV (Circuito Fechado de TV)' },
                    { title: 'Perda de Gravação', sintomas: 'Sistema não grava imagens ou grava por pouco tempo.', causas: 'Falha no disco rígido (HD) do gravador, configuração incorreta.', typology_link: 'CFTV (Circuito Fechado de TV)' },
                    { title: 'Falha na Leitura', sintomas: 'Leitor biométrico ou de cartão não reconhece o usuário, ou demora para liberar.', causas: 'Leitor sujo, software desatualizado, cartão danificado, falha na fechadura.', typology_link: 'Controle de acesso' },
                    { title: 'Falha na Fechadura Eletromagnética', sintomas: 'Porta não trava ou não destrava com o comando.', causas: 'Problema na fonte de alimentação, falha no eletroímã, desalinhamento da porta.', typology_link: 'Controle de acesso' },
                    { title: 'Disparos Falsos de Alarme', sintomas: 'Alarme de intrusão dispara sem motivo aparente.', causas: 'Sensor de presença mal posicionado (pegando sol ou vento), animais de estimação, teias de aranha.', typology_link: 'Sistema de alarme de intrusão' },
                    { title: 'Atraso na Abertura de Portões', sintomas: 'Demora excessiva para o operador remoto atender e liberar o acesso.', causas: 'Link de internet instável ou de baixa velocidade.', typology_link: 'Portaria remota' },
                    { title: 'Ponto de Rede Inoperante', sintomas: 'Computador ou telefone não conecta à rede.', causas: 'Problema no cabo, na tomada RJ45 ou na porta do patch panel.', typology_link: 'Cabeamento estruturado' },
                    { title: 'Sinal de TV Ruim', sintomas: 'Imagem com chuvisco, congelando ou com "fantasmas".', causas: 'Amplificador de sinal com defeito, divisores de má qualidade, cabo danificado.', typology_link: 'Antenas coletivas / TV' }
                ],
                diagnostico: [
                    { title: 'Certificador de Cabos', desc: 'Equipamento que testa todos os parâmetros de um cabo de rede estruturado (ex: comprimento, atenuação, diafonia), garantindo que ele atende à sua categoria.' },
                    { title: 'Medidor de Campo (TV)', desc: 'Mede a intensidade e a qualidade do sinal de TV em diferentes pontos da prumada, identificando onde ocorrem as perdas.' },
                    { title: 'Análise de Logs de Sistema', desc: 'Verificação dos registros de eventos em sistemas de CFTV e controle de acesso para diagnosticar falhas e eventos de segurança.' }
                ],
                tecnologias: [
                    { icon: '🧠', title: 'Análise de Vídeo com IA', desc: 'Software que analisa as imagens do CFTV para detectar atitudes suspeitas, abandono de objetos, contagem de pessoas, leitura de placas de veículos, etc.' },
                    { icon: '📱', title: 'Controle de Acesso por Celular (QR Code)', desc: 'Uso de QR Codes dinâmicos gerados em um aplicativo para liberar o acesso de visitantes, aumentando a segurança e a praticidade.' },
                    { icon: '☁️', title: 'CFTV e Interfonia na Nuvem', desc: 'Sistemas que armazenam as gravações e gerenciam a comunicação via internet, eliminando a necessidade de equipamentos locais e permitindo o acesso de qualquer lugar.' }
                ],
                maintenance_schedules: {
                    'Interfonia': [{ type: 'Preventiva', activity: 'Teste de comunicação de todos os pontos', periodicity: 'Semestral', recommendations: 'Verificar se todos os apartamentos conseguem se comunicar com a portaria.', tech_diagnostics: 'Teste funcional.' }],
                    'CFTV (Circuito Fechado de TV)': [{ type: 'Preventiva', activity: 'Limpeza das lentes das câmeras', periodicity: 'Trimestral', recommendations: 'Garantir a qualidade da imagem.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Verificação do armazenamento e gravação', periodicity: 'Mensal', recommendations: 'Checar se o sistema está gravando e se há espaço livre no HD.', tech_diagnostics: 'Análise de software.' }],
                    'Controle de acesso': [{ type: 'Preventiva', activity: 'Limpeza de leitores (biometria, cartão)', periodicity: 'Trimestral', recommendations: 'Garantir a eficiência da leitura.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Backup do banco de dados de usuários', periodicity: 'Mensal', recommendations: 'Garantir a recuperação em caso de falha.', tech_diagnostics: 'Software de gerenciamento.' }],
                    'Sistema de alarme de intrusão': [{ type: 'Preventiva', activity: 'Teste de todos os sensores', periodicity: 'Semestral', recommendations: 'Garantir que todos os pontos vulneráveis estão protegidos.', tech_diagnostics: 'Teste funcional.' }],
                    'Portaria remota': [{ type: 'Preventiva', activity: 'Teste do link de internet e no-break', periodicity: 'Mensal', recommendations: 'Garantir a redundância e a comunicação com a central.', tech_diagnostics: 'Teste funcional.' }],
                    'Cabeamento estruturado': [{ type: 'Preditiva', activity: 'Certificação de pontos críticos', periodicity: 'A cada 5 anos', recommendations: 'Garantir que a infraestrutura de rede ainda atende aos padrões.', tech_diagnostics: 'Certificador de cabos.' }],
                    'Antenas coletivas / TV': [{ type: 'Preventiva', activity: 'Verificação da qualidade do sinal nos pontos', periodicity: 'Anual', recommendations: 'Ajustar amplificadores e verificar conexões.', tech_diagnostics: 'Medidor de campo.' }]
                }
            }
        }
    },
    externas: {
        title: 'Áreas Externas',
        intro: 'A manutenção das áreas comuns e externas é crucial não apenas para a estética e valorização do imóvel, mas também para o lazer, bem-estar e segurança dos usuários.',
        systems: {
            paisagismo: {
                title: 'Paisagismo e Irrigação',
                icon: '🌳',
                tipologias: [
                    { title: 'Jardim gramado', definicao: 'Áreas cobertas por grama, geralmente para fins estéticos ou de lazer.', componentes: 'Grama (diversos tipos), substrato, sistema de drenagem.', aplicacoes: 'Jardins residenciais, parques, campos esportivos.', vantagens: 'Estética agradável, permeabilidade do solo.', desvantagens: 'Exige manutenção constante (corte, adubação).' },
                    { title: 'Jardim vertical', definicao: 'Estrutura instalada em uma parede para o cultivo de plantas na vertical.', componentes: 'Estrutura de suporte, vasos ou blocos, sistema de irrigação, plantas.', aplicacoes: 'Fachadas, paredes internas, muros.', vantagens: 'Melhora o conforto térmico, estética, otimiza o espaço.', desvantagens: 'Custo de implantação, manutenção da irrigação é crítica.' },
                    { title: 'Espelho d’água', definicao: 'Lâmina de água de pequena profundidade, com função principalmente ornamental.', componentes: 'Tanque impermeabilizado, bombas de circulação, filtros.', aplicacoes: 'Halls de entrada, jardins, áreas de contemplação.', vantagens: 'Estética, melhora a umidade do ar.', desvantagens: 'Requer tratamento da água para evitar algas e dengue.' },
                    { title: 'Irrigação por gotejamento', definicao: 'Sistema que aplica água diretamente na raiz da planta através de pequenos emissores (gotejadores), de forma lenta e precisa.', componentes: 'Tubos gotejadores, filtros, válvulas.', aplicacoes: 'Jardins, vasos, hortas.', vantagens: 'Altíssima eficiência, economia de água.', desvantagens: 'Risco de entupimento dos gotejadores.' },
                    { title: 'Irrigação automatizada', definicao: 'Sistema que utiliza aspersores ou gotejadores controlados por um programador (timer), que aciona a rega em horários pré-definidos.', componentes: 'Controlador, válvulas solenoides, aspersores, sensores de chuva (opcional).', aplicacoes: 'Grandes jardins, campos esportivos.', vantagens: 'Praticidade, garante a rega nos horários corretos.', desvantagens: 'Custo de instalação, pode desperdiçar água se não tiver sensor de chuva.' },
                    { title: 'Captação e reuso para irrigação', definicao: 'Aproveitamento da água da chuva ou de reuso (cinza) para a irrigação dos jardins.', componentes: 'Cisterna, sistema de bombeamento, filtros.', aplicacoes: 'Edifícios sustentáveis.', vantagens: 'Economia de água potável.', desvantagens: 'Requer investimento em reservatórios e tratamento.' }
                ],
                patologias: [
                    { title: 'Amarelamento e Falhas na Grama', sintomas: 'Manchas amareladas ou áreas sem grama.', causas: 'Falta de adubação, compactação do solo, ataque de pragas ou fungos, irrigação inadequada.', typology_link: 'Jardim gramado' },
                    { title: 'Surgimento de Ervas Daninhas', sintomas: 'Crescimento de plantas indesejadas no meio da grama ou canteiros.', causas: 'Dispersão de sementes pelo vento, solo pobre em nutrientes que favorece certas espécies.', typology_link: 'Jardim gramado' },
                    { title: 'Morte de Plantas no Jardim Vertical', sintomas: 'Folhas secas, plantas morrendo em uma determinada área.', causas: 'Falha na irrigação (gotejador entupido), excesso de sol ou sombra.', typology_link: 'Jardim vertical' },
                    { title: 'Vazamento no Sistema de Irrigação Vertical', sintomas: 'Manchas de umidade ou eflorescência na parede abaixo ou ao lado do jardim.', causas: 'Furo na tubulação, conexão mal feita, falha na impermeabilização do suporte.', typology_link: 'Jardim vertical' },
                    { title: 'Água Verde e Mau Cheiro', sintomas: 'Proliferação de algas, odor.', causas: 'Falta de circulação e filtragem da água, excesso de matéria orgânica.', typology_link: 'Espelho d’água' },
                    { title: 'Entupimento de Gotejadores', sintomas: 'Plantas em uma linha morrendo por falta de água.', causas: 'Partículas de sujeira na água, falta de filtro no sistema.', typology_link: 'Irrigação por gotejamento' },
                    { title: 'Aspersor Quebrado ou Desregulado', sintomas: 'Jato de água irregular, molhando paredes ou calçadas.', causas: 'Dano por impacto (cortador de grama), desgaste natural.', typology_link: 'Irrigação automatizada' },
                    { title: 'Bomba da Cisterna não Funciona', sintomas: 'Sistema de irrigação não liga.', causas: 'Problema elétrico, boia de nível com defeito, motor da bomba queimado.', typology_link: 'Captação e reuso para irrigação' }
                ],
                diagnostico: [
                    { title: 'Análise de Solo', desc: 'Verificação de pH e nutrientes para orientar a adubação correta do jardim.' },
                    { title: 'Teste de Vazão e Pressão', desc: 'Medição da pressão e da vazão na rede de irrigação para garantir que os aspersores e gotejadores funcionem corretamente.' },
                    { title: 'Análise da Qualidade da Água', desc: 'Verificação de parâmetros como pH e cloro em espelhos d\'água e fontes para garantir um ambiente saudável.' }
                ],
                tecnologias: [
                    { icon: '🌦️', title: 'Controladores de Irrigação Inteligentes', desc: 'Sistemas que se conectam à internet para obter dados meteorológicos locais e ajustam o tempo de rega automaticamente, economizando água.' },
                    { icon: '💧', title: 'Sensores de Umidade do Solo', desc: 'Sensores que medem a umidade da terra e liberam a irrigação apenas quando necessário, representando a forma mais eficiente de rega.' },
                    { icon: '🤖', title: 'Robôs Cortadores de Grama', desc: 'Equipamentos autônomos que mantêm a grama aparada constantemente, operando de forma silenciosa e com baixo consumo de energia.' }
                ],
                maintenance_schedules: {
                    'Jardim gramado': [{ type: 'Preventiva', activity: 'Corte da grama', periodicity: 'Semanal/Quinzenal', recommendations: 'Manter a altura ideal para a espécie.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Adubação e aeração do solo', periodicity: 'Semestral', recommendations: 'Garantir nutrientes e descompactar o solo.', tech_diagnostics: 'Análise de solo.' }],
                    'Jardim vertical': [{ type: 'Preventiva', activity: 'Verificação do sistema de irrigação', periodicity: 'Semanal', recommendations: 'Checar se todos os gotejadores estão funcionando.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Poda e adubação foliar', periodicity: 'Mensal', recommendations: 'Manter a saúde e a estética das plantas.', tech_diagnostics: 'Inspeção visual.' }],
                    'Espelho d’água': [{ type: 'Preventiva', activity: 'Limpeza de filtros e da bomba', periodicity: 'Quinzenal', recommendations: 'Evitar entupimentos e manter a circulação.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Tratamento químico da água', periodicity: 'Semanal', recommendations: 'Controlar pH e cloro para evitar algas.', tech_diagnostics: 'Kit de análise de água.' }],
                    'Irrigação por gotejamento': [{ type: 'Preventiva', activity: 'Limpeza do filtro principal do sistema', periodicity: 'Mensal', recommendations: 'Evitar que partículas entupam os gotejadores.', tech_diagnostics: 'Inspeção visual.' }],
                    'Irrigação automatizada': [{ type: 'Preventiva', activity: 'Inspeção e regulagem dos aspersores', periodicity: 'Mensal', recommendations: 'Verificar se os jatos estão corretos e sem obstruções.', tech_diagnostics: 'Inspeção visual.' }, { type: 'Preventiva', activity: 'Verificação da programação do controlador', periodicity: 'Sazonal', recommendations: 'Ajustar o tempo de rega para verão e inverno.', tech_diagnostics: 'Inspeção visual.' }],
                    'Captação e reuso para irrigação': [{ type: 'Preventiva', activity: 'Limpeza dos filtros de entrada da cisterna', periodicity: 'Trimestral', recommendations: 'Remover folhas e detritos.', tech_diagnostics: 'Inspeção visual.' }]
                }
            }
        }
    }
};

  // ── Camada 0: normas transversais (aplicam-se a TODOS os sistemas) ──────────
  readonly normasTransversais: NormaRef[] = [
    { codigo: 'ABNT NBR 16747', titulo: 'Inspeção predial — Diretrizes, conceitos, terminologia e procedimento', aplicacao: 'Metodologia base para toda a inspeção predial, classificação de risco e emissão do RTIPA.', status: 'CONFIRMADO' },
    { codigo: 'ABNT NBR 5674', titulo: 'Manutenção de edificações — Requisitos para o sistema de gestão de manutenção', aplicacao: 'Auditoria do plano de manutenção preventiva e verificação de cronogramas por sistema.', status: 'CONFIRMADO' },
    { codigo: 'ABNT NBR 14037', titulo: 'Diretrizes para elaboração de manuais de uso, operação e manutenção das edificações', aplicacao: 'Verificação se o manual do imóvel foi entregue e contém os limites de carga e diretrizes de conservação.', status: 'CONFIRMADO' },
    { codigo: 'ABNT NBR 16280', titulo: 'Reforma em edificações — Sistema de gestão de reformas — Requisitos', aplicacao: 'Auditoria de reformas realizadas nas unidades para verificar comprometimento do sistema estrutural ou de vedação.', status: 'CONFIRMADO' },
    { codigo: 'ABNT NBR 15575-1', titulo: 'Edificações habitacionais — Desempenho — Parte 1: Requisitos gerais', aplicacao: 'Parâmetros gerais de desempenho e vida útil de projeto (VUP) aplicáveis a todos os sistemas.', status: 'CONFIRMADO' },
    { codigo: 'ABNT NBR 17170', titulo: 'Edificações — Garantias — Prazos recomendados e diretrizes', aplicacao: 'Determinação dos prazos de garantia para subsidiar responsabilização técnica.', status: 'CONFIRMADO' },
  ];

  // ── Camada 1+2: normas por sistema e por tipologia ──────────────────────────
  readonly normasPorSistema: { [systemTitle: string]: NormasSistema } = {

    'Sistemas Estruturais': {
      sistema: [
        { codigo: 'ABNT NBR 6118', titulo: 'Projeto de estruturas de concreto', aplicacao: 'Critérios de durabilidade, cobrimento, fissuração e dimensionamento para concreto armado e protendido.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 14931', titulo: 'Execução de estruturas de concreto armado, protendido e com fibras — Requisitos', aplicacao: 'Verificação de conformidade executiva: tolerâncias, segregação, lançamento e cura.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 8800', titulo: 'Projeto de estruturas de aço e de estruturas mistas de aço e concreto de edificações', aplicacao: 'Avaliação de integridade, deformações (flambagem) e corrosão em perfis metálicos.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 7190-1', titulo: 'Projeto de estruturas de madeira — Parte 1: Critérios de dimensionamento', aplicacao: 'Limites de umidade, deformação e integridade para estruturas de madeira.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 8681', titulo: 'Ações e segurança nas estruturas', aplicacao: 'Critérios de quantificação de ações e combinações de carga para segurança estrutural.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 15575-2', titulo: 'Edificações habitacionais — Desempenho — Parte 2: Requisitos para os sistemas estruturais', aplicacao: 'Parâmetros de desempenho estrutural, VUP e estados limites de fissuração.', status: 'PENDENTE' },
      ],
      tipologias: {
        'Concreto armado in loco': [
          { codigo: 'ABNT NBR 6118', titulo: 'Projeto de estruturas de concreto', aplicacao: 'Larguras-limite de fissuras e taxas mínimas de cobrimento.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 14931', titulo: 'Execução de estruturas de concreto armado, protendido e com fibras', aplicacao: 'Controle de vibração, segregação ("bicheiras") and cura.', status: 'CONFIRMADO' },
        ],
        'Concreto protendido': [
          { codigo: 'ABNT NBR 6118', titulo: 'Projeto de estruturas de concreto', aplicacao: 'Verificação de flechas e larguras de fissuras em lajes e vigas protendidas.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 7483', titulo: 'Cordoalhas de aço para estruturas de concreto protendido — Especificação', aplicacao: 'Qualidade das cordoalhas e análise de perdas de protensão.', status: 'CONFIRMADO' },
        ],
        'Alvenaria estrutural': [
          { codigo: 'ABNT NBR 16868-1', titulo: 'Alvenaria estrutural — Parte 1: Projeto', aplicacao: 'Limites de esbeltez, distribuição de cargas e estados limites de fissuração.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 16868-2', titulo: 'Alvenaria estrutural — Parte 2: Execução e controle de obras', aplicacao: 'Falhas executivas: ausência de grauteamento, juntas de argamassa irregulares.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 16868-3', titulo: 'Alvenaria estrutural — Parte 3: Métodos de ensaio', aplicacao: 'Ensaios de prismas para verificação de resistência do sistema.', status: 'CONFIRMADO' },
        ],
        'Estrutura metálica': [
          { codigo: 'ABNT NBR 8800', titulo: 'Projeto de estruturas de aço e de estruturas mistas', aplicacao: 'Flambagem de perfis, conexões soldadas/parafusadas e proteção anticorrosiva.', status: 'CONFIRMADO' },
        ],
        'Estrutura de madeira': [
          { codigo: 'ABNT NBR 7190-1', titulo: 'Projeto de estruturas de madeira — Parte 1', aplicacao: 'Flechas-limite e comportamento de peças serradas ou lameladas.', status: 'CONFIRMADO' },
        ],
        'Steel frame': [
          { codigo: 'ABNT NBR 16970-1', titulo: 'Light Steel Framing — Sistemas construtivos estruturais leves — Parte 1: Desempenho', aplicacao: 'Rigidez, proteção contra corrosão galvânica e estanqueidade mecânica.', status: 'PENDENTE' },
        ],
        'Wood frame': [
          { codigo: 'ABNT NBR 16936', titulo: 'Edificações em wood frame — Diretrizes para projeto, execução e controle', aplicacao: 'Controle de umidade em painéis de madeira e estabilidade do esqueleto estrutural.', status: 'PENDENTE' },
        ],
        'Painéis CLT (Cross Laminated Timber)': [
          { codigo: 'ABNT NBR 7190-7', titulo: 'Projeto de estruturas de madeira — Parte 7: Ensaios para madeira lamelada colada cruzada', aplicacao: 'Verificação de painéis CLT e detecção de delaminação.', status: 'CONFIRMADO' },
        ],
        'Pré-moldados de concreto': [
          { codigo: 'ABNT NBR 9062', titulo: 'Projeto e execução de estruturas de concreto pré-moldado', aplicacao: 'Patologias em ligações viga-pilar, consolos, dentes Gerber e juntas de dilatação.', status: 'CONFIRMADO' },
        ],
      },
    },

    'Sistemas de Fundações': {
      sistema: [
        { codigo: 'ABNT NBR 6122', titulo: 'Projeto e execução de fundações', aplicacao: 'Norma mater: parâmetros de estabilidade, recalques e diretrizes executivas para todas as tipologias.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 15575-2', titulo: 'Edificações habitacionais — Desempenho — Parte 2: Sistemas estruturais', aplicacao: 'Limites de deformação e VUP aplicáveis às fundações em habitações.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 6484', titulo: 'Solo — Sondagem de simples reconhecimento com SPT — Método de ensaio', aplicacao: 'Análise documental: confronto do perfil N-SPT com recalques observados na superestrutura.', status: 'PENDENTE' },
      ],
      tipologias: {
        'Sapata isolada': [
          { codigo: 'ABNT NBR 6489', titulo: 'Solo — Prova de carga estática em fundação direta', aplicacao: 'Verificação da capacidade de carga e recalque em fundações rasas.', status: 'PENDENTE' },
        ],
        'Sapata corrida': [
          { codigo: 'ABNT NBR 6489', titulo: 'Solo — Prova de carga estática em fundação direta', aplicacao: 'Verificação de capacidade de carga em fundações lineares.', status: 'PENDENTE' },
        ],
        'Viga baldrame': [
          { codigo: 'ABNT NBR 6118', titulo: 'Projeto de estruturas de concreto', aplicacao: 'Dimensionamento do concreto armado e cobrimento mínimo das armaduras.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 9574', titulo: 'Execução de impermeabilização', aplicacao: 'Impermeabilização da viga para barreira contra umidade ascendente.', status: 'CONFIRMADO' },
        ],
        'Radier': [
          { codigo: 'ABNT NBR 6489', titulo: 'Solo — Prova de carga estática em fundação direta', aplicacao: 'Verificação da capacidade de suporte e recalques do radier.', status: 'PENDENTE' },
          { codigo: 'ABNT NBR 9575', titulo: 'Impermeabilização — Seleção e projeto', aplicacao: 'Impermeabilização do radier contra infiltração ascendente.', status: 'CONFIRMADO' },
        ],
        'Estaca hélice contínua': [
          { codigo: 'ABNT NBR 6122', titulo: 'Projeto e execução de fundações (Anexo J/O)', aplicacao: 'Controle de execução, pressão de injeção e detecção de estrangulamento do fuste.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 16903', titulo: 'Solo — Prova de carga estática em fundação profunda', aplicacao: 'Comprovação da capacidade de carga della estaca.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 13208', titulo: 'Estacas — Ensaios de carregamento dinâmico', aplicacao: 'Ensaio PDA/PIT para detecção de falhas no fuste e avaliação dinâmica de carga.', status: 'PENDENTE' },
        ],
        'Estaca Strauss': [
          { codigo: 'ABNT NBR 6122', titulo: 'Projeto e execução de fundações (Anexo G)', aplicacao: 'Avaliação patológica baseada nas diretrizes do Anexo G.', status: 'CONFIRMADO' },
        ],
        'Estaca pré-moldada': [
          { codigo: 'ABNT NBR 16258', titulo: 'Estacas pré-fabricadas de concreto — Requisitos', aplicacao: 'Avaliação de trincas, fissuras de cravação e tolerâncias dimensionais.', status: 'PENDENTE' },
          { codigo: 'ABNT NBR 9062', titulo: 'Projeto e execução de estruturas de concreto pré-moldado', aplicacao: 'Falhas no concreto pré-moldado e corrosão de armaduras.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 16903', titulo: 'Solo — Prova de carga estática em fundação profunda', aplicacao: 'Verificação da capacidade de carga após a cravação.', status: 'CONFIRMADO' },
        ],
        'Estaca metálica': [
          { codigo: 'ABNT NBR 8800', titulo: 'Projeto de estruturas de aço', aplicacao: 'Cálculo da espessura de sacrifício e avaliação de corrosão galvânica.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 17007', titulo: 'Soldagem de aços para emendas de estacas de fundações — Requisitos', aplicacao: 'Inspeção de continuidade e falhas nas soldas de emenda.', status: 'PENDENTE' },
        ],
        'Tubulão': [
          { codigo: 'ABNT NBR 6122', titulo: 'Projeto e execução de fundações', aplicacao: 'Análise da base, dimensões do alargamento e inspeção do maciço de apoio.', status: 'CONFIRMADO' },
        ],
        'Microestaca': [
          { codigo: 'ABNT NBR 6122', titulo: 'Projeto e execução de fundações (Anexo M/K)', aplicacao: 'Diretrizes de injeção e limites de capacidade de carga.', status: 'CONFIRMADO' },
        ],
      },
    },

    'Sistemas de Vedação e Revestimento Externo': {
      sistema: [
        { codigo: 'ABNT NBR 15575-4', titulo: 'Edificações habitacionais — Desempenho — Parte 4: Sistemas de vedações verticais internas e externas', aplicacao: 'Métricas de estanqueidade, desempenho térmico, acústico e VUP das fachadas.', status: 'PENDENTE' },
      ],
      tipologias: {
        'Painéis de concreto': [
          { codigo: 'ABNT NBR 16475', titulo: 'Painéis de parede de concreto pré-moldado — Requisitos e procedimentos', aplicacao: 'Integridade das fixações mecânicas, juntas de dilatação e selantes.', status: 'PENDENTE' },
        ],
        'ACM (Aluminum Composite Material)': [
          { codigo: 'ABNT NBR 15446', titulo: 'Painéis de material composto de alumínio utilizados em fachadas', aplicacao: 'Verificação da espessura do compósito e estabilidade dos fixadores.', status: 'PENDENTE' },
        ],
        'Revestimento cerâmico externo': [
          { codigo: 'ABNT NBR 13755', titulo: 'Revestimentos cerâmicos de fachadas com argamassa colante — Projeto, execução, inspeção e aceitação', aplicacao: 'Investigação de desplacamentos, som cavo e juntas de movimentação.', status: 'PENDENTE' },
        ],
        'Pastilhas': [
          { codigo: 'ABNT NBR 13755', titulo: 'Revestimentos cerâmicos de fachadas com argamassa colante', aplicacao: 'Inspeção de aderência, som cavo e desplacamento de pastilhas.', status: 'PENDENTE' },
        ],
        'Argamassa (reboco / monocapa)': [
          { codigo: 'ABNT NBR 13749', titulo: 'Revestimento de paredes e tetos de argamassas inorgânicas — Especificação', aplicacao: 'Espessura admissível, aderência e mapeamento de fissuras.', status: 'PENDENTE' },
        ],
        'Pintura acrílica ou elastomérica': [
          { codigo: 'ABNT NBR 13245', titulo: 'Tintas para construção civil — Execução de pinturas — Preparação de superfície', aplicacao: 'Investigação de descascamentos, bolhas, eflorescência e falhas de preparo do substrato.', status: 'PENDENTE' },
        ],
      },
    },

    'Sistemas de Cobertura': {
      sistema: [
        { codigo: 'ABNT NBR 15575-5', titulo: 'Edificações habitacionais — Desempenho — Parte 5: Sistemas de coberturas', aplicacao: 'Estanqueidade, resistência a cargas de vento e VUP das coberturas.', status: 'PENDENTE' },
        { codigo: 'ABNT NBR 9575', titulo: 'Impermeabilização — Seleção e projeto', aplicacao: 'Adequação da tipologia de impermeabilização ao tipo de pressão d\'água (positiva/negativa).', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 9574', titulo: 'Execução de impermeabilização', aplicacao: 'Avaliação de patologias de execução: arremates falhos em ralos, rufos e caimentos.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Telhado cerâmico': [
          { codigo: 'ABNT NBR 15310', titulo: 'Componentes cerâmicos — Telhas — Terminologia, requisitos e métodos de ensaio', aplicacao: 'Absorção de água, eflorescência, empenamento e quebras de telhas.', status: 'PENDENTE' },
        ],
        'Telhado de concreto': [
          { codigo: 'ABNT NBR 13858-1', titulo: 'Telhas de concreto — Parte 1: Projeto e execução de telhados', aplicacao: 'Inclinações mínimas, sobreposição e amarrações de telhas de concreto.', status: 'PENDENTE' },
        ],
        'Telhado fibrocimento': [
          { codigo: 'ABNT NBR 15210-1', titulo: 'Telhas onduladas e peças complementares de fibrocimento sem amianto — Parte 1', aplicacao: 'Microfissuras (gerçuras), degradação e integridade mecânica das telhas.', status: 'PENDENTE' },
        ],
        'Manta asfáltica': [
          { codigo: 'ABNT NBR 9952', titulo: 'Manta asfáltica para impermeabilização', aplicacao: 'Diagnóstico de bolhas (blistering), perda de espessura e descolamento de juntas.', status: 'PENDENTE' },
        ],
        'Membrana EPDM / PVC': [
          { codigo: 'ABNT NBR 16184', titulo: 'Membrana sintética de cloreto de polivinila (PVC) para impermeabilização', aplicacao: 'Falhas nas termossoldas, retração e fragilização por raios UV.', status: 'PENDENTE' },
        ],
      },
    },

    'Sistemas de Impermeabilização': {
      sistema: [
        { codigo: 'ABNT NBR 9575', titulo: 'Impermeabilização — Seleção e projeto', aplicacao: 'Adequação da tipologia ao tipo de pressão d\'água e ao substrato.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 9574', titulo: 'Execução de impermeabilização', aplicacao: 'Avaliação de falhas de execução visíveis: arremates, rodapés, caimentos.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Manta asfáltica': [
          { codigo: 'ABNT NBR 9952', titulo: 'Manta asfáltica para impermeabilização', aplicacao: 'Bolhas (blistering), emendas abertas, ressecamento e furos.', status: 'PENDENTE' },
        ],
        'Membrana EPDM / PVC': [
          { codigo: 'ABNT NBR 16184', titulo: 'Membrana sintética de PVC para impermeabilização', aplicacao: 'Furos, retração e falhas em juntas de termossoldagem.', status: 'PENDENTE' },
        ],
        'Emulsão asfáltica': [
          { codigo: 'ABNT NBR 9685', titulo: 'Emulsão asfáltica sem carga para impermeabilização', aplicacao: 'Lavagem do produto, falha na formação de película e incompatibilidade de substrato.', status: 'PENDENTE' },
        ],
      },
    },

    'Sistemas Hidrossanitários': {
      sistema: [
        { codigo: 'ABNT NBR 15575-6', titulo: 'Edificações habitacionais — Desempenho — Parte 6: Sistemas hidrossanitários', aplicacao: 'Requisitos de desempenho e VUP para sistemas prediais de água e esgoto.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Água fria (PVC, PPR, PEX, cobre)': [
          { codigo: 'ABNT NBR 5626', titulo: 'Sistemas prediais de água fria e água quente — Projeto, execução, operação e manutenção', aplicacao: 'Inspeção de pressões, potabilidade, estanqueidade e integridade de conexões.', status: 'CONFIRMADO' },
        ],
        'Água quente (CPVC, PEX, cobre)': [
          { codigo: 'ABNT NBR 5626', titulo: 'Sistemas prediais de água fria e água quente', aplicacao: 'Isolamento térmico, pressões e prevenção de golpe de aríete.', status: 'CONFIRMADO' },
        ],
        'Esgoto (PVC, PEAD)': [
          { codigo: 'ABNT NBR 8160', titulo: 'Sistemas prediais de esgoto sanitário — Projeto e execução', aplicacao: 'Ventilação da rede, selos hídricos e escoamento adequado.', status: 'CONFIRMADO' },
        ],
        'Água pluvial': [
          { codigo: 'ABNT NBR 10844', titulo: 'Instalações prediais de águas pluviais — Procedimento', aplicacao: 'Calhas, condutores, dimensionamento e obstrução de ralos.', status: 'CONFIRMADO' },
        ],
        'Reuso de água cinza': [
          { codigo: 'ABNT NBR 15527', titulo: 'Água de chuva — Aproveitamento para fins não potáveis — Requisitos', aplicacao: 'Qualidade da água, tanques de armazenamento e sistemas de filtragem.', status: 'CONFIRMADO' },
        ],
        'Aproveitamento de água da chuva': [
          { codigo: 'ABNT NBR 15527', titulo: 'Água de chuva — Aproveitamento para fins não potáveis', aplicacao: 'Qualidade, armazenamento e prevenção de contaminação cruzada.', status: 'CONFIRMADO' },
        ],
        'Sistema de aquecimento (solar, gás, elétrico)': [
          { codigo: 'ABNT NBR 15569', titulo: 'Sistemas de aquecimento solar de água — Projeto e instalação', aplicacao: 'Coletores, isolamento térmico e segurança do sistema solar.', status: 'CONFIRMADO' },
        ],
      },
    },

    'Sistema de Gás Combustível': {
      sistema: [
        { codigo: 'ABNT NBR 15526', titulo: 'Redes de distribuição interna para gases combustíveis em instalações residenciais e comerciais — Projeto e execução', aplicacao: 'Estanqueidade, pressão e segurança em tubulações de GLP e GN.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'GLP - Gás Liquefeito de Petróleo': [{ codigo: 'ABNT NBR 15526', titulo: 'Redes de distribuição interna para gases combustíveis', aplicacao: 'Central de GLP: armazenamento, regulagem, ventilação e estanqueidade.', status: 'CONFIRMADO' }],
        'GN - Gás Natural': [{ codigo: 'ABNT NBR 15526', titulo: 'Redes de distribuição interna para gases combustíveis', aplicacao: 'Distribuição, medição e segurança na rede de GN.', status: 'CONFIRMADO' }],
        'Tubulação de Aço-Carbono': [{ codigo: 'ABNT NBR 15526', titulo: 'Redes de distribuição interna para gases combustíveis', aplicacao: 'Corrosão externa, conexões roscadas e estanqueidade em aço-carbono.', status: 'CONFIRMADO' }],
        'Tubulação de Cobre': [{ codigo: 'ABNT NBR 15526', titulo: 'Redes de distribuição interna para gases combustíveis', aplicacao: 'Qualidade das soldas (brasagem) e integridade de tubulações de cobre.', status: 'CONFIRMADO' }],
        'Tubulação PEX Multicamadas': [{ codigo: 'ABNT NBR 15526', titulo: 'Redes de distribuição interna para gases combustíveis', aplicacao: 'Prensagem de conexões e exposição a raios UV.', status: 'CONFIRMADO' }],
      },
    },

    'Sistemas Elétricos': {
      sistema: [
        { codigo: 'ABNT NBR 5410', titulo: 'Instalações elétricas de baixa tensão', aplicacao: 'Inspeção geral de quadros, cabos, circuitos, aterramento e proteções.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Quadros elétricos': [{ codigo: 'ABNT NBR 5410', titulo: 'Instalações elétricas de baixa tensão', aplicacao: 'Sobreaquecimento de disjuntores, oxidação de barramentos e aterramento.', status: 'CONFIRMADO' }],
        'Fios e cabos (cobre, alumínio)': [{ codigo: 'ABNT NBR 5410', titulo: 'Instalações elétricas de baixa tensão', aplicacao: 'Ressecamento de isolação, fuga de corrente e bitola adequada.', status: 'CONFIRMADO' }],
        'Energia fotovoltaica': [
          { codigo: 'ABNT NBR 16690', titulo: 'Instalações elétricas de arranjos fotovoltaicos — Requisitos de projeto', aplicacao: 'Inspeção de inversores, módulos e hotspots em painéis fotovoltaicos.', status: 'CONFIRMADO' },
          { codigo: 'ABNT NBR 16274', titulo: 'Sistemas fotovoltaicos conectados à rede — Requisitos mínimos', aplicacao: 'Comissionamento, segurança e desempenho de sistemas FV.', status: 'CONFIRMADO' },
        ],
      },
    },

    'Climatização e Exaustão': {
      sistema: [
        { codigo: 'ABNT NBR 5410', titulo: 'Instalações elétricas de baixa tensão', aplicacao: 'Infraestrutura elétrica de alimentação de unidades de ar-condicionado, bombas e ventiladores.', status: 'CONFIRMADO' },
        { codigo: 'ABNT NBR 16401', titulo: 'Instalações de ar-condicionado — Sistemas centrais e unitários', aplicacao: 'Renovação do ar, conforto térmico, filtragem e eficiência energética.', status: 'PENDENTE' },
      ],
      tipologias: {
        'Pressurização de escadas': [
          { codigo: 'ABNT NBR 14880', titulo: 'Saídas de emergência — Escada de segurança — Controle de fumaça por pressurização', aplicacao: 'Diferenciais de pressão, velocidade do ar nas portas e acionamento automático.', status: 'PENDENTE' },
        ],
        'Exaustores em garagem e cozinha': [
          { codigo: 'ABNT NBR 14518', titulo: 'Sistemas de ventilação para cozinhas profissionais', aplicacao: 'Acúmulo de gordura em dutos e intertravamento com sistemas de incêndio.', status: 'PENDENTE' },
        ],
      },
    },

    'Sistemas de Incêndio e SPDA': {
      sistema: [
        { codigo: 'ABNT NBR 5410', titulo: 'Instalações elétricas de baixa tensão', aplicacao: 'Infraestrutura elétrica de bombas de incêndio, central de alarme e SPDA.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Hidrantes e mangotinhos': [
          { codigo: 'ABNT NBR 13714', titulo: 'Sistemas de hidrantes e de mangotinhos para combate a incêndio', aplicacao: 'Pressão, integridade de mangueiras, esguichos, engates e registros de recalque.', status: 'PENDENTE' },
        ],
        'Sprinklers (chuveiros automáticos)': [
          { codigo: 'ABNT NBR 10897', titulo: 'Sistemas de proteção contra incêndio por chuveiros automáticos — Requisitos', aplicacao: 'Bicos obstruídos, alarmes de fluxo, reserva técnica e bombas.', status: 'PENDENTE' },
        ],
        'Extintores': [
          { codigo: 'ABNT NBR 12693', titulo: 'Sistemas de proteção por extintores de incêndio', aplicacao: 'Validade (teste hidrostático), integridade, desobstrução e carga adequada.', status: 'PENDENTE' },
        ],
        'Detectores e alarmes': [
          { codigo: 'ABNT NBR 17240', titulo: 'Sistemas de detecção e alarme de incêndio — Projeto, instalação, comissionamento e manutenção', aplicacao: 'Acionadores manuais, baterias, laços e sirenes.', status: 'PENDENTE' },
        ],
        'Central de alarme (SACI)': [
          { codigo: 'ABNT NBR 17240', titulo: 'Sistemas de detecção e alarme de incêndio', aplicacao: 'Central endereçável, zonas de alarme e interligação com elevadores e pressurização.', status: 'PENDENTE' },
        ],
        'SPDA (Sistema de Proteção contra Descargas Atmosféricas)': [
          { codigo: 'ABNT NBR 5419', titulo: 'Proteção contra descargas atmosféricas (Partes 1 a 4)', aplicacao: 'Continuidade das descidas, integridade das malhas de aterramento e captores.', status: 'PENDENTE' },
        ],
      },
    },

    'Transporte Vertical': {
      sistema: [],
      tipologias: {
        'Elevadores elétricos': [
          { codigo: 'ABNT NBR 16858', titulo: 'Elevadores — Requisitos de segurança para construção e instalação (Partes 1 e 2)', aplicacao: 'Cabos de tração, freios, contatos de porta, nivelamento e segurança.', status: 'PENDENTE' },
        ],
        'Elevadores hidráulicos': [
          { codigo: 'ABNT NBR 16858', titulo: 'Elevadores — Requisitos de segurança para construção e instalação', aplicacao: 'Pistão hidráulico, selos, operação e nivelamento.', status: 'PENDENTE' },
        ],
        'Escadas rolantes': [
          { codigo: 'ABNT NBR 16723-1', titulo: 'Escadas rolantes e esteiras rolantes — Parte 1: Requisitos de segurança', aplicacao: 'Rodapés, pentes, corrimãos e botão de parada de emergência.', status: 'PENDENTE' },
        ],
        'Plataformas de acessibilidade': [
          { codigo: 'ABNT NBR ISO 9386-1', titulo: 'Plataformas de elevação motorizadas para pessoas com mobilidade reduzida', aplicacao: 'Portas, sensores antiesmagamento e percurso de operação.', status: 'PENDENTE' },
        ],
        'Monta-cargas': [
          { codigo: 'ABNT NBR 14712', titulo: 'Elevadores de carga, monta-cargas e elevadores de maca', aplicacao: 'Cabina, portas de pavimento e limites de carga.', status: 'PENDENTE' },
        ],
      },
    },

    'Comunicação e Segurança Interna': {
      sistema: [
        { codigo: 'ABNT NBR 5410', titulo: 'Instalações elétricas de baixa tensão', aplicacao: 'Infraestrutura de cabeamento elétrico que suporta os sistemas de comunicação e segurança.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Cabeamento estruturado': [
          { codigo: 'ABNT NBR 14565', titulo: 'Cabeamento estruturado para edifícios comerciais e data centers', aplicacao: 'Racks, identificação de cabos e infraestrutura de rede predial.', status: 'PENDENTE' },
        ],
      },
    },

    'Paisagismo e Irrigação': {
      sistema: [
        { codigo: 'ABNT NBR 9575', titulo: 'Impermeabilização — Seleção e projeto', aplicacao: 'Estanqueidade de floreiras, espelhos d\'água e jardins verticais.', status: 'CONFIRMADO' },
      ],
      tipologias: {
        'Espelho d\'água': [
          { codigo: 'ABNT NBR 9575', titulo: 'Impermeabilização — Seleção e projeto', aplicacao: 'Estanqueidade do espelho d\'água e prevenção de infiltrações no entorno.', status: 'CONFIRMADO' },
        ],
      },
    },

  };

  // ── Método auxiliar: retorna normas aplicáveis aos sistemas de uma vistoria ──
  getNormasParaRTIPA(systemTitlesUsados: string[]): {
    transversais: NormaRef[];
    porSistema: { titulo: string; normasSistema: NormaRef[] }[];
  } {
    const porSistema = systemTitlesUsados
      .filter(t => this.normasPorSistema[t])
      .map(titulo => ({
        titulo,
        normasSistema: this.normasPorSistema[titulo].sistema,
      }))
      .filter(s => s.normasSistema.length > 0);
    return { transversais: this.normasTransversais, porSistema };
  }

  getNormasTipologia(systemTitle: string, tipologiaTitle: string): NormaRef[] {
    return this.normasPorSistema[systemTitle]?.tipologias?.[tipologiaTitle] ?? [];
  }

  getData(): any {
    return this.appData;
  }
}