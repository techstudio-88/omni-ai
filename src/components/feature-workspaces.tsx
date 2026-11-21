"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Activity, ArrowRight, BookOpen, Brain, CircleAlert, FileSearch, FileText, FolderKanban, LoaderCircle, Plus, Search, Shield, Sparkles, Trash2, Upload } from "lucide-react";
import { saveWorkspacePreference, useWorkspacePreference } from "@/lib/client-preferences";

type ApiMessage = { error?: string };
async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({})) as T & ApiMessage;
  if (!response.ok) throw new Error(data.error ?? "That request could not be completed.");
  return data as T;
}
function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-actions">{action}</div>}</div>;
}
function Panel({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={"card " + className} style={style}>{children}</section>;
}
const formJson = (body: unknown) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

type ResearchResult = { responseText: string; citations: { title: string; url?: string; sourceType: string }[]; warnings: string[]; executionStatus: string };
export function ResearchWorkspace() {
  const [question, setQuestion] = useState(""); const [result, setResult] = useState<ResearchResult | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function research(event: React.FormEvent) {
    event.preventDefault(); if (!question.trim() || busy) return;
    setBusy(true); setError(""); setResult(null);
    try { setResult(await apiJson<ResearchResult>("/api/brain/research", formJson({ message: question.trim(), selectedMode: "research", webSearchEnabled: true }))); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Research could not be completed."); } finally { setBusy(false); }
  }
  return <div className="studio-content"><PageHeading title="Research" description="Explore a question with current search and clear source links." />
    <div className="section-grid" style={{ gridTemplateColumns: "minmax(0, 1.5fr) minmax(220px, .7fr)" }}>
      <Panel className="form-card"><form onSubmit={research}><div className="form-field"><label htmlFor="research-question">What would you like to research?</label><textarea id="research-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a focused question. OmniBrain will look for current information and show its sources." maxLength={12000} /></div><button className="button" disabled={busy || !question.trim()}>{busy ? "Searching…" : <>Start research <ArrowRight size={14} /></>}</button></form></Panel>
      <Panel className="section-card"><div className="section-icon"><Search size={16} /></div><h2>Research workflow</h2><p>OmniBrain checks the request, searches when a provider is available, and shows source links with the answer. Demo results are labelled as examples.</p></Panel>
    </div>
    {error && <p role="alert" className="toast">{error}</p>}
    {result && <div style={{ marginTop: 16 }}><Panel className="section-card"><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Sparkles size={15} color="#438b7a" /><span style={{ fontSize: 11, fontWeight: 650 }}>Research answer</span>{result.executionStatus === "demo" && <span className="status-tag">Example response</span>}</div><div className="message-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.responseText}</ReactMarkdown></div>{result.warnings.map((warning) => <p key={warning} className="mini-label" style={{ marginTop: 10 }}>{warning}</p>)}</Panel>
      {result.citations.length > 0 && <Panel className="list-card" style={{ marginTop: 12 }}><div className="list-row"><b>Sources</b><span className="mini-label">{result.citations.length} references</span></div>{result.citations.map((source, index) => <div className="list-row" key={source.title + index}><div><b>{source.title}</b><small>{source.sourceType === "demo" ? "Sample source · demo data" : source.url ?? "Retrieved source"}</small></div>{source.url && source.sourceType !== "demo" && <a className="status-tag" href={source.url} target="_blank" rel="noreferrer">Open source ↗</a>}</div>)}</Panel>}</div>}
  </div>;
}

type CompareItem = { responseText: string; model: string; provider: string; executionStatus: string; warnings: string[] };
export function CompareWorkspace() {
  const [prompt, setPrompt] = useState(""); const [results, setResults] = useState<CompareItem[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function compare(event: React.FormEvent) {
    event.preventDefault(); if (!prompt.trim() || busy) return; setBusy(true); setError(""); setResults([]);
    try { const data = await apiJson<{ results: CompareItem[] }>("/api/brain/compare", formJson({ message: prompt.trim(), selectedMode: "compare" })); setResults(data.results); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The comparison could not be completed."); } finally { setBusy(false); }
  }
  return <div className="studio-content"><PageHeading title="Compare models" description="Send one prompt to the models connected to this workspace and compare their answers." />
    <Panel className="form-card" style={{ maxWidth: "none" }}><form onSubmit={compare}><div className="form-field"><label htmlFor="compare-prompt">Your prompt</label><textarea id="compare-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Give each model the same task…" maxLength={12000} /></div><button className="button" disabled={busy || !prompt.trim()}>{busy ? "Comparing…" : <>Compare available models <Activity size={14} /></>}</button></form></Panel>
    {error && <p role="alert" className="toast">{error}</p>}
    {results.length > 0 && <div className="section-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))", marginTop: 16 }}>{results.map((result, index) => <Panel className="section-card" key={result.model + index}><div className="section-icon"><Sparkles size={15} /></div><h2>{result.model}</h2><p style={{ marginBottom: 12 }}>{result.provider}{result.executionStatus === "demo" ? " · sample" : ""}</p><div className="message-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.responseText}</ReactMarkdown></div>{result.warnings.map((warning) => <p className="mini-label" key={warning} style={{ marginTop: 10 }}>{warning}</p>)}</Panel>)}</div>}
  </div>;
}

type DocumentItem = { id: string; name: string; status: string; size_bytes: number; created_at: string };
type DocumentAnswer = { chunks: { documentName: string; pageNumber: number | null; text: string; score: number }[]; message?: string };
export function DocumentsWorkspace() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]); const [demo, setDemo] = useState(false); const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<DocumentAnswer | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const fileRef = useRef<HTMLInputElement>(null);
  async function load() { const data = await apiJson<{ documents: DocumentItem[]; demo?: boolean }>("/api/documents"); setDocuments(data.documents); setDemo(Boolean(data.demo)); }
  useEffect(() => {
    let active = true;
    void apiJson<{ documents: DocumentItem[]; demo?: boolean }>("/api/documents").then((data) => { if (active) { setDocuments(data.documents); setDemo(Boolean(data.demo)); } }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Documents could not load."); });
    return () => { active = false; };
  }, []);
  async function upload(file?: File) {
    if (!file) return; setBusy(true); setError(""); const form = new FormData(); form.set("file", file);
    try { await apiJson("/api/documents/upload", { method: "POST", body: form }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Upload failed."); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  async function remove(document: DocumentItem) {
    if (document.id === "demo-sample") { setError("Sample documents are examples and cannot be deleted."); return; }
    try { await apiJson("/api/documents/" + document.id, { method: "DELETE" }); setDocuments((items) => items.filter((item) => item.id !== document.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The file could not be removed."); }
  }
  async function query(event: React.FormEvent) {
    event.preventDefault(); if (!question.trim()) return; setBusy(true); setError("");
    try { setAnswer(await apiJson<DocumentAnswer>("/api/documents/query", formJson({ query: question.trim(), documentIds: documents.filter((item) => item.id !== "demo-sample").map((item) => item.id) }))); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Search failed."); } finally { setBusy(false); }
  }
  const action = <><input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp" onChange={(event) => void upload(event.target.files?.[0])} /><button className="button" onClick={() => fileRef.current?.click()} disabled={busy || demo}><Upload size={14} />Add document</button></>;
  return <div className="studio-content"><PageHeading title="Documents" description="Add private files, find relevant passages, and use them in your conversations." action={action} />{demo && <div className="toast">You’re viewing sample documents. Uploads require a signed-in workspace and private storage.</div>}{error && <div role="alert" className="toast">{error}</div>}
    <div className="section-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(280px,.8fr)" }}>
      <Panel className="list-card"><div className="list-row"><b>Your document library</b><span className="mini-label">Private to this workspace</span></div>{documents.length === 0 ? <div className="empty-state"><div className="section-icon"><FileText size={15} /></div><h2>No documents yet</h2><p>Add a supported file to index searchable passages.</p></div> : documents.map((document) => <div className="list-row" key={document.id}><div><b>{document.name}</b><small>{document.id === "demo-sample" ? "Sample document · demo data" : (document.size_bytes / 1024).toFixed(0) + " KB · " + document.status}</small></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className={"status-tag" + (document.status === "ready" || document.status === "sample" ? "" : " pending")}>{document.status}</span>{document.id !== "demo-sample" && <button className="icon-button" aria-label={"Delete " + document.name} onClick={() => void remove(document)}><Trash2 size={13} /></button>}</div></div>)}</Panel>
      <Panel className="form-card" style={{ maxWidth: "none" }}><div className="section-icon"><FileSearch size={16} /></div><h2 style={{ fontSize: 14, margin: "0 0 6px" }}>Find a passage</h2><p className="muted" style={{ fontSize: 11, margin: "0 0 15px" }}>Search text extracted from your files. Images are stored, but image reading is not connected yet.</p><form onSubmit={query}><div className="form-field"><label htmlFor="document-query">Question about your documents</label><textarea id="document-query" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I look for?" /></div><button className="button" disabled={busy || !question.trim()}>{busy ? "Searching…" : <>Search passages <Search size={14} /></>}</button></form>
        {answer && <div style={{ marginTop: 15 }}>{answer.message && <p className="toast">{answer.message}</p>}{answer.chunks.map((chunk, index) => <div key={chunk.documentName + index} style={{ borderTop: "1px solid #edf0f0", padding: "12px 0" }}><b style={{ fontSize: 10 }}>{chunk.documentName}{chunk.pageNumber ? " · page " + chunk.pageNumber : ""}</b><p style={{ fontSize: 11, lineHeight: 1.6, color: "#61717d", margin: "6px 0 0" }}>{chunk.text}</p></div>)}{!answer.chunks.length && !answer.message && <p className="mini-label">No matching passages were found.</p>}</div>}
      </Panel>
    </div>
  </div>;
}

type Resource = { id: string; name?: string; title?: string; description?: string; instructions?: string; body?: string; category?: string; created_at?: string };
type CollectionKind = "projects" | "assistants" | "prompts";
const collectionOptions = {
  projects: { title: "Projects", subtitle: "Group related conversations, files, and instructions into focused workspaces.", endpoint: "/api/projects", singular: "project", icon: FolderKanban },
  assistants: { title: "Custom assistants", subtitle: "Create private instruction sets for the work you return to often.", endpoint: "/api/assistants", singular: "assistant", icon: Sparkles },
  prompts: { title: "Prompt library", subtitle: "Keep reusable prompts close and bring them into your next conversation.", endpoint: "/api/prompts", singular: "prompt", icon: BookOpen },
};
export function CollectionWorkspace({ kind }: { kind: CollectionKind }) {
  const settings = collectionOptions[kind]; const Icon = settings.icon;
  const [items, setItems] = useState<Resource[]>([]); const [demo, setDemo] = useState(false); const [name, setName] = useState(""); const [detail, setDetail] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    let active = true;
    void apiJson<{ projects?: Resource[]; assistants?: Resource[]; prompts?: Resource[]; demo?: boolean }>(settings.endpoint).then((data) => {
      if (active) { setItems(data[kind] ?? []); setDemo(Boolean(data.demo)); }
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "This list could not load."); });
    return () => { active = false; };
  }, [kind, settings.endpoint]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); if (!name.trim() || busy) return; setBusy(true); setError("");
    const payload = kind === "projects" ? { name, description: detail } : kind === "assistants" ? { name, description: detail, instructions: detail || "Help with " + name.toLowerCase() + " in a clear and practical way." } : { title: name, body: detail, category: "General" };
    try {
      const data = await apiJson<{ project?: Resource; assistant?: Resource; prompt?: Resource }>(settings.endpoint, formJson(payload));
      const item = kind === "projects" ? data.project : kind === "assistants" ? data.assistant : data.prompt;
      if (item) setItems((list) => [item, ...list]); setName(""); setDetail(""); setShowForm(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The item could not be saved."); } finally { setBusy(false); }
  }
  async function remove(item: Resource) {
    if (item.id.startsWith("starter-")) { setError("Built-in starter prompts stay in your library."); return; }
    try { await apiJson(settings.endpoint + "/" + item.id, { method: "DELETE" }); setItems((list) => list.filter((entry) => entry.id !== item.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The item could not be removed."); }
  }
  function copyPrompt(item: Resource) {
    if (kind === "prompts" && item.body && navigator.clipboard) void navigator.clipboard.writeText(item.body).then(() => setError("Prompt copied. Open a conversation and paste it in."));
  }
  const action = <button className="button" onClick={() => setShowForm((value) => !value)}><Plus size={14} />New {settings.singular}</button>;
  return <div className="studio-content"><PageHeading title={settings.title} description={settings.subtitle} action={action} />{demo && <div className="toast">Sample content is clearly labelled. New items in demo mode are temporary.</div>}{error && <div role="status" className="toast">{error}</div>}
    {showForm && <Panel className="form-card" style={{ marginBottom: 15 }}><form onSubmit={create}><div className="form-field"><label htmlFor={kind + "-name"}>{kind === "prompts" ? "Prompt title" : settings.singular[0].toUpperCase() + settings.singular.slice(1) + " name"}</label><input id={kind + "-name"} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder={kind === "prompts" ? "A reusable prompt" : "Name your " + settings.singular} /></div><div className="form-field"><label htmlFor={kind + "-detail"}>{kind === "prompts" ? "Prompt text" : kind === "assistants" ? "Instructions" : "Description"}</label><textarea id={kind + "-detail"} value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={kind === "assistants" || kind === "prompts" ? 8000 : 800} placeholder={kind === "prompts" ? "Write a prompt you want to reuse…" : kind === "assistants" ? "Describe how this assistant should help…" : "What belongs in this project?"} /></div><div style={{ display: "flex", gap: 8 }}><button className="button" disabled={busy || !name.trim() || ((kind === "assistants" || kind === "prompts") && !detail.trim())}>{busy ? "Saving…" : "Save"}</button><button type="button" className="button ghost" onClick={() => setShowForm(false)}>Cancel</button></div></form></Panel>}
    <div className="section-grid">{items.length === 0 ? <Panel className="empty-state" style={{ gridColumn: "1/-1" }}><div className="section-icon"><Icon size={16} /></div><h2>No {settings.title.toLowerCase()} yet</h2><p>Create one to keep related work organized.</p></Panel> : items.map((item) => <Panel className="section-card" key={item.id}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}><div className="section-icon"><Icon size={15} /></div>{!item.id.startsWith("starter-") && <button className="icon-button" aria-label={"Delete " + (item.name ?? item.title ?? settings.singular)} onClick={() => void remove(item)}><Trash2 size={13} /></button>}</div><h2>{item.name ?? item.title}</h2><p>{item.description ?? item.instructions ?? item.body ?? "Private to this workspace."}</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 15 }}><span className="status-tag">{item.category ?? (item.id.startsWith("demo-") ? "Demo example" : "Private")}</span>{kind === "prompts" && <button className="button light" style={{ padding: "7px 10px", fontSize: 10 }} onClick={() => copyPrompt(item)}>Copy prompt</button>}</div></Panel>)}</div>
  </div>;
}

type Memory = { id: string; type: string; key: string; value: string; source: string; enabled: boolean; confidence?: number };
export function MemoryWorkspace() {
  const [memories, setMemories] = useState<Memory[]>([]); const [demo, setDemo] = useState(false); const [key, setKey] = useState(""); const [value, setValue] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void apiJson<{ memories: Memory[]; demo?: boolean }>("/api/memories").then((data) => { if (active) { setMemories(data.memories); setDemo(Boolean(data.demo)); } }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Memories could not load."); });
    return () => { active = false; };
  }, []);
  async function add(event: React.FormEvent) {
    event.preventDefault(); if (!key.trim() || !value.trim()) return; setBusy(true); setError("");
    try { const data = await apiJson<{ memory: Memory }>("/api/memories", formJson({ key, value })); setMemories((list) => [data.memory, ...list]); setKey(""); setValue(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Memory could not be saved."); } finally { setBusy(false); }
  }
  async function toggle(item: Memory) {
    try { await apiJson("/api/memories/" + item.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !item.enabled }) }); setMemories((list) => list.map((memory) => memory.id === item.id ? { ...memory, enabled: !item.enabled } : memory)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The memory could not be updated."); }
  }
  async function remove(item: Memory) {
    try { await apiJson("/api/memories/" + item.id, { method: "DELETE" }); setMemories((list) => list.filter((memory) => memory.id !== item.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The memory could not be removed."); }
  }
  return <div className="studio-content"><PageHeading title="Memory controls" description="Review what OmniBrain can remember, turn items off, or remove them permanently." />{demo && <div className="toast">These are sample memories. Changes in demo mode are temporary and never used by a live model.</div>}{error && <div role="alert" className="toast">{error}</div>}
    <div className="section-grid" style={{ gridTemplateColumns: "minmax(0,1.1fr) minmax(260px,.8fr)" }}><Panel className="list-card"><div className="list-row"><b>Saved memories</b><span className="mini-label">Use is off until you enable it in chat</span></div>{memories.map((memory) => <div className="list-row" key={memory.id}><div><b>{memory.key}</b><small>{memory.value}<br />Source: {memory.source}</small></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><button className={"switch" + (memory.enabled ? " on" : "")} aria-label={(memory.enabled ? "Disable " : "Enable ") + memory.key} aria-pressed={memory.enabled} onClick={() => void toggle(memory)} /><button className="icon-button" aria-label={"Delete " + memory.key} onClick={() => void remove(memory)}><Trash2 size={13} /></button></div></div>)}{!memories.length && <div className="empty-state"><div className="section-icon"><Brain size={15} /></div><h2>No saved memories</h2><p>You can add preferences that help future conversations feel more relevant.</p></div>}</Panel>
      <Panel className="form-card" style={{ maxWidth: "none" }}><div className="section-icon"><Brain size={16} /></div><h2 style={{ fontSize: 14, margin: "0 0 5px" }}>Add a memory</h2><p className="muted" style={{ fontSize: 11, lineHeight: 1.55, margin: "0 0 17px" }}>Only save information you are comfortable using in future chats.</p><form onSubmit={add}><div className="form-field"><label htmlFor="memory-key">Short name</label><input id="memory-key" value={key} onChange={(event) => setKey(event.target.value)} maxLength={100} placeholder="Preferred answer style" /></div><div className="form-field"><label htmlFor="memory-value">What should OmniBrain remember?</label><textarea id="memory-value" value={value} onChange={(event) => setValue(event.target.value)} maxLength={1000} placeholder="I prefer clear steps and short examples." /></div><button className="button" disabled={busy || !key.trim() || !value.trim()}>{busy ? "Saving…" : <>Save memory <Plus size={14} /></>}</button></form></Panel>
    </div>
  </div>;
}

type Usage = { plan: string; messagesUsed: number; messageLimit: number; storageUsedBytes: number; storageLimitBytes: number; demo: boolean };
export function UsageWorkspace() {
  const [usage, setUsage] = useState<Usage | null>(null); const [error, setError] = useState("");
  useEffect(() => { void apiJson<Usage>("/api/usage").then(setUsage).catch((reason) => setError(reason instanceof Error ? reason.message : "Usage could not load.")); }, []);
  const storage = usage ? Math.min(100, usage.storageUsedBytes / usage.storageLimitBytes * 100) : 0;
  return <div className="studio-content"><PageHeading title="Usage & plan" description="See your workspace limits and recent usage at a glance." />{error && <div role="alert" className="toast">{error}</div>}{!usage ? <Panel className="empty-state"><LoaderCircle className="spinner" /><p>Loading usage…</p></Panel> : <><div className="section-grid"><Panel className="metric-card"><span>Plan</span><strong>{usage.plan[0].toUpperCase() + usage.plan.slice(1)}</strong><small>Demo billing · no payment connected</small></Panel><Panel className="metric-card"><span>Messages today</span><strong>{usage.messagesUsed} <span style={{ display: "inline", fontSize: 12, color: "#8b979f" }}>/ {usage.messageLimit}</span></strong><small>Daily reset at UTC midnight</small></Panel><Panel className="metric-card"><span>Private storage</span><strong>{(usage.storageUsedBytes / 1000000).toFixed(1)} MB</strong><small>of {(usage.storageLimitBytes / 1000000).toFixed(0)} MB available</small></Panel></div><Panel className="section-card" style={{ marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}><h2>Storage used</h2><span className="mini-label">{storage.toFixed(1)}%</span></div><div style={{ height: 7, background: "#edf1f1", borderRadius: 9, overflow: "hidden" }}><div style={{ width: storage + "%", height: "100%", background: "linear-gradient(90deg,#78d8c2,#5b9e91)", borderRadius: 9 }} /></div></Panel><Panel className="section-card" style={{ marginTop: 14 }}><div className="section-icon"><CircleAlert size={15} /></div><h2>Payments and subscriptions</h2><p>No payment provider is connected. Plan changes and billing are not available in this workspace yet.</p></Panel></>}</div>;
}

export function SettingsWorkspace() {
  const [providers, setProviders] = useState<{ id: string; name: string; status: string; configuredKeyCount?: number }[]>([]);
  const memory = useWorkspacePreference("omnibrain-memory-enabled"); const search = useWorkspacePreference("omnibrain-search-enabled"); const [saved, setSaved] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void apiJson<{ providers: typeof providers }>("/api/providers").then((data) => { if (active) setProviders(data.providers); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Provider status could not load."); });
    return () => { active = false; };
  }, []);
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  return <div className="studio-content"><PageHeading title="Settings" description="Choose what OmniBrain can use and see which providers are available." />{saved && <div role="status" className="toast">Your preferences were saved on this device.</div>}{error && <div role="alert" className="toast">{error}</div>}
    <div className="section-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(280px,.85fr)" }}><Panel className="section-card"><div className="section-icon"><Shield size={16} /></div><h2>Privacy & preferences</h2><div className="toggle-row"><span><b>Use saved memories</b><small>Only apply memories when the chat toggle is on.</small></span><button className={"switch" + (memory ? " on" : "")} aria-label="Use saved memories" aria-pressed={memory} onClick={() => { saveWorkspacePreference("omnibrain-memory-enabled", !memory); save(); }} /></div><div className="toggle-row"><span><b>Allow web research</b><small>Search is selected manually in each conversation.</small></span><button className={"switch" + (search ? " on" : "")} aria-label="Allow web research" aria-pressed={search} onClick={() => { saveWorkspacePreference("omnibrain-search-enabled", !search); save(); }} /></div><p className="mini-label" style={{ marginTop: 15 }}>Preferences are saved on this device.</p></Panel>
      <Panel className="list-card"><div className="list-row"><b>Connected providers</b><span className="mini-label">No secrets are shown here</span></div>{providers.map((provider) => <div className="list-row" key={provider.id}><div><b>{provider.name}</b><small>{provider.configuredKeyCount ? provider.configuredKeyCount + " server keys configured" : provider.status === "connected" ? "Connected" : "Not connected"}</small></div><span className={"status-tag" + (provider.status === "connected" ? "" : " pending")}>{provider.status.replaceAll("_", " ")}</span></div>)}{providers.length === 0 && <div className="list-row"><span className="mini-label">Checking provider status…</span></div>}</Panel>
    </div>
  </div>;
}

export function AdminWorkspace() {
  const [status, setStatus] = useState<"loading" | "denied" | "available" | "error">("loading");
  useEffect(() => { void apiJson("/api/admin/overview").then(() => setStatus("available")).catch((reason) => setStatus(reason instanceof Error && reason.message.includes("administrator") ? "denied" : "error")); }, []);
  return <div className="studio-content"><PageHeading title="Admin overview" description="Restricted operational controls for explicitly allow-listed administrators." />{status === "loading" && <Panel className="empty-state"><LoaderCircle className="spinner" /><p>Checking access…</p></Panel>}{status === "denied" && <Panel className="empty-state"><div className="section-icon"><Shield size={16} /></div><h2>Administrator access required</h2><p>This area is available only to user IDs configured by the workspace operator. No user data is displayed here.</p></Panel>}{status === "available" && <Panel className="section-card"><div className="section-icon"><Shield size={16} /></div><h2>Admin access is enabled</h2><p>Global usage dashboards and moderation controls need a dedicated server-side administrative database connection. This build does not use a service-role key in the application.</p></Panel>}{status === "error" && <Panel className="empty-state"><div className="section-icon"><CircleAlert size={16} /></div><h2>Admin status unavailable</h2><p>Check that the account is signed in and the application has a healthy database connection.</p></Panel>}</div>;
}
