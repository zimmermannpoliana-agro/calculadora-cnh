/* Portfólio BR CNH — fonte: planilha "Portfólio BR CNH" + prints enviados pelo time.
   Marcas: "nh" = New Holland, "case" = Case IH. `null` = a marca não tem o produto. */

export const MARCAS = [
  { value: "nh", label: "New Holland" },
  { value: "case", label: "Case IH" },
];

/* ---------- TRATORES ----------
   cv = potência nominal · vazao = opções de vazão hidráulica (l/min); mais de uma = opcional na hora do pedido */
const T = (plataforma, serie, nh, caseIh, cv, vazao) => ({ plataforma, serie, nh, case: caseIh, cv, vazao: Array.isArray(vazao) ? vazao : [vazao] });

export const TRATORES = [
  T("APL", "TT3", "TT3.50", null, 50, 38),
  T("APL", "T3 F", "T3.65F", null, 66, 52),
  T("APL", "T3 F", "T3.75F", null, 73, 52),
  T("APL", "TT e TTF", "TT.55", null, 55, 41),
  T("APL", "TT e TTF", "TT.65", null, 66, 41),
  T("APL", "TT e TTF", "TT.75", null, 75, 41),
  T("APL", "TT e TTF", "TT.75F", null, 75, 41),
  T("APL", "T4S", "T4.75S", null, 76, 48),
  T("APL", "TT4", "TT4.75", null, 75, 54),
  T("APL", "TT4", "TT4.90", null, 90, 54),
  T("APL", "TL5", "TL5.80", "Farmall 80", 82, 44.5),
  T("APL", "TL5", "TL5.90", "Farmall 90", 91, 44.5),
  T("APL", "TL5", "TL5.100", "Farmall 100", 102, 44.5),
  T("APL", "T5", "T5.100", "Farmall 100 C", 100, 62),
  T("APL", "T5", "T5.110", "Farmall 110 C", 110, 62),
  T("APH", "Série 30", "7630", null, 111, 80),
  T("APH", "Série 30", "8030", null, 124, 80),
  T("APH", "T6", "T6.120", "Farmall 120 A", 122, [80, 100]),
  T("APH", "T6", "T6.130", "Farmall 130 A", 132, [80, 100]),
  T("APH", "T6.140", "T6.140", "Farmall Max 140", 141, 113),
  T("CCM SWB", "T6 Methane", "T6.180", null, 150, 113),
  T("CCM SWB", "T7 SWB", "T7.175", "Puma 140", 141, [113, 150]),
  T("CCM SWB", "T7 SWB", "T7.190", "Puma 155", 155, [113, 150]),
  T("CCM SWB", "T7 SWB", "T7.195", "Puma 170", 167, 150),
  T("CCM SWB", "T7 SWB", "T7.205", "Puma 185", 182, 150),
  T("CCM LWB", "T7 LWB", "T7.240", "Puma 200", 197, 180),
  T("CCM LWB", "T7 LWB", "T7.245", "Puma 215", 212, 180),
  T("CCM LWB", "T7 LWB", "T7.260", "Puma 230", 240, 180),
  T("CCM CVT", "T7 CVT", "T7.300", "Puma 260 CVX", 260, 170),
  T("CCH", "T8", "T8.320", "Magnum 265", 265, 212),
  T("CCH", "T8", "T8.350", "Magnum 295", 295, 212),
  T("CCH", "T8", "T8.380", "Magnum 325", 325, 212),
  T("CCH", "T8", "T8.410", "Magnum 355", 355, 333),
  T("CCH", "T8", "T8.430", "Magnum 380", 380, 333),
  T("CCH", "T8", "T8.440", "Magnum 405", 412, 333),
  T("4WD", "T9", "T9.470", "Steiger 425", 431, 427),
  T("4WD", "T9", "T9.520", "Steiger 475", 482, 427),
  T("4WD", "T9", "T9.580", "Steiger 525", 532, 427),
  T("4WD", "T9", "T9.615", "Steiger 555", 563, 427),
  T("4WD", "T9", null, "Steiger 595", 603, 427),
  T("4WD", "T9", "T9.700", "Steiger 645", 654, 427),
  T("4WD", "Quadtrac", null, "Quadtrac 500", 507, 427),
  T("4WD", "Quadtrac", null, "Quadtrac 620", 629, 427),
];

/* ---------- PLANTADEIRAS ----------
   linhas = nº de linhas por espaçamento (cm). Número = fixo · array = mais de uma configuração possível.
   Sem a chave = o modelo não é oferecido naquele espaçamento. */
const P = (linha, nh, caseIh, linhas) => ({ linha, nh, case: caseIh, linhas });

export const PLANTADEIRAS = [
  // PL4000 — R = chassi rígido · sem R = articulado
  P("PL4000", "PL4007R", null, { 45: 7, 50: 6 }),
  P("PL4000", "PL4009R", null, { 45: 9, 50: 8 }),
  P("PL4000", "PL4011R", null, { 45: 11, 50: 10 }),
  P("PL4000", "PL4011", null, { 45: 11, 50: 10 }),
  P("PL4000", "PL4013", null, { 45: 13, 50: 12 }),
  P("PL4000", "PL4015", null, { 45: 15, 50: 14 }),
  P("PL4000", "PL4007RL", null, { 45: 7, 50: 6 }),
  P("PL4000", "PL4008RL", null, { 45: 8, 50: 7 }),
  P("PL4000", "PL4009RL", null, { 45: 9, 50: 8 }),
  P("PL4000", "PL4010RL", null, { 45: 10, 50: 9 }),
  P("PL4000", "PL4011RL", null, { 45: 11, 50: 10 }),
  P("PL4000", "PL4012RL", null, { 45: 12, 50: 11 }),
  P("PL4000", "PL4009R Amendoim", null, { 90: 4 }),
  P("PL4000", "PL4011R Amendoim", null, { 90: 6 }),
  P("PL4000", "PL4015R Amendoim", null, { 90: 8 }),

  // PL6000 / Easy Riser 3200
  P("PL6000", "PL6011", "Easy Riser 3211", { 45: 11, 50: 11 }),
  P("PL6000", "PL6013", "Easy Riser 3213", { 45: 13, 50: 12 }),
  P("PL6000", "PL6014", "Easy Riser 3214", { 50: 13 }),
  P("PL6000", "PL6015", "Easy Riser 3215", { 45: 15, 50: 14 }),
  P("PL6000", "PL6016", "Easy Riser 3216", { 50: 15 }),
  P("PL6000", "PL6017", "Easy Riser 3217", { 45: 17, 50: 16 }),
  P("PL6000", "PL6019", "Easy Riser 3219", { 45: 19, 50: 17 }),
  P("PL6000", "PL6024", "Easy Riser 3224", { 45: [22, 24], 50: 22 }),
  P("PL6000", "PL6026", "Easy Riser 3226", { 50: 26 }),
  P("PL6000", "PL6028", "Easy Riser 3228", { 45: 28, 50: 24 }),
  P("PL6000", "PL6030", "Easy Riser 3230", { 50: 26 }),
  P("PL6000", "PL6032", "Easy Riser 3232", { 45: 32, 50: 28 }),
  P("PL6000", "PL6034", "Easy Riser 3234", { 50: 30 }),
  P("PL6000", "PL6036", "Easy Riser 3236", { 45: 36, 50: 32 }),

  // P7000 / Fast Riser 6100
  P("P7000", "PL7027", "Fast Riser 6127", { 45: 27, 50: 24, 76: 12, 90: 12 }),
  P("P7000", "PL7036", "Fast Riser 6136", { 45: 36, 50: 34, 76: 18, 90: 18 }),
  P("P7000", "PL7040", "Fast Riser 6140", { 45: 40, 50: 38, 76: 24, 90: 20 }),
  P("P7000", "PL7048", "Fast Riser 6148", { 45: 48, 50: 45, 76: 30, 90: 24 }),
  P("P7000", "PL7061", "Fast Riser 6161", { 45: 61, 50: 55, 76: 36, 90: 30 }),
];

/* ---------- REQUISITOS DE POTÊNCIA E VAZÃO ----------
   Potência = cv/linha da ferramenta de adubo × nº de linhas. Os ranges (min–max) cobrem tipo de solo
   (arenoso = menos, argiloso = mais), declividade e ondulação. Não são limites: podem ser ultrapassados.
   P3000 (semeadora de fluxo contínuo, grãos finos) fica fora: não é foco do app por enquanto. */
export const FERRAMENTAS = {
  PL4000: [
    { id: "turbo", label: "Disco turbo", min: 8, max: 8 },
    { id: "duplo", label: "Disco duplo defasado", min: 10, max: 10 },
    { id: "facao", label: "Facão aproximado (guilhotina)", min: 12, max: 12 },
    { id: "haste", label: "Haste sulcadora", min: 14, max: 14 },
  ],
  PL6000: [
    { id: "duplo", label: "Disco duplo", min: 10.5, max: 12 },
    { id: "haste", label: "Haste sulcadora", min: 13, max: 16 },
  ],
  P7000: [{ id: "sem", label: "Sem adubo", min: 7.5, max: 9.5 }],
};

const VAZAO_P7000 = { // l/min
  PL7027: { plantio: 90, manobra: 120 },
  PL7036: { plantio: 120, manobra: 160 },
  PL7040: { plantio: 120, manobra: 160 },
  PL7048: { plantio: 150, manobra: 230 },
  PL7061: { plantio: 150, manobra: 230 },
};

/** `plantadeira` = item de PLANTADEIRAS · `opcoes` = { ferramenta, turbina (PL4000), taxaVar (PL6000) }.
 *  Retorna null se não há dados para a linha. Vazão 0 = não exige (só potência). */
export function requisitosPlantadeira(plantadeira, linhas, { ferramenta, turbina, taxaVar }) {
  const lista = FERRAMENTAS[plantadeira.linha];
  if (!lista) return null;
  const f = lista.find((x) => x.id === ferramenta) || lista[0];
  let plantio = 0, manobra = 0;
  if (plantadeira.linha === "PL4000") {
    plantio = manobra = turbina ? 30 : 0; // sem turbina a vácuo, o óleo só serve levante/marcadores
  } else if (plantadeira.linha === "PL6000") {
    const n = Number(plantadeira.nh.slice(2));
    const [sem, com] = n <= 19 ? [111, 141] : n <= 32 ? [168, 198] : [208, 238];
    plantio = manobra = taxaVar ? com : sem;
  } else if (plantadeira.linha === "P7000") {
    ({ plantio, manobra } = VAZAO_P7000[plantadeira.nh]);
  }
  return { ferramenta: f, cvMin: f.min * linhas, cvMax: f.max * linhas, plantio, manobra };
}

/** Avalia um trator (com a vazão escolhida, em l/min) contra os requisitos de uma plantadeira.
 *  cvNivel: "ok" (≥ máx da faixa) | "limite" (entre mín e máx — depende de solo/terreno) | "no" (< mín)
 *  vzNivel: "livre" (sem exigência) | "ok" (≥ manobra) | "plantio" (só atende o plantio) | "no"
 *  veredito: "ok" | "limite" (compatível com ressalvas) | "no" */
export function avaliarConjunto(trator, vazaoTrator, req) {
  const cvNivel = trator.cv >= req.cvMax ? "ok" : trator.cv >= req.cvMin ? "limite" : "no";
  const vzNivel = req.plantio === 0 ? "livre" : vazaoTrator >= req.manobra ? "ok" : vazaoTrator >= req.plantio ? "plantio" : "no";
  const veredito = cvNivel === "no" || vzNivel === "no" ? "no" : cvNivel === "ok" && (vzNivel === "ok" || vzNivel === "livre") ? "ok" : "limite";
  return { cvNivel, vzNivel, veredito };
}
