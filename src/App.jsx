import { useState, useMemo, useCallback } from "react";
import { TECNICAS, composeConsent } from "./consentData";

const TABS = ["Identificação", "Anamnese", "Exame Objetivo", "ECD", "Risco", "Recomendações", "Relatório", "Consentimento"];

const defaultAC = "rítmica, sem sopros audíveis";
const defaultAP = "murmúrio vesicular presente bilateralmente e simétrico, sem ruídos adventícios";
const defaultEdemas = "Sem edemas periféricos. Sem sinais de insuficiência venosa.";
const defaultVA = "sem dismorfismos faciais; barba/bigode; Mobilidade e perímetro cervical normal; DTM > 6,5cm; abertura da boca > 3cm; boa protusão da mandíbula; sem próteses dentárias; dentição em bom estado, sem ausências";
const defaultAnalises = "sem alterações";
const defaultECG = "RS, bpm, sem alterações de relevo";
const defaultRxTorax = "Sem alterações da opacidade pleuro-parenquimatosa. ICT normal, seios costofrénicos livres";

// --- Utility ---
function bmi(w, h) {
  if (!w || !h) return null;
  return (w / ((h / 100) ** 2)).toFixed(1);
}
function idealWeight(h, sex) {
  if (!h) return null;
  if (sex === "M") return (50 + 0.91 * (h - 152.4)).toFixed(1);
  return (45.5 + 0.91 * (h - 152.4)).toFixed(1);
}

// --- Components ---
function Field({ label, children, className = "" }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white ${className}`} />;
}
function Textarea({ value, onChange, placeholder, rows = 2, className = "" }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white resize-y ${className}`} />;
}
function Toggle({ label, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${value ? "bg-sky-100 border-sky-400 text-sky-800" : "bg-slate-50 border-slate-300 text-slate-500"}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${value ? "bg-sky-500" : "bg-slate-300"}`} />
      {label}
    </button>
  );
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}
function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-1 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}
function ScoreBadge({ label, value, color = "sky" }) {
  const colors = {
    sky: "bg-sky-100 text-sky-800 border-sky-300",
    amber: "bg-amber-100 text-amber-800 border-amber-300",
    red: "bg-red-100 text-red-800 border-red-300",
    green: "bg-green-100 text-green-800 border-green-300",
    slate: "bg-slate-100 text-slate-700 border-slate-300"
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${colors[color]}`}>
      <span>{label}:</span><span>{value}</span>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);

  // --- Identification ---
  const [nomeDoente, setNomeDoente] = useState("");
  const [processo, setProcesso] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [intervencao, setIntervencao] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [regime, setRegime] = useState("internamento");

  // --- Anamnese ---
  const [antMedicos, setAntMedicos] = useState("");
  const [antCirurgicos, setAntCirurgicos] = useState("");
  const [transfusoes, setTransfusoes] = useState(false);
  const [transfusoesContactos, setTransfusoesContactos] = useState(false);
  const [transfusoesNota, setTransfusoesNota] = useState("");
  const [medicacao, setMedicacao] = useState("");
  const [alergias, setAlergias] = useState(false);
  const [alergiasTexto, setAlergiasTexto] = useState("");
  const [tabagismo, setTabagismo] = useState(false);
  const [tabagismoTexto, setTabagismoTexto] = useState("");
  const [alcool, setAlcool] = useState(false);
  const [alcoolTexto, setAlcoolTexto] = useState("");
  const [toxicos, setToxicos] = useState(false);
  const [toxicosTexto, setToxicosTexto] = useState("");
  const [ervanaria, setErvanaria] = useState(false);
  const [ervanariaTexto, setErvanariaTexto] = useState("");
  // Symptoms
  const [dispneiaEsforco, setDispneiaEsforco] = useState(false);
  const [ortopneia, setOrtopneia] = useState(false);
  const [dpn, setDpn] = useState(false);
  const [dorToracica, setDorToracica] = useState(false);
  const [palpitacoes, setPalpitacoes] = useState(false);
  const [sincope, setSincope] = useState(false);
  const [edemas, setEdemas] = useState(false);
  const [histHemorragica, setHistHemorragica] = useState(false);
  const [infResp, setInfResp] = useState(false);
  const [gravidez, setGravidez] = useState(false);

  // --- Exame Objetivo ---
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [ta, setTa] = useState("");
  const [fc, setFc] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [dor, setDor] = useState("");
  const [ac, setAc] = useState(defaultAC);
  const [ap, setAp] = useState(defaultAP);
  const [edemasExame, setEdemasExame] = useState(defaultEdemas);
  const [mallampati, setMallampati] = useState("");
  const [vaTexto, setVaTexto] = useState(defaultVA);

  // --- ECD ---
  const [analises, setAnalises] = useState(defaultAnalises);
  const [ecg, setEcg] = useState(defaultECG);
  const [rxTorax, setRxTorax] = useState(defaultRxTorax);
  const [examesAdicionais, setExamesAdicionais] = useState("");

  // --- Risk scores (checkboxes for factors) ---
  const [asa, setAsa] = useState("");
  // Apfel
  const [apfelNVPO, setApfelNVPO] = useState(false);
  const [apfelOpioides, setApfelOpioides] = useState(false);
  // RCRI
  const [rcriIC, setRcriIC] = useState(false);
  const [rcriAVC, setRcriAVC] = useState(false);
  const [rcriCoronario, setRcriCoronario] = useState(false);
  const [rcriDM, setRcriDM] = useState(false);
  const [rcriCreat, setRcriCreat] = useState(false);
  const [rcriCirurgia, setRcriCirurgia] = useState(false);
  // ARISCAT
  const [ariscatHb, setAriscatHb] = useState(false);
  const [ariscatPneumonia, setAriscatPneumonia] = useState(false);
  const [ariscatIncisao, setAriscatIncisao] = useState("nenhuma");
  const [ariscatDuracao, setAriscatDuracao] = useState("curta");
  const [ariscatEmergencia, setAriscatEmergencia] = useState(false);
  // STOP-BANG
  const [sbRessona, setSbRessona] = useState(false);
  const [sbCansaco, setSbCansaco] = useState(false);
  const [sbApneias, setSbApneias] = useState(false);
  const [sbHTA, setSbHTA] = useState(false);
  const [sbPescoco, setSbPescoco] = useState(false);
  // Caprini (calculadora simplificada por categorias)
  const [capCirurgia, setCapCirurgia] = useState(""); // "", "minor", "major", "laparoscopia", "artroscopia", "artroplastia"
  const [capMobilidade, setCapMobilidade] = useState(""); // "", "acamado", "acamado72", "gesso"
  const [capMedico, setCapMedico] = useState({}); // toggles: varizes, edema, ic, eam, sepsis, dpoc, dii, neoplasia, cvc
  const [capTrombose, setCapTrombose] = useState({}); // toggles: dvt_pe, fam, trombofilia
  const [capFeminino, setCapFeminino] = useState({}); // toggles: gravidez_pp, aco
  const [capAgudo, setCapAgudo] = useState({}); // toggles: avc_1m, fx_mi, lesao_medular
  // VAD
  const [riscoVAD, setRiscoVAD] = useState("");
  // Aspiração
  const [riscoAspiracao, setRiscoAspiracao] = useState("");
  // METs
  const [mets, setMets] = useState("");

  // --- Recommendations ---
  const [recJejum, setRecJejum] = useState("Jejum pré-operatório: 6 horas para sólidos e 2 horas para líquidos claros");
  const [recHC, setRecHC] = useState("Sem contraindicação para ingerir bebida rica em HC no pré-operatório.");
  const [recMH, setRecMH] = useState("mantém");
  const [recAspiracao, setRecAspiracao] = useState("sem indicação");
  const [recPreMed, setRecPreMed] = useState("sem indicação");
  const [recTromboprofilaxia, setRecTromboprofilaxia] = useState("- Promover hidratação e deambulação precoces\n- Devem ser colocadas meias compressão elástica nos MI\n- HBPM assim que hemostase cirúrgica permitir");
  const [recSangue, setRecSangue] = useState("");
  const [recPuncao, setRecPuncao] = useState("Deve ser puncionado na enfermaria mas não deve levar nenhum soro em perfusão.");
  const [recATB, setRecATB] = useState("Antibioterapia cirúrgica profilática 30-60min antes da incisão cirúrgica de acordo com normas da DGS.");
  const [recPosOp, setRecPosOp] = useState("sem contraindicação a enfermaria nível I/regime ambulatório");
  const [recOutras, setRecOutras] = useState("-");

  // --- Consentimento informado ---
  const [tecnicas, setTecnicas] = useState([]); // ex: ["geral", "raqui"]
  const [consentEdited, setConsentEdited] = useState(false); // se o utilizador editou manualmente, não sobrepor
  const [conDiagnostico, setConDiagnostico] = useState("");
  const [conDescricao, setConDescricao] = useState("");
  const [conBeneficios, setConBeneficios] = useState("");
  const [conRiscos, setConRiscos] = useState("");
  const [conAlternativas, setConAlternativas] = useState("");
  const [conRiscosNaoTrat, setConRiscosNaoTrat] = useState("");
  const [conProfNome, setConProfNome] = useState("");
  const [conProfCedula, setConProfCedula] = useState("");
  const [conProfContacto, setConProfContacto] = useState("");
  const [conData, setConData] = useState("");

  // Alterna uma técnica selecionada e repõe os textos pré-definidos
  const toggleTecnica = useCallback((key) => {
    if (key === "__noop__") return;
    setTecnicas(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      const c = composeConsent(next);
      setConDescricao(c.descricao);
      setConBeneficios(c.beneficios);
      setConRiscos(c.riscos);
      setConAlternativas(c.alternativas);
      setConRiscosNaoTrat(c.riscosNaoTratamento);
      setConsentEdited(false);
      // Preenche o diagnóstico do consentimento a partir da consulta, se ainda vazio
      setConDiagnostico(cur => cur || diagnostico || "");
      return next;
    });
  }, [diagnostico]);

  // --- Computed values ---
  const computedBMI = useMemo(() => bmi(parseFloat(peso), parseFloat(altura)), [peso, altura]);
  const computedIdealWeight = useMemo(() => idealWeight(parseFloat(altura), sexo), [altura, sexo]);

  // Apfel score
  const apfelScore = useMemo(() => {
    let s = 0;
    if (sexo === "F") s++;
    if (!tabagismo) s++;
    if (apfelNVPO) s++;
    if (apfelOpioides) s++;
    return s;
  }, [sexo, tabagismo, apfelNVPO, apfelOpioides]);

  const apfelRisk = useMemo(() => {
    if (apfelScore <= 1) return { text: "Baixo (~20%)", color: "green" };
    if (apfelScore === 2) return { text: "Moderado (~40%)", color: "amber" };
    if (apfelScore === 3) return { text: "Alto (~60%)", color: "amber" };
    return { text: "Muito Alto (~80%)", color: "red" };
  }, [apfelScore]);

  const apfelFactorsText = useMemo(() => {
    const f = [];
    if (sexo === "F") f.push("Mulher");
    if (!tabagismo) f.push("Não fumador");
    if (apfelNVPO) f.push("NVPO/Cinetose");
    if (apfelOpioides) f.push("Opióides pós-op");
    return f.join(" + ") || "Nenhum";
  }, [sexo, tabagismo, apfelNVPO, apfelOpioides]);

  // RCRI
  const rcriScore = useMemo(() => {
    let s = 0;
    if (rcriIC) s++;
    if (rcriAVC) s++;
    if (rcriCoronario) s++;
    if (rcriDM) s++;
    if (rcriCreat) s++;
    if (rcriCirurgia) s++;
    return s;
  }, [rcriIC, rcriAVC, rcriCoronario, rcriDM, rcriCreat, rcriCirurgia]);

  const rcriRisk = useMemo(() => {
    if (rcriScore === 0) return { text: "Muito baixo (3.9%)", color: "green" };
    if (rcriScore === 1) return { text: "Baixo (6%)", color: "green" };
    if (rcriScore === 2) return { text: "Moderado (10.1%)", color: "amber" };
    return { text: "Alto (≥15%)", color: "red" };
  }, [rcriScore]);

  const rcriFactorsText = useMemo(() => {
    const f = [];
    if (rcriIC) f.push("IC");
    if (rcriAVC) f.push("AVC/AIT");
    if (rcriCoronario) f.push("Coronariopatia");
    if (rcriDM) f.push("DM IT");
    if (rcriCreat) f.push("Creat >2mg/dl");
    if (rcriCirurgia) f.push("Cirurgia de alto risco");
    return f.join(" + ") || "Nenhum";
  }, [rcriIC, rcriAVC, rcriCoronario, rcriDM, rcriCreat, rcriCirurgia]);

  // ARISCAT
  const ariscatScore = useMemo(() => {
    let s = 0;
    const age = parseInt(idade);
    if (age >= 51 && age <= 80) s += 3;
    else if (age > 80) s += 16;
    const sp = parseFloat(spo2);
    if (sp >= 91 && sp <= 95) s += 8;
    else if (sp > 0 && sp <= 90) s += 24;
    if (ariscatHb) s += 11;
    if (ariscatPneumonia) s += 17;
    if (infResp) s += 17;
    if (ariscatIncisao === "abdominal_sup") s += 15;
    else if (ariscatIncisao === "toracica") s += 24;
    if (ariscatDuracao === "2a3h") s += 16;
    else if (ariscatDuracao === "mais3h") s += 23;
    if (ariscatEmergencia) s += 8;
    return s;
  }, [idade, spo2, ariscatHb, ariscatPneumonia, infResp, ariscatIncisao, ariscatDuracao, ariscatEmergencia]);

  const ariscatRisk = useMemo(() => {
    if (ariscatScore < 26) return { text: "Baixo", color: "green" };
    if (ariscatScore < 45) return { text: "Intermédio", color: "amber" };
    return { text: "Alto", color: "red" };
  }, [ariscatScore]);

  const ariscatFactorsText = useMemo(() => {
    const f = [];
    if (ariscatHb) f.push("Hb < 10g/dl");
    if (ariscatPneumonia) f.push("Pneumonia < 1mês");
    if (ariscatIncisao === "abdominal_sup") f.push("Incisão abd sup");
    else if (ariscatIncisao === "toráx") f.push("Incisão torácica");
    if (ariscatDuracao === "2a3h" || ariscatDuracao === "mais3h") f.push("duração >2h");
    const age = parseInt(idade);
    if (age > 50) f.push("idade > 50a");
    const sp = parseFloat(spo2);
    if (sp > 0 && sp < 96) f.push("SpO2 < 96%");
    return f.join(" + ") || "Nenhum";
  }, [ariscatHb, ariscatPneumonia, ariscatIncisao, ariscatDuracao, idade, spo2]);

  // STOP-BANG
  const sbScore = useMemo(() => {
    let s = 0;
    if (sbRessona) s++;
    if (sbCansaco) s++;
    if (sbApneias) s++;
    if (sbHTA) s++;
    const b = parseFloat(computedBMI);
    if (b > 35) s++;
    const age = parseInt(idade);
    if (age > 50) s++;
    if (sbPescoco) s++;
    if (sexo === "M") s++;
    return s;
  }, [sbRessona, sbCansaco, sbApneias, sbHTA, computedBMI, idade, sbPescoco, sexo]);

  const sbRisk = useMemo(() => {
    if (sbScore <= 2) return { text: "Baixo", color: "green" };
    if (sbScore <= 4) return { text: "Intermédio", color: "amber" };
    return { text: "Alto", color: "red" };
  }, [sbScore]);

  const sbFactorsText = useMemo(() => {
    const f = [];
    if (sbRessona) f.push("Ressona");
    if (sbCansaco) f.push("Cansaço diurno");
    if (sbApneias) f.push("Apneias observadas");
    if (sbHTA) f.push("HTA");
    const b = parseFloat(computedBMI);
    if (b > 35) f.push("IMC > 35");
    const age = parseInt(idade);
    if (age > 50) f.push("idade > 50a");
    if (sbPescoco) f.push("pescoço > 40cm");
    if (sexo === "M") f.push("homem");
    return f.join(" + ") || "Nenhum";
  }, [sbRessona, sbCansaco, sbApneias, sbHTA, computedBMI, idade, sbPescoco, sexo]);

  // Caprini (calculadora agrupada)
  const computedCaprini = useMemo(() => {
    let s = 0;
    // Idade (automático)
    const age = parseInt(idade);
    if (age >= 41 && age <= 60) s += 1;
    else if (age >= 61 && age <= 74) s += 2;
    else if (age >= 75) s += 3;
    // IMC (automático)
    const b = parseFloat(computedBMI);
    if (b > 25) s += 1;
    // Tipo de cirurgia
    if (capCirurgia === "minor") s += 1;
    else if (capCirurgia === "major") s += 2;
    else if (capCirurgia === "laparoscopia") s += 2;
    else if (capCirurgia === "artroscopia") s += 2;
    else if (capCirurgia === "artroplastia") s += 5;
    // Mobilidade
    if (capMobilidade === "acamado") s += 1;
    else if (capMobilidade === "acamado72") s += 2;
    else if (capMobilidade === "gesso") s += 2;
    // Antecedentes médicos (1 pt each)
    ["varizes", "edema", "ic", "eam", "sepsis", "dpoc", "dii"].forEach(k => { if (capMedico[k]) s += 1; });
    // Neoplasia (2 pts), CVC (2 pts)
    if (capMedico.neoplasia) s += 2;
    if (capMedico.cvc) s += 2;
    // Feminino (1 pt each)
    if (capFeminino.gravidez_pp) s += 1;
    if (capFeminino.aco) s += 1;
    // Trombose (3 pts each)
    if (capTrombose.dvt_pe) s += 3;
    if (capTrombose.fam) s += 3;
    if (capTrombose.trombofilia) s += 3;
    // Eventos agudos (5 pts each)
    if (capAgudo.avc_1m) s += 5;
    if (capAgudo.fx_mi) s += 5;
    if (capAgudo.lesao_medular) s += 5;
    return s;
  }, [idade, computedBMI, capCirurgia, capMobilidade, capMedico, capFeminino, capTrombose, capAgudo]);

  const capriniRisk = useMemo(() => {
    if (computedCaprini <= 1) return { text: "Baixo", color: "green" };
    if (computedCaprini === 2) return { text: "Moderado", color: "amber" };
    if (computedCaprini <= 4) return { text: "Alto", color: "amber" };
    return { text: "Muito Alto", color: "red" };
  }, [computedCaprini]);

  // --- Generate Report ---
  const generateReport = useCallback(() => {
    const sym = [];
    if (!dispneiaEsforco && !ortopneia && !dpn && !dorToracica && !palpitacoes && !sincope && !edemas) {
      sym.push("Nega dispneia de esforço, ortopneia, dispneia paroxística noturna, dor torácica, palpitações, síncope ou edemas.");
    } else {
      const pos = [];
      const neg = [];
      [
        [dispneiaEsforco, "dispneia de esforço"],
        [ortopneia, "ortopneia"],
        [dpn, "dispneia paroxística noturna"],
        [dorToracica, "dor torácica"],
        [palpitacoes, "palpitações"],
        [sincope, "síncope"],
        [edemas, "edemas"],
      ].forEach(([v, l]) => { if (v) pos.push(l); else neg.push(l); });
      if (pos.length) sym.push(`Refere ${pos.join(", ")}.`);
      if (neg.length) sym.push(`Nega ${neg.join(", ")}.`);
    }
    if (!histHemorragica) sym.push("Nega história hemorrágica de relevo.");
    else sym.push("Refere história hemorrágica.");
    if (!infResp) sym.push("Nega sintomatologia de infeção respiratória recente.");
    else sym.push("Refere sintomatologia de infeção respiratória recente.");
    if (sexo === "F") {
      if (!gravidez) sym.push("Nega possibilidade de estar grávida.");
      else sym.push("Refere possibilidade de estar grávida.");
    }

    const transText = transfusoes
      ? `aceita; ${transfusoesContactos ? "com" : "sem"} contactos anteriores${transfusoesNota ? ". " + transfusoesNota : ""}`
      : `não aceita${transfusoesNota ? ". " + transfusoesNota : ""}`;

    const habitos = [
      `- Tabágicos: ${tabagismo ? tabagismoTexto || "Sim" : "Não"}`,
      `- Alcoólicos: ${alcool ? alcoolTexto || "Sim" : "Não"}`,
      `- Toxicológicos: ${toxicos ? toxicosTexto || "Sim" : "Não"}`,
      `- Produtos de ervanária: ${ervanaria ? ervanariaTexto || "Sim" : "Não"}`,
    ].join("\n");

    const alertaAlergias = alergias ? `\n⚠️ ALERTA: ALERGIAS CONHECIDAS — ${alergiasTexto || "Ver detalhes"} ⚠️\n` : "";

    return `AVALIAÇÃO ANESTÉSICA
${alertaAlergias}
Especialidade Proponente: ${especialidade}

Diagnóstico: ${diagnostico}

Intervenção proposta: ${intervencao} em regime de ${regime}.

___________________________________________________

ANAMNESE

Antecedentes patológicos:

- Médicos: ${antMedicos || "-"}

- Cirúrgicos e anestésicos: ${antCirurgicos || "sem intercorrências anestésicas."}

- Transfusões de sangue e hemoderivados: ${transText}

Medicação Habitual: ${medicacao || "-"}

Alergias: ${alergias ? alergiasTexto || "Sim" : "desconhece"}

Hábitos:

${habitos}

${sym.join("\n\n")}

___________________________________________________

EXAME OBJETIVO:

Doente consciente, orientado e colaborante.

Eupneico em aa, sem SDR.

Peso: ${peso || "___"} Kg | Altura: ${altura || "___"} cm | IMC: ${computedBMI || "___"} Kg/m²${computedIdealWeight ? ` | Peso Ideal: ${computedIdealWeight} Kg` : ""}

TA ${ta || "___"} mmHg | FC ${fc || "___"} bpm | SpO2(aa) ${spo2 || "___"} % | Temp ${temp || "___"} ºC | Dor ${dor || "___"}

AC: ${ac}

AP: ${ap}

${edemasExame}

VIA AÉREA: ${vaTexto}${mallampati ? `; Mallampati ${mallampati}` : ""}

___________________________________________________

EXAMES COMPLEMENTARES DE DIAGNÓSTICO:

Análises: ${analises}

ECG: ${ecg}

Rx tórax: ${rxTorax}

Exames adicionais: ${examesAdicionais || "-"}

___________________________________________________

AVALIAÇÃO DO RISCO PRÉ-ANESTÉSICO:

- ASA: ${asa || "___"}

- Risco para NVPO (Apfel): ${apfelFactorsText} = ${apfelScore}/4 - ${apfelRisk.text}

- Risco de VAD: ${riscoVAD || "___"}

- Risco de aspiração pulmonar: ${riscoAspiracao || "___"}

- Capacidade funcional: ${mets || "___"} METs

- Risco tromboembólico (Caprini): ${computedCaprini} - ${capriniRisk.text}

- Risco CV pós-op (Lee's RCRI): ${rcriFactorsText} = ${rcriScore}/6 - ${rcriRisk.text}

- Risco complicações pulmonares pós-op (Ariscat): ${ariscatFactorsText} = ${ariscatScore} pts - ${ariscatRisk.text}

- Rastreio de SAOS (STOP-BANG): ${sbFactorsText} = ${sbScore}/8 - ${sbRisk.text}

__________________________________________________

RECOMENDAÇÕES PRÉ-OPERATÓRIAS:

${recJejum}

${recHC}

Alterações à MH: ${recMH}

Profilaxia de aspiração: ${recAspiracao}

Medicação pré-anestésica: ${recPreMed}

Profilaxia tromboembólica:

${recTromboprofilaxia}

Classificação sanguínea e reserva de hemoderivados: ${recSangue || "-"}

${recPuncao}

${recATB}

Cuidados pós-operatórios: ${recPosOp}

Outras recomendações: ${recOutras}

Explicado ao doente as possíveis técnicas anestésicas e analgésicas, as suas vantagens clínicas, os riscos/complicações associados e as alternativas disponíveis e recomendações em relação à medicação habitual. Também explicados os fluxos de processos intraoperatórios relevantes ao doente. Esclarecidas dúvidas. Doente percebeu e consentiu.

__________________________________________________

DECISÃO:

DOENTE APTO DO PONTO DE VISTA ANESTÉSICO PARA O PROCEDIMENTO.`;
  }, [especialidade, diagnostico, intervencao, regime, antMedicos, antCirurgicos, transfusoes, transfusoesContactos, transfusoesNota, medicacao, alergias, alergiasTexto, tabagismo, tabagismoTexto, alcool, alcoolTexto, toxicos, toxicosTexto, ervanaria, ervanariaTexto, dispneiaEsforco, ortopneia, dpn, dorToracica, palpitacoes, sincope, edemas, histHemorragica, infResp, gravidez, sexo, peso, altura, computedBMI, computedIdealWeight, ta, fc, spo2, temp, dor, ac, ap, edemasExame, vaTexto, mallampati, analises, ecg, rxTorax, examesAdicionais, asa, apfelFactorsText, apfelScore, apfelRisk, riscoVAD, riscoAspiracao, mets, computedCaprini, capriniRisk, rcriFactorsText, rcriScore, rcriRisk, ariscatFactorsText, ariscatScore, ariscatRisk, sbFactorsText, sbScore, sbRisk, recJejum, recHC, recMH, recAspiracao, recPreMed, recTromboprofilaxia, recSangue, recPuncao, recATB, recPosOp, recOutras]);

  const [copied, setCopied] = useState(false);
  const copyReport = () => {
    navigator.clipboard.writeText(generateReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Consentimento: gerar HTML do documento e imprimir/guardar PDF ---
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const consentTecnicasLabel = useMemo(
    () => TECNICAS.filter(t => tecnicas.includes(t.key)).map(t => t.label).join(", "),
    [tecnicas]
  );

  const buildConsentHTML = useCallback(() => {
    const logoUrl = `${import.meta.env.BASE_URL}logo-chuc.png`;
    const box = (title, content) => `
      <div class="fieldblock">
        <div class="fieldlabel">${title}</div>
        <div class="fieldbox">${esc(content) || "&nbsp;"}</div>
      </div>`;
    const header = `
      <div class="doc-header">
        <img src="${logoUrl}" class="logo" alt="CHUC" />
        <div class="header-text">
          <div class="title">CONSENTIMENTO INFORMADO, ESCLARECIDO E LIVRE PARA<br>ATOS/INTERVENÇÕES DE SAÚDE</div>
          <div class="subtitle">Nos termos da Norma n.º 015/2013 da Direção-Geral da Saúde</div>
        </div>
      </div>`;
    const identLinha = (nomeDoente || processo)
      ? `<div class="ident">Doente: <b>${esc(nomeDoente) || "________________________"}</b>${processo ? ` &nbsp;|&nbsp; Processo n.º: <b>${esc(processo)}</b>` : ""}</div>`
      : "";

    const page1 = `
      <section class="page">
        ${header}
        ${identLinha}
        <div class="ato-tag">Procedimento anestésico${consentTecnicasLabel ? `: ${esc(consentTecnicasLabel)}` : ""}</div>
        ${box("Diagnóstico e/ou descrição da situação clínica", conDiagnostico)}
        ${box("Descrição do ato/intervenção, sua natureza e objetivo", conDescricao)}
        ${box("Benefícios", conBeneficios)}
        ${box("Riscos graves e riscos frequentes", conRiscos)}
        ${box("Atos/intervenções alternativas fiáveis e cientificamente reconhecidas", conAlternativas)}
        ${box("Riscos de não tratamento", conRiscosNaoTrat)}
        <div class="declar">
          <div class="declar-title">(Parte declarativa do profissional)</div>
          <p>Confirmo que expliquei à pessoa abaixo indicada, de forma adequada e inteligível, os procedimentos necessários ao ato referido neste documento. Respondi a todas as questões que me foram colocadas e assegurei-me de que houve um período de reflexão suficiente para a tomada de decisão. Também garanti que, em caso de recusa, serão assegurados os melhores cuidados possíveis nesse contexto, no respeito pelos seus direitos.</p>
          <div class="sig-line"><span>Nome legível do profissional de saúde:</span> <b>${esc(conProfNome) || "____________________________________"}</b></div>
          <div class="sig-line"><span>Data:</span> ${esc(conData) || "____ / ____ / ______"} &nbsp;&nbsp; <span>Assinatura:</span> _______________________________________</div>
          <div class="sig-line"><span>N.º de Cédula Profissional ou n.º mecanográfico:</span> ${esc(conProfCedula) || "____________________"}</div>
          <div class="sig-line"><span>Contacto institucional do profissional de saúde:</span> ${esc(conProfContacto) || "____________________"}</div>
        </div>
      </section>`;

    const page2 = `
      <section class="page">
        ${header}
        <div class="pessoa-title">À Pessoa/representante</div>
        <p class="intro">Por favor, leia com atenção todo o conteúdo deste documento. Não hesite em solicitar mais informações se não estiver completamente esclarecido/a. Verifique se todas as informações estão corretas. Se tudo estiver conforme, então assine este documento.</p>
        <p>Declaro ter compreendido os objetivos de quanto me foi proposto e explicado pelo profissional de saúde que assina este documento, ter-me sido dada oportunidade de fazer todas as perguntas sobre o assunto e para todas elas ter obtido resposta esclarecedora, ter-me sido garantido que não haverá prejuízo para os meus direitos assistenciais se eu recusar esta solicitação, e ter-me sido dado tempo suficiente para refletir sobre esta proposta.</p>
        <div class="opt"><span class="chk">&#9744;</span> <b>Autorizo</b> o ato indicado, bem como os procedimentos diretamente relacionados que sejam necessários no meu próprio interesse e justificados por razões clínicas fundamentadas.</div>
        <div class="opt"><span class="chk">&#9744;</span> <b>Não autorizo</b> o ato indicado, bem como os procedimentos diretamente relacionados que sejam necessários no meu próprio interesse e justificados por razões clínicas fundamentadas.</div>
        <div class="sig-line"><span>Data:</span> ____ / ____ / ______</div>
        <div class="sig-line"><span>Nome:</span> ${esc(nomeDoente) ? `<b>${esc(nomeDoente)}</b>` : "_______________________________________________________"}</div>
        <div class="sig-line"><span>Assinatura:</span> _______________________________________________</div>
        <div class="repr">
          <div class="repr-title">SE NÃO FOR O PRÓPRIO A ASSINAR POR IDADE OU INCAPACIDADE</div>
          <div class="repr-sub">(se o menor tiver discernimento deve também assinar em cima)</div>
          <div class="sig-line"><span>Nome:</span> _______________________________________________</div>
          <div class="sig-line"><span>Doc. Identificação N.º:</span> ___________________ &nbsp; <span>Data ou validade:</span> ___________</div>
          <div class="sig-line"><span>Grau de parentesco ou tipo de representação:</span> _____________________</div>
          <div class="sig-line"><span>Assinatura:</span> _______________________________________________</div>
        </div>
        <div class="nota">Nota: Este documento é feito em duas vias, uma para o processo clínico e outra para a pessoa/representante.</div>
      </section>`;

    return `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8">
      <title>Consentimento Informado${nomeDoente ? " — " + esc(nomeDoente) : ""}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; font-size: 11pt; line-height: 1.35; }
        .page { padding: 16mm 15mm; max-width: 210mm; margin: 0 auto; }
        @media print { .page { padding: 12mm 14mm; } .page + .page { page-break-before: always; } body { font-size: 10.5pt; } }
        .page + .page { page-break-before: always; }
        .doc-header { display: flex; align-items: flex-start; gap: 12px; border-bottom: 1.5px solid #14366e; padding-bottom: 8px; margin-bottom: 14px; }
        .logo { height: 46px; width: auto; }
        .header-text { flex: 1; text-align: right; }
        .title { font-weight: bold; font-size: 10.5pt; color: #14366e; letter-spacing: .2px; }
        .subtitle { font-size: 7.5pt; color: #333; margin-top: 2px; }
        .ident { font-size: 10pt; margin: 6px 0 4px; }
        .ato-tag { display: inline-block; background: #eef3fb; border: 1px solid #c3d5ef; color: #14366e; font-weight: bold; font-size: 9.5pt; padding: 3px 10px; border-radius: 5px; margin-bottom: 10px; }
        .fieldblock { margin-bottom: 9px; page-break-inside: avoid; }
        .fieldlabel { font-size: 9.5pt; font-weight: bold; color: #14366e; margin-bottom: 3px; }
        .fieldbox { border: 1px solid #9aa7b8; border-radius: 3px; padding: 7px 9px; min-height: 40px; font-size: 10pt; white-space: pre-wrap; }
        .declar { margin-top: 12px; page-break-inside: avoid; }
        .declar-title { text-align: right; font-weight: bold; font-size: 9.5pt; margin-bottom: 3px; }
        .declar p { margin: 4px 0 10px; text-align: justify; }
        .sig-line { margin: 7px 0; font-size: 10pt; }
        .sig-line span { color: #333; }
        .pessoa-title { text-align: right; font-weight: bold; font-size: 12pt; margin: 6px 0 14px; }
        .intro { text-align: justify; }
        p { margin: 8px 0; text-align: justify; }
        .opt { margin: 10px 0; text-align: justify; }
        .chk { font-size: 13pt; margin-right: 4px; }
        .repr { margin-top: 18px; }
        .repr-title { text-align: center; font-weight: bold; font-size: 9.5pt; margin-top: 10px; }
        .repr-sub { text-align: center; font-size: 8pt; margin-bottom: 8px; }
        .nota { margin-top: 22px; font-size: 8pt; color: #444; border-top: 1px solid #ccc; padding-top: 6px; }
      </style></head>
      <body>${page1}${page2}</body></html>`;
  }, [nomeDoente, processo, consentTecnicasLabel, conDiagnostico, conDescricao, conBeneficios, conRiscos, conAlternativas, conRiscosNaoTrat, conProfNome, conProfCedula, conProfContacto, conData]);

  const printConsent = useCallback(() => {
    const html = buildConsentHTML();
    const w = window.open("", "_blank");
    if (!w) { alert("Permita pop-ups para gerar o documento."); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // dar tempo ao logótipo para carregar antes de imprimir
    setTimeout(() => { w.print(); }, 400);
  }, [buildConsentHTML]);

  // --- RENDER ---
  const renderTab = () => {
    switch (tab) {
      case 0: // Identificação
        return (
          <div>
            <Section title="Dados do Paciente">
              <Field label="Nome do Doente"><Input value={nomeDoente} onChange={setNomeDoente} placeholder="Nome completo" /></Field>
              <Field label="Nº de Processo / Utente"><Input value={processo} onChange={setProcesso} placeholder="ex: 1234567" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Idade"><Input value={idade} onChange={setIdade} placeholder="anos" type="number" /></Field>
                <Field label="Sexo">
                  <Select value={sexo} onChange={setSexo} placeholder="Selecionar" options={[{ value: "M", label: "Masculino" }, { value: "F", label: "Feminino" }]} />
                </Field>
              </div>
              <Field label="Especialidade Proponente"><Input value={especialidade} onChange={setEspecialidade} placeholder="ex: Ortopedia" /></Field>
              <Field label="Diagnóstico"><Textarea value={diagnostico} onChange={setDiagnostico} placeholder="Diagnóstico" /></Field>
              <Field label="Intervenção Proposta"><Textarea value={intervencao} onChange={setIntervencao} placeholder="Intervenção" /></Field>
              <Field label="Regime">
                <div className="flex gap-2">
                  {["internamento", "ambulatório"].map(r => (
                    <button key={r} onClick={() => setRegime(r)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${regime === r ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"}`}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
                  ))}
                </div>
              </Field>
            </Section>
          </div>
        );
      case 1: // Anamnese
        return (
          <div>
            <Section title="Antecedentes Patológicos">
              <Field label="Médicos"><Textarea value={antMedicos} onChange={setAntMedicos} placeholder="Antecedentes médicos..." rows={3} /></Field>
              <Field label="Cirúrgicos e Anestésicos"><Textarea value={antCirurgicos} onChange={setAntCirurgicos} placeholder="sem intercorrências anestésicas." rows={3} /></Field>
              <Field label="Transfusões de Sangue e Hemoderivados">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Toggle label="Aceita transfusões" value={transfusoes} onChange={setTransfusoes} />
                  <Toggle label="Contactos anteriores" value={transfusoesContactos} onChange={setTransfusoesContactos} />
                </div>
                <Input value={transfusoesNota} onChange={setTransfusoesNota} placeholder="Informação adicional..." />
              </Field>
            </Section>
            <Section title="Medicação e Alergias">
              <Field label="Medicação Habitual"><Textarea value={medicacao} onChange={setMedicacao} placeholder="Medicação habitual..." rows={3} /></Field>
              <Field label="Alergias">
                <div className="flex gap-2 items-start">
                  <Toggle label="Alergias conhecidas" value={alergias} onChange={setAlergias} />
                  {alergias && <Input value={alergiasTexto} onChange={setAlergiasTexto} placeholder="Especificar alergias..." className="flex-1" />}
                </div>
              </Field>
            </Section>
            <Section title="Hábitos">
              <div className="space-y-2">
                {[
                  ["Tabágicos", tabagismo, setTabagismo, tabagismoTexto, setTabagismoTexto],
                  ["Alcoólicos", alcool, setAlcool, alcoolTexto, setAlcoolTexto],
                  ["Toxicológicos", toxicos, setToxicos, toxicosTexto, setToxicosTexto],
                  ["Produtos de ervanária", ervanaria, setErvanaria, ervanariaTexto, setErvanariaTexto],
                ].map(([label, val, setVal, txt, setTxt]) => (
                  <div key={label} className="flex gap-2 items-start">
                    <Toggle label={label} value={val} onChange={setVal} />
                    {val && <Input value={txt} onChange={setTxt} placeholder="Detalhes..." className="flex-1" />}
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Sintomatologia">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Dispneia de esforço", dispneiaEsforco, setDispneiaEsforco],
                  ["Ortopneia", ortopneia, setOrtopneia],
                  ["DPN", dpn, setDpn],
                  ["Dor torácica", dorToracica, setDorToracica],
                  ["Palpitações", palpitacoes, setPalpitacoes],
                  ["Síncope", sincope, setSincope],
                  ["Edemas", edemas, setEdemas],
                  ["Hx hemorrágica", histHemorragica, setHistHemorragica],
                  ["Infeção resp. recente", infResp, setInfResp],
                  ...(sexo === "F" ? [["Gravidez", gravidez, setGravidez]] : []),
                ].map(([label, val, setVal]) => (
                  <Toggle key={label} label={label} value={val} onChange={setVal} />
                ))}
              </div>
            </Section>
          </div>
        );
      case 2: // Exame Objetivo
        return (
          <div>
            <Section title="Antropometria">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso (Kg)"><Input value={peso} onChange={setPeso} placeholder="Kg" type="number" /></Field>
                <Field label="Altura (cm)"><Input value={altura} onChange={setAltura} placeholder="cm" type="number" /></Field>
              </div>
              {(computedBMI || computedIdealWeight) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {computedBMI && <ScoreBadge label="IMC" value={`${computedBMI} Kg/m²`} color={parseFloat(computedBMI) > 30 ? "amber" : parseFloat(computedBMI) > 35 ? "red" : "green"} />}
                  {computedIdealWeight && <ScoreBadge label="Peso Ideal" value={`${computedIdealWeight} Kg`} color="slate" />}
                </div>
              )}
            </Section>
            <Section title="Sinais Vitais">
              <div className="grid grid-cols-2 gap-3">
                <Field label="TA (mmHg)"><Input value={ta} onChange={setTa} placeholder="120/80" /></Field>
                <Field label="FC (bpm)"><Input value={fc} onChange={setFc} placeholder="bpm" type="number" /></Field>
                <Field label="SpO2 (%)"><Input value={spo2} onChange={setSpo2} placeholder="%" type="number" /></Field>
                <Field label="Temp (ºC)"><Input value={temp} onChange={setTemp} placeholder="ºC" /></Field>
                <Field label="Dor"><Input value={dor} onChange={setDor} placeholder="0-10" /></Field>
              </div>
            </Section>
            <Section title="Auscultação">
              <Field label="AC"><Textarea value={ac} onChange={setAc} rows={1} /></Field>
              <Field label="AP"><Textarea value={ap} onChange={setAp} rows={2} /></Field>
              <Field label="Edemas / Insuficiência Venosa"><Textarea value={edemasExame} onChange={setEdemasExame} rows={1} /></Field>
            </Section>
            <Section title="Via Aérea">
              <Field label="Mallampati">
                <div className="flex gap-1">
                  {["I", "II", "III", "IV"].map(m => (
                    <button key={m} onClick={() => setMallampati(m)} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${mallampati === m ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"}`}>{m}</button>
                  ))}
                </div>
              </Field>
              <Field label="Descrição da Via Aérea"><Textarea value={vaTexto} onChange={setVaTexto} rows={3} /></Field>
            </Section>
          </div>
        );
      case 3: // ECD
        return (
          <div>
            <Section title="Exames Complementares de Diagnóstico">
              <Field label="Análises"><Textarea value={analises} onChange={setAnalises} rows={2} /></Field>
              <Field label="ECG"><Textarea value={ecg} onChange={setEcg} rows={2} /></Field>
              <Field label="Rx Tórax"><Textarea value={rxTorax} onChange={setRxTorax} rows={2} /></Field>
              <Field label="Exames Adicionais"><Textarea value={examesAdicionais} onChange={setExamesAdicionais} placeholder="Outros exames..." rows={3} /></Field>
            </Section>
          </div>
        );
      case 4: // Risco
        return (
          <div>
            <Section title="ASA">
              <Field label="Classificação ASA">
                <div className="flex gap-1 flex-wrap">
                  {["I", "II", "III", "IV", "V", "VI"].map(a => (
                    <button key={a} onClick={() => setAsa(a)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${asa === a ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"}`}>ASA {a}</button>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="NVPO — Apfel">
              <p className="text-xs text-slate-500 mb-2">Fatores automáticos: Sexo ({sexo === "F" ? "✓ Feminino" : "✗ Masculino"}), Tabagismo ({!tabagismo ? "✓ Não fumador" : "✗ Fumador"})</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Toggle label="NVPO/Cinetose prévia" value={apfelNVPO} onChange={setApfelNVPO} />
                <Toggle label="Opióides pós-op" value={apfelOpioides} onChange={setApfelOpioides} />
              </div>
              <ScoreBadge label={`Apfel ${apfelScore}/4`} value={apfelRisk.text} color={apfelRisk.color} />
            </Section>

            <Section title="Risco CV — Lee's RCRI">
              <div className="flex flex-wrap gap-2 mb-3">
                <Toggle label="Insuficiência Cardíaca" value={rcriIC} onChange={setRcriIC} />
                <Toggle label="AVC/AIT" value={rcriAVC} onChange={setRcriAVC} />
                <Toggle label="Coronariopatia" value={rcriCoronario} onChange={setRcriCoronario} />
                <Toggle label="DM insulinotratada" value={rcriDM} onChange={setRcriDM} />
                <Toggle label="Creatinina > 2mg/dl" value={rcriCreat} onChange={setRcriCreat} />
                <Toggle label="Cirurgia alto risco" value={rcriCirurgia} onChange={setRcriCirurgia} />
              </div>
              <ScoreBadge label={`RCRI ${rcriScore}/6`} value={rcriRisk.text} color={rcriRisk.color} />
            </Section>

            <Section title="Complicações Pulmonares — ARISCAT">
              <p className="text-xs text-slate-500 mb-2">Automático: Idade ({idade || "?"} anos), SpO2 ({spo2 || "?"}%)</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Toggle label="Hb < 10 g/dl" value={ariscatHb} onChange={setAriscatHb} />
                <Toggle label="Pneumonia < 1 mês" value={ariscatPneumonia} onChange={setAriscatPneumonia} />
                <Toggle label="Cirurgia emergente" value={ariscatEmergencia} onChange={setAriscatEmergencia} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Incisão cirúrgica">
                  <Select value={ariscatIncisao} onChange={setAriscatIncisao} options={[
                    { value: "nenhuma", label: "Periférica / Outra" },
                    { value: "abdominal_sup", label: "Abdominal superior" },
                    { value: "toracica", label: "Intratorácica" },
                  ]} />
                </Field>
                <Field label="Duração prevista">
                  <Select value={ariscatDuracao} onChange={setAriscatDuracao} options={[
                    { value: "curta", label: "< 2 horas" },
                    { value: "2a3h", label: "2-3 horas" },
                    { value: "mais3h", label: "> 3 horas" },
                  ]} />
                </Field>
              </div>
              <ScoreBadge label={`ARISCAT ${ariscatScore} pts`} value={ariscatRisk.text} color={ariscatRisk.color} />
            </Section>

            <Section title="SAOS — STOP-BANG">
              <p className="text-xs text-slate-500 mb-2">{"Automático: Sexo (" + (sexo === "M" ? "✓ Masculino" : "✗ Feminino") + "), Idade (" + (parseInt(idade) > 50 ? "✓" : "✗") + " >50), IMC (" + (parseFloat(computedBMI) > 35 ? "✓" : "✗") + " >35)"}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Toggle label="Ressona" value={sbRessona} onChange={setSbRessona} />
                <Toggle label="Cansaço diurno" value={sbCansaco} onChange={setSbCansaco} />
                <Toggle label="Apneias observadas" value={sbApneias} onChange={setSbApneias} />
                <Toggle label="HTA" value={sbHTA} onChange={setSbHTA} />
                <Toggle label="Pescoço > 40cm" value={sbPescoco} onChange={setSbPescoco} />
              </div>
              <ScoreBadge label={`STOP-BANG ${sbScore}/8`} value={sbRisk.text} color={sbRisk.color} />
            </Section>

            <Section title="Risco Tromboembólico — Caprini">
              <p className="text-xs text-slate-500 mb-3">Idade e IMC são calculados automaticamente a partir dos dados do paciente.</p>

              {/* Auto factors */}
              <div className="flex flex-wrap gap-2 mb-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 w-full font-semibold mb-0.5">Automático:</span>
                <ScoreBadge label="Idade" value={`${idade || "?"} anos → ${parseInt(idade) >= 75 ? "3 pts" : parseInt(idade) >= 61 ? "2 pts" : parseInt(idade) >= 41 ? "1 pt" : "0 pts"}`} color="slate" />
                <ScoreBadge label="IMC" value={`${computedBMI || "?"} → ${parseFloat(computedBMI) > 25 ? "1 pt" : "0 pts"}`} color="slate" />
              </div>

              {/* Tipo de cirurgia */}
              <Field label="Tipo de Cirurgia">
                <Select value={capCirurgia} onChange={setCapCirurgia} placeholder="Selecionar..." options={[
                  { value: "", label: "Nenhuma / N/A" },
                  { value: "minor", label: "Cirurgia minor (1 pt)" },
                  { value: "major", label: "Cirurgia major > 45min (2 pts)" },
                  { value: "laparoscopia", label: "Laparoscopia > 45min (2 pts)" },
                  { value: "artroscopia", label: "Artroscopia (2 pts)" },
                  { value: "artroplastia", label: "Artroplastia eletiva (5 pts)" },
                ]} />
              </Field>

              {/* Mobilidade */}
              <Field label="Mobilidade">
                <Select value={capMobilidade} onChange={setCapMobilidade} placeholder="Normal" options={[
                  { value: "", label: "Normal / Ambulatório" },
                  { value: "acamado", label: "Doente acamado (1 pt)" },
                  { value: "acamado72", label: "Acamado > 72h (2 pts)" },
                  { value: "gesso", label: "Imobilização gessada (2 pts)" },
                ]} />
              </Field>

              {/* Antecedentes médicos */}
              <Field label="Antecedentes Médicos (1 pt cada)">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ["varizes", "Varizes"], ["edema", "Edema MI"], ["ic", "IC"],
                    ["eam", "EAM"], ["sepsis", "Sépsis <1m"], ["dpoc", "DPOC"], ["dii", "DII"],
                  ].map(([k, l]) => (
                    <Toggle key={k} label={l} value={!!capMedico[k]} onChange={v => setCapMedico(p => ({ ...p, [k]: v }))} />
                  ))}
                </div>
              </Field>
              <Field label="Outros fatores médicos (2 pts cada)">
                <div className="flex flex-wrap gap-1.5">
                  <Toggle label="Neoplasia" value={!!capMedico.neoplasia} onChange={v => setCapMedico(p => ({ ...p, neoplasia: v }))} />
                  <Toggle label="CVC" value={!!capMedico.cvc} onChange={v => setCapMedico(p => ({ ...p, cvc: v }))} />
                </div>
              </Field>

              {/* Feminino */}
              {sexo === "F" && (
                <Field label="Fatores femininos (1 pt cada)">
                  <div className="flex flex-wrap gap-1.5">
                    <Toggle label="Gravidez / Pós-parto" value={!!capFeminino.gravidez_pp} onChange={v => setCapFeminino(p => ({ ...p, gravidez_pp: v }))} />
                    <Toggle label="ACO / THS" value={!!capFeminino.aco} onChange={v => setCapFeminino(p => ({ ...p, aco: v }))} />
                  </div>
                </Field>
              )}

              {/* Trombose */}
              <Field label="Hx Trombótica (3 pts cada)">
                <div className="flex flex-wrap gap-1.5">
                  <Toggle label="DVT / EP prévia" value={!!capTrombose.dvt_pe} onChange={v => setCapTrombose(p => ({ ...p, dvt_pe: v }))} />
                  <Toggle label="Hx familiar trombose" value={!!capTrombose.fam} onChange={v => setCapTrombose(p => ({ ...p, fam: v }))} />
                  <Toggle label="Trombofilia conhecida" value={!!capTrombose.trombofilia} onChange={v => setCapTrombose(p => ({ ...p, trombofilia: v }))} />
                </div>
              </Field>

              {/* Eventos agudos */}
              <Field label="Eventos Agudos (5 pts cada)">
                <div className="flex flex-wrap gap-1.5">
                  <Toggle label="AVC < 1 mês" value={!!capAgudo.avc_1m} onChange={v => setCapAgudo(p => ({ ...p, avc_1m: v }))} />
                  <Toggle label="Fratura anca/pelve/MI" value={!!capAgudo.fx_mi} onChange={v => setCapAgudo(p => ({ ...p, fx_mi: v }))} />
                  <Toggle label="Lesão medular aguda" value={!!capAgudo.lesao_medular} onChange={v => setCapAgudo(p => ({ ...p, lesao_medular: v }))} />
                </div>
              </Field>

              {/* Score total */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <ScoreBadge label={`Caprini ${computedCaprini}`} value={capriniRisk.text} color={capriniRisk.color} />
                <span className="text-xs text-slate-400">0-1 Baixo · 2 Moderado · 3-4 Alto · ≥5 Muito Alto</span>
              </div>
            </Section>

            <Section title="Outros">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Risco de VAD">
                  <Select value={riscoVAD} onChange={setRiscoVAD} placeholder="Selecionar" options={["Baixo", "Intermédio", "Alto"]} />
                </Field>
                <Field label="Risco de Aspiração">
                  <Select value={riscoAspiracao} onChange={setRiscoAspiracao} placeholder="Selecionar" options={["Baixo", "Intermédio", "Alto"]} />
                </Field>
                <Field label="Capacidade Funcional (METs)">
                  <Select value={mets} onChange={setMets} placeholder="Selecionar" options={[
                    { value: ">10", label: "> 10 METs (Excelente)" },
                    { value: "7-10", label: "7-10 METs (Bom)" },
                    { value: "4-6", label: "4-6 METs (Moderado)" },
                    { value: "<4", label: "< 4 METs (Baixo)" },
                  ]} />
                </Field>
              </div>
            </Section>
          </div>
        );
      case 5: // Recomendações
        return (
          <div>
            <Section title="Recomendações Pré-Operatórias">
              <Field label="Jejum pré-operatório"><Textarea value={recJejum} onChange={setRecJejum} rows={1} /></Field>
              <Field label="Bebida rica em HC"><Textarea value={recHC} onChange={setRecHC} rows={1} /></Field>
              <Field label="Alterações à MH">
                <div className="flex gap-2 mb-2">
                  {["mantém", "suspende"].map(o => (
                    <button key={o} onClick={() => setRecMH(o)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${recMH === o ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-300"}`}>{o.charAt(0).toUpperCase() + o.slice(1)}</button>
                  ))}
                </div>
                <Input value={recMH} onChange={setRecMH} placeholder="Detalhes..." />
              </Field>
              <Field label="Profilaxia de aspiração"><Input value={recAspiracao} onChange={setRecAspiracao} /></Field>
              <Field label="Medicação pré-anestésica"><Input value={recPreMed} onChange={setRecPreMed} /></Field>
              <Field label="Profilaxia tromboembólica"><Textarea value={recTromboprofilaxia} onChange={setRecTromboprofilaxia} rows={4} /></Field>
              <Field label="Classificação sanguínea e reserva de hemoderivados"><Input value={recSangue} onChange={setRecSangue} placeholder="-" /></Field>
              <Field label="Punção e soros"><Textarea value={recPuncao} onChange={setRecPuncao} rows={2} /></Field>
              <Field label="Antibioterapia"><Textarea value={recATB} onChange={setRecATB} rows={2} /></Field>
              <Field label="Cuidados pós-operatórios"><Textarea value={recPosOp} onChange={setRecPosOp} rows={2} /></Field>
              <Field label="Outras recomendações"><Textarea value={recOutras} onChange={setRecOutras} rows={2} /></Field>
            </Section>
          </div>
        );
      case 6: // Relatório
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Relatório Final</h3>
              <button onClick={copyReport} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied ? "bg-green-600 text-white" : "bg-sky-600 text-white hover:bg-sky-700"}`}>
                {copied ? "✓ Copiado!" : "Copiar Relatório"}
              </button>
            </div>
            {alergias && (
              <div className="mb-3 p-3 rounded-xl border-2 border-red-400 bg-red-50 flex items-center gap-2">
                <span className="text-red-600 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-red-700">ALERTA — ALERGIAS CONHECIDAS</p>
                  <p className="text-xs text-red-600">{alergiasTexto || "Ver detalhes na anamnese"}</p>
                </div>
              </div>
            )}
            <pre className="bg-white border border-slate-200 rounded-xl p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono text-slate-800 max-h-[70vh] overflow-y-auto">{generateReport()}</pre>
          </div>
        );
      case 7: // Consentimento
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Consentimento Informado</h3>
              <button onClick={printConsent} disabled={tecnicas.length === 0} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tecnicas.length === 0 ? "bg-slate-100 text-slate-300" : "bg-sky-600 text-white hover:bg-sky-700"}`}>
                🖨️ Imprimir / Guardar PDF
              </button>
            </div>

            <Section title="Técnica Anestésica">
              <p className="text-xs text-slate-500 mb-2">Selecione uma ou mais técnicas. Os campos abaixo são preenchidos automaticamente e podem ser editados.</p>
              <div className="flex flex-wrap gap-1.5">
                {TECNICAS.map(t => (
                  <Toggle key={t.key} label={t.label} value={tecnicas.includes(t.key)} onChange={() => toggleTecnica(t.key)} />
                ))}
              </div>
              {tecnicas.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">Selecione pelo menos uma técnica para gerar o documento.</p>
              )}
            </Section>

            {tecnicas.length > 0 && (
              <Section title="Conteúdo do Documento (editável)">
                <Field label="Diagnóstico e/ou descrição da situação clínica">
                  <Textarea value={conDiagnostico} onChange={setConDiagnostico} rows={2} placeholder="Preenchido a partir do diagnóstico da consulta..." />
                </Field>
                <Field label="Descrição do ato/intervenção, sua natureza e objetivo">
                  <Textarea value={conDescricao} onChange={v => { setConDescricao(v); setConsentEdited(true); }} rows={5} />
                </Field>
                <Field label="Benefícios">
                  <Textarea value={conBeneficios} onChange={v => { setConBeneficios(v); setConsentEdited(true); }} rows={3} />
                </Field>
                <Field label="Riscos graves e riscos frequentes">
                  <Textarea value={conRiscos} onChange={v => { setConRiscos(v); setConsentEdited(true); }} rows={7} />
                </Field>
                <Field label="Atos/intervenções alternativas fiáveis e cientificamente reconhecidas">
                  <Textarea value={conAlternativas} onChange={v => { setConAlternativas(v); setConsentEdited(true); }} rows={2} />
                </Field>
                <Field label="Riscos de não tratamento">
                  <Textarea value={conRiscosNaoTrat} onChange={v => { setConRiscosNaoTrat(v); setConsentEdited(true); }} rows={2} />
                </Field>
                <button onClick={() => toggleTecnica("__noop__")} className="hidden" />
                <div className="mt-1 mb-4">
                  <button
                    onClick={() => {
                      const c = composeConsent(tecnicas);
                      setConDescricao(c.descricao); setConBeneficios(c.beneficios);
                      setConRiscos(c.riscos); setConAlternativas(c.alternativas);
                      setConRiscosNaoTrat(c.riscosNaoTratamento); setConsentEdited(false);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:border-sky-400 transition-all"
                  >
                    ↺ Repor textos pré-definidos
                  </button>
                  {consentEdited && <span className="text-xs text-amber-600 ml-2">Textos editados manualmente</span>}
                </div>
              </Section>
            )}

            {tecnicas.length > 0 && (
              <Section title="Identificação do Profissional">
                <Field label="Nome legível do profissional de saúde"><Input value={conProfNome} onChange={setConProfNome} placeholder="Nome do médico anestesiologista" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nº Cédula / Mecanográfico"><Input value={conProfCedula} onChange={setConProfCedula} placeholder="ex: 12345" /></Field>
                  <Field label="Data"><Input value={conData} onChange={setConData} placeholder="DD/MM/AAAA" /></Field>
                </div>
                <Field label="Contacto institucional"><Input value={conProfContacto} onChange={setConProfContacto} placeholder="Serviço de Anestesiologia — CHUC" /></Field>
              </Section>
            )}

            {tecnicas.length > 0 && (
              <div className="p-3 rounded-xl border border-sky-200 bg-sky-50 text-xs text-sky-800">
                O documento gera em duas páginas no modelo do CHUC, com o logótipo e os campos de assinatura. Abre numa nova janela pronta a imprimir ou guardar como PDF.
                {!nomeDoente && <span className="block mt-1 text-amber-700">Sugestão: preencha o nome do doente na tab «Identificação» para constar no documento.</span>}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 p-3">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 pt-2">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Consulta Pré-Anestésica</h1>
          <p className="text-xs text-slate-400">Avaliação Anestésica — Modelo 2024</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-4 bg-slate-200 rounded-xl p-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${tab === i ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200 p-4">
          {renderTab()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4 mb-6">
          <button onClick={() => setTab(Math.max(0, tab - 1))} disabled={tab === 0} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 0 ? "bg-slate-100 text-slate-300" : "bg-white text-slate-600 border border-slate-300 hover:border-sky-400"}`}>
            ← Anterior
          </button>
          <span className="text-xs text-slate-400 self-center">{tab + 1} / {TABS.length}</span>
          <button onClick={() => setTab(Math.min(TABS.length - 1, tab + 1))} disabled={tab === TABS.length - 1} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === TABS.length - 1 ? "bg-slate-100 text-slate-300" : "bg-sky-600 text-white hover:bg-sky-700"}`}>
            Seguinte →
          </button>
        </div>
      </div>
    </div>
  );
}
