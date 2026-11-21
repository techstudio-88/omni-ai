"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Brain, Check, FilePlus2, Globe2, LoaderCircle, Paperclip, Sparkles, Square, X } from "lucide-react";
import { modelRegistry } from "@/lib/brain/model-selector";
import { useWorkspacePreference } from "@/lib/client-preferences";

type ChatMessage = { id: string; role: "user" | "assistant"; text: string; demo?: boolean };
type Attachment = { id: string; name: string; mimeType: string };
const suggestions = ["Help me plan a focused week", "Summarize this PDF for me", "Research a topic and cite sources", "Help me think through a decision"];

export function ChatWorkspace({ demoMode }: { demoMode: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const memoryAllowed = useWorkspacePreference("omnibrain-memory-enabled");
  const searchAllowed = useWorkspacePreference("omnibrain-search-enabled");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function uploadFile(file?: File) {
    if (!file) return;
    setError("");
    const form = new FormData(); form.set("file", file);
    setProgress("Adding your document");
    try {
      const response = await fetch("/api/documents/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The file could not be added.");
      setAttachments((current) => [...current, { id: data.document.id, name: data.document.name, mimeType: data.document.mime_type }]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The file could not be added."); }
    finally { setProgress(""); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function send(text = draft) {
    const prompt = text.trim();
    if (!prompt || streaming) return;
    setError(""); setDraft("");
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: prompt };
    const currentMessages = [...messages, userMessage]; setMessages(currentMessages); setStreaming(true);
    const controller = new AbortController(); abortRef.current = controller;
    setProgress("Understanding your request");
    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const created = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: prompt.slice(0, 88), mode: webSearchEnabled ? "research" : "chat" }) });
        const data = await created.json();
        if (!created.ok) throw new Error(data.error ?? "A conversation could not be created.");
        activeConversationId = data.conversation.id as string;
        setConversationId(activeConversationId);
      }
      const response = await fetch("/api/brain/stream", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({
          messages: currentMessages.map((message) => ({ id: message.id, role: message.role, parts: [{ type: "text", text: message.text }] })),
          conversationId: activeConversationId, selectedMode: webSearchEnabled ? "research" : "chat", selectedModel, webSearchEnabled, memoryEnabled, attachments,
        }),
      });
      if (!response.ok || !response.body) {
        const problem = await response.json().catch(() => ({})); throw new Error(problem.error ?? "The message could not be sent.");
      }
      const responseIsDemo = response.headers.get("X-OmniBrain-Mode") === "demo";
      setProgress(webSearchEnabled ? "Searching the web" : "Preparing a response");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = ""; let answer = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        pending += decoder.decode(value, { stream: true });
        const events = pending.split("\n"); pending = events.pop() ?? "";
        for (const line of events) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6); if (payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload) as { type?: string; delta?: string; messageMetadata?: { demoMode?: boolean } };
            if (event.type === "text-delta" && event.delta) {
              answer += event.delta;
              setMessages([...currentMessages, { id: "streaming-answer", role: "assistant", text: answer, demo: responseIsDemo }]);
            }
          } catch { /* Ignore incomplete or non-JSON stream events. */ }
        }
      }
      if (!answer) answer = "The response ended before any answer arrived. Please try again.";
      setMessages([...currentMessages, { id: crypto.randomUUID(), role: "assistant", text: answer, demo: responseIsDemo }]);
      setAttachments([]);
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Something interrupted the response.");
    } finally { setStreaming(false); setProgress(""); abortRef.current = null; }
  }

  function onSubmit(event: FormEvent) { event.preventDefault(); void send(); }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }

  return <section className="chat-layout" aria-label="Chat workspace">
    <div className="chat-head"><span className="mode-chip"><span className="mode-dot" />{webSearchEnabled ? "Research mode" : "OmniBrain chat"}</span><select className="model-select" aria-label="Choose an AI model" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}><option value="auto">✦ Auto · choose for me</option>{modelRegistry.map((model) => <option key={model.id} value={model.id}>{model.displayName}</option>)}</select></div>
    <div className="chat-feed" aria-live="polite">
      {messages.length === 0 ? <div className="welcome-card"><div className="welcome-orb"><Sparkles size={23} /></div><h1>What would you like to work on?</h1><p>Ask a question, explore an idea, or bring a document into the conversation.</p><div className="suggestion-grid">{suggestions.map((suggestion) => <button type="button" className="suggestion" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div></div> : messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}><span className="message-avatar">{message.role === "assistant" ? <Sparkles size={13} /> : <span style={{ fontSize: 10, fontWeight: 700 }}>S</span>}</span><div><div className="message-content">{message.role === "assistant" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown> : message.text}</div>{message.role === "assistant" && message.demo && <div className="message-meta demo"><Check size={10} style={{ verticalAlign: "-2px", marginRight: 3 }} />Example response · demo data</div>}</div></div>)}
      {progress && <div className="chat-progress"><LoaderCircle className="spinner" size={12} />{progress}</div>}
      {error && <div role="alert" className="toast">{error}</div>}
    </div>
    <div className="chat-composer-wrap">
      {attachments.length > 0 && <div className="attached-list">{attachments.map((attachment) => <span className="attached-chip" key={attachment.id}><Paperclip size={12} />{attachment.name}<button aria-label={`Remove ${attachment.name}`} onClick={() => setAttachments((items) => items.filter((item) => item.id !== attachment.id))} style={{ border: 0, background: "transparent", padding: 0, color: "inherit", display: "grid" }}><X size={11} /></button></span>)}</div>}
      <form className="composer" onSubmit={onSubmit}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} placeholder="Ask OmniBrain anything…" aria-label="Message OmniBrain" rows={2} disabled={streaming} /><div className="composer-footer"><div className="composer-tools"><input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp" hidden onChange={(event) => void uploadFile(event.target.files?.[0])} /><button type="button" className="composer-tool" aria-label="Add document" onClick={() => fileRef.current?.click()} title={demoMode ? "Document upload needs a signed-in workspace" : "Add a document"} disabled={demoMode}><FilePlus2 size={16} /></button><button type="button" className={`composer-tool${webSearchEnabled ? " on" : ""}`} aria-pressed={webSearchEnabled} onClick={() => setWebSearchEnabled((value) => !value)} title={searchAllowed ? "Search current information" : "Enable web research in Settings first"} disabled={!searchAllowed}><Globe2 size={16} /></button><button type="button" className={`composer-tool${memoryEnabled ? " on" : ""}`} aria-pressed={memoryEnabled} onClick={() => setMemoryEnabled((value) => !value)} title={memoryAllowed ? "Use saved memories" : "Enable saved memories in Settings first"} disabled={!memoryAllowed}><Brain size={16} /></button></div>{streaming ? <button className="send-button" type="button" aria-label="Stop response" onClick={() => abortRef.current?.abort()}><Square size={13} fill="currentColor" /></button> : <button className="send-button" type="submit" aria-label="Send message" disabled={!draft.trim()}><ArrowUp size={17} /></button>}</div></form>
      <p className="composer-hint">OmniBrain can make mistakes. Check important details. {demoMode ? "Demo responses are clearly labelled." : "Your requests are handled according to your workspace settings."}</p>
    </div>
  </section>;
}
