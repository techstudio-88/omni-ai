"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";

type Conversation = { id: string; title: string; mode: string; updated_at: string; sample?: boolean };
type Message = { id: string; role: string; content: string; model?: string | null; created_at?: string };
function Heading({ title, description }: { title: string; description: string }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div></div>;
}

export function HistoryWorkspace() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    void fetch("/api/conversations").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setItems(data.conversations);
      setDemo(Boolean(data.demo));
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "History could not load."));
  }, []);
  async function remove(item: Conversation) {
    try {
      const response = await fetch("/api/conversations/" + item.id, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setItems((list) => list.filter((entry) => entry.id !== item.id));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The conversation could not be deleted."); }
  }
  return <div className="studio-content">
    <Heading title="Conversation history" description="Return to a saved conversation or remove it from your workspace." />
    {demo && <div className="toast">Sample conversation · demo data</div>}
    {error && <div role="alert" className="toast">{error}</div>}
    <section className="card list-card">
      {items.length === 0 ? <div className="empty-state"><div className="section-icon"><MessageSquare size={15} /></div><h2>No saved conversations</h2><p>Start a new chat to build your history.</p><Link className="button" href="/studio">Start a chat</Link></div> : items.map((item) => <div className="list-row" key={item.id}>
        <Link href={"/studio/conversations/" + item.id} style={{ display: "flex", flex: 1, alignItems: "center", gap: 12 }}><span className="section-icon" style={{ margin: 0 }}><MessageSquare size={14} /></span><span><b>{item.title}</b><small>{item.mode} · {new Date(item.updated_at).toLocaleDateString()}</small></span></Link>
        {!demo && <button className="icon-button" aria-label={"Delete " + item.title} onClick={() => void remove(item)}><Trash2 size={13} /></button>}
      </div>)}
    </section>
  </div>;
}

export function ConversationWorkspace({ id }: { id: string }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    void fetch("/api/conversations/" + id).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setConversation(data.conversation);
      setMessages(data.messages);
      setDemo(Boolean(data.demo));
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "The conversation could not open."));
  }, [id]);
  return <div className="studio-content">
    <Link className="button ghost" href="/studio/history" style={{ marginBottom: 18, paddingLeft: 0 }}><ArrowLeft size={14} />Back to history</Link>
    <Heading title={conversation?.title ?? "Saved conversation"} description={(conversation?.mode ?? "Conversation") + (demo ? " · sample data" : "")} />
    {error && <div role="alert" className="toast">{error}</div>}
    <section className="card" style={{ padding: 20, display: "grid", gap: 19 }}>
      {messages.map((message) => <article key={message.id} style={{ maxWidth: "78%", justifySelf: message.role === "user" ? "end" : "start" }}>
        <div className="mini-label" style={{ textTransform: "capitalize", marginBottom: 5 }}>{message.role}{message.model ? " · " + message.model : ""}</div>
        <div className="message-content" style={{ borderRadius: 12, background: message.role === "user" ? "#edf3f3" : "transparent", padding: message.role === "user" ? 12 : 3 }}>{message.content}</div>
      </article>)}
    </section>
    <div style={{ marginTop: 16 }}><Link className="button" href="/studio">Start a new chat</Link></div>
  </div>;
}
