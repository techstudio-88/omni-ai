import { Sparkles } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return <span className={`brand${light ? " brand-light" : ""}`}><span className="brand-mark"><Sparkles aria-hidden="true" /></span><span>omnibrain</span></span>;
}
