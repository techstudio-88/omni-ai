"use client";

import { DragEvent, FormEvent, KeyboardEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Brain, Check, ChevronDown, FilePlus2, Globe2, LoaderCircle, Paperclip, Sparkles, Square, X } from "lucide-react";
import { publicModelCatalog } from "@/lib/brain/public-models";
import { useWorkspacePreference } from "@/lib/client-preferences";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const memoryAllowed = useWorkspacePreference("omnibrain-memory-enabled");
  const searchAllowed = useWorkspacePreference("omnibrain-search-enabled");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function uploadFiles(fileList?: FileList | File[] | null) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError("File storage is not configured for this workspace."); return; }
    const accepted: Attachment[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        if (file.size > 50 * 1024 * 1024) throw new Error(file.name + " is larger than 50 MB.");
        setProgress("Uploading " + (index + 1) + " of " + files.length + ": " + file.name);
        const signedResponse = await fetch("/api/documents/upload-url", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, mimeType: file.type || "application/octet-stream", size: file.size }),
        });
        const signed = await signedResponse.json();
        if (!signedResponse.ok) throw new Error(signed.error ?? "A secure upload link could not be created.");
        const uploaded = await supabase.storage.from("omnibrain-documents").uploadToSignedUrl(signed.storagePath, signed.token, file, { contentType: file.type || "application/octet-stream" });
        if (uploaded.error) throw new Error(uploaded.error.message || "The file could not be uploaded.");
        const finalizedResponse = await fetch("/api/documents/finalize", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: signed.id, name: signed.name, mimeType: signed.mimeType, size: signed.size, storagePath: signed.storagePath }),
        });
        const finalized = await finalizedResponse.json();
        if (!finalizedResponse.ok) throw new Error(finalized.error ?? "The file could not be added to your library.");
        accepted.push({ id: finalized.document.id, name: finalized.document.name, mimeType: finalized.document.mime_type });
      } catch (reason) {
        setError((current) => [current, reason instanceof Error ? reason.message : "A file could not be added."].filter(Boolean).join(" "));
      }
    }
    if (accepted.length) setAttachments((current) => [...current, ...accepted]);
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
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

  function onDropFiles(event: DragEvent<HTMLElement>) { event.preventDefault(); setIsDragging(false); if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files); }
  function onPasteFiles(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.items).filter((item) => item.kind === "file").map((item) => item.getAsFile()).filter((file): file is File => Boolean(file));
    if (files.length) { event.preventDefault(); void uploadFiles(files); }
  }
  function onSubmit(event: FormEvent) { event.preventDefault(); void send(); }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }

  return <section className={"chat-layout" + (isDragging ? " is-dragging" : "")} aria-label="Chat workspace" onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false); }} onDrop={onDropFiles}>
    {isDragging && <div className="ob-drop-overlay"><div><FilePlus2 size={24}/><b>Drop files to attach</b><span>PDF, DOCX, text, CSV, JSON, HTML and images · up to 50 MB each</span></div></div>}
    <div className="chat-head"><span className="mode-chip"><span className="mode-dot" />{webSearchEnabled ? "Research mode" : "OmniBrain chat"}</span><div className="ob-model-picker">
      <button type="button" className="ob-model-trigger" aria-haspopup="listbox" aria-expanded={modelMenuOpen} onClick={() => setModelMenuOpen((value) => !value)}>
        <Sparkles size={14}/><span>{selectedModel === "auto" ? "Auto" : publicModelCatalog.find((model) => model.id === selectedModel)?.displayName ?? "Auto"}</span><ChevronDown size={13}/>
      </button>
      {modelMenuOpen && <div className="ob-model-menu" role="listbox" aria-label="Choose a Dist model">
        <button type="button" role="option" aria-selected={selectedModel === "auto"} className={"ob-model-option" + (selectedModel === "auto" ? " selected" : "")} onClick={() => { setSelectedModel("auto"); setModelMenuOpen(false); }}>
          <span className="ob-model-symbol"><Sparkles size={14}/></span><span className="ob-model-copy"><b>Auto</b><small>Choose the best model for each request</small></span>{selectedModel === "auto" && <Check size={14}/>}
        </button>
        {publicModelCatalog.map((model) => <button type="button" role="option" aria-selected={selectedModel === model.id} key={model.id} className={"ob-model-option" + (selectedModel === model.id ? " selected" : "")} onClick={() => { setSelectedModel(model.id); setModelMenuOpen(false); }}>
          <span className="ob-model-symbol"><Sparkles size={14}/></span><span className="ob-model-copy"><b>{model.displayName}</b><small>{model.description}</small></span>{selectedModel === model.id && <Check size={14}/>}
        </button>)}
      </div>}
    </div></div>
    <div className="chat-feed" aria-live="polite">
      {messages.length === 0 ? <div className="welcome-card"><div className="welcome-orb"><Sparkles size={23} /></div><h1>What would you like to work on?</h1><p>Ask a question, explore an idea, or bring a document into the conversation.</p><div className="suggestion-grid">{suggestions.map((suggestion) => <button type="button" className="suggestion" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div></div> : messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}><span className="message-avatar">{message.role === "assistant" ? <Sparkles size={13} /> : <span style={{ fontSize: 10, fontWeight: 700 }}>S</span>}</span><div><div className="message-content">{message.role === "assistant" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown> : message.text}</div>{message.role === "assistant" && message.demo && <div className="message-meta demo"><Check size={10} style={{ verticalAlign: "-2px", marginRight: 3 }} />Example response · demo data</div>}</div></div>)}
      {progress && <div className="chat-progress"><LoaderCircle className="spinner" size={12} />{progress}</div>}
      {error && <div role="alert" className="toast">{error}</div>}
    </div>
    <div className="chat-composer-wrap">
      {attachments.length > 0 && <div className="attached-list">{attachments.map((attachment) => <span className="attached-chip" key={attachment.id}><Paperclip size={12} />{attachment.name}<button aria-label={`Remove ${attachment.name}`} onClick={() => setAttachments((items) => items.filter((item) => item.id !== attachment.id))} style={{ border: 0, background: "transparent", padding: 0, color: "inherit", display: "grid" }}><X size={11} /></button></span>)}</div>}
      <form className="composer" onSubmit={onSubmit}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} onPaste={onPasteFiles} placeholder="Message OmniBrain…" aria-label="Message OmniBrain" rows={2} disabled={streaming} /><div className="composer-footer"><div className="composer-tools"><input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.json,.html,.xml,.log" multiple hidden onChange={(event) => void uploadFiles(event.target.files)} /><button type="button" className="composer-tool" aria-label="Attach files" onClick={() => fileRef.current?.click()} title={demoMode ? "Sign in to upload files" : "Add files"} ><FilePlus2 size={16} /></button><button type="button" className={`composer-tool${webSearchEnabled ? " on" : ""}`} aria-pressed={webSearchEnabled} onClick={() => setWebSearchEnabled((value) => !value)} title={searchAllowed ? "Search current information" : "Enable web research in Settings first"} disabled={!searchAllowed}><Globe2 size={16} /></button><button type="button" className={`composer-tool${memoryEnabled ? " on" : ""}`} aria-pressed={memoryEnabled} onClick={() => setMemoryEnabled((value) => !value)} title={memoryAllowed ? "Use saved memories" : "Enable saved memories in Settings first"} disabled={!memoryAllowed}><Brain size={16} /></button></div>{streaming ? <button className="send-button" type="button" aria-label="Stop response" onClick={() => abortRef.current?.abort()}><Square size={13} fill="currentColor" /></button> : <button className="send-button" type="submit" aria-label="Send message" disabled={!draft.trim()}><ArrowUp size={17} /></button>}</div></form>
      <p className="composer-hint">{demoMode ? "Sign in to upload files to your private workspace. " : "Drop files or paste an image to attach it. "}OmniBrain can make mistakes. Check important details. {demoMode ? "Demo responses are clearly labelled." : "Your requests are handled according to your workspace settings."}</p>
    </div>
  </section>;
}
