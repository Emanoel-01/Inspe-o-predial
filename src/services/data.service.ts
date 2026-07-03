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
  "estrutura": {
    "title": "Estrutura & Envoltória",
    "systems": {
      "estruturais": {
        "title": "Sistemas Estruturais",
        "icon": "🏛️",
        "tipologias": [
          {
            "title": "Concreto armado in loco",
            "definicao": "Estrutura moldada no local da obra, combinando a resistência à compressão do concreto com a resistência à tração das barras de aço (armadura)."
          },
          {
            "title": "Concreto protendido",
            "definicao": "Técnica que induz tensões de compressão no concreto antes da aplicação das cargas de serviço, utilizando cabos de aço de alta resistência tracionados."
          },
          {
            "title": "Alvenaria estrutural",
            "definicao": "As paredes de blocos (cerâmicos ou de concreto) atuam como estrutura, suportando e distribuindo as cargas da edificação."
          },
          {
            "title": "Estrutura metálica",
            "definicao": "Esqueleto do edifício formado por perfis de aço laminado ou soldado, conectados por parafusos ou solda."
          },
          {
            "title": "Estrutura de madeira",
            "definicao": "Utiliza peças de madeira serrada ou laminada colada (MLC) para formar a estrutura principal."
          },
          {
            "title": "Steel frame",
            "definicao": "Estrutura formada por perfis leves de aço galvanizado que compõem painéis, vigas e treliças."
          },
          {
            "title": "Wood frame",
            "definicao": "Similar ao Steel Frame, mas utiliza perfis de madeira de reflorestamento tratada industrialmente."
          },
          {
            "title": "Painéis CLT (Cross Laminated Timber)",
            "definicao": "Painéis estruturais de madeira maciça formados por camadas de tábuas coladas em direções alternadas, criando um material de alta resistência."
          },
          {
            "title": "Painéis SIP (Structural Insulated Panel)",
            "definicao": "Painel sanduíche composto por duas placas estruturais (geralmente OSB) e um núcleo de isolante térmico (EPS ou PU)."
          },
          {
            "title": "Pré-moldados de concreto",
            "definicao": "Elementos estruturais (pilares, vigas, lajes) fabricados em indústria e transportados para montagem no canteiro."
          },
          {
            "title": "Sistema modular pré-fabricado",
            "definicao": "Construção de módulos tridimensionais completos (ex: um quarto de hotel, um banheiro) em fábrica, que são transportados e \"empilhados\" no local."
          },
          {
            "title": "Sistema estrutural híbrido",
            "definicao": "Combinação de dois ou mais sistemas estruturais para otimizar o desempenho e custo. Ex: núcleo de concreto com vigas e pilares metálicos."
          }
        ],
        "patologias": [
          {
            "title": "Corrosão de Armaduras",
            "sintomas": "Manchas de ferrugem, fissuras paralelas às armaduras, destacamento do concreto (spalling).",
            "causas": "Carbonatação do concreto, ataque de cloretos (maresia), umidade.",
            "typology_link": "Concreto armado in loco"
          },
          {
            "title": "Fissuração Excessiva",
            "sintomas": "Aberturas acentuadas em vigas e lajes.",
            "causas": "Sobrecarga, retração do concreto, recalques de fundação.",
            "typology_link": "Concreto armado in loco"
          },
          {
            "title": "Segregação do Concreto (\"Bicheiras\")",
            "sintomas": "Ninhos de agregados na superfície do concreto, aspecto poroso, baixa resistência local.",
            "causas": "Adensamento inadequado, concreto com pouca argamassa, lançamento de grande altura.",
            "typology_link": "Concreto armado in loco"
          },
          {
            "title": "Perda de Protensão",
            "sintomas": "Aumento de flechas e fissuras em vigas e lajes protendidas.",
            "causas": "Corrosão das cordoalhas, relaxação do aço, falha nas ancoragens.",
            "typology_link": "Concreto protendido"
          },
          {
            "title": "Fissuras em \"Escada\"",
            "sintomas": "Fissuras que seguem as juntas de argamassa entre os blocos.",
            "causas": "Recalque de fundação, sobrecargas não previstas.",
            "typology_link": "Alvenaria estrutural"
          },
          {
            "title": "Esmagamento de Blocos",
            "sintomas": "Ruptura e fragmentação de blocos, geralmente sob cargas concentradas.",
            "causas": "Sobrecarga, uso de blocos de baixa resistência, falta de distribuição de carga.",
            "typology_link": "Alvenaria estrutural"
          },
          {
            "title": "Corrosão em Estrutura Metálica",
            "sintomas": "Redução da seção dos perfis, bolhas na pintura, ferrugem.",
            "causas": "Falha na pintura protetora, umidade, ambiente agressivo.",
            "typology_link": "Estrutura metálica"
          },
          {
            "title": "Flambagem de Perfis",
            "sintomas": "Encurvadura lateral de perfis comprimidos (pilares, banzos de treliça).",
            "causas": "Subdimensionamento do perfil, falta de contraventamento adequado.",
            "typology_link": "Estrutura metálica"
          },
          {
            "title": "Apodrecimento e Ataque de Cupins",
            "sintomas": "Perda de seção, som oco, pó de madeira.",
            "causas": "Falha no tratamento da madeira, umidade excessiva.",
            "typology_link": "Estrutura de madeira"
          },
          {
            "title": "Corrosão de Perfis Leves",
            "sintomas": "Ferrugem nos perfis, principalmente na base (soleira).",
            "causas": "Infiltração de umidade pela base da parede.",
            "typology_link": "Steel frame"
          },
          {
            "title": "Delaminação de Painéis",
            "sintomas": "Separação das camadas de madeira do painel.",
            "causas": "Falha no adesivo, exposição prolongada à umidade.",
            "typology_link": "Painéis CLT (Cross Laminated Timber)"
          },
          {
            "title": "Descolamento das Placas",
            "sintomas": "Separação das placas de OSB do núcleo isolante.",
            "causas": "Falha no adesivo, umidade.",
            "typology_link": "Painéis SIP (Structural Insulated Panel)"
          },
          {
            "title": "Falha nas Ligações",
            "sintomas": "Fissuras nas juntas entre elementos, infiltração.",
            "causas": "Preenchimento inadequado com graute, falha na solda.",
            "typology_link": "Pré-moldados de concreto"
          },
          {
            "title": "Problemas nas Juntas dos Módulos",
            "sintomas": "Infiltração de água e ar entre os módulos.",
            "causas": "Falha no sistema de vedação das juntas.",
            "typology_link": "Sistema modular pré-fabricado"
          },
          {
            "title": "Incompatibilidade de Deformação",
            "sintomas": "Fissuras no ponto de encontro entre differentes materiais (ex: aço e concreto).",
            "causas": "Diferença no comportamento e dilatação dos materiais.",
            "typology_link": "Sistema estrutural híbrido"
          },
          {
            "title": "Empenamento e Trincas em Painéis",
            "sintomas": "Frestas nas junções das placas, descolamento de gesso, rangidos estruturais.",
            "causas": "Variação excessiva de umidade relativa do ar, falha na barreira de vapor ou secagem incompleta da madeira.",
            "typology_link": "Wood frame"
          }
        ]
      },
      "fundacoes": {
        "title": "Sistemas de Fundações",
        "icon": "🌱",
        "tipologias": [
          {
            "title": "Sapata isolada",
            "definicao": "Elemento de concreto de formato piramidal ou retangular que transmite a carga de um único pilar para o solo."
          },
          {
            "title": "Sapata corrida",
            "definicao": "Elemento contínuo de concreto armado que percorre o comprimento das paredes, distribuindo a carga linearmente."
          },
          {
            "title": "Viga baldrame",
            "definicao": "Viga de concreto armado que interliga as sapatas ou blocos de fundação, distribuindo cargas e travando a estrutura."
          },
          {
            "title": "Radier",
            "definicao": "Laje de concreto armado que abrange toda a área da construção, distribuindo a carga uniformemente sobre o solo."
          },
          {
            "title": "Estaca hélice contínua",
            "definicao": "Estaca de concreto moldada in loco, executada por perfuração do solo com um trado helicoidal contínuo e injeção de concreto simultânea à retirada do trado."
          },
          {
            "title": "Estaca Strauss",
            "definicao": "Estaca de concreto moldada in loco, executada por perfuração com sonda (piteira) e posterior concretagem e apiloamento."
          },
          {
            "title": "Estaca pré-moldada",
            "definicao": "Estaca de concreto (ou aço, madeira) fabricada industrialmente e cravada no terreno por percussão (bate-estacas) ou prensagem."
          },
          {
            "title": "Estaca metálica",
            "definicao": "Perfis de aço (trilhos, perfis I ou H) cravados no terreno."
          },
          {
            "title": "Tubulão",
            "definicao": "Fundação profunda de grande diâmetro, escavada manual ou mecanicamente, que pode ter sua base alargada. Geralmente exige a descida de um operário para inspeção ou alargamento."
          },
          {
            "title": "Microestaca",
            "definicao": "Estaca de pequeno diâmetro, moldada in loco, com armadura tubular (tubo de aço) e injeção de calda de cimento sob pressão."
          }
        ],
        "patologias": [
          {
            "title": "Recalque Diferencial",
            "sintomas": "Trincas inclinadas (45º) nas paredes, dificuldade para abrir portas e janelas, pisos e lajes trincados.",
            "causas": "Capacidade de carga do solo heterogêa, fundação mal dimensionada, vazamentos de água no solo.",
            "typology_link": "Sapata isolada"
          },
          {
            "title": "Giro da Sapata",
            "sintomas": "Trincas verticais na base do pilar, desaprumo do pilar.",
            "causas": "Carga excêntrica no pilar não prevista em projeto.",
            "typology_link": "Sapata isolada"
          },
          {
            "title": "Corrosão de Armaduras em Baldrames",
            "sintomas": "Manchas de umidade na base das paredes (rodapé), esfarelamento do reboco, estufamento da pintura.",
            "causas": "Falha na impermeabilização da viga baldrame.",
            "typology_link": "Viga baldrame"
          },
          {
            "title": "Fissuras e Infiltrações no Radier",
            "sintomas": "Trincas no piso, umidade ascendendo pelas paredes.",
            "causas": "Má compactação do subleito, falta de impermeabilização sob o radier.",
            "typology_link": "Radier"
          },
          {
            "title": "Puncionamento da Laje (Radier)",
            "sintomas": "Afundamento do piso ao redor de um pilar, fissuras circulares em torno do pilar.",
            "causas": "Carga excessiva do pilar, espessura insuficiente do radier, falta de armadura de punção.",
            "typology_link": "Radier"
          },
          {
            "title": "Falha na Execução da Estaca",
            "sintomas": "Recalque da estrutura.",
            "causas": "Concretagem interrompida, contaminação do concreto com solo, posicionamento incorreto da armadura.",
            "typology_link": "Estaca hélice contínua"
          },
          {
            "title": "Estrangulamento do Fuste",
            "sintomas": "Redução da seção da estaca em um ponto específico, levando a recalques.",
            "causas": "Solo muito mole que \"aperta\" o concreto fresco durante a retirada do trado.",
            "typology_link": "Estaca hélice contínua"
          },
          {
            "title": "Rompimento da Estaca durante Cravação",
            "sintomas": "Perda súbita de nega (resistência à cravação), recalque da estrutura.",
            "causas": "Existência de matacões no subsolo, energia de cravação excessiva.",
            "typology_link": "Estaca pré-moldada"
          },
          {
            "title": "Corrosão Acentuada de Perfis",
            "sintomas": "Redução da vida útil da fundação, recalques.",
            "causas": "Solo muito agressivo (quimicamente), falta de proteção catódica ou pintura especial.",
            "typology_link": "Estaca metálica"
          },
          {
            "title": "Problemas de Escavação",
            "sintomas": "Desmoronamento do fuste durante a escavação, contaminação do concreto.",
            "causas": "Presença de água, solo arenoso e pouco coesivo.",
            "typology_link": "Tubulão"
          },
          {
            "title": "Trincas e Fissuras Lineares na Alvenaria de Fundação",
            "sintomas": "Fissuras horizontais ou diagonais contínuas próximo ao rodapé das paredes.",
            "causas": "Recalque pontual do solo sob a sapata, sobrecarga distribuída desigual ou ausência de viga de cintamento superior.",
            "typology_link": "Sapata corrida"
          },
          {
            "title": "Deficiência de Seção por Contaminação com Solo",
            "sintomas": "Recalque acentuado no pilar correspondente após aplicação das cargas estruturais.",
            "causas": "Desmoronamento das paredes do furo durante a retirada da camisa e concretagem, reduzindo a seção efetiva da estaca.",
            "typology_link": "Estaca Strauss"
          },
          {
            "title": "Falha de Aderência Fuste-Solo por Pressão de Injeção Inadequada",
            "sintomas": "Deslocamento vertical (recalque) lento e contínuo sob cargas de serviço de reforço.",
            "causas": "Pressão de injeção da calda de cimento inferior à especificada ou lavagem da calda por fluxo d'água subterrâneo ativo.",
            "typology_link": "Microestaca"
          }
        ]
      },
      "vedacoes": {
        "title": "Sistemas de Vedação e Revestimento Externo",
        "icon": "🖼️",
        "tipologias": [
          {
            "title": "Alvenaria de vedação",
            "definicao": "Paredes de blocos ou tijolos cerâmicos/de concreto que servem para fechar os vãos da estrutura."
          },
          {
            "title": "Painéis de concreto",
            "definicao": "Placas de concreto (pré-moldadas ou moldadas no local) usadas como fechamento de fachada."
          },
          {
            "title": "Drywall externo (Sistema EIFS)",
            "definicao": "Sistema composto por placas cimentícias ou gesso específico para uso externo, barreira de umidade, isolante térmico (EPS) e um revestimento final (base coat e finish coat)."
          },
          {
            "title": "Painéis leves",
            "definicao": "Painéis do tipo sanduíche ou de fibrocimento utilizados para fechamentos rápidos."
          },
          {
            "title": "Fachada ventilada",
            "definicao": "Sistema de revestimento que deixa uma câmara de ar entre a placa de acabamento e a parede de vedação, melhorando o desempenho térmico."
          },
          {
            "title": "ACM (Aluminum Composite Material)",
            "definicao": "Painel composto por duas lâminas de alumínio com um núcleo de polietileno. Frequentemente usado em fachadas ventiladas."
          },
          {
            "title": "Pastilhas",
            "definicao": "Pequenas peças cerâmicas ou de vidro assentadas com argamassa colante."
          },
          {
            "title": "Revestimento cimentício",
            "definicao": "Placas ou argamassas que imitam texturas como madeira, pedra ou concreto aparente."
          },
          {
            "title": "Revestimento cerâmico externo",
            "definicao": "Placas cerâmicas de alta resistência e baixa absorção assentadas com argamassa colante."
          },
          {
            "title": "Argamassa (reboco / monocapa)",
            "definicao": "Revestimento à base de cimento, cal e areia (reboco) ou industrializado que realiza as funções de base e acabamento em uma só camada (monocapa)."
          },
          {
            "title": "Pintura acrílica ou elastomérica",
            "definicao": "Acabamento final em forma de película. A pintura elastomérica possui alta elasticidade, capaz de acompanhar a movimentação do substrato."
          }
        ],
        "patologias": [
          {
            "title": "Fissuras na Alvenaria",
            "sintomas": "Trincas nas paredes.",
            "causas": "Movimentação da estrutura, retração da argamassa.",
            "typology_link": "Alvenaria de vedação"
          },
          {
            "title": "Infiltração em Juntas de Painéis",
            "sintomas": "Manchas de umidade no interior.",
            "causas": "Falha do selante das juntas.",
            "typology_link": "Painéis de concreto"
          },
          {
            "title": "Infiltração no Sistema EIFS",
            "sintomas": "Bolhas, manchas, descolamento do revestimento.",
            "causas": "Falha na vedação de janelas ou juntas, perfuração da barreira de umidade.",
            "typology_link": "Drywall externo (Sistema EIFS)"
          },
          {
            "title": "Desplacamento Cerâmico / Pastilhas",
            "sintomas": "Som oco à percussão, queda de placas.",
            "causas": "Uso de argamassa inadequada, falha na aplicação, infiltração pelo rejunte.",
            "typology_link": "Revestimento cerâmico externo"
          },
          {
            "title": "Eflorescência",
            "sintomas": "Manchas esbranquiçadas na superfície do revestimento (rejunte, tijolo, concreto).",
            "causas": "Sais solúveis presentes nos materiais que são transportados pela água para a superfície.",
            "typology_link": "Revestimento cerâmico externo"
          },
          {
            "title": "Manchas e Desbotamento",
            "sintomas": "Alteração da cor original da fachada.",
            "causas": "Ação de raios UV, poluição, crescimento de fungos.",
            "typology_link": "Pintura acrílica ou elastomérica"
          },
          {
            "title": "Saponificação",
            "sintomas": "Manchas escuras e pegajosas na pintura, com descascamento.",
            "causas": "Umidade alcalina vinda da base (reboco novo) que ataca a resina da tinta.",
            "typology_link": "Pintura acrílica ou elastomérica"
          },
          {
            "title": "Fissuras e Descolamento de Reboco",
            "sintomas": "Trincas, som oco, queda de placas de reboco.",
            "causas": "Falta de aderência, espessura excessiva.",
            "typology_link": "Argamassa (reboco / monocapa)"
          },
          {
            "title": "Corrosão das Ancoragens",
            "sintomas": "Manchas de ferrugem escorrendo das fixações, placas soltas.",
            "causas": "Infiltração de água na câmara de ar.",
            "typology_link": "Fachada ventilada"
          },
          {
            "title": "Deformação Térmica e Frestas nas Juntas",
            "sintomas": "Abertura nas emendas dos painéis, infiltração de água e ar, desalinhamento visual.",
            "causas": "Dilatação e contração térmica diferencial acumulada, fixação mecânica insuficiente ou selante de junta rígido demais.",
            "typology_link": "Painéis leves"
          },
          {
            "title": "Descolamento das Lâminas de Alumínio (Delaminação)",
            "sintomas": "Presença de bolhas de ar sob a lâmina externa, ondulações na superfície do painel.",
            "causas": "Uso de material com núcleo de polietileno de baixa qualidade, intemperismo severo ou impacto mecânico localizado.",
            "typology_link": "ACM (Aluminum Composite Material)"
          },
          {
            "title": "Desplacamento de Pastilhas",
            "sintomas": "Som oco ao teste de percussão, queda de peças ou de placas inteiras de pastilhas.",
            "causas": "Falha na ancoragem da argamassa colante, falta de juntas de movimentação adequadas ou infiltração de água pelo rejunte danificado.",
            "typology_link": "Pastilhas"
          },
          {
            "title": "Fissuração e Eflorescência em Placas Cimentícias",
            "sintomas": "Fissuras superficiais em teia de aranha, manchas esbranquiçadas e perda de brilho.",
            "causas": "Retração hidráulica da placa, ausência de impermeabilização ou hidrofugação adequada antes da exposição às intempéries.",
            "typology_link": "Revestimento cimentício"
          }
        ]
      },
      "coberturas": {
        "title": "Sistemas de Cobertura",
        "icon": "🏠",
        "tipologias": [
          {
            "title": "Telhado cerâmico",
            "definicao": "Cobertura inclinada com telhas de argila queimada, sobrepostas em uma estrutura de suporte."
          },
          {
            "title": "Telhado de concreto",
            "definicao": "Similar ao cerâmico, mas utiliza telhas de concreto, geralmente mais pesadas e com encaixes precisos."
          },
          {
            "title": "Telhado metálico",
            "definicao": "Cobertura com telhas de aço galvanizado ou galvalume. Podem ser simples ou do tipo sanduíche com isolante termoacústico."
          },
          {
            "title": "Telhado fibrocimento",
            "definicao": "Cobertura com telhas onduladas de cimento reforçado com fibras sintéticas (CRFS)."
          },
          {
            "title": "Telhado verde",
            "definicao": "Sistema de cobertura que inclui camadas de substrato e vegetação sobre uma laje impermeabilizada."
          },
          {
            "title": "Cobertura plana (laje impermeabilizada)",
            "definicao": "Laje de concreto utilizada como cobertura, protegida por um sistema de impermeabilização e proteção mecânica."
          },
          {
            "title": "Cobertura invertida",
            "definicao": "Tipo de cobertura plana onde o isolamento térmico é colocado ACIMA da impermeabilização, protegendo-a."
          },
          {
            "title": "Cobertura translúcida",
            "definicao": "Cobertura que permite a passagem de luz natural, utilizando materiais como policarbonato ou vidro laminado."
          },
          {
            "title": "Cobertura tensionada",
            "definicao": "Estrutura leve tracionada, composta por membranas (lonas) e cabos de aço, sustentada por mastros."
          }
        ],
        "patologias": [
          {
            "title": "Quebra e Deslocamento de Telhas",
            "sintomas": "Goteiras, infiltração no forro.",
            "causas": "Trânsito de pessoas, ventos fortes, granizo, má fixação.",
            "typology_link": "Telhado cerâmico"
          },
          {
            "title": "Entupimento de Calhas e Rufos",
            "sintomas": "Transbordamento de água pelas calhas, umidade nas paredes sob a cobertura.",
            "causas": "Acúmulo de folhas, poeira, detritos.",
            "typology_link": "Telhado cerâmico"
          },
          {
            "title": "Corrosão de Fixadores",
            "sintomas": "Pontos de ferrugem nas telhas, goteiras nos pontos de fixação.",
            "causas": "Vedação do parafuso ressecada ou danificada, parafuso inadequado.",
            "typology_link": "Telhado metálico"
          },
          {
            "title": "Dano por Sucção do Vento (Uplift)",
            "sintomas": "Telhas metálicas levantadas ou arrancadas após ventanias.",
            "causas": "Fixação insuficiente ou inadequada para a carga de vento local.",
            "typology_link": "Telhado metálico"
          },
          {
            "title": "Falha na Impermeabilização da Laje",
            "sintomas": "Infiltração, goteiras, manchas e bolor no teto do último pavimento.",
            "causas": "Fim da vida útil da manta, falha na execução, perfuração acidental.",
            "typology_link": "Cobertura plana (laje impermeabilizada)"
          },
          {
            "title": "Empoçamento Crônico de Água",
            "sintomas": "Formação de poças d'água que não secam após 48h.",
            "causas": "Caimento inadequado da laje, obstrução de ralos.",
            "typology_link": "Cobertura plana (laje impermeabilizada)"
          },
          {
            "title": "Obstrução do Sistema de Drenagem",
            "sintomas": "Morte da vegetação, empoçamento de água, sobrecarga na estrutura.",
            "causas": "Ralos e camada drenante entupidos com raízes ou substrato.",
            "typology_link": "Telhado verde"
          },
          {
            "title": "Rasgos ou Furos na Membrana",
            "sintomas": "Goteiras, perda de tensão.",
            "causas": "Vandalismo, queda de objetos pontiagudos, abrasão.",
            "typology_link": "Cobertura tensionada"
          },
          {
            "title": "Infiltração nas Juntas do Policarbonato",
            "sintomas": "Gotejamento, manchas nas placas.",
            "causas": "Ressecamento das borrachas de vedação, dilatação térmica excessiva.",
            "typology_link": "Cobertura translúcida"
          }
        ]
      },
      "impermeabilizacao": {
        "title": "Sistemas de Impermeabilização",
        "icon": "💧",
        "tipologias": [
          {
            "title": "Manta asfáltica",
            "definicao": "Sistema pré-fabricado, composto por asfalto modificado e estruturante (poliéster ou fibra de vidro), aplicado com maçarico ou a frio."
          },
          {
            "title": "Manta líquida (PU, acrílica)",
            "definicao": "Membrana flexível aplicada na forma líquida, que cura no local. O PU (poliuretano) é mais resistente e pode ficar exposto. O acrílico é mais simples de aplicar."
          },
          {
            "title": "Membrana EPDM / PVC",
            "definicao": "Mantas sintéticas de borracha (EPDM) ou plástico (PVC), geralmente aplicadas soltas ou com fixação mecânica nas bordas."
          },
          {
            "title": "Cristalização capilar",
            "definicao": "Argamassa ou pintura cimentícia que reage com a umidade do concreto, formando cristais que bloqueiam os poros e impedem a passagem de água."
          },
          {
            "title": "Emulsão asfáltica",
            "definicao": "Pintura asfáltica à base de água, aplicada a frio, que forma uma membrana protetora."
          },
          {
            "title": "Tinta impermeabilizante",
            "definicao": "Tinta acrílica com aditivos impermeabilizantes, que forma uma película flexível sobre a superfície."
          },
          {
            "title": "Aditivos hidrofugantes",
            "definicao": "Produtos adicionados à argamassa ou concreto que repelem a água, mas não vedam os poros (não são impermeabilizantes, mas reduzem a absorção)."
          }
        ],
        "patologias": [
          {
            "title": "Furo ou Rasgo na Manta",
            "sintomas": "Infiltração pontual.",
            "causas": "Instalação de antenas, queda de objetos, tráfego de pessoas sem proteção adequada.",
            "typology_link": "Manta asfáltica"
          },
          {
            "title": "Falha nas Emendas",
            "sintomas": "Infiltração linear.",
            "causas": "Má execução da solda da manta (superaquecimento ou falta de aquecimento).",
            "typology_link": "Manta asfáltica"
          },
          {
            "title": "Formação de Bolhas (Blistering)",
            "sintomas": "Bolhas na superfície da manta.",
            "causas": "Umidade aprisionada sob a manta durante a aplicação.",
            "typology_link": "Manta asfáltica"
          },
          {
            "title": "Espessura Insuficiente",
            "sintomas": "Infiltração difusa, desgaste prematuro.",
            "causas": "Aplicação de poucas demãos, economia de material.",
            "typology_link": "Manta líquida (PU, acrílica)"
          },
          {
            "title": "Descolamento da Membrana",
            "sintomas": "Bolhas, infiltração generalizada.",
            "causas": "Superfície da base estava suja, úmida ou sem primer.",
            "typology_link": "Manta líquida (PU, acrílica)"
          },
          {
            "title": "Furo na Membrana",
            "sintomas": "Vazamento em reservatórios, infiltração.",
            "causas": "Perfuração acidental durante a instalação ou uso.",
            "typology_link": "Membrana EPDM / PVC"
          },
          {
            "title": "Falha por Fissura Ativa",
            "sintomas": "Infiltração mesmo com o produto aplicado.",
            "causas": "O sistema não suporta a movimentação da fissura no concreto. O produto só veda poros.",
            "typology_link": "Cristalização capilar"
          },
          {
            "title": "Degradação por Raios UV",
            "sintomas": "Ressecamento e fissuração da membrana.",
            "causas": "Produto deixado exposto ao sol sem proteção mecânica.",
            "typology_link": "Emulsão asfáltica"
          },
          {
            "title": "Descamação e Enrugamento da Película",
            "sintomas": "Desprendimento da tinta em forma de folhas ou placas, bolhas e perda de aderência.",
            "causas": "Aplicação sobre substrato úmido, pulverulento ou com alcalinidade elevada sem primer adequado.",
            "typology_link": "Tinta impermeabilizante"
          },
          {
            "title": "Perda da Hidrofobicidade Superficial",
            "sintomas": "Absorção rápida de água pela argamassa (escurecimento imediato ao molhar), infiltração de umidade interna.",
            "causas": "Lixiviação natural do aditivo pela ação contínua da chuva e radiação UV ao longo do tempo.",
            "typology_link": "Aditivos hidrofugantes"
          }
        ]
      }
    }
  },
  "instalacoes": {
    "title": "Instalações Prediais",
    "systems": {
      "hidrossanitarios": {
        "title": "Sistemas Hidrossanitários",
        "icon": "🚿",
        "tipologias": [
          {
            "title": "Água fria (PVC, PPR, PEX, cobre)",
            "definicao": "Distribuição de água potável da rede pública ou reservatório para os pontos de consumo."
          },
          {
            "title": "Água quente (CPVC, PEX, cobre)",
            "definicao": "Distribuição de água aquecida para chuveiros e torneiras."
          },
          {
            "title": "Esgoto (PVC, PEAD)",
            "definicao": "Coleta e transporte dos efluentes de banheiros, cozinhas e áreas de serviço para a rede pública ou estação de tratamento."
          },
          {
            "title": "Água pluvial",
            "definicao": "Coleta e transporte da água da chuva de telhados, lajes e pisos para a rede pública ou sistema de reuso."
          },
          {
            "title": "Reuso de água cinza",
            "definicao": "Sistema que coleta a água de chuveiros e lavatórios, a trata e a reutiliza para fins não potáveis, como descargas e irrigação."
          },
          {
            "title": "Aproveitamento de água da chuva",
            "definicao": "Sistema que capta, filtra e armazena a água da chuva para uso em fins não potáveis."
          },
          {
            "title": "Sistema de aquecimento (solar, gás, elétrico)",
            "definicao": "Equipamentos que aquecem a água para consumo."
          }
        ],
        "patologias": [
          {
            "title": "Vazamentos em Conexões",
            "sintomas": "Manchas de umidade, gotejamentos, mofo, queda na pressão.",
            "causas": "Falha na execução da junta (pouca cola, rosca mal vedada), movimentação da tubulação.",
            "typology_link": "Água fria (PVC, PPR, PEX, cobre)"
          },
          {
            "title": "Baixa Pressão nos Pontos de Consumo",
            "sintomas": "Fluxo de água fraco em torneiras e chuveiros.",
            "causas": "Subdimensionamento da tubulação, vazamentos na rede, registros parcialmente fechados, problema na VRP.",
            "typology_link": "Água fria (PVC, PPR, PEX, cobre)"
          },
          {
            "title": "Ruído (Golpe de Aríete)",
            "sintomas": "Forte barulho na tubulação ao fechar uma torneira ou válvula.",
            "causas": "Fechamento rápido de válvulas, alta pressão na rede.",
            "typology_link": "Água quente (CPVC, PEX, cobre)"
          },
          {
            "title": "Entupimentos e Mau Cheiro",
            "sintomas": "Escoamento lento, refluxo, odor de esgoto.",
            "causas": "Descarte inadequado de resíduos, falta de ventilação na rede de esgoto.",
            "typology_link": "Esgoto (PVC, PEAD)"
          },
          {
            "title": "Retorno de Espuma pelos Ralos",
            "sintomas": "Espuma de sabão retorna pelo ralo do piso, especialmente em andares baixos.",
            "causas": "Excesso de sabão em pó na máquina de lavar, falta de ventilação adequada na prumada de esgoto.",
            "typology_link": "Esgoto (PVC, PEAD)"
          },
          {
            "title": "Transbordamento de Calhas",
            "sintomas": "Água escorrendo pelas paredes externas.",
            "causas": "Obstrução por folhas e detritos, subdimensionamento.",
            "typology_link": "Água pluvial"
          },
          {
            "title": "Contaminação da Água de Reuso",
            "sintomas": "Água com cor, odor ou turbidez.",
            "causas": "Falha no sistema de tratamento, falta de limpeza dos filtros.",
            "typology_link": "Reuso de água cinza"
          },
          {
            "title": "Baixo Desempenho do Aquecedor Solar",
            "sintomas": "Água não aquece o suficiente.",
            "causas": "Placas coletoras sujas, sombreamento, ar na tubulação.",
            "typology_link": "Sistema de aquecimento (solar, gás, elétrico)"
          },
          {
            "title": "Entupimento de Filtros e Proliferação de Vetores na Cisterna",
            "sintomas": "Água turva ou com odor desagradável, interrupção no fluxo de captação.",
            "causas": "Acúmulo de folhas, galhos e fezes de pássaros devido à falta de descarte das primeiras chuvas (first flush) ou limpeza dos filtros.",
            "typology_link": "Aproveitamento de água da chuva"
          }
        ]
      },
      "gasCombustivel": {
        "title": "Sistema de Gás Combustível",
        "icon": "🔥",
        "tipologias": [
          {
            "title": "GLP - Gás Liquefeito de Petróleo",
            "definicao": "Sistema que utiliza gás armazenado em estado líquido sob pressão em cilindros ou centrais estacionárias. É mais denso que o ar."
          },
          {
            "title": "GN - Gás Natural",
            "definicao": "Sistema abastecido continuamente por uma rede de distribuição urbana. O gás é mais leve que o ar."
          },
          {
            "title": "Tubulação de Aço-Carbono",
            "definicao": "Tubulação robusta, geralmente pintada de amarelo, utilizada em redes externas e prumadas."
          },
          {
            "title": "Tubulação de Cobre",
            "definicao": "Tubulação de alta durabilidade e resistência à corrosão, utilizada em redes internas e pontos de consumo."
          },
          {
            "title": "Tubulação PEX Multicamadas",
            "definicao": "Tubo flexível composto por camadas de polietileno, alumínio e polietileno. É uma solução moderna e segura."
          }
        ],
        "patologias": [
          {
            "title": "Vazamento em Conexões Roscadas",
            "sintomas": "Cheiro de gás, teste de estanqueidade reprovado, conta de gás elevada.",
            "causas": "Vedação insuficiente ou ressecada (fita veda-rosca), aperto excessivo ou insuficiente da conexão.",
            "typology_link": "Tubulação de Aço-Carbono"
          },
          {
            "title": "Corrosão Externa da Tubulação",
            "sintomas": "Pontos de ferrugem, bolhas na pintura, redução da espessura da parede do tubo.",
            "causas": "Falha ou ausência de pintura de proteção, contato com umidade ou outros materiais.",
            "typology_link": "Tubulação de Aço-Carbono"
          },
          {
            "title": "Corrosão Galvânica",
            "sintomas": "Corrosão acelerada na junção de tubos de aço com conexões de outros metais (ex: latão).",
            "causas": "Contato direto entre metais diferentes em ambiente úmido, criando uma pilha galvânica.",
            "typology_link": "Tubulação de Aço-Carbono"
          },
          {
            "title": "Falha na Solda (Brasagem)",
            "sintomas": "Vazamento na junta soldada, visível com teste de espuma (bolhas).",
            "causas": "Execução inadequada da solda, superaquecimento ou falta de aquecimento, contaminação da superfície.",
            "typology_link": "Tubulação de Cobre"
          },
          {
            "title": "Amassamento ou Deformação do Tubo",
            "sintomas": "Redução do fluxo de gás, ponto de fragilidade na tubulação.",
            "causas": "Impacto acidental durante a obra ou uso, curvatura com raio inadequado.",
            "typology_link": "Tubulação de Cobre"
          },
          {
            "title": "Prensagem Incorreta da Conexão",
            "sintomas": "Vazamento na junta, anel de vedação (o-ring) danificado.",
            "causas": "Uso de ferramenta inadequada, posicionamento incorreto da ferramenta, falta de limpeza na ponta do tubo.",
            "typology_link": "Tubulação PEX Multicamadas"
          },
          {
            "title": "Dano por Raios UV",
            "sintomas": "Ressecamento e fragilização da camada externa de polietileno do tubo.",
            "causas": "Exposição direta e prolongada ao sol sem proteção adequada (calhas, eletrodutos).",
            "typology_link": "Tubulação PEX Multicamadas"
          },
          {
            "title": "Regulador de Pressão Descalibrado ou Travado",
            "sintomas": "Chama do fogão muito alta ou muito baixa, aquecedor não liga ou desliga sozinho.",
            "causas": "Fim da vida útil, entrada de impurezas, desgaste de componentes internos (diafragma).",
            "typology_link": "GLP - Gás Liquefeito de Petróleo"
          },
          {
            "title": "Válvula de Bloqueio Emperrada",
            "sintomas": "Impossibilidade de abrir ou fechar a válvula de gás.",
            "causas": "Falta de uso, corrosão interna, acúmulo de sujeira.",
            "typology_link": "GLP - Gás Liquefeito de Petróleo"
          },
          {
            "title": "Medidor de Gás Inoperante ou Impreciso",
            "sintomas": "Consumo registrado não condiz com a realidade (muito alto ou zerado).",
            "causas": "Desgaste mecânico, obstrução por impurezas, fraude.",
            "typology_link": "GN - Gás Natural"
          },
          {
            "title": "Obstrução de Bicos de Equipamentos",
            "sintomas": "Chama amarelada e fuliginosa, equipamento não funciona corretamente.",
            "causas": "Impurezas na rede de gás que obstruem os injetores dos equipamentos.",
            "typology_link": "GN - Gás Natural"
          },
          {
            "title": "Ventilação da Central de Gás Obstruída",
            "sintomas": "Acúmulo de gás em caso de vazamento, risco elevado de explosão.",
            "causas": "Armazenamento de objetos, fechamento das aberturas de ventilação.",
            "typology_link": "GLP - Gás Liquefeito de Petróleo"
          },
          {
            "title": "Mangueira de Ligação Vencida ou Danificada",
            "sintomas": "Cheiro de gás próximo ao equipamento, ressecamento ou trincas na mangueira.",
            "causas": "Fim da vida útil (validade impressa na mangueira), contato com produtos de limpeza, dobra excessiva.",
            "typology_link": "GN - Gás Natural"
          }
        ]
      },
      "eletricos": {
        "title": "Sistemas Elétricos",
        "icon": "⚡",
        "tipologias": [
          {
            "title": "Quadros elétricos",
            "definicao": "Centro de distribuição de energia de uma edificação, onde ficam os disjuntores e outros dispositivos de proteção."
          },
          {
            "title": "Fios e cabos (cobre, alumínio)",
            "definicao": "Condutores que levam a energia elétrica dos quadros aos pontos de uso."
          },
          {
            "title": "Barramento blindado (Busway)",
            "definicao": "Sistema de distribuição de energia com barras de cobre ou alumínio isoladas dentro de um invólucro metálico, substituindo cabos de grande bitola."
          },
          {
            "title": "Iluminação LED",
            "definicao": "Sistema de iluminação que utiliza diodos emissores de luz (LED) como fonte luminosa."
          },
          {
            "title": "DALI / KNX / IoT (Automação)",
            "definicao": "Protocolos de comunicação que permitem o controle inteligente e integrado de sistemas como iluminação, persianas e climatização."
          },
          {
            "title": "Energia fotovoltaica",
            "definicao": "Sistema que converte a luz do sol diretamente em energia elétrica através de painéis fotovoltaicos."
          },
          {
            "title": "Grupo gerador",
            "definicao": "Equipamento composto por um motor a combustão (geralmente diesel) acoplado a um gerador elétrico, para fornecer energia em caso de falha da rede."
          }
        ],
        "patologias": [
          {
            "title": "Sobreaquecimento de Disjuntores",
            "sintomas": "Cheiro de queimado, disjuntor quente ao toque, desarme sem motivo aparente.",
            "causas": "Conexão frouxa (mau contato), disjuntor subdimensionado para a carga.",
            "typology_link": "Quadros elétricos"
          },
          {
            "title": "Oxidação de Barramentos",
            "sintomas": "Formação de camada esverdeada (zinabre) ou esbranquiçada nos barramentos do quadro.",
            "causas": "Umidade no ambiente, presença de agentes corrosivos.",
            "typology_link": "Quadros elétricos"
          },
          {
            "title": "Fuga de Corrente (Choque)",
            "sintomas": "Desarme do dispositivo DR, pequenos choques ao tocar em equipamentos.",
            "causas": "Isolação de fios ou equipamentos danificada.",
            "typology_link": "Fios e cabos (cobre, alumínio)"
          },
          {
            "title": "Ressecamento da Isolação",
            "sintomas": "Isolação plástica dos cabos torna-se quebradiça e trinca com facilidade.",
            "causas": "Envelhecimento natural do material, exposição a altas temperaturas.",
            "typology_link": "Fios e cabos (cobre, alumínio)"
          },
          {
            "title": "Sobreaquecimento nas Juntas",
            "sintomas": "Ponto quente detectado por termografia no barramento.",
            "causas": "Parafusos de conexão frouxos, oxidação das superfícies de contato.",
            "typology_link": "Barramento blindado (Busway)"
          },
          {
            "title": "Flicker (Cintilação) de Lâmpadas",
            "sintomas": "Variação rápida e perceptível no brilho das lâmpadas.",
            "causas": "Driver de má qualidade, flutuação de tensão na rede.",
            "typology_link": "Iluminação LED"
          },
          {
            "title": "Perda de Comunicação de Dispositivos",
            "sintomas": "Comandos de automação não funcionam, dispositivos offline.",
            "causas": "Falha no barramento de comunicação, endereço de dispositivo incorreto.",
            "typology_link": "DALI / KNX / IoT (Automação)"
          },
          {
            "title": "Hotspots em Painéis Fotovoltaicos",
            "sintomas": "Ponto específico do painel muito mais quente que o resto (visível em termografia).",
            "causas": "Célula defeituosa, sombreamento parcial, sujeira.",
            "typology_link": "Energia fotovoltaica"
          },
          {
            "title": "Falha na Partida do Gerador",
            "sintomas": "Gerador não liga durante uma queda de energia.",
            "causas": "Bateria descarregada, falta de combustível, obstrução de filtros.",
            "typology_link": "Grupo gerador"
          }
        ]
      },
      "climatizacao": {
        "title": "Climatização e Exaustão",
        "icon": "💨",
        "tipologias": [
          {
            "title": "Ar-condicionado Split",
            "definicao": "Sistema com uma unidade interna (evaporadora) e uma externa (condensadora), conectado por tubulação de cobre."
          },
          {
            "title": "Multi Split",
            "definicao": "Sistema similar ao Split, mas uma única unidade externa pode ser conectada a múltiplas unidades internas."
          },
          {
            "title": "VRF/VRV (Fluxo de Refrigerante Variável)",
            "definicao": "Sistema de expansão direta de alta eficiência, onde uma única condensadora externa pode climatizar dezenas de ambientes com controle individual."
          },
          {
            "title": "Chiller (Água Gelada)",
            "definicao": "Sistema de expansão indireta que resfria água em uma central (Chiller) e a bombeia para climatizar os ambientes através de fan-coils."
          },
          {
            "title": "Ventilação mecânica",
            "definicao": "Sistema que utiliza ventiladores para insuflar ar externo ou exaurir ar interno, garantindo a renovação do ar."
          },
          {
            "title": "Pressurização de escadas",
            "definicao": "Sistema de segurança que insufla ar nas escadas de emergência, criando uma pressão positiva que impede a entrada de fumaça em caso de incêndio."
          },
          {
            "title": "Exaustores em garagem e cozinha",
            "definicao": "Sistemas que removem gases tóxicos (CO em garagens) ou ar quente e gorduroso (cozinhas)."
          }
        ],
        "patologias": [
          {
            "title": "Congelamento da Evaporadora",
            "sintomas": "Formação de gelo na unidade interna, gotejamento de água.",
            "causas": "Filtros de ar sujos, baixa carga de fluido refrigerante, problema no ventilador.",
            "typology_link": "Ar-condicionado Split"
          },
          {
            "title": "Dreno da Condensadora Entupido",
            "sintomas": "Vazamento de água pela unidade interna (evaporadora).",
            "causas": "Acúmulo de sujeira, lodo e fungos na bandeja e na mangueira de dreno.",
            "typology_link": "Ar-condicionado Split"
          },
          {
            "title": "Vazamento de Fluido Refrigerante",
            "sintomas": "Equipamento não gela, compressor funciona sem parar.",
            "causas": "Trincas na tubulação, conexões mal apertadas (flanges).",
            "typology_link": "Multi Split"
          },
          {
            "title": "Falha de Comunicação",
            "sintomas": "Erro no controle central, unidades internas não respondem.",
            "causas": "Problema no cabo de comunicação entre as unidades, endereçamento incorreto.",
            "typology_link": "VRF/VRV (Fluxo de Refrigerante Variável)"
          },
          {
            "title": "Baixo Desempenho do Chiller",
            "sintomas": "Água não atinge a temperatura desejada, alto consumo de energia.",
            "causas": "Trocadores de calor sujos (incrustação), vazamento de fluido refrigerante.",
            "typology_link": "Chiller (Água Gelada)"
          },
          {
            "title": "Contaminação na Torre de Resfriamento",
            "sintomas": "Presença de algas, lodo e risco de proliferação de bactérias (Legionella).",
            "causas": "Falta de tratamento químico adequado da água.",
            "typology_link": "Chiller (Água Gelada)"
          },
          {
            "title": "Ruído e Vibração Excessiva",
            "sintomas": "Barulho anormal nos ventiladores.",
            "causas": "Falta de lubrificação, pás sujas ou desbalanceadas, desgaste de rolamentos.",
            "typology_link": "Ventilação mecânica"
          },
          {
            "title": "Falha no Acionamento da Pressurização",
            "sintomas": "Sistema não liga quando o alarme de incêndio é acionado.",
            "causas": "Falha na interligação com a central de alarme, problema no motor.",
            "typology_link": "Pressurização de escadas"
          },
          {
            "title": "Acúmulo de Gordura em Dutos",
            "sintomas": "Alto risco de incêndio, mau cheiro, baixa eficiência da exaustão.",
            "causas": "Falta de limpeza periódica dos filtros e do interior dos dutos.",
            "typology_link": "Exaustores em garagem e cozinha"
          }
        ]
      }
    }
  },
  "seguranca": {
    "title": "Segurança & Transporte",
    "systems": {
      "incendio": {
        "title": "Sistemas de Incêndio e SPDA",
        "icon": "🔥",
        "tipologias": [
          {
            "title": "Hidrantes e mangotinhos",
            "definicao": "Pontos de tomada de água para uso do Corpo de Bombeiros ou da brigada de incêndio."
          },
          {
            "title": "Sprinklers (chuveiros automáticos)",
            "definicao": "Sistema de acionamento automático que libera água sobre um foco de incêndio através de bicos (sprinklers) sensíveis ao calor."
          },
          {
            "title": "Extintores",
            "definicao": "Equipamentos portáteis para o primeiro combate a princípios de incêndio."
          },
          {
            "title": "Detectores e alarmes",
            "definicao": "Sistema que detecta a presença de fumaça ou calor e aciona um alarme sonoro e visual para alertar os ocupantes."
          },
          {
            "title": "Central de alarme (SACI)",
            "definicao": "O cérebro do sistema, que recebe as informações dos detectores, aciona os alarmes e pode comandar outros sistemas (elevadores, pressurização)."
          },
          {
            "title": "Barreiras corta-fogo (Firestopping)",
            "definicao": "Sistemas para vedar a passagem entre lajes e paredes (shafts) por onde passam instalações, impedindo a propagação de fogo e fumaça."
          },
          {
            "title": "SPDA (Sistema de Proteção contra Descargas Atmosféricas)",
            "definicao": "Sistema que protege a edificação e seus ocupantes dos efeitos de um raio, fornecendo um caminho seguro para a descarga elétrica até o solo."
          }
        ],
        "patologias": [
          {
            "title": "Baixa Pressão na Rede",
            "sintomas": "Jato de água fraco, não atinge a distância necessária.",
            "causas": "Falha na bomba de incêndio, registros fechados, vazamentos na tubulação.",
            "typology_link": "Hidrantes e mangotinhos"
          },
          {
            "title": "Mangueira Ressecada ou Furada",
            "sintomas": "Vazamento de água pela mangueira durante o uso, aspecto quebradiço.",
            "causas": "Fim da vida útil, armazenamento inadequado.",
            "typology_link": "Hidrantes e mangotinhos"
          },
          {
            "title": "Obstrução de Bicos de Sprinkler",
            "sintomas": "Bico entupido com tinta, poeira ou objetos, impedindo a saída de água.",
            "causas": "Pintura da tubulação sem proteção dos bicos, armazenamento de materiais próximo ao teto.",
            "typology_link": "Sprinklers (chuveiros automáticos)"
          },
          {
            "title": "Extintor Despressurizado ou Vencido",
            "sintomas": "Manômetro na faixa vermelha, selo de inspeção vencido.",
            "causas": "Falta de recarga periódica, pequeno vazamento na válvula.",
            "typology_link": "Extintores"
          },
          {
            "title": "Alarmes Falsos",
            "sintomas": "Sirene dispara sem haver incêndio.",
            "causas": "Poeira nos detectores, vapor de água (em banheiros), detector inadequado para o ambiente.",
            "typology_link": "Detectores e alarmes"
          },
          {
            "title": "Detector Obstruído",
            "sintomas": "Detector não aciona na presença de fumaça/calor.",
            "causas": "Acúmulo de poeira, teias de aranha ou pintura sobre o detector.",
            "typology_link": "Detectores e alarmes"
          },
          {
            "title": "Falha na Vedação Corta-Fogo",
            "sintomas": "Aberturas visíveis em shafts.",
            "causas": "Passagem de novas instalações sem a recomposição do firestopping.",
            "typology_link": "Barreiras corta-fogo (Firestopping)"
          },
          {
            "title": "Aterramento Ineficiente do SPDA",
            "sintomas": "Não visível, mas perigoso. Medição da resistência de aterramento acima do especificado em norma.",
            "causas": "Corrosão das hastes de aterramento, conexões frouxas, solo seco.",
            "typology_link": "SPDA (Sistema de Proteção contra Descargas Atmosféricas)"
          },
          {
            "title": "Falha de Comunicação com os Laços de Detecção",
            "sintomas": "Indicação de 'Falha de Comunicação' ou 'Circuito Aberto' no display da central, inoperância parcial de zonas.",
            "causas": "Oxidação dos contatos da fiação nos módulos de isolamento, danos físicos na fiação interna por roedores ou reformas.",
            "typology_link": "Central de alarme (SACI)"
          }
        ]
      },
      "transporte": {
        "title": "Transporte Vertical",
        "icon": "🛗",
        "tipologias": [
          {
            "title": "Elevadores elétricos",
            "definicao": "Sistema mais comum, utiliza um motor elétrico, cabos de aço e um contrapeso para mover a cabina."
          },
          {
            "title": "Elevadores hidráulicos",
            "definicao": "Utiliza um pistão hidráulico para empurrar a cabina para cima. A descida ocorre pela ação da gravidade."
          },
          {
            "title": "Plataformas de acessibilidade",
            "definicao": "Equipamento para vencer pequenos desníveis, garantindo o acesso a pessoas com mobilidade reduzida."
          },
          {
            "title": "Escadas rolantes",
            "definicao": "Esteira rolante com degraus para transportar um grande fluxo de pessoas entre pavimentos."
          },
          {
            "title": "Monta-cargas",
            "definicao": "Elevador projetado exclusivamente para o transporte de cargas, com acabamento robusto e sem os mesmos dispositivos de segurança de um elevador de passageiros."
          }
        ],
        "patologias": [
          {
            "title": "Desgaste de Cabos de Tração",
            "sintomas": "Vibração na cabina, ruídos, inspeção visual detecta fios rompidos.",
            "causas": "Fim da vida útil natural, polias desalinhadas ou desgastadas.",
            "typology_link": "Elevadores elétricos"
          },
          {
            "title": "Desnivelamento da Cabina",
            "sintomas": "Elevador para com um degrau entre a cabina e o pavimento.",
            "causas": "Desgaste do sistema de freio, falha no sistema de controle de nivelamento.",
            "typology_link": "Elevadores elétricos"
          },
          {
            "title": "Falha nos Contatos de Porta",
            "sintomas": "Elevador não parte, portas abrem e fecham repetidamente.",
            "causas": "Poeira ou desgaste nos contatos elétricos que informam que a porta está fechada.",
            "typology_link": "Elevadores elétricos"
          },
          {
            "title": "Vazamento de Óleo no Pistão",
            "sintomas": "Manchas de óleo no fundo do poço, operação lenta ou com solavancos.",
            "causas": "Desgaste dos selos e gaxetas do pistão hidráulico.",
            "typology_link": "Elevadores hidráulicos"
          },
          {
            "title": "Falha no Corrimão",
            "sintomas": "Corrimão se move em velocidade diferente dos degraus, ou para completamente.",
            "causas": "Desgaste da correia de acionamento do corrimão.",
            "typology_link": "Escadas rolantes"
          },
          {
            "title": "Quebra de Dentes dos Degraus",
            "sintomas": "Degraus com pentes de alumínio quebrados nas extremidades.",
            "causas": "Uso inadequado (carrinhos de carga), objetos presos entre os degraus.",
            "typology_link": "Escadas rolantes"
          },
          {
            "title": "Parada Brusca por Atuador de Segurança",
            "sintomas": "Escada para subitamente.",
            "causas": "Objeto preso nos degraus ou laterais, acionamento do botão de emergência.",
            "typology_link": "Escadas rolantes"
          },
          {
            "title": "Desalinhamento Mecânico das Guias ou Cremalheira",
            "sintomas": "Movimento com trancos, trepidação excessiva, ruídos metálicos ou travamento no meio do percurso.",
            "causas": "Falta de lubrificação, fixações mecânicas afrouxadas por vibração ou desalinhamento estrutural da parede de suporte.",
            "typology_link": "Plataformas de acessibilidade"
          },
          {
            "title": "Falha de Nivelamento por Desgaste do Freio",
            "sintomas": "Diferença de nível entre o piso da cabina e o pavimento ao parar, trancos ao carregar.",
            "causas": "Sobrecarga frequente além da capacidade nominal, desgaste natural das sapatas ou lona de freio.",
            "typology_link": "Monta-cargas"
          }
        ]
      },
      "comunicacao": {
        "title": "Comunicação e Segurança Interna",
        "icon": "📡",
        "tipologias": [
          {
            "title": "Interfonia",
            "definicao": "Sistema de comunicação por áudio (e às vezes vídeo) entre os apartamentos e a portaria."
          },
          {
            "title": "CFTV (Circuito Fechado de TV)",
            "definicao": "Sistema de vigilância por vídeo, com câmeras posicionadas em pontos estratégicos e gravação das imagens."
          },
          {
            "title": "Controle de acesso",
            "definicao": "Sistemas que gerenciam a entrada e saída de pessoas e veículos."
          },
          {
            "title": "Sistema de alarme de intrusão",
            "definicao": "Detecta a entrada não autorizada em uma área protegida e dispara um alarme."
          },
          {
            "title": "Portaria remota",
            "definicao": "Serviço onde o controle de acesso do condomínio é feito à distância por uma central de monitoramento, substituindo o porteiro físico."
          },
          {
            "title": "Cabeamento estruturado",
            "definicao": "Infraestrutura padronizada de cabos (geralmente UTP Cat. 6) que suporta múltiplas aplicações de dados, voz e vídeo."
          },
          {
            "title": "Antenas coletivas / TV",
            "definicao": "Sistema que capta os sinais de TV (aberta ou por assinatura) e os distribui para todos os apartamentos."
          }
        ],
        "patologias": [
          {
            "title": "Ruído ou Falha na Comunicação",
            "sintomas": "Chiado na linha, comunicação cortada ou inexistente.",
            "causas": "Oxidação nas conexões, fiação antiga ou danificada, problema na central.",
            "typology_link": "Interfonia"
          },
          {
            "title": "Imagem de Baixa Qualidade ou Inexistente",
            "sintomas": "Imagem escura, com chuvisco, sem cor ou sem sinal.",
            "causas": "Câmera suja ou danificada, problema no cabo ou conectores, HD do gravador cheio ou com defeito.",
            "typology_link": "CFTV (Circuito Fechado de TV)"
          },
          {
            "title": "Perda de Gravação",
            "sintomas": "Sistema não grava imagens ou grava por pouco tempo.",
            "causas": "Falha no disco rígido (HD) do gravador, configuração incorreta.",
            "typology_link": "CFTV (Circuito Fechado de TV)"
          },
          {
            "title": "Falha na Leitura",
            "sintomas": "Leitor biométrico ou de cartão não reconhece o usuário, ou demora para liberar.",
            "causas": "Leitor sujo, software desatualizado, cartão danificado, falha na fechadura.",
            "typology_link": "Controle de acesso"
          },
          {
            "title": "Falha na Fechadura Eletromagnética",
            "sintomas": "Porta não trava ou não destrava com o comando.",
            "causas": "Problema na fonte de alimentação, falha no eletroímã, desalinhamento da porta.",
            "typology_link": "Controle de acesso"
          },
          {
            "title": "Disparos Falsos de Alarme",
            "sintomas": "Alarme de intrusão dispara sem motivo aparente.",
            "causas": "Sensor de presença mal posicionado (pegando sol ou vento), animais de estimação, teias de aranha.",
            "typology_link": "Sistema de alarme de intrusão"
          },
          {
            "title": "Atraso na Abertura de Portões",
            "sintomas": "Demora excessiva para o operador remoto atender e liberar o acesso.",
            "causas": "Link de internet instável ou de baixa velocidade.",
            "typology_link": "Portaria remota"
          },
          {
            "title": "Ponto de Rede Inoperante",
            "sintomas": "Computador ou telefone não conecta à rede.",
            "causas": "Problema no cabo, na tomada RJ45 ou na porta do patch panel.",
            "typology_link": "Cabeamento estruturado"
          },
          {
            "title": "Sinal de TV Ruim",
            "sintomas": "Imagem com chuvisco, congelando ou com \"fantasmas\".",
            "causas": "Amplificador de sinal com defeito, divisores de má qualidade, cabo danificado.",
            "typology_link": "Antenas coletivas / TV"
          }
        ]
      }
    }
  },
  "externas": {
    "title": "Áreas Externas",
    "systems": {
      "paisagismo": {
        "title": "Paisagismo e Irrigação",
        "icon": "🌳",
        "tipologias": [
          {
            "title": "Jardim gramado",
            "definicao": "Áreas cobertas por grama, geralmente para fins estéticos ou de lazer."
          },
          {
            "title": "Jardim vertical",
            "definicao": "Estrutura instalada em uma parede para o cultivo de plantas na vertical."
          },
          {
            "title": "Espelho d’água",
            "definicao": "Lâmina de água de pequena profundidade, com função principalmente ornamental."
          },
          {
            "title": "Irrigação por gotejamento",
            "definicao": "Sistema que aplica água diretamente na raiz da planta através de pequenos emissores (gotejadores), de forma lenta e precisa."
          },
          {
            "title": "Irrigação automatizada",
            "definicao": "Sistema que utiliza aspersores ou gotejadores controlados por um programador (timer), que aciona a rega em horários pré-definidos."
          },
          {
            "title": "Captação e reuso para irrigação",
            "definicao": "Aproveitamento da água da chuva ou de reuso (cinza) para a irrigação dos jardins."
          }
        ],
        "patologias": [
          {
            "title": "Amarelamento e Falhas na Grama",
            "sintomas": "Manchas amareladas ou áreas sem grama.",
            "causas": "Falta de adubação, compactação do solo, ataque de pragas ou fungos, irrigação inadequada.",
            "typology_link": "Jardim gramado"
          },
          {
            "title": "Surgimento de Ervas Daninhas",
            "sintomas": "Crescimento de plantas indesejadas no meio da grama ou canteiros.",
            "causas": "Dispersão de sementes pelo vento, solo pobre em nutrientes que favorece certas espécies.",
            "typology_link": "Jardim gramado"
          },
          {
            "title": "Morte de Plantas no Jardim Vertical",
            "sintomas": "Folhas secas, plantas morrendo em uma determinada área.",
            "causas": "Falha na irrigação (gotejador entupido), excesso de sol ou sombra.",
            "typology_link": "Jardim vertical"
          },
          {
            "title": "Vazamento no Sistema de Irrigação Vertical",
            "sintomas": "Manchas de umidade ou eflorescência na parede abaixo ou ao lado do jardim.",
            "causas": "Furo na tubulação, conexão mal feita, falha na impermeabilização do suporte.",
            "typology_link": "Jardim vertical"
          },
          {
            "title": "Água Verde e Mau Cheiro",
            "sintomas": "Proliferação de algas, odor.",
            "causas": "Falta de circulação e filtragem da água, excesso de matéria orgânica.",
            "typology_link": "Espelho d’água"
          },
          {
            "title": "Entupimento de Gotejadores",
            "sintomas": "Plantas em uma linha morrendo por falta de água.",
            "causas": "Partículas de sujeira na água, falta de filtro no sistema.",
            "typology_link": "Irrigação por gotejamento"
          },
          {
            "title": "Aspersor Quebrado ou Desregulado",
            "sintomas": "Jato de água irregular, molhando paredes ou calçadas.",
            "causas": "Dano por impacto (cortador de grama), desgaste natural.",
            "typology_link": "Irrigação automatizada"
          },
          {
            "title": "Bomba da Cisterna não Funciona",
            "sintomas": "Sistema de irrigação não liga.",
            "causas": "Problema elétrico, boia de nível com defeito, motor da bomba queimado.",
            "typology_link": "Captação e reuso para irrigação"
          }
        ]
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