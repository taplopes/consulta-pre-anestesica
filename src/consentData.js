// Textos pré-definidos para o consentimento informado, por técnica anestésica.
// Todos editáveis na aplicação antes de gerar o documento.

export const TECNICAS = [
  { key: "geral", label: "Anestesia Geral" },
  { key: "raqui", label: "Raquianestesia" },
  { key: "epidural", label: "Anestesia Epidural" },
  { key: "bnp", label: "Bloqueio de Nervo Periférico" },
];

// Descrição do ato/intervenção, sua natureza e objetivo
export const DESCRICAO = {
  geral:
    "Anestesia geral: técnica que induz um estado de inconsciência reversível e controlado, através da administração de fármacos por via endovenosa e/ou inalatória, mantido durante todo o procedimento cirúrgico. Pode implicar a colocação de um dispositivo para assegurar a via aérea e a ventilação (tubo endotraqueal ou máscara laríngea). Tem como objetivo garantir ausência de dor, de consciência e de memória do ato cirúrgico, bem como as condições necessárias à sua realização em segurança.",
  raqui:
    "Raquianestesia (anestesia do neuroeixo): administração de fármaco anestésico no espaço subaracnoideu, ao nível da região lombar, através de uma punção com agulha própria. Provoca um bloqueio sensitivo e motor temporário da metade inferior do corpo, permitindo a realização do procedimento cirúrgico sem dor e com o doente habitualmente acordado ou sob sedação ligeira.",
  epidural:
    "Anestesia/analgesia epidural: administração de fármaco anestésico no espaço epidural, habitualmente com colocação de um cateter que permite a manutenção do efeito durante e após a cirurgia. Produz bloqueio sensitivo e motor de instalação progressiva na região correspondente, permitindo anestesia para o procedimento e/ou controlo da dor no pós-operatório.",
  bnp:
    "Bloqueio de nervo periférico: administração de anestésico local na proximidade de um nervo ou plexo nervoso, habitualmente com recurso a ecografia e/ou neuroestimulação, com o objetivo de bloquear a sensibilidade e a dor na região correspondente. Pode ser utilizado como técnica anestésica principal ou como complemento analgésico do procedimento.",
};

// Benefícios
export const BENEFICIOS = {
  geral:
    "Permite a realização da cirurgia em condições de inconsciência, ausência de dor e imobilidade, com controlo contínuo das funções vitais pela equipa de anestesiologia.",
  raqui:
    "Proporciona anestesia eficaz para procedimentos da metade inferior do corpo, com boa qualidade de bloqueio, menor exposição a fármacos sistémicos e analgesia no período pós-operatório imediato.",
  epidural:
    "Permite anestesia e/ou analgesia eficaz e prolongada, com possibilidade de controlo da dor no pós-operatório através do cateter, reduzindo as necessidades de outros analgésicos.",
  bnp:
    "Proporciona analgesia dirigida e prolongada da região operada, reduzindo a dor e as necessidades de opióides no pós-operatório, com menor repercussão sistémica.",
};

// Riscos graves e riscos frequentes
export const RISCOS = {
  geral:
    "Frequentes: náuseas e vómitos no pós-operatório; dor de garganta, rouquidão ou desconforto por colocação do dispositivo da via aérea; sonolência; arrepios/tremor.\nMenos frequentes: lesão dentária, labial ou da mucosa oral; reação alérgica a fármacos; complicações respiratórias (ex.: broncospasmo, aspiração); complicações cardiovasculares (variações da tensão arterial e do ritmo cardíaco).\nRaros: consciência intraoperatória; lesões nervosas por posicionamento; e, muito raramente, reações graves (ex.: anafilaxia, hipertermia maligna) ou eventos com risco de vida.",
  raqui:
    "Frequentes: descida da tensão arterial; arrepios; retenção urinária transitória; dor no local da punção; lombalgia transitória.\nMenos frequentes: cefaleia pós-punção dural; bloqueio insuficiente com necessidade de complementar ou converter para anestesia geral; náuseas.\nRaros: hematoma ou infeção do neuroeixo (abcesso, meningite); lesão neurológica transitória ou, muito raramente, permanente; toxicidade sistémica por anestésico local.",
  epidural:
    "Frequentes: descida da tensão arterial; dor no local da punção; bloqueio assimétrico ou incompleto; retenção urinária.\nMenos frequentes: punção acidental da dura-máter com cefaleia; falência da técnica com necessidade de alternativa; migração ou saída do cateter.\nRaros: hematoma ou abcesso epidural; lesão neurológica transitória ou, muito raramente, permanente; toxicidade sistémica por anestésico local.",
  bnp:
    "Frequentes: bloqueio incompleto ou de curta duração, podendo exigir complemento analgésico ou outra técnica; dor ou hematoma no local da punção.\nMenos frequentes: infeção local; bloqueio de estruturas vizinhas (ex.: bloqueio do nervo frénico em bloqueios do membro superior).\nRaros: lesão nervosa transitória ou, muito raramente, permanente; toxicidade sistémica por anestésico local.",
};

// Alternativas fiáveis e cientificamente reconhecidas
export const ALTERNATIVAS = {
  geral:
    "Consoante o tipo de cirurgia, poderão existir como alternativas as técnicas locorregionais (raquianestesia, epidural ou bloqueio de nervo periférico), isoladas ou combinadas, a discutir com a equipa de anestesiologia.",
  raqui:
    "Anestesia geral ou, consoante o procedimento, outras técnicas locorregionais (epidural ou bloqueio de nervo periférico).",
  epidural:
    "Anestesia geral, raquianestesia ou bloqueio de nervo periférico, consoante o procedimento.",
  bnp:
    "Anestesia geral, raquianestesia ou anestesia epidural, isoladas ou combinadas, consoante o procedimento.",
};

// Composição dos textos consoante as técnicas selecionadas.
// Junta os blocos das várias técnicas escolhidas num único texto por campo.
export function composeConsent(selectedKeys) {
  const keys = TECNICAS.filter(t => selectedKeys.includes(t.key));
  const join = (dict, withHeader) =>
    keys
      .map(t => (withHeader && keys.length > 1 ? `• ${t.label}:\n${dict[t.key]}` : dict[t.key]))
      .join("\n\n");

  const riscosNaoTratamento =
    "A não realização do procedimento anestésico impossibilita a realização da cirurgia proposta, com manutenção e/ou agravamento da situação clínica que a motivou, incluindo o risco das complicações associadas à doença de base.";

  return {
    descricao: keys.length ? join(DESCRICAO, true) : "",
    beneficios: keys.length ? join(BENEFICIOS, true) : "",
    riscos: keys.length ? join(RISCOS, true) : "",
    alternativas: keys.length ? join(ALTERNATIVAS, true) : "",
    riscosNaoTratamento,
  };
}
