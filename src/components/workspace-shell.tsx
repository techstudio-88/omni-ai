"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Bot, Brain, CircleHelp, FileText, FolderKanban, Gauge, History, Library, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, Search, Settings2, Shield, Sparkles, X, Plus, Command } from "lucide-react";
import { Brand } from "./brand";

const sections = [
  { label: "WORKSPACE", links: [
    { href: "/studio", label: "New chat", icon: MessageSquare },
    { href: "/studio/history", label: "History", icon: History },
    { href: "/studio/research", label: "Research", icon: Search },
    { href: "/studio/compare", label: "Compare models", icon: Activity },
    { href: "/studio/documents", label: "Documents", icon: FileText },
  ] },
  { label: "YOUR SPACE", links: [
    { href: "/studio/projects", label: "Projects", icon: FolderKanban },
    { href: "/studio/assistants", label: "Assistants", icon: Bot },
    { href: "/studio/prompts", label: "Prompt library", icon: Library },
    { href: "/studio/memory", label: "Memory", icon: Brain },
  ] },
  { label: "ACCOUNT", links: [
    { href: "/studio/usage", label: "Usage & plan", icon: Gauge },
    { href: "/studio/settings", label: "Settings", icon: Settings2 },
    { href: "/studio/admin", label: "Admin", icon: Shield },
  ] },
];

export function WorkspaceShell({ children, demoMode }: { children: React.ReactNode; demoMode: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pageName = sections.flatMap((section) => section.links).find((link) => link.href === pathname)?.label ?? "Workspace";
  const close = () => setOpen(false);
  return <div className={"studio-shell ob-app-shell" + (collapsed ? " sidebar-collapsed" : "")}>
    <button className={"mobile-overlay" + (open ? " visible" : "")} aria-label="Close navigation" onClick={close} />
    <aside className={"studio-sidebar ob-sidebar" + (open ? " open" : "")}>
      <div className="ob-sidebar-brand"><Link href="/" onClick={close}><Brand/></Link><button className="ob-collapse" aria-label="Collapse sidebar" onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button><button className="icon-button ob-close-mobile" aria-label="Close navigation" onClick={close}><X size={16}/></button></div>
      <Link className="ob-new-chat" href="/studio" onClick={close}><Plus size={16}/><span>New chat</span><kbd>⌘ K</kbd></Link>
      <Link className="ob-search-link" href="/studio/history" onClick={close}><Search size={15}/><span>Search conversations</span></Link>
      {sections.map((section)=><div className="ob-nav-section" key={section.label}><div className="sidebar-label">{section.label}</div><nav className="sidebar-links" aria-label={section.label}>{section.links.map((link)=><Link key={link.href} href={link.href} onClick={close} title={collapsed?link.label:undefined} className={"sidebar-link"+(pathname===link.href?" active":"")} aria-current={pathname===link.href?"page":undefined}><link.icon aria-hidden="true"/><span>{link.label}</span></Link>)}</nav></div>)}
      <div className="ob-sidebar-bottom"><div className="ob-plan-card"><div className="ob-plan-icon"><Sparkles size={14}/></div><div><b>{demoMode?"Explore OmniBrain":"Your workspace"}</b><small>{demoMode?"Interactive demo":"Personal workspace"}</small></div></div><Link href="/studio/settings" className="ob-account-row" onClick={close}><span className="ob-user-avatar">U</span><span><b>My account</b><small>{demoMode?"Demo session":"Workspace member"}</small></span><CircleHelp size={15}/></Link></div>
    </aside>
    <main className="studio-main ob-main"><header className="studio-topbar ob-topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={()=>setOpen(true)}><Menu size={17}/></button><div className="ob-topbar-brand"><Sparkles size={15}/><span>OmniBrain</span><span className="ob-topbar-sep">/</span><strong>{pageName}</strong></div></div><div className="topbar-right">{demoMode&&<span className="demo-pill"><span/>Demo workspace</span>}<Link className="ob-topbar-action" href="/studio/settings"><Command size={14}/><span>Settings</span></Link></div></header>{children}</main>
  </div>;
}
