import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Check, FileSearch, Layers3, Search, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

const featureCards = [
  { icon: Brain, title: "One thoughtful AI workspace", text: "Bring chat, projects, prompts, and your own working context together." },
  { icon: Search, title: "Research with sources", text: "Explore current questions with search results and clear source links." },
  { icon: FileSearch, title: "Ask your documents", text: "Keep files in a private workspace and find the passages that matter." },
  { icon: Layers3, title: "Choose the right model", text: "Compare available models and see which one answered each request." },
];

export default function LandingPage() {
  return <main className="landing">
    <nav className="landing-nav"><Link href="/"><Brand /></Link><div className="landing-links"><a href="#features">What it can do</a><a href="#how">How it works</a></div><div className="landing-cta"><Link className="button ghost" href="/login">Sign in</Link><Link className="button" href="/studio">Open workspace <ArrowRight size={14} /></Link></div></nav>
    <section className="hero" id="how"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" />A calmer way to work with AI</div><h1>One question.<br />A <em>clearer</em> way forward.</h1><p>OmniBrain brings chat, research, and your documents into one focused workspace, then routes your request to the available AI model that fits the task.</p><div className="hero-actions"><Link className="button" href="/studio">Explore the workspace <ArrowRight size={15} /></Link><Link className="button light" href="#features">See what it can do</Link></div><div className="hero-caption"><Check size={12} style={{ verticalAlign: "-2px", color: "#5cae9c", marginRight: 5 }} />Start in a clearly labelled demo workspace</div></div>
      <div className="hero-art" aria-label="OmniBrain AI workspace illustration"><div className="halo" /><div className="halo two" /><div className="halo three" /><div className="orb" /><div className="orbit-card top"><span className="orbit-icon"><Search size={15} /></span><span><b>Research with sources</b><small>Grounded in current information</small></span></div><div className="orbit-card bottom"><span className="orbit-icon violet"><Sparkles size={15} /></span><span><b>Model selected</b><small>Matched to the task at hand</small></span></div></div></section>
    <div className="trust-row"><span>YOUR IDEAS STAY IN YOUR WORKSPACE</span><div className="trust-items"><span><BookOpen size={13} /> Private document storage</span><span><Check size={13} /> You stay in control</span><span><Sparkles size={13} /> Transparent demo mode</span></div></div>
    <section className="features" id="features"><h2>One place for the work around your questions.</h2><p className="features-intro">A connected workspace with clear controls and a simple path from question to answer.</p><div className="feature-grid">{featureCards.map((feature) => <article className="feature-card" key={feature.title}><feature.icon size={18} /><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>
  </main>;
}
