import React, { useState, useEffect, useCallback } from "react";
import { Activity, Disc, Tractor, FlaskConical, Save, Download, History, Trash2, Plus, X, ChevronDown, Info } from "lucide-react";

/* ---------- helpers ---------- */
const fmtBRL = (v) => (isFinite(v) ? v : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
const fmtNum = (v, d = 2) => (isFinite(v) ? v : 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayStr = () => new Date().toLocaleDateString("pt-BR");

async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), false); return true; }
  catch (e) { console.error("storage set failed", e); return false; }
}
async function storageList(prefix) {
  try { const r = await window.storage.list(prefix, false); return r ? r.keys : []; }
  catch (e) { return []; }
}
async function storageGet(key) {
  try { const r = await window.storage.get(key, false); return r ? JSON.parse(r.value) : null; }
  catch (e) { return null; }
}
async function storageDelete(key) {
  try { await window.storage.delete(key, false); return true; }
  catch (e) { return false; }
}

/* ---------- shared UI ---------- */
function Field({ label, value, onChange, suffix, step = 1, min, hint, type = "number" }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-row">
        <input
          type={type}
          className="field-input"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? 0 : parseFloat(e.target.value)) : e.target.value)}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} type="button" className={"seg-btn" + (value === o.value ? " active" : "")} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={"stat" + (tone ? " tone-" + tone : "")}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function HistoryPanel({ tabId, record, onLoad, refreshToken }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const keys = await storageList(`hist:${tabId}:`);
    const recs = await Promise.all(keys.map((k) => storageGet(k)));
    const valid = recs.filter(Boolean).sort((a, b) => b.ts - a.ts);
    setItems(valid);
  }, [tabId]);

  useEffect(() => { if (open) load(); }, [open, load, refreshToken]);

  const handleSave = async () => {
    setSaving(true);
    const id = uid();
    const rec = { id, ts: Date.now(), date: todayStr(), ...record };
    await storageSet(`hist:${tabId}:${id}`, rec);
    setSaving(false);
    if (open) load();
  };

  const handleDelete = async (id) => {
    await storageDelete(`hist:${tabId}:${id}`);
    load();
  };

  return (
    <div className="history-block no-print">
      <div className="history-actions">
        <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? "Salvando..." : "Salvar no app"}
        </button>
        <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)}>
          <History size={14} /> Histórico ({items.length || ""}) <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>
      </div>
      {open && (
        <div className="history-list">
          {items.length === 0 && <div className="history-empty">Nenhum cálculo salvo ainda.</div>}
          {items.map((it) => (
            <div key={it.id} className="history-item">
              <div className="history-item-main" onClick={() => onLoad(it)}>
                <span className="history-item-title">{it.label || "Sem referência"}</span>
                <span className="history-item-sub">{it.date}</span>
              </div>
              <button className="icon-btn" onClick={() => handleDelete(it.id)} aria-label="Excluir">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabHeader({ icon: Icon, eyebrow, title, description, cliente, setCliente }) {
  return (
    <div className="tab-header">
      <div className="tab-header-top">
        <div className="tab-icon"><Icon size={20} strokeWidth={1.8} /></div>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
        </div>
      </div>
      <p className="tab-desc">{description}</p>
      <div className="cliente-row">
        <Field label="Cliente / talhão de referência" value={cliente} onChange={setCliente} type="text" />
      </div>
    </div>
  );
}

/* ================= TAB 1 — PLANTABILIDADE (CV / falhas / duplos) ================= */
const CV_REF_POR_CULTURA = { soja: 50, milho: 30 };

function TabPlantabilidade() {
  const [cliente, setCliente] = useState("");
  const [cultura, setCultura] = useState("soja");
  const [sementesM, setSementesM] = useState(12);
  const [espLinha, setEspLinha] = useState(0.45);
  const [posicoes, setPosicoes] = useState([]);
  const [novaPosicao, setNovaPosicao] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [cvRef, setCvRef] = useState(CV_REF_POR_CULTURA.soja);
  const [precoSaca, setPrecoSaca] = useState(63);
  const [areaProp, setAreaProp] = useState(500);

  const trocarCultura = (c) => { setCultura(c); setCvRef(CV_REF_POR_CULTURA[c]); };

  const populacaoHa = espLinha > 0 ? (sementesM * 10000) / espLinha : 0;
  const mLinearHa = espLinha > 0 ? 10000 / espLinha : 0;
  const espRefCm = sementesM > 0 ? 100 / sementesM : 0;

  const addPosicao = () => {
    const v = parseFloat(novaPosicao);
    const last = posicoes.length ? posicoes[posicoes.length - 1] : 0;
    if (!isNaN(v) && v > last) { setPosicoes([...posicoes, v]); setNovaPosicao(""); }
  };
  const removePosicao = (i) => setPosicoes(posicoes.filter((_, idx) => idx !== i));

  const amostras = posicoes.map((p, i) => p - (i === 0 ? 0 : posicoes[i - 1]));

  const n = amostras.length;
  const media = n ? amostras.reduce((a, b) => a + b, 0) / n : 0;
  const dv = n > 1 ? Math.sqrt(amostras.reduce((a, b) => a + (b - media) ** 2, 0) / (n - 1)) : 0;
  const cv = media > 0 ? (dv / media) * 100 : 0;

  const classe = (v) => {
    if (espRefCm <= 0) return "aceitavel";
    if (v > 1.5 * espRefCm) return "falha";
    if (v < 0.5 * espRefCm) return "duplo";
    return "aceitavel";
  };
  const falhas = amostras.filter((v) => classe(v) === "falha").length;
  const duplos = amostras.filter((v) => classe(v) === "duplo").length;
  const aceitaveis = n - falhas - duplos;
  const pct = (x) => (n ? (x / n) * 100 : 0);

  const gPorUnidade = cultura === "soja" ? 20 : 200;
  const unidadeLabel = cultura === "soja" ? "pé de soja" : "espiga de milho";
  const falhaMedidaPct = pct(falhas) / 100;
  const plantasPerdidasHa = populacaoHa * falhaMedidaPct;
  const perdaKgHa = (plantasPerdidasHa * gPorUnidade) / 1000;
  const perdaSacasHa = perdaKgHa / 60;
  const perdaRsHa = perdaSacasHa * precoSaca;
  const perdaTotal = perdaRsHa * areaProp;

  const loadRecord = (rec) => {
    setCliente(rec.cliente ?? "");
    setCultura(rec.cultura ?? "soja");
    setSementesM(rec.sementesM ?? 12);
    setEspLinha(rec.espLinha ?? 0.45);
    setPosicoes(rec.posicoes ?? []);
    setCvRef(rec.cvRef ?? CV_REF_POR_CULTURA[rec.cultura ?? "soja"]);
    setPrecoSaca(rec.precoSaca ?? 63);
    setAreaProp(rec.areaProp ?? 500);
  };

  return (
    <div className="module">
      <TabHeader icon={Activity} eyebrow="Aba 01" title="Plantabilidade — CV, falhas e duplos"
        description="Registre os espaçamentos medidos no teste de estande e obtenha o CV%, o percentual de falhas e de duplos frente ao espaçamento de referência."
        cliente={cliente} setCliente={setCliente} />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Parâmetros da linha</div>
          <div className="cultura-row">
            <span className="field-label">Cultura</span>
            <Segmented value={cultura} onChange={trocarCultura} options={[{ value: "soja", label: "Soja" }, { value: "milho", label: "Milho" }]} />
          </div>
          <div className="card-grid">
            <Field label="Sementes por metro" value={sementesM} onChange={setSementesM} suffix="sem/m" step={0.1} />
            <Field label="Espaçamento entrelinhas" value={espLinha} onChange={setEspLinha} suffix="m" step={0.01} />
          </div>
          <div className="mini-stats">
            <Stat label="População/ha" value={fmtNum(populacaoHa, 0)} />
            <Stat label="m Linear/ha" value={fmtNum(mLinearHa, 0)} />
            <Stat label="Esp. referência" value={fmtNum(espRefCm, 1) + " cm"} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Medições de campo — leitura na trena</div>
          <p className="card-note">Alinhe a primeira semente no 0 da trena esticada sobre a linha e informe a posição acumulada de cada semente seguinte (ex.: 22, 54, 79, 94, 125, 147...). O espaçamento entre sementes é calculado automaticamente pela diferença entre posições consecutivas.</p>
          <div className="add-row">
            <input
              type="number" className="field-input" placeholder="Posição na trena (cm)"
              value={novaPosicao} onChange={(e) => setNovaPosicao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPosicao()}
            />
            <button className="btn btn-primary" onClick={addPosicao}><Plus size={14} /> Add</button>
          </div>
          <div className="chips">
            {posicoes.map((p, i) => (
              <span key={i} className={"chip chip-" + classe(amostras[i])}>
                {fmtNum(p, 0)} cm <span className="chip-delta">Δ{fmtNum(amostras[i], 0)}</span>
                <X size={11} onClick={() => removePosicao(i)} />
              </span>
            ))}
            {posicoes.length === 0 && <span className="empty-note">Nenhuma posição adicionada ainda.</span>}
          </div>
        </div>
      </div>

      <div className="result-band">
        <Stat label="Amostras" value={n} />
        <Stat label="Média" value={fmtNum(media, 1) + " cm"} />
        <Stat label="Desvio padrão" value={fmtNum(dv, 1)} />
        <Stat label="CV" value={fmtNum(cv, 1) + "%"} tone={cv > cvRef ? "red" : "blue"} />
        <Stat label="Aceitáveis" value={fmtNum(pct(aceitaveis), 0) + "%"} tone="blue" />
        <Stat label="Falhas" value={fmtNum(pct(falhas), 0) + "%"} tone="red" />
        <Stat label="Duplos" value={fmtNum(pct(duplos), 0) + "%"} tone="red" />
      </div>
      <div className="alert-note">
        <Info size={14} />
        <span>Direcionamento de mercado — não é uma regra fixa: CV até <strong>~50%</strong> para soja e até <strong>~30%</strong> para milho costuma ser aceitável. Cada operação pode ter seu próprio padrão técnico.</span>
      </div>
      <div className="ref-row no-print">
        <Field label="CV de referência do consultor" value={cvRef} onChange={setCvRef} suffix="%" step={1} hint="Ajuste conforme o padrão técnico adotado — define a cor do CV acima." />
      </div>

      <div className="card">
        <div className="card-title">Monetização do teste medido</div>
        <p className="card-note">Converte o % de falhas efetivamente medido acima em R$, usando a mesma referência de peso por {unidadeLabel} da aba de disco — independente do cálculo teórico de 1 falha por volta.</p>
        <div className="card-grid">
          <Field label="Preço da saca no dia" value={precoSaca} onChange={setPrecoSaca} suffix="R$" step={0.5} />
          <Field label="Tamanho da propriedade" value={areaProp} onChange={setAreaProp} suffix="ha" />
        </div>
        <div className="result-band" style={{ marginTop: 14, marginBottom: 0 }}>
          <Stat label="Falha medida em campo" value={fmtNum(pct(falhas), 1) + "%"} tone={n ? "red" : undefined} />
          <Stat label="Plantas perdidas" value={fmtNum(plantasPerdidasHa, 0) + " pl/ha"} />
          <Stat label="Perda por hectare" value={fmtBRL(perdaRsHa)} tone={perdaRsHa > 0 ? "red" : undefined} />
          <Stat label="Perda total na propriedade" value={fmtBRL(perdaTotal)} tone={perdaTotal > 0 ? "red" : undefined} />
        </div>
      </div>

      <PrintFoot text="Classificação: falha = espaçamento > 1,5x a referência · duplo = espaçamento < 0,5x a referência · aceitável = entre esses limites (metodologia de teste de estande)." />

      <HistoryPanel tabId="plantabilidade" refreshToken={refresh}
        record={{ label: cliente || `Teste ${todayStr()}`, cliente, cultura, sementesM, espLinha, posicoes, cvRef, precoSaca, areaProp }}
        onLoad={loadRecord} />
      <PrintButton />
    </div>
  );
}

/* ================= TAB 2 — PERDA POR FALHA DO DISCO ================= */
function TabDisco() {
  const [cliente, setCliente] = useState("");
  const [cultura, setCultura] = useState("milho");
  const [sementesM, setSementesM] = useState(3);
  const [espLinha, setEspLinha] = useState(0.45);
  const [preco, setPreco] = useState(63);
  const [area, setArea] = useState(500);

  const furos = cultura === "soja" ? 56 : 27;
  const gPorUnidade = cultura === "soja" ? 20 : 200;
  const unidadeLabel = cultura === "soja" ? "pé de soja" : "espiga de milho";
  const sacaKg = 60;

  const voltaDiscoM = sementesM > 0 ? furos / sementesM : 0;
  const mLinearHa = espLinha > 0 ? 10000 / espLinha : 0;
  const falhasHa = voltaDiscoM > 0 ? mLinearHa / voltaDiscoM : 0;
  const perdaKgHa = (falhasHa * gPorUnidade) / 1000;
  const perdaSacasHa = perdaKgHa / sacaKg;
  const perdaRsHa = perdaSacasHa * preco;
  const perdaTotal = perdaRsHa * area;

  const loadRecord = (rec) => {
    setCliente(rec.cliente ?? ""); setCultura(rec.cultura ?? "milho"); setSementesM(rec.sementesM ?? 3);
    setPreco(rec.preco ?? 63); setEspLinha(rec.espLinha ?? 0.45); setArea(rec.area ?? 500);
  };

  return (
    <div className="module">
      <TabHeader icon={Disc} eyebrow="Aba 02" title="Perda por falha do disco de sementes"
        description="Estima o impacto financeiro de 1 falha a cada volta do disco dosador, considerando o número de furos por cultura."
        cliente={cliente} setCliente={setCliente} />

      <div className="card">
        <div className="card-title">Parâmetros</div>
        <div className="cultura-row">
          <span className="field-label">Cultura</span>
          <Segmented value={cultura} onChange={setCultura} options={[{ value: "soja", label: "Soja (56 furos)" }, { value: "milho", label: "Milho (27 furos)" }]} />
        </div>
        <div className="card-grid">
          <Field label="Sementes por metro" value={sementesM} onChange={setSementesM} suffix="sem/m" step={0.1} />
          <Field label="Espaçamento entrelinhas" value={espLinha} onChange={setEspLinha} suffix="m" step={0.01} />
          <Field label="Preço da saca no dia" value={preco} onChange={setPreco} suffix="R$" step={0.5} />
          <Field label="Tamanho da propriedade" value={area} onChange={setArea} suffix="ha" />
        </div>
      </div>

      <div className="result-band">
        <Stat label="Uma volta do disco" value={fmtNum(voltaDiscoM, 2) + " m"} />
        <Stat label="Metros lineares/ha" value={fmtNum(mLinearHa, 0) + " m"} />
        <Stat label="Falhas por hectare" value={fmtNum(falhasHa, 0)} tone="red" />
        <Stat label="Perda por hectare" value={fmtBRL(perdaRsHa)} tone="red" />
        <Stat label="Perda total na propriedade" value={fmtBRL(perdaTotal)} tone="red" />
      </div>

      <PrintFoot text={`Referência: 1 ${unidadeLabel} gera cerca de ${gPorUnidade} g de grãos (valor médio de referência). Saca considerada = 60 kg. Furos do disco: soja 56 / milho 27. Cálculo: volta do disco (m) = furos ÷ sementes/m · falhas/ha = m lineares/ha ÷ volta do disco.`} />

      <HistoryPanel tabId="disco"
        record={{ label: cliente || `${cultura} · ${todayStr()}`, cliente, cultura, sementesM, preco, espLinha, area }}
        onLoad={loadRecord} />
      <PrintButton />
    </div>
  );
}

/* ================= TAB 3 — DIMENSIONAMENTO DE PLANTADEIRA ================= */
function TabDimensionamento() {
  const [cliente, setCliente] = useState("");
  const [areaTotal, setAreaTotal] = useState(1000);
  const [janela, setJanela] = useState(20);
  const [espacamento, setEspacamento] = useState(0.5);
  const [velocidade, setVelocidade] = useState(6.5);
  const [jornada, setJornada] = useState(12);
  const [eficiencia, setEficiencia] = useState(70);

  const capacidadeLinhaHaH = (velocidade * espacamento / 10) * (eficiencia / 100);
  const horasDisponiveis = janela * jornada;
  const areaPorLinhaSafra = capacidadeLinhaHaH * horasDisponiveis;
  const linhasNecessarias = areaPorLinhaSafra > 0 ? areaTotal / areaPorLinhaSafra : 0;
  const linhasArredondado = Math.ceil(linhasNecessarias);

  const cenarios = [85, 70, 50].map((ef) => ({
    ef,
    haTurno: linhasArredondado * espacamento * velocidade / 10 * jornada * (ef / 100),
  }));

  const loadRecord = (rec) => {
    setCliente(rec.cliente ?? ""); setAreaTotal(rec.areaTotal ?? 1000); setJanela(rec.janela ?? 20);
    setEspacamento(rec.espacamento ?? 0.5); setVelocidade(rec.velocidade ?? 6.5);
    setJornada(rec.jornada ?? 12); setEficiencia(rec.eficiencia ?? 70);
  };

  return (
    <div className="module">
      <TabHeader icon={Tractor} eyebrow="Aba 03" title="Dimensionamento de plantadeira"
        description="Calcula o número de linhas necessárias para plantar a área do cliente dentro da janela de plantio disponível."
        cliente={cliente} setCliente={setCliente} />

      <div className="card">
        <div className="card-title">Parâmetros</div>
        <div className="card-grid">
          <Field label="Área total plantada" value={areaTotal} onChange={setAreaTotal} suffix="ha" />
          <Field label="Janela de plantio" value={janela} onChange={setJanela} suffix="dias" />
          <Field label="Espaçamento" value={espacamento} onChange={setEspacamento} suffix="m" step={0.01} />
          <Field label="Velocidade de plantio" value={velocidade} onChange={setVelocidade} suffix="km/h" step={0.1} />
          <Field label="Jornada de trabalho" value={jornada} onChange={setJornada} suffix="h/dia" />
          <Field label="Eficiência operacional" value={eficiencia} onChange={setEficiencia} suffix="%" step={1} />
        </div>
      </div>

      <div className="alert-note">
        <Info size={14} />
        <span><strong>O que é eficiência operacional?</strong> É a parcela da jornada realmente usada plantando, descontando manobras nas cabeceiras, abastecimento de sementes/fertilizante, regulagens, deslocamentos entre talhões e paradas. Uma jornada de 12h com 70% de eficiência significa cerca de 8,4h de plantio efetivo — o restante é tempo operacional inevitável. Talhões grandes e retos tendem a ter eficiência mais alta; talhões pequenos, irregulares ou distantes, mais baixa.</span>
      </div>

      <div className="result-band">
        <Stat label="Capacidade por linha" value={fmtNum(capacidadeLinhaHaH, 3) + " ha/h"} />
        <Stat label="Área por linha na safra" value={fmtNum(areaPorLinhaSafra, 2) + " ha"} />
        <Stat label="Linhas necessárias (exato)" value={fmtNum(linhasNecessarias, 2)} />
        <Stat label="Linhas recomendadas" value={linhasArredondado} tone="blue" />
      </div>

      <div className="card">
        <div className="card-title">Sensibilidade por eficiência operacional — {linhasArredondado} linhas, turno de {fmtNum(jornada, 0)}h, {fmtNum(velocidade, 1)} km/h</div>
        <table className="table">
          <thead><tr><th>Eficiência</th><th>Hectares/turno</th></tr></thead>
          <tbody>
            {cenarios.map((c) => (
              <tr key={c.ef}><td>{c.ef}%</td><td className="mono">{fmtNum(c.haTurno, 1)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <HistoryPanel tabId="dimensionamento"
        record={{ label: cliente || `Dimensionamento ${todayStr()}`, cliente, areaTotal, janela, espacamento, velocidade, jornada, eficiencia }}
        onLoad={loadRecord} />
      <PrintButton />
    </div>
  );
}

/* ================= TAB 4 — REGULAGEM DE TAXA DE FERTILIZANTE ================= */
function TabFertilizante() {
  const [cliente, setCliente] = useState("");
  const [kgHa, setKgHa] = useState(300);
  const [espacamento, setEspacamento] = useState(0.45);
  const [distColeta, setDistColeta] = useState(50);
  const [numLinhas, setNumLinhas] = useState(15);
  const [tolerancia, setTolerancia] = useState(10);
  const [valores, setValores] = useState({});

  const idealG = kgHa / 10000 * espacamento * distColeta * 1000;

  const linhasArr = Array.from({ length: Math.max(0, Math.round(numLinhas)) }, (_, i) => i + 1);
  const coletados = linhasArr.map((l) => parseFloat(valores[l]) || 0).filter((v) => v > 0);
  const n = coletados.length;
  const media = n ? coletados.reduce((a, b) => a + b, 0) / n : 0;
  const dv = n > 1 ? Math.sqrt(coletados.reduce((a, b) => a + (b - media) ** 2, 0) / (n - 1)) : 0;
  const cv = media > 0 ? (dv / media) * 100 : 0;

  const setValor = (l, v) => setValores((prev) => ({ ...prev, [l]: v }));
  const forasDaFaixa = (v) => {
    if (!v) return false;
    const dif = Math.abs(v - idealG) / idealG * 100;
    return dif > tolerancia;
  };

  const loadRecord = (rec) => {
    setCliente(rec.cliente ?? ""); setKgHa(rec.kgHa ?? 300); setEspacamento(rec.espacamento ?? 0.45);
    setDistColeta(rec.distColeta ?? 50); setNumLinhas(rec.numLinhas ?? 15);
    setTolerancia(rec.tolerancia ?? 10); setValores(rec.valores ?? {});
  };

  return (
    <div className="module">
      <TabHeader icon={FlaskConical} eyebrow="Aba 04" title="Regulagem de taxa de fertilizante"
        description="Compara a quantidade coletada em cada linha durante o teste de calibração com a quantidade ideal para a taxa alvo."
        cliente={cliente} setCliente={setCliente} />

      <div className="card">
        <div className="card-title">Parâmetros do teste</div>
        <div className="card-grid">
          <Field label="Taxa alvo" value={kgHa} onChange={setKgHa} suffix="kg/ha" step={1} />
          <Field label="Espaçamento entre linhas" value={espacamento} onChange={setEspacamento} suffix="m" step={0.01} />
          <Field label="Distância de coleta" value={distColeta} onChange={setDistColeta} suffix="m" step={1} />
          <Field label="Número de linhas" value={numLinhas} onChange={setNumLinhas} suffix="linhas" step={1} />
          <Field label="Tolerância aceitável" value={tolerancia} onChange={setTolerancia} suffix="%" step={1} hint="Desvio máximo em relação ao ideal por linha" />
        </div>
      </div>

      <div className="result-band">
        <Stat label="Ideal por linha" value={fmtNum(idealG, 1) + " g"} tone="blue" />
        <Stat label="Média coletada" value={fmtNum(media, 1) + " g"} />
        <Stat label="CV entre linhas" value={fmtNum(cv, 1) + "%"} tone={cv > tolerancia ? "red" : "blue"} />
      </div>

      <div className="card">
        <div className="card-title">Coleta por linha</div>
        <div className="linhas-grid">
          {linhasArr.map((l) => {
            const v = parseFloat(valores[l]) || 0;
            const fora = forasDaFaixa(v);
            return (
              <label key={l} className={"linha-box" + (v > 0 ? (fora ? " fora" : " dentro") : "")}>
                <span className="linha-label">L.{l}</span>
                <input type="number" value={valores[l] || ""} placeholder="g" onChange={(e) => setValor(l, e.target.value)} />
              </label>
            );
          })}
        </div>
      </div>

      <HistoryPanel tabId="fertilizante"
        record={{ label: cliente || `Fertilizante ${todayStr()}`, cliente, kgHa, espacamento, distColeta, numLinhas, tolerancia, valores }}
        onLoad={loadRecord} />
      <PrintButton />
    </div>
  );
}

function PrintFoot({ text }) {
  return <div className="print-foot">{text}</div>;
}
function PrintButton() {
  return (
    <button className="btn btn-primary btn-print no-print" onClick={() => window.print()}>
      <Download size={14} /> Salvar em PDF
    </button>
  );
}

/* ================= APP SHELL ================= */
const TABS = [
  { id: "plantabilidade", label: "Plantabilidade", icon: Activity, Comp: TabPlantabilidade },
  { id: "disco", label: "Perda por disco", icon: Disc, Comp: TabDisco },
  { id: "dimensionamento", label: "Dimensionamento", icon: Tractor, Comp: TabDimensionamento },
  { id: "fertilizante", label: "Fertilizante", icon: FlaskConical, Comp: TabFertilizante },
];

export default function App() {
  const [tab, setTab] = useState("plantabilidade");
  const Active = TABS.find((t) => t.id === tab).Comp;

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .app{
          --bg:#EEF0F3; --panel:#FFFFFF; --panel-2:#F5F6F8; --line:#DCE0E6;
          --text:#181B20; --muted:#6A727D; --red:#B23A3A; --red-soft:#F7E9E9;
          --blue:#2E3542; --blue-soft:#E7E9EC; --steel:#14171B;
          font-family:'Inter',system-ui,sans-serif; background:var(--bg); color:var(--text);
          border-radius:12px; overflow:hidden; min-height:100vh; display:flex; flex-direction:column;
        }
        .app *{box-sizing:border-box;}
        .topbar{ background:var(--steel); padding:0 22px; display:flex; align-items:center; gap:4px; overflow-x:auto; }
        .brand{ font-family:'Oswald',sans-serif; color:#fff; font-size:15px; letter-spacing:0.03em; padding:16px 18px 16px 0; margin-right:8px; border-right:1px solid #2B3540; display:flex; flex-direction:column; }
        .brand-sub{ font-size:9.5px; color:#9AA1AB; letter-spacing:0.14em; text-transform:uppercase; margin-top:2px; font-family:'Inter',sans-serif; font-weight:600; }
        .tabbtn{ display:flex; align-items:center; gap:7px; padding:16px 14px; color:#9AA4B2; font-size:12.5px; font-weight:500; cursor:pointer; border-bottom:2.5px solid transparent; white-space:nowrap; }
        .tabbtn:hover{ color:#fff; }
        .tabbtn.active{ color:#fff; border-bottom-color:#6B7280; }
        .content{ flex:1; padding:28px 34px 46px; max-width:920px; width:100%; margin:0 auto; }
        .eyebrow{ font-size:10.5px; letter-spacing:0.14em; text-transform:uppercase; color:var(--blue); font-weight:600; }
        h1{ font-family:'Oswald',sans-serif; font-size:22px; margin:2px 0 0; font-weight:600; }
        .tab-header{ margin-bottom:22px; }
        .tab-header-top{ display:flex; gap:12px; align-items:center; }
        .tab-icon{ width:38px; height:38px; border-radius:9px; background:#E7E9EC; color:#2E3542; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .tab-desc{ color:var(--muted); font-size:13px; line-height:1.5; margin:8px 0 14px; max-width:600px; }
        .cliente-row{ max-width:340px; }
        .card{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:18px 20px; margin-bottom:16px; }
        .card-title{ font-family:'Oswald',sans-serif; font-size:13.5px; font-weight:600; margin-bottom:14px; color:var(--steel); }
        .card-note{ font-size:11.5px; color:var(--muted); line-height:1.5; margin:-8px 0 14px; }
        .card-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px 16px; }
        .grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:680px){ .grid-2{ grid-template-columns:1fr; } }
        @media(max-width:640px){
          .content{ padding:18px 14px 32px; }
          .brand{ padding:12px 12px 12px 0; font-size:12.5px; margin-right:4px; }
          .brand-sub{ font-size:8.5px; }
          .tabbtn{ padding:12px 9px; font-size:11px; gap:5px; }
          .card{ padding:14px 15px; }
          h1{ font-size:18px; }
          .tab-header-top{ gap:9px; }
          .tab-icon{ width:32px; height:32px; }
          .result-band{ gap:8px; }
          .stat{ min-width:calc(50% - 5px); flex:none; padding:9px 11px; }
          .stat-value{ font-size:15px; }
          .card-grid{ grid-template-columns:1fr 1fr; gap:10px 12px; }
          .linhas-grid{ grid-template-columns:repeat(4,1fr); }
          .table{ font-size:12px; }
        }
        @media(max-width:380px){
          .card-grid{ grid-template-columns:1fr; }
          .stat{ min-width:100%; }
        }
        .field{ display:flex; flex-direction:column; gap:5px; }
        .field-label{ font-size:11.5px; color:var(--muted); font-weight:500; }
        .field-row{ display:flex; align-items:center; background:var(--panel-2); border:1px solid var(--line); border-radius:7px; overflow:hidden; }
        .field-input{ background:transparent; border:none; outline:none; padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-size:13px; width:100%; color:var(--text); }
        .field-input:focus-visible{ outline:2px solid var(--blue); outline-offset:-2px; }
        .field-suffix{ padding:0 10px; font-size:10.5px; color:var(--muted); border-left:1px solid var(--line); align-self:stretch; display:flex; align-items:center; }
        .field-hint{ font-size:10px; color:var(--muted); line-height:1.3; }
        .mini-stats{ display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
        .stat{ background:var(--panel-2); border:1px solid var(--line); border-radius:9px; padding:10px 14px; min-width:100px; flex:1; }
        .stat-value{ font-family:'IBM Plex Mono',monospace; font-size:17px; font-weight:600; }
        .stat-label{ font-size:10px; color:var(--muted); margin-top:2px; }
        .tone-red .stat-value{ color:var(--red); }
        .tone-blue .stat-value{ color:var(--blue); }
        .result-band{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .result-band .stat{ min-width:120px; }
        .add-row{ display:flex; gap:8px; margin-bottom:12px; }
        .add-row .field-input{ background:var(--panel-2); border:1px solid var(--line); border-radius:7px; }
        .btn{ display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; padding:8px 14px; border-radius:7px; cursor:pointer; border:1px solid transparent; white-space:nowrap; }
        .btn-primary{ background:var(--steel); color:#fff; }
        .btn-primary:hover{ background:#232d38; }
        .btn-outline{ background:#fff; border-color:var(--line); color:var(--text); }
        .btn-outline:hover{ border-color:var(--blue); color:var(--blue); }
        .btn-ghost{ background:transparent; color:var(--muted); }
        .btn-ghost:hover{ color:var(--text); }
        .btn-print{ margin-top:4px; }
        .chips{ display:flex; gap:7px; flex-wrap:wrap; }
        .chip{ display:flex; align-items:center; gap:5px; padding:5px 9px; border-radius:20px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; border:1px solid var(--line); }
        .chip-delta{ opacity:0.65; font-size:10px; }
        .chip svg{ cursor:pointer; opacity:0.55; }
        .chip svg:hover{ opacity:1; }
        .chip-aceitavel{ background:var(--blue-soft); color:var(--blue); border-color:transparent; }
        .chip-falha{ background:var(--red-soft); color:var(--red); border-color:transparent; }
        .chip-duplo{ background:#FCE9D9; color:#9A5A16; border-color:transparent; }
        .empty-note{ color:var(--muted); font-size:12px; }
        .segmented{ display:inline-flex; background:var(--panel-2); border:1px solid var(--line); border-radius:8px; padding:3px; margin:6px 0 14px; }
        .seg-btn{ padding:7px 12px; font-size:12px; font-weight:500; border-radius:6px; color:var(--muted); cursor:pointer; }
        .seg-btn.active{ background:var(--steel); color:#fff; }
        .cultura-row{ display:flex; flex-direction:column; }
        .ref-row{ max-width:260px; margin-bottom:14px; }
        .alert-note{ display:flex; gap:9px; align-items:flex-start; background:var(--blue-soft); color:var(--blue); border:1px solid #C9D6EF; border-radius:9px; padding:10px 13px; font-size:11.5px; line-height:1.5; margin-bottom:14px; }
        .alert-note svg{ flex-shrink:0; margin-top:1.5px; }
        .print-foot{ font-size:10.5px; color:var(--muted); line-height:1.5; border-top:1px solid var(--line); padding-top:10px; margin-bottom:16px; }
        .table{ width:100%; border-collapse:collapse; font-size:13px; }
        .table th{ text-align:left; color:var(--muted); font-weight:500; font-size:11px; text-transform:uppercase; letter-spacing:0.04em; padding:6px 8px; border-bottom:1px solid var(--line); }
        .table td{ padding:8px; border-bottom:1px solid var(--line); }
        .table .mono{ font-family:'IBM Plex Mono',monospace; font-weight:600; }
        .linhas-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(78px,1fr)); gap:8px; }
        .linha-box{ display:flex; flex-direction:column; gap:4px; background:var(--panel-2); border:1.5px solid var(--line); border-radius:8px; padding:7px 8px; }
        .linha-box input{ background:transparent; border:none; outline:none; font-family:'IBM Plex Mono',monospace; font-size:12.5px; width:100%; color:var(--text); }
        .linha-label{ font-size:9.5px; color:var(--muted); font-weight:600; }
        .linha-box.dentro{ border-color:var(--blue); }
        .linha-box.fora{ border-color:var(--red); background:var(--red-soft); }
        .history-block{ margin-top:8px; border-top:1px solid var(--line); padding-top:14px; }
        .history-actions{ display:flex; gap:10px; }
        .history-list{ margin-top:10px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto; }
        .history-empty{ font-size:12px; color:var(--muted); padding:6px 2px; }
        .history-item{ display:flex; align-items:center; gap:8px; background:var(--panel-2); border:1px solid var(--line); border-radius:8px; padding:8px 10px; }
        .history-item-main{ flex:1; display:flex; justify-content:space-between; gap:10px; cursor:pointer; }
        .history-item-title{ font-size:12.5px; font-weight:500; }
        .history-item-sub{ font-size:11px; color:var(--muted); }
        .icon-btn{ color:var(--muted); padding:4px; border-radius:5px; }
        .icon-btn:hover{ color:var(--red); background:var(--red-soft); }
        @media print{
          .no-print{ display:none !important; }
          .topbar{ display:none !important; }
          .app{ background:#fff; border-radius:0; }
          .content{ padding:0; max-width:none; }
          .card, .stat{ break-inside:avoid; }
        }
      `}</style>

      <nav className="topbar no-print">
        <div className="brand">Calculadora CNH<span className="brand-sub">Plantabilidade</span></div>
        {TABS.map((t) => (
          <div key={t.id} className={"tabbtn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            <t.icon size={15} strokeWidth={1.8} /> {t.label}
          </div>
        ))}
      </nav>

      <div className="content">
        <Active />
      </div>
    </div>
  );
}
