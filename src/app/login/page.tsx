"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { continueWithGoogle, passwordAuth, type LoginState } from "./action";

const initialState: LoginState = {};
export default function LoginPage() {
  const [state, action, pending] = useActionState(passwordAuth, initialState);
  const [mode, setMode] = useState<"login" | "signup">("login");
  return <main className="login-page"><section className="login-panel"><div className="login-card"><Link href="/"><Brand /></Link><h1>{mode === "login" ? "Welcome back." : "Create your workspace."}</h1><p>Sign in to continue your work, or create an account to get started.</p>
      <form action={continueWithGoogle}><button className="button button-secondary" type="submit" style={{ width: "100%", justifyContent: "center", gap: 10, marginTop: 18 }}><GoogleMark />Continue with Google</button></form>
      <div className="mini-label" style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}><span style={{ height: 1, background: "var(--line)", flex: 1 }} />OR CONTINUE WITH EMAIL<span style={{ height: 1, background: "var(--line)", flex: 1 }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 4, borderRadius: 12, background: "var(--surface-muted)", marginBottom: 18 }}><button type="button" className={mode === "login" ? "button" : "button button-ghost"} onClick={() => setMode("login")}>Log in</button><button type="button" className={mode === "signup" ? "button" : "button button-ghost"} onClick={() => setMode("signup")}>Create account</button></div>
      <form action={action}><input type="hidden" name="mode" value={mode} /><div className="form-field"><label htmlFor="email">Email address</label><input autoComplete="email" id="email" name="email" type="email" required placeholder="you@example.com" /></div><div className="form-field" style={{ marginTop: 14 }}><label htmlFor="password">Password</label><input autoComplete={mode === "login" ? "current-password" : "new-password"} id="password" name="password" type="password" minLength={8} required placeholder="At least 8 characters" /></div>{state.error && <p className="toast" role="alert">{state.error}</p>}{state.message && <p className="toast" role="status"><CheckCircle2 size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />{state.message}</p>}<button className="button" type="submit" style={{ width: "100%", marginTop: 16 }} disabled={pending}>{pending ? "Please wait…" : <>{mode === "login" ? "Log in" : "Create account"} <ArrowRight size={14} /></>}</button></form>
      <div className="mini-label" style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 17 }}><LockKeyhole size={12} />Your password is handled securely by Supabase Auth.</div><p className="mini-label" style={{ marginTop: 29 }}>Want to explore first? <Link href="/studio" style={{ color: "#438c81", fontWeight: 650 }}>Open the sample workspace</Link></p></div></section>
    <aside className="login-visual"><div className="orb" /><div className="login-visual-copy"><h2>A calmer place to think with AI.</h2><p>Keep research, documents, and projects close. See what the workspace used, and choose what to save.</p></div><Sparkles size={16} style={{ position: "absolute", top: "22%", right: "23%", color: "#a8e9dc" }} /></aside>
  </main>;
}

function GoogleMark() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18l6.7-5.2Z"/><path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.9 15l6.7 5.2C14.2 15.4 18.7 11.8 24 11.8Z"/></svg>;
}
