"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, BrainCircuit, FileSearch, Globe2, Layers3, LockKeyhole, Menu, Search, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { Brand } from "@/components/brand";

const capabilities = [
  { icon: BrainCircuit, title: "One intelligent brain", text: "OmniBrain understands the task and routes it to a model that fits the work." },
  { icon: Globe2, title: "Research with sources", text: "Explore the web, bring evidence together and keep source links close to the answer." },
  { icon: FileSearch, title: "Your documents, understood", text: "Ask questions across PDFs, notes and project files in a private workspace." },
  { icon: Layers3, title: "Multiple models, one place", text: "Choose a model yourself or let OmniBrain select from your connected providers." },
  { icon: BookOpen, title: "Projects that keep context", text: "Organize conversations, files and instructions around the work you're doing." },
  { icon: LockKeyhole, title: "Privacy you can control", text: "Decide when memory is used, manage saved preferences and keep credentials server-side." },
];

const examples = [
  { title: "Think clearly", prompt: "Help me make a difficult decision", icon: BrainCircuit },
  { title: "Explore deeply", prompt: "Research a topic with reliable sources", icon: Search },
  { title: "Work with files", prompt: "Summarize a long document", icon: FileSearch },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <main className="ob-landing">
    <nav className="ob-nav">
      <Link href="/" aria-label="OmniBrain home"><Brand /></Link>
      <div className="ob-nav-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a></div>
      <div className="ob-nav-actions"><Link className="ob-login" href="/login">Log in</Link><Link className="ob-primary small" href="/studio">Open OmniBrain <ArrowRight size={15}/></Link></div>
      <button className="ob-mobile-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      {menuOpen && <div className="ob-mobile-menu"><a href="#features" onClick={()=>setMenuOpen(false)}>Features</a><a href="#how-it-works" onClick={()=>setMenuOpen(false)}>How it works</a><Link href="/login">Log in</Link><Link href="/studio">Open OmniBrain</Link></div>}
    </nav>

    <section className="ob-hero" id="how-it-works">
      <div className="ob-hero-copy">
        <div className="ob-kicker"><span className="ob-live-dot"/> YOUR AI WORKSPACE, CONNECTED</div>
        <h1>One place for<br/>every <span>big idea.</span></h1>
        <p>Think, create, research and build with multiple AI models in one calm, capable workspace. Ask once. Let OmniBrain figure out the best way forward.</p>
        <div className="ob-hero-actions"><Link className="ob-primary" href="/studio">Start a conversation <ArrowRight size={16}/></Link><Link className="ob-secondary" href="#features">Explore features</Link></div>
        <div className="ob-trustline"><ShieldCheck size={15}/> Your workspace. Your models. Your controls.</div>
      </div>
      <div className="ob-hero-visual" aria-label="OmniBrain workspace preview">
        <div className="ob-glow ob-glow-one"/><div className="ob-glow ob-glow-two"/>
        <div className="ob-preview-window">
          <div className="ob-preview-top"><span className="ob-preview-mark"><Sparkles size={13}/></span><b>OmniBrain</b><span className="ob-preview-status">● Ready</span></div>
          <div className="ob-preview-body">
            <div className="ob-preview-label">YOUR WORKSPACE</div>
            <div className="ob-preview-title">What can we work on?</div>
            <div className="ob-preview-sub">A thought partner for whatever is next.</div>
            <div className="ob-preview-prompt">Help me turn this idea into a clear plan<span><ArrowRight size={14}/></span></div>
            <div className="ob-preview-answer"><div className="ob-answer-icon"><BrainCircuit size={15}/></div><div><b>OmniBrain is thinking</b><small>Understanding request · Selecting a model</small><div className="ob-progress"><i/></div></div></div>
            <div className="ob-preview-chips"><span><Globe2 size={12}/> Research</span><span><FileSearch size={12}/> Documents</span><span><Layers3 size={12}/> Models</span></div>
          </div>
        </div>
        <div className="ob-float-card ob-float-top"><span><Zap size={15}/></span><div><b>Smart routing</b><small>Right model for the task</small></div></div>
        <div className="ob-float-card ob-float-bottom"><span><LockKeyhole size={15}/></span><div><b>Private by design</b><small>You control your context</small></div></div>
        <div className="ob-orbit ob-orbit-a"/><div className="ob-orbit ob-orbit-b"/>
      </div>
    </section>

    <section className="ob-proof"><div><b>ONE WORKSPACE</b><span>Less switching. More doing.</span></div><div><b>MULTI-MODEL</b><span>Connected intelligence.</span></div><div><b>YOU IN CONTROL</b><span>Clear privacy settings.</span></div></section>

    <section className="ob-section" id="features">
      <div className="ob-section-heading"><div className="ob-kicker">MADE FOR THE WAY YOU THINK</div><h2>Everything you need.<br/><span>Nothing in your way.</span></h2><p>Bring your tools, models and ideas together without making the work feel complicated.</p></div>
      <div className="ob-feature-grid">{capabilities.map((item,index)=><article className="ob-feature" key={item.title} style={{animationDelay:(index*70)+"ms"}}><div className="ob-feature-icon"><item.icon size={19}/></div><h3>{item.title}</h3><p>{item.text}</p><span className="ob-feature-arrow"><ArrowRight size={15}/></span></article>)}</div>
    </section>

    <section className="ob-workflows"><div className="ob-workflow-copy"><div className="ob-kicker">ONE QUESTION. MANY POSSIBILITIES.</div><h2>Start with a question.<br/><span>Go wherever it leads.</span></h2><p>Move from a quick answer to a deep research session, a document review or a side-by-side model comparison without leaving your workspace.</p><Link className="ob-text-link" href="/studio">Explore the workspace <ArrowRight size={15}/></Link></div><div className="ob-workflow-list">{examples.map((item,i)=><div className="ob-workflow-item" key={item.title}><span className="ob-workflow-icon"><item.icon size={18}/></span><div><b>{item.title}</b><small>{item.prompt}</small></div><ArrowRight size={16}/></div>)}</div></section>

    <section className="ob-privacy" id="privacy"><div className="ob-privacy-icon"><ShieldCheck size={23}/></div><div><div className="ob-kicker">BUILT AROUND YOUR TRUST</div><h2>Your work stays yours.</h2><p>Memory is optional. Documents are scoped to your workspace. Provider credentials stay on the server. You decide what context OmniBrain can use.</p></div><Link className="ob-secondary" href="/studio/settings">Privacy controls <ArrowRight size={14}/></Link></section>

    <section className="ob-final"><div className="ob-final-orb"><Sparkles size={27}/></div><div className="ob-kicker">YOUR NEXT IDEA STARTS HERE</div><h2>Make room for better thinking.</h2><p>Bring your questions to one intelligent workspace.</p><Link className="ob-primary" href="/studio">Open OmniBrain <ArrowRight size={16}/></Link></section>
    <footer className="ob-footer"><Link href="/"><Brand/></Link><span>© {new Date().getFullYear()} OmniBrain. An independent AI workspace.</span><div><Link href="/login">Sign in</Link><Link href="/studio">Workspace</Link></div></footer>
  </main>;
}
