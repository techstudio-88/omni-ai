"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { sendMagicLink, type LoginState } from "./action";

const initialState: LoginState = {};
export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLink, initialState);
  return <main className="login-page"><section className="login-panel"><div className="login-card"><Link href="/"><Brand /></Link><h1>Welcome to your workspace.</h1><p>Sign in with a secure email link to keep your projects and documents private to you.</p>
      {state.sentTo ? <div className="toast" role="status"><CheckCircle2 size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Check {state.sentTo} for your sign-in link.</div> : <form action={action}><div className="form-field"><label htmlFor="email">Email address</label><input autoComplete="email" id="email" name="email" type="email" required placeholder="you@example.com" /></div>{state.error && <p className="toast" role="alert">{state.error}</p>}<button className="button" style={{ width: "100%", marginTop: 5 }} disabled={pending}>{pending ? "Sending secure link…" : <>Continue with email <ArrowRight size={14} /></>}</button></form>}
      <div className="mini-label" style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 17 }}><LockKeyhole size={12} />No password to remember. Your link is private to your inbox.</div><p className="mini-label" style={{ marginTop: 29 }}>Want to explore first? <Link href="/studio" style={{ color: "#438c81", fontWeight: 650 }}>Open the sample workspace</Link></p></div></section>
    <aside className="login-visual"><div className="orb" /><div className="login-visual-copy"><h2>A calmer place to think with AI.</h2><p>Keep research, documents, and projects close. See what the workspace used, and choose what to save.</p></div><Sparkles size={16} style={{ position: "absolute", top: "22%", right: "23%", color: "#a8e9dc" }} /></aside>
  </main>;
}
