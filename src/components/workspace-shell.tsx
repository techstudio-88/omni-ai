"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Bot, Brain, CircleHelp, FileText, FolderKanban, Gauge, History, Library, Menu, MessageSquare, PanelLeftClose, Search, Settings2, Shield, Sparkles, X } from "lucide-react";
import { Brand } from "./brand";

const sections = [
    { label: "WORKSPACE", links: [
    { href: "/studio", label: "New conversation", icon: MessageSquare },
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
    { href: "/studio/admin", label: "Admin overview", icon: Shield },
  ] },
];

export function WorkspaceShell({ children, demoMode }: { children: React.ReactNode; demoMode: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pageName = sections.flatMap((section) => section.links).find((link) => link.href === pathname)?.label ?? "Workspace";
  return <div className="studio-shell">
    <button className={`mobile-overlay${open ? " visible" : ""}`} aria-label="Close navigation" onClick={() => setOpen(false)} />
    <aside className={`studio-sidebar${open ? " open" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Link href="/"><Brand /></Link><button className="icon-button mobile-menu" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={15} /></button></div>
      <Link className="sidebar-link" href="/studio" style={{ marginBottom: 8, background: "#293c4e", color: "white" }} onClick={() => setOpen(false)}><Sparkles size={15} color="#78d8c2" />Start a chat</Link>
      {sections.map((section) => <div key={section.label}><div className="sidebar-label">{section.label}</div><nav className="sidebar-links" aria-label={section.label}>{section.links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`sidebar-link${pathname === link.href ? " active" : ""}`} aria-current={pathname === link.href ? "page" : undefined}><link.icon aria-hidden="true" />{link.label}</Link>)}</nav></div>)}
      <div className="sidebar-spacer" />
      <div className="workspace-picker"><span className="workspace-avatar">O</span><span><b>Personal workspace</b><small>{demoMode ? "Sample workspace" : "Free plan"}</small></span><PanelLeftClose className="sidebar-menu" size={14} /></div>
      <div className="sidebar-user"><span className="workspace-avatar">S</span><span><b>Workspace owner</b><small>{demoMode ? "Demo account" : "Signed in"}</small></span><CircleHelp size={15} className="sidebar-menu" /></div>
    </aside>
    <main className="studio-main"><header className="studio-topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={16} /></button><div className="breadcrumbs">Workspace <span style={{ margin: "0 7px", color: "#bac3c8" }}>/</span><strong>{pageName}</strong></div></div><div className="topbar-right">{demoMode && <span className="demo-pill"><span />Demo workspace</span>}<Link className="icon-button" href="/studio/settings" aria-label="Help and settings"><CircleHelp size={15} /></Link></div></header>{children}</main>
  </div>;
}
